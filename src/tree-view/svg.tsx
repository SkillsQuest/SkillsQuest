import {
  edgeArrowPath,
  edgePath,
  edgeWidth,
  nodeSize,
  themeOf,
  type NodeState,
  type Shape,
  type SkillTreeDoc,
} from '../skilltree/index.ts'
import { GLOW_LAYERS, SQUARE_RADIUS, polyPoints } from './shape.ts'
import { nodeIconPath } from '../lib/nodeIcons.ts'
import { IconArt } from './iconArt.tsx'

export interface SvgPalette {
  bg: string
  fg: string
  surface: string
  chip: string
  warning: string
  warningFg: string
  accent: string
  accentFg: string
}

export const LIGHT_PALETTE: SvgPalette = {
  bg: '#f5f5f5',
  fg: '#18181b',
  surface: '#ffffff',
  chip: '#eaeaeb',
  warning: '#f5a524',
  warningFg: '#18181b',
  accent: '#0485f7',
  accentFg: '#ffffff',
}

const LABEL = { font: 12, h: 16, gap: 4, pad: 8 } as const
const BADGE = { font: 10, h: 14, icon: 9, pad: 6, gap: 2 } as const
const PAD = 40
const ICON_RATIO = 0.42
const CLIP_RING = 6
const DROP = 5
const FONT = '-apple-system, "SF Pro SC", "PingFang SC", "Segoe UI", system-ui, sans-serif'

function textEm(text: string): number {
  let em = 0
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0
    const wide =
      (c >= 0x1100 && c <= 0x115f) ||
      (c >= 0x2e80 && c <= 0xa4cf) ||
      (c >= 0xac00 && c <= 0xd7a3) ||
      (c >= 0xf900 && c <= 0xfaff) ||
      (c >= 0xfe30 && c <= 0xfe4f) ||
      (c >= 0xff00 && c <= 0xff60) ||
      (c >= 0xffe0 && c <= 0xffe6) ||
      (c >= 0x20000 && c <= 0x3fffd)
    em += wide ? 1 : 0.55
  }
  return em
}

const labelWidth = (title: string) => textEm(title) * LABEL.font + LABEL.pad * 2

export interface TreeSvgBox {
  x: number
  y: number
  w: number
  h: number
}

export function treeSvgBounds(doc: SkillTreeDoc): TreeSvgBox {
  if (doc.nodes.length === 0) return { x: -PAD, y: -PAD, w: PAD * 2, h: PAD * 2 }

  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const node of doc.nodes) {
    const half = Math.max(nodeSize(doc.layout, node) / 2, labelWidth(node.title) / 2)
    x0 = Math.min(x0, node.x - half)
    x1 = Math.max(x1, node.x + half)
    const r = nodeSize(doc.layout, node) / 2
    y0 = Math.min(y0, node.y - r - BADGE.h / 2)
    y1 = Math.max(y1, node.y + r + LABEL.gap + LABEL.h)
  }
  return { x: x0 - PAD, y: y0 - PAD, w: x1 - x0 + PAD * 2, h: y1 - y0 + PAD * 2 }
}

function Figure({
  shape,
  cx,
  cy,
  size,
  ...paint
}: { shape: Shape; cx: number; cy: number; size: number; fill: string; fillOpacity?: number }) {
  const half = size / 2
  if (shape === 'circle') return <circle cx={cx} cy={cy} r={half} {...paint} />
  if (shape === 'square')
    return (
      <rect
        x={cx - half}
        y={cy - half}
        width={size}
        height={size}
        rx={size * SQUARE_RADIUS}
        {...paint}
      />
    )
  return <polygon points={polyPoints(shape, cx, cy, size)} {...paint} />
}

function Backdrop({
  doc,
  box,
  palette,
  accent,
  id,
}: {
  doc: SkillTreeDoc
  box: TreeSvgBox
  palette: SvgPalette
  accent: string
  id: string
}) {
  const { bg } = themeOf(doc)
  const ground = <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={palette.bg} />
  if (bg === 'plain') return ground

  if (bg === 'glow') {
    const cx = box.x + box.w / 2
    const cy = box.y
    const r = box.w * 1.2
    const squash = (box.h * 0.8) / r
    return (
      <>
        {ground}
        <defs>
          <radialGradient
            id={`${id}-glow`}
            gradientUnits="userSpaceOnUse"
            cx={cx}
            cy={cy}
            r={r}
            gradientTransform={`translate(${cx} ${cy}) scale(1 ${squash}) translate(${-cx} ${-cy})`}
          >
            <stop offset="0" stopColor={accent} stopOpacity={0.18} />
            <stop offset="0.7" stopColor={accent} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={`url(#${id}-glow)`} />
      </>
    )
  }

  const tile = bg === 'grid' ? 32 : 28
  return (
    <>
      {ground}
      <defs>
        <pattern id={`${id}-bg`} width={tile} height={tile} patternUnits="userSpaceOnUse">
          {bg === 'grid' ? (
            <>
              <rect width={tile} height={1} fill={palette.fg} fillOpacity={0.08} />
              <rect width={1} height={tile} fill={palette.fg} fillOpacity={0.08} />
            </>
          ) : (
            <circle cx={tile / 2} cy={tile / 2} r={1} fill={palette.fg} fillOpacity={0.14} />
          )}
        </pattern>
      </defs>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={`url(#${id}-bg)`} />
    </>
  )
}

function CostBadge({
  cost,
  icon,
  cx,
  cy,
  fill,
  ink,
}: {
  cost: number
  icon: string
  cx: number
  cy: number
  fill: string
  ink: string
}) {
  const text = String(cost)
  const w = BADGE.pad * 2 + BADGE.icon + BADGE.gap + textEm(text) * BADGE.font
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-w} y={-BADGE.h / 2} width={w} height={BADGE.h} rx={BADGE.h / 2} fill={fill} />
      <g transform={`translate(${-w + BADGE.pad} ${-BADGE.icon / 2})`}>
        <IconArt d={nodeIconPath(icon)} size={BADGE.icon} stroke={2.4} style={{ color: ink }} />
      </g>
      <text
        x={-BADGE.pad}
        y={BADGE.font * 0.36}
        textAnchor="end"
        fontSize={BADGE.font}
        fontWeight={600}
        fill={ink}
      >
        {text}
      </text>
    </g>
  )
}

function SvgNode({
  doc,
  node,
  state,
  shape,
  palette,
  accent,
}: {
  doc: SkillTreeDoc
  node: SkillTreeDoc['nodes'][number]
  state: NodeState | undefined
  shape: Shape
  palette: SvgPalette
  accent: string
}) {
  const s = nodeSize(doc.layout, node)
  const done = state === 'done'
  const open = state === 'open'
  const blocked = state === 'blocked'
  const locked = state === 'locked'
  const clip = shape === 'hex' || shape === 'diamond'
  const ringW = open || blocked ? 3 : 2
  const ring = done || open ? accent : blocked ? palette.warning : palette.fg
  const ringOpacity = done || open || blocked ? 1 : 0.14
  const inner = clip ? s - CLIP_RING : s
  const icon = locked ? 'lock' : (node.icon ?? 'dot')
  const iconSize = s * ICON_RATIO
  const cost = !done && node.gate?.cost
  const label = labelWidth(node.title)

  return (
    <g opacity={locked ? 0.4 : 1}>
      {done && (
        <>
          <Figure shape={shape} cx={node.x} cy={node.y + DROP} size={s} fill={accent} />
          <Figure shape={shape} cx={node.x} cy={node.y + DROP} size={s} fill="#000" fillOpacity={0.3} />
        </>
      )}
      {(!done || clip) && (
        <Figure
          shape={shape}
          cx={node.x}
          cy={node.y}
          size={clip ? s : s + ringW * 2}
          fill={ring}
          fillOpacity={ringOpacity}
        />
      )}
      <Figure
        shape={shape}
        cx={node.x}
        cy={node.y}
        size={inner}
        fill={done ? accent : palette.surface}
      />
      {blocked && (
        <Figure
          shape={shape}
          cx={node.x}
          cy={node.y}
          size={inner}
          fill={palette.warning}
          fillOpacity={0.18}
        />
      )}
      <g transform={`translate(${node.x - iconSize / 2} ${node.y - iconSize / 2})`}>
        <IconArt
          d={nodeIconPath(icon)}
          size={iconSize}
          stroke={done ? 2 : 1.7}
          style={{ color: done ? palette.accentFg : palette.fg }}
        />
      </g>

      {!!cost && (
        <CostBadge
          cost={cost}
          icon={doc.res?.icon ?? 'star'}
          cx={node.x + s / 2}
          cy={node.y - s / 2}
          fill={blocked ? palette.warning : palette.chip}
          ink={blocked ? palette.warningFg : palette.fg}
        />
      )}

      <g transform={`translate(${node.x} ${node.y + s / 2 + LABEL.gap})`} opacity={locked ? 0.5 : 1}>
        <rect
          x={-label / 2}
          width={label}
          height={LABEL.h}
          rx={LABEL.h / 2}
          fill={palette.surface}
          fillOpacity={0.8}
        />
        <text
          y={LABEL.h / 2 + LABEL.font * 0.36}
          textAnchor="middle"
          fontSize={LABEL.font}
          fontWeight={500}
          fill={palette.fg}
        >
          {node.title}
        </text>
      </g>
    </g>
  )
}

export interface TreeSvgProps {
  doc: SkillTreeDoc
  states?: ReadonlyMap<string, NodeState> | Record<string, NodeState>
  palette?: SvgPalette
  scale?: number
  id?: string
}

function stateOf(states: TreeSvgProps['states'], id: string): NodeState | undefined {
  if (!states) return undefined
  if (states instanceof Map) return states.get(id)
  return (states as Record<string, NodeState>)[id]
}

export function TreeSvg({ doc, states, palette = LIGHT_PALETTE, scale = 1, id = 'tsvg' }: TreeSvgProps) {
  const box = treeSvgBounds(doc)
  const { shape, edge, arrows } = themeOf(doc)
  const accent = doc.meta.accent ?? palette.accent
  const byId = new Map(doc.nodes.map((n) => [n.id, n]))
  const w = edgeWidth(doc.layout)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={Math.round(box.w * scale)}
      height={Math.round(box.h * scale)}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      fontFamily={FONT}
    >
      <Backdrop doc={doc} box={box} palette={palette} accent={accent} id={id} />

      <g>
        {doc.edges.map(([from, to]) => {
          const a = byId.get(from)
          const b = byId.get(to)
          if (!a || !b) return null
          const live = stateOf(states, from) === 'done'
          const d = edgePath(doc.layout, edge, a, b)
          return (
            <g key={`${from}-${to}`}>
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
                stroke={live ? accent : palette.fg}
                strokeOpacity={live ? 0.85 : 0.16}
                strokeWidth={w}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={live && edge !== 'dashed' ? undefined : '6 8'}
              />
              {arrows && (
                <path
                  d={edgeArrowPath(doc.layout, edge, a, b)}
                  fill={live ? accent : palette.fg}
                  fillOpacity={live ? 0.85 : 0.28}
                />
              )}
            </g>
          )
        })}
      </g>

      <g>
        {doc.nodes.map((node) => (
          <SvgNode
            key={node.id}
            doc={doc}
            node={node}
            state={stateOf(states, node.id)}
            shape={shape}
            palette={palette}
            accent={accent}
          />
        ))}
      </g>
    </svg>
  )
}
