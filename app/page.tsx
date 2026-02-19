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
      <header className="text-center pt-24 pb-16 px-6 max-w-3xl mx-auto w-full animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
          Genomic Drug Safety
        </h1>

        <p className="text-lg text-slate-400 leading-relaxed mb-0 font-medium">
          Upload a patient's VCF file to instantly check for pharmacogenomic risks and receive personalized dosing guidance.
        </p>
      </header>

      {/* ── Main content ───────────────────────────────── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 pb-32">
        <div className="space-y-12">

          {/* Form Container */}
          <div className="card frosted p-10 border-white/5 shadow-xl">
            {/* Step 1 */}
            <div className="mb-12">
              <label className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 block">Step 01. Patient Genome</label>
              <FileUpload onFile={setVcfFile} file={vcfFile} />
            </div>

            {/* Step 2 */}
            <div className="mb-12">
              <label className="text-xs font-bold text-teal-400 uppercase tracking-[0.2em] mb-4 block">Step 02. Select Medications</label>
              <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
            </div>

            {/* Analyze button */}
            <button
              className="btn btn-primary w-full py-5 text-base justify-center font-bold tracking-tight shadow-xl"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              id="analyze-btn"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-3">⟳</span>
                  Analyzing Genome...
                </>
              ) : (
                <>Run Safety Analysis</>
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
                <p className="text-sm text-slate-500 font-medium">Ready to analyze. Upload a patient VCF to begin.</p>
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
