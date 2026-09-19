"""
Unit test suite for StreamToOtlpSynthesizer.
Verifies multi-agent hierarchy, tool call correlation, token metrics, and OTLP schema compliance.
"""

import json
import unittest
from stream_to_otlp import StreamToOtlpSynthesizer


class TestStreamToOtlpSynthesizer(unittest.TestCase):

    def test_single_agent_stream(self):
        """Simulate single coordinator agent with reasoning, tool call, and completion."""
        session_id = "sess_test_12345"
        synth = StreamToOtlpSynthesizer(
            session_id=session_id,
            application_id="app-test-01",
            repo_url="https://github.com/test/repo.git",
            model="gpt-5.6-luna",
            instructions="Evaluate candidate repository",
            input_text="Inspect this repo",
        )

        # 1. response.created
        synth.process_event({
            "type": "response.created",
            "response": {
                "id": "resp_001",
                "created_at": 1789737881,
                "model": "gpt-5.6-luna"
            }
        })

        # 2. reasoning thoughts
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "reasoning",
                "content": "Analyzing repository structure first."
            }
        })

        # 3. text commentary
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "message",
                "content": [{"type": "output_text", "text": "Starting Git forensics..."}]
            }
        })

        # 4. tool call started
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "function_call",
                "call_id": "call_git_001",
                "name": "command_execution",
                "arguments": json.dumps({"command": "git status --short"})
            }
        })

        # 5. tool call finished
        synth.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "function_call_output",
                "call_id": "call_git_001",
                "output": "M README.md"
            }
        })

        # 6. final output text & response.done
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "message",
                "content": [{"type": "output_text", "text": "Audit complete. Published report."}]
            }
        })

        synth.process_event({
            "type": "response.done",
            "response": {
                "usage": {
                    "input_tokens": 15000,
                    "output_tokens": 500,
                    "total_tokens": 15500,
                    "input_token_details": {"cached_tokens": 12000},
                    "output_token_details": {"reasoning_tokens": 120}
                }
            }
        })

        otlp = synth.build_otlp_document()

        # Validate OTLP Envelope
        self.assertIn("resourceSpans", otlp)
        resource_spans = otlp["resourceSpans"]
        self.assertEqual(len(resource_spans), 1)

        scope_spans = resource_spans[0]["scopeSpans"]
        self.assertEqual(len(scope_spans), 1)

        spans = scope_spans[0]["spans"]
        self.assertTrue(len(spans) >= 3, f"Expected at least 3 spans, got {len(spans)}")

        # Root span validation
        root = next((s for s in spans if s["name"] == "invoke_agent"), None)
        self.assertIsNotNone(root)
        self.assertIsNone(root["parentSpanId"])

        # Tool span validation
        tool = next((s for s in spans if "execute_tool" in s["name"]), None)
        self.assertIsNotNone(tool)
        self.assertEqual(tool["parentSpanId"], root["spanId"])
        tool_call_id_attr = next(
            (a["value"]["stringValue"] for a in tool["attributes"] if a["key"] == "gen_ai.tool.call.id"),
            None
        )
        self.assertEqual(tool_call_id_attr, "call_git_001")

        # Usage attribute validation
        input_tokens_attr = next(
            (a["value"]["intValue"] for a in root["attributes"] if a["key"] == "gen_ai.usage.input_tokens"),
            None
        )
        self.assertEqual(input_tokens_attr, "15000")

    def test_multi_agent_stream(self):
        """Simulate coordinator spawning subagents, subagent tool calls, and inter-agent messages."""
        session_id = "sess_multi_agent_999"
        synth = StreamToOtlpSynthesizer(
            session_id=session_id,
            application_id="app-multi-01",
            repo_url="https://github.com/candidate/fullstack.git",
            model="gpt-5.6-luna",
            instructions="Multi-agent evaluation",
            input_text="Perform full audit",
        )

        # 1. response.created
        synth.process_event({
            "type": "response.created",
            "response": {"id": "resp_multi_01", "created_at": 1789737881, "model": "gpt-5.6-luna"}
        })

        # 2. Coordinator spawns git-forensics-evaluator subagent
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "multi_agent_call",
                "action": "spawn_agent",
                "call_id": "spawn_001",
                "arguments": json.dumps({
                    "agent_name": "git-forensics-evaluator",
                    "instructions": "Inspect commit frequency and author history."
                })
            }
        })
        synth.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "multi_agent_call_output",
                "action": "spawn_agent",
                "call_id": "spawn_001",
                "output": [{"type": "output_text", "text": "Agent spawned successfully."}]
            }
        })

        # 3. Subagent executes a git command
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "shell_call",
                "call_id": "call_sh_001",
                "agent": {"agent_name": "git-forensics-evaluator"},
                "action": {"commands": ["git log -10 --oneline"]}
            }
        })
        synth.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "shell_call_output",
                "call_id": "call_sh_001",
                "agent": {"agent_name": "git-forensics-evaluator"},
                "output": [{"stdout": "bb7e7bb Initial commit\n", "exit_code": 0}]
            }
        })

        # 4. Subagent sends findings back to coordinator via AgentMessage
        synth.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "agent_message",
                "author": "git-forensics-evaluator",
                "recipient": "coordinator",
                "content": "Git analysis complete: 10 commits by 1 author."
            }
        })

        # 5. Coordinator concludes
        synth.process_event({
            "type": "response.done",
            "response": {
                "usage": {
                    "input_tokens": 50000,
                    "output_tokens": 2000,
                    "total_tokens": 52000,
                }
            }
        })

        otlp = synth.build_otlp_document()
        spans = otlp["resourceSpans"][0]["scopeSpans"][0]["spans"]

        root = next((s for s in spans if s["name"] == "invoke_agent"), None)
        self.assertIsNotNone(root)

        # Verify subagent span exists
        subagent = next((s for s in spans if s["name"] == "invoke_agent git-forensics-evaluator"), None)
        self.assertIsNotNone(subagent)
        # Verify subagent is parented by root
        self.assertEqual(subagent["parentSpanId"], root["spanId"])

        # Verify subagent tool span exists and is parented by SUBAGENT (not root!)
        subagent_tool = next((s for s in spans if s.get("attributes") and any(
            a["key"] == "gen_ai.tool.call.id" and a["value"]["stringValue"] == "call_sh_001" for a in s["attributes"]
        )), None)
        self.assertIsNotNone(subagent_tool)
        self.assertEqual(
            subagent_tool["parentSpanId"],
            subagent["spanId"],
            "Subagent tool must have parentSpanId = subagent.spanId!"
        )

        # Verify agent_message span exists
        msg_span = next((s for s in spans if "agent_message" in s["name"]), None)
        self.assertIsNotNone(msg_span)
        self.assertEqual(msg_span["parentSpanId"], subagent["spanId"])


if __name__ == "__main__":
    unittest.main()
