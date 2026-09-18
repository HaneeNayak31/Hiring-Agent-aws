"""
Comprehensive unit and integration tests for Applicant MCP server tools,
data models, job details, and candidate passport verification logic.
"""

import pytest
import asyncio
from models.passport import (
    CandidatePassport,
    Skill,
    Experience,
    Project,
    Profiles,
    Education,
)
from models.job import (
    Compensation,
    SubmissionRequirements,
)
from models.application import ApplicationSubmission
from db import HiringDatabase
from server import server


@pytest.fixture
def sample_valid_passport() -> CandidatePassport:
    return CandidatePassport(
        full_name="Alex Chen",
        email="alex.chen@example.com",
        phone="+1-555-0199",
        location="San Francisco, CA",
        summary="Senior Backend Engineer specializing in high-throughput distributed systems in Python and Go.",
        skills=[
            Skill(name="Python", years_experience=5.0, category="language"),
            Skill(name="FastAPI", years_experience=4.0, category="framework"),
            Skill(name="PostgreSQL", years_experience=5.0, category="database"),
            Skill(name="Docker", years_experience=4.0, category="tool"),
            Skill(name="AsyncIO", years_experience=4.0, category="framework")
        ],
        experience=[
            Experience(
                company="Nexus Cloud Labs",
                role="Senior Software Engineer",
                start_date="2022-01",
                end_date=None,
                is_current=True,
                highlights=[
                    "Architected an event ingestion pipeline processing 25k msgs/sec with FastAPI and Redis Streams.",
                    "Optimized PostgreSQL query plans reducing p99 latency from 180ms to 24ms."
                ]
            ),
            Experience(
                company="DataStream Inc.",
                role="Backend Engineer",
                start_date="2020-06",
                end_date="2021-12",
                highlights=[
                    "Built microservices for analytics pipeline.",
                    "Wrote automated pytest test suites maintaining 90% code coverage."
                ]
            )
        ],
        education=[
            Education(
                institution="University of California, Berkeley",
                degree="B.S.",
                field_of_study="Computer Science",
                cgpa="3.9/4.0",
                grad_year=2020,
                tenth_result="95% CBSE",
                twelfth_result="94% CBSE"
            )
        ],
        projects=[
            Project(
                title="Distributed Task Orchestrator",
                description="Fault-tolerant asynchronous task runner with heartbeat monitoring and raft consensus.",
                repository_url="https://github.com/alexchen-dev/distributed-orchestrator",
                live_url="https://orchestrator-demo.dev",
                tech_stack=["Python", "AsyncIO", "FastAPI", "PostgreSQL", "Docker"]
            )
        ],
        profiles=Profiles(
            github="https://github.com/alexchen-dev",
            linkedin="https://linkedin.com/in/alexchen-dev",
            leetcode="https://leetcode.com/alexchen",
            codeforces="https://codeforces.com/profile/alexchen",
            codechef="https://codechef.com/users/alexchen",
            portfolio="https://alexchen.dev"
        )
    )


def test_search_jobs_summary_format():
    """Verify that listing jobs returns lightweight summaries with expected fields."""
    jobs = HiringDatabase.list_jobs()
    assert len(jobs) >= 3
    
    first = jobs[0]
    # Check that summary has essential fields
    assert first.id in ["job-backend-01", "job-ai-02", "job-fullstack-03"]
    assert first.title
    assert first.location
    assert first.compensation.min > 0
    assert first.compensation.currency == "USD"
    assert len(first.primary_skills) > 0


def test_search_jobs_filtering():
    """Verify query, location, workplace_type, and skill filtering."""
    # Filter by workplace type
    hybrid_jobs = HiringDatabase.list_jobs(workplace_type="hybrid")
    assert all(j.workplace_type == "hybrid" for j in hybrid_jobs)
    assert any(j.id == "job-ai-02" for j in hybrid_jobs)

    # Filter by skill
    react_jobs = HiringDatabase.list_jobs(skills=["React"])
    assert any(j.id == "job-fullstack-03" for j in react_jobs)

    # Filter by query text
    infra_jobs = HiringDatabase.list_jobs(query="infrastructure")
    assert len(infra_jobs) >= 1


def test_get_job_details_and_submission_requirements():
    """Verify detailed JD contains evaluation rubric and mandatory/optional submission requirements."""
    job = HiringDatabase.get_job("job-backend-01")
    assert job is not None
    assert job.id == "job-backend-01"
    assert "Senior Backend Engineer" in job.title
    assert len(job.responsibilities) > 0
    assert len(job.required_skills) > 0
    assert len(job.full_description_markdown) > 0

    # Submission Requirements Contract
    reqs = job.submission_requirements
    assert "repositoryUrl" in reqs.mandatory_fields
    assert "projects" in reqs.mandatory_fields
    assert reqs.requires_code_repository is True
    assert "github" in reqs.required_profiles
    assert any("education" in of for of in reqs.optional_fields)
    assert any("leetcode" in of for of in reqs.optional_fields)
    assert "codeforces" in reqs.optional_profiles
    assert "codechef" in reqs.optional_profiles
    assert len(reqs.custom_questions) == 1
    assert reqs.custom_questions[0].id == "q_backend_perf"
    assert reqs.custom_questions[0].required is True


def test_passport_validation_success(sample_valid_passport):
    """Verify valid passport meets all requirements and populates status flags."""
    res = HiringDatabase.validate_passport("job-backend-01", sample_valid_passport)
    assert res.is_valid is True
    assert len(res.missing_fields) == 0
    assert res.mandatory_fields_status["fullName"] is True
    assert res.mandatory_fields_status["email"] is True
    assert res.mandatory_fields_status["skills"] is True
    assert res.mandatory_fields_status["repositoryUrl"] is True

    # Optional fields status
    assert res.optional_fields_status["education.college"] is True
    assert res.optional_fields_status["education.degree"] is True
    assert res.optional_fields_status["education.cgpa"] is True
    assert res.optional_fields_status["education.tenth_result"] is True
    assert res.optional_fields_status["education.twelfth_result"] is True
    assert res.optional_fields_status["profiles.linkedin"] is True
    assert res.optional_fields_status["profiles.leetcode"] is True
    assert res.optional_fields_status["profiles.codeforces"] is True
    assert res.optional_fields_status["profiles.codechef"] is True


def test_passport_validation_missing_repository(sample_valid_passport):
    """Verify that a candidate missing a repository URL fails validation."""
    sample_valid_passport.projects[0].repository_url = ""
    res = HiringDatabase.validate_passport("job-backend-01", sample_valid_passport)
    assert res.is_valid is False
    assert any("repositoryUrl" in mf for mf in res.missing_fields)
    assert res.mandatory_fields_status["repositoryUrl"] is False


def test_passport_validation_missing_github_profile(sample_valid_passport):
    """Verify missing GitHub profile triggers validation failure when required."""
    sample_valid_passport.profiles.github = None
    res = HiringDatabase.validate_passport("job-backend-01", sample_valid_passport)
    assert res.is_valid is False
    assert any("profiles.github" in mf for mf in res.missing_fields)


def test_submit_application_success(sample_valid_passport):
    """Verify application submission generates receipt and queues for sandbox."""
    submission = ApplicationSubmission(
        job_id="job-backend-01",
        candidate_passport=sample_valid_passport,
        cover_note="Excited to contribute to high-concurrency distributed systems at your company.",
        custom_answers={
            "q_backend_perf": "Resolved connection pool starvation under spike traffic by implementing async pooling and batching."
        },
        confirmed_by_candidate=True
    )
    receipt = HiringDatabase.submit_application(submission)
    assert receipt.application_id.startswith("app-")
    assert receipt.status == "SUBMITTED_PENDING_SANDBOX"
    assert receipt.candidate_email == sample_valid_passport.email

    # Check status endpoint
    status_info = HiringDatabase.get_application_status(receipt.application_id)
    assert status_info is not None
    assert status_info["status"] == "SUBMITTED_PENDING_SANDBOX"
    assert status_info["sandbox_status"] == "QUEUED"


def test_submit_application_requires_human_confirmation(sample_valid_passport):
    """Verify that submission without confirmed_by_candidate=True fails immediately."""
    with pytest.raises(ValueError, match="Human confirmation required"):
        submission = ApplicationSubmission(
            job_id="job-backend-01",
            candidate_passport=sample_valid_passport,
            confirmed_by_candidate=False
        )
        HiringDatabase.submit_application(submission)


def test_submit_application_requires_custom_answers(sample_valid_passport):
    """Verify that omitting a mandatory custom screening question fails submission."""
    with pytest.raises(ValueError, match="Required screening question missing answer"):
        submission = ApplicationSubmission(
            job_id="job-backend-01",
            candidate_passport=sample_valid_passport,
            custom_answers={},  # Empty answers
            confirmed_by_candidate=True
        )
        HiringDatabase.submit_application(submission)


@pytest.mark.asyncio
async def test_mcp_server_tools_e2e(sample_valid_passport):
    """Test standard MCP tool calls via MCPServer.call_tool."""
    # 1. Search jobs
    search_res = await server.call_tool("search_jobs", {"workplace_type": "remote"})
    assert not search_res.is_error
    structured_content = search_res.structured_content["result"]
    assert len(structured_content) >= 1
    assert any(j["id"] == "job-backend-01" for j in structured_content)

    # 2. Get job details
    details_res = await server.call_tool("get_job_details", {"job_id": "job-backend-01"})
    assert not details_res.is_error
    jd_content = details_res.structured_content["result"]
    assert jd_content["id"] == "job-backend-01"
    assert "submission_requirements" in jd_content

    # 3. Validate candidate passport
    val_res = await server.call_tool(
        "validate_candidate_passport",
        {
            "job_id": "job-backend-01",
            "passport": sample_valid_passport.model_dump()
        }
    )
    assert not val_res.is_error
    val_content = val_res.structured_content["result"]
    assert val_content["is_valid"] is True
    assert "mandatory_fields_status" in val_content
    assert "optional_fields_status" in val_content

    # 4. Submit application
    submit_res = await server.call_tool(
        "submit_application",
        {
            "job_id": "job-backend-01",
            "passport": sample_valid_passport.model_dump(),
            "cover_note": "Ready to scale your backend services.",
            "custom_answers": {
                "q_backend_perf": "Optimized connection pool and partitioned telemetry tables."
            },
            "confirmed_by_candidate": True
        }
    )
    assert not submit_res.is_error
    receipt_content = submit_res.structured_content["result"]
    app_id = receipt_content["application_id"]
    assert app_id.startswith("app-")

    # 5. Check status
    status_res = await server.call_tool("check_application_status", {"application_id": app_id})
    assert not status_res.is_error
    status_content = status_res.structured_content["result"]
    assert status_content["status"] == "SUBMITTED_PENDING_SANDBOX"


def test_tiered_readiness_validation(sample_valid_passport):
    """Verify Bronze and Gold readiness tier calculations and recommendations."""
    # 1. Complete candidate -> GOLD tier
    gold_res = HiringDatabase.validate_passport("job-backend-01", sample_valid_passport)
    assert gold_res.is_valid is True
    assert gold_res.readiness_tier == "GOLD"
    assert gold_res.readiness_score_pct >= 85
    assert "Gold Tier" in gold_res.readiness_summary

    # 2. Incomplete candidate (only contact info) -> BRONZE tier
    incomplete_passport = CandidatePassport(
        full_name="Jane Doe",
        email="jane.doe@example.com"
    )
    bronze_res = HiringDatabase.validate_passport("job-backend-01", incomplete_passport)
    assert bronze_res.is_valid is False
    assert bronze_res.readiness_tier == "BRONZE"
    assert bronze_res.readiness_score_pct < 60
    assert len(bronze_res.high_impact_recommendations) >= 2
    assert len(bronze_res.suggested_agent_questions) >= 2
    # Ensure actionable advice points to repository and sandbox
    assert any(
        "repository_url" in r.field and "sandbox" in r.advice.lower()
        for r in bronze_res.high_impact_recommendations
    )


def test_education_model_and_college_alias():
    """Verify Education model supports college alias, CGPA, 10th and 12th results."""
    edu = Education(
        college="Indian Institute of Technology",
        degree="B.Tech",
        field_of_study="Computer Science & Engineering",
        cgpa="9.2/10",
        grad_year=2024,
        tenth_result="96.2% CBSE",
        twelfth_result="95.0% CBSE"
    )
    assert edu.institution == "Indian Institute of Technology"
    assert edu.degree == "B.Tech"
    assert edu.cgpa == "9.2/10"
    assert edu.tenth_result == "96.2% CBSE"
    assert edu.twelfth_result == "95.0% CBSE"


def test_profiles_competitive_coding():
    """Verify Profiles model holds LinkedIn, LeetCode, Codeforces, and CodeChef."""
    profiles = Profiles(
        github="https://github.com/coder",
        linkedin="https://linkedin.com/in/coder",
        leetcode="https://leetcode.com/coder",
        codeforces="https://codeforces.com/profile/coder",
        codechef="https://codechef.com/users/coder",
        portfolio="https://coder.dev"
    )
    assert profiles.codeforces == "https://codeforces.com/profile/coder"
    assert profiles.codechef == "https://codechef.com/users/coder"
    assert profiles.leetcode == "https://leetcode.com/coder"
    assert profiles.linkedin == "https://linkedin.com/in/coder"


def test_optional_fields_suggested_questions_labeling():
    """Verify suggested questions for optional fields are tagged with [OPTIONAL]."""
    minimal_passport = CandidatePassport(
        full_name="Minimal Dev",
        email="dev@example.com",
        skills=[Skill(name="Python")],
        experience=[
            Experience(
                company="Startup",
                role="Dev",
                start_date="2022-01",
                is_current=True
            )
        ],
        projects=[
            Project(
                title="Mini Project",
                description="Sample",
                repository_url="https://github.com/dev/sample"
            )
        ],
        profiles=Profiles(github="https://github.com/dev")
    )
    res = HiringDatabase.validate_passport("job-backend-01", minimal_passport)
    assert res.is_valid is True
    # Check that education and competitive profile questions are flagged with [OPTIONAL]
    optional_questions = [q for q in res.suggested_agent_questions if "[OPTIONAL]" in q]
    assert len(optional_questions) >= 2
    assert any("College" in q or "educational" in q for q in optional_questions)
    assert any("competitive" in q.lower() or "leetcode" in q.lower() for q in optional_questions)


def test_server_instructions_detail_and_transparency():
    """Verify server instructions emphasize mandatory vs optional transparency and list all fields."""
    assert server.instructions is not None
    instructions = server.instructions
    assert "TRANSPARENT MANDATORY VS. OPTIONAL COMMUNICATION" in instructions
    assert "[MANDATORY]" in instructions
    assert "[OPTIONAL]" in instructions
    assert "College / University Name" in instructions
    assert "CGPA / GPA" in instructions
    assert "10th Grade / Board Result" in instructions
    assert "12th Grade / Senior Secondary Result" in instructions
    assert "LeetCode" in instructions
    assert "Codeforces" in instructions
    assert "CodeChef" in instructions
    assert "LinkedIn" in instructions
    assert "DOCKER SANDBOX ADVANTAGE" in instructions
    assert "career_copilot" in instructions
    assert "apply_to_job" in instructions


@pytest.mark.asyncio
async def test_server_prompts_detailed_flow():
    """Verify native MCP prompts contain comprehensive multi-step flow."""
    # 1. career_copilot
    copilot_prompt = await server.get_prompt("career_copilot", {})
    copilot_text = copilot_prompt.messages[0].content.text
    assert "[MANDATORY]" in copilot_text
    assert "[OPTIONAL]" in copilot_text
    assert "College" in copilot_text
    assert "CGPA" in copilot_text
    assert "Codeforces" in copilot_text
    assert "CodeChef" in copilot_text

    # 2. apply_to_job
    apply_prompt = await server.get_prompt("apply_to_job", {"job_id": "job-backend-01"})
    apply_text = apply_prompt.messages[0].content.text
    assert "job-backend-01" in apply_text
    assert "get_job_details" in apply_text
    assert "Step 1:" in apply_text
    assert "Step 2:" in apply_text
    assert "Step 3:" in apply_text
    assert "Step 4:" in apply_text
    assert "Step 5:" in apply_text
    assert "[MANDATORY]" in apply_text
    assert "[OPTIONAL]" in apply_text
    assert "College/University" in apply_text
    assert "CGPA" in apply_text
    assert "10th & 12th" in apply_text
    assert "Codeforces" in apply_text
    assert "CodeChef" in apply_text


