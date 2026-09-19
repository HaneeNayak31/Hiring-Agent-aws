# serverless_backend/evaluator_function/test_stream_recorder.py
import unittest
from stream_recorder import StreamRecorder


class TestStreamRecorder(unittest.TestCase):
    def test_multi_agent_flow(self):
        recorder = StreamRecorder(
            session_id="sess_test_123",
            application_id="app_test_456",
            repo_url="https://github.com/test/repo.git",
            model="gpt-5.6-luna",
        )

        # 1. Response created
        recorder.process_event({
            "type": "response.created",
            "response": {"id": "sess_test_123", "model": "gpt-5.6-luna"},
        })

        # 2. Coordinator starts reasoning
        recorder.process_event({
            "type": "agent.reasoning.delta",
            "delta": "Formulating inspection strategy for repository...",
            "agent": "coordinator",
        })
        recorder.process_event({
            "type": "agent.reasoning.delta",
            "delta": " Assigning git forensics subagent to analyze commits.",
            "agent": "coordinator",
        })
        recorder.process_event({
            "type": "agent.reasoning.completed",
            "agent": "coordinator",
        })

        # 3. Coordinator spawns git-forensics-evaluator
        recorder.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "multi_agent_call",
                "call_id": "call_spawn_1",
                "action": "spawn_agent",
                "agent": "coordinator",
                "arguments": '{"agent_name": "git-forensics-evaluator", "task": "Inspect commit frequency"}',
            },
        })
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "multi_agent_call_output",
                "call_id": "call_spawn_1",
                "output": [{"text": "Agent spawned"}],
            },
        })

        # 4. Subagent executes shell command
        recorder.process_event({
            "type": "response.output_item.added",
            "item": {
                "type": "shell_call",
                "call_id": "call_shell_1",
                "agent": "git-forensics-evaluator",
                "action": {
                    "commands": ["git log --oneline -n 10"],
                    "working_directory": "/workspace/repo",
                },
            },
        })
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "shell_call_output",
                "call_id": "call_shell_1",
                "agent": "git-forensics-evaluator",
                "output": [
                    {
                        "stdout": "c3f81e2 feat: add serverless backend\nb4d90a1 fix: handle dynamo errors\n",
                        "stderr": "",
                        "outcome": {"type": "exit", "exit_code": 0},
                    }
                ],
            },
        })

        # 5. Subagent sends message back to coordinator
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {
                "type": "agent_message",
                "author": "git-forensics-evaluator",
                "recipient": "coordinator",
                "content": "Commit history verified: 10 authentic commits detected with verified PGP signatures.",
            },
        })

        # 6. Coordinator emits assistant findings
        recorder.process_event({
            "type": "response.output_text.delta",
            "agent": "coordinator",
            "delta": "### Candidate Assessment\nCommit cadence shows consistent manual development.",
        })
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {"type": "message", "agent": "coordinator"},
        })

        # 7. Response completion with usage
        recorder.process_event({
            "type": "response.done",
            "response": {
                "usage": {
                    "input_tokens": 1200,
                    "output_tokens": 450,
                    "total_tokens": 1650,
                    "output_tokens_details": {"reasoning_tokens": 180},
                }
            },
        })

        doc = recorder.finish()

        # Validations
        self.assertEqual(doc["session_id"], "sess_test_123")
        self.assertEqual(doc["model"], "gpt-5.6-luna")
        self.assertEqual(doc["status"], "completed")
        self.assertEqual(len(doc["agents"]), 2)  # coordinator + git-forensics-evaluator

        agent_ids = [a["id"] for a in doc["agents"]]
        self.assertIn("coordinator", agent_ids)
        self.assertIn("git-forensics-evaluator", agent_ids)

        items = doc["items"]
        item_types = [i["type"] for i in items]
        self.assertIn("reasoning", item_types)
        self.assertIn("multi_agent_call", item_types)
        self.assertIn("shell_call", item_types)
        self.assertIn("agent_message", item_types)
        self.assertIn("message", item_types)

        # Check shell call item
        shell_item = next(i for i in items if i["type"] == "shell_call")
        self.assertEqual(shell_item["agent"], "git-forensics-evaluator")
        self.assertEqual(shell_item["command"], "git log --oneline -n 10")
        self.assertEqual(shell_item["exit_code"], 0)
        self.assertIn("feat: add serverless backend", shell_item["stdout"])

        # Check agent message
        msg_item = next(i for i in items if i["type"] == "agent_message")
        self.assertEqual(msg_item["author"], "git-forensics-evaluator")
        self.assertEqual(msg_item["recipient"], "coordinator")

        # Check usage
        self.assertEqual(doc["usage"]["input_tokens"], 1200)
        self.assertEqual(doc["usage"]["output_tokens"], 450)
        self.assertEqual(doc["usage"]["reasoning_tokens"], 180)
        self.assertEqual(doc["usage"]["total_tokens"], 1650)

    def test_real_openai_responses_stream(self):
        """Test exact official OpenAI Responses API stream format with argument deltas."""
        recorder = StreamRecorder(session_id="sess_real_openai_123")

        # 1. Response created
        recorder.process_event({
            "type": "response.created",
            "response": {"id": "sess_real_openai_123", "model": "gpt-5.6-luna"}
        })

        # 2. Reasoning deltas (OpenAI format: response.reasoning_text.delta)
        recorder.process_event({
            "type": "response.reasoning_text.delta",
            "item_id": "r_1",
            "delta": "Thinking through the repo structure and git cadence..."
        })
        recorder.process_event({
            "type": "response.reasoning_text.delta",
            "item_id": "r_1",
            "delta": " Next step is to execute git log via bash."
        })
        recorder.process_event({
            "type": "response.reasoning_text.done",
            "item_id": "r_1"
        })

        # 3. Model generates tool call: response.output_item.added with empty arguments
        call_id = "exec-09596574-3f06-4908-812c-121cc3d35868"
        recorder.process_event({
            "type": "response.output_item.added",
            "item": {
                "id": call_id,
                "call_id": call_id,
                "type": "function_call",
                "name": "command_execution",
                "arguments": ""
            }
        })

        # 4. Arguments stream incrementally
        recorder.process_event({
            "type": "response.function_call_arguments.delta",
            "call_id": call_id,
            "delta": '{"command": "/bin/bash -lc \\"git log -1 --format=\'%H%n%an\'\\""'
        })
        recorder.process_event({
            "type": "response.function_call_arguments.delta",
            "call_id": call_id,
            "delta": ', "cwd": "/workspace"}'
        })
        recorder.process_event({
            "type": "response.function_call_arguments.done",
            "call_id": call_id,
            "arguments": '{"command": "/bin/bash -lc \\"git log -1 --format=\'%H%n%an\'\\"", "cwd": "/workspace"}'
        })

        # 5. Output item done for function generation
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {
                "id": call_id,
                "call_id": call_id,
                "type": "function_call",
                "name": "command_execution",
                "arguments": '{"command": "/bin/bash -lc \\"git log -1 --format=\'%H%n%an\'\\"", "cwd": "/workspace"}'
            }
        })

        # 6. Sandbox executes tool and returns output via function_call_output
        recorder.process_event({
            "type": "response.output_item.added",
            "item": {
                "id": f"out-{call_id}",
                "call_id": call_id,
                "type": "function_call_output",
                "output": '{"output": "bb7e7bb821030502c5e9625f1736d064ddb4c41d\\nJainil Patel\\n"}'
            }
        })
        recorder.process_event({
            "type": "response.output_item.done",
            "item": {
                "id": f"out-{call_id}",
                "call_id": call_id,
                "type": "function_call_output",
                "output": '{"output": "bb7e7bb821030502c5e9625f1736d064ddb4c41d\\nJainil Patel\\n"}'
            }
        })

        # 7. Model emits commentary text
        recorder.process_event({
            "type": "response.output_text.delta",
            "delta": "Repository log verified: latest commit authored by Jainil Patel."
        })

        # 8. Turn completes
        recorder.process_event({
            "type": "response.done",
            "response": {
                "usage": {
                    "input_tokens": 500,
                    "output_tokens": 150,
                    "total_tokens": 650,
                    "output_tokens_details": {"reasoning_tokens": 60}
                }
            }
        })

        doc = recorder.finish()

        # Check reasoning item
        reasoning_item = next(i for i in doc["items"] if i["type"] == "reasoning")
        self.assertEqual(reasoning_item["status"], "completed")
        self.assertIn("Thinking through the repo structure", reasoning_item["content"])

        # Check shell call item (must be type: shell_call, NOT generic tool_call!)
        shell_items = [i for i in doc["items"] if i["type"] == "shell_call"]
        self.assertEqual(len(shell_items), 1)
        shell = shell_items[0]
        self.assertEqual(shell["status"], "completed")
        self.assertEqual(shell["cwd"], "/workspace")
        self.assertIn("git log -1", shell["command"])
        self.assertIn("Jainil Patel", shell["stdout"])
        self.assertEqual(shell["exit_code"], 0)


if __name__ == "__main__":
    unittest.main()
