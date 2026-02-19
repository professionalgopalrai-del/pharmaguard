'use client';

export default function LoadingSpinner() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            gap: '1.5rem',
        }}>
            {/* Animated DNA double helix using CSS */}
            <div style={{ position: 'relative', width: '60px', height: '60px' }}>
                {/* Outer ring */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'var(--teal)',
                    borderRightColor: 'var(--teal)',
                    animation: 'spin 1s linear infinite',
                }} />
                {/* Inner ring */}
                <div style={{
                    position: 'absolute',
                    inset: '8px',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderBottomColor: 'rgba(0,210,200,0.5)',
                    borderLeftColor: 'rgba(0,210,200,0.5)',
                    animation: 'spin 0.7s linear infinite reverse',
                }} />
                {/* Center dot */}
                <div style={{
                    position: 'absolute',
                    inset: '20px',
                    borderRadius: '50%',
                    background: 'var(--teal)',
                    animation: 'dna-pulse 1.5s ease-in-out infinite',
                }} />
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Analyzing Genomic Profile...
                </p>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    Parsing VCF variants · Predicting drug interactions · Generating explanations
                </p>
            </div>

            {/* Progress steps */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {['VCF Parse', 'PGx Match', 'Risk Score', 'AI Explain'].map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            animation: `dna-pulse 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                        }}>
                            {step}
                        </span>
                        {i < 3 && <span style={{ color: 'var(--border-bright)', fontSize: '0.7rem' }}>→</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
