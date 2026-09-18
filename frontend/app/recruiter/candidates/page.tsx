// app/recruiter/candidates/page.tsx
'use client';

import RecruiterNav from '@/components/RecruiterNav';
import { mockCandidates } from '@/data/mockData';
import Link from 'next/link';
import { Network, FileCheck2, ArrowRight } from 'lucide-react';

export default function CandidatesListPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <RecruiterNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-2">
              // Candidate Roster
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase">
              CANDIDATES
            </h1>
          </div>
          <div className="font-mono text-xs text-white/50">
            SHOWING <span className="text-primary font-bold">{mockCandidates.length}</span> VERIFIED PROFILES
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-6 font-mono">
          {mockCandidates.map((cand, idx) => (
            <div
              key={cand.id}
              className="border-2 border-white/20 bg-black p-8 hover:border-primary transition-colors relative shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 text-xs mb-2">
                    <span className="font-bold text-primary">0{idx + 1}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/70">{cand.title}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-white/50">{cand.location}</span>
                  </div>
                  <h3 className="font-bold text-3xl font-sans text-white">{cand.name}</h3>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">PROFILE FIT</span>
                    <span className="font-bold text-3xl text-primary">{cand.profileFitScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">EVIDENCE COVERAGE</span>
                    <span className="font-bold text-3xl text-emerald-400">{cand.evidenceCoverage}%</span>
                  </div>
                </div>
              </div>

              {/* Verified Skills Summary */}
              <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2 text-xs">
                  {cand.skills.map((sk, sIdx) => (
                    <span
                      key={sIdx}
                      className={`px-3 py-1 border ${
                        sk.verified
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {sk.skill} {sk.verified ? '✓' : '⚠'}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 shrink-0">
                  <Link
                    href={`/recruiter/candidates/${cand.id}`}
                    className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                  >
                    Evidence Workspace
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/recruiter/candidates/${cand.id}/brief`}
                    className="px-4 py-3 border border-white/20 text-white font-bold text-xs uppercase hover:border-white transition flex items-center gap-2"
                  >
                    <FileCheck2 className="w-4 h-4 text-primary" />
                    Briefing
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
