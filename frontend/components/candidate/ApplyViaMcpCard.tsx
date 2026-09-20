'use client';

import { useState } from 'react';
import { Server, Copy, Check, ExternalLink, Cpu, Terminal, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ApplyViaMcpCardProps {
  jobId?: string;
  jobTitle?: string;
}

export const REAL_MCP_URL = 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp';

export default function ApplyViaMcpCard({ jobId, jobTitle }: ApplyViaMcpCardProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        'hiring-agent': {
          url: REAL_MCP_URL,
        },
      },
    },
    null,
    2
  );

  const agentPrompt = jobId
    ? `Connect to the hiring MCP server at ${REAL_MCP_URL}. Inspect the requirements for position "${jobTitle || jobId}" (ID: ${jobId}), compile my verified GitHub projects and evidence passport, and apply to the role autonomously.`
    : `Connect to the hiring MCP server at ${REAL_MCP_URL}. Query all active job openings, analyze the requirements against my verified credentials, and submit my candidate application to the best matching role.`;

  const copyToClipboard = async (text: string, setter: (val: boolean) => void) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setter(true);
      setTimeout(() => setter(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="border-2 border-white bg-black p-6 md:p-10 font-mono relative shadow-[10px_10px_0px_0px_rgba(255,106,0,1)] my-8">
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/40 text-primary">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>AI-NATIVE HIRING · MODEL CONTEXT PROTOCOL (MCP)</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-white mt-1 uppercase">
              Apply as Candidate via MCP Server
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-white/60 bg-white/[0.03] border border-white/10 px-3 py-1.5">
          <span className="text-emerald-400 font-bold">● ONLINE</span>
          <span>AWS Lambda · ap-south-1</span>
        </div>
      </div>

      {/* Subtitle / Explanation */}
      <p className="font-sans text-sm text-white/70 leading-relaxed max-w-3xl mb-8">
        In this AI-native hiring platform, candidates do not fill out long manual forms. Instead, your personal AI agent (Claude, Cursor, Gemini, or custom script) connects directly to the company's live MCP server, queries job rubrics, and submits your verified evidence passport autonomously.
      </p>

      {/* ========================================================================= */}
      {/* CENTERPIECE: Live MCP Link + Centered Copy Button */}
      {/* ========================================================================= */}
      <div className="border-2 border-primary/50 bg-gradient-to-b from-primary/10 via-black to-black p-6 md:p-8 text-center my-6 relative overflow-hidden">
        <div className="absolute top-2 right-3 text-[10px] text-primary uppercase font-bold tracking-widest">
          // Official Production Endpoint
        </div>

        <span className="font-mono text-xs uppercase tracking-widest text-white/60 block mb-2">
          LIVE MCP SERVER ENDPOINT
        </span>

        {/* Clickable URL */}
        <div className="mb-6">
          <a
            href={REAL_MCP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono text-base md:text-lg lg:text-xl font-bold text-primary hover:text-white transition-colors break-all bg-black/60 px-4 py-2 border border-white/20 hover:border-primary"
            title="Open MCP Endpoint in browser"
          >
            <Server className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{REAL_MCP_URL}</span>
            <ExternalLink className="w-4 h-4 text-white/50 shrink-0" />
          </a>
        </div>

        {/* Centered Big Action Copy Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => copyToClipboard(REAL_MCP_URL, setCopiedUrl)}
            className={`px-8 py-4 font-mono text-xs md:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] ${
              copiedUrl
                ? 'bg-emerald-400 text-black border-2 border-emerald-400'
                : 'bg-primary text-black hover:bg-primary/90 border-2 border-primary'
            }`}
          >
            {copiedUrl ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>COPY MCP SERVER LINK</span>
              </>
            )}
          </button>

          <a
            href={REAL_MCP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 border border-white/30 hover:border-white text-white font-mono text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 bg-white/[0.02]"
          >
            <span>TEST ENDPOINT</span>
            <ExternalLink className="w-4 h-4 text-white/60" />
          </a>
        </div>

        <p className="text-[11px] text-white/50 mt-4 font-sans">
          Compatible with Model Context Protocol (MCP) clients: Claude Desktop, Cursor, Gemini CLI, and SDK-driven agents.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* INSTRUCTIONS TO APPLY VIA MCP SERVER */}
      {/* ========================================================================= */}
      <div className="mt-10 pt-8 border-t border-white/15">
        <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-wider mb-6">
          <Terminal className="w-4 h-4 text-primary" />
          <span>INSTRUCTIONS: HOW TO APPLY USING THE MCP SERVER IN AI-NATIVE HIRING</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Step 1 */}
          <div className="border border-white/15 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-primary font-bold text-xs">STEP 01</span>
              <span className="text-[10px] text-white/40 uppercase">Agent Setup</span>
            </div>
            <h4 className="font-bold text-white text-xs uppercase mb-2">
              Configure Your Candidate AI Agent
            </h4>
            <p className="font-sans text-xs text-white/70 leading-relaxed mb-3">
              Add our server to your Claude Desktop config (<code className="text-primary">claude_desktop_config.json</code>) or Cursor MCP settings.
            </p>
            <div className="relative bg-black border border-white/15 p-3 text-[11px]">
              <pre className="text-white/80 overflow-x-auto font-mono">
                {mcpConfigJson}
              </pre>
              <button
                onClick={() => copyToClipboard(mcpConfigJson, setCopiedConfig)}
                className="mt-2 text-[10px] uppercase font-bold text-primary hover:text-white flex items-center gap-1.5 transition"
              >
                {copiedConfig ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">CONFIG COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Config JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border border-white/15 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-primary font-bold text-xs">STEP 02</span>
              <span className="text-[10px] text-white/40 uppercase">Discovery</span>
            </div>
            <h4 className="font-bold text-white text-xs uppercase mb-2">
              Agent Queries Live Requisitions
            </h4>
            <p className="font-sans text-xs text-white/70 leading-relaxed mb-3">
              Your agent calls <code className="text-primary">list_open_jobs</code> to scan open positions and retrieves evaluation criteria via <code className="text-primary">get_job_requirements</code>.
            </p>
            <div className="bg-black border border-white/15 p-3 space-y-1 text-[11px] text-white/70 font-mono">
              <div className="text-emerald-400 font-bold">// Available Protocol Tools:</div>
              <div>• <span className="text-white">list_open_jobs</span> - Fetch all active openings</div>
              <div>• <span className="text-white">get_job_requirements</span> - Fetch rubric & skills</div>
              <div>• <span className="text-white">verify_candidate_evidence</span> - Test repo proofs</div>
              <div>• <span className="text-white">apply_to_job</span> - Transmit passport payload</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border border-white/15 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-primary font-bold text-xs">STEP 03</span>
              <span className="text-[10px] text-white/40 uppercase">Evidence Graph</span>
            </div>
            <h4 className="font-bold text-white text-xs uppercase mb-2">
              Compile Verified Evidence Passport
            </h4>
            <p className="font-sans text-xs text-white/70 leading-relaxed mb-2">
              Your agent compiles your GitHub repository URLs, technical writeups, and project architecture into an immutable evidence graph.
            </p>
            <div className="p-3 bg-black border border-white/10 text-[11px] text-white/60 space-y-1">
              <div>✓ Public Git commits verified</div>
              <div>✓ Architecture & design evidence mapped</div>
              <div>✓ Real code verified without manual resumes</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border border-white/15 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-primary font-bold text-xs">STEP 04</span>
              <span className="text-[10px] text-white/40 uppercase">Autonomous Apply</span>
            </div>
            <h4 className="font-bold text-white text-xs uppercase mb-2">
              Execute Application Delegation
            </h4>
            <p className="font-sans text-xs text-white/70 leading-relaxed mb-3">
              Give your agent the application prompt below. It will execute <code className="text-primary">apply_to_job</code> to register your submission.
            </p>
            <div className="relative bg-black border border-white/15 p-3 text-[11px]">
              <p className="text-white/80 font-sans italic text-[11px] line-clamp-3">
                "{agentPrompt}"
              </p>
              <button
                onClick={() => copyToClipboard(agentPrompt, setCopiedPrompt)}
                className="mt-2 text-[10px] uppercase font-bold text-primary hover:text-white flex items-center gap-1.5 transition"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">PROMPT COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Agent Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation note */}
        <div className="bg-primary/5 border border-primary/30 p-4 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="font-sans text-white/80">
            <strong className="text-white font-mono uppercase tracking-wider block mb-1">
              Secure AWS Docker Sandbox Evaluation:
            </strong>
            Once your candidate agent invokes <code className="text-primary font-mono">apply_to_job</code>, an isolated AWS Lambda workflow orchestrates a Docker container to analyze the evidence. Telemetry is saved to S3 and your verified profile is surfaced to the hiring team.
          </div>
        </div>
      </div>
    </div>
  );
}
