// app/recruiter/candidates/[id]/page.tsx
'use client';

import RecruiterNav from '@/components/RecruiterNav';
import { mockCandidates } from '@/data/mockData';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Network,
  FileCheck2,
  Terminal,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Cpu,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample fallback report when backend server is starting
const SAMPLE_REPORT_FALLBACK = `
# Candidate Intelligence Report: NeuroBuilder Frontend

## Executive Assessment

**Recommendation: INTERVIEW WITH VERIFICATION FOCUS.**
The candidate demonstrates the ability to deliver a cohesive React interface for authentication, dataset inspection, neural-network configuration, and streaming training UX. The code exhibits strong feature decomposition (\`src/components/data-wrangling/*\` and \`src/components/net-builder/*\`) and practical asynchronous behavior such as cancellation of an active training request.

The principal concerns are production hardening:
- **Zero test files found in repository.**
- Bearer tokens are stored in \`localStorage\`.
- One legacy component still hard-codes a separate backend port.
- Context providers combine state management, transport, protocol parsing, and auth redirects.

## Scope and Evidence Basis

- **Repository Cloned**: \`https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git\` at \`/workspace/repo\`
- **Commit Head**: \`bb7e7bb\` (branch \`main\`)
- **Snapshot Contents**: \`package.json\`, \`package-lock.json\`, Vite & Tailwind configuration, and 35 source files under \`src\`.
- **Sandbox Environment**: Isolated Docker container with network access and tool execution capabilities.

## 1. Repository & Architecture

The application defines four core routes (\`/\`, \`/login\`, \`/model\`, \`/data-wrangling\`) wrapped in \`NNProvider\` and \`DataProvider\`:
- Authentication in \`src/AuthPage.jsx\`.
- Dataset management composed in \`src/DataWrangling.jsx\` with child components (\`UploadModal\`, \`ColumnExplorer\`, \`DatasetPreview\`).
- Neural model builder composed in \`src/NetBuilder.jsx\` with \`ConfigForm\`, \`ModelConfigSidebar\`, and \`NNArchitecturePanel\`.
`;

const SAMPLE_TRACE_FALLBACK = {
  application_id: 'app-0f00e625',
  session_id: 'sess_0f00e6251450073b006aad3d',
  candidate_repo: 'https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git',
  summary_metrics: {
    total_raw_events: 124,
    total_commands_run: 5,
    total_reasoning_steps: 4,
    artifacts_count: 1,
  },
  structured_trace: {
    reasoning_summary: 'Cloned candidate repository -> Inspected package.json -> Attempted test suite -> Analyzed React component architecture.',
    reasoning_entries: [
      {
        timestamp: '2026-09-18T20:20:02Z',
        event_type: 'agent.reasoning',
        thought: 'Candidate repository cloned. Inspecting build configuration and looking for automated test runner (vitest, jest, or pytest).'
      },
      {
        timestamp: '2026-09-18T20:20:25Z',
        event_type: 'agent.reasoning',
        thought: 'No test scripts configured in package.json. Running npm test confirmed 0 test files. Proceeding to static architecture analysis.'
      },
      {
        timestamp: '2026-09-18T20:21:10Z',
        event_type: 'agent.reasoning',
        thought: 'Component tree is modular. State management in NNProvider and DataProvider combines transport, auth, and UI state.'
      }
    ],
    commands_executed: [
      {
        timestamp: '2026-09-18T20:20:05Z',
        command: 'git clone https://github.com/JainilPatel2502/NeuroBuilder-Frontend.git /workspace/repo',
        output: "Cloning into '/workspace/repo'...\nremote: Enumerating objects: 128, done.\nHEAD is now at bb7e7bb Update frontend layout",
        exit_code: 0,
        duration_ms: 2850
      },
      {
        timestamp: '2026-09-18T20:20:18Z',
        command: 'cat /workspace/repo/package.json',
        output: '{\n  "name": "neurobuilder-frontend",\n  "private": true,\n  "version": "0.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}',
        exit_code: 0,
        duration_ms: 120
      },
      {
        timestamp: '2026-09-18T20:20:30Z',
        command: 'npm test -- --run',
        output: 'npm ERR! Missing script: "test"\nnpm ERR! A complete log of this run can be found in: /root/.npm/_logs/test.log',
        exit_code: 1,
        duration_ms: 980
      },
      {
        timestamp: '2026-09-18T20:21:05Z',
        command: 'git log --oneline -n 10',
        output: 'bb7e7bb Update frontend layout\n6e0e4c3 Refactor NNProvider context\n1d033da Add data wrangling preview\ne9c1ce0 Initial commit from prototype',
        exit_code: 0,
        duration_ms: 310
      }
    ],
    tool_calls: [
      { timestamp: '2026-09-18T20:20:04Z', tool_name: 'bash', arguments: { cmd: 'git clone ...' } },
      { timestamp: '2026-09-18T20:20:29Z', tool_name: 'bash', arguments: { cmd: 'npm test ...' } }
    ],
    published_artifacts: ['candidate_intelligence_report.md']
  }
};

export default function CandidateEvidenceWorkspace() {
  const params = useParams();
  const candId = params.id as string;
  const cand = mockCandidates.find((c) => c.id === candId) || mockCandidates[0];

  const [activeTab, setActiveTab] = useState<'graph' | 'report' | 'trace'>('report');
  const [selectedSkill, setSelectedSkill] = useState<string>('AWS');
  const [reportMarkdown, setReportMarkdown] = useState<string>(SAMPLE_REPORT_FALLBACK);
  const [traceData, setTraceData] = useState<any>(SAMPLE_TRACE_FALLBACK);
  const [expandedCommand, setExpandedCommand] = useState<number | null>(0);
  const [copiedRaw, setCopiedRaw] = useState(false);

  const selectedSkillData = cand.skills.find((s: any) => s.skill === selectedSkill) || cand.skills[0];

  // Fetch live report and trace if backend is active
  useEffect(() => {
    async function loadArtifacts() {
      try {
        const repRes = await fetch(`http://localhost:8000/api/reports/sess_0f00e6251450073b006aad3d0c6edc819e8f3bd3113331e52b`);
        if (repRes.ok) {
          const text = await repRes.text();
          if (text) setReportMarkdown(text);
        }
      } catch (e) {
        // use fallback
      }

      try {
        const traceRes = await fetch(`http://localhost:8000/api/traces/sess_0f00e6251450073b006aad3d0c6edc819e8f3bd3113331e52b`);
        if (traceRes.ok) {
          const json = await traceRes.json();
          if (json) setTraceData(json);
        }
      } catch (e) {
        // use fallback
      }
    }
    loadArtifacts();
  }, [candId]);

  const copyRawTrace = () => {
    navigator.clipboard.writeText(JSON.stringify(traceData, null, 2));
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <RecruiterNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/recruiter/candidates"
          className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO CANDIDATE ROSTER</span>
        </Link>

        {/* Candidate Identity Header */}
        <div className="border-b border-white/15 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 font-mono text-xs text-primary mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DOCKER SANDBOX VERIFIED</span>
              <span>·</span>
              <span className="text-white/40">ID: {cand.id}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              {cand.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">{cand.title} · {cand.location}</p>
          </div>

          <div className="flex items-center gap-6 font-mono shrink-0">
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">PROFILE FIT</span>
              <span className="font-bold text-3xl text-primary">{cand.profileFitScore}%</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">EVIDENCE COVERAGE</span>
              <span className="font-bold text-3xl text-emerald-400">{cand.evidenceCoverage}%</span>
            </div>
            <Link
              href={`/recruiter/candidates/${cand.id}/brief`}
              className="px-6 py-4 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Interview Briefing
            </Link>
          </div>
        </div>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex border-b border-white/20 mb-10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-3 font-bold uppercase transition flex items-center gap-2 border-b-2 ${
              activeTab === 'report'
                ? 'border-primary text-primary bg-white/[0.03]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>AI Intelligence Report</span>
          </button>

          <button
            onClick={() => setActiveTab('trace')}
            className={`px-6 py-3 font-bold uppercase transition flex items-center gap-2 border-b-2 ${
              activeTab === 'trace'
                ? 'border-primary text-primary bg-white/[0.03]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Flight Recorder (Agent Trace & Sandbox Logs)</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">LIVE</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`px-6 py-3 font-bold uppercase transition flex items-center gap-2 border-b-2 ${
              activeTab === 'graph'
                ? 'border-primary text-primary bg-white/[0.03]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Skill Evidence Graph</span>
          </button>
        </div>

        {/* TAB 1: AI CANDIDATE INTELLIGENCE REPORT */}
        {activeTab === 'report' && (
          <div className="space-y-8">
            {/* Quick Verdict Banner */}
            <div className="border border-amber-500/40 bg-amber-500/10 p-6 font-mono flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs text-amber-400 font-bold uppercase">AGENT RECOMMENDATION</div>
                  <div className="text-white font-bold text-base">INTERVIEW WITH STRONG VERIFICATION FOCUS</div>
                </div>
              </div>
              <div className="text-xs text-white/60 font-mono">
                Evaluated in Docker MicroVM · Clean Working Tree · 0 Automated Tests Detected
              </div>
            </div>

            {/* Markdown Report Display */}
            <div className="border border-white/20 bg-black p-8 font-mono leading-relaxed">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <span className="text-xs text-white/40 uppercase">DOCUMENT: candidate_intelligence_report.md</span>
                <span className="text-xs text-emerald-400 font-bold">SHA: bb7e7bb · REPO VERIFIED</span>
              </div>

              <div className="prose prose-invert max-w-none text-white/80 font-sans space-y-6 text-sm">
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-none font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {reportMarkdown}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLIGHT RECORDER (EXECUTION TRACE & TERMINAL LOGS) */}
        {activeTab === 'trace' && (
          <div className="space-y-10 font-mono">
            {/* Trace Health & Telemetry Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-white/20 bg-white/[0.02] p-4">
                <span className="text-white/40 block text-[10px] uppercase">SANDBOX ENGINE</span>
                <span className="font-bold text-lg text-emerald-400 flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Docker Container
                </span>
              </div>
              <div className="border border-white/20 bg-white/[0.02] p-4">
                <span className="text-white/40 block text-[10px] uppercase">COMMANDS EXECUTED</span>
                <span className="font-bold text-lg text-primary mt-1 block">
                  {traceData?.summary_metrics?.total_commands_run || 4} Total
                </span>
              </div>
              <div className="border border-white/20 bg-white/[0.02] p-4">
                <span className="text-white/40 block text-[10px] uppercase">REASONING STEPS</span>
                <span className="font-bold text-lg text-white mt-1 block">
                  {traceData?.summary_metrics?.total_reasoning_steps || 3} Turns
                </span>
              </div>
              <div className="border border-white/20 bg-white/[0.02] p-4">
                <span className="text-white/40 block text-[10px] uppercase">RAW EVENTS AUDITED</span>
                <span className="font-bold text-lg text-white/80 mt-1 block">
                  100% Lossless ({traceData?.summary_metrics?.total_raw_events || 124} Events)
                </span>
              </div>
            </div>

            {/* SECTION: AI REASONING CHAIN */}
            <div className="border border-white/20 bg-black p-6">
              <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-primary" />
                <span>AI AGENT REASONING CHAIN (WHAT THE AGENT THOUGHT)</span>
              </div>

              <div className="space-y-4">
                {traceData?.structured_trace?.reasoning_entries?.map((entry: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-primary/60 pl-4 py-1">
                    <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1">
                      <span className="text-primary font-bold">TURN #{idx + 1}</span>
                      <span>·</span>
                      <span>{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-white/90 font-sans leading-relaxed">
                      {entry.thought}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION: SANDBOX TERMINAL COMMANDS DRAWER */}
            <div className="border-2 border-white bg-black p-6 shadow-[6px_6px_0px_0px_rgba(255,106,0,1)]">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/20">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span>SANDBOX TERMINAL LOGS & COMMAND REPLAY</span>
                </div>
                <span className="text-xs text-white/40">CLICK COMMAND TO INSPECT STDOUT / STDERR</span>
              </div>

              <div className="space-y-3">
                {traceData?.structured_trace?.commands_executed?.map((cmd: any, idx: number) => {
                  const isExpanded = expandedCommand === idx;
                  const isSuccess = cmd.exit_code === 0;

                  return (
                    <div key={idx} className="border border-white/15 bg-white/[0.01]">
                      <button
                        onClick={() => setExpandedCommand(isExpanded ? null : idx)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-white/[0.03] transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold uppercase shrink-0 ${
                              isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            EXIT: {cmd.exit_code}
                          </span>
                          <span className="font-mono text-xs text-white truncate font-bold">$ {cmd.command}</span>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-white/40 shrink-0 ml-4">
                          <span>{cmd.duration_ms}ms</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-white/10 p-4 bg-black/90 font-mono text-xs">
                          <div className="text-[10px] text-white/40 mb-2 uppercase">TERMINAL OUTPUT (STDOUT/STDERR):</div>
                          <pre className="text-emerald-300 whitespace-pre-wrap bg-white/[0.02] p-4 border border-white/10 max-h-64 overflow-y-auto leading-relaxed">
                            {cmd.output || '(No console output recorded)'}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION: RAW TRACE AUDIT JSON */}
            <div className="border border-white/20 bg-black p-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase">
                  <Layers className="w-4 h-4 text-white/50" />
                  <span>RAW FLIGHT RECORDER JSON (S3 ARCHIVE)</span>
                </div>
                <button
                  onClick={copyRawTrace}
                  className="px-3 py-1 bg-white/10 text-white text-xs hover:bg-white/20 transition flex items-center gap-1.5"
                >
                  {copiedRaw ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRaw ? 'COPIED!' : 'COPY TRACE JSON'}</span>
                </button>
              </div>

              <p className="text-xs text-white/60 mb-4 font-sans">
                Contains complete immutable audit telemetry of all raw streaming events, timestamps, and model reasoning deltas for hiring compliance.
              </p>

              <pre className="text-[11px] text-white/70 bg-white/[0.02] p-4 border border-white/10 max-h-48 overflow-y-auto font-mono">
                {JSON.stringify(traceData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: ORIGINAL INTERACTIVE EVIDENCE GRAPH */}
        {activeTab === 'graph' && (
          <div>
            <div className="border-2 border-white bg-black p-8 mb-12 font-mono relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm uppercase text-white tracking-wider">
                    INTERACTIVE EVIDENCE GRAPH (CLICK SKILL TO INSPECT PROOF)
                  </span>
                </div>
                <span className="text-xs text-white/40">3 SOURCES · 5 VERIFIED SKILLS</span>
              </div>

              {/* Graph Visual Structure */}
              <div className="py-6 flex flex-col items-center">
                {/* Sources Row */}
                <div className="flex gap-6 md:gap-12 mb-8">
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    RESUME
                  </div>
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    GITHUB REPOS
                  </div>
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    PORTFOLIO
                  </div>
                </div>

                {/* Connecting line to candidate */}
                <div className="h-6 w-px bg-white/30 mb-2" />

                {/* Center Node: Candidate */}
                <div className="px-8 py-3 bg-primary text-black font-bold text-sm tracking-wider uppercase mb-2 shadow-[0_0_20px_rgba(255,106,0,0.3)]">
                  CANDIDATE: {cand.name.toUpperCase()}
                </div>

                {/* Connecting line to skills */}
                <div className="h-6 w-px bg-white/30 mb-8" />

                {/* Skill Nodes Selector */}
                <div className="flex flex-wrap justify-center gap-3">
                  {cand.skills.map((sk: any) => {
                    const isSelected = selectedSkill === sk.skill;
                    return (
                      <button
                        key={sk.skill}
                        onClick={() => setSelectedSkill(sk.skill)}
                        className={`px-4 py-2.5 border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                            : sk.verified
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:border-amber-500'
                        }`}
                      >
                        <span>{sk.skill}</span>
                        <span className="text-[10px]">{sk.verified ? '✓' : '⚠'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evidence Inspector Drawer */}
              <div className="mt-8 pt-6 border-t border-white/20 bg-white/[0.02] p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 uppercase">EVIDENCE INSPECTOR FOR:</span>
                    <span className="font-bold text-base text-primary uppercase">{selectedSkillData.skill}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-white font-mono">
                    CONFIDENCE: {selectedSkillData.confidence}%
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedSkillData.sources.map((src: any, idx: number) => (
                    <div key={idx} className="border border-white/10 bg-black p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-white/50 mb-1">
                          <span className="px-1.5 py-0.5 bg-primary/20 text-primary font-bold uppercase">{src.type}</span>
                          <span>Verified Claim Source</span>
                        </div>
                        <div className="text-xs font-bold text-white font-sans">{src.title}</div>
                      </div>
                      <a
                        href={`https://${src.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-primary hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>{src.url}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified Skills & Gaps Grid */}
            <div className="grid md:grid-cols-2 gap-8 font-mono">
              {/* Confirmed Skills */}
              <div className="border border-white/15 bg-black p-8">
                <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>CONFIRMED COMPETENCIES</span>
                </h3>

                <div className="space-y-4">
                  {cand.skills.filter((s: any) => s.verified).map((s: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                      <span className="text-white font-bold">{s.skill}</span>
                      <span className="text-emerald-400 font-bold">100% VERIFIED EVIDENCE</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Potential Gaps */}
              <div className="border border-white/15 bg-black p-8">
                <h3 className="font-bold text-lg uppercase mb-6 text-white pb-3 border-b border-white/10 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>POTENTIAL GAP AREAS</span>
                </h3>

                <div className="space-y-3 text-xs text-white/80 font-sans">
                  {cand.potentialGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-200">
                      {gap}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
