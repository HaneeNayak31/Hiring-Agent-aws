// app/candidate/profile/page.tsx
'use client';

import CandidateNav from '@/components/CandidateNav';
import { mockCandidates } from '@/data/mockData';
import { CheckCircle2, AlertTriangle, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';

export default function CandidateProfilePage() {
  const candidate = mockCandidates[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-2">
              // Candidate Identity & Proofs
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase">
              {candidate.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">{candidate.title} · {candidate.location}</p>
          </div>

          <div className="font-mono text-xs flex gap-6">
            <div className="border border-white/15 p-3 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">PROFILE FIT SCORE</span>
              <span className="font-bold text-2xl text-primary">{candidate.profileFitScore}%</span>
            </div>
            <div className="border border-white/15 p-3 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">EVIDENCE COVERAGE</span>
              <span className="font-bold text-2xl text-emerald-400">{candidate.evidenceCoverage}%</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="border border-white/15 bg-white/[0.01] p-8 mb-10">
          <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-3">// Candidate Overview</h2>
          <p className="text-white/80 leading-relaxed font-sans text-base max-w-3xl">
            {candidate.bio}
          </p>
        </div>

        {/* Verified Skills Evidence List */}
        <div className="border-2 border-white bg-black p-8 font-mono mb-10 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <span className="font-bold text-base text-white uppercase tracking-wider">// VERIFIED SKILL EVIDENCE</span>
            <span className="text-xs text-white/50">{candidate.skills.length} CONFIRMED SIGNALS</span>
          </div>

          <div className="space-y-8">
            {candidate.skills.map((sk, idx) => (
              <div key={idx} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-white font-sans">{sk.skill}</span>
                    {sk.verified ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED ({sk.confidence}%)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-500 text-xs font-bold uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> LIMITED EVIDENCE ({sk.confidence}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Sources */}
                <div className="space-y-2 pl-4 border-l-2 border-primary/40">
                  <span className="text-[10px] text-white/40 block tracking-widest uppercase mb-1">PROVING SOURCES:</span>
                  {sk.sources.map((src, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-xs bg-white/[0.03] p-2 border border-white/5">
                      <div className="flex items-center gap-2 text-white/80">
                        <span className="px-1.5 py-0.5 bg-white/10 text-white font-bold text-[10px] uppercase">{src.type}</span>
                        <span>{src.title}</span>
                      </div>
                      <a href={`https://${src.url}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-[11px] flex items-center gap-1">
                        {src.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
