"""
Models package for AI-Native Hiring Platform MCP server.
Exports all domain models for jobs, candidate passports, applications, and validation.
"""

from models.job import (
    Compensation,
    JobSummary,
    CustomQuestion,
    SubmissionRequirements,
    JobDetail,
)
from models.passport import (
    Skill,
    Experience,
    Education,
    Certification,
    Project,
    Profiles,
    CandidatePassport,
)
from models.application import (
    ApplicationSubmission,
    ApplicationReceipt,
)
from models.validation import (
    HighImpactRecommendation,
    ValidationResult,
)

__all__ = [
    # Job Models
    "Compensation",
    "JobSummary",
    "CustomQuestion",
    "SubmissionRequirements",
    "JobDetail",
    # Passport Models
    "Skill",
    "Experience",
    "Education",
    "Certification",
    "Project",
    "Profiles",
    "CandidatePassport",
    # Application Models
    "ApplicationSubmission",
    "ApplicationReceipt",
    # Validation Models
    "HighImpactRecommendation",
    "ValidationResult",
]
