'use client';

import { useState } from 'react';
import { Download, Printer, Copy, Check, FileText } from 'lucide-react';
import { API_BASE_URL } from '@/data/apiClient';

interface ReportQuickViewProps {
  sessionId: string;
  markdownContent: string;
  candidateName: string;
  roleTitle: string;
}

export default function ReportQuickView({
  sessionId,
  markdownContent,
  candidateName,
  roleTitle,
}: ReportQuickViewProps) {
  const [copied, setCopied] = useState(false);
  const downloadUrl = `${API_BASE_URL}/api/reports/${sessionId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  const sections = [
    { title: 'Scope & Evidence', id: 'scope-and-evidence-basis' },
    { title: 'Executive Assessment', id: 'executive-assessment' },
    { title: '1. Architecture', id: '1-repository-and-architecture' },
    { title: '2. Git Forensics', id: '2-git-forensics' },
    { title: '3. Test Rigor', id: '3-test-rigor' },
    { title: '4. Security & Hygiene', id: '4-security-secrets-and-dependency-hygiene' },
    { title: '5. Evidence Strengths', id: '5-strengths-supported-by-evidence' },
    { title: '6. Interview Questions', id: '6-tailored-interview-questions' },
    { title: 'Limitations', id: 'missing-or-unverified-evidence' },
  ];

  const renderFormattedMarkdown = (content: string) => {
    if (!content) {
      return (
        <div className="p-8 text-center text-white/40 font-mono text-xs">
          Loading published intelligence report...
        </div>
      );
    }

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = (key: number) => {
      if (currentParagraph.length > 0) {
        elements.push(
          <p key={`p-${key}`} className="text-white/80 font-sans text-xs leading-relaxed mb-4">
            {currentParagraph.join(' ')}
          </p>
        );
        currentParagraph = [];
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (trimmed.startsWith('# ')) {
        flushParagraph(idx);
        elements.push(
          <div key={`h1-${idx}`} className="border-b border-white/20 pb-3 mb-6 mt-4">
            <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest block mb-1">
              // CANDIDATE INTELLIGENCE REPORT
            </span>
            <h1 className="text-2xl font-bold font-sans text-white uppercase tracking-tight">
              {trimmed.replace('# ', '')}
            </h1>
          </div>
        );
      } else if (trimmed.startsWith('## ')) {
        flushParagraph(idx);
        const sectionTitle = trimmed.replace('## ', '');
        const slug = sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        elements.push(
          <div key={`h2-${idx}`} id={slug} className="pt-6 pb-2 mb-3 border-b border-white/10 scroll-mt-6">
            <h2 className="text-sm font-bold font-mono text-primary uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>{sectionTitle}</span>
            </h2>
          </div>
        );
      } else if (trimmed.startsWith('### ')) {
        flushParagraph(idx);
        elements.push(
          <h3 key={`h3-${idx}`} className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wide mt-4 mb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushParagraph(idx);
        elements.push(
          <div key={`li-${idx}`} className="flex items-start gap-2 text-xs font-sans text-white/80 mb-2 pl-2">
            <span className="text-primary font-bold">▪</span>
            <span>{trimmed.replace(/^[-*]\s+/, '')}</span>
          </div>
        );
      } else if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph(idx);
        elements.push(
          <div key={`oli-${idx}`} className="flex items-start gap-2.5 text-xs font-sans text-white/90 mb-3 p-2.5 bg-white/[0.02] border border-white/10 rounded-sharp">
            <span className="px-1.5 py-0.5 bg-primary/20 text-primary font-mono text-[10px] font-bold shrink-0">
              {trimmed.match(/^\d+/)?.[0]}
            </span>
            <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
          </div>
        );
      } else if (trimmed === '') {
        flushParagraph(idx);
      } else {
        currentParagraph.push(trimmed);
      }
    });

    flushParagraph(lines.length);
    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-black border border-white/15 text-white font-sans overflow-hidden">
      <div className="p-3 bg-white/[0.02] border-b border-white/15 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="font-bold text-white uppercase text-[11px]">
            REPORT: {candidateName.toUpperCase()}
          </span>
          <span className="text-[10px] text-white/40">({roleTitle})</span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            download="candidate_intelligence_report.md"
            className="px-3 py-1.5 bg-primary text-black font-bold uppercase text-[10px] hover:bg-primary/90 transition shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>DOWNLOAD .MD</span>
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white text-[10px] font-bold uppercase transition flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white text-[10px] font-bold uppercase transition flex items-center gap-1"
          >
            <Printer className="w-3 h-3" />
            <span>PRINT</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2 bg-black border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-[10px]">
        <span className="text-white/40 uppercase shrink-0">JUMP:</span>
        {sections.map((sec, idx) => (
          <a
            key={idx}
            href={`#${sec.id}`}
            className="px-2 py-0.5 bg-white/[0.03] hover:bg-primary/20 border border-white/10 hover:border-primary text-white/70 hover:text-white whitespace-nowrap transition-colors"
          >
            {sec.title}
          </a>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-2 selection:bg-primary selection:text-black">
        {renderFormattedMarkdown(markdownContent)}
      </div>
    </div>
  );
}
