"""
Application submission and receipt models.
"""

from __future__ import annotations
from typing import Optional, Dict, Literal
from pydantic import BaseModel, Field
from models.passport import CandidatePassport


class ApplicationSubmission(BaseModel):
    """
    Payload submitted by candidate AI agent or candidate directly.
    """
    job_id: str = Field(..., description="ID of the job being applied to")
    candidate_passport: CandidatePassport = Field(..., description="Full candidate passport")
    cover_note: Optional[str] = Field(None, description="Custom note or alignment explanation")
    custom_answers: Optional[Dict[str, str]] = Field(
        default=None,
        description="Answers to job-specific custom questions (question_id -> answer)"
    )
    confirmed_by_candidate: bool = Field(
        ...,
        description="Mandatory human-in-the-loop candidate confirmation flag"
    )


class ApplicationReceipt(BaseModel):
    """
    Receipt returned to candidate agent upon successful application creation.
    """
    application_id: str
    job_id: str
    candidate_name: str
    candidate_email: str
    status: Literal["SUBMITTED_PENDING_SANDBOX", "VERIFYING", "REVIEW", "REJECTED", "ACCEPTED"]
    submitted_at: str
    message: str
