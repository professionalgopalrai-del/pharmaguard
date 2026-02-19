'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface FileUploadProps {
    onFile: (file: File) => void;
    file: File | null;
}

export default function FileUpload({ onFile, file }: FileUploadProps) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    function validateAndSet(f: File) {
        setError('');
        if (!f.name.toLowerCase().endsWith('.vcf')) {
            setError('Only .vcf files are accepted.');
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Maximum 5 MB.`);
            return;
        }
        onFile(f);
    }

    function onDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) validateAndSet(dropped);
    }

    function onChange(e: ChangeEvent<HTMLInputElement>) {
        const picked = e.target.files?.[0];
        if (picked) validateAndSet(picked);
    }

    return (
        <div>
            <div
                className={`upload-zone${dragging ? ' drag-over' : ''}${file ? ' has-file' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                aria-label="Upload VCF file"
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".vcf"
                    style={{ display: 'none' }}
                    onChange={onChange}
                    id="vcf-file-input"
                />

                {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '2rem' }}>✅</span>
                        <div>
                            <p style={{ fontWeight: 600, color: 'var(--risk-safe)', fontSize: '0.95rem' }}>{file.name}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                                {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; VCF file ready
                            </p>
                        </div>
                        <button
                            className="btn btn-ghost"
                            style={{ fontSize: '0.78rem', padding: '4px 12px' }}
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        >
                            Replace file
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🧬</div>
                        <div>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>
                                {dragging ? 'Drop your VCF file here' : 'Drag & drop VCF file'}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginTop: '4px' }}>
                                or <span style={{ color: 'var(--teal)', fontWeight: 600 }}>Browse files</span> &nbsp;·&nbsp; Max 5 MB
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {['CYP2D6', 'CYP2C19', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'].map(g => (
                                <span key={g} className="chip" style={{ fontSize: '0.72rem', cursor: 'default' }}>{g}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
                    <span>⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    VCF v4.2 format · INFO tags: GENE, STAR, RS supported
                </p>
                <a
                    href="/samples/sample_patient.vcf"
                    download
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.78rem', color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}
                >
                    ↓ Download sample VCF
                </a>
            </div>
        </div>
    );
}
