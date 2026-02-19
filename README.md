# 🧬 PharmaGuard — Pharmacogenomic Risk Prediction System

> **RIFT 2026 Hackathon** · Pharmacogenomics / Explainable AI Track

**Live Demo:** [https://pharmaguard.vercel.app](https://pharmaguard.vercel.app) *(deploy link)*
**Demo Video:** [LinkedIn Video](#) *(#RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare)*

---

## Overview

PharmaGuard is an AI-powered web application that analyzes patient genetic data (VCF files) and drug names to predict personalized pharmacogenomic risks, providing clinically actionable recommendations with LLM-generated explanations — aligned with CPIC guidelines.

Adverse drug reactions kill over **100,000 Americans annually**. Many are preventable through pharmacogenomic testing. PharmaGuard makes this analysis fast, accessible, and explainable.

---

## Architecture Overview

```
┌─────────────────┐    POST /api/analyze     ┌─────────────────────────────────┐
│   Next.js 16    │ ─────────────────────►  │  API Route (app/api/analyze)    │
│   Frontend UI   │                          │                                 │
│                 │ ◄─────────────────────   │  1. vcfParser.ts                │
│  - FileUpload   │    JSON Response          │     Parse VCF v4.2              │
│  - DrugInput    │                          │  2. pgxKnowledgeBase.ts         │
│  - ResultsPanel │                          │     CPIC gene-drug-risk table   │
│  - RiskBadge    │                          │  3. riskPredictor.ts            │
│  - VariantTable │                          │     Phenotype + risk scoring    │
│  - ExplanationSec│                         │  4. llmExplainer.ts             │
└─────────────────┘                          │     Gemini API / rule-based     │
                                             └────────────────┬────────────────┘
                                                              │
                                                    ┌─────────▼──────────┐
                                                    │  Google Gemini API │
                                                    │  (optional)        │
                                                    └────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (dark medical-tech theme) |
| LLM | Google Gemini 2.0 Flash (optional) |
| VCF Parsing | Custom TypeScript parser |
| PGx Knowledge | CPIC-aligned hardcoded knowledge base |
| Deployment | Vercel / Render / Netlify |

---

## Supported Genes & Drugs

| Drug | Primary Gene | Risk Mechanism |
|------|-------------|----------------|
| CODEINE | CYP2D6 | O-demethylation to morphine |
| WARFARIN | CYP2C9 | S-warfarin hydroxylation |
| CLOPIDOGREL | CYP2C19 | Prodrug bioactivation |
| SIMVASTATIN | SLCO1B1 | Hepatic statin uptake |
| AZATHIOPRINE | TPMT | Thiopurine inactivation |
| FLUOROURACIL | DPYD | 5-FU catabolism |

---

## Installation & Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/pharmaguard.git
cd pharmaguard

# 2. Install dependencies
npm install

# 3. Configure environment (optional — for Gemini AI explanations)
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Run dev server
npm run dev

# 5. Open http://localhost:3000
```

### Optional: Gemini API Key

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

Without the API key, the app falls back to rule-based clinical explanations — fully functional.

---

## API Documentation

### `POST /api/analyze`

Analyzes a VCF file with one or more drugs.

**Request:** `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `vcfFile` | File | VCF v4.2 file (max 5 MB) |
| `drugs` | String | Comma-separated drug names |

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "vcfFile=@sample_patient.vcf" \
  -F "drugs=CODEINE,WARFARIN"
```

**Response Schema:**
```json
{
  "success": true,
  "results": [
    {
      "patient_id": "PATIENT_SAMPLE001",
      "drug": "CODEINE",
      "timestamp": "2026-02-19T09:00:00.000Z",
      "risk_assessment": {
        "risk_label": "Adjust Dosage",
        "confidence_score": 0.82,
        "severity": "low"
      },
      "pharmacogenomic_profile": {
        "primary_gene": "CYP2D6",
        "diplotype": "*1/*4",
        "phenotype": "IM",
        "phenotype_label": "Intermediate Metabolizer",
        "detected_variants": [...]
      },
      "clinical_recommendation": {
        "action": "...",
        "dosing_guidance": "...",
        "alternative_drug": null,
        "cpic_guideline": "CPIC CYP2D6 Codeine Guideline 2021",
        "monitoring": "...",
        "urgency": "routine"
      },
      "llm_generated_explanation": {
        "summary": "...",
        "mechanism": "...",
        "clinical_context": "...",
        "patient_friendly": "...",
        "generated_by": "rule-based"
      },
      "quality_metrics": {
        "vcf_parsing_success": true,
        "variants_detected": 10,
        "pgx_variants_found": 10,
        "diplotype_confidence": "medium",
        "parse_warnings": [],
        "coverage_note": "1 CYP2D6 variant(s) detected."
      }
    }
  ],
  "meta": { ... }
}
```

**GET `/api/analyze`** — Returns API status and supported drugs/genes.

---

## Usage Examples

### Upload Sample VCF

A sample VCF file is included at `public/samples/sample_patient.vcf`. Download it directly from the app UI.

### Supported VCF INFO Tags

```
INFO=<ID=GENE,  ...>   Gene symbol (e.g., CYP2D6)
INFO=<ID=STAR,  ...>   Star allele (e.g., *4)
INFO=<ID=RS,    ...>   dbSNP rsID (e.g., rs3892097)
```

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

Add `GEMINI_API_KEY` to Vercel environment variables in project settings.

### Render / Netlify

Set build command: `npm run build`
Set start command: `npm run start`
Add `GEMINI_API_KEY` as environment variable.

---

## Team Members

| Name | Role |
|------|------|
| *(Your name)* | Full-Stack Developer |

---

## License

MIT License. For research and educational purposes only.

> ⚕️ **Medical Disclaimer:** PharmaGuard is a research tool. All clinical decisions must be reviewed by qualified healthcare professionals. This application is not a substitute for professional medical advice.
