export type TraceAttributeValue =
  | string
  | number
  | boolean
  | null
  | TraceAttributeValue[]
  | { [key: string]: TraceAttributeValue };

export interface OtlpAttribute {
  key: string;
  value?: {
    stringValue?: string;
    intValue?: string | number;
    doubleValue?: number;
    boolValue?: boolean;
    bytesValue?: string;
    arrayValue?: { values?: OtlpAttribute['value'][] };
    kvlistValue?: { values?: OtlpAttribute[] };
  };
}

export interface OtlpSpan {
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
  name?: string;
  kind?: number;
  startTimeUnixNano?: string | number;
  endTimeUnixNano?: string | number;
  attributes?: OtlpAttribute[];
  status?: { code?: string | number; message?: string };
  events?: Array<{ name?: string; timeUnixNano?: string | number; attributes?: OtlpAttribute[] }>;
}

export interface OtlpTracePayload {
  resourceSpans?: Array<{
    resource?: { attributes?: OtlpAttribute[] };
    scopeSpans?: Array<{ spans?: OtlpSpan[] }>;
    instrumentationLibrarySpans?: Array<{ spans?: OtlpSpan[] }>;
  }>;
}

export type TraceSpanKind = 'agent' | 'generation' | 'tool' | 'unknown';

export interface TraceSpan {
  id: string;
  parentId: string | null;
  name: string;
  kind: TraceSpanKind;
  startNs: string;
  endNs: string;
  durationMs: number;
  startTime: Date | null;
  status: 'ok' | 'error' | 'unset';
  statusMessage?: string;
  attributes: Record<string, TraceAttributeValue>;
  children: TraceSpan[];
  depth: number;
}

export interface TraceSummary {
  sessionId: string | null;
  model: string | null;
  traceId: string | null;
  startTime: Date | null;
  durationMs: number;
  spanCount: number;
  agentCount: number;
  generationCount: number;
  toolCount: number;
  inputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  totalTokens: number | null;
  status: 'ok' | 'error' | 'unset';
}

export interface NormalizedTrace {
  spans: TraceSpan[];
  roots: TraceSpan[];
  summary: TraceSummary;
}
