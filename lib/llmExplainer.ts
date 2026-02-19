// LLM Explanation Generator
// Uses Google Gemini API to generate clinical explanations
// Falls back to rule-based templates if no API key is set

import { PharmaGuardResult } from './riskPredictor';
import { GoogleGenAI } from "@google/genai";

export interface LLMExplanation {
    summary: string;
    mechanism: string;
    clinicalContext: string;
    patientFriendly: string;
    generatedBy: 'gemini' | 'rule-based';
}

function buildPrompt(result: PharmaGuardResult): string {
    const { drug, pharmacogenomicProfile, riskAssessment, clinicalRecommendation } = result;
    const { primaryGene, diplotype, phenotype, phenotypeLabel, detectedVariants } = pharmacogenomicProfile;
    const variantList = detectedVariants.length > 0
        ? detectedVariants.map(v => `${v.rsid} (${v.effect})`).join(', ')
        : 'No specific variants detected (reference genotype assumed)';

    return `You are a clinical pharmacogenomics expert. Generate a structured explanation for the following patient case.

PATIENT PHARMACOGENOMIC DATA:
- Drug: ${drug}
- Gene: ${primaryGene} (${phenotypeLabel})
- Diplotype: ${diplotype}
- Phenotype: ${phenotype} (${phenotypeLabel})
- Risk Assessment: ${riskAssessment.riskLabel} (Severity: ${riskAssessment.severity}, Confidence: ${riskAssessment.confidenceScore})
- Detected Variants: ${variantList}
- Clinical Recommendation: ${clinicalRecommendation.action}

Generate EXACTLY 4 sections as JSON (no markdown, no code blocks, just raw JSON):
{
  "summary": "2-3 sentence clinical summary of this patient's pharmacogenomic risk for ${drug}",
  "mechanism": "2-3 sentence explanation of the biological mechanism of how the ${primaryGene} variants affect ${drug} metabolism/efficacy",
  "clinicalContext": "2-3 sentences about clinical implications and CPIC guideline recommendations, referencing the specific variants detected",
  "patientFriendly": "2-3 sentence plain-language explanation for a patient with no medical background"
}`;
}

function buildRuleBasedExplanation(result: PharmaGuardResult): LLMExplanation {
    const { drug, pharmacogenomicProfile, riskAssessment, clinicalRecommendation } = result;
    const { primaryGene, diplotype, phenotype, phenotypeLabel, detectedVariants } = pharmacogenomicProfile;
    const variantStr = detectedVariants.length > 0
        ? detectedVariants.map(v => v.rsid).join(', ')
        : 'no specific variants';

    const geneFullNames: Record<string, string> = {
        CYP2D6: 'Cytochrome P450 2D6',
        CYP2C19: 'Cytochrome P450 2C19',
        CYP2C9: 'Cytochrome P450 2C9',
        SLCO1B1: 'Solute Carrier Organic Anion Transporter 1B1',
        TPMT: 'Thiopurine S-methyltransferase',
        DPYD: 'Dihydropyrimidine Dehydrogenase',
    };

    const geneFullName = geneFullNames[primaryGene] || primaryGene;

    const mechanismMap: Record<string, string> = {
        CYP2D6: `CYP2D6 (${geneFullName}) is a hepatic enzyme responsible for metabolizing approximately 25% of all clinically used drugs. The detected diplotype (${diplotype}) results in ${phenotypeLabel} status, meaning enzymatic activity is ${phenotype === 'PM' ? 'severely reduced or absent' : phenotype === 'IM' ? 'moderately reduced' : phenotype === 'URM' ? 'dramatically increased' : 'within normal range'}. For ${drug}, this directly affects the rate of drug conversion and elimination.`,
        CYP2C19: `CYP2C19 (${geneFullName}) is a hepatic enzyme critical for the bioactivation of prodrugs and metabolism of many psychiatric and cardiovascular medications. The patient's diplotype (${diplotype}) indicates ${phenotypeLabel} status, which ${phenotype === 'PM' ? 'severely impairs' : phenotype === 'IM' ? 'moderately reduces' : phenotype === 'URM' || phenotype === 'RM' ? 'enhances' : 'maintains'} the enzyme's capacity to process ${drug}.`,
        CYP2C9: `CYP2C9 (${geneFullName}) is primarily responsible for metabolizing narrow therapeutic index drugs like warfarin. The patient's diplotype (${diplotype}) results in ${phenotypeLabel} status, affecting the rate at which ${drug} is cleared from the bloodstream.`,
        SLCO1B1: `SLCO1B1 (${geneFullName}) encodes a hepatic uptake transporter that facilitates the liver's ability to absorb statin drugs from circulation. The patient's diplotype (${diplotype}) indicates ${phenotypeLabel}, meaning ${phenotype === 'PM' ? 'significantly impaired' : phenotype === 'IM' ? 'moderately reduced' : 'normal'} hepatic uptake of ${drug}, affecting both drug efficacy and systemic exposure.`,
        TPMT: `TPMT (${geneFullName}) is the enzyme responsible for inactivating thiopurine drugs through S-methylation. The diplotype (${diplotype}) results in ${phenotypeLabel} status. ${phenotype === 'PM' ? 'With absent or severely reduced TPMT activity, thiopurine drugs accumulate as toxic metabolites targeting bone marrow.' : phenotype === 'IM' ? 'Intermediate activity means thiopurines are metabolized more slowly than normal.' : 'Normal TPMT activity provides standard drug inactivation.'}`,
        DPYD: `DPYD (${geneFullName}) is the rate-limiting enzyme in fluoropyrimidine catabolism, responsible for inactivating approximately 80% of administered 5-FU. The patient's diplotype (${diplotype}) indicates ${phenotypeLabel} status, meaning the enzyme's ability to break down ${drug} is ${phenotype === 'PM' ? 'severely impaired, causing dangerous drug accumulation' : phenotype === 'IM' ? 'reduced, increasing systemic exposure' : 'within normal range'}.`,
    };

    const riskSummaryMap: Record<string, string> = {
        Toxic: `This patient's genomic profile indicates a HIGH RISK of severe toxicity with ${drug}. The ${primaryGene} ${phenotypeLabel} status (${diplotype}) detected from variants ${variantStr} predicts that standard dosing will result in dangerous drug accumulation or excessive pharmacological activity. Immediate clinical intervention is required.`,
        Ineffective: `This patient's pharmacogenomic profile indicates that ${drug} is likely to be INEFFECTIVE. The ${primaryGene} ${phenotypeLabel} status (${diplotype}) means the patient lacks adequate enzyme activity to convert or respond to ${drug} at therapeutic levels. Alternative medications should be considered.`,
        'Adjust Dosage': `This patient's ${primaryGene} ${phenotypeLabel} status (${diplotype}, variants: ${variantStr}) indicates that standard ${drug} dosing may result in suboptimal outcomes. Dose adjustment is recommended based on CPIC clinical guidelines, with careful monitoring of drug levels and clinical response.`,
        Safe: `This patient's pharmacogenomic profile indicates that standard ${drug} therapy is expected to be SAFE and EFFECTIVE. The ${primaryGene} diplotype (${diplotype}) indicates ${phenotypeLabel} status, meaning drug metabolism and response are expected to fall within normal clinical parameters.`,
        Unknown: `Pharmacogenomic data is insufficient to make a confident risk prediction for ${drug}. While ${variantStr} were identified in the VCF file, definitive diplotype assignment for ${primaryGene} could not be established. Clinical judgment should guide dosing decisions.`,
    };

    const patientFriendlyMap: Record<string, string> = {
        Toxic: `Your genetic test shows that your body processes ${drug.toLowerCase()} much more slowly than average. This means the medication can build up to dangerous levels in your system. Your doctor should prescribe a different medication before starting treatment.`,
        Ineffective: `Your genetic makeup suggests that ${drug.toLowerCase()} may not work as well for you as it does for most people. Your body doesn't properly convert or respond to this medication. Your doctor will likely recommend a different drug that works better for your genetic profile.`,
        'Adjust Dosage': `Your genetics affect how your body processes ${drug.toLowerCase()}. You may need a different dose than what is typically prescribed to get the right effect. Your doctor will monitor you closely and adjust your dose if needed.`,
        Safe: `Based on your genetic profile, ${drug.toLowerCase()} is expected to work normally for you. Your body should process this medication in the standard way, making it a safe and effective choice at the usual dose.`,
        Unknown: `We found some genetic information related to ${drug.toLowerCase()}, but we don't have enough data to know exactly how your body will respond. Your doctor will monitor your response carefully and adjust treatment if needed.`,
    };

    return {
        summary: riskSummaryMap[riskAssessment.riskLabel] || riskSummaryMap['Unknown'],
        mechanism: mechanismMap[primaryGene] || `${geneFullName} plays a key role in the metabolism of ${drug}. The detected diplotype (${diplotype}) affects enzyme activity, potentially altering drug efficacy and safety.`,
        clinicalContext: `${clinicalRecommendation.action} ${clinicalRecommendation.cpicGuideline ? `This recommendation is aligned with ${clinicalRecommendation.cpicGuideline}.` : ''} Dosing guidance: ${clinicalRecommendation.dosingGuidance}`,
        patientFriendly: patientFriendlyMap[riskAssessment.riskLabel] || patientFriendlyMap['Unknown'],
        generatedBy: 'rule-based',
    };
}

export async function generateExplanation(result: PharmaGuardResult): Promise<LLMExplanation> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return buildRuleBasedExplanation(result);
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = buildPrompt(result);

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: 0.3,
                maxOutputTokens: 1024,
            },
        });

        const rawText = response.text || '';

        // Extract JSON from response
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response:', rawText);
            return buildRuleBasedExplanation(result);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
            summary: parsed.summary || '',
            mechanism: parsed.mechanism || '',
            clinicalContext: parsed.clinicalContext || parsed.clinical_context || '',
            patientFriendly: parsed.patientFriendly || parsed.patient_friendly || '',
            generatedBy: 'gemini',
        };
    } catch (error) {
        console.error('LLM explanation error:', error);
        return buildRuleBasedExplanation(result);
    }
}
