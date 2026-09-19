'use client';

import { motion } from 'framer-motion';
import { Terminal, ShieldCheck } from 'lucide-react';
import { CandidateNav } from '@/components/layout';
import { mockAgentEvents } from '@/data/mockData';

export default function AgentActivityPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-primary uppercase tracking-widest mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Autonomous Engine Active
            </div>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase">
              AGENT ACTIVITY LOG
            </h1>
          </div>
          <div className="font-mono text-xs text-white/50 border border-white/10 p-3 bg-white/[0.02]">
            STREAM SPEED: <span className="text-primary font-bold">REAL-TIME (MCP v1.4)</span>
          </div>
        </div>

        <div className="border-2 border-white bg-black p-8 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm text-white uppercase tracking-wider">
                DELEGATED ASSISTANT TRAJECTORY LOG
              </span>
            </div>
            <span className="text-xs text-white/40">{mockAgentEvents.length} EVENTS RECORDED</span>
          </div>

          {mockAgentEvents.length === 0 ? (
            <div className="text-center py-12 text-white/40 text-xs border border-dashed border-white/15">
              No delegated agent events recorded yet. When autonomous candidate evaluations or MCP broadcasts occur, events will stream here.
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:left-[90px] before:top-3 before:bottom-3 before:w-px before:bg-white/20">
              {mockAgentEvents.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start gap-6 relative"
                >
                  <div className="w-[80px] shrink-0 text-right text-xs text-white/40 font-mono pt-0.5">
                    {evt.timestamp}
                  </div>

                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-black shrink-0 relative z-10 mt-1 shadow-[0_0_8px_rgba(255,106,0,0.8)]" />

                  <div className="flex-1 bg-white/[0.03] border border-white/10 p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-primary tracking-wider">
                        [{evt.type}]
                      </span>
                      <span className="text-[10px] text-white/30">PROTOCOL METADATA OK</span>
                    </div>
                    <p className="text-xs text-white/90 font-mono leading-relaxed">
                      {evt.message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-white/20 flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All agent operations cryptographically signed with candidate key</span>
            </div>
            <span className="text-primary font-bold">STATUS: IDLE (WAITING FOR MCP BROADCAST)</span>
          </div>
        </div>
      </main>
    </div>
  );
}
