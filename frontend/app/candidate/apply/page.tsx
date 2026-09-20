'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { CandidateNav } from '@/components/layout';
import ApplyViaMcpCard, { REAL_MCP_URL } from '@/components/candidate/ApplyViaMcpCard';
import { fetchJobs, ApiError } from '@/data/apiClient';

export default function CandidateApplyPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchJobs();
      if (res) {
        setJobs(
          res.map((j: any) => ({
            id: j.job_id || j.id,
            title: j.title || 'Software Engineer',
            company: 'Acme Corp',
            location: j.location || 'Remote',
            salary: j.salary_range || 'Competitive',
            requiredSkills: j.required_skills || ['Python', 'AWS'],
          }))
        );
      }
    } catch (e) {
      console.error('Failed to fetch jobs for apply page', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <CandidateNav />

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/candidate/opportunities"
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXPLORE ALL OPPORTUNITIES</span>
          </Link>

          <div className="font-mono text-xs text-white/40">
            AI-NATIVE CANDIDATE PORTAL
          </div>
        </div>

        {/* Page Title */}
        <div className="border-b border-white/15 pb-8 mb-8">
          <div className="flex items-center gap-3 font-mono text-xs text-primary font-bold uppercase mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI AGENT APPLICATION INTERFACE</span>
          </div>
          <h1 className="font-bold text-4xl md:text-6xl tracking-tight uppercase mb-4">
            APPLY AS CANDIDATE
          </h1>
          <p className="text-white/60 text-base max-w-2xl font-sans">
            Welcome to the AI-native hiring protocol. Rather than manually uploading PDFs or filling forms, configure your personal AI assistant to apply directly using our standardized MCP server.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CENTERPIECE: ApplyViaMcpCard with Real Link, Copy Button, Instructions */}
        {/* ========================================================================= */}
        <ApplyViaMcpCard />

        {/* Active Open Positions to reference */}
        <div className="mt-16 pt-10 border-t border-white/15">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 font-mono text-xs text-white uppercase font-bold">
              <Briefcase className="w-4 h-4 text-primary" />
              <span>CURRENT OPEN REQUISITIONS QUERYABLE VIA MCP</span>
            </div>
            <Link
              href="/candidate/opportunities"
              className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
            >
              <span>View full list</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-8 flex items-center justify-center gap-2 text-white/50 font-mono text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Loading requisitions...</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-8 border border-dashed border-white/15 text-center font-mono text-xs text-white/40">
              No active roles found. Check back soon or create one from Company Control Room.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 font-mono text-xs">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 border border-white/15 bg-white/[0.02] flex flex-col justify-between gap-4 group hover:border-primary/60 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-white/40 mb-1">
                      <span className="text-primary font-bold">{job.company}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                      <span>·</span>
                      <span className="text-emerald-400">{job.salary}</span>
                    </div>
                    <h3 className="font-bold text-lg text-white font-sans mb-3 group-hover:text-primary transition">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 text-[10px]">
                      {job.requiredSkills.map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/70">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px]">
                    <span className="text-white/40">ID: {job.id}</span>
                    <Link
                      href={`/candidate/opportunities/${job.id}`}
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Role details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
