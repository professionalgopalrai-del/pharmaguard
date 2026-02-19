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
        { key: 'summary', label: 'Summary', emoji: '📋', content: explanation.summary },
        { key: 'mechanism', label: 'Mechanism', emoji: '🔬', content: explanation.mechanism },
        { key: 'clinical', label: 'Context', emoji: '🏥', content: explanation.clinical_context },
        { key: 'patient', label: 'Patient', emoji: '👤', content: explanation.patient_friendly },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <label className="section-title mb-0">Genomic Intelligence</label>
                <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${explanation.generated_by === 'gemini'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                    }`}>
                    {explanation.generated_by === 'gemini' ? '✨ Gemini AI' : '⚙️ Rule-Based'}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        id={`explanation-tab-${tab.key}`}
                        className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${activeTab === tab.key
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="relative">
                {tabs.map(tab => (
                    activeTab === tab.key && (
                        <div key={tab.key} className="animate-fade-in bg-white/[0.02] border border-white/5 rounded-2xl p-6 leading-relaxed">
                            {tab.key === 'patient' && (
                                <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                                    Plain-Language Translation
                                </div>
                            )}
                            <p className={`text-sm ${tab.key === 'patient' ? 'text-white font-medium' : 'text-slate-400'}`}>
                                {tab.content || <em className="text-slate-600">Genetic data insufficient for detailed mapping.</em>}
                            </p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}
