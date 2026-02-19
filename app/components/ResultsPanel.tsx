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
    const colorClass = pct >= 85 ? 'bg-teal-400' : pct >= 65 ? 'bg-amber-400' : 'bg-rose-400';
    return (
        <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/5 rounded-full h-1 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[10px] font-bold text-slate-500 tabular-nums">{pct}%</span>
        </div>
    );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const cfg: Record<string, { cls: string; label: string }> = {
        critical: { cls: 'text-rose-500', label: 'CRITICAL' },
        urgent: { cls: 'text-amber-500', label: 'URGENT' },
        routine: { cls: 'text-teal-500', label: 'ROUTINE' },
    };
    const c = cfg[urgency] || cfg.routine;
    return (
        <div className="flex items-center gap-1.5">
            <span className={`w-1 h-1 rounded-full bg-current ${c.cls}`} />
            <span className={`text-[10px] font-bold tracking-widest ${c.cls}`}>
                {c.label}
            </span>
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
            <div className="card frosted p-0 overflow-hidden group">
                {/* Visual Accent */}
                <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${data.risk_assessment.severity === 'critical' ? 'bg-rose-500' : 'bg-teal-500'}`} />

                {/* Header */}
                <div className="p-10 pb-6">
                    <div className="flex items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-3xl font-bold text-white tracking-tight">{data.drug}</h3>
                                <UrgencyBadge urgency={data.clinical_recommendation.urgency} />
                            </div>
                            <RiskBadge
                                risk={data.risk_assessment.risk_label}
                                severity={data.risk_assessment.severity}
                                size="lg"
                            />
                        </div>
                    </div>

                    {/* Report Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-8 border-y border-white/5">
                        <div>
                            <p className="section-title">Genetic Profile</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-white">{data.pharmacogenomic_profile.primary_gene}</span>
                                <span className="text-teal-400 font-bold">{data.pharmacogenomic_profile.diplotype}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{data.pharmacogenomic_profile.phenotype}</p>
                        </div>
                        <div>
                            <p className="section-title">Confidence Factor</p>
                            <ConfidenceBar score={data.risk_assessment.confidence_score} />
                            <p className="text-[10px] text-slate-600 mt-3 font-medium uppercase tracking-wider">Diplotype Accuracy Score</p>
                        </div>
                    </div>
                </div>

                {/* Main Action Area */}
                <div className="px-10 pb-10 flex flex-col gap-8">
                    <div className="bg-white/[0.02] rounded-xl p-8 border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-6 h-6 rounded-md bg-teal-400/10 flex items-center justify-center text-teal-400 text-xs">💊</div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Clinical Protocol</p>
                        </div>
                        <p className="text-lg text-white font-medium leading-relaxed mb-8">
                            {data.clinical_recommendation.action}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                            <div>
                                <p className="section-title opacity-60">Dosing Adjustment</p>
                                <p className="text-sm text-white font-semibold">{data.clinical_recommendation.dosing_guidance}</p>
                            </div>
                            {data.clinical_recommendation.alternative_drug && (
                                <div>
                                    <p className="section-title opacity-60">Alternative Therapy</p>
                                    <p className="text-sm text-teal-400 font-semibold">{data.clinical_recommendation.alternative_drug}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expandables */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => toggle('explanation')}
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                        >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explain mechanism</span>
                            <span className="text-xs opacity-40">{expanded.explanation ? '−' : '+'}</span>
                        </button>
                        {expanded.explanation && (
                            <div className="p-4 border-l-2 border-white/5 ml-4">
                                <ExplanationSection explanation={data.llm_generated_explanation} />
                            </div>
                        )}

                        <button
                            onClick={() => toggle('variants')}
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                        >
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variant evidence</span>
                            <span className="text-xs opacity-40">{expanded.variants ? '−' : '+'}</span>
                        </button>
                        {expanded.variants && (
                            <div className="p-4 border-l-2 border-white/5 ml-4">
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
        <div className="flex flex-col gap-12">
            {/* Results header bar */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h2 className="text-5xl font-bold text-white mb-3">Patient Report</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        Patient ID: <span className="text-slate-300 mono">{meta.patient_id}</span> · Compiled by PharmaGuard AI
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary px-6" onClick={copyToClipboard}>
                        {copied ? 'Trace Copied' : 'Raw Data'}
                    </button>
                    <button className="btn btn-primary px-8" onClick={onDownload}>
                        Export Clinical PDF
                    </button>
                </div>
            </div>

            {/* Results list */}
            <div className="flex flex-col gap-8">
                {results.map((result, i) => (
                    <SingleResult key={result.drug} data={result} index={i} />
                ))}
            </div>

            {/* Unsupported drugs alert */}
            {meta.drugs_unsupported && meta.drugs_unsupported.length > 0 && (
                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4 text-xs font-medium text-amber-200/60">
                    <span className="text-xl">⚠️</span>
                    <p>
                        Clinical guidelines for <span className="text-amber-200">"{meta.drugs_unsupported.join(', ')}"</span> are currently being peer-reviewed and pending final diplotype mapping.
                    </p>
                </div>
            )}
        </div>
    );
}
