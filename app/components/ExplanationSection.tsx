'use client';
import { useState } from 'react';

interface Explanation {
    summary: string;
    mechanism: string;
    clinical_context: string;
    patient_friendly: string;
    generated_by: 'gemini' | 'rule-based';
}

export default function ExplanationSection({ explanation }: { explanation: Explanation }) {
    const [activeTab, setActiveTab] = useState<'summary' | 'mechanism' | 'clinical' | 'patient'>('summary');

    const tabs: Array<{ key: typeof activeTab; label: string; emoji: string; content: string }> = [
        { key: 'summary', label: 'Clinical Summary', emoji: '📋', content: explanation.summary },
        { key: 'mechanism', label: 'Mechanism', emoji: '🔬', content: explanation.mechanism },
        { key: 'clinical', label: 'Clinical Context', emoji: '🏥', content: explanation.clinical_context },
        { key: 'patient', label: 'Patient-Friendly', emoji: '👤', content: explanation.patient_friendly },
    ];

    return (
        <div>
            {/* AI badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p className="section-title">🤖 AI-Generated Explanation</p>
                <span className="badge" style={{
                    fontSize: '0.7rem',
                    padding: '3px 8px',
                    background: explanation.generated_by === 'gemini'
                        ? 'rgba(59, 130, 246, 0.15)'
                        : 'rgba(139, 92, 246, 0.15)',
                    border: `1px solid ${explanation.generated_by === 'gemini' ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)'}`,
                    color: explanation.generated_by === 'gemini' ? '#93c5fd' : '#c4b5fd',
                }}>
                    {explanation.generated_by === 'gemini' ? '✨ Gemini AI' : '⚙️ Rule-Based'}
                </span>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                marginBottom: '1rem',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius)',
                padding: '4px',
                flexWrap: 'wrap',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        id={`explanation-tab-${tab.key}`}
                        style={{
                            flex: '1',
                            minWidth: '100px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            background: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                            color: activeTab === tab.key ? 'var(--teal)' : 'var(--text-secondary)',
                            transition: 'all var(--transition)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {tabs.map(tab => (
                activeTab === tab.key && (
                    <div key={tab.key} className="animate-fade-in" style={{
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius)',
                        padding: '1rem',
                        lineHeight: 1.8,
                        fontSize: '0.88rem',
                        color: tab.key === 'patient' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    }}>
                        {tab.key === 'patient' && (
                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                            }}>
                                <span>👤</span> Plain-language explanation
                            </div>
                        )}
                        {tab.content || <em style={{ color: 'var(--text-muted)' }}>No content available.</em>}
                    </div>
                )
            ))}
        </div>
    );
}
