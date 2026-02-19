'use client';

interface Variant {
    rsid: string;
    gene: string;
    chrom: string;
    pos: number;
    ref: string;
    alt: string;
    star_allele?: string | null;
    genotype?: string | null;
    effect: string;
}

export default function VariantTable({ variants }: { variants: Variant[] }) {
    if (variants.length === 0) {
        return (
            <div className="alert alert-info" style={{ justifyContent: 'center' }}>
                <span>ℹ️</span>
                <span>No pharmacogenomic variants detected for this gene. Reference genotype (*1/*1) was assumed.</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20">
            <table className="data-table min-w-[600px]">
                <thead>
                    <tr className="bg-white/5">
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">rsID</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Target Gene</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Locus</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Variation</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Allele</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Call</th>
                        <th className="text-[9px] font-black tracking-widest text-slate-500 uppercase py-4">Clinical Effect</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                    {variants.map((v, i) => (
                        <tr key={i} className="animate-slide-in hover:bg-white/[0.02] transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
                            <td className="py-4">
                                <span className="mono text-[11px] font-bold text-teal-400">
                                    {v.rsid !== 'unknown' ? (
                                        <a
                                            href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline decoration-teal-400/30"
                                        >
                                            {v.rsid}
                                        </a>
                                    ) : v.rsid}
                                </span>
                            </td>
                            <td className="py-4">
                                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-black text-white">
                                    {v.gene}
                                </span>
                            </td>
                            <td className="py-4 mono text-[10px] text-slate-400">
                                chr{v.chrom}:{v.pos.toLocaleString()}
                            </td>
                            <td className="py-4 mono text-[10px]">
                                <span className="text-slate-500">{v.ref}</span>
                                <span className="text-white mx-1">→</span>
                                <span className="text-orange-400 font-bold">{v.alt}</span>
                            </td>
                            <td className="py-4">
                                {v.star_allele ? (
                                    <span className="mono text-teal-400 font-black text-xs">
                                        {v.star_allele}
                                    </span>
                                ) : (
                                    <span className="text-slate-600 text-[10px]">REF</span>
                                )}
                            </td>
                            <td className="py-4 mono text-[10px] text-slate-400 uppercase">
                                {v.genotype || '—'}
                            </td>
                            <td className="py-4 text-[10px] text-slate-500 font-medium max-w-[180px] leading-relaxed">
                                {v.effect}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
