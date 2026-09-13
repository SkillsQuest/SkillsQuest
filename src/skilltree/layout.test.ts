import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { boundsOf, layoutNodes, relayout } from './layout.ts'
import { nodeSize } from './render.ts'
import {
  SPEC_VERSION,
  type Layout,
  type SkillEdge,
  type SkillNode,
  type SkillTreeDoc,
} from './spec.ts'

const LAYOUTS: Layout[] = ['flow', 'web', 'mind']

const nodes = (...ids: string[]): SkillNode[] =>
  ids.map((id) => ({ id, title: id, x: 0, y: 0 }))

const many = (count: number): SkillNode[] =>
  Array.from({ length: count }, (_, i) => ({ id: `p${i}`, title: `p${i}`, x: 0, y: 0 }))

function forest(roots: number, kids: number): [SkillNode[], SkillEdge[]] {
  const ns: SkillNode[] = []
  const es: SkillEdge[] = []
  for (let r = 0; r < roots; r += 1) {
    ns.push({ id: `r${r}`, title: `r${r}`, x: 0, y: 0 })
    for (let c = 0; c < kids; c += 1) {
      ns.push({ id: `c${r}_${c}`, title: `c${r}_${c}`, x: 0, y: 0 })
      es.push([`r${r}`, `c${r}_${c}`])
    }
  }
  return [ns, es]
}

function closest(out: readonly SkillNode[]): number {
  let min = Infinity
  for (let i = 0; i < out.length; i += 1) {
    for (let j = i + 1; j < out.length; j += 1) {
      const a = out[i]
      const b = out[j]
      if (!a || !b) continue
      min = Math.min(min, Math.hypot(a.x - b.x, a.y - b.y))
    }
  }
  return min
}

function assertRoomy(out: readonly SkillNode[], layout: Layout, why: string): void {
  const widest = Math.max(
    ...out.map((n) => Math.max(nodeSize(layout, n), nodeSize(layout, { ...n, kind: 'core' }))),
  )
  const gap = closest(out)
  assert.ok(gap >= widest, `${why}（${layout}）：最近点只隔 ${Math.round(gap)}px，节点宽 ${widest}px`)
}

const doc = (ns: SkillNode[], edges: SkillEdge[]): SkillTreeDoc => ({
  spec: SPEC_VERSION,
  meta: { name: 't' },
  layout: 'flow',
  nodes: ns,
  edges,
})

describe('layoutNodes', () => {
  it('按最长路径分层，不是按首次访问', () => {
    const out = layoutNodes(nodes('a', 'b', 'c'), [
      ['a', 'b'],
      ['b', 'c'],
      ['a', 'c'],
    ], 'flow')
    const y = new Map(out.map((n) => [n.id, n.y]))

    assert.equal(y.get('a'), 0)
    assert.equal(y.get('b'), 125)
    assert.equal(y.get('c'), 250)
  })

  it('成环也能返回，不死循环', () => {
    const out = layoutNodes(nodes('a', 'b'), [
      ['a', 'b'],
      ['b', 'a'],
    ], 'web')

    assert.equal(out.length, 2)
    assert.ok(out.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)))
  })

  it('只动坐标，不动语义', () => {
    const source: SkillNode[] = [
      { id: 'a', title: '关卡', x: 999, y: 999, kind: 'boss', gate: { cost: 2 } },
    ]
    const [out] = layoutNodes(source, [], 'mind')

    assert.equal(out?.kind, 'boss')
    assert.deepEqual(out?.gate, { cost: 2 })
    assert.notEqual(out?.x, 999)
  })

  it('同样的输入永远得到同样的坐标', () => {
    const edges: SkillEdge[] = [['a', 'b'], ['a', 'c'], ['b', 'd']]
    const first = layoutNodes(nodes('a', 'b', 'c', 'd'), edges, 'mind')
    const second = layoutNodes(nodes('a', 'b', 'c', 'd'), edges, 'mind')

    assert.deepEqual(first, second)
  })

  it('孤立节点不会全部堆在原点', () => {
    const out = layoutNodes(nodes('a', 'b', 'c'), [], 'web')
    const xs = new Set(out.map((n) => n.x))

    assert.equal(xs.size, 3)
  })

  it('三种形态下孤立节点都摆得开', () => {
    for (const layout of LAYOUTS) {
      assertRoomy(layoutNodes(many(5), [], layout), layout, '五个孤立节点')
    }
  })

  it('孤立节点很多时也摆得开，不是只保证坐标不同', () => {
    for (const layout of LAYOUTS) {
      for (const count of [2, 3, 7, 12, 20, 30, 50]) {
        assertRoomy(layoutNodes(many(count), [], layout), layout, `${count} 个孤立节点`)
      }
    }
  })

  it('并列的几棵子树，根不会叠在一起', () => {
    for (const layout of LAYOUTS) {
      assertRoomy(layoutNodes(nodes('a', 'b', 'c', 'd'), [['a', 'd']], layout), layout, '并列的根')
    }
  })

  it('多根 × 多子：外圈也要摆得开，不能只在「每根一个子」时过', () => {
    for (const [roots, kids] of [
      [20, 1],
      [12, 2],
      [30, 2],
      [8, 3],
      [30, 3],
      [5, 4],
    ] as const) {
      const [ns, es] = forest(roots, kids)
      assertRoomy(layoutNodes(ns, es, 'mind'), 'mind', `${roots} 根 × ${kids} 子`)
    }
  })

  it('圈上挤不下时才重排，不挤的圈一个数都不动', () => {
    const [ns, es] = forest(1, 6)
    const out = layoutNodes(ns, es, 'mind')

    assert.deepEqual(
      out.map((n) => [n.id, n.x, n.y]),
      [
        ['r0', 0, 0],
        ['c0_0', 0, -280],
        ['c0_1', 242, -140],
        ['c0_2', 242, 140],
        ['c0_3', 0, 280],
        ['c0_4', -242, 140],
        ['c0_5', -242, -140],
      ],
    )
  })

  it('全是环的树：摆得开，也不会被甩到几千像素外', () => {
    const ring: SkillEdge[] = [['r1', 'r2'], ['r2', 'r3'], ['r3', 'r1']]

    for (const layout of LAYOUTS) {
      const out = layoutNodes(nodes('r1', 'r2', 'r3'), ring, layout)
      const spots = new Set(out.map((n) => `${n.x},${n.y}`))

      assert.equal(spots.size, 3, `${layout} 把环上的节点摆重叠了`)
      assert.ok(
        out.every((n) => Math.abs(n.x) <= 600 && Math.abs(n.y) <= 600),
        `${layout} 把环上的节点甩太远了：${JSON.stringify(out.map((n) => [n.x, n.y]))}`,
      )
    }
  })

  it('环挂在正常子树旁边时，两边的行号仍然挨着', () => {
    const out = layoutNodes(
      nodes('m1', 'm2', 'x1', 'x2', 's1', 's2'),
      [['m1', 'm2'], ['x1', 'x2'], ['x2', 'x1']],
      'web',
    )
    const ys = out.map((n) => n.y)

    assert.equal(Math.max(...ys), 155, `行数被环撑开了：${JSON.stringify(ys)}`)
    assert.equal(new Set(out.map((n) => `${n.x},${n.y}`)).size, 6)
  })

  it('整理后每个节点的坐标都由布局算出，没有一个是原样带过来的', () => {
    const source: SkillNode[] = [
      { id: 'a', title: 'a', x: 7777, y: -7777 },
      { id: 'b', title: 'b', x: 7777, y: -7777 },
      { id: 'c', title: 'c', x: 7777, y: -7777 },
      { id: 'd', title: 'd', x: 7777, y: -7777 },
    ]
    const edges: SkillEdge[] = [['a', 'b'], ['c', 'd'], ['d', 'c']]

    for (const layout of LAYOUTS) {
      const out = layoutNodes(source, edges, layout)

      assert.ok(
        out.every((n) => n.x !== 7777 || n.y !== -7777),
        `${layout} 有节点原样返回了`,
      )
    }
  })

  it('单根树的 mind 坐标一个像素没变', () => {
    const out = layoutNodes(nodes('a', 'b', 'c', 'd'), [['a', 'b'], ['a', 'c'], ['b', 'd']], 'mind')

    assert.deepEqual(
      out.map((n) => [n.id, n.x, n.y]),
      [
        ['a', 0, 0],
        ['b', 0, -280],
        ['c', 0, 280],
        ['d', 0, -480],
      ],
    )
  })
})

describe('relayout', () => {
  it('返回新对象，入参一点没动', () => {
    const source = doc(nodes('a', 'b'), [['a', 'b']])
    const next = relayout(source, 'mind')

    assert.equal(source.layout, 'flow')
    assert.equal(source.nodes[0]?.y, 0)
    assert.equal(next.layout, 'mind')
  })
})

describe('boundsOf', () => {
  it('空树给一个非零的框', () => {
    const box = boundsOf(doc([], []))

    assert.ok(box.w > 0 && box.h > 0)
  })

  it('单点树也给一个非零的框', () => {
    const box = boundsOf(doc(nodes('a'), []))

    assert.ok(box.w > 0 && box.h > 0)
  })

  it('跨度很小的树不会被留白挤成一个点', () => {
    const flat: SkillNode[] = [
      { id: 'a', title: 'a', x: 0, y: 0 },
      { id: 'b', title: 'b', x: 3, y: 0 },
    ]
    const box = boundsOf(doc(flat, []))

    assert.ok(box.w < 3 + 200, `框太宽了：${box.w}`)
  })

  it('大树的留白跟着跨度长', () => {
    const wide: SkillNode[] = [
      { id: 'a', title: 'a', x: 0, y: 0 },
      { id: 'b', title: 'b', x: 4000, y: 0 },
    ]
    const box = boundsOf(doc(wide, []))

    assert.ok(box.w > 4000, '留白不该被固定值卡住')
  })
})
