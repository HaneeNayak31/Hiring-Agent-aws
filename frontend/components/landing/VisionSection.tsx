'use client';

import { motion } from 'framer-motion';
import { Cpu, Server, ShieldCheck, Zap } from 'lucide-react';

const companies = [
  { name: 'PRODUCTION', role: 'Staff Infrastructure', fit: '96%', mcp: 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp' },
  { name: 'AWS HIRING', role: 'Senior Systems Engineer', fit: '92%', mcp: 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp' },
  { name: 'ENTERPRISE', role: 'Frontend Architect', fit: '89%', mcp: 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp' },
];

export default function VisionSection() {
  return (
    <section className="bg-black text-white py-28 px-6 border-b border-white/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-3">
            // Network Topology
          </span>
          <h2 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-tight mb-6">
            ONE AGENT.
            <br />
            EVERY HIRING SERVER.
          </h2>
          <p className="text-white/60 text-lg font-sans">
            Your personal AI assistant connects via standardized Model Context Protocol (MCP) servers directly to company hiring engines.
          </p>
        </div>

        <div className="relative border border-white/15 bg-white/[0.02] p-8 md:p-12 font-mono">
          <div className="flex flex-col items-center mb-12">
            <div className="px-6 py-2 border border-white/30 bg-black text-xs uppercase tracking-widest text-white/80 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CANDIDATE: HANEE NAYAK
            </div>
            <div className="px-8 py-3 border-2 border-primary bg-primary/10 text-primary font-bold text-sm tracking-wider uppercase flex items-center gap-3 shadow-[0_0_25px_rgba(255,106,0,0.15)]">
              <Cpu className="w-4 h-4 text-primary" />
              CANDIDATE AI AGENT ACTIVE
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-primary to-white/20 my-2" />
          </div>

          <div className="text-center mb-10">
            <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] uppercase tracking-widest border border-white/10">
              HIRING MCP PROTOCOL DIRECTORY
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {companies.map((comp, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                viewport={{ once: true }}
                className="border border-white/15 bg-black p-6 hover:border-primary/60 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <span className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                    {comp.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 font-mono">
                    FIT {comp.fit}
                  </span>
                </div>

                <div className="text-xs text-white/70 font-sans font-medium mb-3">
                  {comp.role}
                </div>

                <div className="text-[11px] text-white/40 flex items-center gap-1.5 font-mono bg-white/[0.04] p-2 border border-white/5">
                  <Server className="w-3 h-3 text-white/40" />
                  {comp.mcp}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/50 gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Real-time capability evaluation & evidence streaming</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>MCP Protocol v1.4 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
