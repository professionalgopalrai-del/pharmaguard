import type { Metadata } from 'next';
import './globals.css';

// Adding Outfit for headings and Inter for body via standard import in globals.css is already partially handled, 
// but we'll ensure the weight is correct for a professional look.

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

import { ThemeProvider } from './components/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
