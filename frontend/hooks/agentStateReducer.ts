/**
 * agentStateReducer.ts
 *
 * Deterministic event reducer ported directly from HR_Agents/agents_ui/src/context/AgentContext.jsx.
 * Reconstructs complete turn and session state from raw OpenAI Agents API streaming events
 * to enable instant 0ms rendering for candidate audit reviews.
 */

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface ReasoningItem {
  id: string;
  type: 'reasoning';
  status: 'in_progress' | 'completed';
  thinkingSeconds: number;
  summaryText: string;
  isExpanded: boolean;
}

export function extractSummaryText(summary: any): string {
  if (!summary) return '';
  if (typeof summary === 'string') return summary;
  if (Array.isArray(summary)) {
    for (const item of summary) {
      if (typeof item === 'string' && item.trim()) return item;
      if (item && typeof item === 'object') {
        if (typeof item.text === 'string' && item.text.trim()) return item.text;
        if (typeof item.delta === 'string' && item.delta.trim()) return item.delta;
      }
    }
    return '';
  }
  if (typeof summary === 'object') {
    if (typeof summary.text === 'string') return summary.text;
    if (typeof summary.delta === 'string') return summary.delta;
  }
  return '';
}

export function extractTextContent(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => extractTextContent(item))
      .filter(Boolean)
      .join('\n');
  }
  if (typeof content === 'object') {
    if (typeof content.text === 'string') return content.text;
    if (typeof content.delta === 'string') return content.delta;
    if (typeof content.content === 'string') return content.content;
    if (content.content) return extractTextContent(content.content);
    if (typeof content.value === 'string') return content.value;
    if (content.summary) return extractTextContent(content.summary);
    if (typeof content.message === 'string') return content.message;
  }
  return '';
}

export interface CommandExecutionItem {
  id: string;
  type: 'command_execution';
  status: 'in_progress' | 'completed';
  command: string;
  output: string;
  exitCode: number;
  durationMs: number;
  isDrawerOpen: boolean;
  cwd?: string;
}

export interface ToolCallItem {
  id: string;
  type: 'tool_call';
  toolName: string;
  status: 'in_progress' | 'completed';
  arguments: Record<string, any>;
  result: string;
}

export interface MessageItem {
  id: string;
  type: 'message';
  role: 'user' | 'assistant' | 'system';
  status?: 'in_progress' | 'completed';
  phase?: 'commentary' | 'final_answer' | string;
  text: string;
  repoUrl?: string;
  timestamp?: string;
}

export type TurnItem = ReasoningItem | CommandExecutionItem | ToolCallItem | MessageItem;

export interface Turn {
  id: string;
  status: 'in_progress' | 'completed';
  items: TurnItem[];
}

export interface ReconstructedSessionState {
  sessionId?: string;
  status: string;
  model: string;
  usage: Usage;
  environment: {
    id: string;
    status: string;
    path: string;
  };
  turns: Turn[];
  reportMarkdown?: string;
  reportDownloadUrl?: string;
}

/**
 * Reconstructs complete turn and session state deterministically from an event array.
 * Enables instant 0-millisecond rendering for late-arriving HR reviews.
 */
export function reconstructStateFromEvents(
  events: any[] = [],
  meta: Record<string, any> = {}
): ReconstructedSessionState {
  const turns: Turn[] = [];
  const rawUsage = meta?.usage || {};
  let usage: Usage = {
    inputTokens: rawUsage.inputTokens ?? rawUsage.input_tokens ?? 0,
    outputTokens: rawUsage.outputTokens ?? rawUsage.output_tokens ?? 0,
    reasoningTokens: rawUsage.reasoningTokens ?? rawUsage.reasoning_tokens ?? 0,
    totalTokens: rawUsage.totalTokens ?? rawUsage.total_tokens ?? 0,
  };
  let model = meta?.model || 'gpt-5.6-luna';
  let status = meta?.status || 'completed';
  let envStatus = 'connected';
  let envId = meta?.session_id || 'sandbox_managed';

  for (const event of events) {
    if (!event || !event.type) continue;
    const eventType = event.type;
    const turnId = event.turn_id || event.turn?.id || 'turn_default';

    if (eventType.startsWith('agent.session.environment.')) {
      envStatus = eventType.replace('agent.session.environment.', '');
      if (event.environment?.id) envId = event.environment.id;
    } else if (eventType === 'agent.session.created') {
      if (event.session?.model) model = event.session.model;
    } else if (
      eventType === 'agent.session.turn.created' ||
      eventType === 'agent.session.turn.in_progress'
    ) {
      let turn = turns.find((t) => t.id === turnId);
      if (!turn) {
        turns.push({ id: turnId, status: 'completed', items: [] });
      }
    } else if (eventType === 'agent.session.turn.completed') {
      const turn = turns.find((t) => t.id === turnId);
      if (turn) turn.status = 'completed';
      const u = event.usage || event.turn?.usage;
      if (u) {
        usage = {
          inputTokens: u.input_tokens ?? u.inputTokens ?? usage.inputTokens,
          outputTokens: u.output_tokens ?? u.outputTokens ?? usage.outputTokens,
          reasoningTokens:
            u.output_tokens_details?.reasoning_tokens ??
            u.reasoning_tokens ??
            u.reasoningTokens ??
            usage.reasoningTokens,
          totalTokens: u.total_tokens ?? u.totalTokens ?? usage.totalTokens,
        };
      }
    } else if (eventType === 'agent.session.turn.item.added') {
      let turn = turns.find((t) => t.id === turnId);
      if (!turn) {
        turn = { id: turnId, status: 'completed', items: [] };
        turns.push(turn);
      }
      const item = event.item || {};
      const itemId = item.id || `item_${turns.length}_${turn.items.length}`;
      const itemType = item.type;

      if (!turn.items.some((i) => i.id === itemId)) {
        if (itemType === 'reasoning') {
          turn.items.push({
            id: itemId,
            type: 'reasoning',
            status: 'completed',
            thinkingSeconds: 3,
            summaryText: extractSummaryText(item.summary),
            isExpanded: false,
          });
        } else if (itemType === 'command_execution') {
          turn.items.push({
            id: itemId,
            type: 'command_execution',
            status: 'completed',
            command: item.command || '',
            output: item.output || '',
            exitCode: item.exit_code ?? item.exitCode ?? 0,
            durationMs: item.duration_ms ?? item.durationMs ?? 340,
            isDrawerOpen: false,
            cwd: item.cwd || '/workspace',
          });
        } else if (itemType === 'function_call' || itemType === 'mcp_call' || itemType === 'tool_call') {
          turn.items.push({
            id: itemId,
            type: 'tool_call',
            toolName: item.name || item.server_label || item.toolName || 'custom_skill',
            status: 'completed',
            arguments: item.arguments || {},
            result: item.result || item.output || 'completed',
          });
        } else {
          turn.items.push({
            id: itemId,
            type: 'message',
            role: item.role || 'assistant',
            phase: item.phase || (item.role === 'assistant' ? 'final_answer' : 'commentary'),
            text: extractTextContent(item.text || item.content),
            repoUrl: item.repoUrl,
            timestamp: item.timestamp,
          });
        }
      }
    } else if (eventType === 'agent.session.turn.reasoning_summary_part.added') {
      let turn = turns.find((t) => t.id === turnId);
      if (!turn) {
        turn = { id: turnId, status: 'completed', items: [] };
        turns.push(turn);
      }
      const itemId = event.item_id;
      if (itemId && !turn.items.some((i) => i.id === itemId)) {
        turn.items.push({
          id: itemId,
          type: 'reasoning',
          status: 'completed',
          thinkingSeconds: 3,
          summaryText: extractSummaryText(event.part?.text || event.part),
          isExpanded: false,
        });
      }
    } else if (eventType === 'agent.session.turn.reasoning_summary_text.delta') {
      const itemId = event.item_id;
      for (const t of turns) {
        if (t.id === turnId || !turnId) {
          const item = t.items.find(
            (i): i is ReasoningItem => i.type === 'reasoning' && (!itemId || i.id === itemId)
          );
          if (item) {
            item.summaryText = (typeof item.summaryText === 'string' ? item.summaryText : '') + (typeof event.delta === 'string' ? event.delta : extractSummaryText(event.delta));
            break;
          }
        }
      }
    } else if (eventType === 'agent.session.turn.reasoning_summary_text.done') {
      const itemId = event.item_id;
      const text = extractSummaryText(event.text);
      if (text) {
        for (const t of turns) {
          const item = t.items.find(
            (i): i is ReasoningItem => i.type === 'reasoning' && (!itemId || i.id === itemId)
          );
          if (item) {
            item.summaryText = text;
            break;
          }
        }
      }
    } else if (eventType === 'agent.output.command_execution_output.delta') {
      const turn = turns.find((t) => t.id === turnId);
      if (turn) {
        const item = turn.items.find(
          (i): i is CommandExecutionItem =>
            i.type === 'command_execution' && (!event.item_id || i.id === event.item_id)
        );
        if (item) item.output = (item.output || '') + (event.delta || '');
      }
    } else if (eventType === 'agent.session.turn.output_text.delta') {
      const turn = turns.find((t) => t.id === turnId);
      const deltaText = extractTextContent(event.delta);
      if (turn) {
        const lastItem = turn.items[turn.items.length - 1];
        if (lastItem && lastItem.type === 'message') {
          lastItem.text = (typeof lastItem.text === 'string' ? lastItem.text : '') + deltaText;
        } else {
          turn.items.push({
            id: `msg_${turn.items.length}`,
            type: 'message',
            role: 'assistant',
            phase: 'commentary',
            text: deltaText,
          });
        }
      }
    } else if (eventType === 'agent.session.turn.output_text.done') {
      const turn = turns.find((t) => t.id === turnId);
      const textDone = extractTextContent(event.text);
      if (turn && textDone) {
        const lastItem = turn.items[turn.items.length - 1];
        if (lastItem && lastItem.type === 'message') {
          lastItem.text = textDone;
        }
      }
    } else if (eventType === 'agent.session.turn.item.done') {
      const turn = turns.find((t) => t.id === turnId);
      if (turn) {
        const item = event.item || {};
        const target = turn.items.find(
          (i) => i.id === item.id || (!item.id && i.status === 'in_progress')
        );
        if (target) {
          target.status = 'completed';
          if (target.type === 'reasoning') {
            target.isExpanded = false;
            const extracted = extractSummaryText(item.summary);
            if (extracted) {
              target.summaryText = extracted;
            }
          }
          if (target.type === 'message') {
            const msgText = extractTextContent(item.text || item.content);
            if (msgText) target.text = msgText;
          }
          if (target.type === 'command_execution') {
            if (item.output) target.output = extractTextContent(item.output);
            if (item.exit_code !== undefined) target.exitCode = item.exit_code;
            if (item.duration_ms !== undefined) target.durationMs = item.duration_ms;
          }
          if (target.type === 'tool_call') {
            target.result = extractTextContent(item.output || item.result || 'completed');
          }
        }
      }
    }
  }

  // Filter out empty ghost reasoning items that completed without thought summary
  for (const turn of turns) {
    turn.items = turn.items.filter(
      (item) =>
        !(
          item.type === 'reasoning' &&
          item.status === 'completed' &&
          (!item.summaryText || typeof item.summaryText !== 'string' || !item.summaryText.trim())
        )
    );
  }

  return {
    turns,
    status,
    model,
    usage,
    environment: {
      id: envId,
      status: envStatus,
      path: '/workspace',
    },
  };
}
