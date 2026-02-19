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
    const colorClass = pct >= 85 ? 'bg-emerald-400' : pct >= 65 ? 'bg-amber-400' : 'bg-rose-400';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden backdrop-blur-sm">
                <div
                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)] ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-mono font-bold w-8 text-right text-slate-400">{pct}%</span>
        </div>
    );
}

function SingleResult({ data, index }: { data: ResultData; index: number }) {
    const [expanded, setExpanded] = useState({
        variants: false,
        explanation: false,
    });

    const toggle = (key: keyof typeof expanded) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="glass-card rounded-2xl overflow-hidden animate-enter" style={{ animationDelay: `${index * 0.1}s` }}>
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{data.drug}</h3>
                            <RiskBadge
                                risk={data.risk_assessment.risk_label}
                                severity={data.risk_assessment.severity}
                                size="md"
                            />
                        </div>
                        <p className="text-xs font-medium text-slate-400">
                            {data.pharmacogenomic_profile.primary_gene} · {data.pharmacogenomic_profile.phenotype}
                        </p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                        <div className="w-24">
                            <ConfidenceBar score={data.risk_assessment.confidence_score} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actionable Content */}
            <div className="p-6 space-y-6">
                {/* Clinical Recommendation Box */}
                <div className="relative rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-5 overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>

                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Clinical Action</h4>
                    <p className="text-sm font-bold text-white leading-relaxed relative z-10">
                        {data.clinical_recommendation.action}
                    </p>

                    {(data.clinical_recommendation.dosing_guidance || data.clinical_recommendation.alternative_drug) && (
                        <div className="mt-4 pt-4 border-t border-primary/20 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {data.clinical_recommendation.dosing_guidance && (
                                <div>
                                    <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider block mb-1">Dosing</span>
                                    <p className="text-xs text-slate-300 font-medium">{data.clinical_recommendation.dosing_guidance}</p>
                                </div>
                            )}
                            {data.clinical_recommendation.alternative_drug && (
                                <div>
                                    <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider block mb-1">Consider Alternative</span>
                                    <p className="text-xs text-white font-bold bg-primary/20 inline-block px-2 py-0.5 rounded">
                                        {data.clinical_recommendation.alternative_drug}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Expandable Sections */}
                <div className="space-y-2">
                    {/* Explanation Toggle */}
                    <button
                        onClick={() => toggle('explanation')}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${expanded.explanation ? 'bg-primary' : 'bg-slate-600 group-hover:bg-slate-500'}`} />
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-wider transition-colors">
                                AI Explanation
                            </span>
                        </div>
                        <span className="text-slate-500 text-xs">{expanded.explanation ? 'Close' : 'View'}</span>
                    </button>
                    {expanded.explanation && (
                        <div className="pl-4 pb-2 animate-enter">
                            <ExplanationSection explanation={data.llm_generated_explanation} />
                        </div>
                    )}

                    {/* Variants Toggle */}
                    <button
                        onClick={() => toggle('variants')}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${expanded.variants ? 'bg-emerald-400' : 'bg-slate-600 group-hover:bg-slate-500'}`} />
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-wider transition-colors">
                                Genomic Evidence
                            </span>
                        </div>
                        <span className="text-slate-500 text-xs">{expanded.variants ? 'Close' : 'View'}</span>
                    </button>
                    {expanded.variants && (
                        <div className="pl-4 pb-2 animate-enter">
                            <VariantTable variants={data.pharmacogenomic_profile.detected_variants} />
                        </div>
                    )}
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
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Clinical Safety Report</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-slate-400">
                            PID: {meta.patient_id}
                        </span>
                        <span>·</span>
                        <span>{results.length} medications analyzed</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 rounded-lg border border-white/10 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
                        onClick={copyToClipboard}
                    >
                        {copied ? '✓ Copied' : 'Copy JSON'}
                    </button>
                    <button
                        className="px-4 py-2 rounded-lg bg-white text-slate-900 text-[10px] font-bold hover:bg-slate-200 transition-all uppercase tracking-wider shadow-lg shadow-white/10"
                        onClick={onDownload}
                    >
                        Export Report
                    </button>
                </div>
            </div>

            {/* Grid of Results */}
            <div className="grid grid-cols-1 gap-6">
                {results.map((result, i) => (
                    <SingleResult key={result.drug} data={result} index={i} />
                ))}
            </div>
        </div>
    );
}
