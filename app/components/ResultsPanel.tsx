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
    const color = pct >= 85 ? 'var(--risk-safe)' : pct >= 65 ? 'var(--risk-adjust)' : 'var(--risk-ineffective)';
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="progress-bar" style={{ flex: 1 }}>
                <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <span style={{ fontWeight: 700, color, fontSize: '0.88rem', minWidth: '38px' }}>{pct}%</span>
        </div>
    );
}

function UrgencyBadge({ urgency }: { urgency: string }) {
    const cfg: Record<string, { color: string; bg: string; border: string; label: string }> = {
        critical: { color: '#fca5a5', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: '⚡ CRITICAL' },
        urgent: { color: '#fdba74', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: '⚠ URGENT' },
        routine: { color: '#86efac', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: '✓ ROUTINE' },
    };
    const c = cfg[urgency] || cfg.routine;
    return (
        <span style={{
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: c.color,
            background: c.bg,
            border: `1px solid ${c.border}`,
        }}>
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
        <div
            className="card animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <RiskBadge
                            risk={data.risk_assessment.risk_label}
                            severity={data.risk_assessment.severity}
                            size="lg"
                        />
                        <span style={{
                            padding: '4px 12px',
                            background: 'rgba(0,210,200,0.1)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: 'var(--teal)',
                            letterSpacing: '0.03em',
                        }}>
                            {data.drug}
                        </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Patient: <span className="mono" style={{ color: 'var(--text-secondary)' }}>{data.patient_id}</span>
                        &nbsp;·&nbsp;
                        {new Date(data.timestamp).toLocaleString()}
                    </p>
                </div>
                <UrgencyBadge urgency={data.clinical_recommendation.urgency} />
            </div>

            {/* Key metrics row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
            }}>
                {/* Gene + Diplotype */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                    <p className="section-title" style={{ marginBottom: '4px' }}>Primary Gene</p>
                    <p style={{ fontWeight: 700, color: 'var(--teal)', fontSize: '1.1rem' }}>
                        {data.pharmacogenomic_profile.primary_gene}
                    </p>
                    <p className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {data.pharmacogenomic_profile.diplotype}
                    </p>
                </div>

                {/* Phenotype */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                    <p className="section-title" style={{ marginBottom: '4px' }}>Phenotype</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {data.pharmacogenomic_profile.phenotype}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {data.pharmacogenomic_profile.phenotype_label}
                    </p>
                </div>

                {/* Confidence */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                    <p className="section-title" style={{ marginBottom: '8px' }}>Confidence</p>
                    <ConfidenceBar score={data.risk_assessment.confidence_score} />
                </div>

                {/* Variants */}
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '0.75rem' }}>
                    <p className="section-title" style={{ marginBottom: '4px' }}>Variants</p>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {data.pharmacogenomic_profile.detected_variants.length}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {data.quality_metrics.diplotype_confidence} confidence
                    </p>
                </div>
            </div>

            {/* Clinical Recommendation (expanded by default) */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div className="expandable-header" onClick={() => toggle('recommendation')}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        💊 Clinical Recommendation
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform var(--transition)', display: 'inline-block', transform: expanded.recommendation ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expanded.recommendation && (
                    <div className="animate-fade-in" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <p className="section-title">Action Required</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.clinical_recommendation.action}</p>
                        </div>
                        <div className="divider" style={{ margin: '0' }} />
                        <div>
                            <p className="section-title">Dosing Guidance</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{data.clinical_recommendation.dosing_guidance}</p>
                        </div>
                        {data.clinical_recommendation.alternative_drug && (
                            <>
                                <div className="divider" style={{ margin: '0' }} />
                                <div>
                                    <p className="section-title">Alternative Drug</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--teal)' }}>{data.clinical_recommendation.alternative_drug}</p>
                                </div>
                            </>
                        )}
                        <div className="divider" style={{ margin: '0' }} />
                        <div>
                            <p className="section-title">Monitoring</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{data.clinical_recommendation.monitoring}</p>
                        </div>
                        {data.clinical_recommendation.cpic_guideline && (
                            <div style={{
                                display: 'flex', gap: '6px', alignItems: 'center',
                                fontSize: '0.78rem', color: 'var(--text-muted)',
                            }}>
                                <span>📎</span>
                                <span>{data.clinical_recommendation.cpic_guideline}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detected Variants */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div className="expandable-header" onClick={() => toggle('variants')}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        🔬 Detected Variants ({data.pharmacogenomic_profile.detected_variants.length})
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform var(--transition)', display: 'inline-block', transform: expanded.variants ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expanded.variants && (
                    <div className="animate-fade-in" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                        <VariantTable variants={data.pharmacogenomic_profile.detected_variants} />
                        {data.quality_metrics.coverage_note && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontStyle: 'italic' }}>
                                ℹ️ {data.quality_metrics.coverage_note}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* LLM Explanation */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div className="expandable-header" onClick={() => toggle('explanation')}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        🤖 AI Explanation
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform var(--transition)', display: 'inline-block', transform: expanded.explanation ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expanded.explanation && (
                    <div className="animate-fade-in" style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                        <ExplanationSection explanation={data.llm_generated_explanation} />
                    </div>
                )}
            </div>

            {/* Quality Metrics */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: '0.75rem' }}>
                <div className="expandable-header" onClick={() => toggle('quality')}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        📊 Quality Metrics
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform var(--transition)', display: 'inline-block', transform: expanded.quality ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expanded.quality && (
                    <div className="animate-fade-in" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                        {[
                            { label: 'VCF Parsing', value: data.quality_metrics.vcf_parsing_success ? '✅ Success' : '❌ Errors', color: data.quality_metrics.vcf_parsing_success ? 'var(--risk-safe)' : 'var(--risk-toxic)' },
                            { label: 'Total Variants', value: data.quality_metrics.variants_detected, color: 'var(--text-primary)' },
                            { label: 'PGx Variants', value: data.quality_metrics.pgx_variants_found, color: 'var(--teal)' },
                            { label: 'Diplotype Confidence', value: data.quality_metrics.diplotype_confidence.toUpperCase(), color: 'var(--text-primary)' },
                        ].map(m => (
                            <div key={m.label} style={{ background: 'var(--bg-secondary)', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: m.color }}>{String(m.value)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Raw JSON */}
            <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div className="expandable-header" onClick={() => toggle('json')}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {'{ }'} Raw JSON Output
                    </span>
                    <span style={{ color: 'var(--text-muted)', transition: 'transform var(--transition)', display: 'inline-block', transform: expanded.json ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
                {expanded.json && (
                    <div className="animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                        <pre
                            className="mono"
                            style={{
                                background: 'var(--bg-secondary)',
                                padding: '1rem',
                                overflowX: 'auto',
                                fontSize: '0.75rem',
                                lineHeight: 1.7,
                                color: 'var(--text-secondary)',
                                maxHeight: '400px',
                                overflowY: 'auto',
                            }}
                        >
                            {singleJson}
                        </pre>
                    </div>
                )}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Results header bar */}
            <div className="card-glass" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.25rem',
                border: '1px solid var(--teal)',
            }}>
                <div>
                    <p style={{ fontWeight: 700, color: 'var(--teal)', marginBottom: '2px' }}>
                        ✅ Analysis Complete
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {meta.vcf_file} &nbsp;·&nbsp; {results.length} drug{results.length !== 1 ? 's' : ''} analyzed &nbsp;·&nbsp;
                        {meta.total_variants_parsed} total variants parsed
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-ghost" onClick={copyToClipboard} id="copy-json-btn">
                        {copied ? '✅ Copied!' : '📋 Copy JSON'}
                    </button>
                    <button className="btn btn-secondary" onClick={onDownload} id="download-json-btn">
                        ⬇️ Download JSON
                    </button>
                </div>
            </div>

            {/* Unsupported drugs warning */}
            {meta.drugs_unsupported && meta.drugs_unsupported.length > 0 && (
                <div className="alert alert-warning">
                    <span>⚠️</span>
                    <span>
                        The following drugs are not yet supported and were skipped: <strong>{meta.drugs_unsupported.join(', ')}</strong>.
                        Supported: CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL.
                    </span>
                </div>
            )}

            {/* Individual drug results */}
            {results.map((result, i) => (
                <SingleResult key={result.drug} data={result} index={i} />
            ))}
        </div>
    );
}
