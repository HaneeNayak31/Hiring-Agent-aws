// app/company/candidates/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockCandidateReports, CandidateReport } from '@/data/mockData';
import Link from 'next/link';
import { Search, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import CandidateDrawer from '@/components/CandidateDrawer';

export default function TalentRegistryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawerCandidate, setSelectedDrawerCandidate] = useState<CandidateReport | null>(null);

  const candidates = mockCandidateReports.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.skills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'TALENT' }]} />

        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Global Candidate Repository
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              TALENT
            </h1>
            <p className="text-white/60 text-sm mt-1 font-mono">
              Verified candidate reports across all company hiring requisitions.
            </p>
          </div>

          <div className="text-xs text-white/50">
            TOTAL CANDIDATE RECORDS: <span className="text-primary font-bold">{candidates.length}</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-8 font-mono text-xs">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search by candidate name, role, or verified skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/20 pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Data Table View (Section 14) */}
        <div className="border border-white/15 bg-black font-mono text-xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/15 bg-white/[0.03] text-white/40 font-bold uppercase text-[10px]">
            <div className="col-span-4">CANDIDATE</div>
            <div className="col-span-3">ROLE APPLIED FOR</div>
            <div className="col-span-2">VERIFICATION</div>
            <div className="col-span-1">EVIDENCE</div>
            <div className="col-span-2 text-right">ACTION</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/10">
            {candidates.map((cand) => (
              <div
                key={cand.id}
                onClick={() => setSelectedDrawerCandidate(cand)}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group"
              >
                <div className="col-span-4">
                  <div className="font-bold text-sm text-white group-hover:text-primary transition-colors font-sans">
                    {cand.name}
                  </div>
                  <div className="text-[10px] text-white/40">ID: {cand.id} · Applied {cand.appliedDate}</div>
                </div>

                <div className="col-span-3 font-sans">
                  <div className="font-bold text-white text-xs">{cand.role}</div>
                </div>

                <div className="col-span-2 font-mono">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                      cand.status === 'VERIFIED'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                        : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {cand.status}
                  </span>
                </div>

                <div className="col-span-1 font-mono">
                  <span className="font-bold text-emerald-400">{cand.evidenceCoverage}%</span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="px-3 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-black font-mono text-[11px] font-bold uppercase transition inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,106,0,0.4)]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    AGENT CHAT →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Quick-View Candidate Drawer */}
      <CandidateDrawer
        candidate={selectedDrawerCandidate}
        isOpen={!!selectedDrawerCandidate}
        onClose={() => setSelectedDrawerCandidate(null)}
      />
    </div>
  );
}
