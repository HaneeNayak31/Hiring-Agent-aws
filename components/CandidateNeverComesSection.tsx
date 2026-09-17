// components/CandidateNeverComesSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Cpu, ArrowDown, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

const externalAgents = [
  { name: 'CHATGPT', provider: 'OpenAI Agent Protocol', icon: '🤖' },
  { name: 'CLAUDE CODE', provider: 'Anthropic Agent SDK', icon: '⚡' },
  { name: 'GEMINI AGENT', provider: 'Google Agent Protocol', icon: '🌐' },
];

export default function CandidateNeverComesSection() {
  return (
    <section className="bg-white text-black py-28 px-6 border-b border-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-3 font-bold">
            // Fundamental Differentiator
          </span>
          <h2 className="font-bold text-4xl md:text-7xl tracking-tighter uppercase leading-[0.95] mb-6">
            THE CANDIDATE
            <br />
            <span className="text-primary">NEVER COMES HERE.</span>
          </h2>
          <p className="text-black/70 text-lg md:text-xl font-sans max-w-2xl leading-relaxed">
            Candidates do not create another account, learn another portal, or fill out repetitive application forms. Their existing AI assistant does the work.
          </p>
        </div>

        {/* 3 Anti-Pattern Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 font-mono text-xs">
          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <XCircle className="w-4 h-4" />
              <span>NO JOB BOARDS</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              Candidates don&apos;t scroll through endless listings or manually filter tags.
            </p>
          </div>

          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <XCircle className="w-4 h-4" />
              <span>NO APPLICATION FORMS</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              Zero 50-field work history forms or uploaded PDF parsers that break.
            </p>
          </div>

          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
              <XCircle className="w-4 h-4" />
              <span>NO DASHBOARD LOGINS</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              No candidate-facing candidate accounts or passwords to manage.
            </p>
          </div>
        </div>

        {/* Diagram Flow: External Agents -> MCP -> Your Company */}
        <div className="border-2 border-black bg-black text-white p-8 md:p-12 font-mono shadow-[10px_10px_0px_0px_rgba(255,106,0,1)]">
          <div className="text-center mb-10">
            <span className="px-3 py-1 bg-primary text-black font-bold text-xs uppercase tracking-widest">
              EXTERNAL AI AGENT PROTOCOL ARCHITECTURE
            </span>
          </div>

          {/* Row 1: External AI Agents */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {externalAgents.map((agent, idx) => (
              <div
                key={idx}
                className="border border-white/20 bg-white/[0.03] p-5 text-center hover:border-primary transition-colors"
              >
                <div className="text-2xl mb-2">{agent.icon}</div>
                <div className="font-bold text-sm text-white mb-1">{agent.name}</div>
                <div className="text-[10px] text-white/50">{agent.provider}</div>
              </div>
            ))}
          </div>

          {/* Connecting Arrows */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest bg-primary/10 border border-primary/40 px-4 py-2">
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span>MODEL CONTEXT PROTOCOL (MCP) INTERFACE</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          {/* Row 2: Hiring MCP Server */}
          <div className="border border-white/30 bg-white/10 p-6 text-center max-w-xl mx-auto mb-8">
            <div className="text-xs text-primary font-bold uppercase mb-1">COMPANY HIRING MCP SERVER</div>
            <div className="text-sm font-bold text-white font-mono">mcp.company.example/hiring</div>
            <div className="text-[11px] text-white/60 font-sans mt-2">
              Exposes capability endpoints: search_jobs, get_job_requirements, apply_to_job
            </div>
          </div>

          {/* Connecting Arrow */}
          <div className="flex justify-center mb-8">
            <div className="h-8 w-px bg-primary" />
          </div>

          {/* Row 3: Company Hiring Control Room */}
          <div className="border-2 border-primary bg-primary/20 p-6 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm uppercase mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>YOUR COMPANY HIRING CONTROL ROOM</span>
            </div>
            <p className="text-xs text-white/80 font-sans">
              HR and hiring managers receive pre-verified candidate reports, evidence graphs, and interview briefing dossiers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
