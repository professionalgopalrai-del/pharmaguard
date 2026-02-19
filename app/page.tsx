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
      <div className="bg-glow" />

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
      <header className="text-center pt-24 pb-16 px-6 max-w-3xl mx-auto w-full animate-fade-in">
        <h1 className="text-8xl md:text-9xl font-extrabold tracking-tight mb-6 text-white">
          Analysis
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-0 font-medium">
          Instant pharmacogenomic insights to predict patient response and personalize clinical outcomes with CPIC-aligned intelligence.
        </p>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 pb-32">
        <div className="space-y-12">

          {/* Form Container */}
          <div className="card frosted p-10 border-white/5 shadow-xl">
            {/* Step 1 */}
            <div className="mb-12">
              <label className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 block">Step 01. Patient Genomic Profile</label>
              <FileUpload onFile={setVcfFile} file={vcfFile} />
            </div>

            {/* Step 2 */}
            <div className="mb-12">
              <label className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 block">Step 02. Select Target Medications</label>
              <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
            </div>

            {/* Analyze button */}
            <button
              className="btn btn-primary w-full py-5 text-base justify-center font-bold tracking-tight shadow-xl"
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
              id="analyze-btn"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-3">⟳</span>
                  Analyzing Genome...
                </>
              ) : (
                <>Start PGx Analysis →</>
              )}
            </button>
          </div>

          {/* Results Display */}
          <div className="min-h-[200px]">
            {loading ? (
              <div className="card frosted py-20 flex flex-col items-center justify-center text-center animate-pulse">
                <LoadingSpinner />
                <p className="mt-6 text-slate-400 font-medium tracking-tight">Processing clinical variants...</p>
              </div>
            ) : result ? (
              <div id="results-section" className="animate-fade-in">
                <ResultsPanel
                  results={result.results as Parameters<typeof ResultsPanel>[0]['results']}
                  meta={result.meta}
                  onDownload={handleDownload}
                  rawJson={JSON.stringify(result.results, null, 2)}
                />
              </div>
            ) : (
              <div className="text-center px-8 border-t border-white/5 pt-12">
                <p className="text-sm text-slate-500 font-medium">Awaiting clinical input to generate safety report.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white border-opacity-5 py-8 px-10 flex flex-col md:row justify-between items-center gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-teal-400 flex items-center justify-center">
            <span className="text-[10px]">🧬</span>
          </div>
          <span className="font-bold text-xs tracking-tight text-white uppercase italic">PharmaGuard Platform</span>
        </div>
        <div className="flex gap-8">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">RIFT 2026 · PGx TRACK</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">MADE WITH GEMINI 2.0</p>
        </div>
      </footer>
    </div>
  );
}
