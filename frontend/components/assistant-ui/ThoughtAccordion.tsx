'use client';

import React, { useState } from 'react';
import { ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { ReasoningItem } from '@/hooks/agentStateReducer';

interface ThoughtAccordionProps {
  item: ReasoningItem;
  onToggleExpand?: (itemId: string) => void;
}

export function ThoughtAccordion({ item, onToggleExpand }: ThoughtAccordionProps) {
  const [localExpanded, setLocalExpanded] = useState(item.isExpanded ?? (item.status === 'in_progress'));
  const isRunning = item.status === 'in_progress';
  const duration = item.thinkingSeconds ? `${item.thinkingSeconds.toFixed(1)}s` : isRunning ? 'running' : '2.1s';
  const text = item.summaryText || '';

  const handleToggle = () => {
    setLocalExpanded(!localExpanded);
    if (onToggleExpand) {
      onToggleExpand(item.id);
    }
  };

  return (
    <div className="my-2 select-none font-mono text-xs">
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleToggle();
        }}
        className="inline-flex items-center gap-2 py-1 text-white/50 hover:text-white/90 transition-colors cursor-pointer group"
      >
        <ChevronRight
          className={`w-3.5 h-3.5 text-white/35 transition-transform duration-150 group-hover:text-white/70 ${
            localExpanded ? 'rotate-90' : ''
          }`}
        />
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-colors" />
        )}
        <span className="font-medium text-white/60 group-hover:text-white/90">
          Thought for {duration}
        </span>
        {!localExpanded && text && (
          <span className="hidden sm:inline max-w-md truncate text-white/30 text-[11px]">
            · {text.replace(/\n+/g, ' ').slice(0, 75)}...
          </span>
        )}
      </div>

      {localExpanded && text && (
        <div className="mt-1.5 ml-1.5 border-l border-white/15 pl-3.5 py-1 animate-in fade-in duration-100">
          <p className="font-sans text-xs italic leading-relaxed text-white/60 whitespace-pre-wrap">
            {text}
          </p>
        </div>
      )}
    </div>
  );
}

export default ThoughtAccordion;
