"""
Database abstraction layer and in-memory mock repository for jobs and candidate applications.
Designed to easily swap with PostgreSQL / Prisma later.
"""

from __future__ import annotations
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from models.job import (
    JobSummary,
    JobDetail,
    Compensation,
    SubmissionRequirements,
    CustomQuestion,
)
from models.passport import CandidatePassport
from models.application import ApplicationSubmission, ApplicationReceipt
from models.validation import ValidationResult, HighImpactRecommendation

# Seed Data: 3 Real-World Roles with Detailed Descriptions & Submission Requirements
JOBS_SEED: Dict[str, JobDetail] = {
    "job-backend-01": JobDetail(
        id="job-backend-01",
        title="Junior Cloud Engineer (Platform & Distributed Systems)",
        department="Core Infrastructure",
        location="San Francisco, CA (or Remote US)",
        workplace_type="remote",
        employment_type="full-time",
        experience_level="Junior ",
        min_years_experience=0,
        compensation=Compensation(
            min=16000,
            max=19500,
            currency="USD",
            period="yearly"
        ),
        primary_skills=["AWS","Python", "FastAPI", "PostgreSQL", "Docker", "Distributed Systems"],
        status="active",
        posted_at="2026-09-15T09:00:00Z",
        overview=(
            "Join our Core Infrastructure team to architect resilient, high-throughput backend services. "
            "You will scale distributed event streams, design resilient data models, and optimize our low-latency APIs."
        ),
        full_description_markdown=(
            
            "## About The Role\n"
            "We are seeking an experienced Backend Engineer to lead the architectural evolution of our event-driven systems. "
            "You will work closely with AI infrastructure engineers, designing APIs handling millions of requests per day.\n\n"
            "## What You'll Do\n"
            "- Design, develop, and maintain high-concurrency microservices in Python (AsyncIO, FastAPI) and Go.\n"
            "- Optimize PostgreSQL queries, index strategies, and partitioning for heavy data pipelines.\n"
            "- Implement observability pipelines with OpenTelemetry and Prometheus.\n"
            "- Write clean, thoroughly tested code with robust unit and integration test suites.\n\n"
            "## Minimum Qualifications\n"
            "- Deep proficiency in modern Python (AsyncIO, Pydantic, FastAPI) or Go.\n"
            "- Solid knowledge of relational databases (PostgreSQL) and caching layers (Redis).\n"
        ),
        responsibilities=[
            "Design, build, and maintain mission-critical backend APIs and asynchronous pipelines.",
            "Architect database schemas and perform query optimization on PostgreSQL.",
            "Champion automated testing, code quality, and CI/CD best practices.",
            "Participate in on-call rotations and lead incident post-mortems."
        ],
        required_skills=["Python", "FastAPI", "PostgreSQL", "AsyncIO", "Docker", "Git"],
        preferred_skills=["Redis", "Kafka", "Kubernetes", "OpenTelemetry", "Go"],
        benefits=[
            "Competitive base salary + significant equity package",
            "Comprehensive health, dental, and vision insurance (100% premium covered)",
            "Flexible remote work environment & $1,500 home office stipend",
            "Unlimited PTO and paid parental leave"
        ],
        submission_requirements=SubmissionRequirements(
            mandatory_fields=["fullName", "email", "skills", "experience", "projects", "repositoryUrl",
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
            min_projects=1,
            requires_code_repository=True,
            required_profiles=["github""linkedin", "leetcode"],
            optional_profiles=["codeforces", "codechef", "portfolio"],
            custom_questions=[
                CustomQuestion(
                    id="q_backend_perf",
                    question="Briefly explain a production performance bottleneck you diagnosed and resolved.",
                    required=True
                )
            ]
        )
    ),
   
}

# In-memory Application Store: application_id -> record
APPLICATIONS_DB: Dict[str, Dict[str, Any]] = {}


class HiringDatabase:
    """
    Data operations for jobs and applications.
    """

    @staticmethod
    def list_jobs(
        query: Optional[str] = None,
        location: Optional[str] = None,
        workplace_type: Optional[str] = None,
        skills: Optional[List[str]] = None,
        status: str = "active"
    ) -> List[JobSummary]:
        """
        Returns lightweight summaries of all matching active jobs.
        """
        results: List[JobSummary] = []
        for job in JOBS_SEED.values():
            if status and job.status != status:
                continue

            # Filter by text query (matches title, department, or overview)
            if query:
                q = query.lower()
                title_match = q in job.title.lower()
                dept_match = q in job.department.lower()
                overview_match = q in job.overview.lower()
                if not (title_match or dept_match or overview_match):
                    continue

            # Filter by location
            if location and location.lower() not in job.location.lower():
                continue

            # Filter by workplace type (remote, hybrid, onsite)
            if workplace_type and job.workplace_type.lower() != workplace_type.lower():
                continue

            # Filter by skills overlap
            if skills:
                target_skills = {s.lower() for s in skills}
                job_skills = {s.lower() for s in (job.primary_skills + job.required_skills)}
                if not target_skills.intersection(job_skills):
                    continue

            # Convert to lightweight JobSummary
            results.append(
                JobSummary(
                    id=job.id,
                    title=job.title,
                    department=job.department,
                    location=job.location,
                    workplace_type=job.workplace_type,
                    employment_type=job.employment_type,
                    experience_level=job.experience_level,
                    min_years_experience=job.min_years_experience,
                    compensation=job.compensation,
                    primary_skills=job.primary_skills,
                    status=job.status,
                    posted_at=job.posted_at
                )
            )
        return results

    @staticmethod
    def get_job(job_id: str) -> Optional[JobDetail]:
        """
        Fetches the complete JobDetail including submission requirements.
        """
        return JOBS_SEED.get(job_id)

    @staticmethod
    def validate_passport(job_id: str, passport: CandidatePassport) -> ValidationResult:
        """
        Evaluates candidate passport against the specific job's submission requirements.
        Distinguishes mandatory requirements from optional bonus fields, tracks status of each,
        and provides high-impact recommendations and suggested questions.
        """
        job = JOBS_SEED.get(job_id)
        if not job:
            return ValidationResult(
                is_valid=False,
                missing_fields=[f"job_id '{job_id}' does not exist"],
                warnings=[],
                details={"error": "JOB_NOT_FOUND"}
            )

        reqs = job.submission_requirements
        missing: List[str] = []
        warnings: List[str] = []
        mandatory_status: Dict[str, bool] = {}
        optional_status: Dict[str, bool] = {}

        # -------------------------------------------------------------
        # 1. Mandatory Fields Evaluation
        # -------------------------------------------------------------
        # Full Name
        name_valid = bool(passport.full_name and passport.full_name.strip())
        mandatory_status["fullName"] = name_valid
        if "fullName" in reqs.mandatory_fields and not name_valid:
            missing.append("fullName (candidate's name is required)")

        # Email
        email_valid = bool(passport.email and "@" in passport.email)
        mandatory_status["email"] = email_valid
        if "email" in reqs.mandatory_fields and not email_valid:
            missing.append("email (valid email address required)")

        # Skills
        skills_valid = bool(passport.skills and len(passport.skills) > 0)
        mandatory_status["skills"] = skills_valid
        candidate_skill_names = {s.name.lower() for s in passport.skills} if passport.skills else set()
        unmatched = [
            rs for rs in job.required_skills
            if rs.lower() not in candidate_skill_names
        ]

        if "skills" in reqs.mandatory_fields and not skills_valid:
            missing.append("skills (at least 1 technical skill must be listed)")
        elif unmatched:
            warnings.append(
                f"Candidate passport is missing direct matches for required skills: {', '.join(unmatched)}"
            )

        # Experience
        exp_valid = bool(passport.experience and len(passport.experience) > 0)
        mandatory_status["experience"] = exp_valid
        if "experience" in reqs.mandatory_fields and not exp_valid:
            missing.append("experience (employment history required)")

        # Projects & Sandbox Repository Requirements
        projects_valid = len(passport.projects) >= reqs.min_projects
        mandatory_status["projects"] = projects_valid
        if "projects" in reqs.mandatory_fields and not projects_valid:
            missing.append(f"projects (minimum {reqs.min_projects} project(s) required)")

        valid_repo = False
        for p in passport.projects:
            url = (p.repository_url or "").strip()
            if url.startswith("http://") or url.startswith("https://"):
                valid_repo = True
                break

        mandatory_status["repositoryUrl"] = valid_repo
        if reqs.requires_code_repository or "repositoryUrl" in reqs.mandatory_fields:
            if not valid_repo:
                missing.append(
                    "repositoryUrl (a valid public Git repository URL is mandatory for automated sandbox verification)"
                )

        # Mandatory Profiles
        for req_prof in reqs.required_profiles:
            prof_val = getattr(passport.profiles, req_prof.lower(), None)
            prof_valid = bool(prof_val and str(prof_val).strip())
            mandatory_status[f"profiles.{req_prof.lower()}"] = prof_valid
            if not prof_valid:
                missing.append(f"profiles.{req_prof.lower()} ({req_prof.capitalize()} profile URL required)")

        is_valid = len(missing) == 0

        # -------------------------------------------------------------
        # 2. Optional Fields Tracking
        # -------------------------------------------------------------
        # Education details
        has_college = bool(any(e.institution and e.institution.strip() for e in passport.education))
        has_degree = bool(any(e.degree and e.degree.strip() for e in passport.education))
        has_cgpa = bool(passport.cgpa is not None or any(e.cgpa is not None for e in passport.education))
        has_tenth = bool(passport.tenth_result or any(e.tenth_result for e in passport.education))
        has_twelfth = bool(passport.twelfth_result or any(e.twelfth_result for e in passport.education))

        optional_status["education.college"] = has_college
        optional_status["education.degree"] = has_degree
        optional_status["education.cgpa"] = has_cgpa
        optional_status["education.tenth_result"] = has_tenth
        optional_status["education.twelfth_result"] = has_twelfth

        # Profiles & competitive coding
        optional_status["profiles.linkedin"] = bool(passport.profiles.linkedin)
        optional_status["profiles.leetcode"] = bool(passport.profiles.leetcode)
        optional_status["profiles.codeforces"] = bool(passport.profiles.codeforces)
        optional_status["profiles.codechef"] = bool(passport.profiles.codechef)
        optional_status["profiles.portfolio"] = bool(passport.profiles.portfolio)

        # Contact & summary
        optional_status["phone"] = bool(passport.phone and passport.phone.strip())
        optional_status["location"] = bool(passport.location and passport.location.strip())
        optional_status["summary"] = bool(passport.summary and passport.summary.strip())
        optional_status["certifications"] = bool(passport.certifications and len(passport.certifications) > 0)

        # -------------------------------------------------------------
        # 3. Evidence-First Readiness Scoring (0 - 100%)
        # -------------------------------------------------------------
        score = 0
        recommendations: List[HighImpactRecommendation] = []
        suggested_questions: List[str] = []

        # A. Identity & Contact (Max 20 pts)
        if name_valid:
            score += 10
        if email_valid:
            score += 10

        # B. Skills Overlap (Max 20 pts)
        if skills_valid:
            score += 5
            matched_count = len(job.required_skills) - len(unmatched)
            match_ratio = matched_count / max(len(job.required_skills), 1)
            score += int(match_ratio * 15)

        if unmatched:
            recommendations.append(
                HighImpactRecommendation(
                    field="skills",
                    impact="HIGH",
                    advice=f"Highlight hands-on experience in {', '.join(unmatched[:3])} to maximize skill overlap score."
                )
            )
            suggested_questions.append(
                f"Do you have practical experience with {', '.join(unmatched[:2])} that we should add to your skills profile?"
            )

        # C. Experience (Max 15 pts)
        if exp_valid:
            score += 15
        elif "experience" in reqs.mandatory_fields:
            suggested_questions.append(
                "Could you share your recent employment history (company, role title, and key achievements)?"
            )

        # D. Projects & Sandbox Code Repository (Max 25 pts)
        if passport.projects:
            score += 10
        if valid_repo:
            score += 15
        else:
            recommendations.append(
                HighImpactRecommendation(
                    field="projects[0].repository_url",
                    impact="CRITICAL",
                    advice=(
                        "Provide a public Git repository URL containing runnable unit tests. "
                        "This activates automated Docker sandbox testing and significantly boosts candidate evaluation."
                    )
                )
            )
            suggested_questions.append(
                "Do you have a public GitHub repository with runnable unit tests that showcases your work for this role?"
            )

        # E. Academic Background / Education (Optional Bonus: Max 10 pts)
        edu_score = 0
        if has_college and has_degree:
            edu_score += 4
        elif has_college or has_degree:
            edu_score += 2

        if has_cgpa:
            edu_score += 2

        if has_tenth:
            edu_score += 2

        if has_twelfth:
            edu_score += 2

        score += min(edu_score, 10)

        # Education recommendations & suggested questions
        if not (has_college and has_degree):
            recommendations.append(
                HighImpactRecommendation(
                    field="education",
                    impact="MEDIUM",
                    advice="[OPTIONAL] Providing your College/University, Degree, CGPA, and 10th/12th results enriches your academic profile and ranking."
                )
            )
            suggested_questions.append(
                "[OPTIONAL] What is your College/University, Degree, CGPA, and 10th/12th board results or percentages? (All academic fields are optional, feel free to skip if you prefer)."
            )
        elif not (has_cgpa and has_tenth and has_twelfth):
            suggested_questions.append(
                "[OPTIONAL] Would you like to add your CGPA and 10th/12th board marks or percentages to complete your academic record?"
            )

        # F. Profiles & Competitive Programming (Optional Bonus: Max 10 pts)
        profile_score = 0
        if passport.profiles.github:
            profile_score += 4
        else:
            recommendations.append(
                HighImpactRecommendation(
                    field="profiles.github",
                    impact="HIGH" if "github" in reqs.required_profiles else "MEDIUM",
                    advice="Link your GitHub profile so our verification agent can evaluate commit frequency and history."
                )
            )
            suggested_questions.append(
                "Would you like to include your GitHub profile link to provide commit history metrics?"
            )

        if passport.profiles.linkedin:
            profile_score += 2
        else:
            suggested_questions.append(
                "[OPTIONAL] Would you like to share your LinkedIn profile URL for employment verification?"
            )

        if passport.profiles.leetcode:
            profile_score += 2

        if passport.profiles.codeforces:
            profile_score += 1

        if passport.profiles.codechef:
            profile_score += 1

        if passport.profiles.portfolio:
            profile_score += 1

        score += min(profile_score, 10)

        if not (passport.profiles.leetcode or passport.profiles.codeforces or passport.profiles.codechef):
            recommendations.append(
                HighImpactRecommendation(
                    field="profiles.competitive_programming",
                    impact="MEDIUM",
                    advice="[OPTIONAL] Adding competitive coding profiles (LeetCode, Codeforces, CodeChef) highlights problem-solving capabilities."
                )
            )
            suggested_questions.append(
                "[OPTIONAL] Do you have any competitive coding profiles (LeetCode, Codeforces, CodeChef) or a portfolio website you would like to include?"
            )

        # G. Screening Questions
        if reqs.custom_questions:
            for cq in reqs.custom_questions:
                if cq.required:
                    suggested_questions.append(
                        f"Screening Question: '{cq.question}'"
                    )

        # -------------------------------------------------------------
        # 4. Tier Assignment & Summary
        # -------------------------------------------------------------
        if not is_valid:
            readiness_tier = "BRONZE"
            readiness_score_pct = min(score, 59)
            readiness_summary = (
                f"Application incomplete (Bronze Tier - {readiness_score_pct}%). "
                f"Missing {len(missing)} mandatory requirement(s): {', '.join(missing)}."
            )
        elif score < 85 or not valid_repo:
            readiness_tier = "SILVER"
            readiness_score_pct = min(max(score, 60), 84)
            readiness_summary = (
                f"Application eligible but not optimized (Silver Tier - {readiness_score_pct}%). "
                "All mandatory requirements met. Providing an automated unit test repo, college/CGPA, or competitive coding profiles (LeetCode/Codeforces/CodeChef) will elevate you to Gold Tier."
            )
        else:
            readiness_tier = "GOLD"
            readiness_score_pct = min(score, 100)
            readiness_summary = (
                f"Application fully verified and sandbox-ready (Gold Tier - {readiness_score_pct}%)! "
                "Code repository, testable harness, and candidate profiles are complete for containerized verification."
            )

        return ValidationResult(
            is_valid=is_valid,
            readiness_tier=readiness_tier,
            readiness_score_pct=readiness_score_pct,
            readiness_summary=readiness_summary,
            missing_fields=missing,
            warnings=warnings,
            mandatory_fields_status=mandatory_status,
            optional_fields_status=optional_status,
            high_impact_recommendations=recommendations,
            suggested_agent_questions=suggested_questions,
            details={
                "jobTitle": job.title,
                "requiredSkillsChecked": len(job.required_skills),
                "matchedSkillsCount": len(job.required_skills) - len(unmatched) if passport.skills else 0,
                "projectsProvided": len(passport.projects),
                "hasValidRepositoryUrl": valid_repo,
                "educationProvided": has_college and has_degree,
                "competitiveProfilesProvided": bool(passport.profiles.leetcode or passport.profiles.codeforces or passport.profiles.codechef),
                "readinessTier": readiness_tier
            }
        )

    @staticmethod
    def submit_application(submission: ApplicationSubmission) -> ApplicationReceipt:
        """
        Validates, records, and queues an application for the sandbox verification pipeline.
        Enforces human-in-the-loop candidate confirmation.
        """
        job = JOBS_SEED.get(submission.job_id)
        if not job:
            raise ValueError(f"Job '{submission.job_id}' not found.")

        # Human-in-the-loop check
        if not submission.confirmed_by_candidate:
            raise ValueError(
                "Human confirmation required: candidate must explicitly approve submission before filing."
            )

        # Pre-flight passport validation
        val_result = HiringDatabase.validate_passport(submission.job_id, submission.candidate_passport)
        if not val_result.is_valid:
            raise ValueError(f"Application incomplete: missing {', '.join(val_result.missing_fields)}")

        # Check required custom questions
        if job.submission_requirements.custom_questions:
            answers = submission.custom_answers or {}
            for cq in job.submission_requirements.custom_questions:
                if cq.required and (cq.id not in answers or not answers[cq.id].strip()):
                    raise ValueError(f"Required screening question missing answer: '{cq.question}' (ID: {cq.id})")

        # Generate unique application ID
        app_id = f"app-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Save to DB
        record = {
            "application_id": app_id,
            "job_id": submission.job_id,
            "job_title": job.title,
            "candidate_passport": submission.candidate_passport.model_dump(),
            "cover_note": submission.cover_note,
            "custom_answers": submission.custom_answers or {},
            "status": "SUBMITTED_PENDING_SANDBOX",
            "submitted_at": now_iso,
            "verification_pipeline": {
                "queued_at": now_iso,
                "sandbox_status": "QUEUED"
            }
        }
        APPLICATIONS_DB[app_id] = record

        return ApplicationReceipt(
            application_id=app_id,
            job_id=submission.job_id,
            candidate_name=submission.candidate_passport.full_name,
            candidate_email=submission.candidate_passport.email,
            status="SUBMITTED_PENDING_SANDBOX",
            submitted_at=now_iso,
            message=(
                f"Application successfully submitted for '{job.title}'. "
                "Automated sandbox verification pipeline has been triggered."
            )
        )

    @staticmethod
    def get_application_status(application_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches current state of an application.
        """
        app = APPLICATIONS_DB.get(application_id)
        if not app:
            return None
        return {
            "application_id": app["application_id"],
            "job_id": app["job_id"],
            "job_title": app["job_title"],
            "status": app["status"],
            "submitted_at": app["submitted_at"],
            "sandbox_status": app.get("verification_pipeline", {}).get("sandbox_status", "UNKNOWN")
        }
