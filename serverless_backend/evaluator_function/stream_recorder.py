# serverless_backend/evaluator_function/stream_recorder.py
"""
High-fidelity multi-agent stream recorder for OpenAI Responses and Agents API.
Directly ingests server-sent events (SSE) in real time and synthesizes:
1. A rich, structured multi-agent transcript (session_transcript.json) designed for
   Codex/Claude Desktop-grade UI rendering.
2. A lossless raw events audit log (session_events.json).
"""

import json
import time
import uuid
from typing import Any, Dict, List, Optional


def _safe_json_loads(val: Any) -> Any:
    if isinstance(val, (dict, list)):
        return val
    if isinstance(val, str):
        try:
            return json.loads(val)
        except Exception:
            return val
    return val


def _humanize_agent_name(name: str) -> str:
    cleaned = name.replace("-", " ").replace("_", " ")
    return " ".join(word.capitalize() for word in cleaned.split())


class StreamRecorder:
    """
    Ingests live OpenAI Responses / Agents API streaming events and builds
    a structured multi-agent execution transcript.
    """

    def __init__(
        self,
        session_id: str,
        application_id: Optional[str] = None,
        repo_url: Optional[str] = None,
        model: str = "gpt-5.6-luna",
        instructions: Optional[str] = None,
    ):
        self.session_id = session_id
        self.application_id = application_id or session_id
        self.repo_url = repo_url or ""
        self.model = model
        self.instructions = instructions or ""

        self.start_time = time.time()
        self.end_time = self.start_time
        self.status = "in_progress"

        # Raw events audit trail
        self.raw_events: List[Dict[str, Any]] = []

        # Known agents registry: id -> dict
        self.agents: Dict[str, Dict[str, Any]] = {
            "coordinator": {
                "id": "coordinator",
                "name": "Coordinator",
                "role": "Lead Technical Evaluator",
                "parent_agent": None,
                "status": "completed",
                "color": "amber",
            }
        }

        # Items in chronological order
        self.items: List[Dict[str, Any]] = []

        # Active tracking maps for correlating starts and completions
        self._active_reasoning_by_agent: Dict[str, Dict[str, Any]] = {}
        self._active_tool_by_call_id: Dict[str, Dict[str, Any]] = {}
        self._active_message_by_agent: Dict[str, Dict[str, Any]] = {}
        self._arg_buffers: Dict[str, str] = {}

        # Cumulative usage metrics
        self.usage: Dict[str, int] = {
            "input_tokens": 0,
            "output_tokens": 0,
            "reasoning_tokens": 0,
            "total_tokens": 0,
        }

    def _ensure_agent(self, agent_name: Optional[str], parent_agent: Optional[str] = None) -> str:
        if not agent_name or agent_name in ("main", "evaluator", "system"):
            return "coordinator"

        cleaned_id = agent_name.strip().lower()
        if cleaned_id not in self.agents:
            role = "Specialized Forensics Subagent"
            if "git" in cleaned_id:
                role = "Git Forensics & Authorship Evaluator"
            elif "solid" in cleaned_id or "arch" in cleaned_id:
                role = "Architecture & Clean Code Rubric"
            elif "test" in cleaned_id:
                role = "Test Rigor & Coverage Auditor"
            elif "sec" in cleaned_id:
                role = "Security & Secrets Scanner"

            self.agents[cleaned_id] = {
                "id": cleaned_id,
                "name": _humanize_agent_name(cleaned_id),
                "role": role,
                "parent_agent": parent_agent or "coordinator",
                "status": "completed",
                "color": "sky" if "git" in cleaned_id else "violet" if "solid" in cleaned_id else "emerald",
            }
        return cleaned_id

    def process_event(self, raw_event: Any) -> Dict[str, Any]:
        """Process a single event from the SSE stream."""
        if hasattr(raw_event, "model_dump"):
            data = raw_event.model_dump(mode="json")
        elif isinstance(raw_event, dict):
            data = raw_event
        elif isinstance(raw_event, str):
            try:
                data = json.loads(raw_event)
            except Exception:
                data = {"raw": raw_event}
        else:
            data = getattr(raw_event, "__dict__", {"raw": str(raw_event)})

        self.raw_events.append(data)
        self.end_time = time.time()

        event_type = str(data.get("type", ""))

        # Model and Session info
        if event_type in ("response.created", "agent.session.turn.created"):
            resp = data.get("response", {})
            if isinstance(resp, dict):
                if resp.get("model"):
                    self.model = resp.get("model")
                if resp.get("id"):
                    self.session_id = resp.get("id")
            return data

        # Agent attribution
        item = data.get("item") if isinstance(data.get("item"), dict) else data
        agent_raw = item.get("agent") if isinstance(item, dict) else None
        agent_str = None
        if isinstance(agent_raw, dict):
            agent_str = agent_raw.get("agent_name")
        elif isinstance(agent_raw, str):
            agent_str = agent_raw
        agent_id = self._ensure_agent(agent_str)

        item_type = item.get("type", "") if isinstance(item, dict) else ""

        # -------------------------------------------------------------
        # 1. Multi-Agent Delegation (spawn_agent, send_message)
        # -------------------------------------------------------------
        if item_type == "multi_agent_call":
            action = item.get("action", "spawn_agent")
            call_id = item.get("call_id") or item.get("id") or f"macall-{uuid.uuid4().hex[:6]}"
            raw_args = item.get("arguments", "{}")
            parsed_args = _safe_json_loads(raw_args)
            if not isinstance(parsed_args, dict):
                parsed_args = {"raw": parsed_args}

            target_name = parsed_args.get("agent_name") or parsed_args.get("name") or "subagent"
            target_id = self._ensure_agent(target_name, parent_agent=agent_id)

            instructions = parsed_args.get("instructions") or parsed_args.get("task") or ""

            mac_item = {
                "id": f"item-ma-{call_id}",
                "call_id": call_id,
                "agent": agent_id,
                "type": "multi_agent_call",
                "action": action,
                "target_agent": target_id,
                "target_agent_name": self.agents[target_id]["name"],
                "instructions": instructions,
                "status": "in_progress",
                "timestamp": time.time(),
            }
            self.items.append(mac_item)
            self._active_tool_by_call_id[call_id] = mac_item
            return data

        if item_type == "multi_agent_call_output":
            call_id = item.get("call_id")
            if call_id and call_id in self._active_tool_by_call_id:
                active_item = self._active_tool_by_call_id.pop(call_id)
                active_item["status"] = "completed"
                active_item["output"] = item.get("output", [])
            return data

        # -------------------------------------------------------------
        # 2. Inter-Agent Communication (agent_message)
        # -------------------------------------------------------------
        if item_type == "agent_message":
            author = self._ensure_agent(item.get("author"))
            recipient = self._ensure_agent(item.get("recipient"))
            content = item.get("content", "")
            if isinstance(content, list):
                text_parts = []
                for p in content:
                    if isinstance(p, dict) and p.get("type") == "text":
                        text_parts.append(p.get("text", ""))
                    elif isinstance(p, str):
                        text_parts.append(p)
                content = "\n".join(text_parts)

            msg_item = {
                "id": f"item-msg-{uuid.uuid4().hex[:8]}",
                "agent": author,
                "type": "agent_message",
                "author": author,
                "author_name": self.agents[author]["name"],
                "recipient": recipient,
                "recipient_name": self.agents[recipient]["name"],
                "content": str(content),
                "timestamp": time.time(),
            }
            self.items.append(msg_item)
            return data

        # -------------------------------------------------------------
        # 3. Model Reasoning / Chain of Thought
        # -------------------------------------------------------------
        is_reasoning_start = (
            item_type == "reasoning"
            or event_type in ("agent.reasoning.started", "response.reasoning.started")
        )
        is_reasoning_delta = (
            ("reasoning" in event_type and ("delta" in event_type or "delta" in data or "delta" in item))
            or (item_type == "reasoning" and ("delta" in data or "delta" in item))
            or ("reasoning" in event_type and ("text" in data or "summary" in data))
        )
        is_reasoning_done = (
            ("reasoning" in event_type and ("done" in event_type or "completed" in event_type))
            or (event_type in ("response.output_item.done", "agent.reasoning.completed") and item_type == "reasoning")
        )

        if is_reasoning_delta:
            delta_text = data.get("delta") or data.get("text") or ""
            if not delta_text and isinstance(item, dict):
                delta_text = item.get("summary") or item.get("text") or item.get("delta") or ""

            if agent_id not in self._active_reasoning_by_agent:
                r_item = {
                    "id": f"item-reasoning-{uuid.uuid4().hex[:8]}",
                    "agent": agent_id,
                    "type": "reasoning",
                    "title": f"{self.agents[agent_id]['name']} Thinking Process",
                    "content": delta_text,
                    "start_time": time.time(),
                    "duration_ms": 0,
                    "status": "in_progress",
                }
                self.items.append(r_item)
                self._active_reasoning_by_agent[agent_id] = r_item
            else:
                self._active_reasoning_by_agent[agent_id]["content"] += delta_text
            return data

        if is_reasoning_start:
            if agent_id not in self._active_reasoning_by_agent:
                content = ""
                if isinstance(item, dict):
                    c = item.get("content") or item.get("summary")
                    if isinstance(c, list):
                        content = " ".join(x.get("text", "") for x in c if isinstance(x, dict))
                    elif isinstance(c, str):
                        content = c

                r_item = {
                    "id": f"item-reasoning-{uuid.uuid4().hex[:8]}",
                    "agent": agent_id,
                    "type": "reasoning",
                    "title": f"{self.agents[agent_id]['name']} Thinking Process",
                    "content": content,
                    "start_time": time.time(),
                    "duration_ms": 0,
                    "status": "in_progress",
                }
                self.items.append(r_item)
                self._active_reasoning_by_agent[agent_id] = r_item
            return data

        if is_reasoning_done:
            if agent_id in self._active_reasoning_by_agent:
                active_r = self._active_reasoning_by_agent.pop(agent_id)
                active_r["status"] = "completed"
                active_r["duration_ms"] = int((time.time() - active_r["start_time"]) * 1000)
            return data

        # -------------------------------------------------------------
        # 4. Terminal / Shell Command Execution
        # -------------------------------------------------------------
        is_shell_start = (
            item_type in ("shell_call", "local_shell_call", "command_execution")
            or "command_execution.started" in event_type
        )
        if is_shell_start:
            call_id = (
                item.get("call_id")
                or item.get("id")
                or data.get("call_id")
                or f"cmd-{uuid.uuid4().hex[:6]}"
            )
            action = item.get("action") or {}
            commands = (
                action.get("commands")
                or action.get("command")
                or item.get("command")
                or data.get("command")
                or []
            )
            if isinstance(commands, list):
                command_str = " && ".join(str(c) for c in commands)
            else:
                command_str = str(commands)

            cwd = action.get("working_directory") or item.get("cwd") or data.get("cwd") or "/workspace/repo"

            shell_item = {
                "id": f"item-shell-{call_id}",
                "call_id": call_id,
                "agent": agent_id,
                "type": "shell_call",
                "command": command_str,
                "cwd": cwd,
                "stdout": "",
                "stderr": "",
                "exit_code": None,
                "start_time": time.time(),
                "duration_ms": 0,
                "status": "in_progress",
            }
            self.items.append(shell_item)
            self._active_tool_by_call_id[call_id] = shell_item
            return data

        is_shell_done = (
            item_type in ("shell_call_output", "local_shell_call_output")
            or "command_execution.completed" in event_type
        )
        if is_shell_done:
            call_id = item.get("call_id") or data.get("call_id")
            active_shell = None
            if call_id and call_id in self._active_tool_by_call_id:
                active_shell = self._active_tool_by_call_id.pop(call_id)
            else:
                # Find most recent in_progress shell item
                for it in reversed(self.items):
                    if it.get("type") == "shell_call" and it.get("status") == "in_progress":
                        active_shell = it
                        break

            if active_shell:
                output = item.get("output") or data.get("output") or ""
                stdout = ""
                stderr = ""
                exit_code = 0
                if isinstance(output, list):
                    for chunk in output:
                        if isinstance(chunk, dict):
                            stdout += chunk.get("stdout", "")
                            stderr += chunk.get("stderr", "")
                            outcome = chunk.get("outcome", {})
                            if isinstance(outcome, dict) and "exit_code" in outcome:
                                exit_code = outcome["exit_code"]
                elif isinstance(output, str):
                    stdout = output
                    exit_code = item.get("exit_code", data.get("exit_code", 0))

                active_shell["stdout"] = stdout
                active_shell["stderr"] = stderr
                active_shell["exit_code"] = exit_code
                active_shell["status"] = "completed"
                active_shell["duration_ms"] = int((time.time() - active_shell.get("start_time", time.time())) * 1000)
            return data

        # -------------------------------------------------------------
        # 5. Tools, Functions & MCP Calls
        # -------------------------------------------------------------
        # Streaming tool call arguments delta (OpenAI Responses API)
        if event_type == "response.function_call_arguments.delta":
            call_id = data.get("call_id") or data.get("item_id")
            delta_chunk = data.get("delta") or ""
            if call_id and delta_chunk:
                self._arg_buffers[call_id] = self._arg_buffers.get(call_id, "") + delta_chunk
                if call_id in self._active_tool_by_call_id:
                    active_item = self._active_tool_by_call_id[call_id]
                    # Attempt partial JSON extraction if command key is present
                    buf = self._arg_buffers[call_id]
                    if '"command"' in buf or '"cmd"' in buf:
                        parsed = _safe_json_loads(buf + '"}') if not buf.endswith("}") else _safe_json_loads(buf)
                        if isinstance(parsed, dict) and active_item.get("type") == "shell_call":
                            c = parsed.get("command") or parsed.get("cmd")
                            if c:
                                active_item["command"] = " && ".join(str(x) for x in c) if isinstance(c, list) else str(c)
            return data

        # Finalized tool arguments
        if event_type in ("response.function_call_arguments.done", "response.output_item.done") and item_type in ("function_call", "tool_call"):
            call_id = item.get("call_id") or item.get("id") or data.get("call_id")
            if call_id and call_id in self._active_tool_by_call_id:
                active_item = self._active_tool_by_call_id[call_id]
                full_raw = item.get("arguments") or data.get("arguments") or self._arg_buffers.get(call_id, "")
                parsed = _safe_json_loads(full_raw)
                if isinstance(parsed, dict):
                    if active_item.get("type") == "shell_call":
                        cmd_val = parsed.get("command") or parsed.get("cmd") or parsed.get("commands")
                        if cmd_val:
                            active_item["command"] = " && ".join(str(c) for c in cmd_val) if isinstance(cmd_val, list) else str(cmd_val)
                        if "cwd" in parsed or "working_directory" in parsed:
                            active_item["cwd"] = parsed.get("cwd") or parsed.get("working_directory")
                    elif active_item.get("type") == "multi_agent_call":
                        if "instructions" in parsed or "task" in parsed:
                            active_item["instructions"] = parsed.get("instructions") or parsed.get("task")
                    elif active_item.get("type") == "tool_call":
                        active_item["arguments"] = parsed
            return data

        is_tool_start = (
            (event_type in ("response.output_item.added", "agent.session.turn.step.created") and (item_type.endswith("_call") or item_type in ("function_call", "mcp_call", "file_search_call", "web_search_call", "apply_patch_call", "tool_call")))
            or (event_type not in ("response.output_item.done", "response.output_item.added") and item_type in ("function_call", "mcp_call", "file_search_call", "web_search_call", "apply_patch_call", "tool_call"))
        )
        if is_tool_start:
            call_id = item.get("call_id") or item.get("id") or f"tool-{uuid.uuid4().hex[:6]}"
            if call_id in self._active_tool_by_call_id:
                return data
            tool_name = str(
                item.get("name")
                or item.get("server_label")
                or item_type.replace("_call", "")
            )
            raw_args = item.get("arguments") or item.get("operation") or self._arg_buffers.get(call_id, {})
            parsed_args = _safe_json_loads(raw_args)

            # Check if this tool is a shell / command execution (OpenAI emits 'command_execution')
            SHELL_NAMES = (
                "command_execution",
                "run_command",
                "shell",
                "bash",
                "bash_20241022",
                "execute_command",
                "local_shell",
                "terminal",
                "exec",
                "exec_command",
            )
            if tool_name.lower() in SHELL_NAMES or "command" in tool_name.lower():
                cmd_val = parsed_args.get("command") or parsed_args.get("cmd") or parsed_args.get("commands") or ""
                command_str = " && ".join(str(c) for c in cmd_val) if isinstance(cmd_val, list) else str(cmd_val)
                cwd = parsed_args.get("cwd") or parsed_args.get("working_directory") or "/workspace/repo"
                shell_item = {
                    "id": f"item-shell-{call_id}",
                    "call_id": call_id,
                    "agent": agent_id,
                    "type": "shell_call",
                    "command": command_str,
                    "cwd": cwd,
                    "stdout": "",
                    "stderr": "",
                    "exit_code": None,
                    "start_time": time.time(),
                    "duration_ms": 0,
                    "status": "in_progress",
                }
                self.items.append(shell_item)
                self._active_tool_by_call_id[call_id] = shell_item
                return data

            # Check if this tool is a multi-agent delegation / spawn
            DELEGATE_NAMES = (
                "spawn_agent",
                "transfer_to_agent",
                "delegate",
                "call_subagent",
                "invoke_agent",
                "followup_task",
            )
            if tool_name.lower() in DELEGATE_NAMES:
                target_name = parsed_args.get("agent_name") or parsed_args.get("name") or parsed_args.get("subagent") or "subagent"
                target_id = self._ensure_agent(target_name, parent_agent=agent_id)
                instructions = parsed_args.get("instructions") or parsed_args.get("task") or parsed_args.get("prompt") or ""
                mac_item = {
                    "id": f"item-ma-{call_id}",
                    "call_id": call_id,
                    "agent": agent_id,
                    "type": "multi_agent_call",
                    "action": "spawn_agent",
                    "target_agent": target_id,
                    "target_agent_name": self.agents[target_id]["name"],
                    "instructions": instructions,
                    "status": "completed",
                    "timestamp": time.time(),
                }
                self.items.append(mac_item)
                self._active_tool_by_call_id[call_id] = mac_item
                return data

            tool_item = {
                "id": f"item-tool-{call_id}",
                "call_id": call_id,
                "agent": agent_id,
                "type": "tool_call",
                "tool_name": tool_name,
                "arguments": parsed_args,
                "output": None,
                "start_time": time.time(),
                "duration_ms": 0,
                "status": "in_progress",
            }
            self.items.append(tool_item)
            self._active_tool_by_call_id[call_id] = tool_item
            return data

        is_tool_done = (
            item_type in ("function_call_output", "tool_call_output", "mcp_call_output", "apply_patch_call_output", "command_execution_output")
            or (event_type in ("response.output_item.done", "agent.session.turn.step.completed") and (item_type.endswith("_output") or item_type == "function_call_output"))
        )
        if is_tool_done:
            call_id = item.get("call_id") or data.get("call_id")
            if call_id and call_id in self._active_tool_by_call_id:
                active_tool = self._active_tool_by_call_id.pop(call_id)
                raw_out = item.get("output") if item.get("output") is not None else data.get("output")
                parsed_out = _safe_json_loads(raw_out)

                if active_tool.get("type") == "shell_call":
                    if isinstance(parsed_out, dict):
                        active_tool["stdout"] = str(parsed_out.get("stdout") or parsed_out.get("output") or "")
                        active_tool["stderr"] = str(parsed_out.get("stderr") or "")
                        active_tool["exit_code"] = parsed_out.get("exit_code", 0)
                    elif isinstance(parsed_out, list) and len(parsed_out) > 0 and isinstance(parsed_out[0], dict):
                        first = parsed_out[0]
                        active_tool["stdout"] = str(first.get("stdout", ""))
                        active_tool["stderr"] = str(first.get("stderr", ""))
                        active_tool["exit_code"] = first.get("outcome", {}).get("exit_code", 0)
                    else:
                        active_tool["stdout"] = str(raw_out or "")
                        active_tool["exit_code"] = 0
                    active_tool["status"] = "completed" if active_tool.get("exit_code", 0) == 0 else "failed"
                else:
                    active_tool["status"] = "completed"
                    active_tool["output"] = parsed_out

                active_tool["duration_ms"] = int((time.time() - active_tool.get("start_time", time.time())) * 1000)
            return data

        # -------------------------------------------------------------
        # 6. Assistant Commentary & Findings
        # -------------------------------------------------------------
        if event_type in ("response.output_text.delta", "agent.message.delta") or (
            item_type == "message" and "delta" in data
        ):
            delta_str = data.get("delta") or ""
            if delta_str:
                if agent_id not in self._active_message_by_agent:
                    msg_item = {
                        "id": f"item-assistant-{uuid.uuid4().hex[:8]}",
                        "agent": agent_id,
                        "type": "message",
                        "role": "assistant",
                        "content": delta_str,
                        "timestamp": time.time(),
                    }
                    self.items.append(msg_item)
                    self._active_message_by_agent[agent_id] = msg_item
                else:
                    self._active_message_by_agent[agent_id]["content"] += delta_str
            return data

        if event_type == "response.output_item.done" and item_type == "message":
            if agent_id in self._active_message_by_agent:
                self._active_message_by_agent.pop(agent_id)
            else:
                content = item.get("content", [])
                text_out = ""
                if isinstance(content, list):
                    for c in content:
                        if isinstance(c, dict) and c.get("type") == "output_text":
                            text_out += c.get("text", "")
                elif isinstance(content, str):
                    text_out = content

                if text_out:
                    self.items.append({
                        "id": f"item-assistant-{uuid.uuid4().hex[:8]}",
                        "agent": agent_id,
                        "type": "message",
                        "role": "assistant",
                        "content": text_out,
                        "timestamp": time.time(),
                    })
            return data

        # -------------------------------------------------------------
        # 7. Token Usage & Turn Completion
        # -------------------------------------------------------------
        if event_type in ("response.done", "agent.session.turn.completed"):
            self.status = "completed"
            resp = data.get("response", {})
            usage = resp.get("usage", {}) or data.get("usage", {})
            if isinstance(usage, dict):
                self.usage["input_tokens"] = usage.get("input_tokens", self.usage["input_tokens"])
                self.usage["output_tokens"] = usage.get("output_tokens", self.usage["output_tokens"])
                self.usage["total_tokens"] = usage.get("total_tokens", self.usage["total_tokens"])
                output_details = usage.get("output_tokens_details", {}) or {}
                if isinstance(output_details, dict):
                    self.usage["reasoning_tokens"] = output_details.get("reasoning_tokens", self.usage["reasoning_tokens"])

        return data

    def finish(self) -> Dict[str, Any]:
        """Marks active items completed and returns the full transcript document."""
        self.end_time = time.time()
        self.status = "completed"

        # Finalize any pending reasoning or shell blocks
        for active_r in self._active_reasoning_by_agent.values():
            active_r["status"] = "completed"
            if not active_r.get("duration_ms"):
                active_r["duration_ms"] = int((self.end_time - active_r.get("start_time", self.start_time)) * 1000)
        self._active_reasoning_by_agent.clear()

        for active_tool in self._active_tool_by_call_id.values():
            active_tool["status"] = "completed"
            if not active_tool.get("duration_ms"):
                active_tool["duration_ms"] = int((self.end_time - active_tool.get("start_time", self.start_time)) * 1000)
        self._active_tool_by_call_id.clear()

        return self.get_transcript()

    def get_transcript(self) -> Dict[str, Any]:
        """Returns the structured multi-agent transcript document."""
        duration_total_ms = int((self.end_time - self.start_time) * 1000)
        return {
            "session_id": self.session_id,
            "application_id": self.application_id,
            "repo_url": self.repo_url,
            "model": self.model,
            "status": self.status,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration_ms": max(duration_total_ms, 1),
            "usage": self.usage,
            "agents": list(self.agents.values()),
            "items": self.items,
        }

    def get_raw_events(self) -> List[Dict[str, Any]]:
        """Returns all captured raw SSE events."""
        return self.raw_events
