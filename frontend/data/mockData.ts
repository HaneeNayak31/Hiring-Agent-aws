// data/mockData.ts

export interface EvidenceSource {
  type: 'GitHub' | 'Portfolio' | 'Resume' | 'Production';
  title: string;
  url: string;
  excerpt: string;
}

export interface VerifiedSkill {
  name: string;
  status: 'VERIFIED' | 'LIMITED' | 'UNVERIFIED';
  confidence: number; // 0 - 100
  sourcesCount: number;
  sources: EvidenceSource[];
}

export interface CandidateReport {
  id: string;
  roleId: string;
  name: string;
  role: string;
  appliedDate: string;
  fitScore: number;
  evidenceCoverage: number; // %
  status: 'RECEIVED' | 'ANALYZING' | 'VERIFYING' | 'VERIFIED' | 'INTERVIEW_READY' | 'REVIEW_REQUIRED' | 'REJECTED';
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
  static activeRoles = 12;
  static totalApplications = 284;
  static agentApplications = 247;
  static inVerification = 42;
  static interviewReady = 18;
}

export const mockRoles: OpenRole[] = [
  {
    id: 'role-1',
    title: 'SOFTWARE ENGINEER',
    department: 'Platform Engineering',
    location: 'Remote · San Francisco',
    type: 'Full Time',
    experience: '3–5 years',
    description: 'Build core high-concurrency platform services and developer tooling exposed via hiring endpoints.',
    status: 'OPEN',
    applicationsCount: 42,
    agentApplicationsCount: 37,
    inVerificationCount: 8,
    interviewReadyCount: 4,
    mcpEndpoint: 'mcp.stripe.com/hiring/software-engineer',
    mcpExposed: true,
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    preferredSkills: ['Distributed Systems', 'System Design'],
    activity: [
      { timestamp: '12:41 PM', message: 'Candidate report AH-2841 received via Claude Agent', type: 'AGENT' },
      { timestamp: '12:35 PM', message: 'Requirement weights updated for AWS CDK signals', type: 'SYSTEM' },
      { timestamp: '12:22 PM', message: 'Role exposed to hiring MCP network', type: 'EVENT' },
    ],
  },
  {
    id: 'role-2',
    title: 'BACKEND SYSTEMS ENGINEER',
    department: 'Infrastructure & Edge',
    location: 'Remote · New York',
    type: 'Full Time',
    experience: '4–7 years',
    description: 'Architect low-latency serverless runtime engines and edge distribution systems.',
    status: 'OPEN',
    applicationsCount: 31,
    agentApplicationsCount: 28,
    inVerificationCount: 6,
    interviewReadyCount: 3,
    mcpEndpoint: 'mcp.vercel.com/hiring/backend-engineer',
    mcpExposed: true,
    requiredSkills: ['TypeScript', 'Node.js', 'AWS', 'Rust'],
    preferredSkills: ['gRPC', 'PostgreSQL Query Tuning'],
    activity: [
      { timestamp: '11:15 AM', message: 'Candidate report AH-2840 verified via ChatGPT Agent', type: 'AGENT' },
      { timestamp: '09:40 AM', message: 'Hiring endpoint query rate: 418 requests/hr', type: 'SYSTEM' },
    ],
  },
  {
    id: 'role-3',
    title: 'FRONTEND ARCHITECT',
    department: 'Design Systems',
    location: 'Remote · International',
    type: 'Full Time',
    experience: '5+ years',
    description: 'Design ultra-fast, offline-first issue tracking user experiences with pixel-perfect precision.',
    status: 'OPEN',
    applicationsCount: 67,
    agentApplicationsCount: 61,
    inVerificationCount: 14,
    interviewReadyCount: 9,
    mcpEndpoint: 'mcp.linear.app/hiring/frontend-architect',
    mcpExposed: true,
    requiredSkills: ['React', 'TypeScript', 'State Synchronization'],
    preferredSkills: ['Canvas/WebGL', 'Web Workers'],
    activity: [
      { timestamp: 'Yesterday', message: '9 candidates marked Interview Ready', type: 'EVENT' },
    ],
  },
  {
    id: 'role-4',
    title: 'AI INFRASTRUCTURE ENGINEER',
    department: 'Core AI Platform',
    location: 'Remote · Seattle',
    type: 'Full Time',
    experience: '4+ years',
    description: 'Scale LLM inference clusters and Model Context Protocol bridges.',
    status: 'PAUSED',
    applicationsCount: 22,
    agentApplicationsCount: 19,
    inVerificationCount: 5,
    interviewReadyCount: 2,
    mcpEndpoint: 'mcp.stripe.com/hiring/ai-engineer',
    mcpExposed: false,
    requiredSkills: ['Python', 'PyTorch', 'CUDA', 'MCP Protocol'],
    preferredSkills: ['vLLM', 'Triton'],
    activity: [
      { timestamp: '2 days ago', message: 'Role set to PAUSED — new agent applications disabled', type: 'SYSTEM' },
    ],
  },
];

export const mockCandidateReports: CandidateReport[] = [
  {
    id: 'AH-2841',
    roleId: 'role-1',
    name: 'Hanee Nayak',
    role: 'Software Engineer',
    appliedDate: '17 SEP 2026',
    fitScore: 91,
    evidenceCoverage: 87,
    status: 'VERIFIED',
    agentSessionId: 'sess_0c4181ca24a096ec006aad2cc93e84819fa385826b6d6ce322',
    repoUrl: 'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git',
    bio: 'Senior engineer specializing in high-performance frontend systems, TypeScript compilers, and cloud infrastructure pipelines.',
    verifiedSources: {
      resume: true,
      github: true,
      portfolio: true,
      linkedin: false,
    },
    skills: [
      {
        name: 'React',
        status: 'VERIFIED',
        confidence: 96,
        sourcesCount: 3,
        sources: [
          { type: 'GitHub', title: 'react-design-system (2.4k stars)', url: 'github.com/hanee/react-ds', excerpt: 'Production UI component library built with React 18 concurrency primitives.' },
          { type: 'Portfolio', title: 'Interactive Web Showcase', url: 'hanee.dev/portfolio', excerpt: 'Complex web dashboard with real-time state synchronization.' },
          { type: 'Resume', title: 'Senior React Developer at Acme Inc', url: 'dossier/resume.pdf', excerpt: 'Architected React frontend serving 4M active users.' },
        ],
      },
      {
        name: 'TypeScript',
        status: 'VERIFIED',
        confidence: 98,
        sourcesCount: 2,
        sources: [
          { type: 'GitHub', title: 'type-safe-mcp-sdk', url: 'github.com/hanee/mcp-ts', excerpt: 'Strictly typed Model Context Protocol client implementation.' },
          { type: 'Production', title: 'FinDash Engine', url: 'findash.dev', excerpt: 'TypeScript AST transformer for financial telemetry.' },
        ],
      },
      {
        name: 'AWS',
        status: 'VERIFIED',
        confidence: 88,
        sourcesCount: 3,
        sources: [
          { type: 'GitHub', title: 'cdk-infrastructure-templates', url: 'github.com/hanee/aws-cdk', excerpt: 'AWS CDK templates for serverless microservices.' },
          { type: 'Portfolio', title: 'FinDash AWS Architecture', url: 'hanee.dev/aws-setup', excerpt: 'Multi-region AWS ECS cluster with CloudFront edge caching.' },
          { type: 'Resume', title: 'AWS Certified Solutions Architect', url: 'dossier/certifications', excerpt: 'Passed AWS Associate Solutions Architect certification.' },
        ],
      },
      {
        name: 'Node.js',
        status: 'VERIFIED',
        confidence: 90,
        sourcesCount: 2,
        sources: [
          { type: 'GitHub', title: 'async-task-runner', url: 'github.com/hanee/task-runner', excerpt: 'High-throughput Node.js event loop worker queue.' },
        ],
      },
      {
        name: 'Distributed Systems',
        status: 'LIMITED',
        confidence: 42,
        sourcesCount: 1,
        sources: [
          { type: 'Resume', title: 'Mentioned in past role bullet point', url: 'dossier/resume.pdf', excerpt: 'Collaborated on distributed Raft consensus implementation.' },
        ],
      },
    ],
    projects: [
      { name: 'FinDash', description: 'Real-time financial analytics engine handling 50k events/sec.', tech: ['React', 'TypeScript', 'AWS'], url: 'github.com/hanee/findash' },
      { name: 'LedgerFlow', description: 'Decentralized transactional log audit verification protocol.', tech: ['Node.js', 'AWS CDK'], url: 'github.com/hanee/ledgerflow' },
    ],
    potentialGaps: [
      'Limited public source evidence for multi-region Cassandra database operations.',
      'No verified Kubernetes cluster management repositories found in public GitHub profile.',
    ],
    interviewAreas: [
      'AWS cloud deployment architecture & CDK resource modularization',
      'High-concurrency Node.js event loop optimization under stress',
      'React state management in complex real-time applications',
    ],
    suggestedQuestions: [
      { number: '01', question: 'Walk through the architecture of your AWS CDK deployment for FinDash.', context: 'Verified via GitHub cdk-infrastructure-templates repository.' },
      { number: '02', question: 'How did you structure your backend API error handling in Node.js?', context: 'Verified via async-task-runner repository.' },
      { number: '03', question: 'How would you scale state synchronization for 100k concurrent client nodes?', context: 'Probe area for high-scale architectural thinking.' },
    ],
  },
  {
    id: 'AH-2840',
    roleId: 'role-2',
    name: 'Aarav Shah',
    role: 'Backend Systems Engineer',
    appliedDate: '17 SEP 2026',
    fitScore: 89,
    evidenceCoverage: 92,
    status: 'INTERVIEW_READY',
    agentSessionId: 'sess_0c4181ca24a096ec006aad2cc93e84819fa385826b6d6ce322',
    repoUrl: 'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git',
    bio: 'Systems software developer with focus on Rust microservices, low-latency gRPC APIs, and PostgreSQL query tuning.',
    verifiedSources: { resume: true, github: true, portfolio: true, linkedin: true },
    skills: [
      { name: 'Rust', status: 'VERIFIED', confidence: 94, sourcesCount: 2, sources: [] },
      { name: 'TypeScript', status: 'VERIFIED', confidence: 90, sourcesCount: 2, sources: [] },
      { name: 'AWS', status: 'VERIFIED', confidence: 85, sourcesCount: 2, sources: [] },
    ],
    projects: [],
    potentialGaps: ['Frontend framework experience limited to basic React.'],
    interviewAreas: ['Memory management in Rust microservices', 'Database indexing strategies'],
    suggestedQuestions: [
      { number: '01', question: 'How do you handle lock contention in high-throughput Rust services?', context: 'Verified Rust codebase.' },
    ],
  },
  {
    id: 'AH-2839',
    roleId: 'role-3',
    name: 'Priya Mehta',
    role: 'Frontend Architect',
    appliedDate: '16 SEP 2026',
    fitScore: 94,
    evidenceCoverage: 84,
    status: 'VERIFYING',
    agentSessionId: 'sess_0c4181ca24a096ec006aad2cc93e84819fa385826b6d6ce322',
    repoUrl: 'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git',
    bio: 'Design systems lead and web performance specialist.',
    verifiedSources: { resume: true, github: true, portfolio: true, linkedin: false },
    skills: [
      { name: 'React', status: 'VERIFIED', confidence: 99, sourcesCount: 3, sources: [] },
      { name: 'TypeScript', status: 'VERIFIED', confidence: 95, sourcesCount: 2, sources: [] },
    ],
    projects: [],
    potentialGaps: ['Limited experience with serverless cloud infrastructure.'],
    interviewAreas: ['Micro-frontend architecture', 'Bundle size optimization'],
    suggestedQuestions: [
      { number: '01', question: 'Describe your approach to building accessible design system components.', context: 'Verified via open source design system.' },
    ],
  },
];

export const mockMCPTools: MCPTool[] = [
  {
    name: 'search_jobs',
    description: 'Search currently open hiring requisitions by keyword, role title, or required skill signals.',
    inputParams: ['query: string', 'location?: string', 'min_match_fit?: number'],
    outputFields: ['job_id', 'title', 'company', 'requirements', 'mcp_apply_url'],
    callsToday: 642,
  },
  {
    name: 'get_job_requirements',
    description: 'Retrieve exact technical signal requirements and evidence criteria for a specific job.',
    inputParams: ['job_id: string'],
    outputFields: ['required_skills', 'evidence_weights', 'minimum_coverage_percent'],
    callsToday: 418,
  },
  {
    name: 'apply_to_job',
    description: 'Submit an external candidate report and evidence graph directly to company hiring pipeline.',
    inputParams: ['job_id: string', 'candidate_report_payload: object', 'delegation_signature: string'],
    outputFields: ['application_id', 'status', 'received_timestamp'],
    callsToday: 47,
  },
  {
    name: 'get_application_status',
    description: 'Query state of a submitted application using unique candidate delegation signature.',
    inputParams: ['application_id: string'],
    outputFields: ['status', 'verification_stage', 'last_updated'],
    callsToday: 177,
  },
];

export const mockMCPLogs: MCPActivityLog[] = [
  {
    id: 'log-101',
    timestamp: '12:41:03',
    toolName: 'apply_to_job',
    agentName: 'Claude 3.5 Sonnet Agent',
    roleTarget: 'Software Engineer',
    details: 'Submitted candidate report AH-2841 for Hanee Nayak with 87% evidence payload.',
    status: 'SUCCESS',
  },
  {
    id: 'log-100',
    timestamp: '12:40:51',
    toolName: 'get_job_requirements',
    agentName: 'ChatGPT Agent',
    roleTarget: 'Backend Systems Engineer',
    details: 'Retrieved evidence weights for role-2.',
    status: 'SUCCESS',
  },
  {
    id: 'log-99',
    timestamp: '12:39:22',
    toolName: 'search_jobs',
    agentName: 'Gemini Pro Agent',
    roleTarget: 'All Active Roles',
    details: 'Queried open requisitions matching query "React TypeScript". Returned 3 positions.',
    status: 'SUCCESS',
  },
  {
    id: 'log-98',
    timestamp: '12:35:10',
    toolName: 'get_application_status',
    agentName: 'Claude 3.5 Sonnet Agent',
    roleTarget: 'Frontend Architect',
    details: 'Polled status for AH-2839. Stage: VERIFYING.',
    status: 'SUCCESS',
  },
];

// Compatibility exports
export const mockCandidates: any[] = mockCandidateReports;
export const mockJobs: any[] = mockRoles;
export const mockAgentEvents: any[] = mockMCPLogs;
export const mockApplications: any[] = [
  {
    id: 'APP-101',
    candidateId: 'AH-2841',
    candidateName: 'Hanee Nayak',
    roleId: 'role-1',
    roleTitle: 'Software Engineer',
    appliedDate: '17 SEP 2026',
    status: 'VERIFIED',
    fitScore: 91,
    evidenceCoverage: 87,
  },
  {
    id: 'APP-102',
    candidateId: 'AH-2840',
    candidateName: 'Aarav Shah',
    roleId: 'role-2',
    roleTitle: 'Backend Systems Engineer',
    appliedDate: '17 SEP 2026',
    status: 'INTERVIEW_READY',
    fitScore: 89,
    evidenceCoverage: 92,
  },
  {
    id: 'APP-103',
    candidateId: 'AH-2839',
    candidateName: 'Priya Mehta',
    roleId: 'role-3',
    roleTitle: 'Frontend Architect',
    appliedDate: '16 SEP 2026',
    status: 'VERIFYING',
    fitScore: 94,
    evidenceCoverage: 84,
  },
];

export const mockInterviewBrief: any = {
  confirmedCompetencies: ['React (96% Confidence)', 'TypeScript (98% Confidence)', 'AWS (88% Confidence)'],
  probeAreas: [
    {
      title: 'State Mutation in Providers',
      detail: 'Investigate how raw setters in DataProvider and NNProvider are controlled under multi-tab concurrency.',
    },
    {
      title: 'Error Handling in SSE Buffer Parser',
      detail: 'Probe knowledge of edge-cases around chunk boundary splits and reconnection recovery.',
    },
  ],
  suggestedQuestions: [
    'Walk through how you handle partial buffer events in SSE streaming.',
    'How do you separate domain logic from state containers in React 19?',
    'What strategy would you use to eliminate build-gate lint failures in automated CI?',
  ],
};

