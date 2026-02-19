import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PharmaGuard | Pharmacogenomic Risk Prediction',
  description: 'AI-powered pharmacogenomics risk prediction. Upload VCF files to analyze genetic variants and get personalized drug safety recommendations aligned with CPIC guidelines.',
  keywords: ['pharmacogenomics', 'drug safety', 'VCF', 'CYP2D6', 'precision medicine', 'adverse drug reactions'],
  openGraph: {
    title: 'PharmaGuard — Pharmacogenomic Risk Prediction',
    description: 'Analyze patient genetic data and predict personalized drug risks using AI and CPIC guidelines.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
