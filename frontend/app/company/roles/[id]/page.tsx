'use client';

import CompanyNav from '@/components/layout/CompanyNav';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { OpenRole, CandidateReport } from '@/data/mockData';
import { fetchJob, fetchApplications, updateJobStatus, ApiError } from '@/data/apiClient';
import { mapJobDetailToOpenRole, mapApplicationToCandidateReport } from '@/data/schemaAdapter';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Server,
  Pause,
  Play,
  Archive,
  Terminal,
  ShieldCheck,
  Bot,
  Plus,
  AlertCircle,
} from 'lucide-react';
import CandidateAgentDrawer from '@/components/company/CandidateAgentDrawer';
import { ArchiveRoleDialog } from '@/components/company/RoleModals';

export default function RoleDetailPage() {
  const params = useParams();
  const roleId = params.id as string;

  const [role, setRole] = useState<OpenRole | null>(null);
  const [applicants, setApplicants] = useState<CandidateReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobError, setJobError] = useState<ApiError | string | null>(null);
  const [appsError, setAppsError] = useState<ApiError | string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICANTS' | 'VERIFICATION' | 'REPORTS' | 'ACTIVITY'>('OVERVIEW');
  const [funnelFilter, setFunnelFilter] = useState<string>('ALL');
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [selectedCandidateDrawer, setSelectedCandidateDrawer] = useState<CandidateReport | null>(null);

  const loadRoleData = useCallback(async () => {
    setLoading(true);
    setJobError(null);
    setAppsError(null);

    try {
      const liveJob = await fetchJob(roleId);
      if (liveJob) {
        setRole(mapJobDetailToOpenRole(liveJob));
      }
    } catch (e: any) {
      setJobError(e instanceof ApiError ? e : (e?.message || 'Failed to load requisition specification'));
    }

    try {
      const liveApps = await fetchApplications(roleId);
      if (liveApps) {
        setApplicants(liveApps.map(mapApplicationToCandidateReport));
      }
    } catch (e: any) {
      setAppsError(e instanceof ApiError ? e : (e?.message || 'Failed to load applications for this requisition'));
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    loadRoleData();
  }, [loadRoleData]);

  const toggleRoleStatus = async () => {
    if (!role) return;
    const previousStatus = role.status;
    const newStatus = role.status === 'OPEN' ? 'PAUSED' : 'OPEN';
    setActionError(null);

    setRole({
      ...role,
      status: newStatus,
      mcpExposed: newStatus === 'OPEN',
      activity: [
        { timestamp: 'Just now', message: `Role status updated to ${newStatus}`, type: 'SYSTEM' },
        ...(role.activity || []),
      ],
    });

    try {
      await updateJobStatus(roleId, newStatus.toLowerCase());
    } catch (e: any) {
      // Revert state
      setRole({
        ...role,
        status: previousStatus,
        mcpExposed: previousStatus === 'OPEN',
      });
      setActionError(e instanceof ApiError ? e.message : (e?.message || 'Failed to update role status on server'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-7xl mx-auto px-6 py-20 text-center font-mono">
          <p className="text-primary text-sm animate-pulse uppercase tracking-widest">// LOADING REQUISITION SPECIFICATION...</p>
        </main>
      </div>
    );
  }

  // Check if job failed with a network or server error (not a 404)
  const is404 = jobError instanceof ApiError ? jobError.isNotFound : (jobError as any)?.statusCode === 404;

  if (jobError && !is404) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-7xl mx-auto px-6 py-20 font-mono">
          <ApiErrorBanner
            error={jobError}
            onRetry={loadRoleData}
            title="Failed to Retrieve Requisition"
            className="mb-8"
          />
          <div className="text-center">
            <Link
              href="/company/roles"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold uppercase text-xs transition"
            >
              ← Back to Roles
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!role || is404) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-7xl mx-auto px-6 py-20 text-center font-mono">
          <Briefcase className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold uppercase mb-2">Role Not Found</h2>
          <p className="text-xs text-white/50 mb-6">The role requisition &quot;{roleId}&quot; was not found in the live backend.</p>
          <Link
            href="/company/roles"
            className="inline-block px-6 py-3 bg-primary text-black font-bold uppercase text-xs hover:bg-primary/90 transition shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
          >
            Return to Roles
          </Link>
        </main>
      </div>
    );
  }

  const roleApplicants = applicants.filter(
    (c) =>
      c.roleId === role.id ||
      c.roleId === roleId ||
      (c.role && role.title && (
        c.role.toLowerCase().includes(role.title.toLowerCase().split(' ')[0]) ||
        role.title.toLowerCase().includes(c.role.toLowerCase().split(' ')[0])
      ))
  );

  const filteredApplicants = roleApplicants.filter((cand) => {
    if (funnelFilter === 'VERIFYING') return cand.status === 'VERIFYING';
    if (funnelFilter === 'INSPECTED') return cand.status === 'INSPECTED';
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb Orientation */}
        <Breadcrumbs items={[{ label: 'ROLES', href: '/company/roles' }, { label: role.title }]} />

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

        {appsError && (
          <ApiErrorBanner
            error={appsError}
            onRetry={loadRoleData}
            title="Applicants Synchronization Failed"
            className="mb-6"
          />
        )}

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
                <span className="font-bold text-3xl text-white mt-1 block">{roleApplicants.length}</span>
              </div>

              <div className="border border-white/15 bg-white/[0.02] p-5">
                <span className="text-white/40 block text-[10px] uppercase">// VIA AI AGENTS</span>
                <span className="font-bold text-3xl text-primary mt-1 block">
                  {roleApplicants.filter((c) => c.agentSessionId).length}
                </span>
              </div>

              <div className="border border-white/15 bg-white/[0.02] p-5">
                <span className="text-white/40 block text-[10px] uppercase">// IN VERIFICATION</span>
                <span className="font-bold text-3xl text-amber-400 mt-1 block">
                  {roleApplicants.filter((c) => c.status === 'VERIFYING').length}
                </span>
              </div>

              <div className="border border-white/15 bg-white/[0.02] p-5">
                <span className="text-white/40 block text-[10px] uppercase">// INTERVIEW READY</span>
                <span className="font-bold text-3xl text-emerald-400 mt-1 block">
                  {roleApplicants.filter((c) => c.status === 'INSPECTED').length}
                </span>
              </div>
            </div>

            {/* Interactive Application Funnel */}
            <div className="border-2 border-white bg-black p-8 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/20">
                <span className="font-bold text-sm text-white uppercase tracking-wider">
                  // HIRING PIPELINE FUNNEL (CLICK STAGE TO FILTER APPLICANTS)
                </span>
                <span className="text-xs text-white/50">{roleApplicants.length} TOTAL APPLICANTS</span>
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
                  <span className="font-bold text-2xl text-white">{roleApplicants.length}</span>
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
                  <span className="font-bold text-2xl text-white">
                    {roleApplicants.filter((c) => c.status === 'RECEIVED').length}
                  </span>
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
                  <span className="font-bold text-2xl text-amber-400">
                    {roleApplicants.filter((c) => c.status === 'VERIFYING').length}
                  </span>
                  <div className="h-1 bg-amber-400 mt-3" />
                </button>

                <button
                  onClick={() => {
                    setFunnelFilter('INSPECTED');
                    setActiveTab('APPLICANTS');
                  }}
                  className="border border-white/20 bg-white/[0.02] p-4 text-white hover:border-primary hover:bg-primary/10 transition-colors"
                >
                  <span className="text-[10px] block uppercase mb-1">INTERVIEW READY</span>
                  <span className="font-bold text-2xl text-emerald-400">
                    {roleApplicants.filter((c) => c.status === 'INSPECTED').length}
                  </span>
                  <div className="h-1 bg-emerald-400 mt-3" />
                </button>
              </div>
            </div>

            {/* Candidate Applications */}
            <div className="border-2 border-white/20 bg-black p-6 font-mono">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-sm text-white uppercase tracking-wider">
                    // CANDIDATE APPLICATIONS (LIVE AUDIT)
                  </span>
                </div>
                {roleApplicants.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('APPLICANTS')}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    View All Applicants ({roleApplicants.length}) →
                  </button>
                )}
              </div>

              {roleApplicants.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/15 bg-white/[0.01]">
                  <p className="text-white/50 text-xs">No candidates have applied to this role yet.</p>
                  <p className="text-white/30 text-[11px] mt-1">Applications submitted via the candidate portal or MCP network will appear here.</p>
                </div>
              ) : (
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
                            Inspection: <span className="text-primary font-bold">{cand.status}</span>
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
              )}
            </div>

            {/* Requirement overview */}
            <div className="grid lg:grid-cols-2 gap-8 font-mono text-xs">
              <div className="border border-white/15 bg-black p-8">
                <h3 className="font-bold text-base uppercase mb-6 text-white pb-3 border-b border-white/10">
                  // ROLE TECHNICAL SPECIFICATION
                </h3>

                <div className="space-y-3">
                  <div className="p-3 border border-white/10 bg-white/[0.02]">
                    <span className="text-white/40 text-[10px] uppercase block mb-1">REQUIRED SKILLS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredSkills?.length > 0 ? (
                        role.requiredSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 border border-primary/40 bg-primary/10 text-primary font-bold">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 italic">None specified</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border border-white/10 bg-white/[0.02]">
                    <span className="text-white/40 text-[10px] uppercase block mb-1">PREFERRED SKILLS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.preferredSkills?.length > 0 ? (
                        role.preferredSkills.map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 border border-white/10 bg-white/[0.03] text-white/70">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-white/40 italic">None specified</span>
                      )}
                    </div>
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
                  {role.activity && role.activity.length > 0 ? (
                    role.activity.map((act, idx) => (
                      <div key={idx} className="border-b border-white/10 pb-2 last:border-0">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 mb-0.5">
                          <span>{act.timestamp}</span>
                          <span>·</span>
                          <span className="text-primary font-bold">[{act.type}]</span>
                        </div>
                        <p className="text-white/90 font-mono">{act.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 py-4 text-center">No activity logged for this role yet.</p>
                  )}
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

            {filteredApplicants.length === 0 ? (
              <div className="border border-dashed border-white/20 p-12 text-center">
                <p className="text-white/50 mb-2">NO CANDIDATE APPLICATIONS MATCHING FILTER</p>
                <p className="text-white/30 text-xs">Candidates will appear here after submitting an application for this requisition.</p>
              </div>
            ) : (
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
                              cand.status === 'INSPECTED'
                              ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {cand.status}
                        </span>
                      </div>

                      <div className="col-span-2 font-mono">
                        <span className="font-bold text-emerald-400 text-[10px] uppercase">Report available</span>
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
            )}
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
            <div className="p-4 border border-white/20 bg-white/[0.02] text-white/70 font-bold">
              {roleApplicants.length > 0
                ? `✓ ${roleApplicants.length} candidate verification reports compiled for ${role.title}`
                : `Awaiting candidate applications for ${role.title}.`}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'REPORTS' && (
          <div className="space-y-4 font-mono text-xs">
            {roleApplicants.length === 0 ? (
              <div className="border border-dashed border-white/20 p-12 text-center">
                <p className="text-white/50 mb-2">NO CANDIDATE REPORTS GENERATED YET</p>
                <p className="text-white/30 text-xs">Intelligence reports generated by the evaluation sandbox will appear here.</p>
              </div>
            ) : (
              roleApplicants.map((report) => (
                <div key={report.id} className="border border-white/15 bg-black p-6 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-white font-sans">{report.name}</div>
                    <div className="text-xs text-white/50">Report ID: {report.id} · Markdown inspection report</div>
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
              ))
            )}
          </div>
        )}

        {/* TAB 5: ACTIVITY */}
        {activeTab === 'ACTIVITY' && (
          <div className="border border-white/15 bg-black p-8 font-mono text-xs space-y-3">
            {role.activity && role.activity.length > 0 ? (
              role.activity.map((act, idx) => (
                <div key={idx} className="border-b border-white/10 pb-2">
                  <div className="text-[10px] text-white/40">{act.timestamp}</div>
                  <div className="text-white">{act.message}</div>
                </div>
              ))
            ) : (
              <p className="text-white/40 py-4 text-center">No activity records yet.</p>
            )}
          </div>
        )}
      </main>

      <CandidateAgentDrawer
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
