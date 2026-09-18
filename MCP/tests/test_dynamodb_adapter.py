import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from decimal import Decimal
from models.passport import (
    CandidatePassport,
    Skill,
    Experience,
    Project,
    Profiles,
    Education,
)
from models.application import ApplicationSubmission
from db import (
    HiringDatabase,
    _float_to_decimal,
    _decimal_to_native,
)


def test_float_and_decimal_conversions():
    data = {
        "score": 88.5,
        "nested": {
            "rate": 12.34,
            "count": 5
        },
        "list": [1.1, 2.2, 3]
    }
    converted = _float_to_decimal(data)
    assert isinstance(converted["score"], Decimal)
    assert isinstance(converted["nested"]["rate"], Decimal)
    assert isinstance(converted["list"][0], Decimal)

    restored = _decimal_to_native(converted)
    assert restored["score"] == 88.5
    assert restored["nested"]["rate"] == 12.34
    assert restored["list"][0] == 1.1


def test_list_jobs_and_get_job():
    jobs = HiringDatabase.list_jobs()
    assert len(jobs) >= 1
    backend_job = jobs[0]
    assert backend_job.id == "job-backend-01"
    assert "Python" in backend_job.primary_skills

    detail = HiringDatabase.get_job("job-backend-01")
    assert detail is not None
    assert detail.id == "job-backend-01"
    assert detail.submission_requirements.requires_code_repository is True


def test_validate_passport_and_submit():
    passport = CandidatePassport(
        full_name="Jane Doe",
        email="jane.doe@example.com",
        skills=[
            Skill(name="Python", years_experience=3.0, category="language"),
            Skill(name="FastAPI", years_experience=2.0, category="framework"),
            Skill(name="PostgreSQL", years_experience=2.0, category="database"),
            Skill(name="Docker", years_experience=2.0, category="tool"),
            Skill(name="AsyncIO", years_experience=2.0, category="framework")
        ],
        experience=[
            Experience(
                company="CloudTech",
                role="Software Engineer",
                start_date="2023-01",
                highlights=["Built APIs"]
            )
        ],
        projects=[
            Project(
                title="FastAPI Service",
                description="High throughput API",
                repository_url="https://github.com/janedoe/fastapi-service"
            )
        ],
        profiles=Profiles(
            github="https://github.com/janedoe",
            leetcode="https://leetcode.com/janedoe"
        ),
        education=[
            Education(
                institution="State University",
                degree="B.S. Computer Science",
                cgpa=3.9
            )
        ]
    )

    # Pre-flight validation
    val = HiringDatabase.validate_passport("job-backend-01", passport)
    assert val.is_valid is True
    assert val.readiness_score_pct >= 80

    # Submission
    submission = ApplicationSubmission(
        job_id="job-backend-01",
        candidate_passport=passport,
        confirmed_by_candidate=True,
        custom_answers={"q_backend_perf": "Optimized connection pool and indexed user_id column."}
    )

    receipt = HiringDatabase.submit_application(submission)
    assert receipt.application_id.startswith("app-")
    assert receipt.status == "SUBMITTED_PENDING_SANDBOX"

    # Status check
    status = HiringDatabase.get_application_status(receipt.application_id)
    assert status is not None
    assert status["status"] == "SUBMITTED_PENDING_SANDBOX"

    # Query for recruiter
    apps = HiringDatabase.list_applications_for_job("job-backend-01")
    assert any(a["application_id"] == receipt.application_id for a in apps)

    # Post-evaluation update
    updated = HiringDatabase.update_application_evaluation(
        application_id=receipt.application_id,
        report_s3_url=f"s3://bucket/applications/{receipt.application_id}/report.md",
        trace_s3_url=f"s3://bucket/applications/{receipt.application_id}/trace.json",
        evaluation_summary={"recommendation": "HIRE", "score": 92}
    )
    assert updated is True

    evaluated_status = HiringDatabase.get_application_status(receipt.application_id)
    assert evaluated_status["status"] == "EVALUATED"


if __name__ == "__main__":
    test_float_and_decimal_conversions()
    test_list_jobs_and_get_job()
    test_validate_passport_and_submit()
    print("All tests passed successfully!")
