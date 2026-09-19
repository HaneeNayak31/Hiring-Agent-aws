"""
Database abstraction layer and DynamoDB repository for jobs and candidate applications.
Connects directly to Amazon DynamoDB.
Enables DynamoDB Streams on applications for automated sandbox agent evaluation.
"""

from __future__ import annotations
import os
import uuid
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import boto3
from dotenv import load_dotenv

from models.job import (
    JobSummary,
    JobDetail,
    Compensation,
)
from models.passport import CandidatePassport
from models.application import ApplicationSubmission, ApplicationReceipt
from models.validation import ValidationResult, HighImpactRecommendation

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
ENDPOINT_URL = os.getenv("DYNAMODB_ENDPOINT_URL")
JOBS_TABLE_NAME = os.getenv("DYNAMODB_JOBS_TABLE", "HiringAgent_Jobs")
APPS_TABLE_NAME = os.getenv("DYNAMODB_APPLICATIONS_TABLE", "HiringAgent_Applications")

def _get_dynamodb_resource():
    """Initializes and returns the boto3 DynamoDB resource."""
    kwargs = {"region_name": AWS_REGION}
    if ENDPOINT_URL:
        kwargs["endpoint_url"] = ENDPOINT_URL
    return boto3.resource("dynamodb", **kwargs)


def _float_to_decimal(obj: Any) -> Any:
    """Recursively convert float to Decimal for boto3 DynamoDB serialization."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: _float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_float_to_decimal(x) for x in obj]
    return obj


def _decimal_to_native(obj: Any) -> Any:
    """Recursively convert DynamoDB Decimal back to standard Python int/float."""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    if isinstance(obj, dict):
        return {k: _decimal_to_native(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_decimal_to_native(x) for x in obj]
    return obj


class HiringDatabase:
    """
    Data operations for jobs and applications, backed by Amazon DynamoDB.
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
        Queries DynamoDB GSI 'status-posted_at-index'.
        """
        raw_items: List[Dict[str, Any]] = []

        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(JOBS_TABLE_NAME)

        # Query GSI status-posted_at-index
        response = table.query(
            IndexName="status-posted_at-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("status").eq(status)
        )
        raw_items = response.get("Items", [])

        results: List[JobSummary] = []
        for raw in raw_items:
            item = _decimal_to_native(raw)
            job_id = item.get("job_id") or item.get("id")
            item["id"] = job_id

            # Filter by text query (matches title, department, or overview)
            if query:
                q = query.lower()
                title_match = q in item.get("title", "").lower()
                dept_match = q in item.get("department", "").lower()
                overview_match = q in item.get("overview", "").lower()
                if not (title_match or dept_match or overview_match):
                    continue

            # Filter by location
            if location and location.lower() not in item.get("location", "").lower():
                continue

            # Filter by workplace type (remote, hybrid, onsite)
            if workplace_type and item.get("workplace_type", "").lower() != workplace_type.lower():
                continue

            # Filter by skills overlap
            if skills:
                target_skills = {s.lower() for s in skills}
                primary = item.get("primary_skills", [])
                required = item.get("required_skills", [])
                job_skills = {s.lower() for s in (primary + required)}
                if not target_skills.intersection(job_skills):
                    continue

            # Convert to lightweight JobSummary
            results.append(
                JobSummary(
                    id=job_id,
                    title=item["title"],
                    department=item["department"],
                    location=item["location"],
                    workplace_type=item["workplace_type"],
                    employment_type=item.get("employment_type", "full-time"),
                    experience_level=item.get("experience_level", "Junior"),
                    min_years_experience=item.get("min_years_experience", 0),
                    compensation=Compensation(**item["compensation"]),
                    primary_skills=item.get("primary_skills", []),
                    status=item.get("status", "active"),
                    posted_at=item["posted_at"]
                )
            )
        return results

    @staticmethod
    def get_job(job_id: str) -> Optional[JobDetail]:
        """
        Fetches complete JobDetail including submission requirements from DynamoDB.
        """
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(JOBS_TABLE_NAME)
        response = table.get_item(Key={"job_id": job_id})
        item = response.get("Item")
        if not item:
            return None

        native_item = _decimal_to_native(item)
        native_item["id"] = native_item.get("job_id") or native_item.get("id")
        return JobDetail.model_validate(native_item)

    @staticmethod
    def validate_passport(job_id: str, passport: CandidatePassport) -> ValidationResult:
        """
        Evaluates candidate passport against the specific job's submission requirements.
        Distinguishes mandatory requirements from optional bonus fields, tracks status of each,
        and provides high-impact recommendations and suggested questions.
        """
        job = HiringDatabase.get_job(job_id)
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
        name_valid = bool(passport.full_name and passport.full_name.strip())
        mandatory_status["fullName"] = name_valid
        if "fullName" in reqs.mandatory_fields and not name_valid:
            missing.append("fullName (candidate's name is required)")

        email_valid = bool(passport.email and "@" in passport.email)
        mandatory_status["email"] = email_valid
        if "email" in reqs.mandatory_fields and not email_valid:
            missing.append("email (valid email address required)")

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

        exp_valid = bool(passport.experience and len(passport.experience) > 0)
        mandatory_status["experience"] = exp_valid
        if "experience" in reqs.mandatory_fields and not exp_valid:
            missing.append("experience (employment history required)")

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

        optional_status["profiles.linkedin"] = bool(passport.profiles.linkedin)
        optional_status["profiles.leetcode"] = bool(passport.profiles.leetcode)
        optional_status["profiles.codeforces"] = bool(passport.profiles.codeforces)
        optional_status["profiles.codechef"] = bool(passport.profiles.codechef)
        optional_status["profiles.portfolio"] = bool(passport.profiles.portfolio)

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

        if name_valid:
            score += 10
        if email_valid:
            score += 10

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

        if exp_valid:
            score += 15
        elif "experience" in reqs.mandatory_fields:
            suggested_questions.append(
                "Could you share your recent employment history (company, role title, and key achievements)?"
            )

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

        if reqs.custom_questions:
            for cq in reqs.custom_questions:
                if cq.required:
                    suggested_questions.append(
                        f"Screening Question: '{cq.question}'"
                    )

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
                "All mandatory requirements met. Providing an automated unit test repo, college/CGPA, or competitive coding profiles will elevate you to Gold Tier."
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
        Validates, records, and writes candidate application into DynamoDB 'HiringAgent_Applications'.
        Enforces human-in-the-loop candidate confirmation.
        This PutItem operation triggers DynamoDB Streams for Phase 2 sandbox evaluation.
        """
        job = HiringDatabase.get_job(submission.job_id)
        if not job:
            raise ValueError(f"Job '{submission.job_id}' not found.")

        if not submission.confirmed_by_candidate:
            raise ValueError(
                "Human confirmation required: candidate must explicitly approve submission before filing."
            )

        val_result = HiringDatabase.validate_passport(submission.job_id, submission.candidate_passport)
        if not val_result.is_valid:
            raise ValueError(f"Application incomplete: missing {', '.join(val_result.missing_fields)}")

        if job.submission_requirements.custom_questions:
            answers = submission.custom_answers or {}
            for cq in job.submission_requirements.custom_questions:
                if cq.required and (cq.id not in answers or not answers[cq.id].strip()):
                    raise ValueError(f"Required screening question missing answer: '{cq.question}' (ID: {cq.id})")

        app_id = f"app-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        record = {
            "application_id": app_id,
            "job_id": submission.job_id,
            "job_title": job.title,
            "candidate_passport": submission.candidate_passport.model_dump(),
            "cover_note": submission.cover_note,
            "custom_answers": submission.custom_answers or {},
            "status": "SUBMITTED_PENDING_SANDBOX",
            "readiness_tier": val_result.readiness_tier,
            "readiness_score_pct": val_result.readiness_score_pct,
            "submitted_at": now_iso,
            "verification_pipeline": {
                "queued_at": now_iso,
                "sandbox_status": "QUEUED"
            }
        }

        # Write to DynamoDB. Any failure is surfaced to the caller because
        # successful submission must mean durable storage.
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        table.put_item(Item=_float_to_decimal(record))

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
        Fetches processing status and sandbox verification stage for a submitted application.
        """
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        response = table.get_item(Key={"application_id": application_id})
        item = response.get("Item")
        if not item:
            return None

        app = _decimal_to_native(item)
        return {
            "application_id": app["application_id"],
            "job_id": app["job_id"],
            "job_title": app["job_title"],
            "status": app["status"],
            "submitted_at": app["submitted_at"],
            "sandbox_status": app.get("verification_pipeline", {}).get("sandbox_status", "UNKNOWN")
        }

    @staticmethod
    def list_applications_for_job(job_id: str) -> List[Dict[str, Any]]:
        """
        Queries all candidate applications submitted for a specific job requisition.
        Powers the Recruiter / HR applicants pipeline.
        """
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        response = table.query(
            IndexName="job_id-submitted_at-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("job_id").eq(job_id)
        )
        items = response.get("Items", [])
        return [_decimal_to_native(item) for item in items]

    @staticmethod
    def get_application(application_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches the complete candidate application record.
        """
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        response = table.get_item(Key={"application_id": application_id})
        item = response.get("Item")
        return _decimal_to_native(item) if item else None

    @staticmethod
    def update_application_evaluation(
        application_id: str,
        report_s3_url: str,
        trace_s3_url: str,
        evaluation_summary: Dict[str, Any]
    ) -> bool:
        """
        Updates an application record post-sandbox evaluation with S3 links and metrics.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        dynamodb = _get_dynamodb_resource()
        table = dynamodb.Table(APPS_TABLE_NAME)
        table.update_item(
            Key={"application_id": application_id},
            UpdateExpression="""
                SET #status = :status,
                    report_s3_url = :r_url,
                    trace_s3_url = :t_url,
                    evaluated_at = :eval_at,
                    evaluation_summary = :summary,
                    verification_pipeline.sandbox_status = :s_status
            """,
            ExpressionAttributeNames={"#status": "status"},
            ExpressionAttributeValues={
                ":status": "EVALUATED",
                ":r_url": report_s3_url,
                ":t_url": trace_s3_url,
                ":eval_at": now_iso,
                ":summary": _float_to_decimal(evaluation_summary),
                ":s_status": "COMPLETED"
            }
        )
        return True
