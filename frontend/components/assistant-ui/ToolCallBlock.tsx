'use client';

import { useState } from 'react';
import { Wrench, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { ToolCallItem } from './types';

interface ToolCallBlockProps {
  item: ToolCallItem;
}

export default function ToolCallBlock({ item }: ToolCallBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getToolDisplayName = (name: string) => {
    switch (name) {
      case 'git-forensics-evaluator':
        return 'Git Forensics & Author Audit';
      case 'solid-architecture-rubric':
        return 'SOLID Modularity & Architecture Rubric';
      case 'test-rigor-evaluator':
        return 'Test Rigor & Coverage Evaluator';
      case 'security-and-code-smells':
        return 'Security Vulnerabilities & Code Smells';
      case 'interview-question-formulation':
        return 'Technical Interview Question Generator';
      default:
        return name;
    }
  };

  const isCompleted = item.status === 'completed';

  return (
    <div className="my-2 border border-white/15 bg-black/40 rounded-sharp overflow-hidden font-mono text-xs">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Wrench className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-bold text-white text-[11px]">
            {getToolDisplayName(item.toolName)}
          </span>
          <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-white/50 rounded-sharp">
            tool: {item.toolName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Done
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-bold uppercase animate-pulse">
              Running...
            </span>
          )}

          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-3.5 border-t border-white/10 space-y-3 bg-white/[0.01]">
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">
              INPUT PARAMETERS:
            </span>
            <pre className="p-2 bg-black border border-white/10 rounded-sharp text-[10px] text-white/70 overflow-x-auto">
              {JSON.stringify(item.input, null, 2)}
            </pre>
          </div>

          {item.output && (
            <div>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                EXECUTION OUTPUT:
              </span>
              <pre className="p-2 bg-black border border-white/10 rounded-sharp text-[10px] text-emerald-300/90 overflow-x-auto max-h-48">
                {typeof item.output === 'object'
                  ? JSON.stringify(item.output, null, 2)
                  : item.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
