'use client';

import { useState, useCallback, useRef } from 'react';
import {
  AgentSessionState,
  AgentTranscript,
  AgentWorkItem,
  ReasoningItem,
  CommandExecutionItem,
  AssistantMessageItem,
  MultiAgentCallItem,
  AgentMessageItem,
  SubagentInfo,
} from '@/components/assistant-ui/types';
import { API_BASE_URL, fetchCandidateTrace, fetchCandidateTranscript } from '@/data/apiClient';

const BACKEND_BASE = API_BASE_URL;

export function useAgentEvaluation() {
  const [sessionState, setSessionState] = useState<AgentSessionState | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trace, setTrace] = useState<any | null>(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadExistingReport = useCallback(async (sessionId: string, candidateName: string, roleTitle: string) => {
    setTraceLoading(true);
    try {
      const [reportResult, transcriptResult, traceResult] = await Promise.allSettled([
        fetch(`${BACKEND_BASE}/api/reports/${sessionId}`),
        fetchCandidateTranscript(sessionId),
        fetchCandidateTrace(sessionId),
      ]);

      const response = reportResult.status === 'fulfilled' ? reportResult.value : null;
      const markdown = response?.ok ? await response.text() : '';
      if (traceResult.status === 'fulfilled') setTrace(traceResult.value);

      const transcriptData: AgentTranscript | null =
        transcriptResult.status === 'fulfilled' ? transcriptResult.value : null;

      if (!response?.ok && !transcriptData && traceResult.status === 'rejected') {
        return false;
      }

      const defaultItems: AgentWorkItem[] = [
        {
          id: 'msg-audit-complete',
          type: 'message',
          role: 'assistant',
          content: markdown
            ? `### Candidate Repository Inspection Record\n\nThe candidate evaluation dossier has been audited and compiled. Review the multi-agent execution timeline, terminal executions, and the published report.`
            : `Repository evaluation pending for ${candidateName}. Click "Run inspection" to trigger live multi-agent analysis.`,
          timestamp: new Date().toISOString(),
        },
      ];

      const activeItems = transcriptData?.items && transcriptData.items.length > 0
        ? transcriptData.items
        : defaultItems;

      const usageStats = transcriptData?.usage
        ? {
            inputTokens: transcriptData.usage.input_tokens || 0,
            reasoningTokens: transcriptData.usage.reasoning_tokens || 0,
            outputTokens: transcriptData.usage.output_tokens || 0,
            totalTokens: transcriptData.usage.total_tokens || 0,
          }
        : {
            inputTokens: 0,
            reasoningTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
          };

      setSessionState({
        sessionId,
        status: 'idle',
        environment: {
          id: 'env_docker_sandbox',
          status: 'ready',
          path: '/workspace',
        },
        model: transcriptData?.model || 'gpt-5.6-luna (OpenAI Responses API)',
        reasoningEffort: 'medium',
        turns: [
          {
            id: 'turn-existing',
            turnNumber: 1,
            status: 'completed',
            items: activeItems,
          },
        ],
        usage: usageStats,
        reportMarkdown: markdown,
        reportDownloadUrl: `${BACKEND_BASE}/api/reports/${sessionId}`,
        transcript: transcriptData,
      });

      return true;
    } catch (err: any) {
      console.warn('[useAgentEvaluation] No pre-existing report found:', err?.message);
      return false;
    } finally {
      setTraceLoading(false);
    }
  }, []);

  const startEvaluation = useCallback(async (repoUrl: string, instructions?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsStreaming(true);
    setError(null);
    setTrace(null);

    const initialSessionId = 'pending-session';

    const initialAgents: SubagentInfo[] = [
      {
        id: 'coordinator',
        name: 'Coordinator',
        role: 'Lead Technical Evaluator',
        status: 'in_progress',
        color: 'amber',
      },
    ];

    const initialTranscript: AgentTranscript = {
      session_id: initialSessionId,
      repo_url: repoUrl,
      model: 'gpt-5.6-luna',
      status: 'in_progress',
      start_time: Date.now() / 1000,
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        reasoning_tokens: 0,
        total_tokens: 0,
      },
      agents: initialAgents,
      items: [
        {
          id: 'sys-start',
          type: 'message',
          role: 'system',
          agent: 'coordinator',
          content: `Connecting to containerized sandbox at /workspace to evaluate candidate repository: ${repoUrl}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setSessionState({
      sessionId: initialSessionId,
      status: 'in_progress',
      environment: {
        id: 'env_docker_sandbox',
        status: 'pending',
        path: '/workspace',
      },
      model: 'gpt-5.6-luna',
      reasoningEffort: 'medium',
      turns: [
        {
          id: 'turn-1',
          turnNumber: 1,
          status: 'in_progress',
          items: initialTranscript.items,
        },
      ],
      usage: {
        inputTokens: 0,
        reasoningTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      reportMarkdown: '',
      transcript: initialTranscript,
    });

    let targetSessionId = initialSessionId;

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
      const argBuffers: Record<string, string> = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed) continue;

          const dataMatch = trimmed.match(/^data:\s*(.*)$/m);
          if (!dataMatch) continue;

          const rawData = dataMatch[1].trim();
          if (!rawData) continue;

          let eventData: any;
          try {
            eventData = JSON.parse(rawData);
          } catch {
            continue;
          }

          const eventType = eventData.type || '';

          // 1. Session created
          if (eventType === 'agent.session.created' || eventType === 'response.created') {
            const sid = eventData.session_id || eventData.session?.id || eventData.response?.id || targetSessionId;
            targetSessionId = sid;
            const modelName = eventData.session?.model || eventData.response?.model || 'gpt-5.6-luna';

            setSessionState((prev) => {
              if (!prev) return prev;
              const transcript = prev.transcript
                ? { ...prev.transcript, session_id: sid, model: modelName }
                : null;
              return {
                ...prev,
                sessionId: sid,
                model: modelName,
                status: 'in_progress',
                environment: {
                  ...prev.environment,
                  status: 'connected',
                },
                transcript,
              };
            });
            setTraceLoading(true);
            fetchCandidateTrace(sid).then(setTrace).catch(() => undefined).finally(() => setTraceLoading(false));
          }

          // 2. Reasoning delta (matches OpenAI response.reasoning_text.delta, response.reasoning_summary_text.delta, agent.reasoning.delta)
          else if (
            (eventType.includes('reasoning') && (eventType.includes('delta') || eventData.delta !== undefined || eventData.text !== undefined)) ||
            eventType === 'response.reasoning_text.delta' ||
            eventType === 'response.reasoning_summary_text.delta'
          ) {
            const deltaText = eventData.delta || eventData.text || '';
            const agentId = eventData.agent || 'coordinator';

            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              const rItemIndex = items.findIndex((i) => i.id === activeReasoningId && i.type === 'reasoning');
              if (rItemIndex === -1) {
                const newId = `reasoning-${Date.now()}`;
                activeReasoningId = newId;
                const newRItem: ReasoningItem = {
                  id: newId,
                  agent: agentId,
                  type: 'reasoning',
                  title: agentId === 'coordinator' ? 'Coordinator Strategic Reasoning' : `${agentId} Reasoning`,
                  summary: deltaText,
                  content: deltaText,
                  status: 'in_progress',
                  timestamp: new Date().toISOString(),
                };
                items.push(newRItem);
              } else {
                const existing = items[rItemIndex] as ReasoningItem;
                const updatedContent = (existing.content || existing.summary || '') + deltaText;
                items[rItemIndex] = {
                  ...existing,
                  summary: updatedContent,
                  content: updatedContent,
                };
              }

              currentTurn.items = items;
              turns[turns.length - 1] = currentTurn;

              const transcript = prev.transcript
                ? { ...prev.transcript, items }
                : null;

              return { ...prev, turns, transcript };
            });
          }

          // 3. Reasoning completed (matches OpenAI response.reasoning_text.done, agent.reasoning.completed)
          else if (
            (eventType.includes('reasoning') && (eventType.includes('done') || eventType.includes('completed'))) ||
            eventType === 'response.reasoning_text.done' ||
            eventType === 'response.reasoning_summary_text.done'
          ) {
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
              const transcript = prev.transcript ? { ...prev.transcript, items } : null;
              return { ...prev, turns, transcript };
            });
            activeReasoningId = null;
          }

          // 3.5 Streaming Function Call Arguments (Real OpenAI Responses API)
          else if (eventType === 'response.function_call_arguments.delta') {
            const callId = eventData.call_id || eventData.item_id;
            const delta = eventData.delta || '';
            if (callId && delta) {
              argBuffers[callId] = (argBuffers[callId] || '') + delta;
              const currentBuf = argBuffers[callId];
              if (currentBuf.includes('"command"') || currentBuf.includes('"cmd"')) {
                let parsed: any = null;
                try {
                  parsed = JSON.parse(currentBuf.endsWith('}') ? currentBuf : currentBuf + '"}');
                } catch {
                  // Buffer not yet valid JSON, wait for more chunks
                }
                if (parsed && (parsed.command || parsed.cmd)) {
                  const cmdVal = parsed.command || parsed.cmd;
                  const cmdStr = Array.isArray(cmdVal) ? cmdVal.join(' && ') : String(cmdVal);
                  setSessionState((prev) => {
                    if (!prev) return prev;
                    const turns = [...prev.turns];
                    const currentTurn = { ...turns[turns.length - 1] };
                    const items = currentTurn.items.map((i) => {
                      if (i.id === callId && (i.type === 'shell_call' || i.type === 'command_execution')) {
                        return { ...i, command: cmdStr };
                      }
                      return i;
                    });
                    currentTurn.items = items;
                    turns[turns.length - 1] = currentTurn;
                    const transcript = prev.transcript ? { ...prev.transcript, items } : null;
                    return { ...prev, turns, transcript };
                  });
                }
              }
            }
          }

          // 4. Output Item Added: Shell Execution, Multi-Agent Call, or Function Call
          else if (eventType === 'response.output_item.added') {
            const item = eventData.item || {};
            const itemType = item.type || '';
            const toolName = (item.name || item.tool_name || item.server_label || itemType.replace('_call', '')).toLowerCase();

            const isShell =
              itemType === 'shell_call' ||
              itemType === 'local_shell_call' ||
              itemType === 'command_execution' ||
              toolName === 'command_execution' ||
              toolName === 'run_command' ||
              toolName === 'shell' ||
              toolName === 'bash' ||
              toolName === 'terminal' ||
              toolName === 'exec' ||
              toolName.includes('command');

            const isMultiAgent =
              itemType === 'multi_agent_call' ||
              toolName === 'spawn_agent' ||
              toolName === 'delegate' ||
              toolName === 'transfer_to_agent' ||
              toolName === 'call_subagent';

            if (isMultiAgent) {
              let parsedArgs: any = {};
              try {
                parsedArgs = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : (item.arguments || {});
              } catch {
                parsedArgs = {};
              }
              const subagentId = parsedArgs.agent_name || parsedArgs.subagent || 'forensics-subagent';
              const subagentName = subagentId
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase());

              setSessionState((prev) => {
                if (!prev) return prev;
                const turns = [...prev.turns];
                const currentTurn = { ...turns[turns.length - 1] };
                const items = [...currentTurn.items];

                const callItem: MultiAgentCallItem = {
                  id: item.call_id || item.id || `ma-call-${Date.now()}`,
                  agent: item.agent || 'coordinator',
                  type: 'multi_agent_call',
                  action: item.action || 'spawn_agent',
                  target_agent: subagentId,
                  target_agent_name: subagentName,
                  instructions: parsedArgs.task || parsedArgs.instructions || 'Execute forensic inspection',
                  status: 'completed',
                  timestamp: new Date().toISOString(),
                };
                items.push(callItem);
                currentTurn.items = items;
                turns[turns.length - 1] = currentTurn;

                // Also register subagent in agents list if not already present
                const existingAgents = prev.transcript?.agents || [];
                const agents = [...existingAgents];
                if (!agents.some((a) => a.id === subagentId)) {
                  agents.push({
                    id: subagentId,
                    name: subagentName,
                    role: subagentId.includes('git')
                      ? 'Git Forensics & Authorship Evaluator'
                      : 'Architecture & Clean Code Rubric',
                    parent_agent: item.agent || 'coordinator',
                    status: 'completed',
                    color: subagentId.includes('git') ? 'sky' : 'violet',
                  });
                }

                const transcript = prev.transcript
                  ? { ...prev.transcript, items, agents }
                  : null;

                return { ...prev, turns, transcript };
              });
            } else if (isShell) {
              const action = item.action || {};
              let parsedArgs: any = {};
              try {
                parsedArgs = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : (item.arguments || {});
              } catch {
                parsedArgs = {};
              }
              const cmds = action.commands || parsedArgs.command || parsedArgs.cmd || [item.command || 'run command'];
              const cmdStr = Array.isArray(cmds) ? cmds.join(' && ') : String(cmds);
              const cwd = action.working_directory || parsedArgs.cwd || parsedArgs.working_directory || '/workspace';

              setSessionState((prev) => {
                if (!prev) return prev;
                const turns = [...prev.turns];
                const currentTurn = { ...turns[turns.length - 1] };
                const items = [...currentTurn.items];

                const callId = item.call_id || item.id || `cmd-${Date.now()}`;
                const shellItem: CommandExecutionItem = {
                  id: callId,
                  agent: item.agent || 'coordinator',
                  type: 'shell_call',
                  command: cmdStr,
                  cwd,
                  output: '',
                  stdout: '',
                  stderr: '',
                  exitCode: null,
                  status: 'in_progress',
                  timestamp: new Date().toISOString(),
                };
                items.push(shellItem);
                currentTurn.items = items;
                turns[turns.length - 1] = currentTurn;

                const transcript = prev.transcript ? { ...prev.transcript, items } : null;
                return { ...prev, turns, transcript };
              });
            }
          }

          // 5. Output Item Done: Shell Output, Agent Message, Function Output, or Tool Output
          else if (eventType === 'response.output_item.done') {
            const item = eventData.item || {};
            const itemType = item.type || '';
            const callId = item.call_id || item.id || eventData.call_id;

            // Finalize tool arguments once generation is complete
            if (itemType === 'function_call' || itemType === 'tool_call') {
              const fullRaw = item.arguments || argBuffers[callId] || '';
              let parsed: any = {};
              try {
                parsed = typeof fullRaw === 'string' ? JSON.parse(fullRaw) : (fullRaw || {});
              } catch {
                parsed = {};
              }
              if (parsed.command || parsed.cmd) {
                const cmdVal = parsed.command || parsed.cmd;
                const cmdStr = Array.isArray(cmdVal) ? cmdVal.join(' && ') : String(cmdVal);
                setSessionState((prev) => {
                  if (!prev) return prev;
                  const turns = [...prev.turns];
                  const currentTurn = { ...turns[turns.length - 1] };
                  const items = currentTurn.items.map((i) => {
                    if (i.id === callId && (i.type === 'shell_call' || i.type === 'command_execution')) {
                      return {
                        ...i,
                        command: cmdStr,
                        cwd: parsed.cwd || parsed.working_directory || i.cwd,
                      };
                    }
                    return i;
                  });
                  currentTurn.items = items;
                  turns[turns.length - 1] = currentTurn;
                  const transcript = prev.transcript ? { ...prev.transcript, items } : null;
                  return { ...prev, turns, transcript };
                });
              }
            }

            // Tool Execution output from sandbox (function_call_output or shell_call_output)
            else if (
              itemType === 'shell_call_output' ||
              itemType === 'function_call_output' ||
              itemType === 'tool_call_output' ||
              itemType.endsWith('_output')
            ) {
              const rawOut = item.output !== undefined ? item.output : eventData.output;
              let parsedOut: any = rawOut;
              if (typeof rawOut === 'string') {
                try {
                  parsedOut = JSON.parse(rawOut);
                } catch {
                  parsedOut = rawOut;
                }
              }

              let stdout = '';
              let stderr = '';
              let exitCode = 0;

              if (parsedOut && typeof parsedOut === 'object') {
                if (Array.isArray(parsedOut) && parsedOut.length > 0) {
                  const first = parsedOut[0];
                  stdout = first.stdout || first.output || '';
                  stderr = first.stderr || '';
                  exitCode = first.outcome?.exit_code ?? 0;
                } else {
                  stdout = parsedOut.stdout || parsedOut.output || (typeof rawOut === 'string' ? rawOut : '');
                  stderr = parsedOut.stderr || '';
                  exitCode = parsedOut.exit_code ?? 0;
                }
              } else {
                stdout = String(rawOut || '');
              }

              setSessionState((prev) => {
                if (!prev) return prev;
                const turns = [...prev.turns];
                const currentTurn = { ...turns[turns.length - 1] };
                const items = currentTurn.items.map((i) => {
                  if (i.id === callId && (i.type === 'shell_call' || i.type === 'command_execution')) {
                    return {
                      ...i,
                      stdout,
                      stderr,
                      output: stdout + (stderr ? `\nSTDERR:\n${stderr}` : ''),
                      exitCode,
                      exit_code: exitCode,
                      status: (exitCode === 0 ? 'completed' : 'failed') as any,
                    };
                  }
                  return i;
                });
                currentTurn.items = items;
                turns[turns.length - 1] = currentTurn;
                const transcript = prev.transcript ? { ...prev.transcript, items } : null;
                return { ...prev, turns, transcript };
              });
            } else if (itemType === 'agent_message') {
              setSessionState((prev) => {
                if (!prev) return prev;
                const turns = [...prev.turns];
                const currentTurn = { ...turns[turns.length - 1] };
                const items = [...currentTurn.items];

                const agentMsg: AgentMessageItem = {
                  id: `agent-msg-${Date.now()}`,
                  agent: item.author || 'subagent',
                  author: item.author || 'subagent',
                  author_name: (item.author || 'Subagent')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                  recipient: item.recipient || 'coordinator',
                  recipient_name: (item.recipient || 'Coordinator')
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                  type: 'agent_message',
                  content: item.content || '',
                  timestamp: new Date().toISOString(),
                };
                items.push(agentMsg);
                currentTurn.items = items;
                turns[turns.length - 1] = currentTurn;
                const transcript = prev.transcript ? { ...prev.transcript, items } : null;
                return { ...prev, turns, transcript };
              });
            }
          }

          // 6. Assistant text delta (Coordinator final summary)
          else if (
            eventType === 'response.output_text.delta' ||
            eventType === 'agent.session.turn.output_text.delta' ||
            (eventData.delta && !eventType.includes('reasoning'))
          ) {
            const deltaText = eventData.delta || '';
            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              const items = [...currentTurn.items];

              const msgIndex = items.findIndex((i) => i.id === activeAssistantMessageId && i.type === 'message');
              if (msgIndex === -1) {
                const newId = `assistant-msg-${Date.now()}`;
                activeAssistantMessageId = newId;
                const newMsg: AssistantMessageItem = {
                  id: newId,
                  agent: eventData.agent || 'coordinator',
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
              const transcript = prev.transcript ? { ...prev.transcript, items } : null;
              return { ...prev, turns, transcript };
            });
          }

          // 7. Usage & Turn Completion
          else if (eventType === 'response.done' || eventType === 'agent.session.turn.completed') {
            const resp = eventData.response || {};
            const usage = resp.usage || eventData.turn?.usage || {};
            const outputDetails = usage.output_tokens_details || {};
            const rTokens = outputDetails.reasoning_tokens || 0;

            setSessionState((prev) => {
              if (!prev) return prev;
              const turns = [...prev.turns];
              const currentTurn = { ...turns[turns.length - 1] };
              currentTurn.status = 'completed';
              turns[turns.length - 1] = currentTurn;

              const usageUpdate = {
                inputTokens: usage.input_tokens || prev.usage.inputTokens,
                reasoningTokens: rTokens || prev.usage.reasoningTokens,
                outputTokens: usage.output_tokens || prev.usage.outputTokens,
                totalTokens: usage.total_tokens || prev.usage.totalTokens,
              };

              const transcript = prev.transcript
                ? {
                    ...prev.transcript,
                    status: 'completed',
                    usage: {
                      input_tokens: usageUpdate.inputTokens,
                      output_tokens: usageUpdate.outputTokens,
                      reasoning_tokens: usageUpdate.reasoningTokens,
                      total_tokens: usageUpdate.totalTokens,
                    },
                  }
                : null;

              return {
                ...prev,
                status: 'idle',
                turns,
                usage: usageUpdate,
                transcript,
              };
            });
            activeAssistantMessageId = null;
          }

          // 8. Artifact Ready
          else if (eventType === 'agent.artifact.ready') {
            const sid = eventData.session_id || targetSessionId;
            const downloadUrl = `${BACKEND_BASE}${eventData.download_url || `/api/reports/${sid}`}`;
            setTraceLoading(true);
            fetchCandidateTrace(sid).then(setTrace).catch(() => undefined).finally(() => setTraceLoading(false));

            if (eventData.content) {
              setSessionState((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  reportMarkdown: eventData.content,
                  reportDownloadUrl: downloadUrl,
                };
              });
            } else {
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
          }

          // 9. Error
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

      // Fetch official completed transcript from backend if available
      if (targetSessionId && targetSessionId !== initialSessionId) {
        fetchCandidateTranscript(targetSessionId).then((fullTranscript) => {
          if (fullTranscript) {
            setSessionState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                transcript: fullTranscript,
                turns: [
                  {
                    id: 'turn-final',
                    turnNumber: 1,
                    status: 'completed',
                    items: fullTranscript.items || prev.turns[0]?.items || [],
                  },
                ],
              };
            });
          }
        }).catch(() => undefined);
      }
    }
  }, []);

  return {
    sessionState,
    isStreaming,
    error,
    trace,
    traceLoading,
    startEvaluation,
    loadExistingReport,
  };
}
