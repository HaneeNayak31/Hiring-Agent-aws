'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function CompanyControlRoomPreview() {
  return (
    <section className="bg-black text-white py-28 px-6 border-b border-white/15 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <span className="font-mono text-xs text-primary uppercase tracking-widest block mb-3 font-bold">
              // Enterprise Control Layer
            </span>
            <h2 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-none">
              YOUR HIRING
              <br />
              CONTROL ROOM.
            </h2>
          </div>

          <Link
            href="/company"
            className="px-8 py-4 bg-primary text-black font-mono text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] flex items-center gap-2 self-start md:self-auto"
          >
            Launch HR Control Room
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="border-2 border-white/30 bg-black p-6 md:p-10 font-mono shadow-[12px_12px_0px_0px_rgba(255,106,0,1)]">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-primary text-black font-bold text-xs">COMPANY PLATFORM</span>
              <span className="text-xs text-white/50">// STRIPE HIRING ENGINE</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MCP SERVER ONLINE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 text-xs">
            <div className="border border-white/15 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">ACTIVE ROLES</span>
              <span className="font-bold text-2xl text-white">12</span>
            </div>
            <div className="border border-white/15 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">APPLICATIONS</span>
              <span className="font-bold text-2xl text-primary">284</span>
            </div>
            <div className="border border-white/15 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">NEW TODAY</span>
              <span className="font-bold text-2xl text-white">17</span>
            </div>
            <div className="border border-white/15 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">IN VERIFICATION</span>
              <span className="font-bold text-2xl text-amber-400">9</span>
            </div>
            <div className="border border-white/15 p-4 bg-white/[0.02]">
              <span className="text-white/40 block text-[10px]">INTERVIEW READY</span>
              <span className="font-bold text-2xl text-emerald-400">14</span>
            </div>
          </div>

          <div className="border-2 border-white bg-white/[0.03] p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 text-xs text-primary font-bold mb-1">
                  <span>REPORT AH-2841</span>
                  <span>·</span>
                  <span className="text-white/50">SOFTWARE ENGINEER</span>
                </div>
                <div className="text-2xl font-bold font-sans text-white">Hanee Nayak</div>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs">
                <div>
                  <span className="text-white/40 block text-[10px]">PROFILE FIT</span>
                  <span className="font-bold text-xl text-primary">91%</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">EVIDENCE</span>
                  <span className="font-bold text-xl text-emerald-400">87%</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed mb-4">
              Verified skills: React (96%), TypeScript (98%), AWS CDK (88%), Node.js (90%). Proof sourced from public GitHub repositories and deployed production projects.
            </p>

            <div className="flex flex-wrap gap-3 text-xs">
              <Link
                href="/company/candidates/cand-1"
                className="px-4 py-2 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition"
              >
                Inspect Evidence Graph
              </Link>
              <Link
                href="/company/candidates/cand-1/brief"
                className="px-4 py-2 border border-white/30 text-white font-bold uppercase hover:border-white transition"
              >
                Open Interview Briefing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
