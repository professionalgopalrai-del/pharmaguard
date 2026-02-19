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

      {/* ── Hero ───────────────────────────────────────── */}
      <header className="text-center pt-20 pb-16 px-6 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-400 bg-opacity-10 border border-teal-400 border-opacity-20 rounded-full text-xs text-teal-400 font-semibold mb-8 tracking-wide shadow-sm">
          🏥 CPIC-ALIGNED · PHARMACOGENOMICS AI · 6 CRITICAL GENES
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05] bg-gradient-to-br from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
          Predict Drug Risks<br />Before They Harm
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed mb-12">
          Upload a patient VCF file and instantly receive AI-powered pharmacogenomic risk predictions
          aligned with CPIC guidelines across <span className="text-teal-400 font-medium">CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, and DPYD</span>.
        </p>

        {/* Stats row */}
        <div className="flex gap-12 justify-center flex-wrap">
          {[
            { value: '6', label: 'Critical Genes' },
            { value: '6', label: 'Supported Drugs' },
            { value: 'CPIC', label: 'Guideline Aligned' },
            { value: 'AI', label: 'LLM Explanations' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black text-teal-400">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Main form ──────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pb-20">
        {/* Input card */}
        <div className="card mb-8">
          {/* Step 1 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <span className="w-8 h-8 rounded-full bg-teal-400 text-slate-900 flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </span>
              <h2 className="text-lg font-bold text-white">
                Upload Patient VCF File
              </h2>
            </div>
            <FileUpload onFile={setVcfFile} file={vcfFile} />
          </div>

          <div className="divider" />

          {/* Step 2 */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all ${selectedDrugs.length > 0 ? 'bg-teal-400 text-slate-900' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                2
              </span>
              <h2 className="text-lg font-bold text-white">
                Select Drug(s) to Analyze
              </h2>
            </div>
            <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
          </div>

          <div className="divider" />

          {/* Analyze button */}
          <button
            className="btn btn-primary w-full py-4 text-lg justify-center font-bold"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            id="analyze-btn"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Analyzing...
              </>
            ) : (
              <>🔬 Run Pharmacogenomic Analysis</>
            )}
          </button>

          {!vcfFile && !loading && (
            <p className="text-center text-[11px] text-slate-500 mt-4 uppercase tracking-wider font-semibold">
              UPLOAD A VCF FILE AND SELECT AT LEAST ONE DRUG TO ENABLE ANALYSIS
            </p>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="alert alert-error animate-fade-in" style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '2px' }}>Analysis Failed</p>
              <p style={{ fontSize: '0.83rem' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card animate-fade-in">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div id="results-section">
            <ResultsPanel
              results={result.results as Parameters<typeof ResultsPanel>[0]['results']}
              meta={result.meta}
              onDownload={handleDownload}
              rawJson={JSON.stringify(result.results, null, 2)}
            />
          </div>
        )}

        {/* Info section */}
        {!result && !loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}>
            {[
              {
                icon: '🧬',
                title: 'VCF v4.2 Parser',
                desc: 'Parses standard VCF files with GENE, STAR allele, and RS ID annotations from INFO column.',
              },
              {
                icon: '⚠️',
                title: 'Risk Prediction',
                desc: 'CPIC-aligned risk classification: Safe, Adjust Dosage, Toxic, Ineffective, or Unknown.',
              },
              {
                icon: '🤖',
                title: 'AI Explanations',
                desc: 'Gemini AI generates clinical summaries, mechanisms, and patient-friendly explanations.',
              },
              {
                icon: '📋',
                title: 'JSON Export',
                desc: 'Download structured JSON output matching the PharmaGuard schema for integration.',
              },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.6rem' }}>{item.icon}</span>
                <h3 style={{ fontWeight: 700, marginBottom: '0.4rem', fontSize: '0.92rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        )}
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
