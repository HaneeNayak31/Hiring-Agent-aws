"""
Agent Session Factory for OpenAI Agents API.
Encapsulates repository evaluation agent creation and configuration.
"""

import uuid
import json
import os
from pathlib import Path
from typing import Any, List, Optional, Tuple
from dotenv import load_dotenv
from openai import OpenAI
import boto3

from prompts import INSTRUCTIONS, create_input
from utils import load_plugins

load_dotenv()


def _load_openai_key_from_secret() -> None:
    """Load the key only at runtime, after deployment, from Secrets Manager."""
    if os.getenv("OPENAI_API_KEY"):
        return
    secret_arn = os.getenv("OPENAI_API_KEY_SECRET_ARN")
    if not secret_arn:
        return
    try:
        secret = boto3.client("secretsmanager").get_secret_value(SecretId=secret_arn)
        value = (secret.get("SecretString") or "").strip()
        if not value:
            return

        key = ""
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                key = parsed.get("OPENAI_API_KEY", "") or parsed.get("openai_api_key", "")
            elif isinstance(parsed, str):
                key = parsed
        except Exception:
            pass

        if not key:
            import re
            match = re.search(r"(?:OPENAI_API_KEY\s*[:=]\s*|\"OPENAI_API_KEY\"\s*:\s*\")?([A-Za-z0-9_\-]{20,})", value)
            if value.startswith("sk-"):
                key = value
            elif match:
                key = match.group(1)

        if key:
            os.environ["OPENAI_API_KEY"] = key.strip()
    except Exception as exc:
        print(f"[Agent] Warning: Could not retrieve secret from Secrets Manager: {exc}", flush=True)


client = None


def _get_client() -> OpenAI:
    global client
    if client is None:
        _load_openai_key_from_secret()
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError(
                "OPENAI_API_KEY is not configured. Populate the configured Secrets Manager secret before evaluating candidates."
            )
        client = OpenAI()
    return client


def get_openai_api_key() -> str:
    """Return the configured API key for REST endpoints such as OTLP export."""
    _load_openai_key_from_secret()
    key = os.getenv("OPENAI_API_KEY", "").strip()
    if not key:
        raise RuntimeError(
            "OPENAI_API_KEY is not configured. Populate the configured Secrets Manager secret before evaluating candidates."
        )
    return key


REPORTS_DIR = Path("/tmp/reports" if os.getenv("AWS_LAMBDA_FUNCTION_NAME") else Path(__file__).parent / "reports")
try:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    REPORTS_DIR = Path("/tmp/reports")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def download_session_artifacts(
    session_id: str,
    turn_id: Optional[str] = None,
    destination_dir: Optional[Path] = None,
) -> List[Path]:
    """
    Downloads published artifacts from /workspace/outputs for an OpenAI Agents session.
    Uses official client.beta.agents.sessions.artifacts API.

    Returns:
        List of Path objects for all downloaded files.
    """
    target_dir = destination_dir or (REPORTS_DIR / session_id)
    target_dir.mkdir(parents=True, exist_ok=True)
    downloaded_files: List[Path] = []

    try:
        api_client = _get_client()
        artifacts_page = api_client.beta.agents.sessions.artifacts.list(session_id=session_id)
        for artifact in artifacts_page:
            if turn_id and getattr(artifact, "turn_id", None) != turn_id:
                continue

            artifact_path = getattr(artifact, "path", None)
            if artifact_path:
                filename = Path(artifact_path).name
            else:
                filename = f"artifact_{artifact.id}.md"

            dest_path = target_dir / filename

            with api_client.beta.agents.sessions.artifacts.with_streaming_response.content(
                artifact.id, session_id=session_id
            ) as response:
                response.stream_to_file(dest_path)

            downloaded_files.append(dest_path)
            print(f"[Artifacts] Downloaded published artifact: {dest_path}", flush=True)

    except Exception as e:
        print(f"[Artifacts] Error downloading artifacts for session {session_id}: {e}", flush=True)

    return downloaded_files



def create_agent_session(
    repo_url: str,
    session_id: Optional[str] = None,
    instructions: Optional[str] = None,
    repositories: Optional[List[dict]] = None,
    job_context: Optional[dict] = None,
) -> Tuple[Any, str]:
    """
    Creates an OpenAI Agents API streaming session for candidate repository evaluation.
    Generates a unique session UUID if not provided.

    Returns:
        tuple: (stream, session_uuid)
    """
    session_uuid = session_id or f"sess_{uuid.uuid4().hex}"
    plugins = load_plugins()
    input_text = create_input(
        repo_url=repo_url,
        instructions=instructions,
        repositories=repositories,
        job_context=job_context,
    )

    # Strictly use OpenAI Agents API streaming session
    stream = _get_client().beta.agents.sessions.create(
        agent={
            "model": "gpt-5.6-luna",
            "instructions": INSTRUCTIONS,
            "reasoning": {
                "effort": "low",
                "summary": "auto",
            }
        },
        environment={
            "type": "openai_hosted",
            "network": {
                "access": "enabled",
            },
            "plugins": plugins,
        },
        input=input_text,
        stream=True,
    )

    return stream, session_uuid


if __name__ == "__main__":
    test_repo = "https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git"
    print(f"Creating evaluation session for: {test_repo}...")
    stream, s_id = create_agent_session(test_repo)
    print(f"Active Session UUID: {s_id}\n")

    with stream:
        for event in stream:
            data = event.model_dump()
            print(f"EVENT: {data.get('type')}", flush=True)
