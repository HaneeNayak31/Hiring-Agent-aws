'use client';

import React from 'react';
import { MessageItem, extractTextContent } from '@/hooks/agentStateReducer';

interface MessageBubbleProps {
  item: MessageItem;
  isStreaming?: boolean;
}

export function MessageBubble({ item, isStreaming = false }: MessageBubbleProps) {
  const isUser = item.role === 'user';
  const text = typeof item.text === 'string' ? item.text : extractTextContent(item.text);

  if (isUser) {
    return (
      <div className="my-4 p-4 rounded-xl bg-white/[0.04] border border-white/15 text-xs font-mono select-text shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-white/40">
          <span className="font-bold text-primary tracking-wider uppercase">// RECRUITER AUDIT INSTRUCTION</span>
          {item.timestamp && <span>{item.timestamp}</span>}
        </div>
        <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{text}</p>
        {item.repoUrl && (
          <div className="mt-2 text-[10px] text-white/40">
            Target Repo: <span className="text-white/70">{item.repoUrl}</span>
          </div>
        )}
      </div>
    );
  }

  // Assistant commentary line (single-line status)
  if (item.phase === 'commentary' || (!text.includes('\n\n') && text.length < 160)) {
    return (
      <div className="my-2 flex items-center gap-2 text-xs text-white/60 font-mono py-1 select-text">
        <span className="text-primary font-bold select-none">&gt;</span>
        <span>{text}</span>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse align-middle" />
        )}
      </div>
    );
  }

  // Full assistant markdown/report block
  const lines = text.split('\n');
  return (
    <div className="my-4 p-5 rounded-xl bg-[#09090c] border border-white/15 text-xs font-sans leading-relaxed text-white/85 select-text shadow-md">
      <div className="space-y-3 font-mono">
        {lines.map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-white/15 font-sans">
                {line.replace(/^#\s+/, '')}
              </h1>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-sm font-bold text-primary pt-2 font-sans">
                {line.replace(/^##\s+/, '')}
              </h2>
            );
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-semibold text-white/90 pt-1 font-sans">
                {line.replace(/^###\s+/, '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 text-white/80">
                <span className="text-primary select-none shrink-0">•</span>
                <span className="break-words">{line.replace(/^[-*]\s+/, '')}</span>
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return (
            <p key={idx} className="text-white/80 leading-relaxed font-sans text-xs">
              {line}
            </p>
          );
        })}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-primary animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
