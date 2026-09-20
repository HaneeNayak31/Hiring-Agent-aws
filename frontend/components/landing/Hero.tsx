'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Cpu, Server, CheckCircle2, ArrowRight, GitBranch, Activity, ShieldCheck, Terminal, Layers } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-black text-white py-24 md:py-32 overflow-hidden relative border-b border-white/15">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center px-6">
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-widest px-3.5 py-1.5 bg-primary/10 border border-primary/30 mb-6 font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>EVIDENCE-FIRST HIRING INFRASTRUCTURE</span>
          </div>

          <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter uppercase mb-6 leading-[0.92]">
            VERIFY
            <br />
            <span className="text-primary">THE WORK</span>
            <br />
            BEHIND THE RESUME.
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl font-sans leading-relaxed">
            An evidence-first hiring platform that lets candidates apply through their AI assistants and gives recruiters repository-backed technical signals before the interview.
          </p>

          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <Link
              href="/company"
              className="px-7 py-4 bg-primary text-black font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2 hover:translate-y-[-2px]"
            >
              Company Control Room
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/candidate/opportunities"
              className="px-7 py-4 bg-white/[0.05] border-2 border-white/30 text-white font-bold uppercase tracking-wider hover:border-emerald-400 hover:text-emerald-400 transition flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Browse Roles & Apply
            </Link>

            <Link
              href="/company/mcp"
              className="px-5 py-4 border border-white/20 text-white/60 font-bold uppercase tracking-wider hover:border-white hover:text-white transition flex items-center gap-2"
            >
              <Server className="w-4 h-4 text-primary" />
              MCP Protocol
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 font-mono text-xs text-white/50">
            <div>
              <div className="text-white font-bold text-lg">AWS Native</div>
              <div>Serverless Evaluation</div>
            </div>
            <div>
              <div className="text-emerald-400 font-bold text-lg">MCP Enabled</div>
              <div>Agentic Applications</div>
            </div>
            <div>
              <div className="text-primary font-bold text-lg">Verified Evidence</div>
              <div>Repository Forensics</div>
            </div>
          </div>
        </motion.div>

        {/* Live Multi-Agent Forensics Simulator Card */}
        <motion.div
          className="lg:col-span-5 relative"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="border-2 border-white bg-black p-6 md:p-8 font-mono relative shadow-[10px_10px_0px_0px_rgba(255,106,0,1)]">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-xs text-white font-bold uppercase tracking-wider">
                  FORENSIC SANDBOX RUNTIME
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* Simulated Live Agent Hierarchy */}
            <div className="space-y-4 text-xs">
              {/* Coordinator */}
              <div className="p-3.5 border border-primary/50 bg-primary/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>COORDINATOR: invoke_agent</span>
                  </div>
                  <span className="text-[10px] text-white/50">gpt-5.6-luna</span>
                </div>
                <div className="text-[11px] text-white/80 font-sans">
                  Orchestrating repository forensics on candidate submission...
                </div>
              </div>

              {/* Subagents Branch */}
              <div className="pl-4 border-l-2 border-white/20 space-y-3">
                {/* Subagent 1: Git Forensics */}
                <div className="p-3 border border-white/20 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>git-forensics-evaluator</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">PASSED</span>
                  </div>
                  <div className="text-[11px] text-white/60 font-sans">
                    38 commits verified. Author divergence 0%. Authentic cadence.
                  </div>
                </div>

                {/* Subagent 2: SOLID Architecture */}
                <div className="p-3 border border-white/20 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <Layers className="w-3.5 h-3.5" />
                      <span>solid-architecture-rubric</span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">94/100</span>
                  </div>
                  <div className="text-[11px] text-white/60 font-sans">
                    Single-responsibility microservices. Clean interface boundaries.
                  </div>
                </div>

                {/* Subagent 3: Flight Recorder */}
                <div className="p-3 border border-white/20 bg-white/[0.02]">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Activity className="w-3.5 h-3.5" />
                      <span>flight-recorder-otlp</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold">STREAMED</span>
                  </div>
                  <div className="text-[11px] text-white/60 font-sans">
                    Captured 14 spans, 52k tokens, tool telemetry to S3.
                  </div>
                </div>
              </div>

              {/* Outcome Output */}
              <div className="p-3 border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CANDIDATE INTELLIGENCE REPORT</span>
                </div>
                <Link
                  href="/company/candidates"
                  className="text-xs text-white underline hover:text-primary transition"
                >
                  View Dossier →
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5" />
    </section>
  );
}
