
const fs = require('fs');
const path = require('path');

// Mock browser environment for Next.js imports if needed, or just import directly
// We need to bypass the import aliases '@/' to run with node
// So I will just copy the relevant logic here or use a bundler, but copying is faster for a one-off script.

// Simulating the relevant parts of vcfParser.ts
function parseVCF(vcfContent) {
    const lines = vcfContent.split('\n');
    const variants = [];
    for (const line of lines) {
        if (line.startsWith('#') || line.trim() === '') continue;
        const parts = line.split('\t');
        if (parts.length < 5) continue;

        const chrom = parts[0].replace(/^chr/i, '');
        const pos = parseInt(parts[1], 10);
        const id = parts[2];
        const ref = parts[3];
        const alt = parts[4];

        // Simple parsing logic matches the real one
        variants.push({ chrom, pos, id, ref, alt });
    }
    return { variants };
}

// Simulating pgxKnowledgeBase logic
const KNOWN_PGX_RSIDS = {
    'rs3892097': { gene: 'CYP2D6', effect: 'Loss-of-function variant (*4 allele)', starAlleles: ['*4'] },
    'rs5030655': { gene: 'CYP2D6', effect: 'Frameshift variant (*6 allele)', starAlleles: ['*6'] },
    'rs16947': { gene: 'CYP2D6', effect: '*2 allele defining variant', starAlleles: ['*2'] },
    'rs1065852': { gene: 'CYP2D6', effect: 'Splicing defect (*10 allele)', starAlleles: ['*10'] },
    'rs28371706': { gene: 'CYP2D6', effect: '*41 reduced function', starAlleles: ['*41'] },
    'rs4244285': { gene: 'CYP2C19', effect: 'Loss-of-function (*2 allele)', starAlleles: ['*2'] },
    'rs4986893': { gene: 'CYP2C19', effect: 'Loss-of-function (*3 allele)', starAlleles: ['*3'] },
    'rs12248560': { gene: 'CYP2C19', effect: 'Gain-of-function (*17 allele)', starAlleles: ['*17'] },
    'rs1799853': { gene: 'CYP2C9', effect: '*2 allele — reduced activity', starAlleles: ['*2'] },
    'rs1057910': { gene: 'CYP2C9', effect: '*3 allele — severely reduced activity', starAlleles: ['*3'] },
    'rs4149056': { gene: 'SLCO1B1', effect: '*5/*15 allele — reduced hepatic uptake', starAlleles: ['*5', '*15'] },
    'rs2306283': { gene: 'SLCO1B1', effect: '*14 allele', starAlleles: ['*14'] },
    'rs1800462': { gene: 'TPMT', effect: '*2 allele — reduced activity', starAlleles: ['*2'] },
    'rs1800460': { gene: 'TPMT', effect: '*3B allele', starAlleles: ['*3B'] },
    'rs1142345': { gene: 'TPMT', effect: '*3C allele — reduced activity', starAlleles: ['*3C'] },
    'rs1800584': { gene: 'TPMT', effect: '*3A allele', starAlleles: ['*3A'] },
    'rs3918290': { gene: 'DPYD', effect: '*2A allele — no function', starAlleles: ['*2A'] },
    'rs55886062': { gene: 'DPYD', effect: 'c.1679T>G HapB3', starAlleles: ['*13'] },
    'rs67376798': { gene: 'DPYD', effect: 'c.2846A>T — reduced function', starAlleles: [] },
};

function buildDiplotype(geneVariants) {
    const inferredAlleles = [];
    for (const variant of geneVariants) {
        if (variant.id && KNOWN_PGX_RSIDS[variant.id]) {
            const stars = KNOWN_PGX_RSIDS[variant.id].starAlleles;
            if (stars.length > 0) inferredAlleles.push(stars[0]);
        }
    }

    if (inferredAlleles.length >= 2) return `${inferredAlleles[0]}/${inferredAlleles[1]}`;
    if (inferredAlleles.length === 1) return `*1/${inferredAlleles[0]}`;
    return '*1/*1';
}

// Main execution
const vcfPath = path.join(__dirname, '..', 'public', 'samples', 'sample_patient.vcf');
const vcfContent = fs.readFileSync(vcfPath, 'utf8');
const parsed = parseVCF(vcfContent);

console.log('Total variants:', parsed.variants.length);

// Check CYP2D6 variants (for Codeine)
const cyp2d6Variants = parsed.variants.filter(v => {
    return (v.id && KNOWN_PGX_RSIDS[v.id]?.gene === 'CYP2D6');
});

console.log('CYP2D6 Variants found:', cyp2d6Variants.length);
cyp2d6Variants.forEach(v => {
    console.log(`  ${v.id} -> ${KNOWN_PGX_RSIDS[v.id].starAlleles}`);
});

const diplotype = buildDiplotype(cyp2d6Variants);
console.log('Inferred Diplotype:', diplotype);

