'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, ServerOff, ShieldAlert } from 'lucide-react';
import { ApiError } from '@/data/apiClient';

interface ApiErrorBannerProps {
  error: string | ApiError | Error | null;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ApiErrorBanner({
  error,
  title = 'API GATEWAY COMMUNICATION FAILURE',
  onRetry,
  className = '',
}: ApiErrorBannerProps) {
  if (!error) return null;

  let message = typeof error === 'string' ? error : error.message;
  let statusCode: number | null = null;
  let details: any = null;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    details = error.details;
  }

  const isNetwork = statusCode === 0 || message.toLowerCase().includes('connect to api gateway');
  const is404 = statusCode === 404;

  return (
    <div
      className={`border-2 border-red-500/60 bg-red-950/20 p-6 font-mono text-xs text-red-200 shadow-[6px_6px_0px_0px_rgba(239,68,68,0.4)] ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-red-500/20 border border-red-500/40 rounded-sharp shrink-0 mt-0.5">
            {isNetwork ? (
              <ServerOff className="w-5 h-5 text-red-400" />
            ) : is404 ? (
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-bold text-red-400 tracking-wider uppercase text-[11px]">
                {title}
              </span>
              {statusCode !== null && (
                <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300">
                  {statusCode === 0 ? 'OFFLINE / NETWORK DOWN' : `HTTP ${statusCode}`}
                </span>
              )}
            </div>

            <p className="text-white/90 text-xs font-sans leading-relaxed">
              {message}
            </p>

            {details && details.missing_fields && (
              <div className="mt-3 pt-2 border-t border-red-500/20">
                <span className="text-[10px] text-red-300 uppercase block mb-1 font-bold">
                  Missing Required Fields:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {details.missing_fields.map((f: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-black/60 border border-red-400/40 text-red-200 text-[10px]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-red-500 hover:bg-white text-black font-bold text-xs uppercase transition flex items-center justify-center gap-2 shrink-0 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
}
