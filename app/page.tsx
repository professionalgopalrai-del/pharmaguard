'use client';
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DrugInput from './components/DrugInput';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeToggle } from './components/ThemeToggle';

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
      formData.append('vcfFile', vcfFile);
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
    <div className="min-h-screen relative flex flex-col">
      <div className="bg-glow-top" />

      {/* ── Navigation ──────────────────────────────────── */}
      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-6">
        <div className="rounded-full px-6 py-3 flex items-center justify-between border border-border/40 bg-surface-glass/80 backdrop-blur-xl shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
              <span className="text-lg">🧬</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground italic">
              Pharma<span className="text-primary">Guard</span>
            </span>
          </div>

          <div className="hidden md:flex gap-8 items-center">
            {['Analysis', 'Guidelines', 'Network'].map(item => (
              <a key={item} href="#" className="text-xs font-bold text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://openrouter.ai/docs"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary border border-border text-[10px] font-black text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest"
              target="_blank"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              System Online
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* ── Hero section ────────────────────────────────────── */}
      <main className="flex-1 w-full pt-40 pb-20 px-6">
        <div className="container-wide max-w-6xl mx-auto flex flex-col items-center">

          <div className="text-center max-w-4xl mx-auto mb-20 animate-enter">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <span>✨ CPIC Guideline Compliant</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 text-white text-balance leading-[0.9]">
              Precision Medicine <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-500">Starts with DNA.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed text-balance">
              Upload patient genetic data to predict drug interactions, mitigate adverse reactions,
              and optimize clinical outcomes with AI-powered pharmacogenomics.
            </p>
          </div>

          {/* ── Application Workspace ── */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Controls */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-32">
              <div className="glass-card rounded-2xl p-1 overflow-hidden">
                <div className="bg-slate-900/50 p-4 border-b border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Step 01. Genome Data
                  </h3>
                </div>
                <div className="p-4">
                  <FileUpload onFile={setVcfFile} file={vcfFile} />
                </div>
              </div>

              <div className="glass-card rounded-2xl p-1 overflow-hidden">
                <div className="bg-slate-900/50 p-4 border-b border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Step 02. Medication Profile
                  </h3>
                </div>
                <div className="p-4">
                  <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
                </div>
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all ${canAnalyze
                  ? 'bg-gradient-to-r from-primary-dim to-primary text-white hover:shadow-primary/25 hover:scale-[1.02]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                onClick={handleAnalyze}
                disabled={!canAnalyze || loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span> Analyzing...
                  </span>
                ) : (
                  'Run Interaction Options Engine'
                )}
              </button>
            </div>

            {/* Right: Results / Illustration */}
            <div className="lg:col-span-8 xl:col-span-9 min-h-[600px]">
              {loading ? (
                <div className="glass-card rounded-3xl h-full flex flex-col items-center justify-center p-20 text-center animate-pulse-slow">
                  <LoadingSpinner />
                </div>
              ) : result ? (
                <div id="results-section" className="animate-enter">
                  <ResultsPanel
                    results={result.results}
                    meta={result.meta}
                    onDownload={handleDownload}
                    rawJson={JSON.stringify(result.results, null, 2)}
                  />
                </div>
              ) : (
                <div className="glass-card rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-white/5 bg-slate-900/20">
                  <div className="w-24 h-24 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                    <span className="text-4xl opacity-20">📊</span>
                  </div>
                  <h3 className="text-xl font-medium text-slate-300 mb-2">Ready for Analysis</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Import a VCF file and select medications to generate a comprehensive pharmacogenomic safety report.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 bg-slate-950/30">
        <div className="container-wide max-w-6xl mx-auto flex justify-between items-center text-xs text-slate-600 font-medium">
          <p>© 2026 PHARMAGUARD INC. <span className="mx-2">·</span> CLINICAL DECISION SUPPORT</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">PRIVACY</a>
            <a href="#" className="hover:text-slate-400 transition-colors">TERMS</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
