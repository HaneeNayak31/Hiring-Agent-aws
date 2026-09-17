// components/CandidateDrawer.tsx
'use client';

import { CandidateReport } from '@/data/mockData';
import { X, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface CandidateDrawerProps {
  candidate: CandidateReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CandidateDrawer({ candidate, isOpen, onClose }: CandidateDrawerProps) {
  if (!isOpen || !candidate) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end font-mono text-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-black border-l-2 border-white h-full overflow-y-auto p-6 flex flex-col justify-between shadow-[-10px_0_25px_rgba(0,0,0,0.8)]"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
              <span className="text-[10px] text-primary font-bold tracking-widest uppercase">
                // QUICK CANDIDATE INSPECTION
              </span>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Identity */}
            <div className="mb-6">
              <div className="text-[10px] text-white/40 mb-1">APPLICATION #{candidate.id}</div>
              <h3 className="font-bold text-3xl font-sans text-white mb-1">{candidate.name}</h3>
              <div className="text-xs text-primary font-bold">{candidate.role}</div>
            </div>

            {/* Status & Evidence Bar */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 border border-white/15 bg-white/[0.02]">
                <span className="text-[10px] text-white/40 block">PROFILE FIT</span>
                <span className="font-bold text-2xl text-primary">{candidate.fitScore}%</span>
              </div>
              <div className="p-3 border border-white/15 bg-white/[0.02]">
                <span className="text-[10px] text-white/40 block">EVIDENCE COVERAGE</span>
                <span className="font-bold text-2xl text-emerald-400">{candidate.evidenceCoverage}%</span>
              </div>
            </div>

            {/* Verified Skills */}
            <div className="mb-6">
              <span className="text-[10px] text-white/40 block tracking-widest uppercase mb-3">// VERIFIED SKILLS SIGNALS</span>
              <div className="space-y-2">
                {candidate.skills.map((sk, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 border border-white/10 bg-white/[0.02]">
                    <span className="font-bold text-white font-sans text-xs">{sk.name}</span>
                    {sk.status === 'VERIFIED' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ({sk.confidence}%)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold text-[11px]">
                        ⚠ LIMITED ({sk.confidence}%)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bio summary */}
            <div className="p-4 border border-white/10 bg-white/[0.01] mb-6 font-sans text-xs text-white/70">
              {candidate.bio}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-white/15">
            <Link
              href={`/company/candidates/${candidate.id}`}
              onClick={onClose}
              className="w-full py-3 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
            >
              <span>OPEN FULL DOSSIER →</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
