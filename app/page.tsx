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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Navbar ──────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(4, 13, 20, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '60px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🧬</span>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Pharma<span style={{ color: 'var(--teal)' }}>Guard</span>
          </span>
          <span style={{
            padding: '2px 8px',
            background: 'var(--teal-glow)',
            border: '1px solid var(--border-bright)',
            borderRadius: '100px',
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--teal)',
            letterSpacing: '0.06em',
          }}>
            v1.0 · RIFT 2026
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/api/analyze"
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}
            target="_blank"
          >
            API Docs
          </a>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────── */}
      <header style={{
        textAlign: 'center',
        padding: '4rem 2rem 3rem',
        maxWidth: '800px',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          background: 'var(--teal-glow)',
          border: '1px solid var(--border-bright)',
          borderRadius: '100px',
          fontSize: '0.78rem',
          color: 'var(--teal)',
          fontWeight: 600,
          marginBottom: '1.5rem',
          letterSpacing: '0.04em',
        }}>
          🏥 CPIC-Aligned · Pharmacogenomics AI · 6 Critical Genes
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--teal) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Predict Drug Risks<br />Before They Harm
        </h1>
        <p style={{
          fontSize: '1rem',
          lineHeight: 1.8,
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          Upload a patient VCF file and instantly receive AI-powered pharmacogenomic risk predictions
          aligned with CPIC guidelines across CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, and DPYD.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          justifyContent: 'center',
          marginTop: '2rem',
          flexWrap: 'wrap',
        }}>
          {[
            { value: '6', label: 'Critical Genes' },
            { value: '6', label: 'Supported Drugs' },
            { value: 'CPIC', label: 'Guideline Aligned' },
            { value: 'AI', label: 'LLM Explanations' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal)' }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* ── Main form ──────────────────────────────────── */}
      <main style={{
        flex: 1,
        maxWidth: '900px',
        width: '100%',
        margin: '0 auto',
        padding: '0 1.5rem 4rem',
      }}>
        {/* Input card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          {/* Step 1 */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: 'var(--teal)',
                color: 'var(--text-on-teal)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}>1</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Upload Patient VCF File
              </h2>
            </div>
            <FileUpload onFile={setVcfFile} file={vcfFile} />
          </div>

          <div className="divider" />

          {/* Step 2 */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{
                width: '28px', height: '28px',
                borderRadius: '50%',
                background: selectedDrugs.length > 0 ? 'var(--teal)' : 'var(--bg-secondary)',
                color: selectedDrugs.length > 0 ? 'var(--text-on-teal)' : 'var(--text-muted)',
                border: selectedDrugs.length > 0 ? 'none' : '1px solid var(--border)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
                flexShrink: 0,
                transition: 'all var(--transition)',
              }}>2</span>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Select Drug(s) to Analyze
              </h2>
            </div>
            <DrugInput selected={selectedDrugs} onChange={setSelectedDrugs} />
          </div>

          <div className="divider" />

          {/* Analyze button */}
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            id="analyze-btn"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                Analyzing...
              </>
            ) : (
              <>🔬 Run Pharmacogenomic Analysis</>
            )}
          </button>

          {!vcfFile && !loading && (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Upload a VCF file and select at least one drug to enable analysis
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
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '1.25rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🧬 PharmaGuard · RIFT 2026 Hackathon · Pharmacogenomics Track
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          CPIC Guidelines · Not for clinical use without physician oversight
        </p>
      </footer>
    </div>
  );
}
