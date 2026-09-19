'use client';

import { motion } from 'framer-motion';
import { mockMCPTools } from '@/data/mockData';
import { Server, Terminal, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MCPInfrastructureSection() {
  return (
    <section className="bg-black text-white py-28 px-6 border-b border-white/15 relative font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-3 font-bold">
            // Developer Protocol Layer
          </span>
          <h2 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-none mb-6">
            YOUR JOBS. YOUR RULES.
            <br />
            <span className="text-primary">AGENT-ACCESSIBLE.</span>
          </h2>
          <p className="text-white/70 text-lg font-sans max-w-2xl">
            Expose standardized Model Context Protocol (MCP) endpoints so external AI assistants can query open requisitions, fetch criteria, and submit verified candidate reports.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {mockMCPTools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="border border-white/20 bg-white/[0.02] p-6 hover:border-primary/60 transition-colors"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>{tool.name}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {tool.callsToday} CALLS TODAY
                </span>
              </div>

              <p className="text-xs text-white/70 font-sans mb-4 leading-relaxed">
                {tool.description}
              </p>

              <div className="space-y-2 text-[11px] bg-black p-3 border border-white/10">
                <div>
                  <span className="text-white/40">INPUT PARAMS: </span>
                  <span className="text-white">{tool.inputParams.join(', ')}</span>
                </div>
                <div>
                  <span className="text-white/40">OUTPUT FIELDS: </span>
                  <span className="text-primary">{tool.outputFields.join(', ')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-white/10 pt-8">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Server className="w-4 h-4 text-primary" />
            <span>SPECIFICATION: MCP v1.4 PROTOCOL DIRECTORY</span>
          </div>

          <Link
            href="/company/mcp"
            className="px-6 py-3 border border-white/30 text-white font-bold text-xs uppercase hover:border-primary hover:text-primary transition flex items-center gap-2"
          >
            Inspect Company MCP Server
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
