// app/company/mcp/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockMCPTools, mockMCPLogs, MCPTool } from '@/data/mockData';
import { useState } from 'react';
import { Server, Terminal, Code, Activity, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyMCPPage() {
  const [selectedTool, setSelectedTool] = useState<MCPTool>(mockMCPTools[0]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <div className="flex items-center gap-3 text-xs text-primary mb-2 font-bold uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COMPANY MODEL CONTEXT PROTOCOL (MCP) SERVER</span>
            </div>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              HIRING MCP INFRASTRUCTURE
            </h1>
          </div>

          <div className="text-xs text-white/50 border border-white/15 p-4 bg-white/[0.02]">
            <div>ENDPOINT: <span className="text-white font-bold">mcp.stripe.com/hiring</span></div>
            <div>STATUS: <span className="text-emerald-400 font-bold">● ONLINE (v1.4)</span></div>
          </div>
        </div>

        {/* SECTION 30: MCP CONNECTIONS STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// ACTIVE AI AGENTS</span>
            <span className="font-bold text-4xl text-primary mt-1 block">24</span>
            <span className="text-white/50 text-[11px] mt-2 block">Claude, ChatGPT, Gemini agents connected</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// MCP REQUESTS TODAY</span>
            <span className="font-bold text-4xl text-white mt-1 block">1,284</span>
            <span className="text-white/50 text-[11px] mt-2 block">Protocol queries & capability evaluations</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// APPLICATIONS VIA AGENTS</span>
            <span className="font-bold text-4xl text-emerald-400 mt-1 block">47</span>
            <span className="text-white/50 text-[11px] mt-2 block">Verified evidence payloads registered</span>
          </div>
        </div>

        {/* SECTION 32: MCP TOOL INSPECTOR */}
        <div className="border-2 border-white bg-black p-8 mb-12 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase text-white tracking-wider">
                EXPOSED MCP TOOLS & CAPABILITY INSPECTOR
              </span>
            </div>
            <span className="text-xs text-white/40">{mockMCPTools.length} CAPABILITIES EXPOSED</span>
          </div>

          {/* Tools Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {mockMCPTools.map((tool) => {
              const isSelected = selectedTool.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-4 border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary text-black font-bold shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                      : 'border-white/20 bg-white/[0.02] text-white hover:border-white/50'
                  }`}
                >
                  <div className="text-xs uppercase mb-1 font-mono">{tool.name}</div>
                  <div className="text-[10px] opacity-70">{tool.callsToday} calls today</div>
                </button>
              );
            })}
          </div>

          {/* Selected Tool Details Inspector */}
          <div className="border border-white/20 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Terminal className="w-5 h-5" />
                <span>tool: {selectedTool.name}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400">
                ENABLED & ACTIVE
              </span>
            </div>

            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {selectedTool.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="border border-white/10 bg-black p-4">
                <span className="text-white/40 block text-[10px] uppercase mb-2">// INPUT PARAMETERS SCHEMA</span>
                <div className="space-y-1 text-white font-mono text-[11px]">
                  {selectedTool.inputParams.map((param, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>{param}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <span className="text-white/40 block text-[10px] uppercase mb-2">// OUTPUT PAYLOAD FIELDS</span>
                <div className="space-y-1 text-emerald-400 font-mono text-[11px]">
                  {selectedTool.outputFields.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 31: TECHNICAL MCP ACTIVITY STREAM */}
        <div className="border border-white/15 bg-black p-8 font-mono">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15">
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase">
              <Activity className="w-4 h-4 text-primary" />
              <span>LIVE MCP TELEMETRY STREAM</span>
            </div>
            <span className="text-xs text-white/40">REAL-TIME EVENTS</span>
          </div>

          <div className="space-y-4">
            {mockMCPLogs.map((log) => (
              <div
                key={log.id}
                className="border-b border-white/10 pb-4 last:border-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 text-xs">
                  <span className="text-white/40 shrink-0">{log.timestamp}</span>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 font-bold shrink-0">
                    {log.toolName}
                  </span>
                  <div>
                    <span className="text-white font-bold">{log.agentName}</span>
                    <span className="text-white/50"> · {log.roleTarget}</span>
                    <p className="text-white/70 font-sans mt-1 text-xs">{log.details}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
