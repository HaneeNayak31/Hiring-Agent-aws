// app/candidate/opportunities/[id]/page.tsx
'use client';

import CandidateNav from '@/components/CandidateNav';
import { mockJobs } from '@/data/mockData';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, Server, AlertCircle, ArrowUpRight, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];

  const [isApplying, setIsApplying] = useState(false);
  const [applyStep, setApplyStep] = useState<number>(0); // 0: unopened, 1: checking, 2: submitted
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const startApplication = () => {
    setIsApplying(true);
    setApplyStep(1);

    setTimeout(() => {
      setApplyStep(2);
      setSubmittedAppId(`AH-${Math.floor(10000 + Math.random() * 90000)}`);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/candidate/opportunities"
          className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO OPPORTUNITIES LIST</span>
        </Link>

        {/* Header Block */}
        <div className="border-b border-white/15 pb-10 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs mb-3">
              <span className="px-2 py-0.5 bg-primary text-black font-bold uppercase">{job.company}</span>
              <span className="text-white/40">{job.location}</span>
              <span className="text-white/40">·</span>
              <span className="text-emerald-400 font-bold">{job.salary}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-5xl tracking-tight text-white mb-4">
              {job.title}
            </h1>

            <div className="font-mono text-xs text-white/50 flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-primary" />
              <span>MCP ENDPOINT: {job.mcpServer}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0 font-mono">
            <div className="text-right">
              <span className="text-xs text-white/40 block">EVIDENCE MATCH SCORE</span>
              <span className="font-bold text-4xl text-primary">{job.profileFit}%</span>
            </div>

            <button
              onClick={startApplication}
              disabled={isApplying}
              className="px-8 py-4 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              DELEGATE AGENT TO APPLY
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left 2 Cols: Description & Requirements */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="border border-white/15 bg-white/[0.01] p-8">
              <h2 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">// Position Brief</h2>
              <p className="text-white/80 leading-relaxed font-sans text-base">
                {job.description}
              </p>
            </div>

            {/* Evidence Breakdown (Section 15 implementation) */}
            <div className="border-2 border-white bg-black p-8 font-mono">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <span className="text-xs font-bold text-primary uppercase">// PROFILE FIT EXPLANATION</span>
                <span className="text-xs text-white/50">{job.profileFit}% Verified</span>
              </div>

              {/* Requirement signal bars */}
              <div className="space-y-6 mb-8">
                {job.requirements.map((req, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-white flex items-center gap-2">
                        {req.name}
                        {req.matched ? (
                          <span className="text-emerald-400 font-normal text-[10px]">✓ VERIFIED EVIDENCE</span>
                        ) : (
                          <span className="text-amber-500 font-normal text-[10px]">⚠ LIMITED EVIDENCE</span>
                        )}
                      </span>
                      <span className="text-white/50">{req.strength}%</span>
                    </div>

                    {/* Stacked confidence bar */}
                    <div className="h-3 w-full bg-white/10 border border-white/20 p-0.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${req.strength}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${req.matched ? 'bg-primary' : 'bg-amber-500/60'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* WHY section */}
              <div className="pt-6 border-t border-white/20">
                <h3 className="text-xs font-bold text-white uppercase mb-3">// WHY THIS FIT SCORE?</h3>
                <p className="text-xs text-white/70 font-sans leading-relaxed mb-4">
                  Your agent evaluated public repositories, deployed system architectures, and verified credentials across:
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">GitHub (4 repos)</span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">Portfolio Showcase</span>
                  <span className="px-3 py-1 bg-white/10 border border-white/20 text-white">Verified Resume</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: MCP Protocol Panel */}
          <div className="space-y-6 font-mono text-xs">
            <div className="border border-white/15 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 text-primary font-bold mb-4 pb-3 border-b border-white/10">
                <Cpu className="w-4 h-4" />
                <span>COMPANY HIRING MCP</span>
              </div>

              <div className="space-y-3 text-white/70">
                <div>ENDPOINT: <span className="text-white">{job.mcpServer}</span></div>
                <div>PROTOCOL: <span className="text-emerald-400">v1.4 ACTIVE</span></div>
                <div>AVAILABLE TOOLS:</div>
                <div className="bg-black border border-white/10 p-3 space-y-1 font-mono text-[11px] text-primary">
                  <div>· search_jobs</div>
                  <div>· get_requirements</div>
                  <div>· verify_evidence</div>
                  <div>· apply_to_job</div>
                </div>
              </div>
            </div>

            <div className="border border-white/10 bg-white/[0.01] p-6 text-white/50 text-[11px] space-y-2">
              <p className="font-bold text-white uppercase text-xs mb-1">// CANDIDATE DELEGATION SAFETY</p>
              <p>Your agent submits evidence packets without transferring personal identifiers until company review stage.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Application Delegation Modal (Section 17) */}
      <AnimatePresence>
        {isApplying && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full border-2 border-white bg-black p-8 font-mono relative shadow-[12px_12px_0px_0px_rgba(255,106,0,1)]"
            >
              {applyStep === 1 ? (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <span className="text-xs text-primary font-bold uppercase">// AGENT DELEGATION</span>
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  </div>

                  <h3 className="font-bold text-xl uppercase mb-6 text-white">SUBMITTING APPLICATION</h3>

                  <div className="space-y-4 text-xs mb-8">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Requirements checked & matched</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Evidence packet prepared</span>
                    </div>
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Candidate delegation approved</span>
                    </div>
                    <div className="flex items-center gap-3 text-primary animate-pulse font-bold">
                      <span>● Transmitting to {job.company} Hiring MCP...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                    <span className="text-xs text-emerald-400 font-bold uppercase">// SUCCESS</span>
                    <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                  </div>

                  <h3 className="font-bold text-2xl uppercase mb-2 text-white">APPLICATION SUBMITTED</h3>
                  <p className="text-xs text-white/60 mb-6 font-sans">
                    Your candidate report and evidence graph have been received by {job.company}.
                  </p>

                  <div className="bg-white/5 border border-white/15 p-4 mb-6 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/40">APPLICATION ID:</span>
                      <span className="font-bold text-primary">{submittedAppId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">TIMESTAMP:</span>
                      <span className="text-white">12:41 PM Today</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push('/candidate/applications')}
                      className="w-full py-3 bg-primary text-black font-bold text-xs uppercase hover:bg-primary/90 transition"
                    >
                      View Applications
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
