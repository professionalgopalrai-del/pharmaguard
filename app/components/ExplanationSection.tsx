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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Genomic Intelligence</p>
                <div className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase text-slate-500">
                    {explanation.generated_by === 'gemini' ? '✨ Gemini AI' : 'Rule-Based'}
                </div>
            </div>

            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${activeTab === tab.key
                            ? 'bg-white/10 text-white'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 leading-relaxed">
                <p className="text-sm text-slate-300 font-medium whitespace-pre-wrap">
                    {tabs.find(t => t.key === activeTab)?.content || 'Data unavailable.'}
                </p>
            </div>
        </div>
    );
}
