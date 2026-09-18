// components/RecruiterNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Network, FileCheck2, ArrowLeft, ShieldCheck } from 'lucide-react';

const links = [
  { href: '/recruiter', label: 'Overview', icon: Users },
  { href: '/recruiter/candidates', label: 'Candidates', icon: Users },
  { href: '/recruiter/candidates/cand-1', label: 'Evidence Workspace', icon: Network },
  { href: '/recruiter/candidates/cand-1/brief', label: 'Interview Briefing', icon: FileCheck2 },
];

export default function RecruiterNav() {
  const pathname = usePathname();

  return (
    <header className="bg-black text-white border-b border-white/15 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 group">
            <span className="px-2 py-0.5 bg-white text-black font-mono text-xs font-bold">
              AGENTIC
            </span>
            <span className="font-mono text-xs text-primary font-bold">
              // RECRUITER VERIFICATION
            </span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 font-mono text-xs">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/recruiter' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 border transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-white text-white bg-white/10 font-bold'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Switch to Candidate */}
        <Link
          href="/candidate"
          className="font-mono text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1 border border-white/10 px-3 py-1.5"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Candidate View</span>
        </Link>
      </div>
    </header>
  );
}
