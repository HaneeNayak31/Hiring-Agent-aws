'use client';

import { CompanyNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { fetchApplication, ApiError } from '@/data/apiClient';
import { adaptApplicationToCandidate } from '@/data/schemaAdapter';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Printer, CheckCircle2, HelpCircle, AlertTriangle, Loader2 } from 'lucide-react';

export default function CandidateInterviewBriefPage() {
  const params = useParams();
  const candId = params?.id as string;
  const [cand, setCand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const load = useCallback(async () => {
    if (!candId) return;
    setIsLoading(true);
    setNotFound(false);
    setApiError(null);
    try {
      const app = await fetchApplication(candId);
      if (app) {
        setCand(adaptApplicationToCandidate(app));
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      if (e instanceof ApiError && e.isNotFound) {
        setNotFound(true);
      } else {
        setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to load interview brief'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [candId]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center justify-center font-mono">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-white/60 text-xs">Loading Candidate Brief...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono">
          <ApiErrorBanner
            error={apiError}
            onRetry={load}
            title="Failed to Load Candidate Interview Brief"
            className="mb-8"
          />
          <div className="text-center">
            <Link
              href="/company/interviews"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Interviews
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !cand) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono text-center">
          <div className="border border-white/20 p-12 bg-white/[0.02]">
            <h2 className="text-2xl font-bold text-white mb-2">INTERVIEW BRIEF NOT FOUND</h2>
            <p className="text-white/50 text-xs mb-8">
              No live application records match ID <span className="text-primary font-bold">"{candId}"</span> in DynamoDB.
            </p>
            <Link
              href="/company/interviews"
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Interviews
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <CompanyNav />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href={`/company/candidates/${cand.id}`}
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO CANDIDATE DOSSIER</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:border-white transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-primary" />
            Print Briefing Packet
          </button>
        </div>

        <div className="border-2 border-white bg-black p-10 font-mono shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] print:border-black print:shadow-none print:p-0">
          <div className="border-b-2 border-white pb-6 mb-8 print:border-black">
            <div className="flex items-center justify-between text-xs text-primary mb-2 font-bold tracking-widest">
              <span>// CONFIDENTIAL EXECUTIVE INTERVIEW BRIEF</span>
              <span>APPLICATION #{cand.id}</span>
            </div>
            <h1 className="font-bold text-4xl md:text-5xl uppercase font-sans tracking-tight text-white print:text-black">
              INTERVIEW BRIEF
            </h1>
            <div className="text-xl font-bold text-white/80 font-mono mt-2 print:text-black">
              {cand.name} — <span className="text-primary">{cand.role}</span>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-emerald-400 mb-4 pb-2 border-b border-white/20 print:border-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>WHAT WE KNOW (STRONG VERIFIED EVIDENCE)</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {(cand.skills || [])
                .filter((s: any) => s.status === 'VERIFIED')
                .map((sk: any, idx: any) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold uppercase print:border-black print:text-black"
                  >
                    {sk.name} ✓
                  </span>
                ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="font-bold text-sm uppercase text-white mb-4 pb-2 border-b border-white/20 print:border-black print:text-black">
              // PROJECTS WORTH DISCUSSING
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {(cand.projects || []).map((proj: any, idx: any) => (
                <div key={idx} className="border border-white/15 bg-white/[0.02] p-4 print:border-black">
                  <div className="font-bold text-sm text-primary mb-1">{proj.name}</div>
                  <p className="text-white/70 font-sans leading-relaxed mb-2 print:text-black">{proj.description}</p>
                  {proj.tech && proj.tech.length > 0 && (
                    <div className="text-[10px] text-white/40">{proj.tech.join(' · ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-amber-500 mb-4 pb-2 border-b border-white/20 print:border-black">
              <AlertTriangle className="w-4 h-4" />
              <span>POTENTIAL GAPS (LIMITED PUBLIC SIGNAL)</span>
            </div>
            <div className="space-y-2 text-xs font-sans text-white/80 print:text-black">
              {(cand.potentialGaps || []).map((gap: any, idx: any) => (
                <div key={idx} className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-200 print:border-black print:text-black">
                  • {gap}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-primary mb-4 pb-2 border-b border-white/20 print:border-black">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>AREAS TO EXPLORE (RECOMMENDED PROBES)</span>
            </div>
            <div className="space-y-2 text-xs font-sans text-white/80 print:text-black">
              {(cand.interviewAreas || []).map((area: any, idx: any) => (
                <div key={idx} className="p-3 border border-white/10 bg-white/[0.02] print:border-black">
                  • {area}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <div className="font-bold text-sm uppercase text-white mb-4 pb-2 border-b border-white/20 print:border-black print:text-black">
              // TARGETED INTERVIEW QUESTIONS
            </div>
            <div className="space-y-4">
              {(cand.suggestedQuestions || []).map((q: any) => (
                <div key={q.number} className="border border-white/15 bg-black p-5 print:border-black">
                  <div className="flex items-center gap-3 font-bold text-sm text-white mb-2 font-sans print:text-black">
                    <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs">{q.number}</span>
                    <span>&quot;{q.question}&quot;</span>
                  </div>
                  <div className="text-xs text-white/50 pl-8 font-mono">
                    Context: {q.context}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-xs text-white/50 flex justify-between font-mono print:border-black print:text-black">
            <span>EVIDENCE TRACEABILITY: {cand.evidenceCoverage || 0}% VERIFIED</span>
            <span className="text-primary font-bold">VERIFIED VIA LIVE BACKEND</span>
          </div>
        </div>
      </main>
    </div>
  );
}
