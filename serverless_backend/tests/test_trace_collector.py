"""
Unit tests for TraceCollector (Lossless Raw + Structured Trace).
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent / "evaluator_function"))

from trace_collector import TraceCollector


def test_trace_collector_lossless_capture():
    collector = TraceCollector(
        session_id="sess_test123",
        repo_url="https://github.com/example/candidate-repo.git",
        application_id="app-123456"
    )

    # 1. Lifecycle event
    collector.process_event({
        "type": "agent.session.created",
        "session_id": "sess_test123"
    })

    # 2. Reasoning delta
    collector.process_event({
        "type": "agent.session.turn.reasoning.delta",
        "delta": "Candidate repository detected as a FastAPI service."
    })
    collector.process_event({
        "type": "agent.session.turn.reasoning.completed"
    })

    # 3. Sandbox command event
    collector.process_event({
        "type": "agent.session.tool_call",
        "item": {
            "command": "pytest --maxfail=1",
            "output": "18 passed, 0 failed in 1.4s",
            "exit_code": 0,
            "duration_ms": 1400
        }
    })

    # 4. Output text delta (report generation)
    collector.process_event({
        "type": "agent.session.turn.output_text.delta",
        "delta": "# Candidate Intelligence Report\n\nRecommendation: HIRE."
    })

    # Finalize
    trace_doc = collector.finalize()

    # Assertions
    assert trace_doc["application_id"] == "app-123456"
    assert trace_doc["session_id"] == "sess_test123"

    # Lossless capture check
    assert len(trace_doc["raw_events"]) == 5
    assert trace_doc["raw_events"][0]["type"] == "agent.session.created"

    # Structured sections check
    structured = trace_doc["structured_trace"]
    assert len(structured["reasoning_entries"]) >= 1
    assert "FastAPI" in structured["reasoning_entries"][0]["thought"]

    assert len(structured["commands_executed"]) == 1
    cmd = structured["commands_executed"][0]
    assert cmd["command"] == "pytest --maxfail=1"
    assert "18 passed" in cmd["output"]
    assert cmd["exit_code"] == 0

    assert structured["accumulated_text_length"] > 0
    print("[Test] TraceCollector lossless capture passed successfully!")


if __name__ == "__main__":
    test_trace_collector_lossless_capture()
