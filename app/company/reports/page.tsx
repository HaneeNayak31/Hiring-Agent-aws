// app/company/reports/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockCandidateReports } from '@/data/mockData';
import { useState } from 'react';
import Link from 'next/link';
import { FileBarChart2, ArrowRight, CheckCircle2, RefreshCw, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CandidateReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const startGenerationWorkflow = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 1000);
    setTimeout(() => setGenerationStep(3), 2000);
    setTimeout(() => {
      setGenerationStep(4);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Intelligence Output Engine
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              CANDIDATE REPORTS
            </h1>
          </div>

          <button
            onClick={startGenerationWorkflow}
            disabled={isGenerating}
            className="px-6 py-3.5 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate New Report</span>
          </button>
        </div>

        {/* SECTION 28: REPORT GENERATION SIMULATION */}
        {isGenerating && (
          <div className="border-2 border-white bg-black p-8 mb-12 font-mono relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
              <span className="text-xs font-bold text-primary uppercase">// GENERATING CANDIDATE REPORT</span>
              <span className="text-xs text-white/50">STAGE {generationStep} OF 4</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className={`flex items-center gap-3 ${generationStep >= 1 ? 'text-emerald-400 font-bold' : 'text-white/30'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>RESUME PARSED & CLAIMS EXTRACTED</span>
              </div>

              <div className={`flex items-center gap-3 ${generationStep >= 2 ? 'text-emerald-400 font-bold' : 'text-white/30'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>GITHUB & PUBLIC REPOSITORY SIGNALS ANALYZED</span>
              </div>

              <div className={`flex items-center gap-3 ${generationStep >= 3 ? 'text-emerald-400 font-bold' : 'text-white/30'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>EVIDENCE CROSS-CHECKED & PROOF MATRIX COMPILED</span>
              </div>

              <div className={`flex items-center gap-3 ${generationStep >= 4 ? 'text-primary font-bold' : 'text-white/30'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>REPORT COMPLETE — READY FOR REVIEW</span>
              </div>
            </div>

            {generationStep === 4 && (
              <div className="mt-6 pt-4 border-t border-white/20 flex gap-4">
                <button
                  onClick={() => setIsGenerating(false)}
                  className="px-4 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        )}

        {/* SECTION 29: REPORTS LIST */}
        <div className="space-y-6 font-mono">
          {mockCandidateReports.map((report) => (
            <div
              key={report.id}
              className="border border-white/15 bg-black p-8 hover:border-primary/60 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-1">
                    <span className="text-primary font-bold">{report.id}</span>
                    <span>·</span>
                    <span>{report.role}</span>
                    <span>·</span>
                    <span>Generated {report.appliedDate}</span>
                  </div>
                  <h3 className="font-bold text-3xl font-sans text-white">{report.name}</h3>
                </div>

                <div className="flex items-center gap-8 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">FIT SCORE</span>
                    <span className="font-bold text-3xl text-primary">{report.fitScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">EVIDENCE COVERAGE</span>
                    <span className="font-bold text-3xl text-emerald-400">{report.evidenceCoverage}%</span>
                  </div>
                </div>
              </div>

              {/* Structure preview */}
              <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs">
                <div className="text-white/70 font-sans">
                  Report contains: Verified Skills, Evidence Traceability Matrix, Potential Gap Areas, and Interview Brief.
                </div>

                <div className="flex gap-4 shrink-0">
                  <Link
                    href={`/company/candidates/${report.id}`}
                    className="px-5 py-2.5 bg-white text-black font-bold uppercase hover:bg-primary transition flex items-center gap-2"
                  >
                    View Report
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
