// data/apiClient.ts

export const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://txz2isu11g.execute-api.ap-south-1.amazonaws.com').replace(/\/+$/, '');

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isValidationError(): boolean {
    return this.statusCode === 400;
  }
}

async function parseResponseOrThrow<T>(res: Response, fallbackErrorMessage: string): Promise<T> {
  if (!res.ok) {
    let errorDetail = '';
    let details: any = null;
    try {
      const json = await res.json();
      if (typeof json.detail === 'string') {
        errorDetail = json.detail;
      } else if (json.detail) {
        errorDetail = json.detail.message || JSON.stringify(json.detail);
        details = json.detail;
      } else if (json.message) {
        errorDetail = json.message;
      }
    } catch {
      try {
        errorDetail = await res.text();
      } catch {
        errorDetail = res.statusText;
      }
    }
    const message = errorDetail || `${fallbackErrorMessage} (HTTP ${res.status})`;
    throw new ApiError(message, res.status, details);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

function wrapNetworkError(err: any, contextMessage: string): ApiError {
  if (err instanceof ApiError) return err;
  const isNetwork =
    err?.name === 'TypeError' ||
    err?.message?.includes('fetch') ||
    err?.message?.includes('Network') ||
    err?.message?.includes('Failed to fetch');

  return new ApiError(
    isNetwork
      ? `Unable to connect to API Gateway (${API_BASE_URL}). Please verify backend connectivity and network status.`
      : err?.message || contextMessage,
    isNetwork ? 0 : 500
  );
}

export interface CompensationData {
  min: number;
  max: number;
  currency: string;
  period: 'yearly' | 'monthly' | 'hourly';
}

export interface CustomQuestionData {
  id: string;
  question: string;
  required: boolean;
}

export interface SubmissionRequirementsData {
  mandatory_fields: string[];
  optional_fields: string[];
  min_projects: number;
  requires_code_repository: boolean;
  required_profiles: string[];
  optional_profiles: string[];
  custom_questions: CustomQuestionData[];
}

export interface JobRoleDetail {
  job_id: string;
  id: string;
  title: string;
  department: string;
  location: string;
  workplace_type: 'remote' | 'hybrid' | 'onsite';
  employment_type: 'full-time' | 'contract' | 'internship';
  experience_level: string;
  min_years_experience: number;
  compensation: CompensationData;
  primary_skills: string[];
  status: 'active' | 'paused' | 'closed' | 'archived';
  posted_at: string;
  mcp_exposed: boolean;
  mcp_endpoint: string;
  overview: string;
  full_description_markdown: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  evaluation_guidance?: string;
  benefits: string[];
  submission_requirements: SubmissionRequirementsData;
  applications_count?: number;
  in_verification_count?: number;
  interview_ready_count?: number;
}

export interface ApplicationRecord {
  application_id: string;
  job_id: string;
  job_title?: string;
  candidate_passport: {
    full_name: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
    skills?: { name: string; years_experience?: number; category: string }[];
    experience?: { company: string; role: string; start_date: string; end_date?: string; highlights: string[] }[];
    education?: { institution: string; degree: string; field_of_study?: string; cgpa?: string | number; grad_year?: number }[];
    projects?: { title: string; description: string; repository_url: string; live_url?: string; tech_stack: string[] }[];
    profiles?: { github?: string; linkedin?: string; leetcode?: string; codeforces?: string; portfolio?: string };
  };
  cover_note?: string;
  status: string;
  submitted_at: string;
  evaluated_at?: string;
  report_s3_url?: string;
  trace_s3_url?: string;
  evaluation_summary?: {
    session_id: string;
    repositories_total?: number;
    trace_status?: string;
  };
}

// ----------------------------------------------------
// API Client Methods
// ----------------------------------------------------

export async function checkHealth(): Promise<{ status: string; service: string; tables: Record<string, string>; s3_bucket: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
    return await parseResponseOrThrow(res, 'Health check failed');
  } catch (err: any) {
    throw wrapNetworkError(err, 'Health check endpoint unreachable');
  }
}

export async function fetchJobs(status?: string): Promise<JobRoleDetail[]> {
  try {
    const url = status && status !== 'ALL'
      ? `${API_BASE_URL}/api/jobs?status=${status.toLowerCase()}`
      : `${API_BASE_URL}/api/jobs`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await parseResponseOrThrow<{ jobs: JobRoleDetail[]; total: number }>(res, 'Failed to fetch job requisitions');
    return data.jobs || [];
  } catch (err: any) {
    throw wrapNetworkError(err, 'Failed to fetch job requisitions');
  }
}

export async function createJob(jobPayload: Partial<JobRoleDetail>): Promise<JobRoleDetail> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload),
    });

    const data = await parseResponseOrThrow<{ status: string; job: JobRoleDetail }>(res, 'Failed to create job requisition');
    return data.job;
  } catch (err: any) {
    throw wrapNetworkError(err, 'Failed to publish job requisition');
  }
}

export async function fetchJob(jobId: string): Promise<JobRoleDetail> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, { cache: 'no-store' });
    return await parseResponseOrThrow<JobRoleDetail>(res, `Job '${jobId}' could not be retrieved`);
  } catch (err: any) {
    throw wrapNetworkError(err, `Failed to fetch job '${jobId}'`);
  }
}

export async function updateJobStatus(jobId: string, status: string): Promise<any> {
  let backendStatus = status.toLowerCase();
  if (backendStatus === 'open') backendStatus = 'active';

  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: backendStatus }),
    });

    return await parseResponseOrThrow(res, `Failed to update status for job '${jobId}'`);
  } catch (err: any) {
    throw wrapNetworkError(err, `Failed to update status for job '${jobId}'`);
  }
}

export async function fetchApplications(jobId?: string): Promise<ApplicationRecord[]> {
  try {
    const url = jobId
      ? `${API_BASE_URL}/api/jobs/${jobId}/applications`
      : `${API_BASE_URL}/api/applications`;

    const res = await fetch(url, { cache: 'no-store' });
    const data = await parseResponseOrThrow<{ applications: ApplicationRecord[]; total: number }>(res, 'Failed to fetch applications');
    return data.applications || [];
  } catch (err: any) {
    throw wrapNetworkError(err, 'Failed to fetch applications');
  }
}

export async function fetchApplication(appId: string): Promise<ApplicationRecord> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/applications/${appId}`, { cache: 'no-store' });
    return await parseResponseOrThrow<ApplicationRecord>(res, `Application '${appId}' could not be retrieved`);
  } catch (err: any) {
    throw wrapNetworkError(err, `Failed to fetch application '${appId}'`);
  }
}

export async function fetchCandidateReport(identifier: string): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reports/${identifier}`, { cache: 'no-store' });
    return await parseResponseOrThrow<string>(res, `Candidate report for '${identifier}' not available`);
  } catch (err: any) {
    throw wrapNetworkError(err, `Failed to retrieve report for '${identifier}'`);
  }
}

export async function fetchCandidateTrace(identifier: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/traces/${identifier}`, { cache: 'no-store' });
    return await parseResponseOrThrow<any>(res, `Execution trace for '${identifier}' not available`);
  } catch (err: any) {
    throw wrapNetworkError(err, `Failed to retrieve execution trace for '${identifier}'`);
  }
}

export async function fetchCandidateTranscript(identifier: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/transcripts/${identifier}`, { cache: 'no-store' });
    return await parseResponseOrThrow<any>(res, `Execution transcript for '${identifier}' not available`);
  } catch (err: any) {
    // If not found or error, return null so client-side fallback can synthesize smoothly
    return null;
  }
}


export async function submitApplication(payload: {
  job_id: string;
  candidate_passport: Record<string, any>;
  cover_note?: string;
  custom_answers?: Record<string, string>;
  confirmed_by_candidate: boolean;
}): Promise<{ application_id: string; status: string; submitted_at: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return await parseResponseOrThrow<{ application_id: string; status: string; submitted_at: string }>(
      res,
      'Application submission rejected'
    );
  } catch (err: any) {
    throw wrapNetworkError(err, 'Failed to submit candidate application');
  }
}
