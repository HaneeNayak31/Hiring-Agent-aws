'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { CandidateNav } from '@/components/layout';
import ApiErrorBanner from '@/components/layout/ApiErrorBanner';
import { fetchJobs, ApiError } from '@/data/apiClient';

export default function OpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFitFilter, setSelectedFitFilter] = useState<'ALL' | 'HIGH' | 'MED'>('ALL');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const loadOpportunities = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetchJobs();
      const liveJobs = (res || []).map((j: any) => ({
        id: j.job_id || j.id,
        title: j.title || 'Software Engineer',
        company: 'Acme Corp',
        location: j.location || 'Remote',
        salary: j.salary_range || 'Competitive',
        profileFit: 92,
        requirements: (j.required_skills || ['Python', 'TypeScript', 'AWS']).map((s: string) => ({
          name: s,
          matched: true,
        })),
        mcpServer: j.mcp_endpoint || `mcp.stripe.com/hiring/${j.job_id || j.id}`,
      }));
      setJobs(liveJobs);
    } catch (err: any) {
      setApiError(err instanceof ApiError ? err : (err?.message || 'Failed to load opportunities'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [loadOpportunities]);

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedFitFilter === 'HIGH') return matchesSearch && (job.profileFit ?? 90) >= 90;
    if (selectedFitFilter === 'MED') return matchesSearch && (job.profileFit ?? 90) < 90;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="border-b border-white/15 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-2">
              // Autonomous Matching Engine
            </span>
            <h1 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase">
              OPPORTUNITIES
            </h1>
          </div>

          <div className="font-mono text-xs text-white/50">
            SHOWING <span className="text-primary font-bold">{filteredJobs.length}</span> DISCOVERED ROLES
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12 font-mono text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search position or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/20 pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-primary transition"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setSelectedFitFilter('ALL')}
              className={`px-4 py-3 border ${
                selectedFitFilter === 'ALL'
                  ? 'border-primary text-primary bg-primary/10 font-bold'
                  : 'border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              ALL MATCHES
            </button>
            <button
              onClick={() => setSelectedFitFilter('HIGH')}
              className={`px-4 py-3 border ${
                selectedFitFilter === 'HIGH'
                  ? 'border-primary text-primary bg-primary/10 font-bold'
                  : 'border-white/20 text-white/60 hover:border-white/40'
              }`}
            >
              HIGH FIT (≥90%)
            </button>
          </div>
        </div>

        <ApiErrorBanner
          error={apiError}
          onRetry={loadOpportunities}
          title="Opportunities Search Failed"
          className="mb-8"
        />

        <div className="space-y-6">
          {isLoading ? (
            <div className="p-16 text-center font-mono flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <span className="text-white/50 text-xs">Scanning available opportunities...</span>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="border border-dashed border-white/20 p-12 text-center font-mono">
              <div className="text-primary text-xs font-bold uppercase mb-2">
                {apiError ? '// CLOUD CONNECTION ERROR' : '// NO DISCOVERED ROLES'}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {apiError ? 'FAILED TO RETRIEVE OPPORTUNITIES' : 'NO OPEN OPPORTUNITIES'}
              </h3>
              <p className="text-white/50 text-xs max-w-md mx-auto mb-6">
                {apiError
                  ? 'Unable to communicate with the opportunities discovery service. Please verify your connection.'
                  : 'No active job requisitions were found in the database. When the company creates a role, candidate agents discover it automatically.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedFitFilter('ALL');
                  }}
                  className="text-xs text-primary underline"
                >
                  Reset Search Filters
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job: any, idx: number) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="border-b border-white/15 pb-8 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/60 transition-colors"
              >
                <div className="flex items-start gap-6 max-w-2xl">
                  <span className="font-mono text-lg font-bold text-white/40 group-hover:text-primary transition-colors">
                    0{idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-3 text-xs font-mono mb-2">
                      <span className="font-bold text-primary">{job.company}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/60">{job.location}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-emerald-400">{job.salary}</span>
                    </div>

                    <h3 className="font-bold text-2xl md:text-3xl tracking-tight text-white mb-4 group-hover:translate-x-1 transition-transform">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap gap-2 font-mono text-[11px]">
                      {(job.requirements || []).map((req: any, rIdx: number) => (
                        <span
                          key={rIdx}
                          className={`px-2.5 py-1 border flex items-center gap-1.5 ${
                            req.matched
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-white/10 text-white/40'
                          }`}
                        >
                          {req.name}
                          {req.matched ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/10 pt-4 md:pt-0 shrink-0">
                  <div className="text-left md:text-right font-mono">
                    <div className="text-[10px] text-white/40 tracking-wider">PROFILE FIT</div>
                    <div className="font-bold text-3xl text-primary">{job.profileFit}%</div>
                  </div>

                  <Link
                    href={`/candidate/opportunities/${job.id}`}
                    className="px-6 py-3 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary transition flex items-center gap-2"
                  >
                    View Opportunity
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
