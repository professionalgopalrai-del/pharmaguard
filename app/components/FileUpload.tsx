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
        <div className="w-full">
            <div
                className={`relative group cursor-pointer transition-all duration-300 ease-out border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center overflow-hidden ${dragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : file
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-border hover:border-border/80 hover:bg-accent/50'
                    }`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".vcf"
                    className="hidden"
                    onChange={onChange}
                    style={{ display: 'none' }}
                />

                {/* Background Gradient Effect */}
                <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${dragging ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                </div>

                {file ? (
                    <div className="animate-enter relative z-10 w-full">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 mx-auto text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-sm text-emerald-400 truncate max-w-[200px] mx-auto">{file.name}</p>
                            <p className="text-[10px] font-mono text-emerald-500/70 uppercase tracking-widest">
                                {(file.size / 1024).toFixed(1)} KB · VCF Validated
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-emerald-500/10">
                            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-emerald-400 transition-colors uppercase tracking-wider">
                                Replace File
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 space-y-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all ${dragging ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-secondary text-muted-foreground group-hover:text-foreground group-hover:scale-110'}`} style={{ width: '48px', height: '48px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ width: '24px', height: '24px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground mb-1">Upload Patient VCF</p>
                            <p className="text-xs text-muted-foreground max-w-[180px] mx-auto">
                                Drag & drop or click to browse filesystem
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 animate-enter">
                        <span className="text-lg">⚠️</span>
                        <p className="text-xs font-bold text-red-400">{error}</p>
                    </div>
                )}

                {!file && (
                    <div className="mt-4 flex justify-between items-center px-1 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Max 5MB</span>
                        <a
                            href="/samples/sample_patient.vcf"
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-bold text-primary hover:text-primary-dim border-b border-primary/20 hover:border-primary transition-all pb-0.5"
                        >
                            Download Sample VCF
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
