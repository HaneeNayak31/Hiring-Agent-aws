'use client';

import CompanyNav from '@/components/layout/CompanyNav';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { fetchApplication, ApiError } from '@/data/apiClient';
import { adaptApplicationToCandidate } from '@/data/schemaAdapter';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import HRAgentThread from '@/components/assistant-ui/HRAgentThread';
import ReportQuickView from '@/components/company/ReportQuickView';
import { useAgentEvaluation } from '@/hooks/useAgentEvaluation';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Network,
  Circle,
  HelpCircle,
  Printer,
  Bot,
  Check,
  Loader2,
} from 'lucide-react';

export default function CandidateDetailWorkspace() {
  const params = useParams();
  const candId = params?.id as string;
  const [cand, setCand] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [activeDossierTab, setActiveDossierTab] = useState<'AGENT_AUDIT' | 'EVIDENCE' | 'REPORT' | 'INTERVIEW_BRIEF'>('AGENT_AUDIT');
  const [selectedSkill, setSelectedSkill] = useState<string>('AWS');

  const loadCandidate = useCallback(async () => {
    if (!candId) return;
    setIsLoading(true);
    setNotFound(false);
    setApiError(null);
    try {
      const app = await fetchApplication(candId);
      if (app) {
        const adapted = adaptApplicationToCandidate(app);
        setCand(adapted);
        if (adapted.skills && adapted.skills.length > 0) {
          setSelectedSkill(adapted.skills[0].name);
        }
      } else {
        setNotFound(true);
      }
    } catch (e: any) {
      if (e instanceof ApiError && e.isNotFound) {
        setNotFound(true);
      } else {
        setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to load application dossier'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [candId]);

  useEffect(() => {
    loadCandidate();
  }, [loadCandidate]);

  const { sessionState, isStreaming, error, startEvaluation, loadExistingReport } = useAgentEvaluation();

  const repoUrl = cand?.repoUrl || '';
  const sessionId = cand?.agentSessionId || candId;

  useEffect(() => {
    if (!cand) return;
    async function init() {
      await loadExistingReport(sessionId, cand.name, cand.role);
    }
    init();
  }, [sessionId, cand, loadExistingReport]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center font-mono">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-white/60 text-xs">Querying application dossier from live backend...</p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono">
          <ApiErrorBanner
            error={apiError}
            onRetry={loadCandidate}
            title="Failed to Load Candidate Dossier"
            className="mb-8"
          />
          <div className="text-center">
            <Link
              href="/company/candidates"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Candidates
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !cand) {
    return (
      <div className="min-h-screen bg-black text-white font-sans">
        <CompanyNav />
        <main className="max-w-4xl mx-auto px-6 py-20 font-mono text-center">
          <div className="border border-white/20 p-12 bg-white/[0.02]">
            <div className="text-primary text-xs font-bold uppercase mb-2">// 404 NOT FOUND</div>
            <h2 className="text-2xl font-bold text-white mb-2">CANDIDATE DOSSIER NOT FOUND</h2>
            <p className="text-white/50 text-xs mb-8">
              No live application record matches ID <span className="text-primary font-bold">"{candId}"</span> in DynamoDB HiringAgent_Applications.
            </p>
            <Link
              href="/company/candidates"
              className="px-6 py-3 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Candidates
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const selectedSkillData = cand.skills?.find((s: any) => s.name === selectedSkill) || cand.skills?.[0];

  return (
    <div className="min-h-screen bg-black text-white font-sans print:bg-white print:text-black">
      <div className="print:hidden">
        <CompanyNav />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="print:hidden">
          <Breadcrumbs
            items={[
              { label: 'ROLES', href: '/company/roles' },
              { label: cand.role, href: `/company/roles/${cand.roleId || ''}` },
              { label: cand.name },
            ]}
          />
        </div>

        {/* CANDIDATE DOSSIER HEADER */}
        <div className="border-b border-white/15 pb-8 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-8 font-mono">
          <div>
            <div className="flex items-center gap-3 text-xs text-primary mb-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CANDIDATE INTELLIGENCE DOSSIER</span>
              <span>·</span>
              <span className="text-white/40">APPLICATION #{cand.id}</span>
            </div>

            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              {cand.name}
            </h1>
            <p className="text-white/60 font-mono text-sm mt-1">
              Role: <span className="text-white font-bold">{cand.role}</span> · Applied {cand.appliedDate}
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0 print:hidden">
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">REQUIREMENT ALIGNMENT</span>
              <span className="font-bold text-sm text-primary uppercase">Repository inspection</span>
            </div>
            <div className="border border-white/20 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">EVIDENCE COVERAGE</span>
              <span className="font-bold text-sm text-emerald-400 uppercase">Evidence report</span>
            </div>
          </div>
        </div>

        {/* DOSSIER WORKFLOW SEGMENTED NAVIGATION */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/15 mb-10 font-mono text-xs print:hidden">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDossierTab('AGENT_AUDIT')}
              className={`px-6 py-3 border-b-2 font-bold uppercase transition-all flex items-center gap-2 ${
                activeDossierTab === 'AGENT_AUDIT'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>00 AGENT AUDIT & COPILOT</span>
            </button>
            <button
              onClick={() => setActiveDossierTab('EVIDENCE')}
              className={`px-6 py-3 border-b-2 font-bold uppercase transition-all ${
                activeDossierTab === 'EVIDENCE'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              01 EVIDENCE GRAPH
            </button>
            <button
              onClick={() => setActiveDossierTab('REPORT')}
              className={`px-6 py-3 border-b-2 font-bold uppercase transition-all ${
                activeDossierTab === 'REPORT'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              02 CANDIDATE REPORT
            </button>
            <button
              onClick={() => setActiveDossierTab('INTERVIEW_BRIEF')}
              className={`px-6 py-3 border-b-2 font-bold uppercase transition-all ${
                activeDossierTab === 'INTERVIEW_BRIEF'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              03 INTERVIEW BRIEF
            </button>
          </div>

          <div className="flex items-center gap-3 py-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-primary" />
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* DOSSIER VIEW 0: AGENT AUDIT & COPILOT WORKSPACE */}
        {activeDossierTab === 'AGENT_AUDIT' && (
          <div className="h-[750px] mb-12">
            {sessionState ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                <div className="lg:col-span-6 h-full">
                  <HRAgentThread
                    session={sessionState}
                    candidateName={cand.name}
                    roleTitle={cand.role}
                    repoUrl={repoUrl}
                    isStreaming={isStreaming}
                    error={error}
                    onRetry={() => startEvaluation(repoUrl, '')}
                    onRunEvaluation={(instructions) => startEvaluation(repoUrl, instructions)}
                    onOpenReport={() => setActiveDossierTab('REPORT')}
                  />
                </div>
                <div className="lg:col-span-6 h-full">
                  <ReportQuickView
                    sessionId={sessionState.sessionId}
                    markdownContent={sessionState.reportMarkdown || ''}
                    candidateName={cand.name}
                    roleTitle={cand.role}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center border border-white/15 font-mono text-xs text-white/40">
                Loading Agent Evaluation Session...
              </div>
            )}
          </div>
        )}

        {/* DOSSIER VIEW 1: EVIDENCE GRAPH & SOURCE INSPECTOR */}
        {activeDossierTab === 'EVIDENCE' && (
          <div className="space-y-10 font-mono">
            {/* Source Processing Panel */}
            <div className="border border-white/15 bg-white/[0.01] p-6 text-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <span className="font-bold text-primary uppercase tracking-widest">// SOURCE PROCESSING STATUS</span>
                <span className="text-white/50">EVIDENCE: FILES, COMMANDS, AND COMMITS</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-white">RESUME ANALYZED</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-white">GITHUB ANALYZED</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black border border-white/10">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-white">PORTFOLIO ANALYZED</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-black border border-white/10 text-white/40">
                  <Circle className="w-4 h-4 text-white/30" />
                  <span>LINKEDIN (NOT PROVIDED)</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE EVIDENCE GRAPH */}
            <div className="border-2 border-white bg-black p-8 relative shadow-[8px_8px_0px_0px_rgba(255,106,0,1)]">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <Network className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm uppercase text-white tracking-wider">
                    CLAIM → EVIDENCE → SOURCE TRACEABILITY MATRIX
                  </span>
                </div>
                <span className="text-xs text-white/40">{(cand.skills || []).length} VERIFIED SIGNALS</span>
              </div>

              {/* Graph Structure */}
              <div className="py-6 flex flex-col items-center">
                <div className="flex gap-6 md:gap-12 mb-8">
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> RESUME
                  </div>
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> GITHUB REPOS
                  </div>
                  <div className="px-4 py-2 bg-white/10 border border-white/30 text-xs font-bold uppercase text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> PORTFOLIO
                  </div>
                </div>

                <div className="h-6 w-px bg-white/30 mb-2" />

                <div className="px-8 py-3 bg-primary text-black font-bold text-sm tracking-wider uppercase mb-2">
                  CANDIDATE: {cand.name.toUpperCase()}
                </div>

                <div className="h-6 w-px bg-white/30 mb-8" />

                <div className="flex flex-wrap justify-center gap-3">
                  {(cand.skills || []).map((sk: any) => {
                    const isSelected = selectedSkill === sk.name;
                    return (
                      <button
                        key={sk.name}
                        onClick={() => setSelectedSkill(sk.name)}
                        className={`px-4 py-2.5 border text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-primary text-black shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                            : sk.status === 'VERIFIED'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:border-emerald-500'
                            : 'border-amber-500/40 text-amber-400 bg-amber-500/10 hover:border-amber-500'
                        }`}
                      >
                        <span>{sk.name}</span>
                        <span className="text-[10px]">{sk.status === 'VERIFIED' ? '✓' : '⚠'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skill Proof Inspector */}
              {selectedSkillData && (
                <div className="mt-8 pt-6 border-t border-white/20 bg-white/[0.02] p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 uppercase">EVIDENCE INSPECTOR FOR:</span>
                      <span className="font-bold text-base text-primary uppercase">{selectedSkillData.name}</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-white">
                      STATUS: {selectedSkillData.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(selectedSkillData.sources || []).map((src: any, idx: any) => (
                      <div key={idx} className="border border-white/10 bg-black p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 bg-primary/20 text-primary font-bold uppercase">{src.type}</span>
                            <span className="font-bold text-white font-sans">{src.title}</span>
                          </div>
                          {src.url && (
                            <a
                              href={src.url.startsWith('http') ? src.url : `https://${src.url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              {src.url}
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-white/70 font-sans leading-relaxed">
                          &quot;{src.excerpt}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOSSIER VIEW 2: CANDIDATE REPORT */}
        {activeDossierTab === 'REPORT' && (
          <div className="border border-white/15 bg-black p-8 font-mono text-xs space-y-8">
            <div>
              <span className="text-primary font-bold block mb-2 uppercase">// 01 EXECUTIVE SUMMARY</span>
              <p className="text-white/80 font-sans text-sm leading-relaxed max-w-3xl">{cand.bio}</p>
            </div>

            <div>
              <span className="text-primary font-bold block mb-3 uppercase">// 02 VERIFIED SKILLS MATRIX</span>
              <div className="grid md:grid-cols-2 gap-4">
                {(cand.skills || []).map((sk: any, idx: any) => (
                  <div key={idx} className="p-4 border border-white/10 bg-white/[0.02] flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white text-sm font-sans">{sk.name}</div>
                      <div className="text-[10px] text-white/40">Repository evidence references</div>
                    </div>
                    <span className="text-emerald-400 font-bold text-xs">{sk.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-amber-400 font-bold block mb-3 uppercase">// 03 POTENTIAL GAP AREAS</span>
              <div className="space-y-2 font-sans text-xs">
                {(cand.potentialGaps || []).map((gap: any, idx: any) => (
                  <div key={idx} className="p-3 border border-amber-500/30 bg-amber-500/10 text-amber-200">
                    • {gap}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DOSSIER VIEW 3: INTERVIEW BRIEF */}
        {activeDossierTab === 'INTERVIEW_BRIEF' && (
          <div className="border-2 border-white bg-black p-8 font-mono space-y-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <div className="flex justify-between items-center pb-4 border-b border-white/20">
              <span className="text-primary font-bold text-xs uppercase">// CONFIDENTIAL INTERVIEWER DOSSIER</span>
              <button onClick={handlePrint} className="px-3 py-1 bg-white text-black font-bold text-xs uppercase">
                Print Brief
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-sm uppercase text-emerald-400 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMED COMPETENCIES</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(cand.skills || [])
                  .filter((s: any) => s.status === 'VERIFIED')
                  .map((sk: any, idx: any) => (
                    <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold">
                      {sk.name} ✓
                    </span>
                  ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 font-bold text-sm uppercase text-primary mb-3">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span>TARGETED INTERVIEW PROBE QUESTIONS</span>
              </div>
              <div className="space-y-4">
                {(cand.suggestedQuestions || []).map((q: any) => (
                  <div key={q.number} className="border border-white/15 bg-white/[0.02] p-5">
                    <div className="flex items-center gap-3 font-bold text-sm text-white mb-2 font-sans">
                      <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs">{q.number}</span>
                      <span>&quot;{q.question}&quot;</span>
                    </div>
                    <div className="text-xs text-white/50 pl-8 font-mono">
                      Context: {q.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
