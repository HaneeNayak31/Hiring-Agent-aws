"""
Candidate passport and credential models.
"""

from __future__ import annotations
from typing import List, Optional, Literal, Union
from pydantic import BaseModel, Field


class Skill(BaseModel):
    name: str = Field(..., description="Skill name, e.g. Python, PostgreSQL")
    years_experience: Optional[float] = Field(None, description="Estimated years of experience with skill")
    category: Literal["language", "framework", "tool", "cloud", "database"] = Field(
        default="language",
        description="Skill category"
    )


class Experience(BaseModel):
    company: str
    role: str
    start_date: str = Field(..., description="Format: YYYY-MM")
    end_date: Optional[str] = Field(None, description="Format: YYYY-MM, or None if current")
    is_current: bool = False
    highlights: List[str] = Field(default_factory=list, description="Key achievements and technologies")


class Education(BaseModel):
    institution: str = Field(..., description="College or University name", alias="college")
    degree: str = Field(..., description="Degree obtained, e.g. B.Tech, B.S., M.S., B.E.")
    field_of_study: str = Field(default="", description="Major or field of study, e.g. Computer Science")
    cgpa: Optional[Union[float, str]] = Field(default=None, description="CGPA or GPA (e.g. 8.9/10, 3.8/4.0, 85%)")
    grad_year: Optional[int] = Field(default=None, description="Graduation year (e.g. 2024)")
    tenth_result: Optional[str] = Field(default=None, description="10th grade/board result or percentage (e.g. 92% CBSE)")
    twelfth_result: Optional[str] = Field(default=None, description="12th grade/senior secondary result or percentage (e.g. 94.5% State Board)")

    model_config = {
        "populate_by_name": True,
        "extra": "ignore"
    }


class Certification(BaseModel):
    name: str
    issuer: str
    issued_date: Optional[str] = None
    credential_url: Optional[str] = None


class Project(BaseModel):
    title: str
    description: str
    repository_url: str = Field(..., description="Git repository URL for automated sandbox testing")
    live_url: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)


class Profiles(BaseModel):
    github: Optional[str] = Field(default=None, description="GitHub profile URL (for sandbox code and git history analysis)")
    linkedin: Optional[str] = Field(default=None, description="LinkedIn profile URL (optional professional profile)")
    leetcode: Optional[str] = Field(default=None, description="LeetCode profile URL (optional competitive/DSA profile)")
    codeforces: Optional[str] = Field(default=None, description="Codeforces profile URL (optional competitive programming profile)")
    codechef: Optional[str] = Field(default=None, description="CodeChef profile URL (optional competitive programming profile)")
    portfolio: Optional[str] = Field(default=None, description="Personal portfolio or website URL (optional)")

    model_config = {
        "extra": "ignore"
    }


class CandidatePassport(BaseModel):
    """
    Standardized, portable candidate passport as defined in GEMINI.md.
    """
    id: Optional[str] = Field(None, description="Optional candidate passport ID")
    full_name: str = Field(..., description="Full legal or preferred name")
    email: str = Field(..., description="Contact email address")
    phone: Optional[str] = Field(default=None, description="Optional phone number")
    location: Optional[str] = Field(default=None, description="Optional location or city/country")
    summary: Optional[str] = Field(None, description="Executive summary / professional bio")
    skills: List[Skill] = Field(default_factory=list, description="Verified candidate skills")
    experience: List[Experience] = Field(default_factory=list, description="Employment history")
    education: List[Education] = Field(default_factory=list, description="Educational background (college, degree, cgpa, 10th/12th results)")
    certifications: List[Certification] = Field(default_factory=list, description="Certifications and licenses")
    projects: List[Project] = Field(
        default_factory=list,
        description="Projects with code repositories for sandbox verification"
    )
    profiles: Profiles = Field(default_factory=Profiles, description="Public profile URLs (GitHub, LinkedIn, LeetCode, Codeforces, CodeChef, Portfolio)")

    # Optional top-level academic fields for convenient flat input
    cgpa: Optional[Union[float, str]] = Field(default=None, description="Optional candidate CGPA / GPA")
    tenth_result: Optional[str] = Field(default=None, description="Optional 10th grade result or percentage")
    twelfth_result: Optional[str] = Field(default=None, description="Optional 12th grade result or percentage")
