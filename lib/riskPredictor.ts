// Risk Prediction Engine
// Combines VCF parsed variants with the PGx knowledge base to generate risk assessments

import { ParsedVCF, VCFVariant } from './vcfParser';
import {
    Phenotype, RiskLabel, Severity, DrugRiskEntry,
    DRUG_PRIMARY_GENE, DRUG_GENE_RISK,
    getPhenotypeForDiplotype, getDrugRisk, normalizeDrugName,
    GENE_INFO,
} from './pgxKnowledgeBase';

export interface DetectedVariant {
    rsid: string;
    gene: string;
    chrom: string;
    pos: number;
    ref: string;
    alt: string;
    starAllele?: string;
    genotype?: string;
    effect: string;
}

export interface PharmacogenomicProfile {
    primaryGene: string;
    diplotype: string;
    phenotype: Phenotype;
    phenotypeLabel: string;
    detectedVariants: DetectedVariant[];
}

export interface RiskAssessment {
    riskLabel: RiskLabel;
    confidenceScore: number;
    severity: Severity;
}

export interface ClinicalRecommendation {
    action: string;
    dosingGuidance: string;
    alternativeDrug?: string;
    cpicGuideline?: string;
    monitoring: string;
    urgency: 'routine' | 'urgent' | 'critical';
}

export interface QualityMetrics {
    vcfParsingSuccess: boolean;
    variantsDetected: number;
    pgxVariantsFound: number;
    diplotypeConfidence: 'high' | 'medium' | 'low' | 'none';
    parseWarnings: string[];
    coverageNote: string;
}

export interface PharmaGuardResult {
    patientId: string;
    drug: string;
    timestamp: string;
    riskAssessment: RiskAssessment;
    pharmacogenomicProfile: PharmacogenomicProfile;
    clinicalRecommendation: ClinicalRecommendation;
    qualityMetrics: QualityMetrics;
}

// Known PGx rsids and their effects
const KNOWN_PGX_RSIDS: Record<string, { gene: string; effect: string; starAlleles: string[] }> = {
    rs3892097: { gene: 'CYP2D6', effect: 'Loss-of-function variant (*4 allele)', starAlleles: ['*4'] },
    rs5030655: { gene: 'CYP2D6', effect: 'Frameshift variant (*6 allele)', starAlleles: ['*6'] },
    rs16947: { gene: 'CYP2D6', effect: '*2 allele defining variant', starAlleles: ['*2'] },
    rs1065852: { gene: 'CYP2D6', effect: 'Splicing defect (*10 allele)', starAlleles: ['*10'] },
    rs28371706: { gene: 'CYP2D6', effect: '*41 reduced function', starAlleles: ['*41'] },
    rs4244285: { gene: 'CYP2C19', effect: 'Loss-of-function (*2 allele)', starAlleles: ['*2'] },
    rs4986893: { gene: 'CYP2C19', effect: 'Loss-of-function (*3 allele)', starAlleles: ['*3'] },
    rs12248560: { gene: 'CYP2C19', effect: 'Gain-of-function (*17 allele)', starAlleles: ['*17'] },
    rs1799853: { gene: 'CYP2C9', effect: '*2 allele — reduced activity', starAlleles: ['*2'] },
    rs1057910: { gene: 'CYP2C9', effect: '*3 allele — severely reduced activity', starAlleles: ['*3'] },
    rs4149056: { gene: 'SLCO1B1', effect: '*5/*15 allele — reduced hepatic uptake', starAlleles: ['*5', '*15'] },
    rs2306283: { gene: 'SLCO1B1', effect: '*14 allele', starAlleles: ['*14'] },
    rs1800462: { gene: 'TPMT', effect: '*2 allele — reduced activity', starAlleles: ['*2'] },
    rs1800460: { gene: 'TPMT', effect: '*3B allele', starAlleles: ['*3B'] },
    rs1142345: { gene: 'TPMT', effect: '*3C allele — reduced activity', starAlleles: ['*3C'] },
    rs1800584: { gene: 'TPMT', effect: '*3A allele', starAlleles: ['*3A'] },
    rs3918290: { gene: 'DPYD', effect: '*2A allele — no function', starAlleles: ['*2A'] },
    rs55886062: { gene: 'DPYD', effect: 'c.1679T>G HapB3', starAlleles: ['*13'] },
    rs67376798: { gene: 'DPYD', effect: 'c.2846A>T — reduced function', starAlleles: [] },
};

function inferEffectFromVariant(variant: VCFVariant): string {
    if (variant.rsid && KNOWN_PGX_RSIDS[variant.rsid]) {
        return KNOWN_PGX_RSIDS[variant.rsid].effect;
    }
    if (variant.starAllele && variant.starAllele !== '*1') {
        return `Variant allele ${variant.starAllele}`;
    }
    return 'Variant of uncertain significance';
}

function buildDiplotype(geneVariants: VCFVariant[]): string {
    // Prefer STAR allele annotations
    const starAlleles = geneVariants
        .filter(v => v.starAllele)
        .map(v => v.starAllele as string);

    if (starAlleles.length >= 2) {
        return `${starAlleles[0]}/${starAlleles[1]}`;
    } else if (starAlleles.length === 1) {
        return `*1/${starAlleles[0]}`;
    }

    // Fall back to rsid-based inference
    const inferredAlleles: string[] = [];
    for (const variant of geneVariants) {
        if (variant.rsid && KNOWN_PGX_RSIDS[variant.rsid]) {
            const stars = KNOWN_PGX_RSIDS[variant.rsid].starAlleles;
            if (stars.length > 0) inferredAlleles.push(stars[0]);
        }
    }

    if (inferredAlleles.length >= 2) return `${inferredAlleles[0]}/${inferredAlleles[1]}`;
    if (inferredAlleles.length === 1) return `*1/${inferredAlleles[0]}`;
    return '*1/*1'; // Assume reference if no variants found
}

function getUrgency(severity: Severity): ClinicalRecommendation['urgency'] {
    if (severity === 'critical') return 'critical';
    if (severity === 'high') return 'urgent';
    return 'routine';
}

function getMonitoringAdvice(riskLabel: RiskLabel, gene: string): string {
    switch (riskLabel) {
        case 'Toxic': return 'Immediate clinical reassessment required before initiating therapy. Consider therapeutic drug monitoring.';
        case 'Ineffective': return 'Monitor therapeutic response closely. Consider alternative drug selection.';
        case 'Adjust Dosage': return `Monitor ${gene}-related biomarkers and clinical response. Dose titration recommended.`;
        case 'Safe': return 'Routine clinical monitoring per standard of care.';
        default: return 'Clinical monitoring per standard of care. Consider additional pharmacogenomic testing.';
    }
}

export function predictDrugRisk(
    parsedVcf: ParsedVCF,
    drugName: string
): PharmaGuardResult {
    const normalDrug = normalizeDrugName(drugName);
    const timestamp = new Date().toISOString();
    const primaryGene = DRUG_PRIMARY_GENE[normalDrug] || Object.keys(DRUG_GENE_RISK[normalDrug] || {})[0] || 'Unknown';

    // Helper to check if genotype indicates presence of variant
    const isVariantPresent = (gt?: string): boolean => {
        if (!gt) return true; // Assume present if no genotype info (preserves legacy behavior for simple VCFs)
        return gt.includes('1') || gt.includes('2') || gt.includes('3'); // Basic check for alt alleles
    };

    // Find relevant variants for the primary gene
    const allVariants = parsedVcf.variants;
    const geneVariants = allVariants.filter(v =>
        (v.gene?.toUpperCase() === primaryGene.toUpperCase() ||
            (v.rsid && KNOWN_PGX_RSIDS[v.rsid]?.gene === primaryGene)) &&
        isVariantPresent(v.genotype)
    );

    // Build detected variants list
    const detectedVariants: DetectedVariant[] = geneVariants.map(v => ({
        rsid: v.rsid || v.id || 'unknown',
        gene: v.gene || primaryGene,
        chrom: v.chrom,
        pos: v.pos,
        ref: v.ref,
        alt: v.alt,
        starAllele: v.starAllele,
        genotype: v.genotype,
        effect: inferEffectFromVariant(v),
    }));

    // Build diplotype
    const diplotype = buildDiplotype(geneVariants);

    // Get phenotype
    const phenotype: Phenotype = getPhenotypeForDiplotype(primaryGene, diplotype);

    // Get phenotype label
    const geneInfo = GENE_INFO[primaryGene];
    const phenotypeLabel = geneInfo?.phenotypeLabels[phenotype] || phenotype;

    // Get drug risk
    const riskEntry: DrugRiskEntry | null = getDrugRisk(normalDrug, primaryGene, phenotype);

    const riskLabel: RiskLabel = riskEntry?.riskLabel || 'Unknown';
    const severity: Severity = riskEntry?.severity || 'low';
    const confidenceScore = riskEntry?.confidenceScore ?? 0.5;

    // Adjust confidence based on data quality
    const diplotypeFromData = geneVariants.length > 0;
    const adjustedConfidence = diplotypeFromData ? confidenceScore : confidenceScore * 0.7;

    // Build quality metrics
    const pgxVariantsFound = allVariants.filter(v => v.gene && ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'].includes(v.gene.toUpperCase())).length;
    const diplotypeConfidence: QualityMetrics['diplotypeConfidence'] =
        geneVariants.length >= 2 ? 'high' :
            geneVariants.length === 1 ? 'medium' :
                parsedVcf.variants.length > 0 ? 'low' : 'none';

    return {
        patientId: parsedVcf.patientId,
        drug: normalDrug,
        timestamp,
        riskAssessment: {
            riskLabel,
            confidenceScore: Math.round(adjustedConfidence * 100) / 100,
            severity,
        },
        pharmacogenomicProfile: {
            primaryGene,
            diplotype,
            phenotype,
            phenotypeLabel,
            detectedVariants,
        },
        clinicalRecommendation: {
            action: riskEntry?.recommendation || 'Consult clinical pharmacogenomics team for guidance.',
            dosingGuidance: riskEntry?.dosingGuidance || 'Proceed with clinical judgment.',
            alternativeDrug: riskEntry?.alternativeDrug,
            cpicGuideline: riskEntry?.cpicGuideline,
            monitoring: getMonitoringAdvice(riskLabel, primaryGene),
            urgency: getUrgency(severity),
        },
        qualityMetrics: {
            vcfParsingSuccess: parsedVcf.parseErrors.length === 0,
            variantsDetected: parsedVcf.variants.length,
            pgxVariantsFound,
            diplotypeConfidence,
            parseWarnings: parsedVcf.parseErrors.slice(0, 5),
            coverageNote: geneVariants.length === 0
                ? `No ${primaryGene} variants detected in uploaded VCF. Assuming reference (*1/*1) genotype.`
                : `${geneVariants.length} ${primaryGene} variant(s) detected and used for prediction.`,
        },
    };
}
