import type { Layout, SkillEdge, SkillNode, SkillTreeDoc } from './spec.ts'

function depths(nodes: readonly SkillNode[], edges: readonly SkillEdge[]): Map<string, number> {
  const kids = new Map<string, string[]>()
  const indeg = new Map(nodes.map((n) => [n.id, 0]))

  for (const [a, b] of edges) {
    if (!indeg.has(a) || !indeg.has(b)) continue
    kids.set(a, [...(kids.get(a) ?? []), b])
    indeg.set(b, (indeg.get(b) ?? 0) + 1)
  }

  const depth = new Map(nodes.map((n) => [n.id, 0]))
  const left = new Map(indeg)
  const done = new Set<string>()
  const queue = nodes.filter((n) => !indeg.get(n.id)).map((n) => n.id)

  const emit = (id: string): void => {
    done.add(id)
    for (const kid of kids.get(id) ?? []) {
      if (done.has(kid)) continue
      depth.set(kid, Math.max(depth.get(kid) ?? 0, (depth.get(id) ?? 0) + 1))
      const rest = (left.get(kid) ?? 0) - 1
      left.set(kid, rest)
      if (rest <= 0) queue.push(kid)
    }
  }

  while (done.size < nodes.length) {
    while (queue.length > 0) {
      const id = queue.shift()
      if (id === undefined || done.has(id)) continue
      emit(id)
    }
    if (done.size >= nodes.length) break

    const stuck = nodes.filter((n) => !done.has(n.id))
    let pick = stuck[0]
    for (const n of stuck) {
      if ((left.get(n.id) ?? 0) < (left.get(pick?.id ?? '') ?? 0)) pick = n
    }
    if (!pick) break
    left.set(pick.id, 0)
    queue.push(pick.id)
  }

  return depth
}

function rowsOf(
  nodes: readonly SkillNode[],
  depth: Map<string, number>,
): [number, SkillNode[]][] {
  const rows = new Map<number, SkillNode[]>()
  for (const n of nodes) {
    const k = depth.get(n.id) ?? 0
    rows.set(k, [...(rows.get(k) ?? []), n])
  }
  return [...rows.entries()].sort((a, b) => a[0] - b[0])
}

const FLOW_WAVE = [0, 110, 0, -110]

const MIND_GAP = 96

const ringFor = (count: number) =>
  count < 2 ? 0 : Math.ceil(MIND_GAP / (2 * Math.sin(Math.PI / count)))

const angleFor = (r: number) =>
  r <= 0 ? Math.PI * 2 : 2 * Math.asin(Math.min(1, MIND_GAP / (2 * r)))

const turn = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

function ringRadii(rows: readonly [number, SkillNode[]][]): Map<number, number> {
  const radii = new Map<number, number>()
  let prev = 0
  for (const [at, row] of rows) {
    const nominal = at === 0 ? 0 : 280 + (at - 1) * 200
    const r = at === 0 ? ringFor(row.length) : Math.max(nominal, ringFor(row.length), prev + 200)
    radii.set(at, r)
    prev = r
  }
  return radii
}

function spread(row: readonly SkillNode[], want: readonly number[], r: number): number[] {
  const m = row.length
  if (m < 2) return [...want]

  const order = want.map((a, i) => ({ i, at: turn(a) })).sort((x, y) => x.at - y.at || x.i - y.i)
  const need = angleFor(r)
  const tight = order.some((cur, k) => {
    const nextOne = order[(k + 1) % m]
    if (!nextOne) return false
    const gap = k === m - 1 ? nextOne.at + Math.PI * 2 - cur.at : nextOne.at - cur.at
    return gap < need
  })
  if (!tight) return [...want]

  const step = (Math.PI * 2) / m
  const base = order[0]?.at ?? 0
  const fixed = [...want]
  order.forEach((slot, k) => {
    fixed[slot.i] = base + k * step
  })
  return fixed
}

export function layoutNodes(
  nodes: readonly SkillNode[],
  edges: readonly SkillEdge[],
  layout: Layout,
): SkillNode[] {
  const depth = depths(nodes, edges)
  const rows = rowsOf(nodes, depth)
  const out = new Map<string, SkillNode>()

  if (layout === 'mind') {
    const parent = new Map<string, string>()
    for (const [a, b] of edges) if (!parent.has(b)) parent.set(b, a)

    const roots = rows[0]?.[0] === 0 ? (rows[0]?.[1].length ?? 0) : 0
    const radii = ringRadii(rows)
    const angle = new Map<string, number>()

    const beside = (row: readonly SkillNode[], n: SkillNode): number => {
      const p = parent.get(n.id)
      const sibs = row.filter((m) => parent.get(m.id) === p)
      return (angle.get(p ?? '') ?? 0) + (sibs.indexOf(n) - (sibs.length - 1) / 2) * 0.42
    }

    for (const [at, row] of rows) {
      const r = radii.get(at) ?? 0
      const want = row.map((n, i) => {
        const ring = (i / row.length) * Math.PI * 2 - Math.PI / 2
        if (at === 0) return roots < 2 ? 0 : ring
        if (at === 1) return roots < 2 ? ring : beside(row, n)
        return beside(row, n)
      })
      const fixed = spread(row, want, r)
      row.forEach((n, i) => {
        const a = fixed[i] ?? 0
        angle.set(n.id, a)
        out.set(n.id, { ...n, x: Math.round(Math.cos(a) * r), y: Math.round(Math.sin(a) * r) })
      })
    }
    return nodes.map((n) => out.get(n.id) ?? n)
  }

  if (layout === 'flow') {
    for (const [at, row] of rows) {
      row.forEach((n, i) => {
        out.set(n.id, {
          ...n,
          x: (FLOW_WAVE[at % 4] ?? 0) + (i - (row.length - 1) / 2) * 190,
          y: at * 125,
        })
      })
    }
    return nodes.map((n) => out.get(n.id) ?? n)
  }

  for (const [at, row] of rows) {
    row.forEach((n, i) => {
      out.set(n.id, { ...n, x: (i - (row.length - 1) / 2) * 200, y: at * 155 })
    })
  }
  return nodes.map((n) => out.get(n.id) ?? n)
}

export function relayout(doc: SkillTreeDoc, layout?: Layout): SkillTreeDoc {
  const next = layout ?? doc.layout
  return { ...doc, layout: next, nodes: layoutNodes(doc.nodes, doc.edges, next) }
}

const MIN_PAD = 80

export function boundsOf(doc: SkillTreeDoc): { x: number; y: number; w: number; h: number } {
  if (doc.nodes.length === 0) return { x: -MIN_PAD, y: -MIN_PAD, w: MIN_PAD * 2, h: MIN_PAD * 2 }

  const xs = doc.nodes.map((n) => n.x)
  const ys = doc.nodes.map((n) => n.y)
  const spanX = Math.max(...xs) - Math.min(...xs)
  const spanY = Math.max(...ys) - Math.min(...ys)
  const pad = Math.max(MIN_PAD, Math.max(spanX, spanY) * 0.12)

  const x = Math.min(...xs) - pad
  const y = Math.min(...ys) - pad
  return {
    x,
    y,
    w: spanX + pad * 2,
    h: spanY + pad * 2,
  }
}
