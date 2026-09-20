'use client';

import React from 'react';
import { AgentSessionState } from './types';
import ExecutionFeed from './ExecutionFeed';

interface HRAgentThreadProps {
  session: AgentSessionState | any;
  candidateName: string;
  roleTitle: string;
  repoUrl?: string;
  isStreaming?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRunEvaluation?: (instructions?: string) => Promise<void> | void;
  onOpenReport?: () => void;
}

export default function HRAgentThread({
  session,
  candidateName,
  roleTitle,
  repoUrl,
  isStreaming = false,
  error = null,
  onRunEvaluation,
  onOpenReport,
}: HRAgentThreadProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      <div className="flex-1 min-h-0">
        <ExecutionFeed
          sessionState={session as any}
          candidateName={candidateName}
          roleTitle={roleTitle}
          repoUrl={repoUrl}
          isStreaming={isStreaming}
          error={error}
          onRunEvaluation={onRunEvaluation}
          onOpenReport={onOpenReport}
        />
      </div>
    </div>
  );
}
