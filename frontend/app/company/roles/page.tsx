'use client';

import CompanyNav from '@/components/layout/CompanyNav';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { OpenRole } from '@/data/mockData';
import { fetchJobs, updateJobStatus, ApiError } from '@/data/apiClient';
import { mapJobDetailToOpenRole } from '@/data/schemaAdapter';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Pause, Play, Archive, Server, AlertCircle } from 'lucide-react';
import { ArchiveRoleDialog } from '@/components/company/RoleModals';
import { motion } from 'framer-motion';

export default function RolesPage() {
  const [rolesList, setRolesList] = useState<OpenRole[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [archiveTargetRole, setArchiveTargetRole] = useState<OpenRole | null>(null);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const liveJobs = await fetchJobs();
      if (liveJobs) {
        const mapped = liveJobs.map(mapJobDetailToOpenRole);
        setRolesList(mapped);
      }
    } catch (e: any) {
      setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to load roles from API'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleToggleStatus = async (roleId: string) => {
    const target = rolesList.find((r) => r.id === roleId);
    if (!target) return;
    const previousStatus = target.status;
    const newStatus = target.status === 'OPEN' ? 'PAUSED' : 'OPEN';
    setActionError(null);

    // Optimistically update
    setRolesList((prev) =>
      prev.map((r) => {
        if (r.id === roleId) {
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

    try {
      await updateJobStatus(roleId, newStatus.toLowerCase());
    } catch (e: any) {
      // Revert optimistic update
      setRolesList((prev) =>
        prev.map((r) => (r.id === roleId ? { ...r, status: previousStatus, mcpExposed: previousStatus === 'OPEN' } : r))
      );
      setActionError(e instanceof ApiError ? e.message : (e?.message || 'Failed to update status on server'));
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTargetRole) return;
    const roleId = archiveTargetRole.id;
    const previousList = [...rolesList];
    setActionError(null);

    setRolesList((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, status: 'ARCHIVED', mcpExposed: false } : r))
    );
    try {
      await updateJobStatus(roleId, 'archived');
    } catch (e: any) {
      // Revert
      setRolesList(previousList);
      setActionError(e instanceof ApiError ? e.message : (e?.message || 'Failed to archive role on server'));
    }
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
        <Breadcrumbs items={[{ label: 'ROLES' }]} />

        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Live Hiring Endpoints Registry
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              ROLES
            </h1>
            <p className="text-white/60 text-sm mt-1 font-mono">
              Requisitions exposed to candidate AI agents through your Hiring MCP Server.
            </p>
          </div>

          <Link
            href="/company/roles/create"
            className="px-8 py-4 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ CREATE ROLE</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search roles or departments..."
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

        {actionError && (
          <div className="mb-6 p-4 border border-red-500/40 bg-red-950/30 text-red-400 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-white/60 hover:text-white underline text-[10px]"
            >
              DISMISS
            </button>
          </div>
        )}

        <ApiErrorBanner
          error={apiError}
          onRetry={loadRoles}
          className="mb-6"
        />

        <div className="space-y-4 font-mono">
          {loading ? (
            <div className="border border-white/10 p-12 text-center font-mono animate-pulse">
              <p className="text-primary text-xs tracking-widest uppercase">// SYNCHRONIZING REQUISITIONS REGISTRY...</p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="border border-dashed border-white/20 p-12 text-center font-mono">
              <p className="text-white/50 mb-4">
                {apiError ? 'UNABLE TO LOAD ROLES FROM BACKEND CLOUD' : 'NO ROLES FOUND MATCHING FILTER'}
              </p>
              {!apiError && (
                <Link
                  href="/company/roles/create"
                  className="inline-block px-6 py-3 bg-primary text-black font-bold uppercase text-xs hover:bg-primary/90 transition"
                >
                  + Create New Role
                </Link>
              )}
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
                          {role.status === 'OPEN' ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
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
                          OPEN ROLE →
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

      <ArchiveRoleDialog
        role={archiveTargetRole}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={handleArchiveConfirm}
      />
    </div>
  );
}
