
const fs = require('fs');
const path = require('path');

// --- VCF Parser Code (Pasted to ensure isolation) ---

const PGX_GENES = new Set(['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD']);

function extractGeneFromChrom(chrom, pos) {
    const chr = chrom.replace(/^chr/i, '');
    // GRCh38 ranges with generous padding
    const regions = [
        { chr: '22', start: 42126000, end: 42926000, gene: 'CYP2D6' }, // Expanded range
        { chr: '10', start: 94760000, end: 94860000, gene: 'CYP2C19' },
        { chr: '10', start: 94930000, end: 95180000, gene: 'CYP2C9' },
        { chr: '12', start: 21200000, end: 21400000, gene: 'SLCO1B1' },
        { chr: '6', start: 18120000, end: 18160000, gene: 'TPMT' },
        { chr: '1', start: 97540000, end: 98400000, gene: 'DPYD' },
    ];
    for (const r of regions) {
        if (chr === r.chr && pos >= r.start && pos <= r.end) return r.gene;
    }
    return null;
}

function parseVCF(content) {
    const lines = content.split(/\r?\n/);
    const variants = [];
    const parseErrors = [];
    let patientId = 'PATIENT_UNKNOWN';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        if (line.startsWith('#')) continue;

        const cols = line.split('\t');
        if (cols.length < 5) continue; // Relaxed check

        const [chrom, posStr, id, ref, alt, qual, filter, infoStr] = cols;
        const pos = parseInt(posStr, 10);

        // Parse INFO
        const info = {};
        if (infoStr && infoStr !== '.') {
            infoStr.split(';').forEach(entry => {
                const [key, val] = entry.split('=');
                info[key] = val || 'true';
            });
        }

        // Attempt gene extraction
        let gene = info['GENE'] || info['gene'];
        if (!gene) {
            gene = extractGeneFromChrom(chrom, pos);
        }

        const variant = { chrom, pos, id, ref, alt, info, gene };

        if (gene && PGX_GENES.has(gene.toUpperCase())) {
            variants.push(variant);
        } else if (!gene) {
            // Keep if it has an RSID, might be relevant
            if (id && id.startsWith('rs')) variants.push(variant);
        }
    }

    return { variants, patientId };
}

// --- Test Execution ---

const samplePath = path.join(process.cwd(), 'public/samples/sample_patient.vcf');
try {
    const content = fs.readFileSync(samplePath, 'utf-8');
    console.log(`Loaded ${content.length} bytes from ${samplePath}`);
    const result = parseVCF(content);
    console.log(`Parsed ${result.variants.length} variants.`);
    if (result.variants.length > 0) {
        console.log('Sample Variant 1:', result.variants[0]);
    } else {
        console.error('FAILED: No variants parsed from sample file.');
    }
} catch (e) {
    console.error('Error reading sample file:', e.message);
}

// Test string fallback
console.log('\nTesting Fallback Logic...');
const fallbackVcf = `
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO
22	42522505	.	C	T	.	.	.
`;
const fallbackResult = parseVCF(fallbackVcf);
console.log(`Fallback parsed ${fallbackResult.variants.length} variants.`);
if (fallbackResult.variants.length > 0) {
    console.log('Fallback Variant Gene:', fallbackResult.variants[0].gene);
} else {
    console.log('Fallback failed to identify gene.');
}
