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
            <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 text-center">
                <p className="text-xs text-slate-500 font-medium italic">No pharmacogenomic variants detected. Default metabolic profile (*1/*1) assumed for this locus.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20">
            <table className="w-full text-left font-medium border-collapse">
                <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Identifier (rsID)</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Gene</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Locus</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Variation</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Clinical Star-Allele</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">Patient Effect</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                    {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                            <td className="px-6 py-5">
                                <span className="mono text-[11px] font-bold text-teal-400">
                                    {v.rsid !== 'unknown' ? (
                                        <a
                                            href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline decoration-teal-400"
                                        >
                                            {v.rsid}
                                        </a>
                                    ) : v.rsid}
                                </span>
                            </td>
                            <td className="px-6 py-5 text-xs text-white uppercase">{v.gene}</td>
                            <td className="px-6 py-5 mono text-[10px] text-slate-500">
                                chr{v.chrom}:{v.pos.toLocaleString()}
                            </td>
                            <td className="px-6 py-5 mono text-[10px]">
                                <span className="text-slate-600">{v.ref}</span>
                                <span className="text-teal-500 mx-2">→</span>
                                <span className="text-white font-bold">{v.alt}</span>
                            </td>
                            <td className="px-6 py-5">
                                {v.star_allele ? (
                                    <span className="mono text-teal-400 font-bold text-xs ring-1 ring-teal-400/20 px-1.5 py-0.5 rounded">
                                        {v.star_allele}
                                    </span>
                                ) : (
                                    <span className="text-slate-600 text-[10px]">Ref (Native)</span>
                                )}
                            </td>
                            <td className="px-6 py-5 text-[10px] text-slate-400 leading-relaxed max-w-[200px]">
                                {v.effect}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
