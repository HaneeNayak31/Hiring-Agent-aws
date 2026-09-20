'use client';

import React from 'react';
import {
  Check,
  Cpu,
  Loader2,
  GitBranch,
  Layers,
  FlaskConical,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { ToolCallItem } from '@/hooks/agentStateReducer';

interface SkillRowProps {
  item: ToolCallItem;
}

function getSkillIcon(name: string) {
  const lower = (name || '').toLowerCase();
  if (lower.includes('git') || lower.includes('forensic')) {
    return <GitBranch className="w-3.5 h-3.5 text-sky-400" />;
  }
  if (lower.includes('solid') || lower.includes('arch')) {
    return <Layers className="w-3.5 h-3.5 text-violet-400" />;
  }
  if (lower.includes('test') || lower.includes('rigor')) {
    return <FlaskConical className="w-3.5 h-3.5 text-amber-400" />;
  }
  if (lower.includes('security') || lower.includes('smell')) {
    return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
  }
  if (lower.includes('interview') || lower.includes('question')) {
    return <HelpCircle className="w-3.5 h-3.5 text-pink-400" />;
  }
  return <Cpu className="w-3.5 h-3.5 text-white/50" />;
}

export function SkillRow({ item }: SkillRowProps) {
  const isRunning = item.status === 'in_progress';
  const skillName = item.toolName || 'rubric-evaluator';

  return (
    <div className="my-1.5 flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/10 text-xs transition-colors select-none">
      <div className="flex items-center gap-2 overflow-hidden">
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
        ) : (
          <span className="shrink-0">{getSkillIcon(skillName)}</span>
        )}
        <span className="font-mono text-white/80 truncate">
          {isRunning ? `Evaluating ${skillName}...` : `Executed ${skillName}`}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        {isRunning ? (
          <span className="text-[10px] font-mono text-white/40 animate-pulse">
            running
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-mono text-white/40">
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400/80">completed</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default SkillRow;
