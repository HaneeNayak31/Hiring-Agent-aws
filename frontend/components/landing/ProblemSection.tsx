'use client';

import { motion } from 'framer-motion';
import { ArrowDown, Check, X } from 'lucide-react';

const todaySteps = [
  'Candidate',
  'Job Boards',
  'Company Sites',
  'Application Forms (100x)',
  'Black Hole ATS',
  'Recruiter Filter',
];

const futureSteps = [
  { text: 'Candidate', detail: 'Delegates criteria & preferences' },
  { text: 'Personal AI Agent', detail: 'Runs 24/7 autonomous discovery' },
  { text: 'Company Hiring MCP', detail: 'Direct server-to-server query' },
  { text: 'Verification Agent', detail: 'Evidence graph & skill validation' },
  { text: 'Interviewer Briefing', detail: 'Structured evidence-backed packet' },
];

export default function ProblemSection() {
  return (
    <section id="how-it-works" className="bg-white text-black py-28 px-6 border-t border-b border-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-3">
            // Paradigm Shift
          </span>
          <h2 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-none">
            HIRING IS BROKEN FOR HUMANS.
            <br />
            <span className="text-black/40">BUILT FOR AGENTS.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="p-8 border border-black/10 bg-offWhite/50 relative"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
              <span className="font-mono text-xs uppercase tracking-widest text-black/50">
                01 — Standard Process
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-700 font-mono text-xs uppercase tracking-wider font-semibold">
                High Friction
              </span>
            </div>

            <h3 className="font-bold text-2xl tracking-tight mb-8">TODAY</h3>

            <div className="space-y-3 font-mono text-sm">
              {todaySteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full border border-red-300 bg-red-50 text-red-500 flex items-center justify-center text-xs">
                    <X className="w-3 h-3" />
                  </span>
                  <span className="text-black/70">{step}</span>
                  {idx < todaySteps.length - 1 && (
                    <ArrowDown className="w-3 h-3 text-black/30 ml-auto" />
                  )}
                </div>
              ))}
            </div>

            <p className="mt-8 pt-6 border-t border-black/10 text-xs text-black/60 font-sans">
              Candidates spend 40+ hours per week tailoring resumes, battling ATS parsers, and receiving silence.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="p-8 border-2 border-black bg-black text-white relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/20">
              <span className="font-mono text-xs uppercase tracking-widest text-primary">
                02 — Agentic Infrastructure
              </span>
              <span className="px-2 py-1 bg-primary text-black font-mono text-xs uppercase tracking-wider font-bold">
                Zero Friction
              </span>
            </div>

            <h3 className="font-bold text-2xl tracking-tight mb-8 text-white">THE NEXT INTERNET</h3>

            <div className="space-y-4 font-mono text-sm">
              {futureSteps.map((step, idx) => (
                <div key={idx} className="border-b border-white/10 pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center text-xs font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                    <span className="font-bold text-white tracking-wide">{step.text}</span>
                  </div>
                  <p className="text-xs text-white/50 pl-8 mt-1 font-sans">{step.detail}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 pt-6 border-t border-white/20 text-xs text-white/70 font-sans">
              Candidates never fill forms. AI agents talk directly to hiring protocols and deliver verified proof.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
