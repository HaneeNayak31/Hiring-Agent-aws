// app/company/interviews/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockCandidateReports } from '@/data/mockData';
import Link from 'next/link';
import { FileCheck2, ArrowRight, Printer, CheckCircle2 } from 'lucide-react';

export default function InterviewsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
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
            READY FOR INTERVIEW: <span className="text-primary font-bold">{mockCandidateReports.length} CANDIDATES</span>
          </div>
        </div>

        {/* Interviews List */}
        <div className="space-y-6 font-mono">
          {mockCandidateReports.map((cand) => (
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

              {/* Brief highlights */}
              <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-xs text-white/70 font-sans">
                  Confirmed competencies: {cand.skills.filter(s => s.status === 'VERIFIED').map(s => s.name).join(', ')}. Includes 3 target probe questions.
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
      </main>
    </div>
  );
}
