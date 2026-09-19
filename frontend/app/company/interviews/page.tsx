'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { CompanyNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { CandidateReport } from '@/data/mockData';
import { fetchApplications, ApiError } from '@/data/apiClient';
import { mapApplicationToCandidateReport } from '@/data/schemaAdapter';

export default function InterviewsPage() {
  const [candidates, setCandidates] = useState<CandidateReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const items = await fetchApplications();
      setCandidates(items.map(mapApplicationToCandidateReport));
    } catch (e: any) {
      setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to load interviews list'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Interview Context Packets
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              INTERVIEW BRIEFS
            </h1>
          </div>

          <div className="text-xs text-white/50">
            READY FOR INTERVIEW: <span className="text-primary font-bold">{candidates.length} CANDIDATES</span>
          </div>
        </div>

        <ApiErrorBanner
          error={apiError}
          onRetry={loadApplications}
          title="Interview Briefs Synchronization Failed"
          className="mb-8"
        />

        {isLoading ? (
          <div className="p-16 text-center font-mono flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <span className="text-white/50 text-xs">Loading Candidate Interview Briefs...</span>
          </div>
        ) : candidates.length === 0 ? (
          <div className="border border-dashed border-white/20 p-12 text-center font-mono">
            <div className="text-primary text-xs font-bold uppercase mb-2">
              {apiError ? '// CLOUD CONNECTION ERROR' : '// INTERVIEWS EMPTY'}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {apiError ? 'UNABLE TO LOAD INTERVIEW BRIEFS' : 'NO INTERVIEWS READY'}
            </h3>
            <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
              {apiError
                ? 'Unable to connect to the backend applications service. Please check API Gateway connectivity.'
                : 'When candidate applications are submitted and verified against role requisitions, structured interview briefing packets with targeted questions will appear here.'}
            </p>
            <Link
              href="/company/roles"
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-flex items-center gap-2"
            >
              Manage Roles
            </Link>
          </div>
        ) : (
          <div className="space-y-6 font-mono">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                className="border-2 border-white/20 bg-black p-8 hover:border-primary transition-colors relative shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 text-xs mb-2">
                      <span className="px-2 py-0.5 bg-primary text-black font-bold uppercase">{cand.role}</span>
                      <span className="text-white/40">APPLICATION #{cand.id}</span>
                    </div>
                    <h3 className="font-bold text-3xl font-sans text-white">{cand.name}</h3>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      BRIEF READY
                    </span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="text-xs text-white/70 font-sans">
                    Confirmed competencies:{' '}
                    {(cand.skills || [])
                      .filter((s) => s.status === 'VERIFIED')
                      .map((s) => s.name)
                      .join(', ') || 'General Engineering'}
                    . Includes targeted probe questions.
                  </div>

                  <div className="flex gap-4 shrink-0">
                    <Link
                      href={`/company/candidates/${cand.id}/brief`}
                      className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                    >
                      Open Briefing Dossier
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
