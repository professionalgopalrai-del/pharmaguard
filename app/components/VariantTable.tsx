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
            <div className="p-6 text-center text-xs text-slate-500 font-medium bg-white/5 rounded-xl border border-white/5">
                No genomic variants detected for this patient record.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/20">
            <table className="w-full text-left font-medium">
                <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">rsID</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gene</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Locus</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Allele</th>
                        <th className="px-6 py-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Effect</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                    {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-white/[0.01]">
                            <td className="px-6 py-4 mono text-[11px] text-teal-400 font-bold">{v.rsid}</td>
                            <td className="px-6 py-4 text-[10px] text-white font-black">{v.gene}</td>
                            <td className="px-6 py-4 mono text-[10px] text-slate-500">chr{v.chrom}:{v.pos}</td>
                            <td className="px-6 py-4">
                                <span className="mono text-xs text-white font-bold">{v.ref}</span>
                                <span className="mx-2 text-slate-600">→</span>
                                <span className="mono text-xs text-teal-400 font-black">{v.alt}</span>
                            </td>
                            <td className="px-6 py-4 text-[10px] text-slate-400 max-w-[150px]">{v.effect}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
