'use client';
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DrugInput from './components/DrugInput';
import ResultsPanel from './components/ResultsPanel';
import LoadingSpinner from './components/LoadingSpinner';

interface AnalysisResult {
  success: boolean;
  results: unknown[];
  meta: {
    patient_id: string;
    vcf_file: string;
    total_variants_parsed: number;
    drugs_processed: string[];
    drugs_unsupported: string[];
  };
  error?: string;
}

export default function Home() {
  const [vcfFile, setVcfFile] = useState<File | null>(null);
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!vcfFile || selectedDrugs.length === 0) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('vcfFile', vcfFile);
      formData.append('drugs', selectedDrugs.join(','));

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis failed. Please check your file and try again.');
      } else {
        setResult(data);
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pharmaguard_${result.meta.patient_id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canAnalyze = vcfFile !== null && selectedDrugs.length > 0 && !loading;

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="bg-glow" />

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-opacity-90 backdrop-blur-xl border-b border-white border-opacity-10 px-8 flex items-center justify-between h-[64px]">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧬</span>
          <span className="font-extrabold text-lg tracking-tight text-white">
            Pharma<span className="text-teal-400">Guard</span>
          </span>
          <span className="px-2 py-0.5 bg-teal-400 bg-opacity-10 border border-teal-400 border-opacity-30 rounded-full text-[10px] font-bold text-teal-400 tracking-wider uppercase">
            v1.0 · RIFT 2026
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <a
            href="/api/analyze"
            className="text-xs font-medium text-slate-400 hover:text-teal-400 transition-colors"
            target="_blank"
          >
            API DOCS
          </a>
        </div>
      </nav>

      {/* ── Hero section ────────────────────────────────────── */}
      <header className="text-center pt-24 pb-20 px-6 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-full text-[10px] text-slate-400 font-bold mb-10 tracking-[0.2em] uppercase shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
          CPIC-ALIGNED · GENOMIC INTELLIGENCE · v1.0
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.95] text-white">
          Smart Drug<br />
          <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Safety</span> Analysis
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
          PharmaGuard leverages advanced pharmacogenomics to predict patient response across
          <span className="text-white"> 6 critical genes</span> and primary psychiatric & cardiovascular medications.
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { label: 'Standard', value: 'VCF v4.2' },
            { label: 'Guidelines', value: 'CPIC v3' },
            { label: 'Model', value: 'Gemini 2.0' },
            { label: 'Scope', value: 'PGx Only' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl bg-white bg-opacity-[0.02] border border-white border-opacity-5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-sm font-bold text-teal-400">{s.value}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column: Form */}
          <div className="w-full lg:w-5/12 sticky top-24">
            <div className="card frosted glow-border p-8">
              <h3 className="text-xl font-black text-white mb-8 tracking-tight">Configuration</h3>

              {/* Step 1 */}
              <div className="mb-10">
                <label className="section-title">01. Genomic Data</label>
                <FileUpload onFile={setVcfFile} file={vcfFile} />
              </div>

              {/* Step 2 */}
              <div className="mb-10">
                <label className="section-title">02. Medication</label>
                <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
              </div>

              {/* Analyze button */}
              <button
                className="btn btn-primary w-full py-5 text-sm justify-center font-black tracking-widest uppercase shadow-2xl"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                id="analyze-btn"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-3 font-normal">⟳</span>
                    Analyzing Patient Genome...
                  </>
                ) : (
                  <>Begin PGx Analysis</>
                )}
              </button>

              {!vcfFile && !loading && (
                <p className="text-center text-[9px] text-slate-500 mt-6 font-bold tracking-[0.15em] uppercase">
                  Awaiting Input Data
                </p>
              )}
            </div>

            {/* Error display */}
            {error && (
              <div className="alert alert-error mt-6 animate-slide-in">
                <span className="text-lg">⚠️</span>
                <div>
                  <p className="font-bold underline decoration-red-500/50 underline-offset-4 mb-1">Analysis Halted</p>
                  <p className="text-[11px] leading-relaxed opacity-80">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Results/Info */}
          <div className="w-full lg:w-7/12 min-h-[600px] flex flex-col gap-6">
            {loading ? (
              <div className="card frosted flex-1 flex flex-col items-center justify-center p-12 text-center">
                <LoadingSpinner />
                <h4 className="mt-8 text-lg font-bold text-white">Synthesizing Genomic Insights</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">Cross-referencing variants with CPIC star-allele guidelines and LLM knowledge base.</p>
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
              <div className="flex flex-col gap-6">
                <div className="card bg-teal-400 bg-opacity-[0.02] border-teal-400/10 p-8">
                  <h4 className="text-teal-400 font-bold mb-4 flex items-center gap-2">
                    <span className="text-xl">ℹ️</span> How it works
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { t: 'Format', d: 'Supports VCF v4.2 with rsIDs or GENE:STAR notation in INFO.' },
                      { t: 'Logic', d: 'Rule-based diplotype mapping follows CPIC consensus tables.' },
                      { t: 'Explanation', d: 'Gemini Pro 1.5 generates context-aware clinical mechanism summaries.' },
                    ].map(i => (
                      <li key={i.t} className="flex gap-4">
                        <span className="text-teal-400 text-xs mt-1">●</span>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">{i.t}</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{i.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { i: '🤖', t: 'LLM Agent', d: 'Advanced reasoning for complex drug interactions.' },
                    { i: '🔒', t: 'Privacy First', d: 'Local parsing of genomic variants before synthesis.' },
                  ].map(card => (
                    <div key={card.t} className="card bg-white/5 border-white/5 p-6 hover:bg-white/[0.07] transition-all">
                      <span className="text-2xl mb-4 block">{card.i}</span>
                      <h5 className="font-bold text-white text-sm mb-2">{card.t}</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{card.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-white border-opacity-5 py-8 px-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950 bg-opacity-40">
        <p className="text-xs font-medium text-slate-500 tracking-wide uppercase">
          🧬 PharmaGuard · RIFT 2026 Hackathon · Pharmacogenomics Track
        </p>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest text-center md:text-right">
          CPIC GUIDELINES · NOT FOR CLINICAL USE WITHOUT PHYSICIAN OVERSIGHT
        </p>
      </footer>
    </div>
  );
}
