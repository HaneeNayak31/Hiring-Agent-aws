'use client';

import { Terminal, Code, Activity, Loader2, Copy, Check, Server, ExternalLink } from 'lucide-react';
import { CompanyNav, Breadcrumbs } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { mockMCPTools, mockMCPLogs, MCPTool, OpenRole } from '@/data/mockData';
import { fetchJobs, fetchApplications, ApiError } from '@/data/apiClient';
import { mapJobDetailToOpenRole } from '@/data/schemaAdapter';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
// import { Terminal, Code, Activity, Loader2 } from 'lucide-react';
const REAL_MCP_URL = 'https://h6aggmskk4.execute-api.ap-south-1.amazonaws.com/mcp';

export default function InfrastructureMCPPage() {
  const [selectedTool, setSelectedTool] = useState<MCPTool>(mockMCPTools[0]);
  const [roles, setRoles] = useState<OpenRole[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetchJobs(),
        fetchApplications(),
      ]);
      if (jobsRes) {
        setRoles(jobsRes.map(mapJobDetailToOpenRole));
      }
      if (appsRes) {
        setApplicationsCount(appsRes.length);
      }
    } catch (err: any) {
      setApiError(err instanceof ApiError ? err : (err?.message || 'Failed to load MCP infrastructure data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Breadcrumbs items={[{ label: 'INFRASTRUCTURE' }]} />

        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <div className="flex items-center gap-3 text-xs text-primary mb-2 font-bold uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>COMPANY MODEL CONTEXT PROTOCOL (MCP) INFRASTRUCTURE</span>
            </div>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              INFRASTRUCTURE
            </h1>
          </div>

          <div className="text-xs text-white/50 border border-white/15 p-4 bg-white/[0.02]">
            <div>PROTOCOL: <span className="text-white font-bold">AWS Lambda HTTP API Gateway</span></div>
            <div>STATUS: <span className="text-emerald-400 font-bold">● ONLINE (v1.4)</span></div>
          </div>
        </div>

        <ApiErrorBanner
          error={apiError}
          onRetry={loadData}
          title="Infrastructure Telemetry Sync Error"
          className="mb-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 font-mono text-xs">
          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// EXPOSED ROLES</span>
            <span className="font-bold text-4xl text-primary mt-1 block">{roles.length}</span>
            <span className="text-white/50 text-[11px] mt-2 block">Live requisitions querying DynamoDB</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// MCP TOOLS ACTIVE</span>
            <span className="font-bold text-4xl text-white mt-1 block">{mockMCPTools.length}</span>
            <span className="text-white/50 text-[11px] mt-2 block">Protocol queries & capability evaluations</span>
          </div>

          <div className="border border-white/15 bg-white/[0.02] p-6">
            <span className="text-white/40 block text-[10px] uppercase">// APPLICATIONS VIA AGENTS</span>
            <span className="font-bold text-4xl text-emerald-400 mt-1 block">{applicationsCount}</span>
            <span className="text-white/50 text-[11px] mt-2 block">Candidate evidence records registered</span>
          </div>
        </div>

        {/* Live MCP Gateway Endpoint Display & Copy */}
        <div className="border-2 border-primary/50 bg-gradient-to-r from-primary/10 via-black to-black p-6 mb-10 font-mono text-xs shadow-[6px_6px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold uppercase text-[11px] mb-1">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>PRIMARY PRODUCTION MCP GATEWAY ENDPOINT</span>
              </div>
              <a
                href={REAL_MCP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm md:text-base font-bold text-white hover:text-primary transition break-all inline-flex items-center gap-1.5"
              >
                <span>{REAL_MCP_URL}</span>
                <ExternalLink className="w-3.5 h-3.5 text-white/50" />
              </a>
            </div>

            <button
              onClick={() => {
                navigator?.clipboard?.writeText(REAL_MCP_URL);
                setCopiedEndpoint(true);
                setTimeout(() => setCopiedEndpoint(false), 2000);
              }}
              className={`px-6 py-3 font-bold uppercase text-xs tracking-wider transition flex items-center justify-center gap-2 shrink-0 ${copiedEndpoint
                ? 'bg-emerald-400 text-black'
                : 'bg-primary text-black hover:bg-primary/90'
                }`}
            >
              {copiedEndpoint ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY MCP URL</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border border-white/15 bg-black p-8 font-mono text-xs mb-12">
          <h2 className="font-bold text-sm uppercase text-white mb-4 pb-3 border-b border-white/10">
            // EXPOSED HIRING REQUISITION ENDPOINTS
          </h2>
          {isLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-white/50">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span>Checking active roles...</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-white/15">
              <p className="text-white/40 mb-3">NO HIRING REQUISITIONS EXPOSED YET</p>
              <Link
                href="/company/roles"
                className="px-4 py-2 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-block"
              >
                + Create First Role
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((r) => (
                <div key={r.id} className="p-4 border border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white font-sans text-sm">{r.title}</div>
                    <div className="text-[10px] text-white/40">{r.mcpEndpoint}</div>
                  </div>
                  <span className={`px-2 py-0.5 font-bold uppercase text-[10px] border ${r.mcpExposed ? 'border-emerald-500/40 text-emerald-400' : 'border-amber-500/40 text-amber-400'}`}>
                    {r.mcpExposed ? '● PUBLIC TO AGENTS' : '○ PAUSED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-2 border-white bg-black p-8 mb-12 font-mono shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Code className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm uppercase text-white tracking-wider">
                EXPOSED MCP TOOLS & CAPABILITY INSPECTOR
              </span>
            </div>
            <span className="text-xs text-white/40">{mockMCPTools.length} CAPABILITIES EXPOSED</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {mockMCPTools.map((tool) => {
              const isSelected = selectedTool.name === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-4 border text-left transition-all ${isSelected
                    ? 'border-primary bg-primary text-black font-bold shadow-[0_0_15px_rgba(255,106,0,0.3)]'
                    : 'border-white/20 bg-white/[0.02] text-white hover:border-white/50'
                    }`}
                >
                  <div className="text-xs uppercase mb-1.5 font-mono font-bold tracking-tight">{tool.name}</div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="opacity-80 font-mono tracking-wider">{tool.category}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border border-white/20 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <Terminal className="w-5 h-5" />
                <span>tool: {selectedTool.name}</span>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold">
                ENABLED & ACTIVE
              </span>
            </div>

            <p className="text-xs text-white/80 font-sans leading-relaxed">
              {selectedTool.description}
            </p>

            <div className="grid md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="border border-white/10 bg-black p-4">
                <span className="text-white/40 block text-[10px] uppercase mb-2">// INPUT PARAMETERS SCHEMA</span>
                <div className="space-y-1 text-white font-mono text-[11px]">
                  {selectedTool.inputParams.map((param, pIdx) => (
                    <div key={pIdx} className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      <span>{param}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-white/10 bg-black p-4">
                <span className="text-white/40 block text-[10px] uppercase mb-2">// OUTPUT PAYLOAD FIELDS</span>
                <div className="space-y-1 text-emerald-400 font-mono text-[11px]">
                  {selectedTool.outputFields.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-white/15 bg-black p-8 font-mono">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/15">
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase">
              <Activity className="w-4 h-4 text-primary" />
              <span>LIVE MCP AGENT TELEMETRY STREAM</span>
            </div>
            <span className="text-xs text-white/40">REAL-TIME EVENTS</span>
          </div>

          <div className="space-y-4">
            {mockMCPLogs.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs border border-dashed border-white/10">
                No external MCP agent calls recorded yet. Activity will stream here when candidate evaluation agents execute.
              </div>
            ) : (
              mockMCPLogs.map((log) => (
                <div
                  key={log.id}
                  className="border-b border-white/10 pb-4 last:border-0 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-white/40 shrink-0">{log.timestamp}</span>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/40 font-bold shrink-0">
                      {log.toolName}
                    </span>
                    <div>
                      <span className="text-white font-bold">{log.agentName}</span>
                      <span className="text-white/50"> · {log.roleTarget}</span>
                      <p className="text-white/70 font-sans mt-1">{log.details}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
