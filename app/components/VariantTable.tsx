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
            <div className="p-4 text-center text-xs text-slate-500 italic bg-white/[0.02] rounded-lg border border-white/5">
                No specific variants flagged.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-slate-900/40">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white/[0.02] border-b border-white/5">
                        <tr>
                            <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Variant</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Gene</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Change</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Impact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {variants.map((v, i) => (
                            <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[11px] font-bold text-emerald-400">{v.rsid}</span>
                                        <span className="font-mono text-[9px] text-slate-600">chr{v.chrom}:{v.pos}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-white">{v.gene}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 font-mono text-xs">
                                        <span className="text-slate-400">{v.ref}</span>
                                        <span className="text-slate-600">→</span>
                                        <span className="text-white font-bold bg-white/10 px-1 rounded">{v.alt}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[10px] font-medium text-slate-400 break-words max-w-[200px]">
                                    {v.effect}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
