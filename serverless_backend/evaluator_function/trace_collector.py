"""
Lossless Trace Collector for OpenAI Agents API sessions.
Captures 100% of raw events (including all reasoning tokens, deltas, and lifecycle events)
while simultaneously structuring terminal commands, stdout/stderr, tool calls, and thoughts
into a high-fidelity flight recorder JSON for the Recruiter UI.
"""

from __future__ import annotations
import json
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union


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


class TraceCollector:
    """
    Consumes live OpenAI Agents API streaming events and builds:
    1. 'raw_events': Lossless sequential log of all emitted event dictionaries.
    2. 'structured_trace': Pre-indexed commands, stdout/stderr, reasoning chain, and tool calls.
    """

    def __init__(
        self,
        session_id: str,
        repo_url: str,
        application_id: Optional[str] = None
    ):
        self.session_id = session_id
        self.repo_url = repo_url
        self.application_id = application_id or f"app-{session_id[:8]}"
        self.started_at = datetime.now(timezone.utc).isoformat()
        self.completed_at: Optional[str] = None

        # 1. Lossless Raw Log
        self.raw_events: List[Dict[str, Any]] = []

        # 2. Structured Sections for Recruiter Flight Recorder
        self.reasoning_entries: List[Dict[str, Any]] = []
        self.commands_executed: List[Dict[str, Any]] = []
        self.tool_calls: List[Dict[str, Any]] = []
        self.accumulated_text_chunks: List[str] = []
        self.artifacts_published: List[str] = []

        # Internal trackers
        self._current_thought_chunks: List[str] = []

    def process_event(self, raw_event: Any) -> Dict[str, Any]:
        """
        Processes a single streaming event from client.beta.agents.sessions.create(stream=True).
        """
        data = _normalize_event(raw_event)
        self.raw_events.append(data)

        event_type = data.get("type", "")
        now_str = datetime.now(timezone.utc).isoformat()

        # ----------------------------------------------------
        # A. Capture Reasoning Tokens / Thoughts
        # ----------------------------------------------------
        # 1. Reasoning token deltas
        if "reasoning" in event_type and "delta" in event_type:
            delta = data.get("delta") or data.get("reasoning", "")
            if isinstance(delta, str) and delta:
                self._current_thought_chunks.append(delta)

        # 2. Reasoning turn completed or discrete thought block
        elif "reasoning" in event_type and ("completed" in event_type or "entry" in event_type):
            full_thought = "".join(self._current_thought_chunks).strip()
            if not full_thought:
                full_thought = str(data.get("reasoning") or data.get("thought") or "")
            if full_thought:
                self.reasoning_entries.append({
                    "timestamp": now_str,
                    "event_type": event_type,
                    "thought": full_thought
                })
            self._current_thought_chunks = []

        # 3. Direct reasoning / thought fields in general events
        reasoning_direct = (
            data.get("reasoning")
            or data.get("thought")
            or (data.get("item", {}).get("reasoning") if isinstance(data.get("item"), dict) else None)
        )
        if reasoning_direct and isinstance(reasoning_direct, str) and reasoning_direct.strip():
            self.reasoning_entries.append({
                "timestamp": now_str,
                "event_type": event_type,
                "thought": reasoning_direct.strip()
            })

        # ----------------------------------------------------
        # B. Capture Sandbox Commands & Terminal Outputs
        # ----------------------------------------------------
        item = data.get("item")
        if isinstance(item, dict):
            command = item.get("command") or item.get("cmd")
            output = item.get("output") or item.get("stdout") or item.get("stderr")
            exit_code = item.get("exit_code") or item.get("status")

            if command or output:
                self.commands_executed.append({
                    "timestamp": now_str,
                    "command": command or "unknown_command",
                    "output": output or "",
                    "exit_code": exit_code if exit_code is not None else 0,
                    "duration_ms": item.get("duration_ms", 0)
                })

        # Tool calls format
        if "tool_call" in event_type or "action" in event_type:
            tool_name = data.get("name") or data.get("tool") or data.get("tool_name")
            tool_args = data.get("arguments") or data.get("args") or data.get("input")
            if tool_name:
                self.tool_calls.append({
                    "timestamp": now_str,
                    "tool_name": tool_name,
                    "arguments": tool_args
                })

        # ----------------------------------------------------
        # C. Output Text Deltas (Report Text)
        # ----------------------------------------------------
        if event_type == "agent.session.turn.output_text.delta":
            delta_text = data.get("delta", "")
            if delta_text:
                self.accumulated_text_chunks.append(delta_text)

        # ----------------------------------------------------
        # D. Artifact Ready Event
        # ----------------------------------------------------
        if event_type == "agent.artifact.ready":
            fname = data.get("filename")
            if fname and fname not in self.artifacts_published:
                self.artifacts_published.append(fname)

        return data

    def finalize(self) -> Dict[str, Any]:
        """
        Closes any pending thought blocks and marks execution completed.
        Returns the complete dual-layer flight recorder trace dictionary.
        """
        self.completed_at = datetime.now(timezone.utc).isoformat()

        # Flush any remaining thought chunks
        if self._current_thought_chunks:
            remaining = "".join(self._current_thought_chunks).strip()
            if remaining:
                self.reasoning_entries.append({
                    "timestamp": self.completed_at,
                    "event_type": "agent.reasoning.flush",
                    "thought": remaining
                })
            self._current_thought_chunks = []

        # Synthesize reasoning summary
        reasoning_summary = ""
        if self.reasoning_entries:
            # First and last thought or combined excerpt
            thoughts = [r["thought"] for r in self.reasoning_entries if len(r["thought"]) > 20]
            reasoning_summary = " -> ".join(thoughts[:3]) if thoughts else "Evaluated repository."

        full_output_text = "".join(self.accumulated_text_chunks)

        # Build final trace document
        trace_doc = {
            "application_id": self.application_id,
            "session_id": self.session_id,
            "candidate_repo": self.repo_url,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "summary_metrics": {
                "total_raw_events": len(self.raw_events),
                "total_commands_run": len(self.commands_executed),
                "total_reasoning_steps": len(self.reasoning_entries),
                "artifacts_count": len(self.artifacts_published),
            },
            "structured_trace": {
                "reasoning_summary": reasoning_summary,
                "reasoning_entries": self.reasoning_entries,
                "commands_executed": self.commands_executed,
                "tool_calls": self.tool_calls,
                "published_artifacts": self.artifacts_published,
                "accumulated_text_length": len(full_output_text)
            },
            "raw_events": self.raw_events
        }

        return trace_doc
