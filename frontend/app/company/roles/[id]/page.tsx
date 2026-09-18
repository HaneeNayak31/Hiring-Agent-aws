// app/company/roles/[id]/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import Breadcrumbs from '@/components/Breadcrumbs';
import { mockRoles, mockCandidateReports, OpenRole, CandidateReport } from '@/data/mockData';
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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Filter,
  ShieldCheck,
  User,
  FileText,
  Activity,
  Bot,
} from 'lucide-react';
import CandidateDrawer from '@/components/CandidateDrawer';
import { ArchiveRoleDialog } from '@/components/RoleModals';

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;
  const initialRole = mockRoles.find((r) => r.id === roleId) || mockRoles[0];

  const [role, setRole] = useState<OpenRole>(initialRole);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICANTS' | 'VERIFICATION' | 'REPORTS' | 'ACTIVITY'>('OVERVIEW');
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  // Quick-view drawer candidate selection
  const [selectedCandidateDrawer, setSelectedCandidateDrawer] = useState<CandidateReport | null>(null);

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
        {/* Breadcrumb Orientation */}
        <Breadcrumbs items={[{ label: 'ROLES', href: '/company/roles' }, { label: role.title }]} />

        {/* SECTION 9 & 11: ROLE WORKSPACE HEADER */}
        <div className="border-b border-white/15 pb-8 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8 font-mono">
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

        {/* SECTION 11: ROLE WORKSPACE TABS */}
        <div className="flex border-b border-white/15 mb-10 font-mono text-xs overflow-x-auto">
          {(['OVERVIEW', 'APPLICANTS', 'VERIFICATION', 'REPORTS', 'ACTIVITY'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border-b-2 font-bold uppercase transition-all shrink-0 ${
                activeTab === tab
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {tab} {tab === 'APPLICANTS' ? `(${roleApplicants.length})` : ''}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-12">
            {/* Role Overview Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
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

            {/* Interactive Application Funnel */}
            <div className="border-2 border-white bg-black p-8 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/20">
                <span className="font-bold text-sm text-white uppercase tracking-wider">
                  // HIRING PIPELINE FUNNEL (CLICK STAGE TO FILTER APPLICANTS)
                </span>
                <span className="text-xs text-white/50">{role.applicationsCount} TOTAL APPLICANTS</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <button
                  onClick={() => {
                    setFunnelFilter('ALL');
                    setActiveTab('APPLICANTS');
                  }}
                  className="border border-white/20 bg-white/[0.02] p-4 text-white hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="text-[10px] block uppercase mb-1">ALL APPLICATIONS</span>
                  <span className="font-bold text-2xl text-white">{role.applicationsCount}</span>
                  <div className="h-1 bg-white/30 mt-3" />
                </button>

                <button
                  onClick={() => {
                    setFunnelFilter('SCREENING');
                    setActiveTab('APPLICANTS');
                  }}
                  className="border border-white/20 bg-white/[0.02] p-4 text-white hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="text-[10px] block uppercase mb-1">SCREENING</span>
                  <span className="font-bold text-2xl text-white">19</span>
                  <div className="h-1 bg-white/50 mt-3" />
                </button>

                <button
                  onClick={() => {
                    setFunnelFilter('VERIFYING');
                    setActiveTab('APPLICANTS');
                  }}
                  className="border border-white/20 bg-white/[0.02] p-4 text-white hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="text-[10px] block uppercase mb-1">IN VERIFICATION</span>
                  <span className="font-bold text-2xl text-amber-400">{role.inVerificationCount}</span>
                  <div className="h-1 bg-amber-400 mt-3" />
                </button>

                <button
                  onClick={() => {
                    setFunnelFilter('INTERVIEW_READY');
                    setActiveTab('APPLICANTS');
                  }}
                  className="border border-white/20 bg-white/[0.02] p-4 text-white hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="text-[10px] block uppercase mb-1">INTERVIEW READY</span>
                  <span className="font-bold text-2xl text-emerald-400">{role.interviewReadyCount}</span>
                  <div className="h-1 bg-emerald-400 mt-3" />
                </button>
              </div>
            </div>

            {/* Quick Agent Review Spotlight */}
            <div className="border-2 border-white/20 bg-black p-6 font-mono">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-sm text-white uppercase tracking-wider">
                    // CANDIDATE APPLICATIONS (AI BACKGROUND AGENT AUDITED)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('APPLICANTS')}
                  className="text-xs text-primary font-bold hover:underline"
                >
                  View All Applicants ({roleApplicants.length}) →
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {roleApplicants.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateDrawer(cand)}
                    className="p-4 border border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-primary transition-all flex items-center justify-between cursor-pointer group shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary text-black font-bold flex items-center justify-center text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                        {cand.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm font-sans group-hover:text-primary transition-colors">
                          {cand.name}
                        </div>
                        <div className="text-[10px] text-white/40">
                          Fit: <span className="text-primary font-bold">{cand.fitScore}%</span> · Evidence: <span className="text-emerald-400 font-bold">{cand.evidenceCoverage}%</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-primary text-black font-mono font-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1 shrink-0"
                    >
                      <Bot className="w-3 h-3" />
                      <span>OPEN AGENT CHAT →</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirement vs Evidence comparison */}
            <div className="grid lg:grid-cols-2 gap-8 font-mono text-xs">
              <div className="border border-white/15 bg-black p-8">
                <h3 className="font-bold text-base uppercase mb-6 text-white pb-3 border-b border-white/10">
                  // ROLE REQUIREMENTS VS VERIFIED EVIDENCE
                </h3>

                <div className="space-y-3">
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

              {/* Role activity */}
              <div className="border border-white/15 bg-black p-8">
                <h3 className="font-bold text-base uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>ROLE ACTIVITY TELEMETRY</span>
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
          </div>
        )}

        {/* TAB 2: APPLICANTS DATA TABLE */}
        {activeTab === 'APPLICANTS' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-white/15">
              <h2 className="font-bold text-xl uppercase text-white font-sans">
                APPLICANTS FOR {role.title} ({filteredApplicants.length})
              </h2>
              <span className="text-xs text-white/40">FILTER: {funnelFilter}</span>
            </div>

            <div className="border border-white/15 bg-black">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/15 bg-white/[0.03] text-white/40 font-bold uppercase text-[10px]">
                <div className="col-span-4">CANDIDATE</div>
                <div className="col-span-2">APPLICATION</div>
                <div className="col-span-2">VERIFICATION</div>
                <div className="col-span-2">EVIDENCE</div>
                <div className="col-span-2 text-right">ACTION</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-white/10">
                {filteredApplicants.map((cand) => (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateDrawer(cand)}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  >
                    <div className="col-span-4">
                      <div className="font-bold text-sm text-white group-hover:text-primary transition-colors font-sans">
                        {cand.name}
                      </div>
                      <div className="text-[10px] text-white/40">{cand.role}</div>
                    </div>

                    <div className="col-span-2 font-mono">
                      <div className="text-primary font-bold">{cand.id}</div>
                      <div className="text-[10px] text-white/40">{cand.appliedDate}</div>
                    </div>

                    <div className="col-span-2 font-mono">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                          cand.status === 'VERIFIED'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {cand.status}
                      </span>
                    </div>

                    <div className="col-span-2 font-mono">
                      <span className="font-bold text-emerald-400">{cand.evidenceCoverage}%</span>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidateDrawer(cand);
                        }}
                        className="px-3 py-1.5 bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-black font-mono text-[11px] font-bold uppercase transition inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,106,0,0.4)]"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>AGENT CHAT →</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VERIFICATION */}
        {activeTab === 'VERIFICATION' && (
          <div className="border border-white/15 bg-black p-8 font-mono text-xs">
            <h2 className="font-bold text-lg uppercase text-white mb-4 pb-3 border-b border-white/10">
              // ROLE VERIFICATION PIPELINE STATUS
            </h2>
            <p className="text-white/70 font-sans text-sm mb-6">
              Verification agents dynamically extract skill signals from candidate public repositories, architecture templates, and portfolio output.
            </p>
            <div className="p-4 border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold">
              ✓ 8 candidate verification reports compiled for {role.title}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4 font-mono text-xs">
            {roleApplicants.map((report) => (
              <div key={report.id} className="border border-white/15 bg-black p-6 flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg text-white font-sans">{report.name}</div>
                  <div className="text-xs text-white/50">Report ID: {report.id} · Coverage: {report.evidenceCoverage}%</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCandidateDrawer(report)}
                    className="px-4 py-2 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AGENT CHAT & REPORT</span>
                  </button>
                  <Link
                    href={`/company/candidates/${report.id}`}
                    className="px-4 py-2 border border-white/20 text-white font-bold uppercase hover:border-white transition"
                  >
                    Full Dossier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: ACTIVITY */}
        {activeTab === 'ACTIVITY' && (
          <div className="border border-white/15 bg-black p-8 font-mono text-xs space-y-3">
            {role.activity.map((act, idx) => (
              <div key={idx} className="border-b border-white/10 pb-2">
                <div className="text-[10px] text-white/40">{act.timestamp}</div>
                <div className="text-white">{act.message}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Candidate Quick-View Drawer */}
      <CandidateDrawer
        candidate={selectedCandidateDrawer}
        isOpen={!!selectedCandidateDrawer}
        onClose={() => setSelectedCandidateDrawer(null)}
      />

      <ArchiveRoleDialog
        role={role}
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={() => setRole({ ...role, status: 'ARCHIVED', mcpExposed: false })}
      />
    </div>
  );
}
