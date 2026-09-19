'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReasoningItem } from './types';

interface ReasoningBlockProps {
  item: ReasoningItem;
  defaultExpanded?: boolean;
}

export default function ReasoningBlock({ item, defaultExpanded = false }: ReasoningBlockProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isRunning = item.status === 'in_progress';
  const wordCount = item.summary ? item.summary.trim().split(/\s+/).length : 0;

  return (
    <div className="my-2 border border-white/15 bg-black/60 rounded-sharp overflow-hidden transition-colors hover:border-white/30">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-mono text-xs bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Brain
            className={`w-3.5 h-3.5 ${
              isRunning ? 'text-amber-400 animate-pulse' : 'text-primary'
            }`}
          />
          <span className="font-bold text-white tracking-wide">
            {item.title || 'Internal Reasoning & Strategy'}
          </span>

          {isRunning ? (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold uppercase ml-2 bg-amber-400/10 px-2 py-0.5 rounded-sharp border border-amber-400/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Thinking...
            </span>
          ) : (
            <span className="text-[10px] text-white/40 ml-2">
              ({wordCount} words{item.duration ? ` · ${item.duration}` : ''})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-white/40">
          <span className="text-[10px] uppercase font-mono tracking-wider">
            {isExpanded ? 'Collapse' : 'Inspect'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/60" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/60" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="border-t border-white/10 p-3.5 bg-white/[0.01] font-mono text-[11px] leading-relaxed text-white/80 whitespace-pre-wrap selection:bg-primary selection:text-black"
          >
            {item.summary}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
