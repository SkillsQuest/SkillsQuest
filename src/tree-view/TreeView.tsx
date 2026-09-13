import { memo, useRef, useState } from 'react'
import {
  LABEL_MIN_ZOOM,
  edgeArrowPath,
  edgePath,
  edgeWidth,
  nodeSize,
  themeOf,
  type NodeState,
  type SkillTreeDoc,
} from '../skilltree/index.ts'
import { HOLD_MS } from '../lib/index.ts'
import { GATE_BADGE_ICON, GLOW_LAYERS, shapeStyle } from './shape.ts'
import { Ico } from './icons.tsx'

const { first: LONG, danger: HOLD } = HOLD_MS

export const CULL_MIN_NODES = 200

const CULL_MARGIN = 160

export const TreeView = memo(function TreeView({
  doc,
  states,
  active,
  warn,
  dim,
  zoom,
  viewport,
  onPick,
  onHover,
  onLong,
  onHold,
  t,
}: {
  doc: SkillTreeDoc
  states: Map<string, NodeState>
  active?: string
  warn?: ReadonlySet<string>
  dim?: ReadonlySet<string>
  zoom?: number
  viewport?: { x: number; y: number; k: number; w: number; h: number }
  onPick: (id: string) => void
  onHover: (id?: string, at?: { x: number; y: number }) => void
  onLong?: (id: string) => number | 'no' | void
  onHold?: (id: string) => void
  t: (key: 'tree.holdCascade', vars: { n: number }) => string
}) {

  const byId = new Map(doc.nodes.map((n) => [n.id, n]))
  const accent = doc.meta.accent ?? 'var(--accent)'
  const press = useRef<{ x: number; y: number; fired: boolean; timer: number } | null>(null)
  const [held, setHeld] = useState<{ id: string; risk: number } | null>(null)
  const [bad, setBad] = useState<string>()
  const { shape, edge, arrows } = themeOf(doc)
  const { clip, radius } = shapeStyle(shape)
  const labels = zoom === undefined || zoom >= LABEL_MIN_ZOOM
  const lit = (id: string) => (!dim || dim.has(id) ? 1 : 0.12)

  const cull =
    viewport && viewport.w > 0 && viewport.h > 0 && doc.nodes.length > CULL_MIN_NODES
      ? {
          x0: (0 - viewport.x) / viewport.k - CULL_MARGIN,
          y0: (0 - viewport.y) / viewport.k - CULL_MARGIN,
          x1: (viewport.w - viewport.x) / viewport.k + CULL_MARGIN,
          y1: (viewport.h - viewport.y) / viewport.k + CULL_MARGIN,
        }
      : null
  const outside = (n: { x: number; y: number }): boolean =>
    !!cull && (n.x < cull.x0 || n.x > cull.x1 || n.y < cull.y0 || n.y > cull.y1)

  const stop = () => {
    if (press.current) clearTimeout(press.current.timer)
    press.current = null
    setHeld(null)
  }

  return (
    <>
      <svg width="1" height="1" style={{ overflow: 'visible' }} className="pointer-events-none">
        {doc.edges.map(([from, to]) => {
          const a = byId.get(from)
          const b = byId.get(to)
          if (!a || !b) return null
          if (outside(a) && outside(b)) return null
          const live = states.get(from) === 'done'
          const d = edgePath(doc.layout, edge, a, b)
          const w = edgeWidth(doc.layout)
          const arrow = arrows ? edgeArrowPath(doc.layout, edge, a, b) : null
          const faded = Math.min(lit(from), lit(to))
          return (
            <g key={`${from}-${to}`} opacity={faded}>
              {live &&
                edge === 'glow' &&
                GLOW_LAYERS.map(([m, o]) => (
                  <path
                    key={m}
                    d={d}
                    fill="none"
                    stroke={accent}
                    strokeOpacity={o}
                    strokeWidth={w * m}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
              <path
                d={d}
                fill="none"
                stroke={live ? accent : 'currentColor'}
                strokeOpacity={live ? 0.85 : 0.16}
                strokeWidth={w}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={live && edge !== 'dashed' ? undefined : '6 8'}
                className="text-foreground"
              />
              {arrow && (
                <path
                  d={arrow}
                  fill={live ? accent : 'currentColor'}
                  fillOpacity={live ? 0.85 : 0.28}
                  className="text-foreground"
                />
              )}
            </g>
          )
        })}
      </svg>

      {doc.nodes.map((n) => {
        if (outside(n)) return null
        const st = states.get(n.id) ?? 'locked'
        const s = nodeSize(doc.layout, n)
        const done = st === 'done'
        const open = st === 'open'
        const blocked = st === 'blocked'
        const ring = done
          ? accent
          : open
            ? accent
            : blocked
              ? 'var(--warning)'
              : 'color-mix(in oklab, var(--foreground) 14%, transparent)'
        const body = done
          ? accent
          : blocked
            ? 'color-mix(in oklab, var(--warning) 18%, var(--surface))'
            : 'var(--surface)'

        const inner = (
          <>
            {held?.id === n.id && (
              <span
                className={held.risk ? 'hold-danger' : 'hold-fill'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: held.risk
                    ? 'color-mix(in oklab, var(--danger) 70%, transparent)'
                    : `color-mix(in oklab, ${accent} 55%, transparent)`,
                }}
              />
            )}
            <span className="relative flex items-center justify-center">
              <Ico
                name={st === 'locked' ? 'lock' : (n.icon ?? 'dot')}
                size={s * 0.42}
                stroke={done ? 2 : 1.7}
                style={{ color: done ? '#fff' : undefined }}
              />
            </span>
          </>
        )

        return (
          <div
            key={n.id}
            className="absolute flex flex-col items-center gap-1"
            style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)' }}
          >
            <div
              onPointerEnter={(e) =>
                e.pointerType === 'mouse' && onHover(n.id, { x: e.clientX, y: e.clientY })
              }
              onPointerLeave={() => {
                stop()
                onHover(undefined)
              }}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                if (!onLong) return
                setHeld({ id: n.id, risk: 0 })
                press.current = {
                  x: e.clientX,
                  y: e.clientY,
                  fired: false,
                  timer: window.setTimeout(() => {
                    if (press.current) press.current.fired = true
                    const risk = onLong(n.id)
                    setHeld(null)
                    if (risk === 'no') {
                      setBad(n.id)
                      return window.setTimeout(() => setBad(undefined), 400)
                    }
                    if (!risk) return
                    setHeld({ id: n.id, risk })
                    if (press.current)
                      press.current.timer = window.setTimeout(() => {
                        setHeld(null)
                        onHold?.(n.id)
                      }, HOLD)
                  }, LONG),
                }
              }}
              onPointerMove={(e) => {
                const p = press.current
                if (!p) {
                  if (e.pointerType === 'mouse') onHover(n.id, { x: e.clientX, y: e.clientY })
                  return
                }
                if (Math.abs(e.clientX - p.x) + Math.abs(e.clientY - p.y) > 8) {
                  stop()
                  onHover(undefined)
                }
              }}
              onPointerUp={() => {
                const fired = press.current?.fired
                stop()
                if (!fired) onPick(n.id)
              }}
              className={`relative flex touch-none cursor-pointer items-center justify-center transition-transform active:scale-90 ${open && !clip ? 'pulse' : ''} ${bad === n.id ? 'shake' : ''}`}
              style={{
                width: s,
                height: s,
                borderRadius: clip ? undefined : radius,
                clipPath: clip,
                overflow: clip ? undefined : 'hidden',
                background: clip ? ring : body,
                opacity: (st === 'locked' ? 0.4 : 1) * lit(n.id),
                boxShadow: clip
                  ? undefined
                  : done
                    ? `0 5px 0 0 color-mix(in oklab, ${accent} 70%, black)`
                    : `0 0 0 ${open || blocked ? 3 : 2}px ${ring}`,
                outline:
                  active === n.id
                    ? `4px solid ${accent}55`
                    :
                      warn?.has(n.id)
                      ? '3px dashed var(--danger)'
                      : undefined,
                outlineOffset: 5,
                color: 'var(--foreground)',
                ['--ring' as string]: accent,
              }}
            >
              {clip ? (
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: s - 6,
                    height: s - 6,
                    clipPath: clip,
                    background: body,
                  }}
                >
                  {inner}
                </div>
              ) : (
                inner
              )}
            </div>

            {!done && !!n.gate?.cost && (
              <span
                className="pointer-events-none absolute -top-1 -right-1 flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold"
                style={{
                  background: blocked ? 'var(--warning)' : 'var(--surface-tertiary)',
                  color: blocked ? 'var(--warning-foreground)' : undefined,
                  opacity: lit(n.id),
                }}
              >
                <Ico name={doc.res?.icon ?? 'star'} size={GATE_BADGE_ICON} stroke={2.4} />
                {n.gate.cost}
              </span>
            )}

            {held?.id === n.id && !!held.risk ? (
              <span
                className="pop pointer-events-none rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                style={{ background: 'var(--danger)', color: 'var(--danger-foreground)' }}
              >
                {t('tree.holdCascade', { n: held.risk })}
              </span>
            ) : (
              labels && (
                <span
                  className="pointer-events-none rounded-full bg-surface/80 px-2 text-xs font-medium whitespace-nowrap text-foreground"
                  style={{ opacity: (st === 'locked' ? 0.5 : 1) * lit(n.id) }}
                >
                  {n.title}
                </span>
              )
            )}
          </div>
        )
      })}
    </>
  )
})
