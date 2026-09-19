"""
Applicant MCP Server for AI-Native Hiring Platform.
Exposes tools for job discovery, detailed JD inspection with submission requirements,
pre-flight candidate passport validation, and human-confirmed application submission.
Now enriched with native MCP prompts, system instructions, and return-oriented agent guidance.
"""

from __future__ import annotations
import json
import os
from typing import Optional, List, Dict, Any, Union
from mcp.server.mcpserver import MCPServer
from models.passport import CandidatePassport
from models.application import ApplicationSubmission
from db import HiringDatabase


SERVER_INSTRUCTIONS = """
You are the candidate's proactive AI Career Agent & Co-Pilot on an Evidence-First AI-Native Hiring Platform.
Your mission is to represent the candidate, discover opportunities, and prepare the strongest, most competitive application possible.

================================================================================
CRITICAL OPERATING PRINCIPLES:
================================================================================

1. TRANSPARENT MANDATORY VS. OPTIONAL COMMUNICATION (NON-NEGOTIABLE):
   When interviewing the candidate or discussing application requirements, you MUST ALWAYS explicitly tell the user which fields are [MANDATORY] and which fields are [OPTIONAL].
   - For mandatory fields: Explain that these are required by the employer to process the application.
   - For optional fields: Clearly state: "This field is OPTIONAL bonus evidence. Providing it strengthens your verification score and ranking, but you may skip it if you prefer or do not have it."
   - Never confuse the candidate by presenting optional fields as mandatory or omitting them entirely.

2. COMPLETE CANDIDATE PASSPORT AWARENESS:
   You have complete knowledge of all potential candidate fields across these categories:

   A. MANDATORY CRITERIA (Required to apply):
      - Full Name & Contact Email Address.
      - Core Technical Skills (languages, frameworks, databases, and tools).
      - Showcase Project with a Public Git Repository URL (GitHub/GitLab):
        * THE DOCKER SANDBOX ADVANTAGE: Explain to the candidate that this employer's verification engine clones their repository into an isolated Docker sandbox to run automated unit tests, linting, architecture inspection, and commit history analysis.
        * A public repository with runnable unit tests (e.g., pytest, jest, vitest) is their single biggest competitive advantage.
      - Work / Project Experience (companies, roles, start/end dates, key achievements).

   B. OPTIONAL ACADEMIC QUALIFICATIONS (Bonus Verification Signals):
      - College / University Name: Name of the higher education institution.
      - Degree & Major: Degree obtained (e.g., B.Tech, B.S., M.S., B.E.) and field of study (e.g., Computer Science).
      - CGPA / GPA: Cumulative Grade Point Average or percentage (e.g., 8.9/10, 3.8/4.0, 85%).
      - 10th Grade / Board Result: Secondary school board, score, or percentage (e.g., 92% CBSE, 9.4 CGPA).
      - 12th Grade / Senior Secondary Result: Higher secondary school score or percentage (e.g., 94.5% State Board).
      * Agent Guidance: Always ask the candidate if they wish to share their college, CGPA, degree, and 10th/12th scores. Inform them that these are optional, but adding them boosts their academic standing and evidence tier.

   C. OPTIONAL COMPETITIVE PROGRAMMING & PROFESSIONAL PROFILES:
      - GitHub Profile URL: Mandatory/Recommended for git commit cadence and authorship metrics.
      - LinkedIn Profile URL: Optional – validates professional timeline and endorsements.
      - LeetCode Profile URL: Optional – showcases algorithmic problem-solving and contest rating.
      - Codeforces Profile URL: Optional – highlights competitive programming rating and contest rank.
      - CodeChef Profile URL: Optional – displays competitive programming division, stars, and global rank.
      - Personal Portfolio / Demo URL: Optional – showcases live applications, design aesthetics, or personal blogs.
      * Agent Guidance: Ask the candidate if they have active profiles on LinkedIn, LeetCode, Codeforces, or CodeChef. Explicitly remind them that each link is optional bonus evidence.

   D. OTHER OPTIONAL FIELDS:
      - Phone Number & Location (City, Country, or Remote preference).
      - Professional Summary / Executive Bio.
      - Certifications & Credential URLs.
      - Cover Note tailored to the role.

3. CONVERSATIONAL PROGRESSIVE INTERVIEW FLOW:
   Do not overwhelm the candidate by requesting 20 fields at once. Guide them progressively through structured stages:

   - Stage 1: Role Discovery & Deep-Dive
     Call `get_job_details(job_id)`. Present the role thoroughly: Title, Department, Compensation, Mission, Tech Stack, and the Docker Sandbox testing requirements.

   - Stage 2: Basic Identity & Core Skills [MANDATORY]
     Ask for Full Name, Email, and primary technical skills. Mention that Phone and Location can be provided as optional extras.

   - Stage 3: Showcase Project & Docker Sandbox Testing [MANDATORY]
     Ask for their star project title, description, public Git repository URL, and what unit test suites it runs (pytest, jest, etc.). Emphasize the Docker sandbox testing advantage.

   - Stage 4: Educational Background & Academic Scores [OPTIONAL]
     Ask: "[OPTIONAL] Would you like to provide your educational background? This includes your College/University name, Degree, CGPA, and your 10th & 12th board results/percentages. All of these are optional bonus signals—feel free to provide them or skip ahead."

   - Stage 5: Competitive Programming & Professional Profiles [OPTIONAL]
     Ask: "[OPTIONAL] Do you have any competitive programming or professional profiles you would like to include? For example: LinkedIn, LeetCode, Codeforces, CodeChef, or a personal portfolio website. (These are optional bonus credentials that boost your verification score)."

   - Stage 6: Experience & Screening Questions
     Gather employment history and answer any role-specific screening questions returned in `job_details`.

   - Stage 7: Pre-Flight Readiness Audit & Transparent Breakdown
     Call `validate_candidate_passport(job_id, passport)`. Present the user with:
     * Readiness Tier: Bronze (incomplete), Silver (eligible), or Gold (sandbox-verified with tests & profiles).
     * Readiness Score % (0-100%).
     * Mandatory Fields Checklist (which ones are satisfied vs missing).
     * Optional Fields Checklist (which ones were provided vs skipped).
     * High-Impact Recommendations: Suggest concrete steps to upgrade to Gold Tier before submitting.

   - Stage 8: Candidate Confirmation & Final Submission
     Present a clean summary preview of their entire application passport. Require their explicit human confirmation (`confirmed_by_candidate=True`) before calling `submit_application`.

4. EVIDENCE-FIRST MINDSET:
   Never make up fake credentials or arbitrary ratings. Frame every recommendation in terms of objective facts and testable artifacts.

5. AVAILABLE MCP PROMPTS & WORKFLOW TEMPLATES:
   This server registers native MCP prompt templates that you or the user can retrieve via `prompts/get` whenever a turnkey guided workflow is needed:
   - `career_copilot`:
     * When to use: When the candidate first introduces themselves, seeks role discovery, or asks for career guidance.
     * What it provides: Complete bootstrap prompt welcoming the candidate, explaining the Docker sandbox code evaluation advantage, detailing mandatory vs optional fields, and initiating skill/role discovery.
   - `apply_to_job(job_id)`:
     * When to use: When the candidate decides to apply for a specific requisition ID (e.g. `job_id="job-backend-01"`).
     * What it provides: The full 8-step interview flow template covering role breakdown (`get_job_details`), mandatory skills/project repo, optional academic qualifications (college, degree, CGPA, 10th/12th), optional competitive coding profiles (LinkedIn, LeetCode, Codeforces, CodeChef), screening questions, pre-flight validation (`validate_candidate_passport`), and candidate confirmation before `submit_application`.
   * You can leverage these prompts to ensure a standard, high-quality, evidence-first candidate journey.
"""

# Initialize MCPServer with comprehensive instructions for client agents
server = MCPServer(
    name="applicant-mcp-server",
    instructions=SERVER_INSTRUCTIONS
)


# ==========================================
# MCP Prompts: Native Guided Workflows
# ==========================================

@server.prompt(
    name="career_copilot",
    description="Initialize the AI Career Agent co-pilot to review candidate background, explain Docker sandbox testing, and discover matching roles."
)
def career_copilot() -> str:
    """Prompt to bootstrap the career co-pilot persona with complete field awareness."""
    return (
        "You are my AI Career Co-Pilot on the AI-Native Hiring Platform.\n\n"
        "Please introduce yourself and follow this structured flow:\n"
        "1. Welcome the candidate and explain how this Evidence-First platform evaluates real code in isolated Docker sandboxes (testing unit tests, linting, code architecture, and git commit history).\n"
        "2. Explain that in our application process, we will clearly distinguish between [MANDATORY] requirements (Name, Email, Skills, Showcase Git Repo with tests) and [OPTIONAL] bonus credentials (College, Degree, CGPA, 10th/12th results, LinkedIn, LeetCode, Codeforces, CodeChef, Portfolio).\n"
        "3. Ask what roles or technologies the candidate is targeting, or offer to run search_jobs() to explore active requisitions."
    )


@server.prompt(
    name="apply_to_job",
    description="Start a detailed, multi-stage application workflow for a specific job requisition, covering mandatory and optional fields."
)
def apply_to_job(job_id: str) -> str:
    """Prompt to begin guided application for a job with full mandatory vs optional transparency."""
    return (
        f"I would like to apply for job requisition '{job_id}'.\n\n"
        "Please follow this exact step-by-step interview flow:\n"
        f"Step 1: Call get_job_details('{job_id}') and provide a comprehensive role breakdown: Title, Compensation, Core Mission, Tech Stack, and the Docker Sandbox test evaluation criteria.\n\n"
        "Step 2: Collect Contact & Core Skills [MANDATORY]: Full Name, Email, and primary technical skills (mention Phone & Location are optional).\n\n"
        "Step 3: Collect Showcase Project [MANDATORY]: Project title, description, and public Git repository URL. Inquire about test suites (e.g. pytest, jest) that will run in the Docker sandbox.\n\n"
        "Step 4: Inquire about Academic Background [OPTIONAL]: Ask the candidate if they wish to share their College/University, Degree & Major, CGPA, and 10th & 12th board results/percentages. Explicitly state that all academic fields are optional bonus signals that boost their profile, and they may skip if preferred.\n\n"
        "Step 5: Inquire about Profiles & Competitive Coding [OPTIONAL]: Ask for GitHub profile URL (recommended for git history), and optional links: LinkedIn, LeetCode, Codeforces, CodeChef, and personal portfolio. Clearly inform the candidate that these competitive coding profiles are optional.\n\n"
        "Step 6: Collect past employment history and answer any role-specific screening questions found in get_job_details.\n\n"
        "Step 7: Run validate_candidate_passport() to perform a pre-flight readiness audit. Present the candidate with their Readiness Tier (Bronze, Silver, Gold), completion score %, a clear breakdown of satisfied mandatory vs optional fields, and actionable recommendations.\n\n"
        "Step 8: Render a complete preview snapshot of their application passport and ask for their explicit confirmation before invoking submit_application()."
    )


# ==========================================
# Helper Parsers
# ==========================================

def _parse_passport(passport: Union[CandidatePassport, str, Dict[str, Any]]) -> CandidatePassport:
    """Helper to parse passport input whether passed as model, dict, or JSON string."""
    if isinstance(passport, CandidatePassport):
        return passport
    if isinstance(passport, str):
        try:
            return CandidatePassport.model_validate_json(passport)
        except Exception as e:
            raise ValueError(f"Invalid passport JSON format: {str(e)}")
    if isinstance(passport, dict):
        try:
            return CandidatePassport.model_validate(passport)
        except Exception as e:
            raise ValueError(f"Invalid passport dictionary schema: {str(e)}")
    raise ValueError(f"Unsupported passport type: {type(passport).__name__}")


def _parse_custom_answers(answers: Optional[Union[Dict[str, str], str]]) -> Optional[Dict[str, str]]:
    """Helper to parse custom screening answers."""
    if answers is None:
        return None
    if isinstance(answers, dict):
        return answers
    if isinstance(answers, str):
        if not answers.strip():
            return None
        try:
            return json.loads(answers)
        except Exception as e:
            raise ValueError(f"Invalid custom_answers JSON: {str(e)}")
    return None


# ==========================================
# Tools: Core Interaction Contract
# ==========================================

@server.tool()
def search_jobs(
    query: Optional[str] = None,
    location: Optional[str] = None,
    workplace_type: Optional[str] = None,
    skills: Optional[Union[List[str], str]] = None
) -> List[Dict[str, Any]]:
    """
    Search and list active job openings. Returns lightweight job summaries
    including title, department, location, workplace type, compensation range, and primary skills.
    
    Args:
        query: Optional keyword to search in title, department, or overview
        location: Optional location filter (e.g. 'San Francisco', 'Remote')
        workplace_type: 'remote', 'hybrid', or 'onsite'
        skills: Skill filter as a list of strings or comma-separated string (e.g. 'Python, FastAPI')
    """
    skills_list: Optional[List[str]] = None
    if skills:
        if isinstance(skills, str):
            skills_list = [s.strip() for s in skills.split(",") if s.strip()]
        elif isinstance(skills, list):
            skills_list = skills

    summaries = HiringDatabase.list_jobs(
        query=query,
        location=location,
        workplace_type=workplace_type,
        skills=skills_list
    )
    return [s.model_dump() for s in summaries]


@server.tool()
def get_job_details(job_id: str) -> Dict[str, Any]:
    """
    Fetch comprehensive details of a specific role, including the complete markdown job description,
    team overview, responsibilities, required and preferred skills, compensation, benefits, and submission requirements.
    Submission requirements explicitly define:
      - mandatory_fields: e.g. fullName, email, skills, experience, projects, repositoryUrl.
      - optional_fields: e.g. education (college, degree, cgpa, 10th/12th results), profiles.linkedin,
        profiles.leetcode, profiles.codeforces, profiles.codechef, profiles.portfolio, phone, location, summary.
      - required_profiles vs optional_profiles.
      - custom_questions: role-specific screening questions.
    
    Args:
        job_id: Requisition identifier (e.g. 'job-backend-01')
    """
    job = HiringDatabase.get_job(job_id)
    if not job:
        raise ValueError(f"Job with ID '{job_id}' not found.")
    return job.model_dump()


@server.tool()
def validate_candidate_passport(
    job_id: str,
    passport: Union[CandidatePassport, str, Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Performs pre-flight readiness audit of a candidate passport against target role requirements.
    Evaluates both mandatory requirements and optional bonus fields.
    
    Returns:
      - 'is_valid': True if all mandatory requirements are satisfied.
      - 'readiness_tier': 'BRONZE' (missing mandatory), 'SILVER' (eligible), or 'GOLD' (fully verified with testable repo & profiles).
      - 'readiness_score_pct': Completeness score (0-100%).
      - 'readiness_summary': Summary explaining current status and tier.
      - 'mandatory_fields_status': Status mapping for each mandatory requirement.
      - 'optional_fields_status': Status mapping for optional bonus fields:
          * education.college, education.degree, education.cgpa, education.tenth_result, education.twelfth_result
          * profiles.linkedin, profiles.leetcode, profiles.codeforces, profiles.codechef, profiles.portfolio
          * phone, location, summary, certifications
      - 'missing_fields': List of hard mandatory fields still missing.
      - 'high_impact_recommendations': Actionable steps to upgrade readiness tier.
      - 'suggested_agent_questions': Concrete follow-up questions to ask the user, clearly tagged with [OPTIONAL] where applicable.
    
    Args:
        job_id: Target job requisition ID
        passport: Candidate passport containing identity, skills, experience, education, projects, and profiles
    """
    parsed_passport = _parse_passport(passport)
    val_result = HiringDatabase.validate_passport(job_id, parsed_passport)
    return val_result.model_dump()


@server.tool()
def submit_application(
    job_id: str,
    passport: Union[CandidatePassport, str, Dict[str, Any]],
    cover_note: Optional[str] = None,
    custom_answers: Optional[Union[Dict[str, str], str]] = None,
    confirmed_by_candidate: bool = False
) -> Dict[str, Any]:
    """
    Submits a candidate's verified application for a role.
    Requires explicit candidate confirmation (confirmed_by_candidate=True).
    Validates passport against submission requirements and queues the application
    for the automated sandbox code inspection pipeline.
    
    Before calling this tool, agents must present a complete summary snapshot to the candidate
    and obtain explicit confirmation.
    
    Args:
        job_id: Target job requisition ID
        passport: Candidate passport containing contact info, skills, projects, optional education, and profiles
        cover_note: Optional cover message or alignment rationale
        custom_answers: Optional dictionary or JSON of answers to job-specific screening questions
        confirmed_by_candidate: Mandatory human-in-the-loop candidate confirmation flag
    """
    parsed_passport = _parse_passport(passport)
    parsed_answers = _parse_custom_answers(custom_answers)

    submission = ApplicationSubmission(
        job_id=job_id,
        candidate_passport=parsed_passport,
        cover_note=cover_note,
        custom_answers=parsed_answers,
        confirmed_by_candidate=confirmed_by_candidate
    )

    receipt = HiringDatabase.submit_application(submission)
    return receipt.model_dump()


@server.tool()
def check_application_status(application_id: str) -> Dict[str, Any]:
    """
    Checks processing status and sandbox verification stage for a submitted application.
    
    Args:
        application_id: Application identifier (e.g. 'app-a1b2c3d4')
    """
    status = HiringDatabase.get_application_status(application_id)
    if not status:
        raise ValueError(f"Application '{application_id}' not found.")
    return status


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _run_streamable_http() -> None:
    """Run Streamable HTTP with a health endpoint for container platforms."""
    import anyio
    import uvicorn
    from starlette.responses import JSONResponse
    from starlette.routing import Route

    async def health(_request):
        return JSONResponse({"status": "ok", "service": "applicant-mcp-server"})

    async def serve() -> None:
        host = os.getenv("MCP_HOST", "0.0.0.0")
        port = int(os.getenv("MCP_PORT", "8000"))
        path = os.getenv("MCP_PATH", "/mcp")
        app = server.streamable_http_app(
            streamable_http_path=path,
            json_response=_env_bool("MCP_JSON_RESPONSE", True),
            stateless_http=_env_bool("MCP_STATELESS_HTTP", True),
            host=host,
        )
        app.routes.insert(0, Route("/health", health, methods=["GET"]))

        config = uvicorn.Config(
            app,
            host=host,
            port=port,
            log_level=server.settings.log_level.lower(),
        )
        await uvicorn.Server(config).serve()

    anyio.run(serve)


if __name__ == "__main__":
    import sys

    transport = sys.argv[1] if len(sys.argv) > 1 else "stdio"
    if transport == "streamable-http":
        _run_streamable_http()
    else:
        server.run(transport=transport)

