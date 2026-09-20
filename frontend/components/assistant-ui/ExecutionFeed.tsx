'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Terminal, Cpu, CheckCircle2, Loader2, Play, RefreshCw, Layers, AlertCircle, FileText } from 'lucide-react';
import { Turn, ReconstructedSessionState } from '@/hooks/agentStateReducer';
import { ThoughtAccordion } from './ThoughtAccordion';
import { TerminalRow } from './TerminalRow';
import { SkillRow } from './SkillRow';
import { MessageBubble } from './MessageBubble';

interface ExecutionFeedProps {
  sessionState: ReconstructedSessionState;
  candidateName?: string;
  roleTitle?: string;
  repoUrl?: string;
  isStreaming?: boolean;
  error?: string | null;
  onRunEvaluation?: (instructions?: string) => void;
  onOpenReport?: () => void;
}

export function ExecutionFeed({
  sessionState,
  candidateName,
  roleTitle,
  repoUrl,
  isStreaming = false,
  error = null,
  onRunEvaluation,
  onOpenReport,
}: ExecutionFeedProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 140;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [sessionState.turns, isStreaming]);

  const turns = sessionState.turns || [];
  const usage = sessionState.usage || { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, totalTokens: 0 };
  const model = sessionState.model || 'gpt-5.6-luna';

  return (
    <div className="flex flex-col h-full w-full bg-black border border-white/15 rounded-lg overflow-hidden font-sans text-xs">
      {/* 1. Header Telemetry & Status Bar (Ported from HR_Agents) */}
      <header className="shrink-0 px-4 py-3 border-b border-white/10 bg-[#09090c] flex flex-wrap items-center justify-between gap-3 font-mono select-none">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-white/5 border border-white/10 text-primary">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase text-xs">
                {candidateName ? `${candidateName} — ` : ''}Execution Feed
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  isStreaming
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isStreaming ? '● In Progress' : '● Completed'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
              <span>{model}</span>
              <span>·</span>
              <span className="text-white/60">sandbox (/workspace)</span>
              {repoUrl && (
                <>
                  <span>·</span>
                  <span className="truncate max-w-[220px] text-white/50">{repoUrl}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Token Usage Telemetry Counters */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 border border-white/10 bg-white/[0.02] px-2.5 py-1 rounded text-[10px]">
            <span className="text-white/40">Tokens:</span>
            <span className="text-white/70">In: {usage.inputTokens.toLocaleString()}</span>
            <span className="text-white/30">|</span>
            <span className="text-white/70">Out: {usage.outputTokens.toLocaleString()}</span>
            <span className="text-white/30">|</span>
            <span className="text-primary font-bold">Reasoning: {usage.reasoningTokens.toLocaleString()}</span>
          </div>

          {sessionState.reportMarkdown && onOpenReport && (
            <button
              type="button"
              onClick={onOpenReport}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-mono text-[11px] font-bold uppercase transition flex items-center gap-1.5 border border-white/20"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Report</span>
            </button>
          )}

          {onRunEvaluation && (
            <button
              type="button"
              onClick={() => onRunEvaluation()}
              disabled={isStreaming}
              className="px-3 py-1.5 bg-primary text-black font-mono text-[11px] font-bold uppercase transition flex items-center gap-1.5 shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] hover:bg-white disabled:opacity-50"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Run Audit</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* 2. Scrollable Execution Feed Stream */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {error && (
          <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-200">Evaluation Notice:</span> {error}
            </div>
          </div>
        )}

        {turns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center font-mono">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 mb-3">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-white mb-1 uppercase">Ready for Evaluation</div>
            <p className="text-xs text-white/40 max-w-sm">
              Click &quot;Run Audit&quot; to execute real-time forensic inspection of candidate code in an isolated container sandbox.
            </p>
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="py-2 border-b border-white/[0.06] last:border-b-0 animate-in fade-in duration-150">
              {turn.items.map((item) => {
                if (item.type === 'reasoning') {
                  if (item.status === 'completed' && (!item.summaryText || typeof item.summaryText !== 'string' || !item.summaryText.trim())) {
                    return null;
                  }
                  return <ThoughtAccordion key={item.id} item={item} />;
                }
                if (item.type === 'command_execution') {
                  return <TerminalRow key={item.id} item={item} />;
                }
                if (item.type === 'tool_call') {
                  return <SkillRow key={item.id} item={item} />;
                }
                if (item.type === 'message') {
                  return <MessageBubble key={item.id} item={item} isStreaming={isStreaming} />;
                }
                return null;
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExecutionFeed;
