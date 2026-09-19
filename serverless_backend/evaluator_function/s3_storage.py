"""
S3 Storage Adapter for Candidate Assessment Reports & Execution Traces.
Persists candidate_intelligence_report.md and session_trace.otlp.json to S3 under
'applications/{application_id}/' with local directory fallback.
"""

from __future__ import annotations
import os
import json
from pathlib import Path
from typing import Any, Dict, Optional, Union
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET = os.getenv("S3_ASSESSMENT_BUCKET", "hiring-agent-assessments")
ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")

LOCAL_REPORTS_DIR = Path("/tmp/reports" if os.getenv("AWS_LAMBDA_FUNCTION_NAME") else Path(__file__).parent / "reports")
try:
    LOCAL_REPORTS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    LOCAL_REPORTS_DIR = Path("/tmp/reports")
    LOCAL_REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def get_s3_client():
    kwargs = {"region_name": AWS_REGION}
    if ENDPOINT_URL:
        kwargs["endpoint_url"] = ENDPOINT_URL
    return boto3.client("s3", **kwargs)


def upload_report(
    application_id: str,
    content: Union[str, bytes, Path],
    filename: str = "candidate_intelligence_report.md"
) -> str:
    """
    Uploads the candidate intelligence markdown report to S3.
    Fallback: saves locally to /tmp/reports/{application_id}/.
    """
    if isinstance(content, Path):
        text_content = content.read_text(encoding="utf-8")
        body_bytes = content.read_bytes()
    elif isinstance(content, str):
        text_content = content
        body_bytes = content.encode("utf-8")
    else:
        text_content = content.decode("utf-8", errors="replace")
        body_bytes = content

    s3_key = f"applications/{application_id}/{filename}"
    s3_url = f"s3://{S3_BUCKET}/{s3_key}"

    local_dir = LOCAL_REPORTS_DIR / application_id
    local_dir.mkdir(parents=True, exist_ok=True)
    local_file = local_dir / filename
    local_file.write_text(text_content, encoding="utf-8")

    try:
        s3 = get_s3_client()
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=body_bytes,
            ContentType="text/markdown"
        )
        print(f"[S3] Uploaded report to: {s3_url}", flush=True)
        return s3_url
    except Exception as e:
        print(f"[S3] Notice: S3 upload failed ({e}). Saved report locally to: {local_file}", flush=True)
        return str(local_file)


def upload_trace(
    application_id: str,
    trace_data: Dict[str, Any],
    filename: str = "session_trace.otlp.json"
) -> str:
    """
    Uploads the complete dual-layer execution trace (raw events + structured sections) to S3.
    Fallback: saves locally to /tmp/reports/{application_id}/.
    """
    json_str = json.dumps(trace_data, indent=2, default=str)
    body_bytes = json_str.encode("utf-8")

    s3_key = f"applications/{application_id}/{filename}"
    s3_url = f"s3://{S3_BUCKET}/{s3_key}"

    local_dir = LOCAL_REPORTS_DIR / application_id
    local_dir.mkdir(parents=True, exist_ok=True)
    local_file = local_dir / filename
    local_file.write_text(json_str, encoding="utf-8")

    try:
        s3 = get_s3_client()
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=body_bytes,
            ContentType="application/json"
        )
        print(f"[S3] Uploaded full trace to: {s3_url}", flush=True)
        return s3_url
    except Exception as e:
        print(f"[S3] Notice: S3 upload failed ({e}). Saved trace locally to: {local_file}", flush=True)
        return str(local_file)


def get_report(application_id: str, filename: str = "candidate_intelligence_report.md") -> Optional[str]:
    """Retrieves report content from S3 or local storage."""
    s3_key = f"applications/{application_id}/{filename}"
    try:
        s3 = get_s3_client()
        response = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
        return response["Body"].read().decode("utf-8")
    except Exception:
        local_file = LOCAL_REPORTS_DIR / application_id / filename
        if local_file.exists():
            return local_file.read_text(encoding="utf-8")
    return None


def get_trace(application_id: str, filename: str = "session_trace.otlp.json") -> Optional[Dict[str, Any]]:
    """Retrieves full trace dictionary from S3 or local storage."""
    s3_key = f"applications/{application_id}/{filename}"
    try:
        s3 = get_s3_client()
        response = s3.get_object(Bucket=S3_BUCKET, Key=s3_key)
        return json.loads(response["Body"].read().decode("utf-8"))
    except Exception:
        local_file = LOCAL_REPORTS_DIR / application_id / filename
        if local_file.exists():
            return json.loads(local_file.read_text(encoding="utf-8"))
    return None
