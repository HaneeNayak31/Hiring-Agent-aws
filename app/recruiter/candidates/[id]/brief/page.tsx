// app/recruiter/candidates/[id]/brief/page.tsx
'use client';

import RecruiterNav from '@/components/RecruiterNav';
import { mockCandidates, mockInterviewBrief } from '@/data/mockData';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Printer, FileText, CheckCircle2, HelpCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export default function InterviewBriefingPage() {
  const params = useParams();
  const candId = params.id as string;
  const cand = mockCandidates.find((c) => c.id === candId) || mockCandidates[0];
  const brief = mockInterviewBrief;

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <RecruiterNav />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back and Print Bar */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            href={`/recruiter/candidates/${cand.id}`}
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO EVIDENCE WORKSPACE</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-white/20 text-white font-mono text-xs uppercase hover:border-white transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-primary" />
            Print Briefing
          </button>
        </div>

        {/* INTERVIEW BRIEF DOCUMENT */}
        <div className="border-2 border-white bg-black p-10 font-mono shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] print:border-black print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-white pb-6 mb-8 print:border-black">
            <div className="flex items-center justify-between text-xs text-primary mb-2 font-bold tracking-widest">
              <span>// CONFIDENTIAL INTERVIEW BRIEF</span>
              <span>AGENTIC HIRING ENGINE v1.4</span>
            </div>
            <h1 className="font-bold text-4xl md:text-5xl uppercase font-sans tracking-tight text-white print:text-black">
              INTERVIEW BRIEF
            </h1>
            <div className="text-xl font-bold text-white/80 font-mono mt-2 print:text-black">
              {cand.name} — <span className="text-primary">{brief.role}</span>
            </div>
          </div>

          {/* Section 1: WHAT WE KNOW */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-emerald-400 mb-4 pb-2 border-b border-white/20 print:border-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>WHAT WE KNOW (STRONG EVIDENCE CONFIRMED)</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {brief.strongEvidence.map((sk, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold uppercase print:border-black print:text-black"
                >
                  {sk} ✓
                </span>
              ))}
            </div>
          </div>

          {/* Section 2: WHAT TO EXPLORE (Numbered Probe Items) */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-primary mb-4 pb-2 border-b border-white/20 print:border-black">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>WHAT TO EXPLORE (RECOMMENDED INTERVIEW PROBES)</span>
            </div>

            <div className="space-y-4">
              {brief.exploreAreas.map((item) => (
                <div key={item.id} className="border border-white/15 bg-white/[0.02] p-5 print:border-black">
                  <div className="flex items-center gap-3 font-bold text-sm text-white mb-2 font-sans print:text-black">
                    <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs">{item.id}</span>
                    <span>{item.topic}</span>
                  </div>
                  <p className="text-xs text-white/70 font-sans pl-8 leading-relaxed print:text-black">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: POTENTIAL GAPS */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-amber-500 mb-4 pb-2 border-b border-white/20 print:border-black">
              <AlertTriangle className="w-4 h-4" />
              <span>POTENTIAL GAPS (LIMITED PUBLIC SIGNAL)</span>
            </div>

            <div className="space-y-2 text-xs font-sans text-white/80 print:text-black">
              {brief.potentialGaps.map((gap, idx) => (
                <div key={idx} className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-200 print:text-black print:border-black">
                  • {gap}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: EVIDENCE SOURCES SUMMARY */}
          <div className="pt-6 border-t border-white/20 text-xs text-white/60 flex items-center justify-between font-mono print:border-black print:text-black">
            <div>
              PROVING SOURCES: <span className="text-white font-bold">{brief.sourcesSummary.github} GitHub</span> · <span className="text-white font-bold">{brief.sourcesSummary.portfolio} Portfolio</span> · <span className="text-white font-bold">{brief.sourcesSummary.resume} Resume</span>
            </div>
            <div className="text-primary font-bold">VERIFIED VIA MCP PROTOCOL</div>
          </div>
        </div>
      </main>
    </div>
  );
}
