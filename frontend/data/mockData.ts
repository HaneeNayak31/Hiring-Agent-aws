// data/mockData.ts

export interface EvidenceSource {
  type: 'GitHub' | 'Portfolio' | 'Resume' | 'Production';
  title: string;
  url: string;
  excerpt: string;
}

export interface VerifiedSkill {
  name: string;
  status: 'OBSERVED' | 'VERIFIED' | 'LIMITED' | 'UNVERIFIED';
  confidence?: number;
  sourcesCount?: number;
  sources: EvidenceSource[];
}

export interface CandidateReport {
  id: string;
  roleId: string;
  name: string;
  role: string;
  appliedDate: string;
  status: 'RECEIVED' | 'ANALYZING' | 'VERIFYING' | 'INSPECTED' | 'REVIEW_REQUIRED';
  bio: string;
  agentSessionId?: string;
  repoUrl?: string;
  reportUrl?: string;
  verifiedSources: {
    resume: boolean;
    github: boolean;
    portfolio: boolean;
    linkedin: boolean;
  };
  skills: VerifiedSkill[];
  projects: {
    name: string;
    description: string;
    tech: string[];
    url: string;
  }[];
  potentialGaps: string[];
  interviewAreas: string[];
  suggestedQuestions: {
    number: string;
    question: string;
    context: string;
  }[];
}

export interface OpenRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  description: string;
  status: 'OPEN' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';
  applicationsCount: number;
  agentApplicationsCount: number;
  inVerificationCount: number;
  interviewReadyCount: number;
  mcpEndpoint: string;
  mcpExposed: boolean;
  requiredSkills: string[];
  preferredSkills: string[];
  evaluation_guidance?: string;
  activity: {
    timestamp: string;
    message: string;
    type: 'EVENT' | 'AGENT' | 'SYSTEM';
  }[];
}

export interface MCPTool {
  name: string;
  description: string;
  inputParams: string[];
  outputFields: string[];
  callsToday: number;
}

export interface MCPActivityLog {
  id: string;
  timestamp: string;
  toolName: string;
  agentName: string;
  roleTarget: string;
  details: string;
  status: 'SUCCESS' | 'EXPIRED' | 'BLOCKED';
}

// ----------------------------------------------------
// MOCK DATA STORES
// ----------------------------------------------------

export class CompanyStats {
  static activeRoles = 0;
  static totalApplications = 0;
  static agentApplications = 0;
  static inVerification = 0;
  static interviewReady = 0;
}

export const mockRoles: OpenRole[] = [];

export const mockCandidateReports: CandidateReport[] = [];

export const mockMCPTools: MCPTool[] = [
  {
    name: 'search_jobs',
    description: 'Search currently open hiring requisitions by keyword, role title, or required skill signals.',
    inputParams: ['query: string', 'location?: string', 'min_match_fit?: number'],
    outputFields: ['job_id', 'title', 'company', 'requirements', 'mcp_apply_url'],
    callsToday: 0,
  },
  {
    name: 'get_job_requirements',
    description: 'Retrieve exact technical signal requirements and evidence criteria for a specific job.',
    inputParams: ['job_id: string'],
    outputFields: ['required_skills', 'evidence_weights', 'minimum_coverage_percent'],
    callsToday: 0,
  },
  {
    name: 'apply_to_job',
    description: 'Submit an external candidate report and evidence graph directly to company hiring pipeline.',
    inputParams: ['job_id: string', 'candidate_report_payload: object', 'delegation_signature: string'],
    outputFields: ['application_id', 'status', 'received_timestamp'],
    callsToday: 0,
  },
  {
    name: 'get_application_status',
    description: 'Query state of a submitted application using unique candidate delegation signature.',
    inputParams: ['application_id: string'],
    outputFields: ['status', 'verification_stage', 'last_updated'],
    callsToday: 0,
  },
];

export const mockMCPLogs: MCPActivityLog[] = [];

// Compatibility exports
export const mockCandidates: any[] = [];
export const mockJobs: any[] = [];
export const mockAgentEvents: any[] = [];
export const mockApplications: any[] = [];

export const mockInterviewBrief: any = {
  confirmedCompetencies: [],
  probeAreas: [],
  suggestedQuestions: [],
};
