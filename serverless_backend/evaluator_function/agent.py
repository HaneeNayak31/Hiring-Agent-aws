"""
Agent Session Factory for OpenAI Agents API.
Encapsulates repository evaluation agent creation and configuration.
"""

import uuid
from pathlib import Path
from typing import Any, List, Optional, Tuple
from dotenv import load_dotenv
from openai import OpenAI

from prompts import INSTRUCTIONS, create_input
from utils import load_plugins

load_dotenv()

client = OpenAI()

REPORTS_DIR = Path(__file__).parent / "reports"
REPORTS_DIR.mkdir(exist_ok=True)


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
        artifacts_page = client.beta.agents.sessions.artifacts.list(session_id=session_id)
        for artifact in artifacts_page:
            if turn_id and getattr(artifact, "turn_id", None) != turn_id:
                continue

            artifact_path = getattr(artifact, "path", None)
            if artifact_path:
                filename = Path(artifact_path).name
            else:
                filename = f"artifact_{artifact.id}.md"

            dest_path = target_dir / filename

            with client.beta.agents.sessions.artifacts.with_streaming_response.content(
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
) -> Tuple[Any, str]:
    """
    Creates an OpenAI Agents API streaming session for candidate repository evaluation.
    Generates a unique session UUID if not provided.

    Returns:
        tuple: (stream, session_uuid)
    """
    session_uuid = session_id or f"sess_{uuid.uuid4().hex}"
    plugins = load_plugins()
    input_text = create_input(repo_url, instructions)

    # Strictly use OpenAI Agents API streaming session
    stream = client.beta.agents.sessions.create(
        agent={
            "model": "gpt-5.6-luna",
            "instructions": INSTRUCTIONS,
            "reasoning": {
                "effort": "low",
                "summary": "auto",
            },
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
