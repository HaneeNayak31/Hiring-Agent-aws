# serverless_backend/evaluator_function/test_session_store.py
import unittest
from unittest.mock import patch, MagicMock
import tempfile
import os
import shutil
import json
from pathlib import Path

from session_store import (
    create_session,
    record_event,
    complete_session,
    get_session,
    list_sessions,
    _synthesize_legacy_events,
    sync_to_s3,
)


class TestSessionStore(unittest.TestCase):
    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        from pathlib import Path
        self.patcher = patch("session_store.REPORTS_DIR", Path(self.test_dir))
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_session_lifecycle(self):
        # 1. Create session
        meta = create_session(
            session_id="sess_test_123",
            repo_url="https://github.com/test/repo.git",
            model="gpt-5.6-luna",
            application_id="app_test_123",
        )
        session_id = meta["session_id"]
        self.assertEqual(session_id, "sess_test_123")
        self.assertEqual(meta["application_id"], "app_test_123")
        self.assertEqual(meta["status"], "in_progress")

        # 2. Record events
        record_event(session_id, {
            "type": "agent.session.created",
            "session": {"id": session_id, "model": "gpt-5.6-luna"},
        })
        record_event(session_id, {
            "type": "agent.session.turn.reasoning_summary_text.delta",
            "delta": "Analyzing commit log...",
        })

        # 3. Complete session
        completed_meta = complete_session(
            session_id,
            status="completed",
            usage={
                "input_tokens": 1000,
                "output_tokens": 250,
                "reasoning_tokens": 120,
                "total_tokens": 1250,
            },
            report_markdown="# Test Report\nEvaluation passed.",
        )
        self.assertEqual(completed_meta["status"], "completed")
        self.assertEqual(completed_meta["usage"]["total_tokens"], 1250)

        # 4. Get session
        session_data = get_session(session_id)
        self.assertIsNotNone(session_data)
        self.assertEqual(session_data["meta"]["session_id"], session_id)
        self.assertEqual(len(session_data["events"]), 2)
        self.assertEqual(session_data["report_markdown"], "# Test Report\nEvaluation passed.")

        # 5. List sessions
        sessions = list_sessions()
        self.assertEqual(len(sessions), 1)
        self.assertEqual(sessions[0]["session_id"], session_id)

    def test_synthesize_legacy_events(self):
        session_dir = Path(self.test_dir) / "sess_legacy"
        session_dir.mkdir(parents=True, exist_ok=True)
        (session_dir / "candidate_intelligence_report.md").write_text("# Report", encoding="utf-8")

        meta = {
            "session_id": "sess_legacy",
            "repo_url": "https://github.com/candidate/repo.git",
            "repo_name": "candidate/repo",
            "model": "gpt-5.6-luna",
            "report_file": "candidate_intelligence_report.md",
        }

        events = _synthesize_legacy_events(session_dir, meta)
        self.assertTrue(len(events) >= 5)

        event_types = [e["type"] for e in events]
        self.assertIn("agent.session.created", event_types)
        self.assertIn("agent.session.turn.item.added", event_types)
        self.assertIn("agent.session.turn.reasoning_summary_text.delta", event_types)
        self.assertIn("agent.session.turn.output_text.delta", event_types)
        self.assertIn("agent.session.turn.completed", event_types)

    @patch("s3_storage.upload_session_file")
    @patch("s3_storage.upload_report")
    def test_sync_to_s3(self, mock_upload_report, mock_upload_file):
        mock_upload_file.return_value = "https://s3.amazonaws.com/bucket/file"
        mock_upload_report.return_value = "https://s3.amazonaws.com/bucket/report.md"

        meta = create_session(
            session_id="sess_sync_test",
            repo_url="https://github.com/test/repo.git",
            application_id="app_sync_test",
        )
        session_id = meta["session_id"]
        record_event(session_id, {"type": "test_event"})
        complete_session(session_id, report_markdown="# Report")

        results = sync_to_s3("app_sync_test", session_id)
        self.assertIn("meta_s3_url", results)
        self.assertIn("events_s3_url", results)
        self.assertTrue(mock_upload_file.called)


if __name__ == "__main__":
    unittest.main()
