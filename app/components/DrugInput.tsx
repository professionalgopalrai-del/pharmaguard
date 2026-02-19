'use client';
import { useState } from 'react';

const SUPPORTED_DRUGS = [
    { name: 'CODEINE', gene: 'CYP2D6', desc: 'Opioid analgesic' },
    { name: 'WARFARIN', gene: 'CYP2C9', desc: 'Anticoagulant' },
    { name: 'CLOPIDOGREL', gene: 'CYP2C19', desc: 'Antiplatelet' },
    { name: 'SIMVASTATIN', gene: 'SLCO1B1', desc: 'Cholesterol-lowering' },
    { name: 'AZATHIOPRINE', gene: 'TPMT', desc: 'Immunosuppressant' },
    { name: 'FLUOROURACIL', gene: 'DPYD', desc: '5-FU Chemotherapy' },
];

interface DrugInputProps {
    selected: string[];
    onChange: (drugs: string[]) => void;
}

export default function DrugInput({ selected, onChange }: DrugInputProps) {
    const [custom, setCustom] = useState('');

    function toggleDrug(name: string) {
        if (selected.includes(name)) {
            onChange(selected.filter(d => d !== name));
        } else {
            onChange([...selected, name]);
        }
    }

    function addCustom() {
        const val = custom.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
        if (val && !selected.includes(val)) {
            onChange([...selected, val]);
        }
        setCustom('');
    }

    function removeDrug(name: string) {
        onChange(selected.filter(d => d !== name));
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Quick-select chips */}
            <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Supported Catalog</p>
                <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_DRUGS.map(drug => (
                        <button
                            key={drug.name}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 ${selected.includes(drug.name)
                                    ? 'bg-teal-400/10 border-teal-400/50 shadow-[0_0_15px_rgba(0,245,255,0.05)]'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                                }`}
                            onClick={() => toggleDrug(drug.name)}
                            id={`drug-chip-${drug.name.toLowerCase()}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[11px] font-black tracking-tighter ${selected.includes(drug.name) ? 'text-teal-400' : 'text-white'}`}>
                                    {drug.name}
                                </span>
                                {selected.includes(drug.name) && (
                                    <span className="text-[10px] text-teal-400 font-bold">✓</span>
                                )}
                            </div>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">
                                Target: {drug.gene}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom drug entry */}
            <div>
                <div className="flex gap-2">
                    <input
                        className="input text-xs py-3 bg-white/5 border-white/5 focus:bg-white/10"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="Search alternative drug..."
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        id="custom-drug-input"
                    />
                    <button
                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 hover:text-white uppercase transition-all"
                        onClick={addCustom}
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* Selected summary */}
            {selected.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-400/5 border border-teal-400/10 animate-fade-in">
                    <p className="text-[9px] font-black text-teal-400/50 uppercase tracking-[0.2em] mb-4">
                        QUEUE ({selected.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {selected.map(drug => (
                            <div
                                key={drug}
                                className="flex items-center gap-2 p-2 pl-3 rounded-lg bg-teal-400/10 border border-teal-400/20 text-[10px] font-bold text-teal-400"
                            >
                                {drug}
                                <button
                                    onClick={() => removeDrug(drug)}
                                    className="w-4 h-4 rounded-full bg-teal-400/20 flex items-center justify-center hover:bg-teal-400 hover:text-black transition-colors"
                                    aria-label={`Remove ${drug}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
