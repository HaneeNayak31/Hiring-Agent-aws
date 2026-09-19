'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cpu, Server, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-black text-white py-24 md:py-32 overflow-hidden relative border-b border-white/15">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center px-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 border border-primary/30 mb-6 font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Hiring Infrastructure for the Agent Era
          </div>

          <h1 className="font-bold text-5xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-6 leading-[0.9]">
            THE JOB SEARCH
            <br />
            IS GETTING
            <br />
            <span className="text-primary">AN AGENT.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl font-sans leading-relaxed">
            Candidates bring their own AI agents. Companies expose hiring capabilities through standardized MCP servers. Applications arrive directly into your company&apos;s hiring infrastructure.
          </p>

          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <Link
              href="/company"
              className="px-8 py-4 bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
            >
              Company Control Room
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/company/mcp"
              className="px-8 py-4 border border-white/30 text-white font-bold uppercase tracking-wider hover:border-white transition flex items-center gap-2"
            >
              <Server className="w-4 h-4 text-primary" />
              Inspect Hiring MCP Server
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="border-2 border-white/30 bg-white/[0.02] p-8 md:p-10 font-mono relative shadow-[10px_10px_0px_0px_rgba(255,106,0,1)]">
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/15">
              <span className="text-xs text-white/50 uppercase tracking-widest">// SYSTEM PROTOCOL FLOW</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                EXTERNAL AGENT BRIDGE
              </span>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 border border-white/20 bg-black">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-white" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">CANDIDATE</div>
                    <div className="text-[10px] text-white/50 font-sans">Delegates job criteria to AI assistant</div>
                  </div>
                </div>
                <span className="text-[10px] text-white/40">USER AGENT</span>
              </div>

              <div className="h-5 w-px bg-gradient-to-b from-white/40 to-primary ml-5" />

              <div className="flex items-center justify-between p-4 border-2 border-primary bg-primary/10">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-primary animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-primary uppercase">PERSONAL AI AGENT</div>
                    <div className="text-[10px] text-white/70 font-sans">ChatGPT / Claude / Gemini Agent</div>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary text-black font-bold">EXTERNAL</span>
              </div>

              <div className="h-5 w-px bg-gradient-to-b from-primary to-white ml-5" />

              <div className="flex items-center justify-between p-4 border border-white/30 bg-white/10">
                <div className="flex items-center gap-3">
                  <Server className="w-4 h-4 text-white" />
                  <div>
                    <div className="text-xs font-bold text-white uppercase">HIRING MCP SERVER</div>
                    <div className="text-[10px] text-white/60 font-sans">Exposes search_jobs & apply_to_job</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-bold">mcp.company/hiring</span>
              </div>

              <div className="h-5 w-px bg-gradient-to-b from-white to-emerald-400 ml-5" />

              <div className="flex items-center justify-between p-4 border border-emerald-500/40 bg-emerald-500/5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase">COMPANY HIRING INFRASTRUCTURE</div>
                    <div className="text-[10px] text-white/60 font-sans">Receives evidence & generates briefing</div>
                  </div>
                </div>
                <span className="text-xs text-emerald-400 font-bold">HR DASHBOARD</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[url('/texture/halftone.svg')] opacity-10" />
    </section>
  );
}
