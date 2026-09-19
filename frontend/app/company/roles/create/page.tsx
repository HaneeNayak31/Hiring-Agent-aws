'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CompanyNav from '@/components/layout/CompanyNav';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { createJob, JobRoleDetail } from '@/data/apiClient';
import {
  Briefcase,
  DollarSign,
  FileText,
  ShieldCheck,
  Server,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreateRolePage() {
  const router = useRouter();

  // 1. Core Metadata
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Core Infrastructure');
  const [location, setLocation] = useState('Remote · US / Worldwide');
  const [workplaceType, setWorkplaceType] = useState<'remote' | 'hybrid' | 'onsite'>('remote');
  const [employmentType, setEmploymentType] = useState<'full-time' | 'contract' | 'internship'>('full-time');
  const [experienceLevel, setExperienceLevel] = useState('Senior (4–7 yrs)');
  const [minYearsExperience, setMinYearsExperience] = useState<number>(4);

  // 2. Compensation
  const [salaryMin, setSalaryMin] = useState<number>(140000);
  const [salaryMax, setSalaryMax] = useState<number>(185000);
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState<'yearly' | 'monthly' | 'hourly'>('yearly');

  // 3. Mission & Specs
  const [overview, setOverview] = useState(
    'Architect resilient, high-throughput backend services and scale distributed event streams for agent workflows.'
  );
  const [fullDescription, setFullDescription] = useState(
    '## About The Role\nWe are looking for an exceptional engineer to lead architectural design on our high-concurrency cloud platform. You will work closely with AI infrastructure teams to optimize low-latency APIs and event streaming pipelines.\n\n## Core Impact\n- Scale microservices handling high event volumes.\n- Drive robust automated testing and CI/CD pipelines.\n- Lead incident reviews and architectural design proposals.'
  );
  const [evaluationGuidance, setEvaluationGuidance] = useState('');

  // Dynamic lists
  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design, build, and maintain mission-critical backend APIs and asynchronous pipelines.',
    'Architect database schemas and perform query optimization on PostgreSQL and DynamoDB.',
    'Champion automated testing, code quality, and CI/CD best practices.',
  ]);
  const [newResp, setNewResp] = useState('');

  const [benefits, setBenefits] = useState<string[]>([
    'Competitive base salary + equity package',
    'Comprehensive health, dental, and vision insurance (100% premium covered)',
    'Flexible remote work environment & $1,500 home office stipend',
    'Unlimited PTO and paid parental leave',
  ]);
  const [newBenefit, setNewBenefit] = useState('');

  // 4. Skills Matrix
  const [primarySkills, setPrimarySkills] = useState<string[]>(['AWS', 'Python', 'FastAPI', 'Docker']);
  const [skillInput, setSkillInput] = useState('');

  const [requiredSkills, setRequiredSkills] = useState<string[]>(['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git']);
  const [reqSkillInput, setReqSkillInput] = useState('');

  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Redis', 'Kafka', 'Kubernetes', 'OpenTelemetry']);
  const [prefSkillInput, setPrefSkillInput] = useState('');

  // 5. Verification & Sandbox Requirements
  const [requiresRepo, setRequiresRepo] = useState(true);
  const [minProjects, setMinProjects] = useState<number>(1);
  const [requiredProfiles, setRequiredProfiles] = useState<string[]>(['github']);
  const [optionalProfiles, setOptionalProfiles] = useState<string[]>([
    'linkedin',
    'leetcode',
    'portfolio',
  ]);

  // Screening Questions
  const [customQuestions, setCustomQuestions] = useState<{ id: string; question: string; required: boolean }[]>([
    {
      id: 'q1_concurrency',
      question: 'How do you handle race conditions and locking strategies in distributed databases?',
      required: true,
    },
  ]);
  const [questionText, setQuestionText] = useState('');
  const [questionRequired, setQuestionRequired] = useState(true);

  // 6. MCP Protocol Exposure
  const [mcpExposed, setMcpExposed] = useState(true);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handlers for dynamic lists
  const addResponsibility = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };
  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };
  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const addPrimarySkill = () => {
    if (skillInput.trim() && !primarySkills.includes(skillInput.trim())) {
      setPrimarySkills([...primarySkills, skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removePrimarySkill = (sk: string) => {
    setPrimarySkills(primarySkills.filter((s) => s !== sk));
  };

  const addRequiredSkill = () => {
    if (reqSkillInput.trim() && !requiredSkills.includes(reqSkillInput.trim())) {
      setRequiredSkills([...requiredSkills, reqSkillInput.trim()]);
      setReqSkillInput('');
    }
  };
  const removeRequiredSkill = (sk: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== sk));
  };

  const addPreferredSkill = () => {
    if (prefSkillInput.trim() && !preferredSkills.includes(prefSkillInput.trim())) {
      setPreferredSkills([...preferredSkills, prefSkillInput.trim()]);
      setPrefSkillInput('');
    }
  };
  const removePreferredSkill = (sk: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== sk));
  };

  const addCustomQuestion = () => {
    if (questionText.trim()) {
      setCustomQuestions([
        ...customQuestions,
        {
          id: `q_${Date.now().toString(36)}`,
          question: questionText.trim(),
          required: questionRequired,
        },
      ]);
      setQuestionText('');
      setQuestionRequired(true);
    }
  };
  const removeCustomQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const toggleProfileRequirement = (type: 'required' | 'optional', profile: string) => {
    if (type === 'required') {
      if (requiredProfiles.includes(profile)) {
        setRequiredProfiles(requiredProfiles.filter((p) => p !== profile));
      } else {
        setRequiredProfiles([...requiredProfiles, profile]);
        setOptionalProfiles(optionalProfiles.filter((p) => p !== profile));
      }
    } else {
      if (optionalProfiles.includes(profile)) {
        setOptionalProfiles(optionalProfiles.filter((p) => p !== profile));
      } else {
        setOptionalProfiles([...optionalProfiles, profile]);
        setRequiredProfiles(requiredProfiles.filter((p) => p !== profile));
      }
    }
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Role title is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const generatedId = `job-${slug.slice(0, 20)}-${Date.now().toString(36).slice(-4)}`;

    const jobPayload: Partial<JobRoleDetail> = {
      job_id: generatedId,
      id: generatedId,
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      workplace_type: workplaceType,
      employment_type: employmentType,
      experience_level: experienceLevel,
      min_years_experience: Number(minYearsExperience),
      compensation: {
        min: Number(salaryMin),
        max: Number(salaryMax),
        currency,
        period,
      },
      primary_skills: primarySkills,
      status: 'active',
      mcp_exposed: mcpExposed,
      mcp_endpoint: `mcp.stripe.com/hiring/${generatedId}`,
      overview: overview.trim(),
      full_description_markdown: fullDescription.trim(),
      evaluation_guidance: evaluationGuidance.trim(),
      responsibilities,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      benefits,
      submission_requirements: {
        mandatory_fields: ['fullName', 'email', 'skills', 'experience', 'projects', 'repositoryUrl'],
        optional_fields: ['education', 'profiles.linkedin', 'profiles.leetcode', 'coverNote'],
        min_projects: Number(minProjects),
        requires_code_repository: requiresRepo,
        required_profiles: requiredProfiles,
        optional_profiles: optionalProfiles,
        custom_questions: customQuestions,
      },
      applications_count: 0,
      in_verification_count: 0,
      interview_ready_count: 0,
    };

    try {
      await createJob(jobPayload);
      setSuccessMsg('Requisition successfully published to DynamoDB and exposed to Hiring MCP Network!');
      setTimeout(() => {
        router.push('/company/roles');
      }, 1200);
    } catch (err: any) {
      console.error('[CreateRole] submission error:', err);
      setErrorMsg(err.message || 'Failed to publish requisition. Please check backend connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <Breadcrumbs
          items={[
            { label: 'ROLES', href: '/company/roles' },
            { label: 'CREATE HIRING ENDPOINT' },
          ]}
        />

        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 font-mono">
          <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-widest mb-2 font-bold">
            <Cpu className="w-4 h-4 text-primary" />
            <span>// REQUISITION BUILDER & SANDBOX PROTOCOL SPECIFICATION</span>
          </div>
          <h1 className="font-bold text-4xl md:text-5xl tracking-tighter uppercase font-sans">
            CREATE HIRING ENDPOINT
          </h1>
          <p className="text-white/60 text-sm mt-2 max-w-3xl">
            Publish a role requisition to DynamoDB and expose it to candidate AI agents (Claude, ChatGPT, Codex)
            via Model Context Protocol. Define strict automated verification requirements for Docker sandbox execution.
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/40 text-rose-300 font-mono text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* ========================================================================= */}
          {/* SECTION 1: CORE REQUISITION IDENTITY */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              <span>01. Core Requisition Identity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="md:col-span-2">
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Role Title <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Backend Systems Engineer (Distributed Streaming)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-primary text-sm font-sans"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Department</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platform Engineering / Core Infrastructure"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remote (US/Worldwide) or San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Workplace Mode</label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value as any)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="remote">Remote (Worldwide / Geo-restricted)</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite / Office</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as any)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="full-time">Full Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Seniority / Experience Level</label>
                <input
                  type="text"
                  placeholder="e.g. Senior (4–7 yrs)"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Minimum Required Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={minYearsExperience}
                  onChange={(e) => setMinYearsExperience(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Repository Inspection Guidance (Optional)</span>
            </div>
            <label className="block text-white/60 mb-2 font-mono text-xs uppercase tracking-wider">
              Tell the code-inspection agent what the recruiter wants examined
            </label>
            <textarea
              rows={5}
              value={evaluationGuidance}
              onChange={(e) => setEvaluationGuidance(e.target.value)}
              placeholder="Example: Focus on API design, data validation, test coverage, and deployment configuration. Do not evaluate frontend styling."
              className="w-full bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-primary font-mono text-xs"
            />
            <p className="mt-2 text-[11px] text-white/40 font-mono">
              This guides repository inspection only. It does not create scores or hiring recommendations.
            </p>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: COMPENSATION & BUDGET */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" />
              <span>02. Compensation & Budget Range</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Min Salary</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Max Salary</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Number(e.target.value))}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">Payment Cadence</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as any)}
                  className="w-full bg-black border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="yearly">Per Year (Annual)</option>
                  <option value="monthly">Per Month</option>
                  <option value="hourly">Per Hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: MISSION OVERVIEW & SPECIFICATION */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>03. Role Mission & Detailed Specification</span>
            </div>

            <div className="space-y-6 font-mono text-xs">
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Executive Mission Overview (Supplied to Candidate AI Agents)
                </label>
                <textarea
                  rows={2}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-white focus:outline-none focus:border-primary font-sans text-sm"
                />
              </div>

              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Full Description & Team Context (Markdown)
                </label>
                <textarea
                  rows={6}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full bg-black border border-white/20 p-3 text-white focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              {/* Responsibilities Builder */}
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Key Duties & Responsibilities
                </label>
                <div className="space-y-2 mb-3">
                  {responsibilities.map((resp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-black border border-white/10">
                      <span className="text-white/80 font-sans text-xs">• {resp}</span>
                      <button
                        type="button"
                        onClick={() => removeResponsibility(idx)}
                        className="text-white/40 hover:text-rose-400 transition ml-4"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a responsibility..."
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addResponsibility();
                      }
                    }}
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addResponsibility}
                    className="px-4 py-2 border border-white/30 hover:border-primary hover:text-primary transition font-bold"
                  >
                    + ADD
                  </button>
                </div>
              </div>

              {/* Benefits Builder */}
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Benefits & Perks
                </label>
                <div className="space-y-2 mb-3">
                  {benefits.map((ben, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-black border border-white/10">
                      <span className="text-white/80 font-sans text-xs">• {ben}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-white/40 hover:text-rose-400 transition ml-4"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a perk or benefit..."
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-4 py-2 border border-white/30 hover:border-primary hover:text-primary transition font-bold"
                  >
                    + ADD
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: TECHNICAL SKILLS MATRIX */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>04. Technical Competency & Skills Matrix</span>
            </div>

            <div className="space-y-6 font-mono text-xs">
              {/* Primary skills */}
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Primary Top Skills (Visible on Role Cards & Discovery)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {primarySkills.map((sk) => (
                    <span key={sk} className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary text-primary text-xs">
                      {sk}
                      <button type="button" onClick={() => removePrimarySkill(sk)} className="hover:text-white">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. AWS, Python, React)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPrimarySkill();
                      }
                    }}
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addPrimarySkill}
                    className="px-4 py-2 border border-white/30 hover:border-primary hover:text-primary transition font-bold"
                  >
                    + ADD
                  </button>
                </div>
              </div>

              {/* Required vs Preferred */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-white/60 mb-2 uppercase tracking-wider">Mandatory Technical Requirements</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {requiredSkills.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 bg-white/10 border border-white/20 text-white/90 text-[11px] inline-flex items-center gap-1">
                        {sk}
                        <button type="button" onClick={() => removeRequiredSkill(sk)}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add required skill..."
                      value={reqSkillInput}
                      onChange={(e) => setReqSkillInput(e.target.value)}
                      className="flex-1 bg-black border border-white/20 px-3 py-1.5 text-white focus:outline-none focus:border-primary"
                    />
                    <button type="button" onClick={addRequiredSkill} className="px-3 py-1.5 border border-white/30 hover:text-primary">+</button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 mb-2 uppercase tracking-wider">Bonus / Preferred Skills</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {preferredSkills.map((sk) => (
                      <span key={sk} className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/70 text-[11px] inline-flex items-center gap-1">
                        {sk}
                        <button type="button" onClick={() => removePreferredSkill(sk)}>×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add preferred skill..."
                      value={prefSkillInput}
                      onChange={(e) => setPrefSkillInput(e.target.value)}
                      className="flex-1 bg-black border border-white/20 px-3 py-1.5 text-white focus:outline-none focus:border-primary"
                    />
                    <button type="button" onClick={addPreferredSkill} className="px-3 py-1.5 border border-white/30 hover:text-primary">+</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 5: AI AGENT & SANDBOX VERIFICATION CONTRACT */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>05. AI Agent & Docker Sandbox Verification Rules</span>
            </div>

            <div className="space-y-6 font-mono text-xs">
              {/* Mandatory Code Repo Toggle */}
              <div className="p-4 bg-black border border-primary/40 flex items-start justify-between gap-4">
                <div>
                  <div className="font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Enforce Mandatory Code Repository for Sandbox Testing
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    When enabled, applicant agents cannot submit without a valid git repository.
                    AWS Lambda automatically clones this repository into an isolated Docker container,
                    executing unit tests, dependency audits, and git commit forensics.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={requiresRepo}
                    onChange={(e) => setRequiresRepo(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Profiles Requirements */}
              <div>
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Candidate Profile Verification Signals
                </label>
                <p className="text-white/40 text-[11px] mb-4">
                  Select which profile links are required vs optional to elevate candidate readiness tiers.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {['github', 'linkedin', 'leetcode', 'codeforces', 'portfolio'].map((prof) => {
                    const isReq = requiredProfiles.includes(prof);
                    const isOpt = optionalProfiles.includes(prof);

                    return (
                      <div key={prof} className="border border-white/20 p-3 bg-black">
                        <span className="block text-white font-bold uppercase text-xs mb-2">
                          {prof}
                        </span>
                        <div className="flex flex-col gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => toggleProfileRequirement('required', prof)}
                            className={`px-2 py-1 text-left border ${
                              isReq
                                ? 'bg-primary text-black border-primary font-bold'
                                : 'border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {isReq ? '✓ MANDATORY' : 'Set Mandatory'}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleProfileRequirement('optional', prof)}
                            className={`px-2 py-1 text-left border ${
                              isOpt
                                ? 'bg-white/20 text-white border-white/40 font-bold'
                                : 'border-white/10 text-white/50 hover:text-white'
                            }`}
                          >
                            {isOpt ? '✓ OPTIONAL' : 'Set Optional'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Screening Questions Builder */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-white/60 mb-2 uppercase tracking-wider">
                  Role Screening Questions (Enforced by Candidate Agent)
                </label>

                <div className="space-y-2 mb-4">
                  {customQuestions.map((q) => (
                    <div key={q.id} className="p-3 bg-black border border-white/10 flex items-center justify-between">
                      <div>
                        <span className="text-white text-xs font-sans block">{q.question}</span>
                        <span className="text-[10px] text-primary font-mono font-bold">
                          {q.required ? '[REQUIRED]' : '[OPTIONAL]'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomQuestion(q.id)}
                        className="text-white/40 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Enter screening question for applicant agents..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="flex-1 bg-black border border-white/20 px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
                  />
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-white/70 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={questionRequired}
                        onChange={(e) => setQuestionRequired(e.target.checked)}
                      />
                      <span>Required</span>
                    </label>
                    <button
                      type="button"
                      onClick={addCustomQuestion}
                      className="px-4 py-2 border border-white/30 hover:border-primary hover:text-primary transition font-bold"
                    >
                      + ADD QUESTION
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 6: MCP PROTOCOL EXPOSURE & CONTROLS */}
          {/* ========================================================================= */}
          <div className="border border-white/15 bg-white/[0.02] p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 font-mono text-xs text-primary font-bold uppercase tracking-wider">
              <Server className="w-4 h-4" />
              <span>06. Model Context Protocol Exposure</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="p-4 bg-black border border-white/15">
                <span className="text-white/50 block text-[10px] uppercase mb-1">MCP Endpoint URL Preview</span>
                <span className="font-mono text-primary font-bold text-sm break-all">
                  mcp.stripe.com/hiring/{title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) : 'requisition-id'}
                </span>
                <p className="text-white/40 text-[11px] mt-2 leading-normal">
                  External agents query this unique identifier via <code className="text-white">list_open_jobs</code> and <code className="text-white">get_job_requirements</code>.
                </p>
              </div>

              <div className="p-4 bg-black border border-white/15 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white uppercase block mb-1">Live MCP Exposure</span>
                  <span className="text-white/50 text-[11px]">
                    {mcpExposed ? 'Active: Immediately discoverable by candidate AI agents' : 'Draft: Hidden from MCP discovery'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mcpExposed}
                    onChange={(e) => setMcpExposed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
            <Link
              href="/company/roles"
              className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white transition text-xs uppercase tracking-wider"
            >
              ← Cancel & Discard
            </Link>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>PUBLISHING TO DYNAMODB...</span>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>PUBLISH REQUISITION & ACTIVATE MCP</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
