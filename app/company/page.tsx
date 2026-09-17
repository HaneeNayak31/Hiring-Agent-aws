// app/company/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { CompanyStats, mockRoles, mockCandidateReports, mockMCPLogs } from '@/data/mockData';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Briefcase, Activity, Server, Plus, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { CreateRoleModal } from '@/components/RoleModals';

export default function CompanyDashboard() {
  const [rolesList, setRolesList] = useState(mockRoles);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateRole = (newRolePartial: any) => {
    const newRole = {
      id: `role-${rolesList.length + 1}`,
      ...newRolePartial,
    };
    setRolesList([newRole, ...rolesList]);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Banner */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-widest mb-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>STRIPE HIRING CONTROL ROOM // ACTIVE</span>
            </div>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              HIRING OVERVIEW
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-6 py-3.5 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Role</span>
            </button>

            <div className="font-mono text-xs text-white/50 border border-white/15 p-3 bg-white/[0.02]">
              <div>CONNECTED MCP: <span className="text-white font-bold">mcp.stripe.com/hiring</span></div>
              <div>AGENT CONNECTIONS: <span className="text-primary font-bold">24 AGENTS</span></div>
            </div>
          </div>
        </div>

        {/* SECTION 4: TOP METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 font-mono text-xs">
          <div className="border-2 border-primary bg-primary/10 p-5 shadow-[4px_4px_0px_0px_rgba(255,106,0,0.4)]">
            <span className="text-primary font-bold block text-[10px] uppercase">// ACTIVE ROLES</span>
            <span className="font-bold text-4xl text-primary mt-1 block">{rolesList.filter(r => r.status === 'OPEN').length}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// TOTAL APPLICATIONS</span>
            <span className="font-bold text-3xl text-white mt-1 block">{CompanyStats.totalApplications}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// VIA AI AGENTS</span>
            <span className="font-bold text-3xl text-white mt-1 block">{CompanyStats.agentApplications}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// IN VERIFICATION</span>
            <span className="font-bold text-3xl text-amber-400 mt-1 block">{CompanyStats.inVerification}</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-5">
            <span className="text-white/40 block text-[10px] uppercase">// INTERVIEW READY</span>
            <span className="font-bold text-3xl text-emerald-400 mt-1 block">{CompanyStats.interviewReady}</span>
          </div>
        </div>

        {/* SECTION 4 & 41: ACTIVE ROLES — MAIN CONTENT AREA */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15 font-mono">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-2xl uppercase tracking-tight text-white">ACTIVE ROLES MANAGEMENT</h2>
            </div>
            <Link href="/company/roles" className="text-xs text-primary font-bold hover:underline">
              View All Open Roles ({rolesList.length}) →
            </Link>
          </div>

          <div className="space-y-4 font-mono">
            {rolesList.map((role, idx) => (
              <div
                key={role.id}
                className="border-2 border-white/20 bg-black p-6 md:p-8 hover:border-primary transition-all relative shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  {/* Left: Index, Title, Dept */}
                  <div className="flex items-start gap-5">
                    <span className="font-mono text-lg font-bold text-white/40 group-hover:text-primary transition-colors">
                      0{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-3 text-xs mb-1.5">
                        <span className="font-bold text-primary">{role.department}</span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/60">{role.location}</span>
                        <span className="text-white/30">·</span>
                        <span className="text-white/50">{role.type}</span>
                      </div>

                      <Link
                        href={`/company/roles/${role.id}`}
                        className="font-bold text-3xl font-sans text-white group-hover:text-primary transition-colors tracking-tight"
                      >
                        {role.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-3 text-[11px]">
                        {role.requiredSkills.map((sk, sIdx) => (
                          <span key={sIdx} className="px-2 py-0.5 border border-white/10 bg-white/[0.03] text-white/70">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Status */}
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
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        ● {role.status}
                      </span>

                      <Link
                        href={`/company/roles/${role.id}`}
                        className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                      >
                        Open Role
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-white/50">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-primary" />
                    <span>MCP ENDPOINT: {role.mcpEndpoint}</span>
                  </div>

                  <span className="text-emerald-400 font-bold">
                    {role.mcpExposed ? '● EXPOSED TO EXTERNAL AI AGENTS' : '○ PAUSED FROM MCP'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 40: ROLE & AGENT TELEMETRY STREAM */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 border border-white/15 bg-black p-8 font-mono">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
              <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase">
                <Activity className="w-4 h-4 text-primary" />
                <span>ROLE & MCP TELEMETRY STREAM</span>
              </div>
              <span className="text-xs text-white/40">REAL-TIME EVENTS</span>
            </div>

            <div className="space-y-4 text-xs">
              {mockMCPLogs.map((log) => (
                <div key={log.id} className="border-b border-white/10 pb-3 last:border-0 last:pb-0 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-white/50 mb-1">
                      <span className="text-white font-mono">{log.timestamp}</span>
                      <span>·</span>
                      <span className="text-primary font-bold">{log.toolName}</span>
                      <span>·</span>
                      <span className="text-white/80">{log.roleTarget}</span>
                    </div>
                    <p className="text-white/80 font-sans">{log.details}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/15 bg-white/[0.01] p-8 font-mono">
            <span className="text-xs text-white/40 block mb-4">// HIRING ENDPOINT SAFETY</span>
            <div className="space-y-3 text-xs text-white/70">
              <p className="leading-relaxed font-sans">
                Roles published to the Hiring MCP protocol permit candidate AI agents to discover requirements and submit candidate evidence packets securely.
              </p>
              <div className="p-4 border border-white/10 bg-black text-primary font-bold">
                ✓ Cryptographic delegation signature verification enabled
              </div>
            </div>
          </div>
        </div>
      </main>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateRole}
      />
    </div>
  );
}
