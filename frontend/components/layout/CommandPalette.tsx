'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OpenRole, CandidateReport } from '@/data/mockData';
import { fetchJobs, fetchApplications } from '@/data/apiClient';
import { mapJobDetailToOpenRole, mapApplicationToCandidateReport } from '@/data/schemaAdapter';
import { Search, X, Briefcase, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [candidates, setCandidates] = useState<CandidateReport[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetchJobs().catch(() => []),
          fetchApplications().catch(() => []),
        ]);
        if (jobsRes) {
          setRoles(jobsRes.map(mapJobDetailToOpenRole));
        }
        if (appsRes) {
          setCandidates(appsRes.map(mapApplicationToCandidateReport));
        }
      } catch (err) {
        console.error('Error fetching data for command palette:', err);
      }
    }
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRoles = roles.filter((r) =>
    r.title.toLowerCase().includes(query.toLowerCase()) || r.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCandidates = candidates.filter((c) =>
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

          <div className="max-h-96 overflow-y-auto pt-4 space-y-4">
            {roles.length === 0 && candidates.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                No roles or candidate records found in database.
              </div>
            ) : (
              <>
                {filteredRoles.length > 0 && (
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
                )}

                {filteredCandidates.length > 0 && (
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
                        <span className="text-[10px] text-primary font-bold">{cand.status}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
