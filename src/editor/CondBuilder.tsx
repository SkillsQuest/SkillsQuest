import { useState } from 'react'
import { Button } from '@heroui/react'
import {
  condFaults,
  describeCond,
  type Attr,
  type Cond,
  type Operand,
  type SkillTreeDoc,
} from '../skilltree/index.ts'
import { docIssueKey, docIssueVars } from '../lib/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { Seg } from '../components/ui'
import { useT, type AppT } from '../host/store.ts'

const OPS = [
  ['gte', '≥'],
  ['lte', '≤'],
  ['gt', '>'],
  ['lt', '<'],
  ['eq', '='],
  ['ne', '≠'],
] as const
type Op = (typeof OPS)[number][0]

type Leaf = Cond

function leafKind(cond: Cond): 'attr' | 'has' | 'oneOf' | null {
  const keys = Object.keys(cond)
  if (keys.length !== 1) return null
  const op = keys[0] as string
  if (op === 'has') return 'has'
  if (op === 'oneOf') return 'oneOf'
  if ((['gte', 'lte', 'gt', 'lt', 'eq', 'ne'] as string[]).includes(op)) {
    const arg = (cond as Record<string, unknown>)[op]
    const left = Array.isArray(arg) ? arg[0] : undefined
    if (left && typeof left === 'object' && 'get' in left && String(left.get).startsWith('attr.')) {
      return 'attr'
    }
  }
  return null
}

function parse(when: Cond | undefined): { mode: 'all' | 'any'; clauses: Leaf[] } | null {
  if (when === undefined) return { mode: 'all', clauses: [] }
  if ('all' in when) {
    return when.all.every((c) => leafKind(c)) ? { mode: 'all', clauses: [...when.all] } : null
  }
  if ('any' in when) {
    return when.any.every((c) => leafKind(c)) ? { mode: 'any', clauses: [...when.any] } : null
  }
  return leafKind(when) ? { mode: 'all', clauses: [when] } : null
}

function build(mode: 'all' | 'any', clauses: Leaf[]): Cond | undefined {
  if (clauses.length === 0) return undefined
  if (clauses.length === 1) return clauses[0]
  return mode === 'all' ? { all: clauses } : { any: clauses }
}

function opOf(cond: Cond): Op {
  return (Object.keys(cond)[0] as Op) ?? 'gte'
}

function attrOfLeaf(doc: SkillTreeDoc, cond: Cond): Attr | undefined {
  const op = opOf(cond)
  const arg = (cond as Record<string, unknown>)[op]
  const left = Array.isArray(arg) ? arg[0] : undefined
  if (left && typeof left === 'object' && 'get' in left) {
    const key = String((left as { get: string }).get).slice('attr.'.length)
    return doc.attrs?.find((a) => a.key === key)
  }
  return undefined
}

function rightOf(cond: Cond): Operand {
  const op = opOf(cond)
  const arg = (cond as Record<string, unknown>)[op]
  return Array.isArray(arg) ? (arg[1] as Operand) : ''
}

function AttrClause({
  doc,
  cond,
  onChange,
}: {
  doc: SkillTreeDoc
  cond: Cond
  onChange: (c: Cond) => void
}) {
  const t = useT()
  const attrs = doc.attrs ?? []
  const attr = attrOfLeaf(doc, cond) ?? attrs[0]
  const op = opOf(cond)
  const right = rightOf(cond)

  if (!attr) return <span className="text-xs text-muted">{t('editor.cond.pickAttr')}</span>

  const emit = (nextOp: Op, value: Operand) => onChange({ [nextOp]: [{ get: `attr.${attr.key}` }, value] } as unknown as Cond)
  const ops = attr.type === 'number' ? OPS : OPS.filter(([o]) => o === 'eq' || o === 'ne')

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Seg
        items={attrs.map((a) => [a.key, a.name || a.key] as [string, string])}
        value={attr.key}
        onPick={(key) => {
          const next = attrs.find((a) => a.key === key)
          const init: Operand = next?.type === 'number' ? 0 : (next?.options?.[0]?.value ?? '')
          onChange({ [op]: [{ get: `attr.${key}` }, init] } as unknown as Cond)
        }}
      />
      <Seg items={ops.map(([o, sym]) => [o, sym] as [string, string])} value={op} onPick={(o) => emit(o as Op, right)} />
      {attr.type === 'number' ? (
        <input
          type="number"
          value={typeof right === 'number' ? right : 0}
          aria-label={t('editor.cond.reads')}
          onChange={(e) => emit(op, Number(e.target.value))}
          className="w-16 rounded-lg bg-surface px-2 py-1 text-sm outline-none"
        />
      ) : attr.type === 'bool' ? (
        <Seg
          items={[
            ['true', t('editor.attr.type.bool')],
            ['false', '—'],
          ]}
          value={right === true ? 'true' : 'false'}
          onPick={(v) => emit(op, v === 'true')}
        />
      ) : (
        <Seg
          items={(attr.options ?? []).map((o) => [o.value, o.name || o.value] as [string, string])}
          value={String(right)}
          onPick={(v) => emit(op, v)}
        />
      )}
    </div>
  )
}

function HasClause({ doc, cond, onChange }: { doc: SkillTreeDoc; cond: Cond; onChange: (c: Cond) => void }) {
  const arg = (cond as unknown as { has: [string, number?] }).has
  const id = arg[0]
  return (
    <Seg
      items={doc.nodes.map((n) => [n.id, n.title || n.id] as [string, string])}
      value={id}
      onPick={(nid) => onChange({ has: [nid] })}
    />
  )
}

function OneOfClause({ doc, cond, onChange }: { doc: SkillTreeDoc; cond: Cond; onChange: (c: Cond) => void }) {
  const ids = (cond as unknown as { oneOf: string[] }).oneOf
  const on = new Set(ids)
  return (
    <div className="flex flex-wrap gap-1">
      {doc.nodes.map((n) => (
        <button
          key={n.id}
          onClick={() =>
            onChange({ oneOf: on.has(n.id) ? ids.filter((x) => x !== n.id) : [...ids, n.id] })
          }
          className="tap rounded-full px-2 py-0.5 text-xs"
          style={{
            background: on.has(n.id) ? 'var(--accent)' : 'var(--surface)',
            color: on.has(n.id) ? 'var(--accent-fg, #fff)' : undefined,
          }}
        >
          {n.title || n.id}
        </button>
      ))}
    </div>
  )
}

function preview(doc: SkillTreeDoc, when: Cond | undefined, t: AppT): { text: string; bad: string | null } {
  if (when === undefined) return { text: '', bad: null }
  const attrKeys = new Set((doc.attrs ?? []).map((a) => a.key))
  const nodeIds = new Set(doc.nodes.map((n) => n.id))
  const faults = condFaults(when, '/gate/when', nodeIds, attrKeys)
  const first = faults[0]
  if (first) {
    const key = docIssueKey(first.code)
    return { text: '', bad: key ? t(key, docIssueVars(first.detail)) : t('editor.cond.invalid') }
  }
  return { text: describeCond(doc, when, t), bad: null }
}

export function CondBuilder({
  doc,
  when,
  onChange,
  label,
}: {
  doc: SkillTreeDoc
  when: Cond | undefined
  onChange: (when: Cond | undefined) => void
  label?: string
}) {
  const t = useT()
  const heading = label ?? t('editor.field.cond')
  const parsed = parse(when)
  const [jsonMode, setJsonMode] = useState(parsed === null && when !== undefined)
  const [draft, setDraft] = useState(() => (when ? JSON.stringify(when, null, 2) : ''))

  const { text, bad } = preview(doc, when, t)

  if (when === undefined && !jsonMode) {
    return (
      <div>
        <div className="mb-1.5 text-xs text-muted">{heading}</div>
        <Button size="sm" variant="ghost" onPress={() => onChange({ all: [] })}>
          <span className="flex items-center gap-1">
            <Ico name="plus" size={ICON.chip} />
            {t('editor.cond.add')}
          </span>
        </Button>
      </div>
    )
  }

  const previewRow = (
    <div className="mt-1 text-xs">
      {bad ? (
        <span style={{ color: 'var(--warning)' }}>{bad}</span>
      ) : text ? (
        <span className="text-muted">
          {t('editor.cond.reads')}：{text}
        </span>
      ) : null}
    </div>
  )

  if (jsonMode) {
    const applyJson = (raw: string) => {
      setDraft(raw)
      if (raw.trim() === '') return onChange(undefined)
      try {
        onChange(JSON.parse(raw) as Cond)
      } catch {
      }
    }
    let jsonBad: string | null = null
    try {
      if (draft.trim() !== '') JSON.parse(draft)
    } catch {
      jsonBad = t('editor.cond.jsonBad')
    }
    return (
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          {heading}
          {parse(safeParse(draft)) !== null && (
            <button className="tap text-accent" onClick={() => setJsonMode(false)}>
              {t('editor.cond.builder')}
            </button>
          )}
        </div>
        <textarea
          value={draft}
          aria-label={heading}
          rows={5}
          onChange={(e) => applyJson(e.target.value)}
          className="field-sizing-content w-full resize-none rounded-xl bg-surface-secondary px-3 py-2 font-mono text-xs outline-none"
        />
        {jsonBad ? <div className="mt-1 text-xs" style={{ color: 'var(--warning)' }}>{jsonBad}</div> : previewRow}
        <ClearButton onClear={() => onChange(undefined)} />
      </div>
    )
  }

  const { mode, clauses } = parsed ?? { mode: 'all' as const, clauses: [] }
  const setClauses = (next: Leaf[]) => onChange(build(mode, next))
  const setMode = (m: 'all' | 'any') => onChange(build(m, clauses))
  const attrs = doc.attrs ?? []

  const addClause = (kind: 'attr' | 'has' | 'oneOf') => {
    const first = attrs[0]
    const leaf: Cond =
      kind === 'attr' && first
        ? ({ gte: [{ get: `attr.${first.key}` }, first.type === 'number' ? 0 : (first.options?.[0]?.value ?? '')] } as unknown as Cond)
        : kind === 'has'
          ? ({ has: [doc.nodes[0]?.id ?? ''] } as unknown as Cond)
          : ({ oneOf: [] } as unknown as Cond)
    setClauses([...clauses, leaf])
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
        {heading}
        <button className="tap text-accent" onClick={() => { setDraft(when ? JSON.stringify(when, null, 2) : ''); setJsonMode(true) }}>
          {t('editor.cond.advanced')}
        </button>
      </div>

      {clauses.length > 1 && (
        <Seg
          items={[
            ['all', t('editor.cond.mode.all')],
            ['any', t('editor.cond.mode.any')],
          ]}
          value={mode}
          onPick={(m) => setMode(m as 'all' | 'any')}
        />
      )}

      <div className="mt-2 space-y-2">
        {clauses.map((clause, i) => {
          const kind = leafKind(clause)
          const change = (c: Cond) => setClauses(clauses.map((x, j) => (i === j ? c : x)))
          return (
            <div key={i} className="flex items-start gap-1.5 rounded-xl bg-surface-secondary p-2">
              <div className="min-w-0 flex-1">
                {kind === 'attr' && <AttrClause doc={doc} cond={clause} onChange={change} />}
                {kind === 'has' && <HasClause doc={doc} cond={clause} onChange={change} />}
                {kind === 'oneOf' && <OneOfClause doc={doc} cond={clause} onChange={change} />}
              </div>
              <button
                onClick={() => setClauses(clauses.filter((_, j) => j !== i))}
                aria-label={t('action.delete')}
                className="px-1 text-muted"
              >
                <Ico name="close" size={ICON.chip} />
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {attrs.length > 0 && (
          <Button size="sm" variant="ghost" onPress={() => addClause('attr')}>
            + {t('editor.cond.clause.attr')}
          </Button>
        )}
        <Button size="sm" variant="ghost" onPress={() => addClause('has')}>
          + {t('editor.cond.clause.has')}
        </Button>
        <Button size="sm" variant="ghost" onPress={() => addClause('oneOf')}>
          + {t('editor.cond.clause.oneOf')}
        </Button>
      </div>

      {previewRow}
      <ClearButton onClear={() => onChange(undefined)} />
    </div>
  )
}

function ClearButton({ onClear }: { onClear: () => void }) {
  const t = useT()
  return (
    <button className="tap mt-2 text-xs text-muted" onClick={onClear}>
      {t('editor.cond.clear')}
    </button>
  )
}

function safeParse(raw: string): Cond | undefined {
  try {
    return raw.trim() === '' ? undefined : (JSON.parse(raw) as Cond)
  } catch {
    return undefined
  }
}
