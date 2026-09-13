import { useRef } from 'react'
import {
  describeCond,
  rewardOf,
  type Check,
  type CondTextKey,
  type SkillNode,
  type SkillTreeDoc,
} from '../skilltree/index.ts'
import { ICON, Ico } from './icons.tsx'
import { POPOVER_W, popoverPlace } from './popover.ts'
import { useSize } from './useSize.ts'

export type NodeInfoTextKey =
  | 'action.close'
  | 'res.fallbackName'
  | 'node.more'
  | 'node.check.prereq'
  | 'node.check.cost'
  | 'node.check.cond'
  | 'node.check.level'
  | 'node.check.missing'
  | CondTextKey

export type NodeInfoTranslate = (
  key: NodeInfoTextKey,
  vars?: Record<string, string | number>,
) => string

export function NodeInfo({
  doc,
  node,
  checks,
  anchor,
  size,
  box,
  t,
  onClose,
}: {
  doc: SkillTreeDoc
  node: SkillNode
  checks: readonly Check[]
  anchor: { x: number; y: number }
  size: number
  box: { w: number; h: number }
  t: NodeInfoTranslate
  onClose: () => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const { h } = useSize(el)
  const accent = doc.meta.accent ?? 'var(--accent)'
  const { x, y } = popoverPlace({ anchor, size, box, height: h || 120 })

  return (
    <div
      ref={el}
      className="pop absolute z-30 rounded-2xl bg-overlay p-3 shadow-overlay"
      style={{ left: x, top: y, width: POPOVER_W }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-secondary"
          style={{ color: accent }}
        >
          <Ico name={node.icon ?? 'dot'} size={ICON.pill} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{node.title}</div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Ico name={doc.res?.icon ?? 'star'} size={ICON.tiny} />+{rewardOf(node)}
          </div>
        </div>
        <button
          className="tap shrink-0 px-1 text-muted"
          aria-label={t('action.close')}
          onClick={onClose}
        >
          <Ico name="close" size={ICON.row} />
        </button>
      </div>

      {!!node.note && (
        <div className="mt-2.5 text-xs leading-relaxed text-muted select-text">{node.note}</div>
      )}

      <NodeChecks doc={doc} node={node} checks={checks} t={t} />
    </div>
  )
}

export function NodeChecks({
  doc,
  node,
  checks,
  t,
}: {
  doc: SkillTreeDoc
  node: SkillNode
  checks: readonly Check[]
  t: NodeInfoTranslate
}) {
  const resName = doc.res?.name ?? t('res.fallbackName')
  const titleOf = (id: string) => doc.nodes.find((n) => n.id === id)?.title ?? id
  const shown = checks.filter((c) => c.kind !== 'points')
  if (shown.length === 0) return null

  return (
    <div className="mt-2.5 space-y-1">
      {shown.map((c) => (
        <div key={c.kind} className="flex items-start gap-1.5 text-xs">
          <Ico
            name={c.ok ? 'check' : 'close'}
            size={ICON.chip}
            stroke={2.4}
            className="mt-0.5 shrink-0"
            style={{ color: c.ok ? 'var(--success)' : 'var(--warning)' }}
          />
          <span className="min-w-0" style={{ opacity: c.ok ? 0.55 : 1 }}>
            {checkLabel(t, c, resName, doc, node)}
            {c.kind === 'prereq' && !c.ok && c.missing.length > 0 && (
              <span className="block text-muted">
                {t('node.check.missing', { names: nameList(t, c.missing, titleOf) })}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  )
}

const NAME_CAP = 3

export function nameList(
  t: NodeInfoTranslate,
  ids: readonly string[],
  titleOf: (id: string) => string,
): string {
  const shown = ids.slice(0, NAME_CAP).map(titleOf).join('、')
  const rest = ids.length - NAME_CAP
  return rest > 0 ? `${shown} ${t('node.more', { n: rest })}` : shown
}

function checkLabel(
  t: NodeInfoTranslate,
  check: Check,
  resName: string,
  doc: SkillTreeDoc,
  node: SkillNode,
): string {
  if (check.kind === 'prereq')
    return t('node.check.prereq', { have: check.have, need: check.need })
  if (check.kind === 'cost') return t('node.check.cost', { res: resName, need: check.need })
  if (check.kind === 'cond')
    return node.gate?.when ? describeCond(doc, node.gate.when, t) : t('node.check.cond')
  return t('node.check.level', { need: check.need })
}
