// VCF v4.2 Parser for Pharmacogenomic Variants
// Handles standard VCF format with INFO tags: GENE, STAR, RS

export interface VCFVariant {
  chrom: string;
  pos: number;
  id: string; // rsid from ID column
  ref: string;
  alt: string;
  qual: string;
  filter: string;
  info: Record<string, string>;
  // Extracted PGx fields
  gene?: string;
  starAllele?: string;
  rsid?: string;
  genotype?: string;
}

export interface ParsedVCF {
  patientId: string;
  variants: VCFVariant[];
  parseErrors: string[];
  headerMeta: Record<string, string>;
  rawLineCount: number;
}

const PGX_GENES = new Set(['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD']);

export function parseVCF(content: string): ParsedVCF {
  const lines = content.split(/\r?\n/);
  const variants: VCFVariant[] = [];
  const parseErrors: string[] = [];
  const headerMeta: Record<string, string> = {};
  let patientId = 'PATIENT_UNKNOWN';
  let dataLineCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Meta-information lines
    if (line.startsWith('##')) {
      const eqIdx = line.indexOf('=');
      if (eqIdx !== -1) {
        const key = line.slice(2, eqIdx);
        const val = line.slice(eqIdx + 1);
        headerMeta[key] = val;
        // Try to extract patient ID from metadata
        if (key.toLowerCase() === 'individual-id' || key.toLowerCase() === 'sampleid') {
          patientId = `PATIENT_${val.replace(/[^A-Z0-9_]/gi, '_').toUpperCase()}`;
        }
      }
      continue;
    }

    // Column header line
    if (line.startsWith('#CHROM')) {
      const cols = line.slice(1).split('\t');
      // Sample IDs start at column 9+
      if (cols.length > 9) {
        patientId = `PATIENT_${cols[9].replace(/[^A-Z0-9_]/gi, '_').toUpperCase()}`;
      } else if (cols.length === 9) {
        // Single sample, use FORMAT sample
        patientId = `PATIENT_${cols[8].replace(/[^A-Z0-9_]/gi, '_').toUpperCase()}`;
      }
      continue;
    }

    // Data lines
    dataLineCount++;
    const cols = line.split('\t');
    if (cols.length < 8) {
      parseErrors.push(`Line ${i + 1}: insufficient columns (${cols.length})`);
      continue;
    }

    const [chrom, posStr, id, ref, alt, qual, filter, infoStr, ...rest] = cols;
    const pos = parseInt(posStr, 10);
    if (isNaN(pos)) {
      parseErrors.push(`Line ${i + 1}: invalid POS value "${posStr}"`);
      continue;
    }

    // Parse INFO column
    const info: Record<string, string> = {};
    if (infoStr && infoStr !== '.') {
      for (const entry of infoStr.split(';')) {
        const eqIdx = entry.indexOf('=');
        if (eqIdx !== -1) {
          info[entry.slice(0, eqIdx)] = entry.slice(eqIdx + 1);
        } else {
          info[entry] = 'true';
        }
      }
    }

    // Extract PGx-specific fields
    const gene = info['GENE'] || info['gene'] || extractGeneFromChrom(chrom, pos) || undefined;
    const starAllele = info['STAR'] || info['star'] || info['HAPLOTYPE'] || undefined;
    const rsidFromInfo = info['RS'] || info['rs'] || undefined;
    const rsidFromId = id && id !== '.' ? id : undefined;
    const rsid = rsidFromInfo || rsidFromId;

    // Extract genotype from FORMAT/SAMPLE columns
    let genotype: string | undefined;
    if (rest.length >= 2) {
      const format = rest[0];
      const sample = rest[1];
      const formatFields = format.split(':');
      const sampleFields = sample.split(':');
      const gtIdx = formatFields.indexOf('GT');
      if (gtIdx !== -1 && sampleFields[gtIdx]) {
        genotype = sampleFields[gtIdx].replace('|', '/');
      }
    }

    const variant: VCFVariant = {
      chrom, pos, id: id || '.', ref, alt, qual, filter, info,
      gene, starAllele, rsid, genotype,
    };

    // Only include PGx-relevant variants
    if (gene && PGX_GENES.has(gene.toUpperCase())) {
      variants.push(variant);
    } else if (!gene) {
      // Include if rsid matches known PGx variants
      variants.push(variant);
    }
  }

  // If no patient ID found, generate one
  if (patientId === 'PATIENT_UNKNOWN') {
    patientId = `PATIENT_${Date.now().toString(36).toUpperCase()}`;
  }

  return {
    patientId,
    variants,
    parseErrors,
    headerMeta,
    rawLineCount: dataLineCount,
  };
}

// Rough gene region mapping (GRCh38) for fallback
function extractGeneFromChrom(chrom: string, pos: number): string | null {
  const chr = chrom.replace('chr', '');
  const regions: Array<{ chr: string; start: number; end: number; gene: string }> = [
    { chr: '22', start: 42522500, end: 42526883, gene: 'CYP2D6' },
    { chr: '10', start: 94762681, end: 94855517, gene: 'CYP2C19' },
    { chr: '10', start: 94938657, end: 95172838, gene: 'CYP2C9' },
    { chr: '12', start: 21284073, end: 21378928, gene: 'SLCO1B1' },
    { chr: '6', start: 18128312, end: 18155374, gene: 'TPMT' },
    { chr: '1', start: 97543299, end: 98388615, gene: 'DPYD' },
  ];
  for (const r of regions) {
    if (chr === r.chr && pos >= r.start && pos <= r.end) return r.gene;
  }
  return null;
}

export function validateVCF(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'File is empty' };
  }
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  const hasHeader = lines.some(l => l.startsWith('#'));
  if (!hasHeader) {
    return { valid: false, error: 'Missing VCF header lines (lines starting with #)' };
  }
  const hasData = lines.some(l => !l.startsWith('#') && l.split('\t').length >= 8);
  if (!hasData) {
    return { valid: false, error: 'No valid data lines found in VCF file (need at least 8 tab-separated columns)' };
  }
  return { valid: true };
}
