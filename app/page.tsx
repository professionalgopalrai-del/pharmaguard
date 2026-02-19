'use client';
import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import DrugInput from './components/DrugInput';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const [vcfFile, setVcfFile] = useState<File | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = vcfFile && selectedDrugs.length > 0;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('vcf', vcfFile);
      formData.append('drugs', JSON.stringify(selectedDrugs));

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setResult(data);
      // Wait for next tick to scroll
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard-report-${result.meta.patient_id}.json`;
    a.click();
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ── Background Atmosphere ────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[80px] rounded-full animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-white border-opacity-5 sticky top-0 bg-slate-950/40 backdrop-blur-xl z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center">
            <span className="text-xl">🧬</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase italic">PharmaGuard</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          {['Analysis', 'Guidelines', 'Network'].map(item => (
            <a key={item} href="#" className="text-xs font-bold text-slate-500 hover:text-white tracking-widest uppercase transition-colors">{item}</a>
          ))}
          <a
            href="https://ai.google.dev/gemini-api/docs"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 hover:text-white transition-all tracking-widest uppercase"
            target="_blank"
          >
            API DOCS
          </a>
        </div>
      </nav>

      {/* ── Hero section ────────────────────────────────────── */}
      <header className="text-center pt-32 pb-24 px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-400/10 border border-teal-400/20 rounded-full text-[10px] text-teal-300 font-bold mb-8 tracking-[0.2em] uppercase shadow-sm">
          Precision Genomic Intelligence v1.0
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-white leading-[1.05]">
          The Future of<br />
          <span className="text-teal-400">Drug Safety</span> Analysis
        </h1>

        <p className="text-xl text-slate-400 leading-relaxed mb-0 font-medium max-w-2xl mx-auto">
          Instant pharmacogenomic insights to predict patient response and personalize clinical outcomes with CPIC-aligned intelligence.
        </p>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pb-40">
        <div className="space-y-16">

          {/* Form Container */}
          <div className="card frosted p-12 border-white/10 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-8 opacity-20 hidden sm:block">
              <span className="text-6xl">📊</span>
            </div>

            {/* Step 1 */}
            <div className="mb-14">
              <label className="section-title">Step 01. Patient Genomic Profile</label>
              <FileUpload onFile={setVcfFile} file={vcfFile} />
            </div>

            {/* Step 2 */}
            <div className="mb-14">
              <label className="section-title">Step 02. Select Target Medications</label>
              <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
            </div>

            {/* Analyze button */}
            <button
              className={`btn btn-primary w-full py-6 text-lg justify-center font-bold tracking-tight shadow-xl transition-all ${!canAnalyze ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.01]'}`}
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
              id="analyze-btn"
            >
              {loading ? (
                <div className="flex items-center gap-4">
                  <LoadingSpinner />
                  <span>Synthesizing Clinical Data...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Start PGx Analysis</span>
                  <span className="text-xl">→</span>
                </div>
              )}
            </button>
          </div>

          {/* Results Display */}
          <div className="min-h-[200px]" id="results-section">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center animate-pulse">
                <p className="text-teal-400 font-bold tracking-widest uppercase text-xs mb-4">Computing Variants</p>
                <LoadingSpinner />
              </div>
            ) : result ? (
              <div className="animate-fade-in border-t border-white/5 pt-20">
                <ResultsPanel
                  results={result.results as Parameters<typeof ResultsPanel>[0]['results']}
                  meta={result.meta}
                  onDownload={handleDownload}
                  rawJson={JSON.stringify(result.results, null, 2)}
                />
              </div>
            ) : (
              <div className="text-center px-8 border-t border-white/5 pt-20">
                <p className="text-sm text-slate-500 font-medium italic">Awaiting clinical input to generate safety report.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white border-opacity-5 py-12 px-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950/40 backdrop-blur-md">
        <div>
          <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-2">
            🧬 PharmaGuard Platform
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            Clinical data aligned with CPIC v3.4 Star-Allele Guidelines.
          </p>
        </div>
        <div className="flex gap-10">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            RIFT 2026 · PGx TRACK
          </p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            MADE WITH GEMINI 2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
