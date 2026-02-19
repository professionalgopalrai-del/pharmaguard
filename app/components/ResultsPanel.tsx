'use client';
import { useState } from 'react';
import RiskBadge from './RiskBadge';
import VariantTable from './VariantTable';
import ExplanationSection from './ExplanationSection';

interface ResultData {
    patient_id: string;
    drug: string;
    timestamp: string;
    risk_assessment: {
        risk_label: string;
        confidence_score: number;
        severity: string;
    };
    pharmacogenomic_profile: {
        primary_gene: string;
        diplotype: string;
        phenotype: string;
        phenotype_label: string;
        detected_variants: Array<{
            rsid: string;
            gene: string;
            chrom: string;
            pos: number;
            ref: string;
            alt: string;
            star_allele?: string | null;
            genotype?: string | null;
            effect: string;
        }>;
    };
    clinical_recommendation: {
        action: string;
        dosing_guidance: string;
        alternative_drug?: string | null;
        cpic_guideline?: string | null;
        monitoring: string;
        urgency: string;
    };
    llm_generated_explanation: {
        summary: string;
        mechanism: string;
        clinical_context: string;
        patient_friendly: string;
        generated_by: 'gemini' | 'rule-based';
    };
    quality_metrics: {
        vcf_parsing_success: boolean;
        variants_detected: number;
        pgx_variants_found: number;
        diplotype_confidence: string;
        parse_warnings: string[];
        coverage_note: string;
    };
}

interface ResultsPanelProps {
    results: ResultData[];
    meta: { patient_id: string; vcf_file: string; total_variants_parsed: number; drugs_processed: string[]; drugs_unsupported: string[] };
    onDownload: () => void;
    rawJson: string;
}

function ConfidenceBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const colorClass = pct >= 85 ? 'bg-teal-400' : pct >= 65 ? 'bg-orange-400' : 'bg-red-400';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-black w-8 text-right text-slate-500">{pct}%</span>
        </div>
    );
}

function SingleResult({ data, index }: { data: ResultData; index: number }) {
    const [expanded, setExpanded] = useState({
        variants: false,
        recommendation: true,
        explanation: false,
        json: false,
    });

    const toggle = (key: keyof typeof expanded) => {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="card frosted p-0 overflow-hidden">
                {/* Header */}
                <div className="p-8 pb-4">
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <RiskBadge
                                risk={data.risk_assessment.risk_label}
                                severity={data.risk_assessment.severity}
                                size="lg"
                            />
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xl font-black text-white tracking-tight">
                                {data.drug}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-header Summary */}
                <div className="px-8 py-6 bg-white/[0.01] border-y border-white/5 flex flex-wrap gap-x-16 gap-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Genetic Profile</p>
                        <p className="text-base font-bold text-white">
                            {data.pharmacogenomic_profile.primary_gene} {data.pharmacogenomic_profile.diplotype}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{data.pharmacogenomic_profile.phenotype}</p>
                    </div>
                    <div className="flex-1 min-w-[200px] max-w-sm">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Analysis Confidence</p>
                        <ConfidenceBar score={data.risk_assessment.confidence_score} />
                    </div>
                </div>

                {/* Content Sections */}
                <div className="p-8 flex flex-col gap-6">
                    <div className="rounded-2xl bg-teal-400/[0.03] border border-teal-400/10 p-6">
                        <h4 className="font-black text-white text-sm tracking-tight uppercase mb-4">Clinical Recommendation</h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6">{data.clinical_recommendation.action}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-teal-400/10">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Guidance</label>
                                <p className="text-sm font-bold text-white">{data.clinical_recommendation.dosing_guidance}</p>
                            </div>
                            {data.clinical_recommendation.alternative_drug && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Alternative</label>
                                    <p className="text-sm font-bold text-teal-400">{data.clinical_recommendation.alternative_drug}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button onClick={() => toggle('explanation')} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Detailed AI Explanation</span>
                            <span className="text-xs">{expanded.explanation ? '−' : '+'}</span>
                        </button>
                        {expanded.explanation && (
                            <div className="p-4 border-t border-white/5">
                                <ExplanationSection explanation={data.llm_generated_explanation} />
                            </div>
                        )}

                        <button onClick={() => toggle('variants')} className="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Genomic Evidence</span>
                            <span className="text-xs">{expanded.variants ? '−' : '+'}</span>
                        </button>
                        {expanded.variants && (
                            <div className="p-4 border-t border-white/5">
                                <VariantTable variants={data.pharmacogenomic_profile.detected_variants} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPanel({ results, meta, onDownload, rawJson }: ResultsPanelProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(rawJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Safety Report</h2>
                    <p className="text-sm text-slate-500 font-medium">Patient {meta.patient_id} · {results.length} medications analyzed</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-lg border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/5 transition-colors" onClick={copyToClipboard}>
                        {copied ? 'Copied' : 'Copy Trace'}
                    </button>
                    <button className="px-6 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-slate-200 transition-colors" onClick={onDownload}>
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {results.map((result, i) => (
                    <SingleResult key={result.drug} data={result} index={i} />
                ))}
            </div>
        </div>
    );
}
