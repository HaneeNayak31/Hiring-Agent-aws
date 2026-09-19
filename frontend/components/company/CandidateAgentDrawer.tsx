'use client';

import { useState, useEffect } from 'react';
import { X, Bot, FileText, CheckCircle2, ArrowLeft, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import HRAgentThread from '@/components/assistant-ui/HRAgentThread';
import ReportQuickView from '@/components/company/ReportQuickView';
import { useAgentEvaluation } from '@/hooks/useAgentEvaluation';
import { CandidateReport } from '@/data/mockData';

interface CandidateAgentDrawerProps {
  candidate: CandidateReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateAgentDrawer({
  candidate,
  isOpen,
  onClose,
}: CandidateAgentDrawerProps) {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'REPORT'>('CHAT');
  const { sessionState, isStreaming, startEvaluation, loadExistingReport, trace, traceLoading } = useAgentEvaluation();

  const repoUrl =
    (candidate as any)?.repoUrl ||
    'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git';

  const sessionId =
    (candidate as any)?.agentSessionId ||
    'sess_0c4181ca24a096ec006aad2cc93e84819fa385826b6d6ce322';

  useEffect(() => {
    if (!isOpen || !candidate) return;
    const currentCandidate = candidate;

    async function init() {
      await loadExistingReport(sessionId, currentCandidate.name, currentCandidate.role);
    }

    init();

  }, [isOpen, candidate, sessionId, loadExistingReport]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !candidate) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 z-50 w-screen h-screen bg-black flex flex-col overflow-hidden font-sans text-xs"
      >
        <header className="px-6 py-3.5 border-b border-white/20 bg-black flex flex-wrap items-center justify-between gap-4 font-mono select-none shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 border border-white/20 hover:border-primary bg-white/[0.03] hover:bg-primary/10 text-white font-mono text-xs font-bold uppercase transition flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-primary" />
              <span>← EXIT WORKSPACE</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-white/10 text-white/60 text-[9px] rounded font-mono">ESC</kbd>
            </button>

            <div className="h-6 w-px bg-white/15 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary text-black font-bold flex items-center justify-center text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                {candidate.name.split(' ').map((n) => n[0]).join('')}
              </div>

              <div>
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <span>APPLICATION #{candidate.id}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> AUDITED
                  </span>
                </div>
                <h2 className="font-bold text-lg md:text-xl font-sans text-white uppercase tracking-tight flex items-center gap-2">
                  <span>{candidate.name}</span>
                  <span className="text-xs font-mono text-primary font-bold">[{candidate.role}]</span>
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 border border-white/15 px-3 py-1.5 bg-white/[0.02]">
              <span className="text-[9px] text-white/50 uppercase">Repository inspection workspace</span>
            </div>

            <div className="flex bg-white/5 border border-white/15 p-0.5 rounded-sharp">
              <button
                type="button"
                onClick={() => setActiveTab('CHAT')}
                className={`px-4 py-1.5 font-mono text-[11px] font-bold uppercase transition flex items-center gap-2 ${
                  activeTab === 'CHAT'
                    ? 'bg-primary text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AUDIT CHAT</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('REPORT')}
                className={`px-4 py-1.5 font-mono text-[11px] font-bold uppercase transition flex items-center gap-2 ${
                  activeTab === 'REPORT'
                    ? 'bg-primary text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,1)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>REPORT</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => startEvaluation(repoUrl)}
              disabled={isStreaming}
              className="px-3.5 py-1.5 bg-primary text-black font-mono text-[11px] font-bold uppercase transition flex items-center gap-1.5 shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] hover:bg-white disabled:opacity-50"
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>EVALUATING...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>EVALUATE LIVE ▶</span>
                </>
              )}
            </button>

            <Link
              href={`/company/candidates/${candidate.id}`}
              onClick={onClose}
              className="hidden lg:flex px-3.5 py-1.5 bg-white/[0.04] border border-white/20 text-white font-mono text-[11px] font-bold uppercase hover:border-primary hover:text-primary transition items-center gap-1.5"
            >
              <span>FULL DOSSIER →</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-white/20 hover:border-white hover:bg-white/10 text-white/60 hover:text-white transition"
              title="Close Workspace (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-6 bg-black flex flex-col">
          {!sessionState ? (
            <div className="h-full flex flex-col items-center justify-center text-white/40 font-mono text-xs space-y-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin" />
              <span>Connecting to background agent session & loading intelligence report...</span>
            </div>
          ) : (
            <div className="h-full w-full max-w-7xl mx-auto flex flex-col overflow-hidden">
              {activeTab === 'CHAT' ? (
                <div className="h-full w-full flex flex-col overflow-hidden">
                  <HRAgentThread
                    session={sessionState}
                    candidateName={candidate.name}
                    roleTitle={candidate.role}
                    repoUrl={repoUrl}
                    isStreaming={isStreaming}
                    trace={trace}
                    traceLoading={traceLoading}
                    onRunEvaluation={(instructions) => startEvaluation(repoUrl, instructions)}
                    onOpenReport={() => setActiveTab('REPORT')}
                  />
                </div>
              ) : (
                <div className="h-full w-full flex flex-col overflow-hidden">
                  <ReportQuickView
                    sessionId={sessionState.sessionId}
                    markdownContent={sessionState.reportMarkdown || ''}
                    candidateName={candidate.name}
                    roleTitle={candidate.role}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="px-6 py-2.5 bg-black border-t border-white/15 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] select-none shrink-0">
          <div className="text-white/40 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              FULL-SCREEN WORKSPACE ACTIVE
            </span>
            <span className="text-white/20">|</span>
            <span className="text-white/50">CANDIDATE: {candidate.name.toUpperCase()} ({candidate.id})</span>
            <span className="text-white/20 hidden md:inline">|</span>
            <span className="text-white/40 hidden md:inline">PRESS <kbd className="px-1 py-0.5 bg-white/10 text-white/80 rounded text-[9px]">ESC</kbd> OR CLICK EXIT TO RETURN</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/company/candidates/${candidate.id}`}
              onClick={onClose}
              className="text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>View Comprehensive Verified Dossier →</span>
            </Link>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
