"""
Real-time Stream-to-OTLP Synthesizer for OpenAI Agents API and Responses API.

Captures real-time streaming events (turns, reasoning, multi-agent calls, tools, outputs)
and synthesizes a fully compliant OpenTelemetry Protocol (OTLP) JSON trace document
compatible with standard tracing tools and the Recruiter Flight Recorder UI.
"""

from __future__ import annotations

import hashlib
import json
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple


def _normalize_event(event: Any) -> Dict[str, Any]:
    """Converts Pydantic models, SDK objects, or JSON strings to a Python dict."""
    if isinstance(event, dict):
        return event
    if hasattr(event, "model_dump"):
        return event.model_dump()
    if hasattr(event, "to_dict"):
        return event.to_dict()
    if isinstance(event, str):
        try:
            return json.loads(event)
        except Exception:
            return {"raw": event}
    try:
        return json.loads(json.dumps(event, default=str))
    except Exception:
        return {"type": "unknown_event", "raw": str(event)}


def _make_hex_id(prefix: str, length: int = 16) -> str:
    """Generate a deterministic or pseudo-random hex string of the desired length."""
    h = hashlib.sha256(f"{prefix}-{uuid.uuid4().hex}".encode("utf-8")).hexdigest()
    return h[:length]


def _format_otlp_attribute(key: str, value: Any) -> Dict[str, Any]:
    """Formats a key/value pair into standard OpenTelemetry attribute structure."""
    if value is None:
        return {"key": key, "value": {"stringValue": ""}}
    if isinstance(value, bool):
        return {"key": key, "value": {"boolValue": value}}
    if isinstance(value, int):
        return {"key": key, "value": {"intValue": str(value)}}
    if isinstance(value, float):
        return {"key": key, "value": {"doubleValue": value}}
    if isinstance(value, (dict, list)):
        return {"key": key, "value": {"stringValue": json.dumps(value)}}
    return {"key": key, "value": {"stringValue": str(value)}}


class StreamToOtlpSynthesizer:
    """
    Consumes live OpenAI Agents API and Responses API streaming events and builds:
    1. Standard OpenTelemetry Protocol (OTLP) JSON trace with multi-agent hierarchy.
    2. Complete raw events audit trail.
    """

    def __init__(
        self,
        session_id: str,
        application_id: Optional[str] = None,
        repo_url: Optional[str] = None,
        model: str = "gpt-5.6-luna",
        instructions: Optional[str] = None,
        input_text: Optional[str] = None,
    ):
        self.session_id = session_id
        self.application_id = application_id or session_id
        self.repo_url = repo_url or ""
        self.model = model
        self.instructions = instructions or ""
        self.input_text = input_text or ""

        # Trace & Root Span IDs
        seed = f"{self.session_id}-{self.application_id}"
        self.trace_id = hashlib.md5(seed.encode("utf-8")).hexdigest()
        self.root_span_id = hashlib.sha1(f"root-{seed}".encode("utf-8")).hexdigest()[:16]

        now_ns = str(time.time_ns())
        self.start_ns = now_ns
        self.end_ns = now_ns
        self.turn_id: Optional[str] = None

        # Cumulative Usage Metrics
        self.usage: Dict[str, int] = {
            "input_tokens": 0,
            "output_tokens": 0,
            "cache_read_tokens": 0,
            "reasoning_tokens": 0,
            "total_tokens": 0,
        }

        # Lossless Raw Events Log
        self.raw_events: List[Dict[str, Any]] = []

        # Executive Outputs
        self.final_output_text: List[str] = []

        # ----------------------------------------------------
        # Multi-Agent State Tracking
        # ----------------------------------------------------
        # Agent registry: agent_name -> { span_id, start_ns, end_ns, instructions, parent_span_id }
        self.agents: Dict[str, Dict[str, Any]] = {}

        # Active tool spans by call_id: call_id -> dict
        self.active_tool_spans: Dict[str, Dict[str, Any]] = {}
        self.completed_tool_spans: List[Dict[str, Any]] = []

        # Active chat / generation spans: list of dicts
        self.chat_spans: List[Dict[str, Any]] = []
        self._current_chat_span: Optional[Dict[str, Any]] = None

        # Inter-agent message spans
        self.agent_message_spans: List[Dict[str, Any]] = []

        # Initialize the Coordinator (Root Agent)
        self._init_coordinator(now_ns)

    def _init_coordinator(self, start_ns: str) -> None:
        """Initializes the root coordinator agent context and first generation span."""
        self._start_new_chat_span(agent_name="coordinator", start_ns=start_ns)

    def _get_agent_span_id(self, agent_name: Optional[str]) -> str:
        """
        Resolves the parent span ID for an event.
        If attributed to a known subagent, returns the subagent's span ID.
        Otherwise returns the root coordinator span ID.
        """
        if not agent_name or agent_name in ("coordinator", "evaluator", "main"):
            return self.root_span_id

        # If subagent is not yet registered, register it on the fly
        if agent_name not in self.agents:
            subagent_span_id = _make_hex_id(f"agent-{agent_name}")
            now_ns = str(time.time_ns())
            self.agents[agent_name] = {
                "span_id": subagent_span_id,
                "name": agent_name,
                "parent_span_id": self.root_span_id,
                "start_ns": now_ns,
                "end_ns": now_ns,
                "instructions": f"Subagent specialized for {agent_name}",
                "status": "ok",
            }
        return self.agents[agent_name]["span_id"]

    def _start_new_chat_span(self, agent_name: Optional[str] = None, start_ns: Optional[str] = None) -> Dict[str, Any]:
        """Starts a new generation / chat span for the given agent."""
        if self._current_chat_span and not self._current_chat_span.get("ended"):
            self._close_current_chat_span(end_ns=start_ns or str(time.time_ns()))

        now_ns = start_ns or str(time.time_ns())
        agent_span_id = self._get_agent_span_id(agent_name)
        span_id = _make_hex_id(f"chat-{len(self.chat_spans)}")

        chat_span = {
            "span_id": span_id,
            "parent_span_id": agent_span_id,
            "agent_name": agent_name or "coordinator",
            "name": f"chat {self.model}",
            "kind": 3,  # SPAN_KIND_CLIENT
            "start_ns": now_ns,
            "end_ns": now_ns,
            "parts": [],
            "ended": False,
            "finish_reason": "stop",
        }
        self.chat_spans.append(chat_span)
        self._current_chat_span = chat_span
        return chat_span

    def _close_current_chat_span(self, end_ns: Optional[str] = None, finish_reason: str = "stop") -> None:
        """Closes the currently active chat span."""
        if self._current_chat_span and not self._current_chat_span.get("ended"):
            self._current_chat_span["end_ns"] = end_ns or str(time.time_ns())
            self._current_chat_span["ended"] = True
            self._current_chat_span["finish_reason"] = finish_reason

    def process_event(self, raw_event: Any) -> Dict[str, Any]:
        """
        Ingests a streaming event from the OpenAI Agents/Responses API.
        Extracts multi-agent routing, tool calls, stdout/stderr, reasoning, and usage.
        """
        data = _normalize_event(raw_event)
        self.raw_events.append(data)

        now_ns = str(time.time_ns())
        self.end_ns = now_ns

        # Session & Turn ID correlation
        self.session_id = data.get("session_id") or self.session_id
        if "turn" in data and isinstance(data["turn"], dict):
            self.turn_id = data["turn"].get("id") or self.turn_id
        elif "turn_id" in data:
            self.turn_id = data.get("turn_id") or self.turn_id

        event_type = str(data.get("type", ""))

        # ---------------------------------------------------------------------
        # 1. Lifecycle: Response Created / Turn Created
        # ---------------------------------------------------------------------
        if event_type in ("response.created", "agent.session.turn.created"):
            resp = data.get("response", {})
            if isinstance(resp, dict):
                created_at = resp.get("created_at")
                if created_at and isinstance(created_at, (int, float)):
                    self.start_ns = str(int(created_at * 1_000_000_000))
                self.model = resp.get("model") or self.model
            return data

        # ---------------------------------------------------------------------
        # 2. Extract Agent Attribution
        # ---------------------------------------------------------------------
        # Items may contain an explicit 'agent' object (e.g. {"agent_name": "..."})
        item = data.get("item") if isinstance(data.get("item"), dict) else data
        agent_obj = item.get("agent") if isinstance(item, dict) else None
        agent_name = None
        if isinstance(agent_obj, dict):
            agent_name = agent_obj.get("agent_name")
        elif isinstance(agent_obj, str):
            agent_name = agent_obj

        # ---------------------------------------------------------------------
        # 3. Multi-Agent Calls (spawn_agent, send_message, wait_agent)
        # ---------------------------------------------------------------------
        item_type = item.get("type", "")
        if event_type == "response.output_item.added" and item_type == "multi_agent_call":
            action = item.get("action", "")
            call_id = item.get("call_id") or item.get("id") or _make_hex_id("macall")
            raw_args = item.get("arguments", "{}")
            parsed_args = {}
            if isinstance(raw_args, str):
                try:
                    parsed_args = json.loads(raw_args)
                except Exception:
                    parsed_args = {"raw": raw_args}
            elif isinstance(raw_args, dict):
                parsed_args = raw_args

            target_agent = parsed_args.get("agent_name") or parsed_args.get("name") or "subagent"
            caller_agent = agent_name or "coordinator"
            caller_span_id = self._get_agent_span_id(caller_agent)

            if action in ("spawn_agent", "followup_task"):
                subagent_span_id = _make_hex_id(f"agent-{target_agent}")
                self.agents[target_agent] = {
                    "span_id": subagent_span_id,
                    "name": target_agent,
                    "parent_span_id": caller_span_id,
                    "start_ns": now_ns,
                    "end_ns": now_ns,
                    "instructions": parsed_args.get("instructions") or parsed_args.get("task") or "",
                    "status": "ok",
                }

            # Record the tool span for the multi-agent call itself
            self.active_tool_spans[call_id] = {
                "span_id": _make_hex_id(f"tool-{call_id}"),
                "parent_span_id": caller_span_id,
                "name": f"execute_tool multi_agent_call:{action}",
                "kind": 1,
                "start_ns": now_ns,
                "end_ns": now_ns,
                "tool_name": f"multi_agent_{action}",
                "tool_type": "multi_agent",
                "call_id": call_id,
                "arguments": raw_args if isinstance(raw_args, str) else json.dumps(raw_args),
                "result": "",
                "status": "ok",
            }
            return data

        if event_type == "response.output_item.done" and item_type == "multi_agent_call_output":
            call_id = item.get("call_id")
            if call_id and call_id in self.active_tool_spans:
                tool_span = self.active_tool_spans.pop(call_id)
                tool_span["end_ns"] = now_ns
                tool_span["result"] = json.dumps(item.get("output", []))
                self.completed_tool_spans.append(tool_span)
            return data

        # ---------------------------------------------------------------------
        # 4. Inter-Agent Communication (AgentMessage)
        # ---------------------------------------------------------------------
        if item_type == "agent_message":
            author = item.get("author") or "agent"
            recipient = item.get("recipient") or "coordinator"
            author_span_id = self._get_agent_span_id(author)
            msg_span_id = _make_hex_id(f"msg-{author}-{recipient}")
            self.agent_message_spans.append({
                "span_id": msg_span_id,
                "parent_span_id": author_span_id,
                "name": f"agent_message: {author} -> {recipient}",
                "kind": 1,
                "start_ns": now_ns,
                "end_ns": now_ns,
                "author": author,
                "recipient": recipient,
                "content": item.get("content", ""),
            })
            return data

        # ---------------------------------------------------------------------
        # 5. Reasoning Tokens / Chains of Thought
        # ---------------------------------------------------------------------
        if item_type == "reasoning" or "reasoning" in event_type:
            thought_text = ""
            if isinstance(item, dict):
                content = item.get("content") or item.get("summary") or item.get("text")
                if isinstance(content, list):
                    thought_text = " ".join(
                        c.get("text", "") for c in content if isinstance(c, dict)
                    )
                elif isinstance(content, str):
                    thought_text = content
                elif "delta" in data and isinstance(data["delta"], str):
                    thought_text = data["delta"]

            if thought_text:
                if not self._current_chat_span or self._current_chat_span.get("ended"):
                    self._start_new_chat_span(agent_name=agent_name, start_ns=now_ns)
                self._current_chat_span["parts"].append({
                    "type": "reasoning",
                    "content": thought_text,
                })
                self._current_chat_span["end_ns"] = now_ns
            return data

        # ---------------------------------------------------------------------
        # 6. Assistant Text Outputs (Executive Report & Commentary)
        # ---------------------------------------------------------------------
        if item_type in ("message", "output_text") or "output_text" in event_type or "delta" in data:
            delta_str = ""
            if "delta" in data and isinstance(data["delta"], str):
                delta_str = data["delta"]
            elif isinstance(item, dict):
                content = item.get("content", [])
                if isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and part.get("type") == "output_text":
                            delta_str += part.get("text", "")
                elif isinstance(content, str):
                    delta_str = content

            if delta_str:
                self.final_output_text.append(delta_str)
                if not self._current_chat_span or self._current_chat_span.get("ended"):
                    self._start_new_chat_span(agent_name=agent_name, start_ns=now_ns)
                self._current_chat_span["parts"].append({
                    "type": "text",
                    "content": delta_str,
                })
                self._current_chat_span["end_ns"] = now_ns
            return data

        # ---------------------------------------------------------------------
        # 7. Tool Calls (command_execution, shell, function, mcp, search, patch)
        # ---------------------------------------------------------------------
        is_tool_call_start = (
            event_type in ("response.output_item.added", "agent.session.turn.step.created")
            or "tool_call" in item_type
            or item_type in (
                "function_call", "shell_call", "local_shell_call",
                "mcp_call", "apply_patch_call", "file_search_call", "web_search_call"
            )
        )
        if is_tool_call_start and not item_type.endswith("_output"):
            call_id = (
                item.get("call_id")
                or item.get("id")
                or data.get("call_id")
                or data.get("id")
                or _make_hex_id("exec")
            )
            tool_name = (
                item.get("name")
                or item.get("tool")
                or item.get("tool_name")
                or (f"mcp:{item.get('server_label', '')}" if item_type == "mcp_call" else None)
                or (item_type.replace("_call", "") if item_type else "command_execution")
            )

            raw_args = (
                item.get("arguments")
                or item.get("action")
                or item.get("operation")
                or item.get("code")
                or data.get("arguments")
                or {}
            )
            args_str = raw_args if isinstance(raw_args, str) else json.dumps(raw_args)

            # Close active chat span with tool_call indicator
            if self._current_chat_span:
                self._current_chat_span["parts"].append({
                    "type": "tool_call",
                    "id": call_id,
                    "name": tool_name,
                    "arguments": raw_args,
                })
                self._close_current_chat_span(end_ns=now_ns, finish_reason="tool_call")

            parent_span_id = self._get_agent_span_id(agent_name)
            self.active_tool_spans[call_id] = {
                "span_id": _make_hex_id(f"tool-{call_id}"),
                "parent_span_id": parent_span_id,
                "name": f"execute_tool {tool_name}",
                "kind": 1,
                "start_ns": now_ns,
                "end_ns": now_ns,
                "tool_name": tool_name,
                "tool_type": "extension" if "command" in tool_name or "shell" in tool_name else "function",
                "call_id": call_id,
                "arguments": args_str,
                "result": "",
                "status": "ok",
                "agent_name": agent_name,
            }
            return data

        # ---------------------------------------------------------------------
        # 8. Tool Outputs (stdout, stderr, exit_code, function results)
        # ---------------------------------------------------------------------
        is_tool_output = (
            event_type in ("response.output_item.done", "agent.session.turn.step.completed")
            or item_type.endswith("_output")
            or "output" in item
        )
        if is_tool_output and (item.get("call_id") or data.get("call_id")):
            call_id = item.get("call_id") or data.get("call_id")
            if call_id and call_id in self.active_tool_spans:
                tool_span = self.active_tool_spans.pop(call_id)
                tool_span["end_ns"] = now_ns

                raw_output = (
                    item.get("output")
                    or item.get("result")
                    or data.get("output")
                    or data.get("result")
                    or ""
                )
                output_str = raw_output if isinstance(raw_output, str) else json.dumps(raw_output)
                tool_span["result"] = output_str

                # Determine status
                if item.get("status") == "failed" or "error" in item:
                    tool_span["status"] = "error"

                self.completed_tool_spans.append(tool_span)

                # Update subagent end timestamp
                if tool_span.get("agent_name") and tool_span["agent_name"] in self.agents:
                    self.agents[tool_span["agent_name"]]["end_ns"] = now_ns

                # Start next chat generation span for subsequent reasoning
                self._start_new_chat_span(agent_name=tool_span.get("agent_name"), start_ns=now_ns)
            return data

        # ---------------------------------------------------------------------
        # 9. Usage & Token Accounting
        # ---------------------------------------------------------------------
        usage_data = data.get("usage") or (
            data.get("response", {}).get("usage") if isinstance(data.get("response"), dict) else None
        )
        if isinstance(usage_data, dict):
            self.usage["input_tokens"] = usage_data.get("input_tokens") or self.usage["input_tokens"]
            self.usage["output_tokens"] = usage_data.get("output_tokens") or self.usage["output_tokens"]
            self.usage["total_tokens"] = usage_data.get("total_tokens") or (
                self.usage["input_tokens"] + self.usage["output_tokens"]
            )
            # Token details
            in_details = usage_data.get("input_token_details", {})
            if isinstance(in_details, dict):
                self.usage["cache_read_tokens"] = in_details.get("cached_tokens") or self.usage["cache_read_tokens"]
            out_details = usage_data.get("output_token_details", {})
            if isinstance(out_details, dict):
                self.usage["reasoning_tokens"] = out_details.get("reasoning_tokens") or self.usage["reasoning_tokens"]

        return data

    def build_otlp_document(self) -> Dict[str, Any]:
        """
        Synthesizes the complete OpenTelemetry Protocol (OTLP) JSON trace document.
        Flushes all open spans and attributes them into standard OTLP structures.
        """
        now_ns = str(time.time_ns())
        self.end_ns = now_ns

        # 1. Close any hanging chat spans
        self._close_current_chat_span(end_ns=now_ns, finish_reason="stop")

        # 2. Flush any unclosed tool spans
        for call_id, tool_span in list(self.active_tool_spans.items()):
            tool_span["end_ns"] = now_ns
            self.completed_tool_spans.append(tool_span)
        self.active_tool_spans.clear()

        # 3. Assemble all OTLP Span Dictionaries
        otlp_spans: List[Dict[str, Any]] = []

        # ---------------------------------------------------------------------
        # Span A: Root Coordinator Span ("invoke_agent")
        # ---------------------------------------------------------------------
        full_executive_summary = "".join(self.final_output_text).strip()
        root_attributes = [
            _format_otlp_attribute("gen_ai.operation.name", "invoke_agent"),
            _format_otlp_attribute("gen_ai.provider.name", "openai"),
            _format_otlp_attribute("gen_ai.agent.id", f"agent_{self.session_id[:16]}"),
            _format_otlp_attribute("gen_ai.request.model", self.model),
            _format_otlp_attribute("gen_ai.system_instructions", [
                {"type": "text", "content": self.instructions}
            ] if self.instructions else []),
            _format_otlp_attribute("gen_ai.input.messages", [
                {"role": "user", "parts": [{"type": "text", "content": self.input_text}]}
            ] if self.input_text else []),
            _format_otlp_attribute("gen_ai.output.messages", [
                {"role": "assistant", "parts": [{"type": "text", "content": full_executive_summary}], "finish_reason": "stop"}
            ] if full_executive_summary else []),
            # Token metrics
            _format_otlp_attribute("gen_ai.usage.input_tokens", self.usage["input_tokens"]),
            _format_otlp_attribute("gen_ai.usage.cache_read.input_tokens", self.usage["cache_read_tokens"]),
            _format_otlp_attribute("gen_ai.usage.output_tokens", self.usage["output_tokens"]),
            _format_otlp_attribute("gen_ai.usage.reasoning.output_tokens", self.usage["reasoning_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.input_tokens", self.usage["input_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.cache_read.input_tokens", self.usage["cache_read_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.output_tokens", self.usage["output_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.reasoning_tokens", self.usage["reasoning_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.reasoning.output_tokens", self.usage["reasoning_tokens"]),
            _format_otlp_attribute("openai.managed_agents.usage.total.total_tokens", self.usage["total_tokens"]),
            # Correlation IDs
            _format_otlp_attribute("gen_ai.conversation.id", self.session_id),
            _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
        ]
        if self.turn_id:
            root_attributes.append(_format_otlp_attribute("openai.managed_agents.turn.id", self.turn_id))

        root_span = {
            "traceId": self.trace_id,
            "spanId": self.root_span_id,
            "traceState": "",
            "parentSpanId": None,
            "flags": 1,
            "name": "invoke_agent",
            "kind": 1,  # SPAN_KIND_INTERNAL
            "startTimeUnixNano": self.start_ns,
            "endTimeUnixNano": self.end_ns,
            "attributes": root_attributes,
            "droppedAttributesCount": 0,
            "events": [],
            "droppedEventsCount": 0,
            "links": [],
            "droppedLinksCount": 0,
            "status": None,
        }
        otlp_spans.append(root_span)

        # ---------------------------------------------------------------------
        # Span B: Subagent Spans ("invoke_agent: <agent_name>")
        # ---------------------------------------------------------------------
        for agent_name, agent_meta in self.agents.items():
            subagent_attrs = [
                _format_otlp_attribute("gen_ai.operation.name", "invoke_agent"),
                _format_otlp_attribute("gen_ai.provider.name", "openai"),
                _format_otlp_attribute("gen_ai.agent.name", agent_name),
                _format_otlp_attribute("gen_ai.agent.role", "subagent"),
                _format_otlp_attribute("gen_ai.request.model", self.model),
                _format_otlp_attribute("gen_ai.system_instructions", [
                    {"type": "text", "content": agent_meta.get("instructions", "")}
                ]),
                _format_otlp_attribute("gen_ai.conversation.id", self.session_id),
                _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
            ]
            if self.turn_id:
                subagent_attrs.append(_format_otlp_attribute("openai.managed_agents.turn.id", self.turn_id))

            subagent_span = {
                "traceId": self.trace_id,
                "spanId": agent_meta["span_id"],
                "traceState": "",
                "parentSpanId": agent_meta.get("parent_span_id") or self.root_span_id,
                "flags": 1,
                "name": f"invoke_agent {agent_name}",
                "kind": 1,
                "startTimeUnixNano": agent_meta["start_ns"],
                "endTimeUnixNano": agent_meta["end_ns"],
                "attributes": subagent_attrs,
                "droppedAttributesCount": 0,
                "events": [],
                "droppedEventsCount": 0,
                "links": [],
                "droppedLinksCount": 0,
                "status": None,
            }
            otlp_spans.append(subagent_span)

        # ---------------------------------------------------------------------
        # Span C: Chat / Generation Spans ("chat <model>")
        # ---------------------------------------------------------------------
        for chat in self.chat_spans:
            if not chat["parts"]:
                continue
            chat_attrs = [
                _format_otlp_attribute("gen_ai.operation.name", "chat"),
                _format_otlp_attribute("gen_ai.provider.name", "openai"),
                _format_otlp_attribute("gen_ai.request.model", self.model),
                _format_otlp_attribute("gen_ai.output.messages", [
                    {"role": "assistant", "parts": chat["parts"], "finish_reason": chat["finish_reason"]}
                ]),
                _format_otlp_attribute("gen_ai.conversation.id", self.session_id),
                _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
            ]
            if chat.get("agent_name"):
                chat_attrs.append(_format_otlp_attribute("gen_ai.agent.name", chat["agent_name"]))
            if self.turn_id:
                chat_attrs.append(_format_otlp_attribute("openai.managed_agents.turn.id", self.turn_id))

            otlp_spans.append({
                "traceId": self.trace_id,
                "spanId": chat["span_id"],
                "traceState": "",
                "parentSpanId": chat["parent_span_id"],
                "flags": 1,
                "name": chat["name"],
                "kind": chat["kind"],
                "startTimeUnixNano": chat["start_ns"],
                "endTimeUnixNano": chat["end_ns"],
                "attributes": chat_attrs,
                "droppedAttributesCount": 0,
                "events": [],
                "droppedEventsCount": 0,
                "links": [],
                "droppedLinksCount": 0,
                "status": None,
            })

        # ---------------------------------------------------------------------
        # Span D: Tool Execution Spans ("execute_tool <name>")
        # ---------------------------------------------------------------------
        for tool in self.completed_tool_spans:
            tool_attrs = [
                _format_otlp_attribute("gen_ai.operation.name", "execute_tool"),
                _format_otlp_attribute("gen_ai.provider.name", "openai"),
                _format_otlp_attribute("gen_ai.tool.name", tool["tool_name"]),
                _format_otlp_attribute("gen_ai.tool.type", tool["tool_type"]),
                _format_otlp_attribute("gen_ai.tool.call.id", tool["call_id"]),
                _format_otlp_attribute("gen_ai.tool.call.arguments", tool["arguments"]),
                _format_otlp_attribute("gen_ai.tool.call.result", tool["result"]),
                _format_otlp_attribute("gen_ai.conversation.id", self.session_id),
                _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
            ]
            if tool.get("agent_name"):
                tool_attrs.append(_format_otlp_attribute("gen_ai.agent.name", tool["agent_name"]))
            if self.turn_id:
                tool_attrs.append(_format_otlp_attribute("openai.managed_agents.turn.id", self.turn_id))

            otlp_spans.append({
                "traceId": self.trace_id,
                "spanId": tool["span_id"],
                "traceState": "",
                "parentSpanId": tool["parent_span_id"],
                "flags": 1,
                "name": tool["name"],
                "kind": tool["kind"],
                "startTimeUnixNano": tool["start_ns"],
                "endTimeUnixNano": tool["end_ns"],
                "attributes": tool_attrs,
                "droppedAttributesCount": 0,
                "events": [],
                "droppedEventsCount": 0,
                "links": [],
                "droppedLinksCount": 0,
                "status": {"code": 2, "message": "error"} if tool.get("status") == "error" else None,
            })

        # ---------------------------------------------------------------------
        # Span E: Inter-Agent Communication Spans ("agent_message")
        # ---------------------------------------------------------------------
        for msg in self.agent_message_spans:
            msg_attrs = [
                _format_otlp_attribute("gen_ai.operation.name", "send_message"),
                _format_otlp_attribute("gen_ai.provider.name", "openai"),
                _format_otlp_attribute("gen_ai.agent.source", msg["author"]),
                _format_otlp_attribute("gen_ai.agent.target", msg["recipient"]),
                _format_otlp_attribute("gen_ai.message.content", msg["content"]),
                _format_otlp_attribute("gen_ai.conversation.id", self.session_id),
                _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
            ]
            if self.turn_id:
                msg_attrs.append(_format_otlp_attribute("openai.managed_agents.turn.id", self.turn_id))

            otlp_spans.append({
                "traceId": self.trace_id,
                "spanId": msg["span_id"],
                "traceState": "",
                "parentSpanId": msg["parent_span_id"],
                "flags": 1,
                "name": msg["name"],
                "kind": msg["kind"],
                "startTimeUnixNano": msg["start_ns"],
                "endTimeUnixNano": msg["end_ns"],
                "attributes": msg_attrs,
                "droppedAttributesCount": 0,
                "events": [],
                "droppedEventsCount": 0,
                "links": [],
                "droppedLinksCount": 0,
                "status": None,
            })

        # Return standard OpenTelemetry Protocol envelope
        return {
            "resourceSpans": [
                {
                    "resource": {
                        "attributes": [
                            _format_otlp_attribute("service.name", "openai-managed-agents"),
                            _format_otlp_attribute("openai.managed_agents.session.id", self.session_id),
                        ],
                        "droppedAttributesCount": 0,
                        "entityRefs": [],
                    },
                    "scopeSpans": [
                        {
                            "scope": {
                                "name": "openai.managed_agents",
                                "version": "0.0.0",
                                "attributes": [],
                                "droppedAttributesCount": 0,
                            },
                            "spans": otlp_spans,
                            "schemaUrl": "https://opentelemetry.io/schemas/1.42.0",
                        }
                    ],
                    "schemaUrl": "",
                }
            ]
        }

    def get_raw_events(self) -> List[Dict[str, Any]]:
        """Returns the full sequential list of raw streaming events."""
        return self.raw_events
