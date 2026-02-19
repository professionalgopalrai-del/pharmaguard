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
        <div className="overflow-hidden rounded-xl border border-border bg-card/60">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Variant</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Gene</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Change</th>
                            <th className="px-4 py-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Impact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {variants.map((v, i) => (
                            <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-[11px] font-bold text-primary">{v.rsid}</span>
                                        <span className="font-mono text-[9px] text-muted-foreground">chr{v.chrom}:{v.pos}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-xs font-bold text-foreground">{v.gene}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 font-mono text-xs">
                                        <span className="text-muted-foreground">{v.ref}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="text-foreground font-bold bg-secondary px-1 rounded">{v.alt}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-[10px] font-medium text-muted-foreground break-words max-w-[200px]">
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
