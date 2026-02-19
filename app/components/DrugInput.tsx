'use client';
import { useState } from 'react';

const SUPPORTED_DRUGS = [
    { name: 'CODEINE', gene: 'CYP2D6', desc: 'Opioid Analgesic', class: 'Pain' },
    { name: 'WARFARIN', gene: 'CYP2C9', desc: 'Anticoagulant', class: 'Cardio' },
    { name: 'CLOPIDOGREL', gene: 'CYP2C19', desc: 'Antiplatelet', class: 'Cardio' },
    { name: 'SIMVASTATIN', gene: 'SLCO1B1', desc: 'Statin', class: 'Lipids' },
    { name: 'AZATHIOPRINE', gene: 'TPMT', desc: 'Immunosuppressant', class: 'Immuno' },
    { name: 'FLUOROURACIL', gene: 'DPYD', desc: 'Chemotherapy', class: 'Oncology' },
];

interface DrugInputProps {
    selected: string[];
    onChange: (drugs: string[]) => void;
}

export default function DrugInput({ selected, onChange }: DrugInputProps) {
    const [custom, setCustom] = useState('');

    function toggleDrug(name: string) {
        if (selected.includes(name)) {
            onChange(selected.filter((d) => d !== name));
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
        onChange(selected.filter((d) => d !== name));
    }

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    className="w-full bg-input/50 border border-border rounded-xl py-3 pl-10 pr-20 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    placeholder="Search medication..."
                    onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                />
                <button
                    className="absolute right-2 top-2 bottom-2 px-3 rounded-lg bg-secondary hover:bg-secondary/80 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-colors"
                    onClick={addCustom}
                    disabled={!custom}
                >
                    Add
                </button>
            </div>

            {/* Quick Select Grid */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Common Requests</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_DRUGS.map(drug => {
                        const isActive = selected.includes(drug.name);
                        return (
                            <button
                                key={drug.name}
                                onClick={() => toggleDrug(drug.name)}
                                className={`text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-primary/10 border-primary/50 text-foreground shadow-[0_0_15px_-3px_rgba(14,165,233,0.3)]'
                                    : 'bg-card border-border text-muted-foreground hover:bg-accent hover:border-border/80'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[11px] font-black tracking-tight ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                            {drug.name}
                                        </span>
                                        {isActive && <span className="text-primary text-xs">✓</span>}
                                    </div>
                                    <p className="text-[9px] font-medium opacity-60 uppercase tracking-wide truncate">
                                        {drug.class} · {drug.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Selected Queue */}
            {selected.length > 0 && (
                <div className="pt-4 border-t border-white/5 animate-enter">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                        Analysis Queue ({selected.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {selected.map(drug => (
                            <span key={drug} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-white/10 text-[10px] font-mono font-bold text-slate-300">
                                {drug}
                                <button
                                    onClick={() => removeDrug(drug)}
                                    className="p-0.5 rounded-full hover:bg-white/20 hover:text-white transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
