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
    'Safe': { emoji: '✅', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Safe' },
    'Adjust Dosage': { emoji: '⚠️', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Adjust Dosage' },
    'Toxic': { emoji: '☠️', className: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Toxic' },
    'Ineffective': { emoji: '🚫', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'Ineffective' },
    'Unknown': { emoji: '❓', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Unknown' },
};

export default function RiskBadge({ risk, severity, size = 'md', showSeverity = true }: RiskBadgeProps) {
    const config = RISK_CONFIG[risk] || RISK_CONFIG['Unknown'];

    return (
        <div className="inline-flex items-center gap-2">
            <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-black tracking-tight uppercase ${config.className} ${size === 'lg' ? 'text-[11px]' : 'text-[9px]'}`}
            >
                <span className="opacity-80">{config.emoji}</span>
                {config.label.toUpperCase()}
            </span>

            {showSeverity && severity && severity !== 'none' && (
                <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">{severity}</span>
                </div>
            )}
        </div>
    );
}
