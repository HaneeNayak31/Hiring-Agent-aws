// app/company/roles/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockRoles, OpenRole } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Filter, Briefcase, Server, ArrowRight, Pause, Play, Archive, Edit3, CheckCircle2 } from 'lucide-react';
import { CreateRoleModal, ArchiveRoleDialog } from '@/components/RoleModals';
import { motion } from 'framer-motion';

export default function OpenRolesPage() {
  const searchParams = useSearchParams();
  const [rolesList, setRolesList] = useState<OpenRole[]>(mockRoles);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [archiveTargetRole, setArchiveTargetRole] = useState<OpenRole | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  const handleCreateRole = (newRolePartial: any) => {
    const newRole: OpenRole = {
      id: `role-${rolesList.length + 1}`,
      ...newRolePartial,
      activity: [
        { timestamp: 'Just now', message: 'Role published to Hiring MCP protocol', type: 'EVENT' },
      ],
    };
    setRolesList([newRole, ...rolesList]);
  };

  const handleToggleStatus = (roleId: string) => {
    setRolesList((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
          const newStatus = r.status === 'OPEN' ? 'PAUSED' : 'OPEN';
          return {
            ...r,
            status: newStatus,
            mcpExposed: newStatus === 'OPEN',
            activity: [
              { timestamp: 'Just now', message: `Role status updated to ${newStatus}`, type: 'SYSTEM' },
              ...r.activity,
            ],
          };
        }
        return r;
      })
    );
  };

  const handleArchiveConfirm = () => {
    if (!archiveTargetRole) return;
    setRolesList((prev) =>
      prev.map((r) => (r.id === archiveTargetRole.id ? { ...r, status: 'ARCHIVED', mcpExposed: false } : r))
    );
  };

  const filteredRoles = rolesList.filter((role) => {
    const matchesSearch =
      role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || role.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Live Hiring Endpoints Registry
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              OPEN ROLES
            </h1>
            <p className="text-white/60 text-sm mt-1 font-mono">
              Roles exposed to candidate AI agents through your Hiring MCP Server.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-8 py-4 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ CREATE ROLE</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search role title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/20 pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {['ALL', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-3 border transition-colors ${
                  statusFilter === st
                    ? 'border-primary text-primary bg-primary/10 font-bold'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 7: EDITORIAL ROLE LIST / TABLE */}
        <div className="space-y-4 font-mono">
          {filteredRoles.length === 0 ? (
            <div className="border border-dashed border-white/20 p-12 text-center font-mono">
              <p className="text-white/50 mb-4">NO ROLES FOUND MATCHING FILTER</p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-3 bg-primary text-black font-bold uppercase text-xs"
              >
                + Create New Role
              </button>
            </div>
          ) : (
            filteredRoles.map((role, idx) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-2 border-white/20 bg-black p-6 md:p-8 hover:border-primary transition-all relative shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-3 text-xs mb-1.5">
                      <span className="font-bold text-primary">0{idx + 1}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/70">{role.department}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/50">{role.location}</span>
                    </div>

                    <Link
                      href={`/company/roles/${role.id}`}
                      className="font-bold text-3xl font-sans text-white group-hover:text-primary transition-colors"
                    >
                      {role.title}
                    </Link>

                    <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                      {role.requiredSkills.map((sk, sIdx) => (
                        <span key={sIdx} className="px-2.5 py-0.5 border border-white/10 bg-white/[0.03] text-white/70">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-8 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">APPLICANTS</span>
                      <span className="font-bold text-2xl text-white">{role.applicationsCount}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">VIA AGENTS</span>
                      <span className="font-bold text-2xl text-primary">{role.agentApplicationsCount}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">VERIFYING</span>
                      <span className="font-bold text-2xl text-amber-400">{role.inVerificationCount}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-white/40 block">INTERVIEW READY</span>
                      <span className="font-bold text-2xl text-emerald-400">{role.interviewReadyCount}</span>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase border ${
                          role.status === 'OPEN'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : role.status === 'PAUSED'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            : 'border-red-500/40 text-red-400 bg-red-500/10'
                        }`}
                      >
                        ● {role.status}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(role.id)}
                          title={role.status === 'OPEN' ? 'Pause Role' : 'Resume Role'}
                          className="px-2.5 py-1.5 border border-white/20 text-white hover:border-white text-xs flex items-center gap-1"
                        >
                          {role.status === 'OPEN' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>

                        <button
                          onClick={() => {
                            setArchiveTargetRole(role);
                            setIsArchiveOpen(true);
                          }}
                          title="Archive Role"
                          className="px-2.5 py-1.5 border border-white/20 text-white/60 hover:text-red-400 hover:border-red-400 text-xs"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>

                        <Link
                          href={`/company/roles/${role.id}`}
                          className="px-4 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                        >
                          View Role
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between text-[11px] text-white/40">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-primary" />
                    <span>MCP ENDPOINT: {role.mcpEndpoint}</span>
                  </div>

                  <span className="text-emerald-400 font-bold">
                    {role.mcpExposed ? '● EXPOSED TO EXTERNAL AI AGENTS' : '○ PAUSED FROM MCP'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateRole}
      />

      <ArchiveRoleDialog
        role={archiveTargetRole}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  );
}
