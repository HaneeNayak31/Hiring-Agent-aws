'use client';

import React, { useState } from 'react';
import { Terminal, ChevronRight, Loader2 } from 'lucide-react';
import { CommandExecutionItem } from '@/hooks/agentStateReducer';
import { TerminalDrawer } from './TerminalDrawer';

interface TerminalRowProps {
  item: CommandExecutionItem;
  onToggleDrawer?: (itemId: string) => void;
}

export function TerminalRow({ item, onToggleDrawer }: TerminalRowProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(item.isDrawerOpen ?? false);
  const isRunning = item.status === 'in_progress';
  const isSuccess = item.exitCode === 0;
  const duration = item.durationMs || (isRunning ? null : 340);

  const handleToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (onToggleDrawer) {
      onToggleDrawer(item.id);
    }
  };

  return (
    <div className="my-2 select-none font-mono">
      {/* Terminal Row Header Bar */}
      <div
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleToggle();
        }}
        className={`flex items-center justify-between px-3 py-2 bg-white/[0.03] border border-white/10 cursor-pointer hover:bg-white/[0.06] hover:border-white/20 transition-colors duration-100 ${
          isDrawerOpen ? 'rounded-t-lg border-b-white/20 bg-white/[0.05]' : 'rounded-lg'
        }`}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0 mt-0.5" />
          ) : (
            <Terminal className="w-3.5 h-3.5 text-white/40 shrink-0 mt-0.5" />
          )}

          <div
            className="flex items-start gap-1.5 font-mono text-xs min-w-0 flex-1"
            title={item.command || '/bin/bash'}
          >
            <span className="text-white/30 select-none shrink-0">$</span>
            <span
              className={`text-white/85 font-normal break-all leading-relaxed ${
                isDrawerOpen ? 'whitespace-pre-wrap' : 'truncate'
              }`}
            >
              {item.command || '/bin/bash'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {isRunning ? (
            <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
              running
            </span>
          ) : (
            <span
              className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                isSuccess
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              exit {item.exitCode ?? 0}
            </span>
          )}

          {duration && (
            <span className="text-[11px] font-mono text-white/40">
              {duration}ms
            </span>
          )}

          <ChevronRight
            className={`w-3.5 h-3.5 text-white/40 transition-transform duration-150 ${
              isDrawerOpen ? 'rotate-90 text-white' : ''
            }`}
          />
        </div>
      </div>

      {/* Terminal Drawer */}
      <TerminalDrawer
        command={item.command}
        output={item.output}
        isOpen={isDrawerOpen}
        cwd={item.cwd || '/workspace'}
      />
    </div>
  );
}

export default TerminalRow;
