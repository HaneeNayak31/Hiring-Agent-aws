// app/candidate/applications/page.tsx
'use client';

import CandidateNav from '@/components/CandidateNav';
import { mockApplications } from '@/data/mockData';
import Link from 'next/link';
import { CheckCircle2, Clock, ShieldCheck, ArrowUpRight } from 'lucide-react';

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-2">
              // Delegated Submissions
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase">
              APPLICATIONS
            </h1>
          </div>
          <div className="font-mono text-xs text-white/50">
            TOTAL SUBMITTED: <span className="text-primary font-bold">{mockApplications.length}</span>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6 font-mono">
          {mockApplications.map((app) => (
            <div
              key={app.id}
              className="border border-white/15 bg-black p-8 relative hover:border-primary/60 transition-colors shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="px-2 py-0.5 bg-primary text-black font-bold uppercase">{app.company}</span>
                    <span className="text-white/40">ID: {app.id}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/60">{app.submittedAt}</span>
                  </div>
                  <h3 className="font-bold text-2xl font-sans text-white">{app.jobTitle}</h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Agent Delegation Checklist */}
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
                  <span>Candidate Consent Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>MCP Endpoint Acknowledged</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
