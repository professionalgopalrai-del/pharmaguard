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
                className={`upload-zone frosted transition-all duration-300 ${dragging ? 'glow-border scale-[1.02]' : ''} ${file ? 'border-teal-400/50 bg-teal-400/5' : 'border-white/10 hover:border-white/20'}`}
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
                    className="hidden"
                    onChange={onChange}
                    id="vcf-file-input"
                />

                {file ? (
                    <div className="flex flex-col items-center py-4 animate-fade-in">
                        <div className="w-12 h-12 rounded-full bg-teal-400/20 flex items-center justify-center mb-4">
                            <span className="text-xl text-teal-400">✓</span>
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-teal-400 text-sm">{file.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">
                                {(file.size / 1024).toFixed(1)} KB · VALID VCF
                            </p>
                        </div>
                        <button
                            className="mt-6 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-tighter transition-colors"
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                        >
                            Change Genome File
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-6 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <span className="text-3xl">🧬</span>
                        </div>
                        <div>
                            <p className="font-bold text-white text-base mb-2">
                                {dragging ? 'Release to Load' : 'Import VCF Data'}
                            </p>
                            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                                Drag & drop or <span className="text-teal-400 underline underline-offset-4">browse patient record</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-error mt-4 text-[10px] py-3 font-bold uppercase tracking-wider">
                    <span>⚠️ {error}</span>
                </div>
            )}

            <div className="mt-4 flex justify-between items-center px-1">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    VCF v4.2 · MAX 5MB
                </p>
                <a
                    href="/samples/sample_patient.vcf"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-black text-teal-400/70 hover:text-teal-400 uppercase tracking-tighter border-b border-teal-400/20 pb-0.5"
                >
                    Get Sample File
                </a>
            </div>
        </div>
    );
}
