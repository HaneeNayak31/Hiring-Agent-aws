'use client';

import { useState } from 'react';
import { OpenRole } from '@/data/mockData';
import { X, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRole: Partial<OpenRole>) => void;
}

export function CreateRoleModal({ isOpen, onClose, onSave }: CreateRoleModalProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState('Full Time');
  const [experience, setExperience] = useState('2–4 years');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, TypeScript, Node.js, AWS');
  const [preferredSkills, setPreferredSkills] = useState('Distributed Systems, System Design');
  const [isCreatedSuccess, setIsCreatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatedSuccess(true);

    setTimeout(() => {
      onSave({
        title: title.toUpperCase() || 'NEW ROLE REQUISITION',
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
      setIsCreatedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 font-mono text-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="max-w-2xl w-full border-2 border-white bg-black p-8 relative shadow-[12px_12px_0px_0px_rgba(255,106,0,1)]"
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
          <span className="text-xs font-bold text-primary tracking-widest uppercase">
            // PUBLISH AGENT-ACCESSIBLE HIRING ENDPOINT
          </span>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isCreatedSuccess ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4 stroke-[3]" />
            <h3 className="font-bold text-2xl text-white uppercase mb-2 font-sans">ROLE CREATED</h3>
            <div className="inline-flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 border border-primary/40 px-4 py-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>HIRING MCP EXPOSURE: ● ACTIVE</span>
            </div>
            <p className="text-xs text-white/60 font-sans mt-4">
              External AI agents can now discover, query requirements, and submit candidates to this role.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 mb-1 uppercase">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
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
                  className="w-full bg-white/[0.03] border border-white/20 p-3 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/50 mb-1 uppercase">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 uppercase">Employment Type</label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 uppercase">Experience Level</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/50 mb-1 uppercase">Role Description</label>
              <textarea
                rows={2}
                placeholder="Brief summary of position objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary font-sans"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 mb-1 uppercase">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-white/50 mb-1 uppercase">Preferred Skills</label>
                <input
                  type="text"
                  value={preferredSkills}
                  onChange={(e) => setPreferredSkills(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/20 p-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-white/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Will automatically expose MCP tool search_jobs capability
              </span>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-white/20 text-white hover:border-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                >
                  Publish Role to MCP
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

interface ArchiveRoleDialogProps {
  role: OpenRole | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ArchiveRoleDialog({ role, isOpen, onClose, onConfirm }: ArchiveRoleDialogProps) {
  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 font-mono text-xs">
      <div className="max-w-md w-full border-2 border-red-500 bg-black p-6 relative shadow-[10px_10px_0px_0px_rgba(239,68,68,1)]">
        <div className="flex items-center gap-2 text-red-500 font-bold mb-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="uppercase text-sm">// CONFIRM ARCHIVE ROLE</span>
        </div>

        <h3 className="font-bold text-xl uppercase mb-2 font-sans text-white">
          ARCHIVE {role.title}?
        </h3>

        <p className="text-xs text-white/70 font-sans leading-relaxed mb-6">
          This role will stop accepting new applications from external AI agents via your Hiring MCP server. Existing applications will remain accessible in your database.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 border border-white/20 text-white font-bold uppercase hover:border-white transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-1/2 py-2.5 bg-red-600 text-white font-bold uppercase hover:bg-red-700 transition"
          >
            Archive Role
          </button>
        </div>
      </div>
    </div>
  );
}
