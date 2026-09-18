"""
AWS Lambda Handler for Candidate Evaluation via DynamoDB Streams.
Triggered automatically on INSERT event from the Applications table.
Orchestrates:
1. Candidate repository cloning in sandbox environment.
2. Lossless trace capture via TraceCollector (every token, reasoning thought, command, output).
3. Report downloading from /workspace/outputs.
4. S3 upload of candidate_intelligence_report.md and trace.json.
5. DynamoDB update to EVALUATED with S3 links and summary metrics.
"""

import os
import sys
import json
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional
import boto3
from boto3.dynamodb.types import TypeDeserializer
from dotenv import load_dotenv

load_dotenv()

# Internal module imports
from agent import create_agent_session, download_session_artifacts, REPORTS_DIR
from trace_collector import TraceCollector
from s3_storage import upload_report, upload_trace

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
JOBS_TABLE_NAME = os.getenv("DYNAMODB_JOBS_TABLE", "HiringAgent_Jobs")
APPS_TABLE_NAME = os.getenv("DYNAMODB_APPLICATIONS_TABLE", "HiringAgent_Applications")
S3_BUCKET = os.getenv("S3_ASSESSMENT_BUCKET", "hiring-agent-assessments")

deserializer = TypeDeserializer()


def _get_dynamodb_resource():
    kwargs = {"region_name": AWS_REGION}
    endpoint_url = os.getenv("DYNAMODB_ENDPOINT_URL")
    if endpoint_url:
        kwargs["endpoint_url"] = endpoint_url
    return boto3.resource("dynamodb", **kwargs)


def _float_to_decimal(obj: Any) -> Any:
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_float_to_decimal(x) for x in obj]
    return obj


def _extract_recommendation(report_text: str) -> str:
    """Extracts high-level recommendation from markdown report."""
    first_paragraph = report_text[:600].lower()
    if "strong hire" in first_paragraph or "hire" in first_paragraph:
        return "HIRE"
    if "interview" in first_paragraph:
        return "INTERVIEW_WITH_VERIFICATION"
    if "reject" in first_paragraph or "not recommend" in first_paragraph:
        return "REJECT"
    return "REVIEW"


def update_application_status(
    application_id: str,
    status: str,
    report_s3_url: Optional[str] = None,
    trace_s3_url: Optional[str] = None,
    summary: Optional[Dict[str, Any]] = None
):
    """Updates status and artifact links in the Applications DynamoDB table."""
    try:
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        now_iso = datetime.now(timezone.utc).isoformat()

        if status == "EVALUATING":
            table.update_item(
                Key={"application_id": application_id},
                UpdateExpression="SET #s = :status, evaluation_started_at = :now, verification_pipeline.sandbox_status = :sb_status",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={
                    ":status": "EVALUATING",
                    ":now": now_iso,
                    ":sb_status": "RUNNING"
                }
            )
        elif status == "EVALUATED":
            table.update_item(
                Key={"application_id": application_id},
                UpdateExpression="""
                    SET #s = :status,
                        report_s3_url = :r_url,
                        trace_s3_url = :t_url,
                        evaluated_at = :now,
                        evaluation_summary = :summary,
                        verification_pipeline.sandbox_status = :sb_status
                """,
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={
                    ":status": "EVALUATED",
                    ":r_url": report_s3_url or "",
                    ":t_url": trace_s3_url or "",
                    ":now": now_iso,
                    ":summary": _float_to_decimal(summary or {}),
                    ":sb_status": "COMPLETED"
                }
            )
    except Exception as e:
        print(f"[Handler] Error updating DynamoDB for {application_id}: {e}", flush=True)


def evaluate_candidate_application(
    application_id: str,
    repo_url: str,
    instructions: Optional[str] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the candidate evaluation workflow:
    - Sets DynamoDB status to EVALUATING.
    - Runs agent session with TraceCollector.
    - Saves report and trace to S3.
    - Sets DynamoDB status to EVALUATED.
    """
    print(f"\n[Evaluator] Processing application '{application_id}' (repo: {repo_url})...", flush=True)

    # 1. Update status to EVALUATING
    update_application_status(application_id, "EVALUATING")

    # 2. Initialize TraceCollector & agent session
    session_uuid = session_id or f"sess_{uuid.uuid4().hex}"
    collector = TraceCollector(
        session_id=session_uuid,
        repo_url=repo_url,
        application_id=application_id
    )

    stream, s_id = create_agent_session(
        repo_url=repo_url,
        session_id=session_uuid,
        instructions=instructions
    )

    app_reports_dir = REPORTS_DIR / application_id
    app_reports_dir.mkdir(parents=True, exist_ok=True)
    turn_completed = False

    with stream:
        for event in stream:
            event_data = collector.process_event(event)
            event_type = event_data.get("type", "")

            if event_type == "agent.session.turn.completed" and not turn_completed:
                turn_completed = True
                turn_id = event_data.get("turn", {}).get("id") or event_data.get("turn_id")
                target_sid = event_data.get("session_id") or session_uuid
                download_session_artifacts(
                    session_id=target_sid,
                    turn_id=turn_id,
                    destination_dir=app_reports_dir
                )

    # 3. Finalize trace document
    trace_doc = collector.finalize()

    # 4. Locate or assemble report markdown
    report_file = app_reports_dir / "candidate_intelligence_report.md"
    if not report_file.exists():
        md_files = list(app_reports_dir.glob("*.md"))
        if md_files:
            report_file = md_files[0]
        else:
            fallback_text = "".join(collector.accumulated_text_chunks)
            if not fallback_text:
                fallback_text = f"# Candidate Evaluation Report\n\nNo report generated for {repo_url}."
            report_file.write_text(fallback_text, encoding="utf-8")

    report_markdown = report_file.read_text(encoding="utf-8")

    # 5. Upload report and full trace to S3
    report_s3_url = upload_report(application_id, report_markdown)
    trace_s3_url = upload_trace(application_id, trace_doc)

    # 6. Build summary and update DynamoDB to EVALUATED
    recommendation = _extract_recommendation(report_markdown)
    summary_metrics = {
        "session_id": session_uuid,
        "recommendation": recommendation,
        "candidate_repo": repo_url,
        "total_commands_run": len(trace_doc["structured_trace"]["commands_executed"]),
        "total_reasoning_steps": len(trace_doc["structured_trace"]["reasoning_entries"]),
        "total_raw_events": len(trace_doc["raw_events"]),
        "completed_at": datetime.now(timezone.utc).isoformat()
    }

    update_application_status(
        application_id=application_id,
        status="EVALUATED",
        report_s3_url=report_s3_url,
        trace_s3_url=trace_s3_url,
        summary=summary_metrics
    )

    print(f"[Evaluator] Completed application '{application_id}': {recommendation}", flush=True)

    return {
        "status": "COMPLETED",
        "application_id": application_id,
        "session_id": session_uuid,
        "recommendation": recommendation,
        "report_s3_url": report_s3_url,
        "trace_s3_url": trace_s3_url
    }


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda entrypoint triggered by DynamoDB Streams.
    """
    processed = []
    records = event.get("Records", [])

    for record in records:
        if record.get("eventName") == "INSERT":
            new_image = record.get("dynamodb", {}).get("NewImage", {})
            deserialized = {k: deserializer.deserialize(v) for k, v in new_image.items()}

            app_id = deserialized.get("application_id")
            passport = deserialized.get("candidate_passport", {})
            projects = passport.get("projects", [])
            repo_url = projects[0].get("repository_url") if projects else None

            if app_id and repo_url:
                res = evaluate_candidate_application(application_id=app_id, repo_url=repo_url)
                processed.append(res)

    return {
        "statusCode": 200,
        "processed_count": len(processed),
        "results": processed
    }


if __name__ == "__main__":
    test_app_id = "app-test-01"
    test_repo = "https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git"
    evaluate_candidate_application(application_id=test_app_id, repo_url=test_repo)
