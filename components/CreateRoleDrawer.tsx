// components/CreateRoleDrawer.tsx
'use client';

import { useState } from 'react';
import { OpenRole } from '@/data/mockData';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRole: Partial<OpenRole>) => void;
}

export default function CreateRoleDrawer({ isOpen, onClose, onSave }: CreateRoleDrawerProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full Time');
  const [experience, setExperience] = useState('2–4 years');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js, AWS');
  const [preferredSkills, setPreferredSkills] = useState('Distributed Systems, System Design');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);

    setTimeout(() => {
      onSave({
        title: title.toUpperCase() || 'NEW HIRING ROLE',
        department: department || 'Engineering',
        location,
        type,
        experience,
        description: description || 'Role exposed to external AI agents.',
        requiredSkills: requiredSkills.split(',').map((s) => s.trim()),
        preferredSkills: preferredSkills.split(',').map((s) => s.trim()),
        status: 'OPEN',
        applicationsCount: 0,
        agentApplicationsCount: 0,
        inVerificationCount: 0,
        interviewReadyCount: 0,
        mcpEndpoint: `mcp.stripe.com/hiring/${title.toLowerCase().replace(/\s+/g, '-')}`,
        mcpExposed: true,
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end font-mono text-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-lg bg-black border-l-2 border-white h-full overflow-y-auto p-8 flex flex-col justify-between shadow-[-10px_0_25px_rgba(0,0,0,0.8)]"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
              <span className="text-xs font-bold text-primary tracking-widest uppercase">
                // PUBLISH AGENT-ACCESSIBLE ROLE
              </span>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="py-20 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 stroke-[3]" />
                <h3 className="font-bold text-2xl text-white uppercase mb-2 font-sans">ROLE CREATED</h3>
                <div className="inline-flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 border border-primary/40 px-4 py-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>HIRING MCP EXPOSURE: ● ACTIVE</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Group 1: ROLE */}
                <div>
                  <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-3">// 01 ROLE DETAILS</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/50 mb-1 uppercase">Role Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Engineer"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white/50 mb-1 uppercase">Department *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Platform Engineering"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/50 mb-1 uppercase">Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 p-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-white/50 mb-1 uppercase">Type</label>
                        <input
                          type="text"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/20 p-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group 2: DESCRIPTION */}
                <div>
                  <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-3">// 02 DESCRIPTION</div>
                  <textarea
                    rows={2}
                    placeholder="Brief summary of position objectives..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans transition-colors"
                  />
                </div>

                {/* Group 3: REQUIREMENTS */}
                <div>
                  <div className="text-[10px] text-primary uppercase font-bold tracking-wider mb-3">// 03 REQUIREMENTS</div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/50 mb-1 uppercase">Required Skills (Comma separated)</label>
                      <input
                        type="text"
                        value={requiredSkills}
                        onChange={(e) => setRequiredSkills(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-white/50 mb-1 uppercase">Preferred Skills</label>
                      <input
                        type="text"
                        value={preferredSkills}
                        onChange={(e) => setPreferredSkills(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Group 4: PUBLISH */}
                <div className="pt-4 border-t border-white/10">
                  <div className="p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>MCP EXPOSURE: ● WILL BE AVAILABLE TO EXTERNAL AGENTS</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/2 py-3 border border-white/20 text-white hover:border-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition-all shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)]"
                    >
                      PUBLISH ROLE
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
