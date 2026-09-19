'use client';

import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="bg-white text-black py-28 px-6 border-b border-black font-mono">
      <div className="max-w-5xl mx-auto text-center">
        <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-4 font-bold">
          // Deployment Protocol
        </span>

        <h2 className="font-bold text-5xl md:text-7xl tracking-tighter uppercase leading-[0.95] mb-8">
          MAKE YOUR
          <br />
          HIRING SYSTEM
          <br />
          <span className="text-primary">AGENT-READY.</span>
        </h2>

        <p className="text-black/70 text-lg md:text-xl font-sans max-w-xl mx-auto mb-10 leading-relaxed">
          Transition from manual application forms to an automated evidence verification pipeline built for the next internet.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold">
          <Link
            href="/company"
            className="px-8 py-4 bg-primary text-black font-mono uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
          >
            CONNECT YOUR HIRING SYSTEM →
          </Link>
          <Link
            href="/company/mcp"
            className="px-8 py-4 border-2 border-black bg-white text-black font-mono uppercase tracking-wider hover:bg-black hover:text-white transition flex items-center gap-2"
          >
            EXPLORE THE PROTOCOL →
          </Link>
        </div>
      </div>
    </section>
  );
}
