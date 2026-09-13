import { useRef, useState } from 'react'
import { edgePath, edgeWidth, nodeSize, themeOf, type SkillNode, type SkillTreeDoc } from '../skilltree/index.ts'
import { GATE_BADGE_ICON, shapeStyle } from '../tree-view/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { useT } from '../host/store.ts'

export type Mode = 'pick' | 'link' | 'add'

const HANDLE = 20

const DROP_SLACK = 8

const CLICK_SLOP = 4

function grab(e: React.PointerEvent) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId)
  } catch {
  }
}

function nodeAt(doc: SkillTreeDoc, x: number, y: number): SkillNode | undefined {
  return doc.nodes.find((n) => {
    const r = nodeSize(doc.layout, n) / 2 + DROP_SLACK
    return Math.abs(n.x - x) <= r && Math.abs(n.y - y) <= r
  })
}

export function EditTreeView({
  doc,
  mode,
  locked,
  selected,
  linkFrom,
  pending,
  getK,
  onPick,
  onDragStart,
  onDrag,
  onCutEdge,
  onLinkTo,
  onLinkToBlank,
}: {
  doc: SkillTreeDoc
  mode: Mode
  locked: boolean
  selected?: string
  linkFrom?: string
  pending?: string[]
  getK: () => number
  onPick: (id: string) => void
  onDragStart: () => void
  onDrag: (id: string, dx: number, dy: number) => void
  onCutEdge: (i: number) => void
  onLinkTo: (from: string, to: string) => void
  onLinkToBlank: (from: string, x: number, y: number) => void
}) {
  const t = useT()
  const byId = new Map(doc.nodes.map((n) => [n.id, n]))
  const accent = doc.meta.accent ?? 'var(--accent)'
  const { shape, edge } = themeOf(doc)
  const { clip, radius } = shapeStyle(shape)
  const drag = useRef<{
    id: string
    pointerId: number
    x: number
    y: number
    moved: boolean
  } | null>(null)
  const canDrag = mode === 'pick' && !locked

  const [rope, setRope] = useState<{ from: string; x: number; y: number } | null>(null)
  const ropeStart = useRef<{
    pointerId: number
    x: number
    y: number
    nx: number
    ny: number
  } | null>(null)
  const ropeAt = useRef<{ x: number; y: number } | null>(null)
  const ropeFrom = rope ? byId.get(rope.from) : undefined
  const ropeHit = rope ? nodeAt(doc, rope.x, rope.y) : undefined

  const dropRope = () => {
    ropeStart.current = null
    ropeAt.current = null
    setRope(null)
  }

  return (
    <>
      <svg width="1" height="1" style={{ overflow: 'visible' }}>
        {doc.edges.map(([f, to], i) => {
          const a = byId.get(f)
          const b = byId.get(to)
          if (!a || !b) return null
          return (
            <g key={`${f}-${to}-${i}`}>
              {edge === 'glow' && (
                <path
                  d={edgePath(doc.layout, edge, a, b)}
                  fill="none"
                  stroke={accent}
                  strokeOpacity={0.18}
                  strokeWidth={edgeWidth(doc.layout) * 3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                />
              )}
              <path
                d={edgePath(doc.layout, edge, a, b)}
                fill="none"
                stroke={accent}
                strokeOpacity={0.5}
                strokeWidth={edgeWidth(doc.layout)}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={edge === 'dashed' ? '6 8' : undefined}
                className="pointer-events-none"
              />
              {mode === 'link' && (
                <circle
                  cx={(a.x + b.x) / 2}
                  cy={(a.y + b.y) / 2}
                  r={11}
                  fill="var(--danger)"
                  className="cursor-pointer"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    onCutEdge(i)
                  }}
                />
              )}
            </g>
          )
        })}

        {rope && ropeFrom && (
          <path
            d={`M ${ropeFrom.x} ${ropeFrom.y} L ${rope.x} ${rope.y}`}
            fill="none"
            stroke={accent}
            strokeWidth={ropeHit ? edgeWidth(doc.layout) * 1.6 : edgeWidth(doc.layout)}
            strokeDasharray={ropeHit ? undefined : '6 6'}
            strokeLinecap="round"
            className="pointer-events-none"
          />
        )}
      </svg>

      {doc.nodes.map((n) => {
        const s = nodeSize(doc.layout, n)
        const isNew = pending?.includes(n.id) ?? false
        const isTarget = ropeHit?.id === n.id && rope?.from !== n.id
        return (
          <div
            key={n.id}
            className="absolute flex flex-col items-center gap-1 select-none"
            style={{ left: n.x, top: n.y, transform: 'translate(-50%, -50%)' }}
          >
            <div
              onPointerDown={(e) => {
                e.stopPropagation()
                if (e.button !== 0) return
                grab(e)
                drag.current = {
                  id: n.id,
                  pointerId: e.pointerId,
                  x: e.clientX,
                  y: e.clientY,
                  moved: false,
                }
              }}
              onPointerMove={(e) => {
                const d = drag.current
                if (!d || d.id !== n.id || d.pointerId !== e.pointerId) return
                if (e.buttons === 0) {
                  drag.current = null
                  return
                }
                if (!canDrag) return
                if (!d.moved) {
                  if (Math.hypot(e.clientX - d.x, e.clientY - d.y) <= CLICK_SLOP) return
                  d.moved = true
                  onDragStart()
                }
                const k = getK()
                onDrag(n.id, (e.clientX - d.x) / k, (e.clientY - d.y) / k)
                d.x = e.clientX
                d.y = e.clientY
              }}
              onPointerUp={(e) => {
                const d = drag.current
                if (!d || d.id !== n.id || d.pointerId !== e.pointerId) return
                drag.current = null
                if (!d.moved) onPick(n.id)
              }}
              onPointerCancel={(e) => {
                if (drag.current?.pointerId === e.pointerId) drag.current = null
              }}
              onLostPointerCapture={(e) => {
                if (drag.current?.pointerId === e.pointerId) drag.current = null
              }}
              className="relative flex touch-none items-center justify-center"
              style={{
                width: s,
                height: s,
                borderRadius: clip ? undefined : radius,
                clipPath: clip,
                cursor: canDrag ? 'grab' : 'pointer',
                background: clip
                  ? linkFrom === n.id || isTarget
                    ? 'var(--warning)'
                    : selected === n.id
                      ? accent
                      : 'color-mix(in oklab, var(--foreground) 20%, transparent)'
                  : isNew
                    ? `color-mix(in oklab, ${accent} 18%, var(--surface))`
                    : 'var(--surface)',
                boxShadow: clip
                  ? undefined
                  : linkFrom === n.id || isTarget
                    ? `0 0 0 4px var(--warning)`
                    : selected === n.id
                      ? `0 0 0 4px ${accent}`
                      : `0 0 0 2px color-mix(in oklab, var(--foreground) 14%, transparent)`,
                outline: isNew ? `2px dashed ${accent}` : undefined,
                outlineOffset: 5,
              }}
            >
              {clip ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: s - 6,
                    height: s - 6,
                    clipPath: clip,
                    background: isNew
                      ? `color-mix(in oklab, ${accent} 18%, var(--surface))`
                      : 'var(--surface)',
                  }}
                >
                  <Ico name={n.icon ?? 'dot'} size={s * 0.42} />
                </div>
              ) : (
                <Ico name={n.icon ?? 'dot'} size={s * 0.42} />
              )}
              {!!n.gate?.cost && (
                <span className="absolute -top-1 -right-1 flex items-center gap-0.5 rounded-full bg-surface-tertiary px-1.5 py-px text-[10px] font-semibold">
                  <Ico name={doc.res?.icon ?? 'star'} size={GATE_BADGE_ICON} stroke={2.4} />
                  {n.gate.cost}
                </span>
              )}

              {selected === n.id && mode !== 'link' && (
                <button
                  aria-label={t('editor.addEdge')}
                  className="absolute touch-none rounded-full shadow-overlay"
                  style={{
                    width: HANDLE,
                    height: HANDLE,
                    right: -HANDLE / 2,
                    bottom: -HANDLE / 2,
                    background: accent,
                    color: '#fff',
                    cursor: 'crosshair',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    if (e.button !== 0) return
                    grab(e)
                    ropeStart.current = {
                      pointerId: e.pointerId,
                      x: e.clientX,
                      y: e.clientY,
                      nx: n.x,
                      ny: n.y,
                    }
                    ropeAt.current = { x: n.x, y: n.y }
                    setRope({ from: n.id, x: n.x, y: n.y })
                  }}
                  onPointerMove={(e) => {
                    const from = ropeStart.current
                    if (!from || from.pointerId !== e.pointerId) return
                    if (e.buttons === 0) return dropRope()
                    const k = getK()
                    const at = {
                      x: from.nx + (e.clientX - from.x) / k,
                      y: from.ny + (e.clientY - from.y) / k,
                    }
                    ropeAt.current = at
                    setRope({ from: n.id, ...at })
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation()
                    const at = ropeAt.current
                    const started = ropeStart.current
                    if (started && started.pointerId !== e.pointerId) return
                    dropRope()
                    if (!at || !started) return
                    const hit = nodeAt(doc, at.x, at.y)
                    if (hit?.id === n.id) return
                    if (hit) onLinkTo(n.id, hit.id)
                    else onLinkToBlank(n.id, at.x, at.y)
                  }}
                  onPointerCancel={(e) => {
                    if (ropeStart.current?.pointerId === e.pointerId) dropRope()
                  }}
                  onLostPointerCapture={(e) => {
                    if (ropeStart.current?.pointerId === e.pointerId) dropRope()
                  }}
                >
                  <span className="flex items-center justify-center">
                    <Ico name="link" size={ICON.tiny} />
                  </span>
                </button>
              )}
            </div>
            <span className="pointer-events-none rounded-full bg-surface/80 px-2 text-xs whitespace-nowrap">
              {n.title}
            </span>
          </div>
        )
      })}
    </>
  )
}
