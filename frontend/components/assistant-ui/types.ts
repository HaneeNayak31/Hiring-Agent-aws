// components/assistant-ui/types.ts

export type SandboxStatus = 'pending' | 'ready' | 'connected' | 'disconnected' | 'failed';

export interface AgentEnvironmentState {
  id: string | null;
  status: SandboxStatus;
  path: string;
  error?: string | null;
}

export interface AgentUsageStats {
  inputTokens: number;
  reasoningTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface SubagentInfo {
  id: string;
  name: string;
  role: string;
  parent_agent?: string | null;
  status: 'in_progress' | 'completed' | 'failed';
  color?: string; // 'amber' | 'sky' | 'violet' | 'emerald' | string
}

export type ItemType =
  | 'reasoning'
  | 'command_execution'
  | 'shell_call'
  | 'tool_call'
  | 'message'
  | 'agent_message'
  | 'multi_agent_call'
  | 'mcp_call'
  | 'artifact';

export interface ReasoningItem {
  id: string;
  agent?: string;
  type: 'reasoning';
  title?: string;
  summary: string;
  content?: string;
  duration?: string;
  duration_ms?: number;
  isCollapsed?: boolean;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string | number;
}

export interface CommandExecutionItem {
  id: string;
  agent?: string;
  type: 'command_execution' | 'shell_call';
  command: string;
  cwd?: string;
  output?: string;
  stdout?: string;
  stderr?: string;
  exitCode?: number | null;
  exit_code?: number | null;
  durationMs?: number | null;
  duration_ms?: number | null;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string | number;
}

export type ShellCallItem = CommandExecutionItem;

export interface ToolCallItem {
  id: string;
  call_id?: string;
  agent?: string;
  type: 'tool_call' | 'mcp_call';
  toolName?: string;
  tool_name?: string;
  input?: Record<string, any>;
  arguments?: Record<string, any>;
  output?: Record<string, any> | string | null;
  duration_ms?: number;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string | number;
}

export interface MultiAgentCallItem {
  id: string;
  agent: string;
  type: 'multi_agent_call';
  action: 'spawn_agent' | 'send_message' | 'delegate' | string;
  target_agent?: string;
  target_agent_name?: string;
  subagent?: string;
  instructions?: string;
  message?: any;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string | number;
}

export interface AgentMessageItem {
  id: string;
  agent?: string;
  from_agent?: string;
  to_agent?: string;
  author?: string;
  author_name?: string;
  recipient?: string;
  recipient_name?: string;
  type: 'agent_message';
  content: string;
  timestamp?: string | number;
}

export interface AssistantMessageItem {
  id: string;
  agent?: string;
  type: 'message';
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: string | number;
}

export interface ArtifactItem {
  id: string;
  type: 'artifact';
  filename: string;
  downloadUrl: string;
  sizeBytes?: number;
  timestamp?: string | number;
}

export type AgentWorkItem =
  | ReasoningItem
  | CommandExecutionItem
  | ToolCallItem
  | MultiAgentCallItem
  | AgentMessageItem
  | AssistantMessageItem
  | ArtifactItem;

export interface AgentTurnState {
  id: string;
  turnNumber: number;
  status: 'in_progress' | 'completed' | 'failed';
  items: AgentWorkItem[];
  usage?: AgentUsageStats;
}

export interface AgentTranscript {
  session_id: string;
  application_id?: string;
  repo_url?: string;
  model: string;
  status: string;
  start_time?: number;
  end_time?: number;
  duration_ms?: number;
  usage: {
    input_tokens: number;
    output_tokens: number;
    reasoning_tokens?: number;
    total_tokens: number;
  };
  agents: SubagentInfo[];
  items: AgentWorkItem[];
}

export interface AgentSessionState {
  sessionId: string;
  status: 'idle' | 'in_progress' | 'failed';
  environment: AgentEnvironmentState;
  model: string;
  reasoningEffort: string;
  turns: AgentTurnState[];
  usage: AgentUsageStats;
  reportMarkdown?: string;
  reportDownloadUrl?: string;
  transcript?: AgentTranscript | null;
}

