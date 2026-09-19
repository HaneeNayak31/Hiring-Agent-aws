'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CompanyNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { CandidateReport } from '@/data/mockData';
import { fetchApplications, ApiError } from '@/data/apiClient';
import { mapApplicationToCandidateReport } from '@/data/schemaAdapter';

export default function CompanyApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [applications, setApplications] = useState<CandidateReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const items = await fetchApplications();
      setApplications(items.map(mapApplicationToCandidateReport));
    } catch (e: any) {
      setApiError(e instanceof ApiError ? e : (e?.message || 'Failed to fetch applications from backend'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CompanyNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 font-mono">
          <div>
            <span className="text-xs text-primary uppercase tracking-widest block mb-2 font-bold">
              // Incoming Application Queue
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase font-sans">
              APPLICATIONS
            </h1>
          </div>

          <div className="text-xs text-white/50">
            TOTAL RECEIVED: <span className="text-primary font-bold">{applications.length}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search candidate name or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/20 pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {['ALL', 'VERIFIED', 'VERIFYING', 'INTERVIEW_READY', 'REVIEW_REQUIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-3 border transition-colors ${
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

        <ApiErrorBanner
          error={apiError}
          onRetry={loadApplications}
          title="Applications Queue Sync Error"
          className="mb-8"
        />

        {isLoading ? (
          <div className="p-16 text-center font-mono flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <span className="text-white/50 text-xs">Querying DynamoDB Applications...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="border border-dashed border-white/20 p-12 text-center font-mono">
            <div className="text-primary text-xs font-bold uppercase mb-2">
              {apiError ? '// CLOUD DATA ERROR' : '// INCOMING QUEUE EMPTY'}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {apiError ? 'FAILED TO SYNC APPLICATIONS' : 'NO APPLICATIONS RECEIVED YET'}
            </h3>
            <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
              {apiError
                ? 'Unable to connect to the backend application registry. Please check your API Gateway connection and retry.'
                : 'Applications submitted by candidates or AI agents via the MCP protocol will automatically appear here with automated evaluation scores.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-primary underline"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {filteredApplications.map((app, idx) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="border border-white/15 bg-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/60 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-3 text-xs text-white/50 mb-1">
                    <span className="text-primary font-bold">{app.id}</span>
                    <span>·</span>
                    <span className="text-white/70">{app.appliedDate}</span>
                    <span>·</span>
                    <span className="text-white/40">MCP Agent Payload</span>
                  </div>

                  <Link
                    href={`/company/candidates/${app.id}`}
                    className="font-bold text-2xl font-sans text-white hover:text-primary transition"
                  >
                    {app.name}
                  </Link>
                  <div className="text-xs text-white/70 mt-1">{app.role}</div>
                </div>

                <div className="flex flex-wrap items-center gap-8 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">PROFILE FIT</span>
                    <span className="font-bold text-2xl text-primary">{app.fitScore}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block">EVIDENCE</span>
                    <span className="font-bold text-2xl text-emerald-400">{app.evidenceCoverage}%</span>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`px-3 py-1 text-xs font-bold uppercase border flex items-center gap-1.5 ${
                        app.status === 'VERIFIED'
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : app.status === 'INTERVIEW_READY'
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                      }`}
                    >
                      {app.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {app.status === 'VERIFYING' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      {app.status}
                    </span>
                  </div>

                  <Link
                    href={`/company/candidates/${app.id}`}
                    className="px-5 py-2.5 bg-white text-black font-bold text-xs uppercase hover:bg-primary transition flex items-center gap-2"
                  >
                    Inspect Evidence
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
