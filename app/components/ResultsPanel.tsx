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
    const colorClass = pct >= 85 ? 'bg-cyan-400' : pct >= 65 ? 'bg-orange-400' : 'bg-red-400';
    const textClass = pct >= 85 ? 'text-cyan-400' : pct >= 65 ? 'text-orange-400' : 'text-red-400';
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={`text-[10px] font-black w-8 text-right ${textClass}`}>{pct}%</span>
        </div>
    );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const cfg: Record<string, { cls: string; label: string }> = {
        critical: { cls: 'bg-red-500/10 border-red-500/30 text-red-500', label: 'CRITICAL' },
        urgent: { cls: 'bg-orange-500/10 border-orange-500/30 text-orange-500', label: 'URGENT' },
        routine: { cls: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500', label: 'ROUTINE' },
    };
    const c = cfg[urgency] || cfg.routine;
    return (
        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black tracking-widest ${c.cls}`}>
            {c.label}
        </span>
    );
}

function SingleResult({ data, index }: { data: ResultData; index: number }) {
    const [expanded, setExpanded] = useState({
        variants: false,
        recommendation: true,
        explanation: false,
        quality: false,
        json: false,
    });

    function toggle(key: keyof typeof expanded) {
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    }

    const singleJson = JSON.stringify(data, null, 2);

    return (
        <div className="animate-fade-in group" style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="card frosted p-0 overflow-hidden glow-border">
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
                        <UrgencyBadge urgency={data.clinical_recommendation.urgency} />
                    </div>
                </div>

                {/* Sub-header Summary */}
                <div className="px-8 py-4 bg-white/[0.02] border-y border-white/5 flex flex-wrap gap-x-12 gap-y-4">
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">PGx Profile</p>
                        <p className="text-sm font-bold text-teal-400">
                            {data.pharmacogenomic_profile.primary_gene}: {data.pharmacogenomic_profile.diplotype}
                        </p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Phenotype</p>
                        <p className="text-sm font-bold text-white">{data.pharmacogenomic_profile.phenotype}</p>
                    </div>
                    <div className="flex-1 min-w-[200px] max-w-sm">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Verification Confidence</p>
                        <ConfidenceBar score={data.risk_assessment.confidence_score} />
                    </div>
                </div>

                {/* Content Sections */}
                <div className="p-8 flex flex-col gap-6">
                    {/* Recommendation Card */}
                    <div className="rounded-2xl bg-teal-400/[0.03] border border-teal-400/10 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">💊</span>
                            <h4 className="font-black text-white text-sm tracking-tight uppercase">Clinical Recommendation</h4>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed font-medium mb-6">
                            {data.clinical_recommendation.action}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-teal-400/10">
                            <div>
                                <label className="section-title">Guidance</label>
                                <p className="text-sm font-bold text-white">{data.clinical_recommendation.dosing_guidance}</p>
                            </div>
                            {data.clinical_recommendation.alternative_drug && (
                                <div>
                                    <label className="section-title">Alternative</label>
                                    <p className="text-sm font-bold text-teal-400">{data.clinical_recommendation.alternative_drug}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Expandable Sections */}
                    <div className="flex flex-col gap-3">
                        {/* Variants */}
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors" onClick={() => toggle('variants')}>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    Genomic Evidence ({data.pharmacogenomic_profile.detected_variants.length})
                                </span>
                                <span className={`text-[10px] transition-transform ${expanded.variants ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {expanded.variants && (
                                <div className="p-4 pt-0 animate-fade-in">
                                    <VariantTable variants={data.pharmacogenomic_profile.detected_variants} />
                                </div>
                            )}
                        </div>

                        {/* AI Explanation */}
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors" onClick={() => toggle('explanation')}>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Detailed AI Explanation</span>
                                <span className={`text-[10px] transition-transform ${expanded.explanation ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {expanded.explanation && (
                                <div className="p-6 pt-2 animate-fade-in border-t border-white/5">
                                    <ExplanationSection explanation={data.llm_generated_explanation} />
                                </div>
                            )}
                        </div>

                        {/* Raw Trace */}
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden">
                            <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors" onClick={() => toggle('json')}>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Advanced Data Trace</span>
                                <span className={`text-[10px] transition-transform ${expanded.json ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            {expanded.json && (
                                <div className="animate-fade-in">
                                    <pre className="mono p-6 bg-slate-950 text-[10px] text-slate-500 overflow-x-auto max-h-[300px]">
                                        {singleJson}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResultsPanel({ results, meta, onDownload, rawJson }: ResultsPanelProps) {
    const [copied, setCopied] = useState(false);

    async function copyToClipboard() {
        await navigator.clipboard.writeText(rawJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Results header bar */}
            <div className="card frosted glow-border p-8 flex items-center justify-between flex-wrap gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="w-12 h-12 rounded-2xl bg-teal-400/10 flex items-center justify-center text-teal-400">
                            <span className="text-2xl">✓</span>
                        </span>
                        <div>
                            <h3 className="text-lg font-black text-white">Analysis Complete</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                Report ID: {meta.patient_id.toUpperCase()} · {results.length} DRUGS
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-secondary px-6 py-3 text-[10px] font-black uppercase tracking-widest" onClick={copyToClipboard} id="copy-json-btn">
                        {copied ? 'Copied' : 'Copy Trace'}
                    </button>
                    <button className="btn btn-primary px-8 py-3 text-[10px] font-black uppercase tracking-widest" onClick={onDownload} id="download-json-btn">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Unsupported drugs alert */}
            {meta.drugs_unsupported && meta.drugs_unsupported.length > 0 && (
                <div className="alert alert-warning py-4 font-medium text-xs">
                    <span>⚠️</span>
                    <span>
                        External Catalog: <strong>{meta.drugs_unsupported.join(', ')}</strong> pending diplotype mapping.
                    </span>
                </div>
            )}

            {/* Results Grid/List */}
            <div className="flex flex-col gap-6">
                {results.map((result, i) => (
                    <SingleResult key={result.drug} data={result} index={i} />
                ))}
            </div>
        </div>
    );
}
