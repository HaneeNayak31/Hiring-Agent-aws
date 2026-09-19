'use client';

import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { CommandExecutionItem } from './types';

interface TerminalExecutionBlockProps {
  item: CommandExecutionItem;
}

export default function TerminalExecutionBlock({ item }: TerminalExecutionBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.output || item.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSuccess = item.exitCode === 0;

  return (
    <div className="my-3 border border-white/20 bg-[#070707] rounded-sharp overflow-hidden shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-white/[0.04] border-b border-white/10 px-3 py-2 flex items-center justify-between gap-3 font-mono text-[11px] select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>

          <span className="text-white/40">{item.cwd || '/workspace'} $</span>
          <span className="font-bold text-primary tracking-tight">{item.command}</span>
        </div>

        <div className="flex items-center gap-2">
          {item.exitCode !== undefined && item.exitCode !== null && (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-sharp ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              Exit: {item.exitCode}
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 text-white/40 hover:text-white transition-colors"
            title="Copy Output"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 font-mono text-[11px] text-white/80 leading-relaxed overflow-x-auto max-h-56 overflow-y-auto whitespace-pre selection:bg-primary selection:text-black">
          {item.output ? (
            item.output
          ) : (
            <span className="text-white/30 italic">No output produced.</span>
          )}
        </div>
      )}
    </div>
  );
}
