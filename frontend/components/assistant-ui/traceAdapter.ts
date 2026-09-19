import { NormalizedTrace, OtlpAttribute, OtlpTracePayload, TraceAttributeValue, TraceSpan, TraceSpanKind } from './traceTypes';

function readAnyValue(value: OtlpAttribute['value']): TraceAttributeValue {
  if (!value) return null;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.intValue !== undefined) {
    const number = Number(value.intValue);
    return Number.isFinite(number) ? number : String(value.intValue);
  }
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.boolValue !== undefined) return value.boolValue;
  if (value.bytesValue !== undefined) return value.bytesValue;
  if (value.arrayValue) return (value.arrayValue.values || []).map(readAnyValue);
  if (value.kvlistValue) return Object.fromEntries((value.kvlistValue.values || []).map((entry) => [entry.key, readAnyValue(entry.value)]));
  return null;
}

function attributeMap(attributes: OtlpAttribute[] = []): Record<string, TraceAttributeValue> {
  return Object.fromEntries(attributes.map((attribute) => [attribute.key, readAnyValue(attribute.value)]));
}

function asString(value: TraceAttributeValue | undefined): string | null {
  return value === undefined || value === null ? null : String(value);
}

function asNumber(value: TraceAttributeValue | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function nanoNumber(value: string | number | undefined): bigint {
  if (value === undefined || value === null) return BigInt(0);
  try { return BigInt(String(value)); } catch { return BigInt(0); }
}

function dateFromNano(value: string): Date | null {
  const nanos = nanoNumber(value);
  return nanos ? new Date(Number(nanos / BigInt(1000000))) : null;
}

function durationMs(start: string, end: string): number {
  const diff = nanoNumber(end) - nanoNumber(start);
  return Number(diff > BigInt(0) ? diff : BigInt(0)) / 1000000;
}

function classify(name: string, attrs: Record<string, TraceAttributeValue>): TraceSpanKind {
  const operation = String(attrs['gen_ai.operation.name'] || '').toLowerCase();
  if (operation === 'invoke_agent' || name.toLowerCase().includes('invoke_agent')) return 'agent';
  if (attrs['gen_ai.tool.name'] || operation === 'execute_tool' || name.toLowerCase().includes('execute_tool')) return 'tool';
  if (operation === 'chat' || operation === 'generate' || name.toLowerCase().startsWith('chat')) return 'generation';
  return 'unknown';
}

function statusOf(span: { status?: { code?: string | number; message?: string } }, attrs: Record<string, TraceAttributeValue>): 'ok' | 'error' | 'unset' {
  const code = String(span.status?.code || '').toLowerCase();
  if (code.includes('error') || code === '2' || attrs['error.type'] || attrs['error.message']) return 'error';
  if (code.includes('ok') || code === '1') return 'ok';
  return 'unset';
}

export function normalizeTrace(payload: OtlpTracePayload | null | undefined): NormalizedTrace {
  const rawSpans = (payload?.resourceSpans || []).flatMap((resource) => [
    ...(resource.scopeSpans || []).flatMap((scope) => scope.spans || []),
    ...(resource.instrumentationLibrarySpans || []).flatMap((scope) => scope.spans || []),
  ]);
  const spans: TraceSpan[] = rawSpans.map((span, index) => {
    const attributes = attributeMap(span.attributes);
    const startNs = String(span.startTimeUnixNano || '0');
    const endNs = String(span.endTimeUnixNano || startNs);
    return { id: span.spanId || `span-${index}`, parentId: span.parentSpanId || null, name: span.name || 'Unnamed span', kind: classify(span.name || '', attributes), startNs, endNs, durationMs: durationMs(startNs, endNs), startTime: dateFromNano(startNs), status: statusOf(span, attributes), statusMessage: span.status?.message, attributes, children: [], depth: 0 };
  });
  const byId = new Map(spans.map((span) => [span.id, span]));
  const roots: TraceSpan[] = [];
  spans.forEach((span) => { const parent = span.parentId ? byId.get(span.parentId) : undefined; if (parent) parent.children.push(span); else roots.push(span); });
  const assignDepth = (span: TraceSpan, depth: number) => { span.depth = depth; span.children.sort((a, b) => a.startNs.localeCompare(b.startNs)); span.children.forEach((child) => assignDepth(child, depth + 1)); };
  roots.sort((a, b) => a.startNs.localeCompare(b.startNs));
  roots.forEach((root) => assignDepth(root, 0));
  const all = spans.slice().sort((a, b) => a.startNs.localeCompare(b.startNs));
  const root = roots[0];
  const attr = root?.attributes || {};
  const first = all[0];
  const last = all[all.length - 1];
  const recorded = (key: string) => asNumber(attr[key]);
  return {
    spans, roots,
    summary: {
      sessionId: asString(attr['openai.managed_agents.session.id']) ?? asString(attr['gen_ai.conversation.id']),
      model: asString(attr['gen_ai.request.model']) ?? asString(first?.attributes['gen_ai.request.model']),
      traceId: root ? (rawSpans.find((span) => span.spanId === root.id)?.traceId || null) : null,
      startTime: first?.startTime || null,
      durationMs: first && last ? durationMs(first.startNs, last.endNs) : 0,
      spanCount: spans.length,
      agentCount: spans.filter((span) => span.kind === 'agent').length,
      generationCount: spans.filter((span) => span.kind === 'generation').length,
      toolCount: spans.filter((span) => span.kind === 'tool').length,
      inputTokens: recorded('openai.managed_agents.usage.total.input_tokens') ?? recorded('gen_ai.usage.input_tokens'),
      outputTokens: recorded('openai.managed_agents.usage.total.output_tokens') ?? recorded('gen_ai.usage.output_tokens'),
      reasoningTokens: recorded('openai.managed_agents.usage.total.reasoning_tokens') ?? recorded('gen_ai.usage.reasoning.output_tokens'),
      totalTokens: recorded('openai.managed_agents.usage.total.total_tokens') ?? recorded('gen_ai.usage.total_tokens'),
      status: spans.some((span) => span.status === 'error') ? 'error' : spans.some((span) => span.status === 'ok') ? 'ok' : 'unset',
    },
  };
}
