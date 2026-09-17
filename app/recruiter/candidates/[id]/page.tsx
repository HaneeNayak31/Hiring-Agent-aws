// app/recruiter/candidates/[id]/page.tsx
'use client';

import RecruiterNav from '@/components/RecruiterNav';
import { mockCandidates } from '@/data/mockData';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertTriangle, ExternalLink, Network, FileCheck2, Cpu, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CandidateEvidenceWorkspace() {
  const params = useParams();
  const candId = params.id as string;
  const cand = mockCandidates.find((c) => c.id === candId) || mockCandidates[0];

  const [selectedSkill, setSelectedSkill] = useState<string>('AWS');

  const selectedSkillData = cand.skills.find((s) => s.skill === selectedSkill) || cand.skills[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <RecruiterNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CANDIDATE ROSTER</span>
        </Link>

        {/* Candidate Identity Header (Section 19) */}
        <div className="border-b border-white/15 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>EVIDENCE VERIFIED REPORT</span>
              <span>·</span>
              <span className="text-white/40">ID: {cand.id}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              {cand.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">{cand.title} · {cand.location}</p>
          </div>

          <div className="flex items-center gap-6 font-mono shrink-0">
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">PROFILE FIT</span>
              <span className="font-bold text-3xl text-primary">{cand.profileFitScore}%</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">EVIDENCE COVERAGE</span>
              <span className="font-bold text-3xl text-emerald-400">{cand.evidenceCoverage}%</span>
            </div>
            <Link
              href={`/recruiter/candidates/${cand.id}/brief`}
              className="px-6 py-4 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Interview Briefing
            </Link>
          </div>
        </div>

        {/* SECTION 20: INTERACTIVE EVIDENCE GRAPH */}
        <div className="border-2 border-white bg-black p-8 mb-12 font-mono relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase text-white tracking-wider">
                INTERACTIVE EVIDENCE GRAPH (CLICK SKILL TO INSPECT PROOF)
              </span>
            </div>
            <span className="text-xs text-white/40">3 SOURCES · 5 VERIFIED SKILLS</span>
          </div>

          {/* Graph Visual Structure */}
          <div className="py-6 flex flex-col items-center">
            {/* Sources Row */}
            <div className="flex gap-6 md:gap-12 mb-8">
              <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                RESUME
              </div>
              <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                GITHUB REPOS
              </div>
              <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                PORTFOLIO
              </div>
            </div>

            {/* Connecting line to candidate */}
            <div className="h-6 w-px bg-white/30 mb-2" />

            {/* Center Node: Candidate */}
            <div className="px-8 py-3 bg-primary text-black font-bold text-sm tracking-wider uppercase mb-2 shadow-[0_0_20px_rgba(255,106,0,0.3)]">
              CANDIDATE: {cand.name.toUpperCase()}
            </div>

            {/* Connecting line to skills */}
            <div className="h-6 w-px bg-white/30 mb-8" />

            {/* Skill Nodes Selector */}
            <div className="flex flex-wrap justify-center gap-3">
              {cand.skills.map((sk) => {
                const isSelected = selectedSkill === sk.skill;
                return (
                  <button
                    key={sk.skill}
                    onClick={() => setSelectedSkill(sk.skill)}
                    className={`px-4 py-2.5 border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                        : sk.verified
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500'
                        : 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:border-amber-500'
                    }`}
                  >
                    <span>{sk.skill}</span>
                    <span className="text-[10px]">{sk.verified ? '✓' : '⚠'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Inspector Drawer / Pop-over */}
          <div className="mt-8 pt-6 border-t border-white/20 bg-white/[0.02] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 uppercase">EVIDENCE INSPECTOR FOR:</span>
                <span className="font-bold text-base text-primary uppercase">{selectedSkillData.skill}</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-white/10 text-white font-mono">
                CONFIDENCE: {selectedSkillData.confidence}%
              </span>
            </div>

            <div className="space-y-3">
              {selectedSkillData.sources.map((src, idx) => (
                <div key={idx} className="border border-white/10 bg-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-white/50 mb-1">
                      <span className="px-1.5 py-0.5 bg-primary/20 text-primary font-bold uppercase">{src.type}</span>
                      <span>Verified Claim Source</span>
                    </div>
                    <div className="text-xs font-bold text-white font-sans">{src.title}</div>
                  </div>
                  <a
                    href={`https://${src.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>{src.url}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Skills & Gaps Grid */}
        <div className="grid md:grid-cols-2 gap-8 font-mono">
          {/* Confirmed Skills */}
          <div className="border border-white/15 bg-black p-8">
            <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CONFIRMED COMPETENCIES</span>
            </h3>

            <div className="space-y-4">
              {cand.skills.filter(s => s.verified).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                  <span className="text-white font-bold">{s.skill}</span>
                  <span className="text-emerald-400 font-bold">100% VERIFIED EVIDENCE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Gaps */}
          <div className="border border-white/15 bg-black p-8">
            <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>POTENTIAL GAP AREAS</span>
            </h3>

            <div className="space-y-3 text-xs text-white/80 font-sans">
              {cand.potentialGaps.map((gap, idx) => (
                <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  {gap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
