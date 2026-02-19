// Pharmacogenomics Knowledge Base
// CPIC-aligned gene-drug relationships, diplotype-phenotype mappings, and risk tables

export type Phenotype = 'PM' | 'IM' | 'NM' | 'RM' | 'URM' | 'Unknown';
export type RiskLabel = 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Ineffective' | 'Unknown';
export type Severity = 'none' | 'low' | 'moderate' | 'high' | 'critical';

export interface DrugRiskEntry {
    riskLabel: RiskLabel;
    severity: Severity;
    confidenceScore: number;
    recommendation: string;
    alternativeDrug?: string;
    cpicGuideline?: string;
    dosingGuidance: string;
}

export interface GeneInfo {
    fullName: string;
    primaryDrugs: string[];
    phenotypeLabels: Record<Phenotype, string>;
}

export const GENE_INFO: Record<string, GeneInfo> = {
    CYP2D6: {
        fullName: 'Cytochrome P450 2D6',
        primaryDrugs: ['CODEINE', 'TRAMADOL', 'TAMOXIFEN', 'ATOMOXETINE'],
        phenotypeLabels: {
            PM: 'Poor Metabolizer',
            IM: 'Intermediate Metabolizer',
            NM: 'Normal Metabolizer',
            RM: 'Rapid Metabolizer',
            URM: 'Ultrarapid Metabolizer',
            Unknown: 'Unknown Metabolizer Status',
        },
    },
    CYP2C19: {
        fullName: 'Cytochrome P450 2C19',
        primaryDrugs: ['CLOPIDOGREL', 'OMEPRAZOLE', 'ESCITALOPRAM'],
        phenotypeLabels: {
            PM: 'Poor Metabolizer',
            IM: 'Intermediate Metabolizer',
            NM: 'Normal Metabolizer',
            RM: 'Rapid Metabolizer',
            URM: 'Ultrarapid Metabolizer',
            Unknown: 'Unknown Metabolizer Status',
        },
    },
    CYP2C9: {
        fullName: 'Cytochrome P450 2C9',
        primaryDrugs: ['WARFARIN', 'PHENYTOIN', 'CELECOXIB'],
        phenotypeLabels: {
            PM: 'Poor Metabolizer',
            IM: 'Intermediate Metabolizer',
            NM: 'Normal Metabolizer',
            RM: 'Rapid Metabolizer',
            URM: 'Ultrarapid Metabolizer',
            Unknown: 'Unknown Metabolizer Status',
        },
    },
    SLCO1B1: {
        fullName: 'Solute Carrier Organic Anion Transporter 1B1',
        primaryDrugs: ['SIMVASTATIN', 'ATORVASTATIN', 'ROSUVASTATIN'],
        phenotypeLabels: {
            PM: 'Poor Function',
            IM: 'Intermediate Function',
            NM: 'Normal Function',
            RM: 'Increased Function',
            URM: 'Increased Function',
            Unknown: 'Unknown Function',
        },
    },
    TPMT: {
        fullName: 'Thiopurine S-methyltransferase',
        primaryDrugs: ['AZATHIOPRINE', 'MERCAPTOPURINE', 'THIOGUANINE'],
        phenotypeLabels: {
            PM: 'Poor Metabolizer',
            IM: 'Intermediate Metabolizer',
            NM: 'Normal Metabolizer',
            RM: 'Rapid Metabolizer',
            URM: 'Ultrarapid Metabolizer',
            Unknown: 'Unknown Metabolizer Status',
        },
    },
    DPYD: {
        fullName: 'Dihydropyrimidine Dehydrogenase',
        primaryDrugs: ['FLUOROURACIL', 'CAPECITABINE', 'TEGAFUR'],
        phenotypeLabels: {
            PM: 'Poor Metabolizer (No Function)',
            IM: 'Intermediate Metabolizer',
            NM: 'Normal Metabolizer',
            RM: 'Rapid Metabolizer',
            URM: 'Ultrarapid Metabolizer',
            Unknown: 'Unknown Metabolizer Status',
        },
    },
};

// Diplotype → Phenotype mapping (CPIC-aligned)
export const DIPLOTYPE_PHENOTYPE: Record<string, Record<string, Phenotype>> = {
    CYP2D6: {
        '*1/*1': 'NM', '*1/*2': 'NM', '*2/*2': 'NM',
        '*1/*4': 'IM', '*1/*5': 'IM', '*1/*6': 'IM', '*1/*41': 'IM',
        '*4/*4': 'PM', '*4/*5': 'PM', '*5/*5': 'PM', '*4/*6': 'PM',
        '*1/*1xN': 'URM', '*2/*2xN': 'URM',
        '*2/*41': 'IM', '*41/*41': 'IM',
        '*10/*10': 'PM', '*17/*17': 'IM',
    },
    CYP2C19: {
        '*1/*1': 'NM',
        '*1/*2': 'IM', '*1/*3': 'IM',
        '*2/*2': 'PM', '*2/*3': 'PM', '*3/*3': 'PM',
        '*1/*17': 'RM', '*17/*17': 'URM',
        '*2/*17': 'IM',
    },
    CYP2C9: {
        '*1/*1': 'NM',
        '*1/*2': 'IM', '*1/*3': 'IM',
        '*2/*2': 'IM', '*2/*3': 'PM', '*3/*3': 'PM',
        '*1/*5': 'IM', '*1/*6': 'IM',
    },
    SLCO1B1: {
        '*1/*1': 'NM', '*1a/*1a': 'NM',
        '*1/*5': 'IM', '*1/*15': 'IM',
        '*5/*5': 'PM', '*15/*15': 'PM', '*5/*15': 'PM',
        '*1/*14': 'IM',
    },
    TPMT: {
        '*1/*1': 'NM',
        '*1/*2': 'IM', '*1/*3A': 'IM', '*1/*3B': 'IM', '*1/*3C': 'IM',
        '*2/*3A': 'PM', '*3A/*3A': 'PM', '*3C/*3A': 'PM',
    },
    DPYD: {
        '*1/*1': 'NM',
        '*1/*2A': 'IM', '*1/c.1905+1G>A': 'IM',
        '*2A/*2A': 'PM', 'c.1905+1G>A/c.1905+1G>A': 'PM',
        '*1/c.2846A>T': 'IM', 'c.2846A>T/c.2846A>T': 'IM',
    },
};

// Drug → Gene → Phenotype → Risk
export const DRUG_GENE_RISK: Record<string, Record<string, Record<Phenotype, DrugRiskEntry>>> = {
    CODEINE: {
        CYP2D6: {
            URM: {
                riskLabel: 'Toxic',
                severity: 'critical',
                confidenceScore: 0.97,
                recommendation: 'Avoid codeine. Ultrarapid metabolizers convert codeine to morphine at dramatically elevated rates, causing life-threatening respiratory depression.',
                alternativeDrug: 'Tramadol (with caution), morphine (with dose adjustment), or non-opioid alternatives',
                cpicGuideline: 'CPIC CYP2D6 Codeine Guideline 2021',
                dosingGuidance: 'CONTRAINDICATED. Use alternative analgesics.',
            },
            PM: {
                riskLabel: 'Ineffective',
                severity: 'moderate',
                confidenceScore: 0.95,
                recommendation: 'Codeine is likely to be ineffective. Poor metabolizers cannot convert codeine to its active form (morphine), resulting in inadequate analgesia.',
                alternativeDrug: 'Morphine, oxycodone (not CYP2D6-dependent), or non-opioid analgesics',
                cpicGuideline: 'CPIC CYP2D6 Codeine Guideline 2021',
                dosingGuidance: 'Avoid codeine. Select alternative analgesic.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'low',
                confidenceScore: 0.82,
                recommendation: 'Codeine may be less effective than in normal metabolizers. Monitor for inadequate pain control and consider dose adjustment or alternative.',
                cpicGuideline: 'CPIC CYP2D6 Codeine Guideline 2021',
                dosingGuidance: 'Use with caution. Monitor pain control closely.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.9,
                recommendation: 'Standard codeine dosing is expected to be safe and effective. Monitor for standard opioid side effects.',
                cpicGuideline: 'CPIC CYP2D6 Codeine Guideline 2021',
                dosingGuidance: 'Initiate standard dosing per product label.',
            },
            RM: {
                riskLabel: 'Adjust Dosage',
                severity: 'moderate',
                confidenceScore: 0.78,
                recommendation: 'Increased conversion to morphine possible. Monitor for opioid toxicity. Consider lower starting dose.',
                cpicGuideline: 'CPIC CYP2D6 Codeine Guideline 2021',
                dosingGuidance: 'Initiate at lower dose. Monitor for opioid adverse effects.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'low',
                confidenceScore: 0.5,
                recommendation: 'Insufficient pharmacogenomic data. Proceed with standard dosing and monitor carefully.',
                dosingGuidance: 'Standard dosing with careful monitoring.',
            },
        },
    },
    WARFARIN: {
        CYP2C9: {
            PM: {
                riskLabel: 'Toxic',
                severity: 'high',
                confidenceScore: 0.93,
                recommendation: 'Significantly reduced warfarin metabolism expected. Start at 30-50% of standard dose. INR must be monitored very frequently. High bleeding risk.',
                cpicGuideline: 'CPIC CYP2C9 VKORC1 Warfarin Guideline 2017',
                dosingGuidance: 'Reduce initial dose by 30-50%. Monitor INR daily initially.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.88,
                recommendation: 'Standard warfarin dosing per VKORC1 status and clinical factors. Regular INR monitoring per standard of care.',
                cpicGuideline: 'CPIC CYP2C9 VKORC1 Warfarin Guideline 2017',
                dosingGuidance: 'Standard dosing. Monitor INR per clinical guidelines.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'low',
                confidenceScore: 0.80,
                recommendation: 'Some reduction in warfarin metabolism. Consider slight dose adjustment.',
                dosingGuidance: 'Consider 10-20% dose reduction.',
            },
            RM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.85,
                recommendation: 'Normal to slightly increased metabolism. Standard dosing with routine INR monitoring.',
                dosingGuidance: 'Standard dosing per clinical guidelines.',
            },
            URM: {
                riskLabel: 'Adjust Dosage',
                severity: 'low',
                confidenceScore: 0.75,
                recommendation: 'Potentially increased warfarin clearance. May need higher dose to achieve therapeutic INR.',
                dosingGuidance: 'May require higher dose. Monitor INR closely.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'low',
                confidenceScore: 0.5,
                recommendation: 'Proceed with standard clinical dosing algorithm incorporating clinical factors. Monitor INR.',
                dosingGuidance: 'Standard clinical dosing algorithm + close INR monitoring.',
            },
        },
    },
    CLOPIDOGREL: {
        CYP2C19: {
            PM: {
                riskLabel: 'Ineffective',
                severity: 'high',
                confidenceScore: 0.96,
                recommendation: 'Clopidogrel is a prodrug requiring CYP2C19 for activation. Poor metabolizers show significantly reduced antiplatelet activity and increased risk of cardiovascular events.',
                alternativeDrug: 'Prasugrel or ticagrelor (not CYP2C19-dependent)',
                cpicGuideline: 'CPIC CYP2C19 Clopidogrel Guideline 2022',
                dosingGuidance: 'Avoid clopidogrel. Use alternative antiplatelet therapy.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'moderate',
                confidenceScore: 0.84,
                recommendation: 'Reduced clopidogrel activation. Increased cardiovascular event risk. Consider alternative antiplatelet or increased monitoring.',
                alternativeDrug: 'Consider prasugrel or ticagrelor in high-risk patients',
                cpicGuideline: 'CPIC CYP2C19 Clopidogrel Guideline 2022',
                dosingGuidance: 'Use with caution. Consider alternatives in high-risk patients.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.91,
                recommendation: 'Standard clopidogrel therapy expected to be effective. Normal antiplatelet response anticipated.',
                cpicGuideline: 'CPIC CYP2C19 Clopidogrel Guideline 2022',
                dosingGuidance: 'Standard dosing per clinical guidelines.',
            },
            RM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.88,
                recommendation: 'Normal to slightly enhanced clopidogrel activation. Standard therapy appropriate.',
                dosingGuidance: 'Standard dosing.',
            },
            URM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.85,
                recommendation: 'Enhanced clopidogrel activation. Standard therapy appropriate, monitor for bleeding.',
                dosingGuidance: 'Standard dosing. Monitor for excess bleeding.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'low',
                confidenceScore: 0.5,
                recommendation: 'Insufficient pharmacogenomic data. Standard therapy with careful monitoring.',
                dosingGuidance: 'Standard dosing with platelet function monitoring if available.',
            },
        },
    },
    SIMVASTATIN: {
        SLCO1B1: {
            PM: {
                riskLabel: 'Toxic',
                severity: 'high',
                confidenceScore: 0.92,
                recommendation: 'Severely impaired simvastatin hepatic uptake (SLCO1B1 poor function). High risk of simvastatin-induced myopathy and rhabdomyolysis. Switch statin.',
                alternativeDrug: 'Rosuvastatin or pravastatin (less SLCO1B1-dependent)',
                cpicGuideline: 'CPIC SLCO1B1 Simvastatin Guideline 2022',
                dosingGuidance: 'AVOID simvastatin ≥40mg. Switch to safer statin.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'moderate',
                confidenceScore: 0.86,
                recommendation: 'Moderately impaired simvastatin hepatic uptake. Use lowest effective dose (≤20mg). Monitor for muscle symptoms.',
                cpicGuideline: 'CPIC SLCO1B1 Simvastatin Guideline 2022',
                dosingGuidance: 'Limit to simvastatin ≤20mg. Monitor CK levels.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.88,
                recommendation: 'Standard simvastatin dosing. Normal hepatic uptake expected. Monitor for standard statin side effects.',
                cpicGuideline: 'CPIC SLCO1B1 Simvastatin Guideline 2022',
                dosingGuidance: 'Standard dosing (≤40mg per day) per clinical guidelines.',
            },
            RM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.85,
                recommendation: 'Normal hepatic uptake. Standard therapy appropriate.',
                dosingGuidance: 'Standard dosing.',
            },
            URM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.82,
                recommendation: 'Enhanced hepatic uptake. Standard therapy. Monitor liver function.',
                dosingGuidance: 'Standard dosing.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'low',
                confidenceScore: 0.5,
                recommendation: 'Insufficient data. Use conservative statin dosing and monitor for muscle symptoms.',
                dosingGuidance: 'Conservative dosing with myopathy monitoring.',
            },
        },
    },
    AZATHIOPRINE: {
        TPMT: {
            PM: {
                riskLabel: 'Toxic',
                severity: 'critical',
                confidenceScore: 0.98,
                recommendation: 'TPMT poor metabolizers cannot adequately methylate thiopurines, causing severe hematopoietic toxicity. Azathioprine/6-MP is CONTRAINDICATED at standard doses.',
                alternativeDrug: 'Consider non-thiopurine immunosuppressants (e.g., mycophenolate)',
                cpicGuideline: 'CPIC TPMT Thiopurine Guideline 2018',
                dosingGuidance: 'CONTRAINDICATED at standard doses. Reduce to 6-10% of standard or switch drug.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'moderate',
                confidenceScore: 0.91,
                recommendation: 'Reduced TPMT activity. Risk of hematologic toxicity. Initiate at 30-70% of standard dose. Monitor CBC weekly for first month.',
                cpicGuideline: 'CPIC TPMT Thiopurine Guideline 2018',
                dosingGuidance: 'Reduce initial dose by 30-50%. Weekly CBC monitoring for 1 month.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.92,
                recommendation: 'Normal TPMT activity. Standard azathioprine dosing. Monitor CBC and liver function per standard of care.',
                cpicGuideline: 'CPIC TPMT Thiopurine Guideline 2018',
                dosingGuidance: 'Standard dosing. CBC and LFT monitoring per guidelines.',
            },
            RM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.87,
                recommendation: 'Normal TPMT activity. Standard therapy appropriate.',
                dosingGuidance: 'Standard dosing.',
            },
            URM: {
                riskLabel: 'Adjust Dosage',
                severity: 'low',
                confidenceScore: 0.75,
                recommendation: 'High TPMT activity may reduce thiopurine efficacy. Monitor therapeutic response.',
                dosingGuidance: 'May require higher dose for efficacy. Monitor response.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'moderate',
                confidenceScore: 0.5,
                recommendation: 'Insufficient data. Use conservative dosing with close hematologic monitoring.',
                dosingGuidance: 'Start at 50% of standard dose. Weekly CBC until stable.',
            },
        },
    },
    FLUOROURACIL: {
        DPYD: {
            PM: {
                riskLabel: 'Toxic',
                severity: 'critical',
                confidenceScore: 0.97,
                recommendation: 'DPYD poor metabolizers cannot adequately catabolize fluorouracil (5-FU), causing severe and potentially fatal toxicity (mucositis, myelosuppression, neurotoxicity).',
                alternativeDrug: 'Tegafur + uracil (with caution) or alternative chemotherapy regimens',
                cpicGuideline: 'CPIC DPYD Fluoropyrimidine Guideline 2018',
                dosingGuidance: 'CONTRAINDICATED. Select alternative chemotherapy agent.',
            },
            IM: {
                riskLabel: 'Adjust Dosage',
                severity: 'high',
                confidenceScore: 0.93,
                recommendation: 'Reduced DPYD activity. Significant risk of severe 5-FU toxicity. Reduce initial dose by 50%. Perform therapeutic drug monitoring if possible.',
                cpicGuideline: 'CPIC DPYD Fluoropyrimidine Guideline 2018',
                dosingGuidance: 'Reduce starting dose by 50%. TDM-guided dosing strongly recommended.',
            },
            NM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.89,
                recommendation: 'Normal DPYD activity. Standard 5-FU dosing with standard oncologic monitoring.',
                cpicGuideline: 'CPIC DPYD Fluoropyrimidine Guideline 2018',
                dosingGuidance: 'Standard dosing per oncology protocols.',
            },
            RM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.84,
                recommendation: 'Normal DPYD activity. Standard therapy appropriate.',
                dosingGuidance: 'Standard dosing.',
            },
            URM: {
                riskLabel: 'Safe',
                severity: 'none',
                confidenceScore: 0.80,
                recommendation: 'Potentially enhanced metabolism. Monitor for efficacy.',
                dosingGuidance: 'Standard dosing. Monitor treatment response.',
            },
            Unknown: {
                riskLabel: 'Unknown',
                severity: 'moderate',
                confidenceScore: 0.5,
                recommendation: 'Insufficient data. Prior to initiating 5-FU/capecitabine, consider DPYD genotyping. If not possible, monitor closely for early toxicity.',
                dosingGuidance: 'Consider genotyping before initiation. If not possible, start at reduced dose.',
            },
        },
    },
};

// Primary gene for each drug
export const DRUG_PRIMARY_GENE: Record<string, string> = {
    CODEINE: 'CYP2D6',
    WARFARIN: 'CYP2C9',
    CLOPIDOGREL: 'CYP2C19',
    SIMVASTATIN: 'SLCO1B1',
    AZATHIOPRINE: 'TPMT',
    FLUOROURACIL: 'DPYD',
    '5-FU': 'DPYD',
    '5FU': 'DPYD',
};

export function normalizeDrugName(drug: string): string {
    return drug.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
}

export function getPhenotypeForDiplotype(gene: string, diplotype: string): Phenotype {
    const geneMap = DIPLOTYPE_PHENOTYPE[gene.toUpperCase()];
    if (!geneMap) return 'Unknown';
    // Direct match
    if (geneMap[diplotype]) return geneMap[diplotype];
    // Reverse match (e.g., *4/*1 should match *1/*4)
    const parts = diplotype.split('/');
    if (parts.length === 2) {
        const reversed = `${parts[1]}/${parts[0]}`;
        if (geneMap[reversed]) return geneMap[reversed];
    }
    return 'Unknown';
}

export function getDrugRisk(drug: string, gene: string, phenotype: Phenotype): DrugRiskEntry | null {
    const normalDrug = normalizeDrugName(drug);
    const drugMap = DRUG_GENE_RISK[normalDrug];
    if (!drugMap) return null;
    const geneMap = drugMap[gene.toUpperCase()];
    if (!geneMap) return null;
    return geneMap[phenotype] || geneMap['Unknown'] || null;
}
