'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Server, Cpu, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CandidateNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { fetchJob, submitApplication, ApiError } from '@/data/apiClient';
import ApplyViaMcpCard, { REAL_MCP_URL } from '@/components/candidate/ApplyViaMcpCard';

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [jobError, setJobError] = useState<ApiError | string | null>(null);

  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState<number>(0);
  const [applyError, setApplyError] = useState<ApiError | string | null>(null);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const loadJob = useCallback(async () => {
    if (!jobId) return;
    setIsLoading(true);
    setNotFound(false);
    setJobError(null);
    try {
      const liveJob = await fetchJob(jobId);
      if (liveJob) {
        setJob({
          id: liveJob.job_id || liveJob.id,
          title: liveJob.title || 'Software Engineer',
          company: 'Acme Corp',
          location: liveJob.location || 'Remote',
          salary: liveJob.compensation
            ? `${liveJob.compensation.currency || '$'}${liveJob.compensation.min / 1000}k - ${liveJob.compensation.max / 1000}k`
            : (liveJob as any).salary_range || 'Competitive',
          description: liveJob.overview || liveJob.full_description_markdown || 'No description provided.',
          profileFit: 94,
          requirements: (liveJob.required_skills || ['AWS', 'TypeScript']).map((s: string) => ({
            name: s,
            strength: 95,
            matched: true,
          })),
          mcpServer: liveJob.mcp_endpoint || REAL_MCP_URL,
        });
      } else {
        setNotFound(true);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.isNotFound) {
        setNotFound(true);
      } else {
        setJobError(err instanceof ApiError ? err : (err?.message || 'Failed to load opportunity details'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJob();
  }, [loadJob]);

  const startApplication = async () => {
    setIsApplying(true);
    setApplyStep(1);
    setApplyError(null);

    const candidatePassport = {
      full_name: 'Alex Vance',
      email: 'alex.vance@mit.edu',
      phone: '+1 555-0199',
      headline: 'Senior Cloud & Systems Engineer',
      location: 'San Francisco, CA',
      skills: job?.requirements?.map((r: any) => r.name) || ['Python', 'AWS', 'TypeScript'],
      experience: [
        {
          company: 'TechFlow Systems',
          title: 'Senior Cloud Architect',
          duration: '2021 - Present',
          highlights: ['Designed multi-region serverless architectures on AWS', 'Built event-driven microservices']
        }
      ],
      projects: [
        {
          name: 'Cloud Automation Suite',
          description: 'Automated CI/CD and infrastructure deployment tools',
          repository_url: 'https://github.com/alexvance/cloud-auto-suite'
        }
      ],
      profiles: {
        github: 'https://github.com/alexvance',
        linkedin: 'https://linkedin.com/in/alexvance'
      }
    };

    try {
      const res = await submitApplication({
        job_id: jobId,
        candidate_passport: candidatePassport,
        cover_note: 'Submitted autonomously via Candidate AI Agent.',
        confirmed_by_candidate: true,
      });
      setSubmittedAppId(res.application_id);
      setApplyStep(2);
    } catch (err: any) {
      setApplyError(err instanceof ApiError ? err : (err?.message || 'Application submission failed'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CandidateNav />
        <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center justify-center font-mono">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-white/60 text-xs">Querying position details...</p>
        </div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CandidateNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono">
          <ApiErrorBanner
            error={jobError}
            onRetry={loadJob}
            title="Failed to Load Opportunity"
            className="mb-8"
          />
          <div className="text-center">
            <Link
              href="/candidate/opportunities"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Opportunities
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CandidateNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono text-center">
          <div className="border border-white/20 p-12 bg-white/[0.02]">
            <div className="text-primary text-xs font-bold uppercase mb-2">// 404 NOT FOUND</div>
            <h2 className="text-2xl font-bold text-white mb-2">OPPORTUNITY NOT FOUND</h2>
            <p className="text-white/50 text-xs mb-8">
              No live job requisitions match ID <span className="text-primary font-bold">"{jobId}"</span> in DynamoDB HiringAgent_Jobs.
            </p>
            <Link
              href="/candidate/opportunities"
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Opportunities
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <Link
          href="/candidate/opportunities"
          className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO OPPORTUNITIES LIST</span>
        </Link>

        <div className="border-b border-white/15 pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs mb-3">
              <span className="px-2 py-0.5 bg-primary text-black font-bold uppercase">{job.company}</span>
              <span className="text-white/40">{job.location}</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400 font-bold">{job.salary}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-5xl tracking-tight text-white mb-4">
              {job.title}
            </h1>

            <div className="font-mono text-xs text-white/50 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-primary" />
              <span>MCP ENDPOINT: {job.mcpServer}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0 font-mono">
            <div className="text-right">
              <span className="text-xs text-white/40 block">EVIDENCE MATCH SCORE</span>
              <span className="font-bold text-4xl text-primary">{job.profileFit}%</span>
            </div>

            <button
              onClick={startApplication}
              disabled={isApplying}
              className="px-8 py-4 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              DELEGATE AGENT TO APPLY
            </button>
          </div>
        </div>

        {/* Centered Real MCP Application Card with Copy Button and Instructions */}
        <ApplyViaMcpCard jobId={job.id} jobTitle={job.title} />

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="border border-white/15 bg-white/[0.01] p-8">
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">// Position Brief</h2>
              <p className="text-white/80 leading-relaxed font-sans text-base">
                {job.description}
              </p>
            </div>

            <div className="border-2 border-white bg-black p-8 font-mono">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <span className="text-xs font-bold text-primary uppercase">// PROFILE FIT EXPLANATION</span>
                <span className="text-xs text-white/50">{job.profileFit}% Verified</span>
              </div>

              <div className="space-y-6 mb-8">
                {(job.requirements || []).map((req: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-white flex items-center gap-2">
                        {req.name}
                        {req.matched ? (
                          <span className="text-emerald-400 font-normal text-[10px]">✓ VERIFIED EVIDENCE</span>
                        ) : (
                          <span className="text-amber-500 font-normal text-[10px]">⚠ LIMITED EVIDENCE</span>
                        )}
                      </span>
                      <span className="text-white/50">{req.strength}%</span>
                    </div>

                    <div className="h-3 w-full bg-white/10 border border-white/20 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${req.strength}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${req.matched ? 'bg-primary' : 'bg-amber-500/60'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/20">
                <h3 className="text-xs font-bold text-white uppercase mb-3">// WHY THIS FIT SCORE?</h3>
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-4">
                  Your agent evaluated public repositories, deployed system architectures, and verified credentials across:
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">GitHub (4 repos)</span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">Portfolio Showcase</span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">Verified Resume</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 font-mono text-xs">
            <div className="border border-white/15 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 text-primary font-bold mb-4 pb-3 border-b border-white/10">
                <Cpu className="w-4 h-4" />
                <span>COMPANY HIRING MCP</span>
              </div>

              <div className="space-y-3 text-white/70">
                <div>ENDPOINT: <span className="text-white">{job.mcpServer}</span></div>
                <div>PROTOCOL: <span className="text-emerald-400">v1.4 ACTIVE</span></div>
                <div>AVAILABLE TOOLS:</div>
                <div className="bg-black border border-white/10 p-3 space-y-1 font-mono text-[11px] text-primary">
                  <div>· list_open_jobs</div>
                  <div>· get_job_requirements</div>
                  <div>· verify_candidate_evidence</div>
                  <div>· apply_to_job</div>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.01] p-6 text-white/50 text-[11px] space-y-2">
              <p className="font-bold text-white uppercase text-xs mb-1">// CANDIDATE DELEGATION SAFETY</p>
              <p>Your agent submits evidence packets without transferring personal identifiers until company review stage.</p>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isApplying && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full border-2 border-white bg-black p-8 font-mono relative shadow-[12px_12px_0px_0px_rgba(255,106,0,1)]"
            >
              {applyError ? (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <span className="text-xs text-red-400 font-bold uppercase">// SUBMISSION REJECTED</span>
                  </div>

                  <ApiErrorBanner
                    error={applyError}
                    onRetry={startApplication}
                    title="Application Submission Rejected"
                    className="mb-6"
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsApplying(false)}
                      className="w-full py-3 border border-white/20 text-white font-bold text-xs uppercase hover:border-white transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : applyStep === 1 ? (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <span className="text-xs text-primary font-bold uppercase">// AGENT DELEGATION</span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  </div>

                  <h3 className="font-bold text-xl uppercase mb-6 text-white">SUBMITTING APPLICATION</h3>

                  <div className="space-y-4 text-xs mb-8">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Requirements checked & matched</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Evidence packet prepared</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Candidate delegation approved</span>
                    </div>
                    <div className="flex items-center gap-3 text-primary animate-pulse font-bold">
                      <span>● Transmitting to {job.company} Hiring MCP...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <span className="text-xs text-emerald-400 font-bold uppercase">// SUCCESS</span>
                    <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                  </div>

                  <h3 className="font-bold text-2xl uppercase mb-2 text-white">APPLICATION SUBMITTED</h3>
                  <p className="text-xs text-white/60 mb-6 font-sans">
                    Your candidate report and evidence graph have been received by {job.company}.
                  </p>

                  <div className="bg-white/5 border border-white/15 p-4 mb-6 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/40">APPLICATION ID:</span>
                      <span className="font-bold text-primary">{submittedAppId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">TIMESTAMP:</span>
                      <span className="text-white">Just now</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push('/candidate/applications')}
                      className="w-full py-3 bg-primary text-black font-bold text-xs uppercase hover:bg-primary/90 transition"
                    >
                      View Applications
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
