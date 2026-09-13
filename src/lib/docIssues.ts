import type { CommonKey } from '../i18n/index.ts'

export const DOC_ISSUE_KEYS = {
  SPEC_UNSUPPORTED: 'issue.SPEC_UNSUPPORTED',
  TOO_MANY_NODES: 'issue.TOO_MANY_NODES',
  TOO_MANY_EDGES: 'issue.TOO_MANY_EDGES',
  TOO_MANY_AWARDS: 'issue.TOO_MANY_AWARDS',
  TOO_MANY_ATTRS: 'issue.TOO_MANY_ATTRS',
  NODE_ID_MALFORMED: 'issue.NODE_ID_MALFORMED',
  NODE_ID_DUPLICATE: 'issue.NODE_ID_DUPLICATE',
  EDGE_MALFORMED: 'issue.EDGE_MALFORMED',
  EDGE_ENDPOINT_MISSING: 'issue.EDGE_ENDPOINT_MISSING',
  EDGE_SELF_LOOP: 'issue.EDGE_SELF_LOOP',
  EDGE_DUPLICATE: 'issue.EDGE_DUPLICATE',
  GRAPH_HAS_CYCLE: 'issue.GRAPH_HAS_CYCLE',
  GATE_NEED_EXCEEDS_INBOUND: 'issue.GATE_NEED_EXCEEDS_INBOUND',
  ATTR_KEY_MALFORMED: 'issue.ATTR_KEY_MALFORMED',
  ATTR_KEY_DUPLICATE: 'issue.ATTR_KEY_DUPLICATE',
  ATTR_TYPE_INVALID: 'issue.ATTR_TYPE_INVALID',
  ATTR_RANGE_INVALID: 'issue.ATTR_RANGE_INVALID',
  ATTR_OPTIONS_EMPTY: 'issue.ATTR_OPTIONS_EMPTY',
  AWARD_ID_DUPLICATE: 'issue.AWARD_ID_DUPLICATE',
  AWARD_COND_WITH_GEM: 'issue.AWARD_COND_WITH_GEM',
  MAXRANK_INVALID: 'issue.MAXRANK_INVALID',
  POINTS_ATTR_UNKNOWN: 'issue.POINTS_ATTR_UNKNOWN',
  CAPABILITY_NOT_DECLARED: 'issue.CAPABILITY_NOT_DECLARED',
  CAPABILITY_UNKNOWN: 'issue.CAPABILITY_UNKNOWN',
  COST_EXCEEDS_SUPPLY: 'editor.costExceeds',
  COND_MALFORMED: 'issue.COND_MALFORMED',
  COND_FACT_UNKNOWN: 'issue.COND_FACT_UNKNOWN',
  COND_NODE_MISSING: 'issue.COND_NODE_MISSING',
  COND_ATTR_UNDECLARED: 'issue.COND_ATTR_UNDECLARED',
} satisfies Record<string, CommonKey>

export function docIssueKey(code: string): CommonKey | undefined {
  return DOC_ISSUE_KEYS[code as keyof typeof DOC_ISSUE_KEYS]
}

export function docIssueVars(
  detail: Record<string, unknown> | undefined,
): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(detail ?? {})) {
    if (typeof value === 'string' || typeof value === 'number') out[key] = value
  }
  return out
}
