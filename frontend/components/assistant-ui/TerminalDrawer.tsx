'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface TerminalDrawerProps {
  command?: string;
  output?: string;
  isOpen: boolean;
  cwd?: string;
}

export function TerminalDrawer({ output, isOpen, cwd = '/workspace', command }: TerminalDrawerProps) {
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const outputText = typeof output === 'string'
    ? output
    : (output ? (typeof output === 'object' && (output as any).text ? (output as any).text : JSON.stringify(output, null, 2)) : '');

  if (!isOpen) return null;

  const handleCopyOutput = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 1500);
  };

  const handleCopyCmd = () => {
    if (!command) return;
    navigator.clipboard.writeText(command);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1500);
  };

  return (
    <div className="rounded-b-lg bg-[#08080a] border-x border-b border-white/15 p-3.5 overflow-hidden animate-in fade-in duration-100 font-mono text-xs">
      {/* Drawer Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10 text-[11px] text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="text-white/30">cwd:</span>
          <span className="text-white/60">{cwd}</span>
        </span>

        <div className="flex items-center gap-2">
          {command && (
            <button
              type="button"
              onClick={handleCopyCmd}
              title="Copy executed command"
              className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] hover:bg-white/10"
            >
              {copiedCmd ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy cmd</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyOutput}
            title="Copy terminal output"
            className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition-colors px-2 py-0.5 rounded border border-white/10 bg-white/[0.02] hover:bg-white/10"
          >
            {copiedOutput ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy output</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Output Stream */}
      <div className="overflow-x-auto max-h-72 overflow-y-auto font-mono text-[11px] leading-relaxed select-text">
        {outputText ? (
          <pre className="whitespace-pre-wrap text-white/80 font-mono">
            {outputText}
          </pre>
        ) : (
          <div className="text-white/40 italic font-mono">No terminal output recorded.</div>
        )}
      </div>
    </div>
  );
}

export default TerminalDrawer;
