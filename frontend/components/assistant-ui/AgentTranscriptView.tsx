'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Download,
  FileText,
  Loader2,
  MessageSquare,
  Play,
  Search,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
} from 'lucide-react';
import {
  AgentSessionState,
  AgentTranscript,
  AgentWorkItem,
  CommandExecutionItem,
  ReasoningItem,
  MultiAgentCallItem,
  AgentMessageItem,
  ToolCallItem,
  AssistantMessageItem,
  SubagentInfo,
} from './types';

interface AgentTranscriptViewProps {
  session: AgentSessionState;
  candidateName: string;
  roleTitle: string;
  repoUrl?: string;
  isStreaming?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRunEvaluation?: (instructions?: string) => Promise<void> | void;
  onOpenReport?: () => void;
}

type ItemFilter = 'all' | 'reasoning' | 'shell' | 'multi_agent' | 'message';

function humanizeAgent(agentId?: string): string {
  if (!agentId || agentId === 'coordinator') return 'Coordinator';
  return agentId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex h-6 items-center gap-1 rounded border border-white/10 bg-white/[0.02] px-2 text-[10px] font-mono text-white/50 transition hover:border-white/25 hover:text-white"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

// -------------------------------------------------------------
// 1. Collapsible Thinking Component (Subtle Codex Desktop Style)
// -------------------------------------------------------------
function SubtleThinkingBlock({ item }: { item: ReasoningItem }) {
  const [expanded, setExpanded] = useState(item.status === 'in_progress');
  const text = item.content || item.summary || '';
  const durationSec = item.duration_ms
    ? `${(item.duration_ms / 1000).toFixed(1)}s`
    : item.duration || '1.8s';

  return (
    <div className="my-2 select-none">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 py-1 font-mono text-[11px] text-white/40 transition hover:text-white/80 group"
      >
        <ChevronRight
          className={`h-3 w-3 text-white/30 transition-transform duration-150 group-hover:text-white/60 ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        {item.status === 'in_progress' ? (
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        ) : (
          <Sparkles className="h-3 w-3 text-white/30 group-hover:text-primary transition-colors" />
        )}
        <span className="font-medium text-white/50 group-hover:text-white/80">
          Thought for {durationSec}
        </span>
        {!expanded && text && (
          <span className="hidden max-w-md truncate text-white/25 sm:inline">
            · {text.replace(/\n+/g, ' ').slice(0, 80)}...
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-1.5 ml-1.5 border-l border-white/10 pl-3.5 pt-0.5">
          <p className="font-sans text-xs italic leading-relaxed text-white/55 whitespace-pre-wrap">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 2. Terminal Shell Command Execution (Authentic Terminal)
// -------------------------------------------------------------
function TerminalExecutionCard({ item }: { item: CommandExecutionItem }) {
  const [expanded, setExpanded] = useState(true);
  const command = item.command || 'execute';
  const stdout = item.stdout || item.output || '';
  const stderr = item.stderr || '';
  const exitCode = item.exit_code ?? item.exitCode;
  const isFailed = exitCode !== null && exitCode !== undefined && exitCode !== 0;
  const isRunning = item.status === 'in_progress';
  const durationText = item.duration_ms ? `${item.duration_ms}ms` : item.durationMs ? `${item.durationMs}ms` : null;

  return (
    <div className="my-3 overflow-hidden rounded-md border border-white/15 bg-[#09090c] shadow-lg shadow-black/50">
      {/* Mac/Linux Terminal Window Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-white/[0.02] px-3.5 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          {/* Terminal Dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>

          <span className="rounded border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider text-white/70">
            {humanizeAgent(item.agent)}
          </span>

          <span className="truncate font-mono text-[10px] text-white/35 max-w-[140px] sm:max-w-xs">
            {item.cwd || '/workspace'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {durationText && (
            <span className="font-mono text-[10px] text-white/40">{durationText}</span>
          )}

          {isRunning ? (
            <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-300 border border-amber-500/30">
              <Loader2 className="h-2.5 w-2.5 animate-spin" /> RUNNING
            </span>
          ) : isFailed ? (
            <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-red-300 border border-red-500/30">
              EXIT {exitCode}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-300 border border-emerald-500/30">
              EXIT 0
            </span>
          )}

          <CopyButton text={command} label="Copy cmd" />

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
            title={expanded ? 'Collapse output' : 'Expand output'}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>

      {/* Terminal Command Prompt */}
      <div className="flex items-center gap-2 bg-black px-4 py-2.5 font-mono text-[11px] border-b border-white/5">
        <span className="select-none font-bold text-emerald-400">$</span>
        <code className="overflow-x-auto select-all whitespace-pre-wrap break-all font-semibold text-white/90">
          {command}
        </code>
      </div>

      {/* Terminal Output */}
      {expanded && (
        <div className="bg-[#050507] p-4 font-mono text-[11px] leading-5">
          {stdout ? (
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-emerald-300/85">
              {stdout}
            </pre>
          ) : isRunning ? (
            <div className="flex items-center gap-2 italic text-white/30">
              <Loader2 className="h-3 w-3 animate-spin text-primary" /> Executing command in container sandbox...
            </div>
          ) : (
            <span className="italic text-white/25">No standard output returned (command completed silently).</span>
          )}

          {stderr && (
            <div className="mt-3 border-t border-red-500/20 pt-2 text-red-400">
              <div className="mb-1 font-mono text-[9px] font-bold uppercase tracking-wider text-red-400">
                Standard Error:
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-red-300/80">
                {stderr}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 3. Multi-Agent Delegation Card (Subtle System Notice)
// -------------------------------------------------------------
function SubtleDelegationCard({ item }: { item: MultiAgentCallItem }) {
  const targetName = item.target_agent_name || humanizeAgent(item.target_agent || item.subagent);

  return (
    <div className="my-2.5 rounded border border-white/10 bg-white/[0.015] p-3">
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="font-semibold text-white/80">{humanizeAgent(item.agent)}</span>
        <ArrowRight className="h-3 w-3 text-white/30" />
        <span className="text-white/40 text-[10px] uppercase tracking-wider">dispatched</span>
        <ArrowRight className="h-3 w-3 text-white/30" />
        <span className="font-semibold text-white/90">{targetName}</span>
      </div>

      {item.instructions && (
        <div className="mt-2 border-l border-white/10 pl-2.5 font-mono text-[11px] text-white/60">
          {item.instructions}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// 4. Inter-Agent Communication Card (Subtle Quote)
// -------------------------------------------------------------
function SubtleAgentMessageCard({ item }: { item: AgentMessageItem }) {
  const author = item.author || item.agent || item.from_agent || 'subagent';
  const recipient = item.recipient || item.to_agent || 'coordinator';

  return (
    <div className="my-2.5 rounded border border-white/10 bg-white/[0.015] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <MessageSquare className="h-3 w-3 text-white/40" />
          <span className="font-medium text-white/80">{item.author_name || humanizeAgent(author)}</span>
          <span className="text-white/25">→</span>
          <span className="text-white/50">{item.recipient_name || humanizeAgent(recipient)}</span>
        </div>
        <CopyButton text={item.content} />
      </div>

      <div className="border-l-2 border-primary/50 bg-black/40 p-2.5 pl-3">
        <p className="font-sans text-xs leading-relaxed text-white/85">
          {item.content}
        </p>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Assistant Executive Message Card
// -------------------------------------------------------------
function AssistantExecutiveCard({ item }: { item: AssistantMessageItem }) {
  return (
    <div className="my-3 rounded-md border border-white/15 bg-white/[0.02] p-5 shadow-lg shadow-black/40">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-white">
            {humanizeAgent(item.agent)} Executive Findings
          </span>
        </div>
        <CopyButton text={item.content} label="Copy report" />
      </div>

      <div className="prose prose-invert max-w-none font-sans text-xs leading-relaxed text-white/90">
        <pre className="whitespace-pre-wrap font-sans text-xs leading-6 text-white/90">
          {item.content}
        </pre>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Tool / MCP Invocation Card
// -------------------------------------------------------------
function ToolCard({ item }: { item: ToolCallItem }) {
  const [expanded, setExpanded] = useState(false);
  const toolName = item.toolName || item.tool_name || 'tool_call';
  const args = item.input || item.arguments || {};
  const output = item.output;

  return (
    <div className="my-2 rounded border border-white/10 bg-white/[0.015]">
      <div className="flex items-center justify-between px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Wrench className="h-3 w-3 text-white/40" />
          <span className="text-white/80">{toolName}</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-white/40 hover:text-white"
        >
          {expanded ? 'Hide' : 'Inspect'}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/10 bg-black/60 p-3 font-mono text-[10px] space-y-2">
          <div>
            <div className="text-white/30 uppercase text-[9px] mb-1">Arguments:</div>
            <pre className="text-white/70 overflow-x-auto">{JSON.stringify(args, null, 2)}</pre>
          </div>
          {output && (
            <div>
              <div className="text-white/30 uppercase text-[9px] mb-1">Output:</div>
              <pre className="text-emerald-400/80 overflow-x-auto">
                {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Main AgentTranscriptView Component
// -------------------------------------------------------------
export default function AgentTranscriptView({
  session,
  candidateName,
  roleTitle,
  repoUrl,
  isStreaming = false,
  error = null,
  onRetry,
  onRunEvaluation,
  onOpenReport,
}: AgentTranscriptViewProps) {
  const transcript: AgentTranscript | null = session.transcript || null;
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [itemFilter, setItemFilter] = useState<ItemFilter>('all');
  const [search, setSearch] = useState('');

  // Discovered agents
  const agents: SubagentInfo[] = useMemo(() => {
    if (transcript?.agents && transcript.agents.length > 0) {
      return transcript.agents;
    }
    return [
      { id: 'coordinator', name: 'Coordinator', role: 'Lead Evaluator', status: 'completed' },
      { id: 'git-forensics-evaluator', name: 'Git Forensics', role: 'Commit Forensics', status: 'completed' },
      { id: 'solid-architecture-rubric', name: 'SOLID Architecture', role: 'Clean Code Rigor', status: 'completed' },
    ];
  }, [transcript?.agents]);

  // All recorded items
  const allItems: AgentWorkItem[] = useMemo(() => {
    if (transcript?.items && transcript.items.length > 0) {
      return transcript.items;
    }
    return session.turns.flatMap((turn) => turn.items);
  }, [transcript?.items, session.turns]);

  // Filtered items
  const visibleItems = useMemo(() => {
    return allItems.filter((item) => {
      // 1. Filter by Agent
      if (selectedAgent !== 'all') {
        const itemAgent = (item as any).agent || (item as any).author || (item as any).target_agent;
        if (itemAgent && itemAgent.toLowerCase() !== selectedAgent.toLowerCase()) {
          return false;
        }
      }

      // 2. Filter by Item Type
      if (itemFilter !== 'all') {
        if (itemFilter === 'reasoning' && item.type !== 'reasoning') return false;
        if (itemFilter === 'shell' && item.type !== 'shell_call' && item.type !== 'command_execution') return false;
        if (itemFilter === 'multi_agent' && item.type !== 'multi_agent_call' && item.type !== 'agent_message') return false;
        if (itemFilter === 'message' && item.type !== 'message') return false;
      }

      // 3. Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const contentStr = JSON.stringify(item).toLowerCase();
        return contentStr.includes(query);
      }

      return true;
    });
  }, [allItems, selectedAgent, itemFilter, search]);

  const usage = session.usage || { inputTokens: 0, reasoningTokens: 0, outputTokens: 0, totalTokens: 0 };
  const durationMs = transcript?.duration_ms || 45200;
  const durationFormatted = durationMs >= 1000 ? `${(durationMs / 1000).toFixed(1)}s` : `${durationMs}ms`;

  const downloadTranscriptJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(transcript || allItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `agent_transcript_${session.sessionId || 'session'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-sharp border border-white/15 bg-black text-white shadow-2xl">
      {/* ------------------------------------------------------------- */}
      {/* 1. Subtle Header Bar                                          */}
      {/* ------------------------------------------------------------- */}
      <header className="shrink-0 border-b border-white/15 bg-white/[0.02] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 font-mono text-[10px] text-white/40 uppercase tracking-widest">
              <Zap className="h-3 w-3 text-primary" />
              <span>Multi-Agent Session</span>
              <span>·</span>
              <span>{session.model || 'GPT-5.6-Luna'}</span>
            </div>

            <h2 className="truncate text-lg font-semibold tracking-tight">
              Repository inspection activity
            </h2>

            <p className="mt-0.5 truncate font-mono text-xs text-white/45">
              {candidateName} · {roleTitle}
              {repoUrl ? ` · ${repoUrl}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadTranscriptJson}
              className="inline-flex items-center gap-1.5 rounded-sharp border border-white/20 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/70 transition hover:border-white hover:text-white"
              title="Download full transcript JSON"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON
            </button>

            {session.reportMarkdown && onOpenReport && (
              <button
                type="button"
                onClick={onOpenReport}
                className="inline-flex items-center gap-1.5 rounded-sharp border border-white/20 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/80 transition hover:border-white hover:text-white"
              >
                <FileText className="h-3.5 w-3.5 text-primary" /> Open report
              </button>
            )}

            {onRunEvaluation && (
              <button
                type="button"
                onClick={() => onRunEvaluation()}
                disabled={isStreaming}
                className="inline-flex items-center gap-2 rounded-sharp bg-primary px-3.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-white hover:text-black shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Running
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-black" /> Run inspection
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Metrics Strip */}
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-sharp border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-6 text-[11px]">
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Status</div>
            <div className="mt-0.5 font-mono text-[11px] text-emerald-400">
              {isStreaming ? 'Running...' : 'Complete'}
            </div>
          </div>
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Duration</div>
            <div className="mt-0.5 font-mono text-[11px] text-white/80">{durationFormatted}</div>
          </div>
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Input Tokens</div>
            <div className="mt-0.5 font-mono text-[11px] text-white/80">{usage.inputTokens.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Reasoning</div>
            <div className="mt-0.5 font-mono text-[11px] text-white/80">{usage.reasoningTokens.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Output Tokens</div>
            <div className="mt-0.5 font-mono text-[11px] text-white/80">{usage.outputTokens.toLocaleString()}</div>
          </div>
          <div className="bg-[#0a0a0c] px-3 py-2">
            <div className="font-mono text-[9px] uppercase tracking-wider text-white/35">Total Tokens</div>
            <div className="mt-0.5 font-mono text-[11px] text-primary font-bold">{usage.totalTokens.toLocaleString()}</div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. Subtle Subagent Switcher Strip                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/15 bg-black px-4 py-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/30 mr-1 shrink-0">
          Agents:
        </span>

        {/* All Agents button */}
        <button
          type="button"
          onClick={() => setSelectedAgent('all')}
          className={`shrink-0 rounded-sharp px-2.5 py-1 text-[11px] font-medium transition ${
            selectedAgent === 'all'
              ? 'bg-white/15 text-white border border-white/20'
              : 'text-white/50 hover:text-white'
          }`}
        >
          All ({allItems.length})
        </button>

        {/* Individual Agent Tabs */}
        {agents.map((agent) => {
          const count = allItems.filter((i: any) => i.agent === agent.id || i.author === agent.id).length;
          const isSelected = selectedAgent === agent.id;

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgent(agent.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-sharp px-2.5 py-1 text-[11px] font-medium transition ${
                isSelected
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <span>{agent.name}</span>
              {count > 0 && (
                <span className="font-mono text-[9px] text-white/35">
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. Filter Bar & Search                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.01] px-4 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ['all', 'All'],
              ['reasoning', 'Thinking'],
              ['shell', 'Terminal'],
              ['multi_agent', 'Communications'],
              ['message', 'Summary'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setItemFilter(key)}
              className={`rounded-sharp px-2 py-1 text-[10px] font-medium transition ${
                itemFilter === key
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, thoughts..."
            className="w-full rounded-sharp border border-white/15 bg-black py-1 pl-8 pr-3 text-[11px] text-white placeholder:text-white/30 focus:border-primary focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Timeline Stream of Agent Actions                           */}
      {/* ------------------------------------------------------------- */}
      <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5 space-y-3">
        {error && (
          <div className="rounded-sharp border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" /> Agent Evaluation Notice
            </div>
            <p className="mt-1 text-red-200/70">{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 rounded-sharp border border-red-500/40 px-2.5 py-1 text-[10px] text-red-100 hover:bg-red-500/20"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {visibleItems.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <Code2 className="h-7 w-7 text-white/20 mb-2" />
            <p className="text-sm font-medium text-white/60">No activity matching current filter</p>
            <p className="mt-1 text-xs text-white/35">
              Adjust your subagent or item filter above to inspect the recorded execution.
            </p>
          </div>
        ) : (
          visibleItems.map((item, idx) => {
            const itemKey = item.id || `item-${idx}`;

            // 1. Thinking block (Codex Desktop style)
            if (item.type === 'reasoning') {
              return <SubtleThinkingBlock key={itemKey} item={item as ReasoningItem} />;
            }

            // 2. Terminal shell command execution
            if (item.type === 'shell_call' || item.type === 'command_execution') {
              return <TerminalExecutionCard key={itemKey} item={item as CommandExecutionItem} />;
            }

            // 3. Multi-agent delegation
            if (item.type === 'multi_agent_call') {
              return <SubtleDelegationCard key={itemKey} item={item as MultiAgentCallItem} />;
            }

            // 4. Inter-agent communication
            if (item.type === 'agent_message') {
              return <SubtleAgentMessageCard key={itemKey} item={item as AgentMessageItem} />;
            }

            // 5. Tool call
            if (item.type === 'tool_call' || item.type === 'mcp_call') {
              return <ToolCard key={itemKey} item={item as ToolCallItem} />;
            }

            // 6. Assistant executive findings
            if (item.type === 'message') {
              return <AssistantExecutiveCard key={itemKey} item={item as AssistantMessageItem} />;
            }

            return null;
          })
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. Subtle Footer Session Bar                                  */}
      {/* ------------------------------------------------------------- */}
      <footer className="flex shrink-0 items-center justify-between border-t border-white/15 bg-white/[0.02] px-5 py-2 text-[10px] text-white/35 font-mono">
        <div className="flex items-center gap-2">
          <Clock3 className="h-3 w-3" />
          <span>Session: {session.sessionId}</span>
          <span>·</span>
          <span>{allItems.length} recorded operations</span>
        </div>
        <div className="hidden sm:block">
          Managed multi-agent audit via OpenAI Agents API
        </div>
      </footer>
    </div>
  );
}
