// app/company/page.tsx
'use client';

import CompanyNav from '@/components/CompanyNav';
import { CompanyStats, mockRoles, mockMCPLogs } from '@/data/mockData';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Activity, Server, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateRoleDrawer from '@/components/CreateRoleDrawer';

export default function CompanyDashboard() {
  const [rolesList, setRolesList] = useState(mockRoles);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

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
        {/* Header */}
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary uppercase tracking-widest mb-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COMPANY HIRING EXECUTIVE SUMMARY</span>
            </div>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              HIRING OVERVIEW
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCreateDrawerOpen(true)}
              className="px-6 py-3 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ CREATE ROLE</span>
            </button>

            <div className="font-mono text-[11px] text-white/50 border border-white/20 p-3 bg-black flex flex-col gap-1.5 hidden sm:flex">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>MCP SERVER: <span className="text-white font-bold tracking-tight">mcp.stripe.com/hiring</span></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>CONNECTIONS: <span className="text-primary font-bold">24 AGENTS</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: EXECUTIVE METRICS SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 font-mono text-xs">
          <div className="border border-primary bg-primary/5 p-6 shadow-[4px_4px_0px_0px_rgba(255,106,0,0.5)] flex flex-col justify-between">
            <span className="text-primary font-bold block text-[10px] uppercase tracking-widest mb-4">// ACTIVE ROLES</span>
            <span className="font-bold text-5xl text-primary block leading-none">{rolesList.filter((r) => r.status === 'OPEN').length}</span>
          </div>

          <div className="border border-white/20 bg-black p-6 flex flex-col justify-between">
            <span className="text-white/40 block text-[10px] uppercase tracking-widest mb-4">// TOTAL APPLICATIONS</span>
            <span className="font-bold text-4xl text-white block leading-none">{CompanyStats.totalApplications}</span>
          </div>

          <div className="border border-white/20 bg-black p-6 flex flex-col justify-between">
            <span className="text-white/40 block text-[10px] uppercase tracking-widest mb-4">// IN VERIFICATION</span>
            <span className="font-bold text-4xl text-amber-400 block leading-none">{CompanyStats.inVerification}</span>
          </div>

          <div className="border border-white/20 bg-black p-6 flex flex-col justify-between">
            <span className="text-white/40 block text-[10px] uppercase tracking-widest mb-4">// INTERVIEW READY</span>
            <span className="font-bold text-4xl text-emerald-400 block leading-none">{CompanyStats.interviewReady}</span>
          </div>
        </div>

        {/* SECTION 7: ACTIVE ROLES — MAIN CONTENT AREA */}
        <div className="mb-14">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15 font-mono">
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-2xl uppercase tracking-tight text-white">ACTIVE HIRING ENDPOINTS (ROLES)</h2>
            </div>
            <Link href="/company/roles" className="text-xs text-primary font-bold hover:underline">
              View All Roles ({rolesList.length}) →
            </Link>
          </div>

          <div className="space-y-4 font-mono">
            {rolesList.map((role, idx) => (
              <div
                key={role.id}
                className="border-2 border-white/20 bg-black p-6 md:p-8 hover:border-primary transition-all relative shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
                  {/* Left: Index, Title, Context */}
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
                          <span key={sIdx} className="px-2.5 py-0.5 border border-white/10 bg-white/[0.03] text-white/70">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex flex-wrap items-center gap-10 shrink-0">
                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-white/40 block mb-1 tracking-widest">APPLICANTS</span>
                      <span className="font-bold text-3xl text-white">{role.applicationsCount}</span>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-white/40 block mb-1 tracking-widest">VIA AGENTS</span>
                      <span className="font-bold text-3xl text-primary">{role.agentApplicationsCount}</span>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-white/40 block mb-1 tracking-widest">VERIFYING</span>
                      <span className="font-bold text-3xl text-amber-400">{role.inVerificationCount}</span>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-white/40 block mb-1 tracking-widest">INTERVIEW READY</span>
                      <span className="font-bold text-3xl text-emerald-400">{role.interviewReadyCount}</span>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-3 border-l border-white/15 pl-8 ml-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-bold uppercase border tracking-widest ${
                          role.status === 'OPEN'
                            ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                            : 'border-amber-500 text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        ● {role.status}
                      </span>

                      <Link
                        href={`/company/roles/${role.id}`}
                        className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition-all flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(255,106,0,1)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(255,106,0,1)]"
                      >
                        OPEN ROLE →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Subtle Footer */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-white/40">
                  <div className="flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-primary" />
                    <span>MCP ENDPOINT: {role.mcpEndpoint}</span>
                  </div>

                  <span className="text-emerald-500 font-bold tracking-widest">
                    {role.mcpExposed ? 'MCP ● EXPOSED' : '○ PAUSED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: RECENT ACTIVITY (SMALL CONTENT AREA) */}
        <div className="border border-white/15 bg-black p-8 font-mono">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/15">
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase">
              <Activity className="w-4 h-4 text-primary" />
              <span>RECENT SYSTEM ACTIVITY</span>
            </div>
            <Link href="/company/mcp" className="text-xs text-white/40 hover:text-white">
              Infrastructure Telemetry →
            </Link>
          </div>

          <div className="space-y-4 text-xs mt-6">
            {mockMCPLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="border-b border-white/10 pb-3 last:border-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-white/40 w-20">{log.timestamp}</span>
                  <span className="text-primary font-bold min-w-[100px]">[{log.toolName}]</span>
                  <span className="text-white/80">{log.details}</span>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold tracking-widest">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <CreateRoleDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        onSave={handleCreateRole}
      />
    </div>
  );
}
