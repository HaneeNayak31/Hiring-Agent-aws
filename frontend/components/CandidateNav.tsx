// components/CandidateNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, FileCheck, Activity, User, ArrowLeft } from 'lucide-react';

const links = [
  { href: '/candidate', label: 'Overview', icon: LayoutDashboard },
  { href: '/candidate/opportunities', label: 'Opportunities', icon: Briefcase },
  { href: '/candidate/applications', label: 'Applications', icon: FileCheck },
  { href: '/candidate/activity', label: 'Agent Activity', icon: Activity },
  { href: '/candidate/profile', label: 'Profile', icon: User },
];

export default function CandidateNav() {
  const pathname = usePathname();

  return (
    <header className="bg-black text-white border-b border-white/15 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 group">
            <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-bold">
              AGENTIC
            </span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors">
              // CANDIDATE
            </span>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 font-mono text-xs">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/candidate' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 border transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-primary text-primary bg-primary/10 font-bold'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Switch to Recruiter */}
        <Link
          href="/recruiter"
          className="font-mono text-xs text-white/40 hover:text-primary transition-colors flex items-center gap-1 border border-white/10 px-3 py-1.5"
        >
          <span>Recruiter Mode</span>
          <ArrowLeft className="w-3 h-3 rotate-180" />
        </Link>
      </div>
    </header>
  );
}
