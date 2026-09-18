"""
Job models for role discovery, search, and detailed requirements.
"""

from __future__ import annotations
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class Compensation(BaseModel):
    min: int = Field(..., description="Minimum salary in currency")
    max: int = Field(..., description="Maximum salary in currency")
    currency: str = Field(default="USD", description="Currency code (e.g. USD, EUR)")
    period: Literal["yearly", "monthly", "hourly"] = Field(default="yearly", description="Payment cadence")


class JobSummary(BaseModel):
    """
    Lightweight summary for role discovery and searches.
    """
    id: str = Field(..., description="Unique requisition ID, e.g. job-backend-01")
    title: str = Field(..., description="Official role title")
    department: str = Field(..., description="Department or team name")
    location: str = Field(..., description="Location string or Remote indicator")
    workplace_type: Literal["remote", "hybrid", "onsite"] = Field(..., description="Workplace mode")
    employment_type: Literal["full-time", "contract", "internship"] = Field(default="full-time")
    experience_level: str = Field(..., description="Seniority or experience level text, e.g. Senior (4+ yrs)")
    min_years_experience: int = Field(..., description="Minimum required years of experience")
    compensation: Compensation = Field(..., description="Target compensation range")
    primary_skills: List[str] = Field(..., description="Key top skills for filtering")
    status: Literal["active", "closed", "draft"] = Field(default="active")
    posted_at: str = Field(..., description="ISO 8601 timestamp of posting")


class CustomQuestion(BaseModel):
    id: str
    question: str
    required: bool = True


class SubmissionRequirements(BaseModel):
    """
    Explicit contract detailing what candidate agents must supply to apply for this role.
    Distinguishes strictly mandatory fields from optional fields that enrich candidate evaluation.
    """
    mandatory_fields: List[str] = Field(
        default=["fullName", "email", "skills", "experience", "projects", "repositoryUrl"],
        description="List of passport fields that must not be empty"
    )
    optional_fields: List[str] = Field(
        default=[
            "education (college, degree, cgpa, 10th result, 12th result)",
            "profiles.linkedin",
            "profiles.leetcode",
            "profiles.codeforces",
            "profiles.codechef",
            "profiles.portfolio",
            "phone",
            "location",
            "summary",
            "certifications",
            "coverNote"
        ],
        description="Optional fields that enrich candidate evaluation and boost readiness tier"
    )
    min_projects: int = Field(default=1, description="Minimum number of verified projects required")
    requires_code_repository: bool = Field(
        default=True,
        description="Whether a valid git repository is mandatory for sandbox execution"
    )
    required_profiles: List[str] = Field(
        default=["github"],
        description="Mandatory profile links (e.g. github)"
    )
    optional_profiles: List[str] = Field(
        default=["linkedin", "leetcode", "codeforces", "codechef", "portfolio"],
        description="Optional profile links that boost candidate scoring if provided"
    )
    custom_questions: List[CustomQuestion] = Field(
        default_factory=list,
        description="Role-specific screening questions"
    )


class JobDetail(JobSummary):
    """
    Complete Job Description and specification including application submission requirements.
    """
    overview: str = Field(..., description="High-level mission and team introduction")
    full_description_markdown: str = Field(..., description="Full JD in markdown format")
    responsibilities: List[str] = Field(..., description="Key duties and day-to-day responsibilities")
    required_skills: List[str] = Field(..., description="Comprehensive list of required skills")
    preferred_skills: List[str] = Field(default_factory=list, description="Bonus or preferred skills")
    benefits: List[str] = Field(default_factory=list, description="List of perks and company benefits")
    submission_requirements: SubmissionRequirements = Field(
        default_factory=SubmissionRequirements,
        description="Criteria and fields required to apply"
    )
