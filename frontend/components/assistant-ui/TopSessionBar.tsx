// components/assistant-ui/TopSessionBar.tsx
'use client';

import { Terminal, Cpu, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { AgentSessionState } from './types';

interface TopSessionBarProps {
  session: AgentSessionState;
}

export default function TopSessionBar({ session }: TopSessionBarProps) {
  const isConnected = session.environment.status === 'connected';

  return (
    <div className="bg-black border-b border-white/15 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] select-none">
      {/* Left: Container Sandbox Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${isConnected
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
              : 'bg-amber-400'
              }`}
          />
          <span className="text-white/40 uppercase">SANDBOX:</span>
          <span className="text-white font-bold tracking-tight">
            {isConnected ? `CONNECTED (${session.environment.path})` : session.environment.status.toUpperCase()}
          </span>
        </div>

        {/* Model Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/[0.03] border border-white/10">
          <Cpu className="w-3 h-3 text-primary" />
          <span className="text-white/40 uppercase">MODEL:</span>
          <span className="text-primary font-bold">{session.model}</span>
          <span className="text-white/30 text-[10px]">({session.reasoningEffort} effort)</span>
        </div>
      </div>

      {/* Right: Token Telemetry */}
      <div className="flex items-center gap-4 text-white/50 text-[10px]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>TOKENS:</span>
          <span className="text-white font-bold">{session.usage.totalTokens.toLocaleString()}</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-white/40">
          <span>IN: <strong className="text-white/70">{session.usage.inputTokens}</strong></span>
          <span>·</span>
          <span>REASONING: <strong className="text-amber-400">{session.usage.reasoningTokens}</strong></span>
          <span>·</span>
          <span>OUT: <strong className="text-white/70">{session.usage.outputTokens}</strong></span>
        </div>
      </div>
    </div>
  );
}
