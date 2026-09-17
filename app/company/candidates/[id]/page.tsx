// app/company/candidates/[id]/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockCandidateReports, VerifiedSkill } from '@/data/mockData';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Network,
  FileCheck2,
  Terminal,
  ShieldCheck,
  Check,
  Circle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CandidateDetailWorkspace() {
  const params = useParams();
  const candId = params.id as string;
  const cand = mockCandidateReports.find((c) => c.id === candId) || mockCandidateReports[0];

  const [selectedSkill, setSelectedSkill] = useState<string>('AWS');
  const selectedSkillData = cand.skills.find((s) => s.name === selectedSkill) || cand.skills[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Back Link */}
        <div className="flex items-center gap-4 font-mono text-xs text-white/50 mb-8">
          <Link
            href={`/company/roles/${cand.roleId || 'role-1'}`}
            className="inline-flex items-center gap-2 hover:text-primary transition-colors text-primary font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ROLE APPLIED FOR: {cand.role.toUpperCase()}</span>
          </Link>
          <span>·</span>
          <Link href="/company/candidates" className="hover:text-white transition-colors">
            All Candidates
          </Link>
        </div>

        {/* SECTION 19: CANDIDATE DOSSIER HEADER */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 font-mono">
          <div>
            <div className="flex items-center gap-3 text-xs text-primary mb-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CANDIDATE INTELLIGENCE REPORT</span>
              <span>·</span>
              <span className="text-white/40">APPLICATION #{cand.id}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              {cand.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">{cand.role} · Applied {cand.appliedDate}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">PROFILE FIT</span>
              <span className="font-bold text-3xl text-primary">{cand.fitScore}%</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">EVIDENCE COVERAGE</span>
              <span className="font-bold text-3xl text-emerald-400">{cand.evidenceCoverage}%</span>
            </div>
            <Link
              href={`/company/candidates/${cand.id}/brief`}
              className="px-6 py-4 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Interview Briefing
            </Link>
          </div>
        </div>

        {/* SECTION 20: VERIFICATION SYSTEM PANEL */}
        <div className="border border-white/15 bg-white/[0.01] p-6 mb-10 font-mono text-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <span className="font-bold text-primary uppercase tracking-widest">// SOURCE VERIFICATION STATUS</span>
            <span className="text-white/50">EVIDENCE COVERAGE: {cand.evidenceCoverage}%</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span className="text-white">RESUME ANALYZED</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span className="text-white">GITHUB ANALYZED</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span className="text-white">PORTFOLIO ANALYZED</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-black border border-white/10 text-white/40">
              <Circle className="w-4 h-4 text-white/30" />
              <span>LINKEDIN (NOT PROVIDED)</span>
            </div>
          </div>
        </div>

        {/* SECTION 22: INTERACTIVE EVIDENCE GRAPH */}
        <div className="border-2 border-white bg-black p-8 mb-12 font-mono relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Network className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase text-white tracking-wider">
                EVIDENCE GRAPH (CLICK SKILL TO INSPECT TRACEABLE PROOF)
              </span>
            </div>
            <span className="text-xs text-white/40">{cand.skills.length} VERIFIED SKILL SIGNALS</span>
          </div>

          {/* Graph Visual Structure */}
          <div className="py-6 flex flex-col items-center">
            {/* Top Row: Sources */}
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

            <div className="h-6 w-px bg-white/30 mb-2" />

            {/* Candidate Center Node */}
            <div className="px-8 py-3 bg-primary text-black font-bold text-sm tracking-wider uppercase mb-2 shadow-[0_0_20px_rgba(255,106,0,0.3)]">
              CANDIDATE: {cand.name.toUpperCase()}
            </div>

            <div className="h-6 w-px bg-white/30 mb-8" />

            {/* Bottom Row: Skill Nodes */}
            <div className="flex flex-wrap justify-center gap-3">
              {cand.skills.map((sk) => {
                const isSelected = selectedSkill === sk.name;
                return (
                  <button
                    key={sk.name}
                    onClick={() => setSelectedSkill(sk.name)}
                    className={`px-4 py-2.5 border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                        : sk.status === 'VERIFIED'
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500'
                        : 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:border-amber-500'
                    }`}
                  >
                    <span>{sk.name}</span>
                    <span className="text-[10px]">{sk.status === 'VERIFIED' ? '✓' : '⚠'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 23: EVIDENCE SOURCE VIEW */}
          {selectedSkillData && (
            <div className="mt-8 pt-6 border-t border-white/20 bg-white/[0.02] p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40 uppercase">EVIDENCE INSPECTOR FOR:</span>
                  <span className="font-bold text-base text-primary uppercase">{selectedSkillData.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 bg-white/10 text-white font-mono">
                  CONFIDENCE: {selectedSkillData.confidence}%
                </span>
              </div>

              <div className="space-y-3">
                {selectedSkillData.sources.map((src, idx) => (
                  <div key={idx} className="border border-white/10 bg-black p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-primary/20 text-primary font-bold uppercase">{src.type}</span>
                        <span className="font-bold text-white font-sans">{src.title}</span>
                      </div>
                      <a
                        href={`https://${src.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {src.url}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-white/70 font-sans leading-relaxed">
                      &quot;{src.excerpt}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 24: VERIFICATION AGENT ACTIVITY STREAM */}
        <div className="border border-white/15 bg-black p-8 font-mono mb-12">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase">
              <Terminal className="w-4 h-4" />
              <span>VERIFICATION AGENT OPERATIONAL LOG</span>
            </div>
            <span className="text-xs text-white/40">AUTOMATED AUDIT TRAIL</span>
          </div>

          <div className="space-y-3 text-xs text-white/70">
            <div className="flex items-start gap-4">
              <span className="text-white/40 font-mono">12:41:02</span>
              <span className="text-primary font-bold">[RECEIVE]</span>
              <span>Application payload AH-2841 received via Stripe Hiring MCP</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-white/40 font-mono">12:41:03</span>
              <span className="text-primary font-bold">[PARSE]</span>
              <span>Resume parsed: extracted 4 past role entries and 5 skill assertions</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-white/40 font-mono">12:41:05</span>
              <span className="text-primary font-bold">[FETCH]</span>
              <span>GitHub profile discovered (github.com/hanee). Analyzed 8 public repos</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-white/40 font-mono">12:41:07</span>
              <span className="text-primary font-bold">[EXTRACT]</span>
              <span>Confirmed AWS CDK templates in react-design-system and cdk-templates</span>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-white/40 font-mono">12:41:12</span>
              <span className="text-emerald-400 font-bold">[COMPLETE]</span>
              <span>Verification complete. Overall evidence coverage: 87%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
