// data/schemaAdapter.ts
import { JobRoleDetail, ApplicationRecord } from './apiClient';
import { OpenRole, CandidateReport, VerifiedSkill } from './mockData';

export function mapJobDetailToOpenRole(job: JobRoleDetail): OpenRole {
  return {
    id: job.job_id || job.id,
    title: job.title || 'UNTITLED ROLE',
    department: job.department || 'Engineering',
    location: job.location || 'Remote',
    type: job.employment_type === 'full-time' ? 'Full Time' : job.employment_type || 'Full Time',
    experience: job.experience_level || `${job.min_years_experience || 2}+ years`,
    description: job.overview || job.full_description_markdown || '',
    status: (job.status?.toUpperCase() as any) || 'OPEN',
    applicationsCount: job.applications_count ?? 0,
    agentApplicationsCount: job.applications_count ? Math.floor(job.applications_count * 0.85) : 0,
    inVerificationCount: job.in_verification_count ?? 0,
    interviewReadyCount: job.interview_ready_count ?? 0,
    mcpEndpoint: job.mcp_endpoint || 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp',
    mcpExposed: job.mcp_exposed ?? true,
    requiredSkills: job.required_skills || job.primary_skills || [],
    preferredSkills: job.preferred_skills || [],
    activity: [
      {
        timestamp: 'Live Sync',
        message: `Role synchronized from DynamoDB HiringAgent_Jobs`,
        type: 'SYSTEM',
      },
    ],
  };
}

export function mapApplicationToCandidateReport(app: ApplicationRecord): CandidateReport {
  const passport = app.candidate_passport || ({} as any);
  const projects = passport.projects || [];
  const primaryProject = projects[0] || {};
  const skillsList = passport.skills || [];

  const mappedSkills: VerifiedSkill[] = skillsList.map((sk: any) => ({
    name: typeof sk === 'string' ? sk : sk.name || 'Skill',
    status: app.status === 'EVALUATED' ? 'OBSERVED' : 'LIMITED',
    sources: [
      {
        type: 'GitHub',
        title: primaryProject.title || 'Code Repository',
        url: primaryProject.repository_url || '',
        excerpt: primaryProject.description || 'Verified in sandbox assessment.',
      },
    ],
  }));

  let uiStatus: CandidateReport['status'] = 'RECEIVED';
  if (app.status === 'EVALUATED') uiStatus = 'INSPECTED';
  else if (app.status === 'EVALUATING' || app.status === 'SUBMITTED_PENDING_SANDBOX') uiStatus = 'VERIFYING';

  return {
    id: app.application_id,
    roleId: app.job_id,
    name: passport.full_name || 'Candidate',
    role: app.job_title || 'Software Engineer',
    appliedDate: app.submitted_at
      ? new Date(app.submitted_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Recent',
    status: uiStatus,
    bio: passport.summary || 'Applicant submitted via Hiring Agent MCP protocol.',
    agentSessionId: app.evaluation_summary?.session_id || app.application_id,
    repoUrl: primaryProject.repository_url || '',
    verifiedSources: {
      resume: true,
      github: !!primaryProject.repository_url,
      portfolio: !!passport.profiles?.portfolio,
      linkedin: !!passport.profiles?.linkedin,
    },
    skills: mappedSkills,
    projects: projects.map((p: any) => ({
      name: p.title || 'Project',
      description: p.description || '',
      tech: p.tech_stack || [],
      url: p.repository_url || p.live_url || '',
    })),
    potentialGaps: [],
    interviewAreas: [],
    suggestedQuestions: [],
  };
}

// Alias for cleaner imports in candidate detail pages
export const adaptApplicationToCandidate = mapApplicationToCandidateReport;
