"""
AWS Lambda Handler for Candidate Evaluation via DynamoDB Streams.
Triggered automatically on INSERT event from the Applications table.
Orchestrates:
1. Candidate repository cloning in sandbox environment.
2. Multi-agent repository inspection in the managed Agents API.
3. Report downloading from /workspace/outputs.
4. OTLP trace export after the session completes.
5. DynamoDB update with report/trace links and inspection metadata.
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
from otlp_traces import export_session_traces
from s3_storage import upload_report, upload_trace
from stream_to_otlp import StreamToOtlpSynthesizer

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
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


def _get_job(job_id: Optional[str]) -> Dict[str, Any]:
    """Load role context so recruiter guidance reaches the coordinator."""
    if not job_id:
        return {}
    try:
        table = _get_dynamodb_resource().Table(JOBS_TABLE_NAME)
        return table.get_item(Key={"job_id": job_id}).get("Item") or {}
    except Exception as exc:
        print(f"[Evaluator] Could not load job {job_id}: {exc}", flush=True)
        return {}


def _extract_repositories(passport: Dict[str, Any]) -> list[Dict[str, Any]]:
    """Return every valid repository from the candidate passport."""
    repositories = []
    for index, project in enumerate(passport.get("projects", []) or [], start=1):
        if not isinstance(project, dict):
            continue
        url = str(project.get("repository_url", "")).strip()
        if not url.startswith(("http://", "https://")):
            continue
        repositories.append({
            "repository_id": f"project-{index}",
            "display_name": project.get("title") or f"Project {index}",
            "repository_url": url,
        })
    return repositories


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

        # Ensure parent verification_pipeline map exists to avoid ValidationException
        try:
            table.update_item(
                Key={"application_id": application_id},
                UpdateExpression="SET verification_pipeline = if_not_exists(verification_pipeline, :empty_map)",
                ExpressionAttributeValues={":empty_map": {}}
            )
        except Exception:
            pass

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
        elif status == "FAILED":
            table.update_item(
                Key={"application_id": application_id},
                UpdateExpression="SET #s = :status, evaluation_failed_at = :now, evaluation_error = :error, verification_pipeline.sandbox_status = :sb_status",
                ExpressionAttributeNames={"#s": "status"},
                ExpressionAttributeValues={
                    ":status": "FAILED",
                    ":now": now_iso,
                    ":error": (summary or {}).get("error", "Evaluation failed"),
                    ":sb_status": "FAILED"
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
    repositories: list[Dict[str, Any]],
    job_context: Optional[Dict[str, Any]] = None,
    instructions: Optional[str] = None,
) -> Dict[str, Any]:
    """Run one coordinator session that delegates one repository per subagent."""
    if not repositories:
        raise ValueError("At least one repository is required for inspection.")

    print(
        f"\n[Evaluator] Processing application '{application_id}' "
        f"with {len(repositories)} repositories...",
        flush=True,
    )
    update_application_status(application_id, "EVALUATING")

    first_repo_url = repositories[0]["repository_url"]
    stream, session_uuid = create_agent_session(
        repo_url=first_repo_url,
        instructions=instructions,
        repositories=repositories,
        job_context=job_context,
    )

    synthesizer = StreamToOtlpSynthesizer(
        session_id=session_uuid,
        application_id=application_id,
        repo_url=first_repo_url,
        instructions=instructions,
    )

    app_reports_dir = REPORTS_DIR / application_id
    app_reports_dir.mkdir(parents=True, exist_ok=True)
    managed_session_id = session_uuid
    completed_turn_id = None

    with stream:
        for event in stream:
            event_data = synthesizer.process_event(event)
            if not isinstance(event_data, dict):
                continue
            managed_session_id = event_data.get("session_id") or managed_session_id
            event_type = event_data.get("type", "")
            if event_type in ("agent.session.turn.completed", "response.done"):
                completed_turn_id = (
                    event_data.get("turn", {}).get("id")
                    or event_data.get("turn_id")
                    or completed_turn_id
                )

    if not managed_session_id:
        raise RuntimeError("Agents API did not return a managed session ID.")

    download_session_artifacts(
        session_id=managed_session_id,
        turn_id=completed_turn_id,
        destination_dir=app_reports_dir,
    )

    report_file = app_reports_dir / "candidate_intelligence_report.md"
    if not report_file.exists():
        md_files = list(app_reports_dir.glob("*.md"))
        report_file = md_files[0] if md_files else report_file
    if not report_file.exists():
        report_file.write_text(
            "# Candidate Repository Inspection Report\n\n"
            "No Markdown inspection report was published by the coordinator.",
            encoding="utf-8",
        )

    report_markdown = report_file.read_text(encoding="utf-8")
    report_s3_url = upload_report(application_id, report_markdown)

    trace_s3_url = ""
    trace_status = "UNAVAILABLE"
    try:
        trace_doc = synthesizer.build_otlp_document()
        trace_s3_url = upload_trace(application_id, trace_doc, filename="session_trace.otlp.json")
        trace_status = "EXPORTED"
        print(f"[Evaluator] Successfully synthesized and uploaded OTLP trace from real-time stream: {trace_s3_url}", flush=True)

        # Upload raw stream events audit log
        raw_events_doc = {"session_id": managed_session_id, "events": synthesizer.get_raw_events()}
        upload_trace(application_id, raw_events_doc, filename="session_events.json")
    except Exception as exc:
        print(f"[Evaluator] Stream OTLP synthesis failed, trying fallback: {exc}", flush=True)
        try:
            trace_doc = export_session_traces(managed_session_id)
            trace_s3_url = upload_trace(application_id, trace_doc, filename="session_trace.otlp.json")
            trace_status = "EXPORTED"
        except Exception as fallback_exc:
            print(f"[Evaluator] Fallback OTLP trace export also unavailable: {fallback_exc}", flush=True)

    summary_metrics = {
        "session_id": managed_session_id,
        "repositories_total": len(repositories),
        "repositories": repositories,
        "trace_status": trace_status,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    update_application_status(
        application_id=application_id,
        status="EVALUATED",
        report_s3_url=report_s3_url,
        trace_s3_url=trace_s3_url,
        summary=summary_metrics,
    )

    print(f"[Evaluator] Completed application '{application_id}' inspection", flush=True)
    return {
        "status": "COMPLETED",
        "application_id": application_id,
        "session_id": managed_session_id,
        "repositories_total": len(repositories),
        "report_s3_url": report_s3_url,
        "trace_s3_url": trace_s3_url,
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
            repositories = _extract_repositories(passport)
            job_context = _get_job(deserialized.get("job_id"))
            recruiter_guidance = job_context.get("evaluation_guidance")

            if app_id and repositories:
                try:
                    res = evaluate_candidate_application(
                        application_id=app_id,
                        repositories=repositories,
                        job_context=job_context,
                        instructions=recruiter_guidance,
                    )
                    processed.append(res)
                except Exception as exc:
                    update_application_status(app_id, "FAILED", summary={"error": str(exc)})
                    processed.append({"status": "FAILED", "application_id": app_id, "error": str(exc)})
            elif app_id:
                update_application_status(
                    app_id,
                    "FAILED",
                    summary={"error": "No valid repository URL was supplied."}
                )
                processed.append({
                    "status": "FAILED",
                    "application_id": app_id,
                    "error": "No valid repository URL was supplied."
                })

    return {
        "statusCode": 200,
        "processed_count": len(processed),
        "results": processed
    }


if __name__ == "__main__":
    test_app_id = "app-test-01"
    test_repo = "https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git"
    evaluate_candidate_application(
        application_id=test_app_id,
        repositories=[{"repository_id": "project-1", "repository_url": test_repo}],
    )
