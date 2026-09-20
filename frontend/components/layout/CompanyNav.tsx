'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileBarChart2,
  Server,
  Search,
  Plus,
  Settings,
} from 'lucide-react';
import CommandPalette from '@/components/layout/CommandPalette';

const companyLinks = [
  { href: '/company', label: 'OVERVIEW', icon: LayoutDashboard },
  { href: '/company/roles', label: 'ROLES', icon: Briefcase, isPrimary: true },
  { href: '/company/candidates', label: 'TALENT', icon: Users },
  { href: '/company/reports', label: 'REPORTS', icon: FileBarChart2 },
  { href: '/company/mcp', label: 'INFRASTRUCTURE', icon: Server },
];

export default function CompanyNav() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="bg-black text-white border-b border-white/15 px-6 py-3.5 sticky top-0 z-40 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2 group">
              <span className="px-2 py-0.5 bg-primary text-black font-mono text-xs font-bold">
                AGENTIC
              </span>
              <span className="px-1.5 py-0.5 border border-white/20 bg-white/5 text-[9px] text-white/70 uppercase tracking-widest hidden md:inline">
                Demo Workspace
              </span>
              <span className="font-mono text-xs text-white/50 group-hover:text-white transition-colors uppercase hidden lg:inline">
                // HIRING CONTROL ROOM
              </span>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1 text-xs">
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
                        ? 'border-primary bg-primary text-black font-extrabold shadow-[0_0_15px_rgba(255,106,0,0.4)]'
                        : 'border-primary/50 bg-primary/10 text-primary font-bold hover:bg-primary hover:text-black hover:shadow-[0_0_15px_rgba(255,106,0,0.4)]'
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

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-white/[0.04] border border-white/15 px-3 py-1.5 text-white/50 hover:border-white/40 transition"
            >
              <Search className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[11px]">Search...</span>
              <kbd className="px-1.5 py-0.5 bg-white/10 text-[10px] text-white/70 font-mono">⌘K</kbd>
            </button>

            <Link
              href="/company/roles/create"
              className="px-4 py-2 bg-primary text-black font-bold uppercase hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ CREATE ROLE</span>
            </Link>

            <Link
              href="/company/settings"
              title="Company Settings"
              className="p-1.5 border border-white/15 text-white/50 hover:text-white hover:border-white transition"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MCP ONLINE</span>
            </div>
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
