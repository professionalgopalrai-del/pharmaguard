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

    const tabs: Array<{ key: typeof activeTab; label: string; content: string }> = [
        { key: 'summary', label: 'Summary', content: explanation.summary },
        { key: 'mechanism', label: 'Mechanism', content: explanation.mechanism },
        { key: 'clinical', label: 'Context', content: explanation.clinical_context },
        { key: 'patient', label: 'Patient', content: explanation.patient_friendly },
    ];

    return (
        <div className="mt-2 bg-card/40 rounded-xl border border-border overflow-hidden">
            <div className="flex border-b border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-all relative ${activeTab === tab.key
                            ? 'text-primary bg-accent/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.key && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_-2px_6px_rgba(14,165,233,0.5)]" />
                        )}
                    </button>
                ))}
            </div>
            <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {tabs.find(t => t.key === activeTab)?.label}
                    </span>
                    {explanation.generated_by === 'gemini' && (
                        <span className="flex items-center gap-1.5 text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                            <span>✨</span> AI Analysis
                        </span>
                    )}
                </div>
                <p className="text-sm text-foreground leading-relaxed font-medium">
                    {tabs.find((t) => t.key === activeTab)?.content || 'Data unavailable.'}
                </p>
            </div>
        </div>
    );
}
