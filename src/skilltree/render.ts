import type { EdgeStyle, Layout, Shape, SkillNode, SkillTreeDoc, Theme } from './spec.ts'

export const DEFAULT_THEME: Theme = {
  shape: 'circle',
  edge: 'solid',
  bg: 'dots',
  arrows: false,
}

export function themeOf(doc: SkillTreeDoc): Theme {
  return {
    shape: doc.theme?.shape ?? DEFAULT_THEME.shape,
    edge: doc.theme?.edge ?? DEFAULT_THEME.edge,
    bg: doc.theme?.bg ?? DEFAULT_THEME.bg,
    arrows: doc.theme?.arrows ?? DEFAULT_THEME.arrows,
  }
}

interface Point {
  x: number
  y: number
}

function bend(layout: Layout, a: SkillNode, b: SkillNode): [Point, Point] {
  if (layout === 'flow') {
    const m = (b.y - a.y) * 0.5
    return [
      { x: a.x, y: a.y + m },
      { x: b.x, y: b.y - m },
    ]
  }
  const m = (a.x + b.x) / 2
  return [
    { x: m, y: a.y },
    { x: m, y: b.y },
  ]
}

export function edgePath(layout: Layout, edge: EdgeStyle, a: SkillNode, b: SkillNode): string {
  if (edge === 'step') {
    if (layout === 'mind') {
      const m = (a.x + b.x) / 2
      return `M${a.x} ${a.y} H ${m} V ${b.y} H ${b.x}`
    }
    const m = (a.y + b.y) / 2
    return `M${a.x} ${a.y} V ${m} H ${b.x} V ${b.y}`
  }
  if (layout === 'flow' || layout === 'mind') {
    const [c1, c2] = bend(layout, a, b)
    return `M${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`
  }
  return `M${a.x} ${a.y} L ${b.x} ${b.y}`
}

export interface EdgeArrow extends Point {
  deg: number
}

export function edgeArrow(layout: Layout, edge: EdgeStyle, a: SkillNode, b: SkillNode): EdgeArrow {
  const deg = (dx: number, dy: number) => (Math.atan2(dy, dx) * 180) / Math.PI

  if (edge === 'step') {
    if (layout === 'mind') {
      const m = (a.x + b.x) / 2
      return { x: m, y: (a.y + b.y) / 2, deg: b.y >= a.y ? 90 : -90 }
    }
    const m = (a.y + b.y) / 2
    return { x: (a.x + b.x) / 2, y: m, deg: b.x >= a.x ? 0 : 180 }
  }

  if (layout === 'flow' || layout === 'mind') {
    const [c1, c2] = bend(layout, a, b)
    const at = (p0: number, p1: number, p2: number, p3: number) => (p0 + 3 * p1 + 3 * p2 + p3) / 8
    const slope = (p0: number, p1: number, p2: number, p3: number) =>
      0.75 * (p1 - p0) + 1.5 * (p2 - p1) + 0.75 * (p3 - p2)
    return {
      x: at(a.x, c1.x, c2.x, b.x),
      y: at(a.y, c1.y, c2.y, b.y),
      deg: deg(slope(a.x, c1.x, c2.x, b.x), slope(a.y, c1.y, c2.y, b.y)),
    }
  }

  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, deg: deg(b.x - a.x, b.y - a.y) }
}

export function nodeSize(layout: Layout, node: SkillNode): number {
  if (layout === 'flow') return node.kind === 'boss' ? 76 : 64
  if (layout === 'mind') return node.kind === 'core' ? 84 : node.kind === 'leaf' ? 54 : 64
  return node.kind === 'boss' ? 72 : 58
}

export function edgeWidth(layout: Layout): number {
  return layout === 'flow' ? 7 : 3
}

const ARROW_SCALE = 1.1

export const LABEL_MIN_ZOOM = 0.55

export function edgeArrowPath(
  layout: Layout,
  edge: EdgeStyle,
  a: SkillNode,
  b: SkillNode,
): string {
  const { x, y, deg } = edgeArrow(layout, edge, a, b)
  const size = edgeWidth(layout) * ARROW_SCALE
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const at = (ux: number, uy: number) =>
    `${(x + (ux * cos - uy * sin) * size).toFixed(2)} ${(y + (ux * sin + uy * cos) * size).toFixed(2)}`
  return `M${at(0, 0)} L ${at(-1.7, 1)} L ${at(-1.7, -1)} Z`
}

const NODE_POLY: Partial<Record<Shape, readonly (readonly [number, number])[]>> = {
  hex: [
    [25, 6.7],
    [75, 6.7],
    [100, 50],
    [75, 93.3],
    [25, 93.3],
    [0, 50],
  ],
  diamond: [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50],
  ],
}

export function nodePoly(shape: Shape): readonly (readonly [number, number])[] | undefined {
  return NODE_POLY[shape]
}

export const SQUARE_RADIUS = 0.24

export const GLOW_LAYERS: readonly (readonly [number, number])[] = [
  [4.5, 0.1],
  [2.4, 0.22],
]

export function nodeShapePath(shape: Shape, size: number, inset = 0): string {
  const s = size - inset * 2
  const o = inset
  const n = (v: number) => +v.toFixed(2)
  const poly = NODE_POLY[shape]
  if (poly)
    return `M${poly
      .map(([px, py]) => `${n(o + (px / 100) * s)} ${n(o + (py / 100) * s)}`)
      .join(' L ')} Z`
  if (shape === 'square') {
    const r = SQUARE_RADIUS * s
    return (
      `M${n(o + r)} ${n(o)} H${n(o + s - r)} A${n(r)} ${n(r)} 0 0 1 ${n(o + s)} ${n(o + r)}` +
      ` V${n(o + s - r)} A${n(r)} ${n(r)} 0 0 1 ${n(o + s - r)} ${n(o + s)}` +
      ` H${n(o + r)} A${n(r)} ${n(r)} 0 0 1 ${n(o)} ${n(o + s - r)}` +
      ` V${n(o + r)} A${n(r)} ${n(r)} 0 0 1 ${n(o + r)} ${n(o)} Z`
    )
  }
  const r = s / 2
  return `M${n(o)} ${n(o + r)} a${n(r)} ${n(r)} 0 1 0 ${n(s)} 0 a${n(r)} ${n(r)} 0 1 0 ${n(-s)} 0 Z`
}
