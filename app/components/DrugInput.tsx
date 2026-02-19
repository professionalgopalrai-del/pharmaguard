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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Quick-select chips */}
            <div>
                <p className="label">Supported Drugs</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {SUPPORTED_DRUGS.map(drug => (
                        <button
                            key={drug.name}
                            className={`chip${selected.includes(drug.name) ? ' active' : ''}`}
                            onClick={() => toggleDrug(drug.name)}
                            title={`${drug.desc} · Gene: ${drug.gene}`}
                            aria-pressed={selected.includes(drug.name)}
                            id={`drug-chip-${drug.name.toLowerCase()}`}
                        >
                            {selected.includes(drug.name) && (
                                <span style={{ color: 'var(--teal)', fontSize: '0.75rem' }}>✓</span>
                            )}
                            {drug.name}
                            <span style={{
                                fontSize: '0.68rem',
                                opacity: 0.7,
                                fontWeight: 400,
                            }}>
                                {drug.gene}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom drug entry */}
            <div>
                <p className="label">Add Custom Drug</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        className="input"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        placeholder="e.g. TRAMADOL"
                        onKeyDown={e => e.key === 'Enter' && addCustom()}
                        id="custom-drug-input"
                    />
                    <button className="btn btn-secondary" onClick={addCustom} style={{ whiteSpace: 'nowrap' }}>
                        Add
                    </button>
                </div>
            </div>

            {/* Selected summary */}
            {selected.length > 0 && (
                <div>
                    <p className="label">Selected ({selected.length})</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selected.map(drug => (
                            <span
                                key={drug}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    background: 'var(--teal-glow)',
                                    border: '1px solid var(--teal)',
                                    borderRadius: '100px',
                                    fontSize: '0.8rem',
                                    color: 'var(--teal)',
                                    fontWeight: 600,
                                }}
                            >
                                {drug}
                                <button
                                    onClick={() => removeDrug(drug)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1,
                                        padding: 0, display: 'flex',
                                    }}
                                    aria-label={`Remove ${drug}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {selected.length === 0 && (
                <div className="alert alert-warning" style={{ fontSize: '0.83rem' }}>
                    <span>⚠️</span>
                    <span>Select at least one drug to analyze.</span>
                </div>
            )}
        </div>
    );
}
