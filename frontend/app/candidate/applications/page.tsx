'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Clock, Loader2, ArrowRight, GitBranch, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { CandidateNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { fetchApplications, ApplicationRecord, ApiError } from '@/data/apiClient';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const liveApps = await fetchApplications();
      setApplications(liveApps || []);
    } catch (e: any) {
      setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to load submitted applications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Delegated Submissions & Verification Stream
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              APPLICATIONS
            </h1>
          </div>
          <div className="text-xs text-white/50">
            TOTAL SUBMITTED: <span className="text-primary font-bold">{applications.length}</span>
          </div>
        </div>

        <ApiErrorBanner
          error={apiError}
          onRetry={loadApplications}
          title="Applications Synchronization Failed"
          className="mb-8"
        />

        {loading ? (
          <div className="p-16 text-center font-mono flex flex-col items-center justify-center border border-white/10 bg-white/[0.01]">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <span className="text-white/50 text-xs">// QUERYING CANDIDATE APPLICATIONS FROM DYNAMODB...</span>
          </div>
        ) : applications.length === 0 ? (
          <div className="border border-dashed border-white/20 p-12 text-center font-mono bg-white/[0.01]">
            <div className="text-primary text-xs font-bold uppercase mb-2">// SUBMISSIONS EMPTY</div>
            <h3 className="text-lg font-bold text-white mb-2">NO CANDIDATE APPLICATIONS YET</h3>
            <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
              When you or your delegated AI agent submit your evidence packet to open job opportunities, the progress, sandbox evaluation, and live status will appear here.
            </p>
            <Link
              href="/candidate/opportunities"
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,106,0,1)]"
            >
              Browse Opportunities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6 font-mono">
            {applications.map((app) => {
              const passport = app.candidate_passport || {};
              const projects = passport.projects || [];
              const primaryProject = projects[0] || {};
              const isEvaluated = app.status === 'EVALUATED';
              const isEvaluating = app.status === 'EVALUATING' || app.status === 'SUBMITTED_PENDING_SANDBOX';

              return (
                <div
                  key={app.application_id}
                  className="border-2 border-white/20 bg-black p-8 relative hover:border-primary/60 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-3 text-xs mb-2">
                        <span className="px-2 py-0.5 bg-primary text-black font-bold uppercase">
                          {app.job_title || app.job_id}
                        </span>
                        <span className="text-white/40">ID: {app.application_id}</span>
                        <span className="text-white/40">·</span>
                        <span className="text-white/60">
                          {app.submitted_at
                            ? new Date(app.submitted_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-bold text-2xl font-sans text-white">
                        {passport.full_name || 'Candidate Application'}
                      </h3>
                      {passport.summary && (
                        <p className="text-xs text-white/50 font-sans mt-1">{passport.summary}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isEvaluated ? (
                        <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          INSPECTION COMPLETE (EVALUATED)
                        </span>
                      ) : (
                        <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                          SANDBOX VERIFYING (IN PROGRESS)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Requirements Matched</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Evidence Graph Streamed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Candidate Consent Confirmed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>DynamoDB Stream Triggered</span>
                    </div>
                  </div>

                  {primaryProject.repository_url && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-3.5 h-3.5 text-primary" />
                        <span>Repository under forensic audit:</span>
                        <a
                          href={primaryProject.repository_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 font-mono"
                        >
                          {primaryProject.repository_url}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <span className="text-[10px] text-white/40 uppercase">
                        AWS Lambda Evaluator Linked
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
