// app/company/candidates/[id]/brief/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockCandidateReports } from '@/data/mockData';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle2, HelpCircle, AlertTriangle, FileText } from 'lucide-react';

export default function CandidateInterviewBriefPage() {
  const params = useParams();
  const candId = params.id as string;
  const cand = mockCandidateReports.find((c) => c.id === candId) || mockCandidateReports[0];

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <CompanyNav />
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back and Print Bar */}
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

        {/* SECTION 27: INTERVIEW BRIEF DOSSIER */}
        <div className="border-2 border-white bg-black p-10 font-mono shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] print:border-black print:shadow-none print:p-0">
          {/* Header */}
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

          {/* WHAT WE KNOW */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-emerald-400 mb-4 pb-2 border-b border-white/20 print:border-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>WHAT WE KNOW (STRONG VERIFIED EVIDENCE)</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {cand.skills.filter(s => s.status === 'VERIFIED').map((sk, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold uppercase print:border-black print:text-black"
                >
                  {sk.name} ✓
                </span>
              ))}
            </div>
          </div>

          {/* PROJECTS WORTH DISCUSSING */}
          <div className="mb-10">
            <div className="font-bold text-sm uppercase text-white mb-4 pb-2 border-b border-white/20 print:border-black print:text-black">
              // PROJECTS WORTH DISCUSSING
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              {cand.projects.map((proj, idx) => (
                <div key={idx} className="border border-white/15 bg-white/[0.02] p-4 print:border-black">
                  <div className="font-bold text-sm text-primary mb-1">{proj.name}</div>
                  <p className="text-white/70 font-sans leading-relaxed mb-2 print:text-black">{proj.description}</p>
                  <div className="text-[10px] text-white/40">{proj.tech.join(' · ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AREAS TO EXPLORE */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-primary mb-4 pb-2 border-b border-white/20 print:border-black">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span>AREAS TO EXPLORE (RECOMMENDED PROBES)</span>
            </div>
            <div className="space-y-2 text-xs font-sans text-white/80 print:text-black">
              {cand.interviewAreas.map((area, idx) => (
                <div key={idx} className="p-3 border border-white/10 bg-white/[0.02] print:border-black">
                  • {area}
                </div>
              ))}
            </div>
          </div>

          {/* POTENTIAL GAPS */}
          <div className="mb-10">
            <div className="flex items-center gap-2 font-bold text-sm uppercase text-amber-500 mb-4 pb-2 border-b border-white/20 print:border-black">
              <AlertTriangle className="w-4 h-4" />
              <span>POTENTIAL GAPS (LIMITED PUBLIC SIGNAL)</span>
            </div>
            <div className="space-y-2 text-xs font-sans text-white/80 print:text-black">
              {cand.potentialGaps.map((gap, idx) => (
                <div key={idx} className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-200 print:border-black print:text-black">
                  • {gap}
                </div>
              ))}
            </div>
          </div>

          {/* SUGGESTED QUESTIONS */}
          <div className="mb-10">
            <div className="font-bold text-sm uppercase text-white mb-4 pb-2 border-b border-white/20 print:border-black print:text-black">
              // TARGETED INTERVIEW QUESTIONS
            </div>
            <div className="space-y-4">
              {cand.suggestedQuestions.map((q) => (
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

          {/* FOOTER */}
          <div className="pt-6 border-t border-white/20 text-xs text-white/50 flex justify-between font-mono print:border-black print:text-black">
            <span>EVIDENCE TRACEABILITY: 87% VERIFIED</span>
            <span className="text-primary font-bold">VERIFIED VIA MCP PROTOCOL</span>
          </div>
        </div>
      </main>
    </div>
  );
}
