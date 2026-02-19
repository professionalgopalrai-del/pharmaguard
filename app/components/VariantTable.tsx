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
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <table className="data-table" style={{ minWidth: '600px' }}>
                <thead>
                    <tr>
                        <th>rsID</th>
                        <th>Gene</th>
                        <th>Location</th>
                        <th>Ref → Alt</th>
                        <th>Allele</th>
                        <th>Genotype</th>
                        <th>Effect</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map((v, i) => (
                        <tr key={i} className="animate-slide-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <td>
                                <span className="mono" style={{ color: 'var(--teal)', fontSize: '0.82rem' }}>
                                    {v.rsid !== 'unknown' ? (
                                        <a
                                            href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: 'var(--teal)', textDecoration: 'none' }}
                                        >
                                            {v.rsid}
                                        </a>
                                    ) : v.rsid}
                                </span>
                            </td>
                            <td>
                                <span style={{
                                    padding: '2px 8px',
                                    background: 'rgba(0,210,200,0.1)',
                                    borderRadius: '4px',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    color: 'var(--teal)',
                                }}>
                                    {v.gene}
                                </span>
                            </td>
                            <td className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                chr{v.chrom}:{v.pos.toLocaleString()}
                            </td>
                            <td className="mono" style={{ fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{v.ref}</span>
                                <span style={{ color: 'var(--text-secondary)' }}> → </span>
                                <span style={{ color: 'var(--risk-adjust)' }}>{v.alt}</span>
                            </td>
                            <td>
                                {v.star_allele ? (
                                    <span className="mono" style={{
                                        color: 'var(--risk-adjust)',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                    }}>
                                        {v.star_allele}
                                    </span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                )}
                            </td>
                            <td className="mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                {v.genotype || '—'}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                                {v.effect}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
