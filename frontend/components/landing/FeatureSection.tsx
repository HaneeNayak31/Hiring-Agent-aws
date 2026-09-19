'use client';

import { motion } from 'framer-motion';
import { Network, Terminal, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    num: '01',
    title: 'MULTI-AGENT CODE FORENSICS',
    icon: Network,
    subtitle: 'No self-reported claims. Only authentic repo proof.',
    description:
      'Skills and commit habits are automatically validated against candidate GitHub repositories. Specialized agents inspect commit frequencies, author history, and SOLID architecture principles.',
    href: '/company/candidates',
    actionText: 'Explore Talent Registry',
  },
  {
    num: '02',
    title: 'OPENTELEMETRY FLIGHT RECORDER',
    icon: Terminal,
    subtitle: 'Real-time multi-agent execution telemetry.',
    description:
      'Inspect millisecond-level execution traces. In-memory SSE streaming synthesizes complete OTLP JSON hierarchies with zero eventual consistency delay, capturing every subagent tool call and token metric.',
    href: '/company/mcp',
    actionText: 'Inspect Protocol Traces',
  },
  {
    num: '03',
    title: 'INTERVIEW INTELLIGENCE DOSSIER',
    icon: FileText,
    subtitle: 'Zero-fluff briefing packets for engineering leads.',
    description:
      'Recruiters and hiring managers receive pre-compiled technical dossiers highlighting confirmed engineering competencies, verified repository proofs, and targeted technical interview questions.',
    href: '/company/reports',
    actionText: 'Review Intelligence Reports',
  },
];

export default function FeatureSection() {
  return (
    <section className="bg-offWhite text-black py-28 px-6 border-b border-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20">
          <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-3">
            // Core Architecture
          </span>
          <h2 className="font-bold text-4xl md:text-6xl tracking-tighter uppercase leading-none">
            DESIGNED FOR
            <br />
            MAXIMUM TRUST.
          </h2>
        </div>

        <div className="space-y-12">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="border-2 border-black bg-white p-8 md:p-12 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(255,106,0,1)] transition-all"
              >
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-mono text-xs font-bold px-2 py-1 bg-black text-white">
                      {feat.num}
                    </span>
                    <IconComponent className="w-5 h-5 text-primary" />
                    <span className="font-mono text-xs uppercase tracking-wider text-black/50">
                      {feat.subtitle}
                    </span>
                  </div>

                  <h3 className="font-bold text-2xl md:text-4xl tracking-tight mb-4 uppercase">
                    {feat.title}
                  </h3>

                  <p className="text-black/70 text-sm md:text-base leading-relaxed font-sans">
                    {feat.description}
                  </p>
                </div>

                <Link
                  href={feat.href}
                  className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider uppercase px-6 py-4 bg-black text-white hover:bg-primary hover:text-black transition-colors shrink-0"
                >
                  {feat.actionText}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
