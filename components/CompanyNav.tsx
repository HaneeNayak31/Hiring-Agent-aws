// components/CompanyNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileBarChart2,
  FileCheck2,
  Server,
  Settings,
  Search,
  Plus,
} from 'lucide-react';

const companyLinks = [
  { href: '/company', label: 'Overview', icon: LayoutDashboard },
  { href: '/company/roles', label: 'OPEN ROLES', icon: Briefcase, isPrimary: true },
  { href: '/company/candidates', label: 'Candidates', icon: Users },
  { href: '/company/reports', label: 'Reports', icon: FileBarChart2 },
  { href: '/company/interviews', label: 'Interview Briefs', icon: FileCheck2 },
  { href: '/company/mcp', label: 'MCP Server', icon: Server },
  { href: '/company/settings', label: 'Settings', icon: Settings },
];

export default function CompanyNav() {
  const pathname = usePathname();

  return (
    <header className="bg-black text-white border-b border-white/15 px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 group">
            <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-bold">
              AGENTIC
            </span>
            <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors uppercase">
              // HIRING CONTROL ROOM
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-mono text-xs">
          {companyLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href || (link.href !== '/company' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 border transition-all flex items-center gap-2 ${
                  link.isPrimary
                    ? isActive
                      ? 'border-primary bg-primary text-black font-extrabold shadow-[0_0_12px_rgba(255,106,0,0.5)]'
                      : 'border-primary/60 bg-primary/20 text-primary font-bold hover:bg-primary hover:text-black'
                    : isActive
                    ? 'border-white text-white bg-white/10 font-bold'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Action & MCP Status */}
        <div className="flex items-center gap-4 font-mono text-xs">
          <Link
            href="/company/roles?action=create"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-bold uppercase hover:bg-primary transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Role</span>
          </Link>

          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MCP ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
