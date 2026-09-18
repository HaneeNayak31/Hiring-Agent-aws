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

export type ItemType = 'reasoning' | 'command_execution' | 'tool_call' | 'message' | 'mcp_call' | 'artifact';

export interface ReasoningItem {
  id: string;
  type: 'reasoning';
  title: string;
  summary: string;
  duration?: string;
  isCollapsed?: boolean;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface CommandExecutionItem {
  id: string;
  type: 'command_execution';
  command: string;
  cwd: string;
  output: string;
  exitCode?: number | null;
  durationMs?: number | null;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface ToolCallItem {
  id: string;
  type: 'tool_call';
  toolName: string;
  input: Record<string, any>;
  output?: Record<string, any> | string | null;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp?: string;
}

export interface AssistantMessageItem {
  id: string;
  type: 'message';
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: string;
}

export interface ArtifactItem {
  id: string;
  type: 'artifact';
  filename: string;
  downloadUrl: string;
  sizeBytes?: number;
  timestamp?: string;
}

export type AgentWorkItem =
  | ReasoningItem
  | CommandExecutionItem
  | ToolCallItem
  | AssistantMessageItem
  | ArtifactItem;

export interface AgentTurnState {
  id: string;
  turnNumber: number;
  status: 'in_progress' | 'completed' | 'failed';
  items: AgentWorkItem[];
  usage?: AgentUsageStats;
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
}
