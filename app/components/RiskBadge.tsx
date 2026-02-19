'use client';

type RiskLabel = 'Safe' | 'Adjust Dosage' | 'Toxic' | 'Ineffective' | 'Unknown';
type Severity = 'none' | 'low' | 'moderate' | 'high' | 'critical';

interface RiskBadgeProps {
    risk: RiskLabel | string;
    severity?: Severity | string;
    size?: 'sm' | 'md' | 'lg';
    showSeverity?: boolean;
}

const RISK_CONFIG: Record<string, { emoji: string; className: string; label: string }> = {
    'Safe': { emoji: '✅', className: 'risk-safe', label: 'Safe' },
    'Adjust Dosage': { emoji: '⚠️', className: 'risk-adjust', label: 'Adjust Dosage' },
    'Toxic': { emoji: '☠️', className: 'risk-toxic', label: 'Toxic' },
    'Ineffective': { emoji: '🚫', className: 'risk-ineffective', label: 'Ineffective' },
    'Unknown': { emoji: '❓', className: 'risk-unknown', label: 'Unknown' },
};

const SEV_CONFIG: Record<string, { cls: string; label: string }> = {
    critical: { cls: 'sev-critical', label: 'CRITICAL' },
    high: { cls: 'sev-high', label: 'HIGH' },
    moderate: { cls: 'sev-moderate', label: 'MODERATE' },
    low: { cls: 'sev-low', label: 'LOW' },
    none: { cls: 'sev-none', label: 'NONE' },
};

const SIZE_STYLES: Record<string, { padding: string; fontSize: string; gap: string }> = {
    sm: { padding: '3px 8px', fontSize: '0.72rem', gap: '4px' },
    md: { padding: '5px 12px', fontSize: '0.78rem', gap: '6px' },
    lg: { padding: '8px 16px', fontSize: '0.9rem', gap: '8px' },
};

export default function RiskBadge({ risk, severity, size = 'md', showSeverity = true }: RiskBadgeProps) {
    const config = RISK_CONFIG[risk] || RISK_CONFIG['Unknown'];
    const sevConfig = severity ? SEV_CONFIG[severity] || SEV_CONFIG['none'] : null;
    const sizeData = SIZE_STYLES[size];

    return (
        <div className="inline-flex items-center gap-2 flex-wrap">
            <span
                className={`badge h-fit px-3 py-1 font-black ${config.className} ${size === 'lg' ? 'text-[11px]' : 'text-[9px]'}`}
                aria-label={`Risk: ${config.label}`}
            >
                <span className="opacity-80">{config.emoji}</span>
                {config.label.toUpperCase()}
            </span>

            {showSeverity && sevConfig && severity !== 'none' && (
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <span className={`w-1.5 h-1.5 rounded-full ${sevConfig.cls}`} />
                    <span className="text-[9px] font-black tracking-widest text-slate-500">{sevConfig.label}</span>
                </div>
            )}
        </div>
    );
}
