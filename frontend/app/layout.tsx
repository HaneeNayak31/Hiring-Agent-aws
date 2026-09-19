import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agentic Hiring — Infrastructure for the Agent Era',
  description: 'Hiring infrastructure built for AI agents. Candidates delegate to their AI assistants, companies publish MCP endpoints, evidence proves.',
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
        <header className="border-b border-white/15 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-50">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-bold tracking-widest">
              AGENTIC
            </span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors uppercase hidden sm:inline">
              // HIRING PROTOCOL
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-mono text-xs uppercase tracking-wider text-white/70">
            <Link href="/" className="hover:text-primary transition-colors">Overview</Link>
            <Link href="/candidate/opportunities" className="hover:text-primary transition-colors flex items-center gap-1.5 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Opportunities</span>
            </Link>
            <Link href="/#how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
            <Link href="/company" className="hover:text-primary transition-colors">Control Room</Link>
            <Link href="/company/mcp" className="hover:text-primary transition-colors">MCP Protocol</Link>
          </nav>

          <div className="flex items-center gap-3 font-mono text-xs">
            <Link
              href="/candidate/opportunities"
              className="hidden sm:inline-flex px-4 py-2 border border-white/30 text-white font-bold uppercase tracking-wider hover:border-primary hover:text-primary transition"
            >
              Apply as Candidate
            </Link>
            <Link
              href="/company"
              className="px-5 py-2.5 bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
            >
              Company Control Room →
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/15 py-10 px-6 md:px-12 bg-black font-mono text-xs text-white/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-bold text-white tracking-widest uppercase mb-1">AGENTIC HIRING</div>
              <p className="text-white/40 font-sans text-xs">Infrastructure built for the AI agent era. Candidates use their AI agents; companies control the evidence.</p>
            </div>

            <div className="flex flex-wrap gap-6 text-white/60">
              <Link href="/company" className="hover:text-primary transition-colors">Control Room</Link>
              <Link href="/company/roles" className="hover:text-primary transition-colors">Roles</Link>
              <Link href="/company/mcp" className="hover:text-primary transition-colors">MCP Server</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
