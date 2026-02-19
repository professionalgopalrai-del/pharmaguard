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
    'Safe': { emoji: '✓', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Safe' },
    'Adjust Dosage': { emoji: '!', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Adjust' },
    'Toxic': { emoji: '×', className: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Toxic' },
    'Ineffective': { emoji: '⊘', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Ineffective' },
    'Unknown': { emoji: '?', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Unknown' },
};

const SEV_CONFIG: Record<string, { cls: string; label: string }> = {
    critical: { cls: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]', label: 'CRITICAL' },
    high: { cls: 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.4)]', label: 'HIGH' },
    moderate: { cls: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]', label: 'MODERATE' },
    low: { cls: 'bg-slate-400', label: 'LOW' },
    none: { cls: 'bg-slate-500', label: 'NONE' },
};

export default function RiskBadge({ risk, severity, size = 'md', showSeverity = true }: RiskBadgeProps) {
    const config = RISK_CONFIG[risk] || RISK_CONFIG['Unknown'];
    const sevConfig = severity ? SEV_CONFIG[severity] || SEV_CONFIG['none'] : null;

    return (
        <div className="inline-flex items-center gap-2">
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-bold tracking-tight ${config.className} ${size === 'lg' ? 'text-[11px]' : 'text-[9px]'}`}
            >
                <span className="text-xs">{config.emoji}</span>
                {config.label.toUpperCase()}
            </span>

            {showSeverity && sevConfig && severity !== 'none' && (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                    <span className={`w-1 h-1 rounded-full ${sevConfig.cls}`} />
                    <span className="text-[9px] font-bold tracking-widest text-slate-500">{sevConfig.label}</span>
                </div>
            )}
        </div>
    );
}
