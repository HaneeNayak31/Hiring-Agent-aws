// components/assistant-ui/useAgentEvaluation.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { AgentSessionState, AgentTurnState, AgentWorkItem, ReasoningItem, CommandExecutionItem, AssistantMessageItem } from './types';

const BACKEND_BASE = 'http://127.0.0.1:8000';

export function useAgentEvaluation() {
  const [sessionState, setSessionState] = useState<AgentSessionState | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load existing published report if available
  const loadExistingReport = useCallback(async (sessionId: string, candidateName: string, roleTitle: string) => {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/reports/${sessionId}`);
      if (!res.ok) {
        return false;
      }
      const markdown = await res.text();

      setSessionState({
        sessionId,
        status: 'idle',
        environment: {
          id: 'env_docker_sandbox',
          status: 'connected',
          path: '/workspace',
        },
        model: 'gpt-5.6-luna',
        reasoningEffort: 'low',
        turns: [
          {
            id: 'turn-existing',
            turnNumber: 1,
            status: 'completed',
            items: [
              {
                id: 'msg-audit-complete',
                type: 'message',
                role: 'assistant',
                content: `### Candidate Repository Audit Record\n\nVerified intelligence report is published and available for review in the **REPORT** tab.\n\nYou can click **Run Live Agent Evaluation** above to initiate a fresh live evaluation stream against \`/api/agents/evaluate\`.`,
                timestamp: new Date().toISOString(),
              },
            ],
          },
        ],
        usage: {
          inputTokens: 2400,
          reasoningTokens: 540,
          outputTokens: 1180,
          totalTokens: 4120,
        },
        reportMarkdown: markdown,
        reportDownloadUrl: `${BACKEND_BASE}/api/reports/${sessionId}`,
      });

      return true;
    } catch (err: any) {
      console.warn('[useAgentEvaluation] No pre-existing report found:', err?.message);
      return false;
    }
  }, []);

  // Run live evaluation against POST /api/agents/evaluate
  const startEvaluation = useCallback(async (repoUrl: string, instructions?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStreaming(true);
    setError(null);

    const initialSessionId = `sess_${Date.now().toString(16)}`;

    // Initialize clean state without dummy data
    setSessionState({
      sessionId: initialSessionId,
      status: 'in_progress',
      environment: {
        id: 'env_docker_sandbox',
        status: 'connected',
        path: '/workspace',
      },
      model: 'gpt-5.6-luna',
      reasoningEffort: 'low',
      turns: [
        {
          id: 'turn-1',
          turnNumber: 1,
          status: 'in_progress',
          items: [
            {
              id: 'sys-start',
              type: 'message',
              role: 'system',
              content: `Connecting to containerized sandbox at /workspace to evaluate candidate repository: ${repoUrl}`,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      ],
      usage: {
        inputTokens: 0,
        reasoningTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      reportMarkdown: '',
    });

    try {
      const response = await fetch(`${BACKEND_BASE}/api/agents/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          instructions: instructions || null,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Agent server returned HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported on response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      let activeReasoningId: string | null = null;
      let activeAssistantMessageId: string | null = null;
      let targetSessionId = initialSessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          // Match SSE data payload
          const dataMatch = trimmed.match(/^data:\s*(.*)$/m);
          if (!dataMatch) continue;

          const rawData = dataMatch[1].trim();
          if (!rawData) continue;

          let eventData: any;
          try {
            eventData = JSON.parse(rawData);
          } catch (e) {
            continue;
          }

          const eventType = eventData.type || '';

          // 1. Session created
          if (eventType === 'agent.session.created') {
            const sid = eventData.session_id || eventData.session?.id || targetSessionId;
            targetSessionId = sid;
            const modelName = eventData.session?.model || 'gpt-5.6-luna';

            setSessionState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                sessionId: sid,
                model: modelName,
                status: 'in_progress',
                environment: {
                  ...prev.environment,
                  status: 'connected',
                },
              };
            });
          }

          // 2. Reasoning deltas
          else if (eventType.includes('reasoning.delta') || (eventData.delta && eventType.includes('reasoning'))) {
            const deltaText = eventData.delta || eventData.text || '';
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              let rItemIndex = items.findIndex((i) => i.id === activeReasoningId && i.type === 'reasoning');
              if (rItemIndex === -1) {
                const newId = `reasoning-${Date.now()}`;
                activeReasoningId = newId;
                const newRItem: ReasoningItem = {
                  id: newId,
                  type: 'reasoning',
                  title: 'Agent Reasoning & Environment Inspection',
                  summary: deltaText,
                  status: 'in_progress',
                  timestamp: new Date().toISOString(),
                };
                items.push(newRItem);
              } else {
                const existing = items[rItemIndex] as ReasoningItem;
                items[rItemIndex] = {
                  ...existing,
                  summary: (existing.summary || '') + deltaText,
                };
              }

              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;
              return { ...prev, turns };
            });
          }

          // 3. Reasoning completed
          else if (eventType.includes('reasoning.completed')) {
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = currentTurn.items.map((i) => {
                if (i.id === activeReasoningId && i.type === 'reasoning') {
                  return { ...i, status: 'completed' as const };
                }
                return i;
              });
              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;
              return { ...prev, turns };
            });
            activeReasoningId = null;
          }

          // 4. Command execution / sandbox terminal events
          else if (eventType.includes('command_execution') || eventData.command) {
            const cmd = eventData.command || 'npm test';
            const out = eventData.output || '';
            const exit = eventData.exit_code ?? null;

            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              const cmdItem: CommandExecutionItem = {
                id: `cmd-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
                type: 'command_execution',
                command: cmd,
                cwd: eventData.cwd || '/workspace',
                output: out,
                exitCode: exit,
                status: exit !== null ? 'completed' : 'in_progress',
                timestamp: new Date().toISOString(),
              };
              items.push(cmdItem);

              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;
              return { ...prev, turns };
            });
          }

          // 5. Tool call events
          else if (eventType.includes('tool_call') || eventData.tool_name) {
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              items.push({
                id: `tool-${Date.now()}`,
                type: 'tool_call',
                toolName: eventData.tool_name || 'evaluator_tool',
                input: eventData.input || {},
                output: eventData.output,
                status: 'completed',
                timestamp: new Date().toISOString(),
              });

              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;
              return { ...prev, turns };
            });
          }

          // 6. Output text delta (Assistant response streaming)
          else if (eventType === 'agent.session.turn.output_text.delta' || (eventData.delta && !eventType.includes('reasoning'))) {
            const deltaText = eventData.delta || '';
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              let msgIndex = items.findIndex((i) => i.id === activeAssistantMessageId && i.type === 'message');
              if (msgIndex === -1) {
                const newId = `assistant-msg-${Date.now()}`;
                activeAssistantMessageId = newId;
                const newMsg: AssistantMessageItem = {
                  id: newId,
                  type: 'message',
                  role: 'assistant',
                  content: deltaText,
                  timestamp: new Date().toISOString(),
                };
                items.push(newMsg);
              } else {
                const existing = items[msgIndex] as AssistantMessageItem;
                items[msgIndex] = {
                  ...existing,
                  content: existing.content + deltaText,
                };
              }

              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;
              return { ...prev, turns };
            });
          }

          // 7. Turn completed
          else if (eventType === 'agent.session.turn.completed') {
            const usage = eventData.turn?.usage || {};
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              currentTurn.status = 'completed';
              turns[turns.length - 1] = currentTurn;

              return {
                ...prev,
                status: 'idle',
                turns,
                usage: {
                  inputTokens: usage.input_tokens || prev.usage.inputTokens,
                  reasoningTokens: usage.reasoning_tokens || prev.usage.reasoningTokens,
                  outputTokens: usage.output_tokens || prev.usage.outputTokens,
                  totalTokens: usage.total_tokens || prev.usage.totalTokens,
                },
              };
            });
            activeAssistantMessageId = null;
          }

          // 8. Artifact Ready (Report downloaded from /workspace/outputs)
          else if (eventType === 'agent.artifact.ready') {
            const sid = eventData.session_id || targetSessionId;
            const downloadUrl = `${BACKEND_BASE}${eventData.download_url || `/api/reports/${sid}`}`;

            // Fetch published report content
            fetch(`${BACKEND_BASE}/api/reports/${sid}`)
              .then((res) => (res.ok ? res.text() : ''))
              .then((md) => {
                if (md) {
                  setSessionState((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      reportMarkdown: md,
                      reportDownloadUrl: downloadUrl,
                    };
                  });
                }
              })
              .catch((e) => console.warn('Failed to fetch artifact markdown:', e));
          }

          // 9. Error events
          else if (eventType === 'error') {
            const errMsg = eventData.error?.message || 'Server-side evaluation error';
            setError(errMsg);
            setSessionState((prev) => {
              if (!prev) return prev;
              return { ...prev, status: 'failed' };
            });
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Agent evaluation aborted by user.');
      } else {
        console.error('Error during agent evaluation stream:', err);
        setError(err.message || 'Connection error to agent evaluation backend.');
      }
    } finally {
      setIsStreaming(false);
      setSessionState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'idle',
        };
      });
    }
  }, []);

  return {
    sessionState,
    isStreaming,
    error,
    startEvaluation,
    loadExistingReport,
  };
}
