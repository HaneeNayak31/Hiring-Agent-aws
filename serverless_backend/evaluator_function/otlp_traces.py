"""Export managed Agents API traces as OTLP JSON."""

from __future__ import annotations

import json
import os
from typing import Any, Dict
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from agent import get_openai_api_key


OPENAI_API_BASE = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1").rstrip("/")


def export_session_traces(session_id: str, page_limit: int = 20) -> Dict[str, Any]:
    """Fetch all available OTLP trace pages for a managed Agents API session."""
    if not session_id:
        raise ValueError("A managed session ID is required for trace export.")

    api_key = get_openai_api_key()
    resource_spans = []
    after = None
    pages = 0

    while True:
        query = {"limit": str(page_limit), "order": "asc"}
        if after:
            query["after"] = after
        url = f"{OPENAI_API_BASE}/agents/sessions/{session_id}/traces?{urlencode(query)}"
        request = Request(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "OpenAI-Beta": "agents=v1",
                "Accept": "application/json",
            },
            method="GET",
        )

        with urlopen(request, timeout=30) as response:
            page = json.loads(response.read().decode("utf-8"))

        pages += 1
        for item in page.get("data", []):
            otlp = item.get("otlp") or {}
            resource_spans.extend(otlp.get("resourceSpans", []))

        if not page.get("has_more"):
            break
        after = page.get("last_id")
        if not after:
            raise RuntimeError("Trace export indicated more pages but returned no last_id.")

    return {
        "resourceSpans": resource_spans,
        "session_id": session_id,
        "pages_exported": pages,
    }
