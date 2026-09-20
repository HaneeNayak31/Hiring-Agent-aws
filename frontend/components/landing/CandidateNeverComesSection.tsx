'use client';

import { ArrowDown, CheckCircle2, XCircle } from 'lucide-react';

const externalAgents = [
  { name: 'CHATGPT', provider: 'OpenAI Agent Protocol', icon: '🤖' },
  { name: 'CLAUDE CODE', provider: 'Anthropic Agent SDK', icon: '⚡' },
  { name: 'GEMINI AGENT', provider: 'Google Agent Protocol', icon: '🌐' },
];

export default function CandidateNeverComesSection() {
  return (
    <section id="candidate-never-comes" className="bg-white text-black py-28 px-6 border-b border-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-3 font-bold">
            // Transparent Application Pipelines
          </span>
          <h2 className="font-bold text-4xl md:text-7xl tracking-tighter uppercase leading-[0.95] mb-6">
            DIRECT WEB OR
            <br />
            <span className="text-primary">AI-ASSISTED.</span>
          </h2>
          <p className="text-black/70 text-lg md:text-xl font-sans max-w-2xl leading-relaxed">
            Candidates can apply with their GitHub repository in seconds, or delegate job discovery and application entirely to their external AI assistants (ChatGPT, Claude, Gemini) via standardized Model Context Protocol (MCP) endpoints. The platform runs a live sandbox evaluation in isolated AWS Docker containers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16 font-mono text-xs">
          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>ZERO BLACK-HOLE ATS</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              Every submission triggers live multi-agent sandbox evaluation with real-time status and flight recorder telemetry.
            </p>
          </div>

          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>AUTHENTIC CODE EVIDENCE</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              No tailored resume buzzwords. Real commits, branch histories, and repository architecture prove engineering depth.
            </p>
          </div>

          <div className="border border-black/20 p-6 bg-offWhite/40">
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>AGENT MCP BRIDGE</span>
            </div>
            <p className="text-black/70 font-sans leading-normal">
              Candidates can connect ChatGPT or Claude to discover open roles and apply autonomously on their behalf.
            </p>
          </div>
        </div>

        <div className="border-2 border-black bg-black text-white p-8 md:p-12 font-mono shadow-[10px_10px_0px_0px_rgba(255,106,0,1)]">
          <div className="text-center mb-10">
            <span className="px-3 py-1 bg-primary text-black font-bold text-xs uppercase tracking-widest">
              EXTERNAL AI AGENT PROTOCOL ARCHITECTURE
            </span>
          </div>

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

          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest bg-primary/10 border border-primary/40 px-4 py-2">
              <ArrowDown className="w-4 h-4 animate-bounce" />
              <span>MODEL CONTEXT PROTOCOL (MCP) INTERFACE</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>

          <div className="border border-white/30 bg-white/10 p-6 text-center max-w-xl mx-auto mb-8">
            <div className="text-xs text-primary font-bold uppercase mb-1">COMPANY HIRING MCP SERVER</div>
            <div className="text-sm font-bold text-white font-mono break-all">https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp</div>
            <div className="text-[11px] text-white/60 font-sans mt-2">
              Exposes capability endpoints: search_jobs, get_job_requirements, apply_to_job
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="h-8 w-px bg-primary" />
          </div>

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
