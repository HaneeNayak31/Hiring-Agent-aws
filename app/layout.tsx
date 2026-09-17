// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agentic Hiring — Infrastructure for the Agent Era',
  description: 'Hiring infrastructure built for AI agents. Candidates delegate, agents search, evidence proves.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-black text-white font-sans antialiased selection:bg-primary selection:text-black">
        {/* Global Navigation Header (Section 10) */}
        <header className="border-b border-white/15 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-50">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-bold tracking-widest">
              AGENTIC
            </span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors uppercase hidden sm:inline">
              // HIRING PROTOCOL
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-white/70">
            <Link href="/" className="hover:text-primary transition-colors">Product</Link>
            <Link href="/#problem" className="hover:text-primary transition-colors">How it works</Link>
            <Link href="/candidate" className="hover:text-primary transition-colors">For Candidates</Link>
            <Link href="/recruiter" className="hover:text-primary transition-colors">For Companies</Link>
          </nav>

          <div className="flex items-center gap-4 font-mono text-xs">
            <Link
              href="/candidate"
              className="px-4 py-2 bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
            >
              Get Started
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* Minimal Footer (Section 40) */}
        <footer className="border-t border-white/15 py-10 px-6 md:px-12 bg-black font-mono text-xs text-white/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-bold text-white tracking-widest uppercase mb-1">AGENTIC HIRING</div>
              <p className="text-white/40 font-sans text-xs">Hiring infrastructure built for the AI agent era.</p>
            </div>

            <div className="flex flex-wrap gap-6 text-white/60">
              <Link href="/candidate" className="hover:text-primary transition-colors">Candidates</Link>
              <Link href="/recruiter" className="hover:text-primary transition-colors">Companies</Link>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Documentation</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
