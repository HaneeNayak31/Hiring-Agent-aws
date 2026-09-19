'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 font-mono text-[11px] text-white/50 mb-6 uppercase tracking-wider">
      <Link href="/company" className="hover:text-primary transition-colors flex items-center gap-1">
        <Home className="w-3 h-3" />
        <span>CONTROL ROOM</span>
      </Link>

      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-white/30" />
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-primary font-bold">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
