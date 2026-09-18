"""
Validation and pre-flight readiness audit models.
"""

from __future__ import annotations
from typing import List, Literal, Dict, Any
from pydantic import BaseModel, Field


class HighImpactRecommendation(BaseModel):
    field: str = Field(..., description="Field or credential path, e.g. projects[0].repository_url")
    impact: Literal["CRITICAL", "HIGH", "MEDIUM"] = Field(..., description="Impact level on candidate intelligence rating")
    advice: str = Field(..., description="Actionable suggestion to boost the candidate's rating")


class ValidationResult(BaseModel):
    """
    Pre-flight validation report comparing passport against job requirements.
    Provides tiered readiness (Bronze/Silver/Gold) and actionable next steps.
    """
    is_valid: bool
    readiness_tier: Literal["BRONZE", "SILVER", "GOLD"] = Field(
        default="BRONZE",
        description="Readiness rating: BRONZE (basic info), SILVER (solid profile), GOLD (sandbox-verified with tests)"
    )
    readiness_score_pct: int = Field(
        default=0,
        description="Completeness and evidence percentage (0-100%)"
    )
    readiness_summary: str = Field(
        default="",
        description="Concise evaluation summary explaining the candidate's current standing"
    )
    missing_fields: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    mandatory_fields_status: Dict[str, bool] = Field(
        default_factory=dict,
        description="Fulfillment status of each mandatory requirement (field_name -> bool)"
    )
    optional_fields_status: Dict[str, bool] = Field(
        default_factory=dict,
        description="Fulfillment status of optional bonus fields (field_name -> bool)"
    )
    high_impact_recommendations: List[HighImpactRecommendation] = Field(
        default_factory=list,
        description="Specific opportunities to upgrade readiness to the next tier"
    )
    suggested_agent_questions: List[str] = Field(
        default_factory=list,
        description="Exact conversational questions the agent can ask the user right now"
    )
    details: Dict[str, Any] = Field(default_factory=dict)
