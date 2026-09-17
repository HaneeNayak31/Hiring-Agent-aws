// components/CommandPalette.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockRoles, mockCandidateReports } from '@/data/mockData';
import { Search, X, Briefcase, User, FileText, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRoles = mockRoles.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) || r.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCandidates = mockCandidateReports.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.role.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4 font-mono text-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-2xl w-full border-2 border-white bg-black p-6 relative shadow-[10px_10px_0px_0px_rgba(255,106,0,1)]"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/20">
            <Search className="w-5 h-5 text-primary" />
            <input
              type="text"
              autoFocus
              placeholder="Search roles, candidates, reports, MCP tools... (Esc to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none text-sm font-sans"
            />
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto pt-4 space-y-4">
            {/* Roles Section */}
            <div>
              <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-2">// ROLES</div>
              {filteredRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleSelect(`/company/roles/${role.id}`)}
                  className="w-full text-left p-3 border border-white/10 bg-white/[0.02] hover:border-primary hover:bg-primary/10 transition-colors flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-white/50" />
                    <div>
                      <span className="font-bold text-white font-sans">{role.title}</span>
                      <span className="text-white/40 text-[11px] block">{role.department}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">● {role.status}</span>
                </button>
              ))}
            </div>

            {/* Talent Section */}
            <div>
              <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-2">// TALENT & REPORTS</div>
              {filteredCandidates.map((cand) => (
                <button
                  key={cand.id}
                  onClick={() => handleSelect(`/company/candidates/${cand.id}`)}
                  className="w-full text-left p-3 border border-white/10 bg-white/[0.02] hover:border-primary hover:bg-primary/10 transition-colors flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/50" />
                    <div>
                      <span className="font-bold text-white font-sans">{cand.name}</span>
                      <span className="text-white/40 text-[11px] block">{cand.role}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-primary font-bold">FIT {cand.fitScore}%</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
