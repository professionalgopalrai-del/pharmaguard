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

    const tabs: Array<{ key: typeof activeTab; label: string; icon: string; content: string }> = [
        { key: 'summary', label: 'Synopsis', icon: '📋', content: explanation.summary },
        { key: 'mechanism', label: 'Mechanism', icon: '🔬', content: explanation.mechanism },
        { key: 'clinical', label: 'Protocol', icon: '🏥', content: explanation.clinical_context },
        { key: 'patient', label: 'For Patient', icon: '👤', content: explanation.patient_friendly },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Medical Intelligence Engine</p>
                <div className={`px-2.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wider ${explanation.generated_by === 'gemini'
                    ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                    }`}>
                    {explanation.generated_by === 'gemini' ? '✨ Gemini Enterprise' : 'Rule-Based Logic'}
                </div>
            </div>

            {/* Premium Tab Bar */}
            <div className="flex p-1 bg-white/[0.02] border border-white/5 rounded-xl">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all ${activeTab === tab.key
                            ? 'bg-white/5 text-white shadow-sm'
                            : 'text-slate-500 hover:text-slate-400'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Window */}
            <div className="relative min-h-[140px]">
                {tabs.map(tab => (
                    activeTab === tab.key && (
                        <div key={tab.key} className="animate-fade-in bg-white/[0.01] rounded-xl p-8 border border-white/5 leading-relaxed shadow-inner">
                            {tab.key === 'patient' && (
                                <div className="flex items-center gap-2 mb-6 text-[9px] font-bold text-teal-400 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    Clinical-to-Patient Translation
                                </div>
                            )}
                            <p className={`text-sm leading-relaxed ${tab.key === 'patient' ? 'text-white font-medium italic' : 'text-slate-400 font-medium'}`}>
                                {tab.content || <em className="text-slate-600">Sufficient genomic data points not identified for comprehensive mapping.</em>}
                            </p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
