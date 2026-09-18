// components/assistant-ui/HRAgentThread.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, User, Bot, FileText, ArrowRight, CornerDownLeft, Play, Terminal } from 'lucide-react';
import TopSessionBar from './TopSessionBar';
import ReasoningBlock from './ReasoningBlock';
import TerminalExecutionBlock from './TerminalExecutionBlock';
import ToolCallBlock from './ToolCallBlock';
import { AgentSessionState, AgentWorkItem, AssistantMessageItem } from './types';

interface HRAgentThreadProps {
  session: AgentSessionState;
  candidateName: string;
  roleTitle: string;
  repoUrl?: string;
  isStreaming?: boolean;
  onRunEvaluation?: (instructions?: string) => Promise<void> | void;
  onOpenReport?: () => void;
}

export default function HRAgentThread({
  session,
  candidateName,
  roleTitle,
  repoUrl,
  isStreaming = false,
  onRunEvaluation,
  onOpenReport,
}: HRAgentThreadProps) {
  const [messages, setMessages] = useState<AssistantMessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterPills = [
    'Audit test coverage and identify gaps',
    'Run security & dependency vulnerability audit',
    'Evaluate SOLID architecture modularity',
    'Generate targeted technical interview questions',
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, session.turns]);

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputValue.trim();
    if (!text || isStreaming) return;

    const userMessage: AssistantMessageItem = {
      id: `user-${Date.now()}`,
      type: 'message',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    if (onRunEvaluation) {
      await onRunEvaluation(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-black border border-white/15 text-white font-sans overflow-hidden">
      {/* Top Session Telemetry Bar */}
      <TopSessionBar session={session} />

      {/* Main Stream & Chat Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {/* Live Evaluation Trigger Header Card */}
        <div className="border-2 border-primary bg-primary/5 p-4 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_0px_rgba(255,106,0,0.8)]">
          <div>
            <div className="font-bold text-white uppercase flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <span>LIVE AGENT REPOSITORY EVALUATION (/api/agents/evaluate)</span>
            </div>
            <div className="text-[11px] text-white/70 mt-1 flex items-center gap-2">
              <span>Target:</span>
              <span className="text-primary font-bold">{repoUrl || 'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onRunEvaluation?.()}
            disabled={isStreaming}
            className={`px-4 py-2 font-mono font-bold text-xs uppercase transition flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] ${
              isStreaming
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-primary text-black hover:bg-white'
            }`}
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>STREAMING EVALUATION...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>RUN LIVE AGENT EVALUATION ▶</span>
              </>
            )}
          </button>
        </div>

        {/* Intro Goal Pill */}
        <div className="border border-white/15 bg-white/[0.02] p-3 text-white/60 font-mono text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>
              EVALUATING CANDIDATE: <strong className="text-white font-bold">{candidateName.toUpperCase()}</strong>
            </span>
            <span className="text-white/30">·</span>
            <span>ROLE: <strong className="text-primary font-bold">{roleTitle.toUpperCase()}</strong></span>
          </div>
          <span className="text-white/30">SESSION: {session.sessionId.slice(0, 18)}...</span>
        </div>

        {/* Replay Background Audit Turns */}
        {session.turns.map((turn) => (
          <div key={turn.id} className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider pb-1 border-b border-white/10">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span>// AUTOMATED BACKGROUND REPOSITORY AUDIT</span>
            </div>

            {turn.items.map((item) => {
              if (item.type === 'reasoning') {
                return <ReasoningBlock key={item.id} item={item} defaultExpanded={false} />;
              }
              if (item.type === 'tool_call') {
                return <ToolCallBlock key={item.id} item={item} />;
              }
              if (item.type === 'command_execution') {
                return <TerminalExecutionBlock key={item.id} item={item} />;
              }
              if (item.type === 'message' && item.role === 'assistant') {
                return (
                  <div key={item.id} className="p-4 border border-white/20 bg-white/[0.02] rounded-sharp font-sans text-xs leading-relaxed text-white/90">
                    <div className="font-mono text-[10px] text-primary uppercase font-bold mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>EXECUTIVE AUDIT SUMMARY</span>
                    </div>
                    <div className="whitespace-pre-wrap">{item.content}</div>

                    {/* Quick Link to open the Report */}
                    {onOpenReport && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-white/50">Full evidence report published (14.7 KB)</span>
                        <button
                          type="button"
                          onClick={onOpenReport}
                          className="text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Open Live Markdown Report →</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}

        {/* Dynamic Follow-Up Messages */}
        {messages.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-wider">
              <span>// INTERACTIVE HR COPILOT SESSION</span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-primary text-black flex items-center justify-center font-bold text-xs shrink-0 rounded-sharp">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-sharp ${
                    msg.role === 'user'
                      ? 'bg-primary text-black font-sans text-xs font-semibold shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                      : 'bg-white/[0.03] border border-white/20 text-white font-sans text-xs leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 rounded-sharp">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Streaming Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-2.5 p-3 bg-white/[0.02] border border-white/10 font-mono text-xs text-white/60">
            <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
            <span>Agent evaluating candidate repository and streaming live telemetry...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-4 py-2 bg-black border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono text-white/40 uppercase shrink-0">SUGGESTIONS:</span>
        {starterPills.map((pill, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(pill)}
            disabled={isStreaming}
            className="px-2.5 py-1 bg-white/[0.03] hover:bg-primary/20 border border-white/15 hover:border-primary text-white/80 hover:text-white text-[11px] font-mono whitespace-nowrap transition-colors rounded-sharp flex items-center gap-1 shrink-0"
          >
            <span>{pill}</span>
          </button>
        ))}
      </div>

      {/* Interactive Composer */}
      <div className="p-3 bg-black border-t border-white/15">
        <div className="relative flex items-center bg-white/[0.03] border border-white/20 focus-within:border-primary transition-colors">
          <span className="pl-3 font-mono text-xs text-primary font-bold select-none">
            &gt;
          </span>
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask agent about tests, code smells, architecture, or interview questions..."
            rows={1}
            disabled={isStreaming}
            className="w-full bg-transparent text-white placeholder-white/40 px-3 py-2.5 font-mono text-xs focus:outline-none resize-none"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isStreaming}
            className="mr-2 px-3 py-1.5 bg-primary text-black font-mono font-bold text-xs uppercase disabled:opacity-40 hover:bg-primary/90 transition shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1"
          >
            <span>SEND</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
        <div className="flex justify-between text-[10px] font-mono text-white/40 mt-1.5 px-1">
          <span>Press Enter to send · Shift+Enter for newline</span>
          <span className="text-emerald-400">Agent Session Grounded in Cloned Repo</span>
        </div>
      </div>
    </div>
  );
}
