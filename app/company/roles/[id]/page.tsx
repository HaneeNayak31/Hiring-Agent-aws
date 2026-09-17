// app/company/roles/[id]/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { mockRoles, mockCandidateReports, OpenRole } from '@/data/mockData';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Server,
  Pause,
  Play,
  Archive,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { ArchiveRoleDialog } from '@/components/RoleModals';

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;
  const initialRole = mockRoles.find((r) => r.id === roleId) || mockRoles[0];

  const [role, setRole] = useState<OpenRole>(initialRole);
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  const roleApplicants = mockCandidateReports.filter(
    (c) => c.role.toLowerCase().includes(role.title.toLowerCase().split(' ')[0]) || c.roleId === role.id
  );

  const filteredApplicants = roleApplicants.filter((cand) => {
    if (funnelFilter === 'VERIFYING') return cand.status === 'VERIFYING';
    if (funnelFilter === 'INTERVIEW_READY') return cand.status === 'INTERVIEW_READY' || cand.status === 'VERIFIED';
    return true;
  });

  const toggleRoleStatus = () => {
    const newStatus = role.status === 'OPEN' ? 'PAUSED' : 'OPEN';
    setRole({
      ...role,
      status: newStatus,
      mcpExposed: newStatus === 'OPEN',
      activity: [
        { timestamp: 'Just now', message: `Role status updated to ${newStatus}`, type: 'SYSTEM' },
        ...role.activity,
      ],
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Back Link */}
        <Link
          href="/company/roles"
          className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO OPEN ROLES REGISTRY</span>
        </Link>

        {/* SECTION 11: ROLE WORKSPACE HEADER */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 font-mono">
          <div>
            <div className="flex items-center gap-3 text-xs mb-2">
              <span className="font-bold text-primary">{role.department}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/70">{role.location}</span>
              <span className="text-white/40">·</span>
              <span className="text-white/50">{role.type}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              {role.title}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <span
                className={`px-3 py-1 text-xs font-bold uppercase border ${
                  role.status === 'OPEN'
                    ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                    : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                }`}
              >
                ● {role.status}
              </span>

              <span className="text-xs text-white/50">
                {role.mcpExposed ? '● EXPOSED TO EXTERNAL AGENTS' : '○ PAUSED FROM MCP'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
            <button
              onClick={toggleRoleStatus}
              className="px-4 py-3 border border-white/20 text-white font-bold uppercase hover:border-white transition flex items-center gap-2"
            >
              {role.status === 'OPEN' ? (
                <>
                  <Pause className="w-4 h-4 text-amber-400" /> Pause Role
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-400" /> Resume Role
                </>
              )}
            </button>

            <button
              onClick={() => setIsArchiveOpen(true)}
              className="px-4 py-3 border border-white/20 text-white/60 font-bold uppercase hover:text-red-400 hover:border-red-400 transition flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </div>
        </div>

        {/* SECTION 13: ROLE OVERVIEW METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 font-mono text-xs">
          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// TOTAL APPLICANTS</span>
            <span className="font-bold text-3xl text-white mt-1 block">{role.applicationsCount}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// VIA AI AGENTS</span>
            <span className="font-bold text-3xl text-primary mt-1 block">{role.agentApplicationsCount}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// IN VERIFICATION</span>
            <span className="font-bold text-3xl text-amber-400 mt-1 block">{role.inVerificationCount}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// INTERVIEW READY</span>
            <span className="font-bold text-3xl text-emerald-400 mt-1 block">{role.interviewReadyCount}</span>
          </div>
        </div>

        {/* SECTION 14: INTERACTIVE APPLICATION FUNNEL */}
        <div className="border-2 border-white bg-black p-8 mb-12 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/20">
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              // ROLE APPLICATION PIPELINE FUNNEL (CLICK STAGE TO FILTER APPLICANTS)
            </span>
            <span className="text-xs text-white/50">{role.applicationsCount} TOTAL APPLICANTS</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <button
              onClick={() => setFunnelFilter('ALL')}
              className={`border p-4 transition-colors ${
                funnelFilter === 'ALL'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-white/20 bg-white/[0.02] text-white/70 hover:border-white/50'
              }`}
            >
              <span className="text-[10px] block uppercase mb-1">ALL APPLICATIONS</span>
              <span className="font-bold text-2xl text-white">{role.applicationsCount}</span>
              <div className="h-1 bg-white/30 mt-3" />
            </button>

            <button
              onClick={() => setFunnelFilter('SCREENING')}
              className={`border p-4 transition-colors ${
                funnelFilter === 'SCREENING'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-white/20 bg-white/[0.02] text-white/70 hover:border-white/50'
              }`}
            >
              <span className="text-[10px] block uppercase mb-1">SCREENING</span>
              <span className="font-bold text-2xl text-white">19</span>
              <div className="h-1 bg-white/50 mt-3" />
            </button>

            <button
              onClick={() => setFunnelFilter('VERIFYING')}
              className={`border p-4 transition-colors ${
                funnelFilter === 'VERIFYING'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-white/20 bg-white/[0.02] text-white/70 hover:border-white/50'
              }`}
            >
              <span className="text-[10px] block uppercase mb-1">IN VERIFICATION</span>
              <span className="font-bold text-2xl text-amber-400">{role.inVerificationCount}</span>
              <div className="h-1 bg-amber-400 mt-3" />
            </button>

            <button
              onClick={() => setFunnelFilter('INTERVIEW_READY')}
              className={`border p-4 transition-colors ${
                funnelFilter === 'INTERVIEW_READY'
                  ? 'border-primary bg-primary/10 text-primary font-bold'
                  : 'border-white/20 bg-white/[0.02] text-white/70 hover:border-white/50'
              }`}
            >
              <span className="text-[10px] block uppercase mb-1">INTERVIEW READY</span>
              <span className="font-bold text-2xl text-emerald-400">{role.interviewReadyCount}</span>
              <div className="h-1 bg-emerald-400 mt-3" />
            </button>
          </div>
        </div>

        {/* SECTION 15: ROLE APPLICANTS LIST */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15 font-mono">
            <h2 className="font-bold text-xl uppercase text-white">
              APPLICANTS FOR {role.title} ({filteredApplicants.length})
            </h2>
            <span className="text-xs text-white/40">FILTER: {funnelFilter}</span>
          </div>

          <div className="space-y-4 font-mono">
            {filteredApplicants.map((cand, idx) => (
              <div
                key={cand.id}
                className="border border-white/15 bg-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-1">
                    <span className="text-primary font-bold">{cand.id}</span>
                    <span>·</span>
                    <span>Applied {cand.appliedDate} via External AI Agent</span>
                  </div>

                  <Link
                    href={`/company/candidates/${cand.id}`}
                    className="font-bold text-2xl font-sans text-white hover:text-primary transition"
                  >
                    {cand.name}
                  </Link>
                  <div className="text-xs text-white/70 mt-1">{cand.bio}</div>
                </div>

                <div className="flex flex-wrap items-center gap-8 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">PROFILE FIT</span>
                    <span className="font-bold text-2xl text-primary">{cand.fitScore}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">EVIDENCE</span>
                    <span className="font-bold text-2xl text-emerald-400">{cand.evidenceCoverage}%</span>
                  </div>

                  <Link
                    href={`/company/candidates/${cand.id}`}
                    className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                  >
                    Inspect Dossier
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 33 & 34: REQUIREMENT TO EVIDENCE COMPARISON */}
        <div className="grid lg:grid-cols-2 gap-10 font-mono">
          {/* Requirements & Evidence signals */}
          <div className="border border-white/15 bg-black p-8">
            <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10">
              // ROLE REQUIREMENTS VS CANDIDATE EVIDENCE
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02]">
                <span className="font-bold text-white">React (Required)</span>
                <span className="text-emerald-400 font-bold">✓ 96% Verified Signal</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02]">
                <span className="font-bold text-white">TypeScript (Required)</span>
                <span className="text-emerald-400 font-bold">✓ 98% Verified Signal</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02]">
                <span className="font-bold text-white">AWS (Required)</span>
                <span className="text-emerald-400 font-bold">✓ 88% Verified Signal</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02]">
                <span className="font-bold text-white">Distributed Systems (Preferred)</span>
                <span className="text-amber-400 font-bold">◐ 42% Limited Evidence</span>
              </div>
            </div>
          </div>

          {/* SECTION 32: ROLE ACTIVITY STREAM */}
          <div className="border border-white/15 bg-black p-8">
            <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              <span>ROLE ACTIVITY STREAM</span>
            </h3>

            <div className="space-y-3 text-xs text-white/70">
              {role.activity.map((act, idx) => (
                <div key={idx} className="border-b border-white/10 pb-2 last:border-0">
                  <div className="flex items-center gap-2 text-[10px] text-white/40 mb-0.5">
                    <span>{act.timestamp}</span>
                    <span>·</span>
                    <span className="text-primary font-bold">[{act.type}]</span>
                  </div>
                  <p className="text-white/90 font-mono">{act.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <ArchiveRoleDialog
        role={role}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={() => setRole({ ...role, status: 'ARCHIVED', mcpExposed: false })}
      />
    </div>
  );
}
