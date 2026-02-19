import { NextRequest, NextResponse } from 'next/server';
import { parseVCF, validateVCF } from '@/lib/vcfParser';
import { predictDrugRisk } from '@/lib/riskPredictor';
import { generateExplanation } from '@/lib/llmExplainer';
import { normalizeDrugName, DRUG_PRIMARY_GENE } from '@/lib/pgxKnowledgeBase';

const SUPPORTED_DRUGS = ['CODEINE', 'WARFARIN', 'CLOPIDOGREL', 'SIMVASTATIN', 'AZATHIOPRINE', 'FLUOROURACIL', '5-FU', '5FU'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('vcfFile') as File | null;
        const drugsRaw = formData.get('drugs') as string | null;

        // Validate file
        if (!file) {
            return NextResponse.json({ error: 'No VCF file provided.' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds 5 MB limit.` },
                { status: 400 }
            );
        }

        if (!file.name.toLowerCase().endsWith('.vcf')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only .vcf files are accepted.' },
                { status: 400 }
            );
        }

        // Validate drugs
        if (!drugsRaw || drugsRaw.trim() === '') {
            return NextResponse.json({ error: 'No drugs specified.' }, { status: 400 });
        }

        const drugList = drugsRaw
            .split(',')
            .map(d => normalizeDrugName(d))
            .filter(d => d.length > 0);

        if (drugList.length === 0) {
            return NextResponse.json({ error: 'No valid drug names provided.' }, { status: 400 });
        }

        // Read and validate VCF content
        const vcfContent = await file.text();
        const validation = validateVCF(vcfContent);
        if (!validation.valid) {
            return NextResponse.json(
                { error: `Invalid VCF file: ${validation.error}` },
                { status: 400 }
            );
        }

        // Parse VCF
        const parsedVcf = parseVCF(vcfContent);

        // Warn about unsupported drugs (but don't reject — still process supported ones)
        const unsupportedDrugs = drugList.filter(d => !DRUG_PRIMARY_GENE[d]);
        const supportedDrugsToProcess = drugList.filter(d => DRUG_PRIMARY_GENE[d]);

        if (supportedDrugsToProcess.length === 0) {
            return NextResponse.json(
                {
                    error: `None of the requested drugs are supported. Supported: ${SUPPORTED_DRUGS.join(', ')}. Requested: ${drugList.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // Process each supported drug in parallel
        const results = await Promise.all(
            supportedDrugsToProcess.map(async (drug) => {
                const prediction = predictDrugRisk(parsedVcf, drug);
                const explanation = await generateExplanation(prediction);

                // Build final JSON response matching required schema exactly
                return {
                    patient_id: prediction.patientId,
                    drug: prediction.drug,
                    timestamp: prediction.timestamp,
                    risk_assessment: {
                        risk_label: prediction.riskAssessment.riskLabel,
                        confidence_score: prediction.riskAssessment.confidenceScore,
                        severity: prediction.riskAssessment.severity,
                    },
                    pharmacogenomic_profile: {
                        primary_gene: prediction.pharmacogenomicProfile.primaryGene,
                        diplotype: prediction.pharmacogenomicProfile.diplotype,
                        phenotype: prediction.pharmacogenomicProfile.phenotype,
                        phenotype_label: prediction.pharmacogenomicProfile.phenotypeLabel,
                        detected_variants: prediction.pharmacogenomicProfile.detectedVariants.map(v => ({
                            rsid: v.rsid,
                            gene: v.gene,
                            chrom: v.chrom,
                            pos: v.pos,
                            ref: v.ref,
                            alt: v.alt,
                            star_allele: v.starAllele || null,
                            genotype: v.genotype || null,
                            effect: v.effect,
                        })),
                    },
                    clinical_recommendation: {
                        action: prediction.clinicalRecommendation.action,
                        dosing_guidance: prediction.clinicalRecommendation.dosingGuidance,
                        alternative_drug: prediction.clinicalRecommendation.alternativeDrug || null,
                        cpic_guideline: prediction.clinicalRecommendation.cpicGuideline || null,
                        monitoring: prediction.clinicalRecommendation.monitoring,
                        urgency: prediction.clinicalRecommendation.urgency,
                    },
                    llm_generated_explanation: {
                        summary: explanation.summary,
                        mechanism: explanation.mechanism,
                        clinical_context: explanation.clinicalContext,
                        patient_friendly: explanation.patientFriendly,
                        generated_by: explanation.generatedBy,
                    },
                    quality_metrics: {
                        vcf_parsing_success: prediction.qualityMetrics.vcfParsingSuccess,
                        variants_detected: prediction.qualityMetrics.variantsDetected,
                        pgx_variants_found: prediction.qualityMetrics.pgxVariantsFound,
                        diplotype_confidence: prediction.qualityMetrics.diplotypeConfidence,
                        parse_warnings: prediction.qualityMetrics.parseWarnings,
                        coverage_note: prediction.qualityMetrics.coverageNote,
                    },
                };
            })
        );

        return NextResponse.json({
            success: true,
            results,
            meta: {
                drugs_processed: supportedDrugsToProcess,
                drugs_unsupported: unsupportedDrugs,
                vcf_file: file.name,
                patient_id: parsedVcf.patientId,
                total_variants_parsed: parsedVcf.variants.length,
            },
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Internal server error during analysis. Please check your VCF file and try again.' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'PharmaGuard API is running',
        version: '1.0.0',
        supported_drugs: SUPPORTED_DRUGS,
        supported_genes: ['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'],
        endpoints: { analyze: 'POST /api/analyze' },
    });
}
