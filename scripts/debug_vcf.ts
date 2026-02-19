
import { parseVCF } from '../lib/vcfParser';
import fs from 'fs';
import path from 'path';

const vcfContent = fs.readFileSync(path.join(process.cwd(), 'public/samples/sample_patient.vcf'), 'utf-8');

console.log('--- Testing with sample_patient.vcf ---');
const result = parseVCF(vcfContent);

console.log('Patient ID:', result.patientId);
console.log('Variant Count:', result.variants.length);
console.log('Errors:', result.parseErrors);

if (result.variants.length > 0) {
    console.log('First Variant:', JSON.stringify(result.variants[0], null, 2));
}

// Test edge case: Missing GENE in INFO but valid position (should use fallback)
const fallbackVcf = `##fileformat=VCFv4.2
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	SAMPLE001
22	42522501	.	C	T	.	.	.	GT	0/1
`;
console.log('\n--- Testing fallback gene extraction ---');
const fallbackResult = parseVCF(fallbackVcf);
console.log('Fallback Variant Gene:', fallbackResult.variants[0]?.gene);
console.log('Fallback Variant Count:', fallbackResult.variants.length);
