import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { edgeArrow, edgeArrowPath, nodePoly, nodeShapePath } from './render.ts'
import type { SkillNode } from './spec.ts'

const at = (x: number, y: number): SkillNode => ({ id: 'n', title: 'N', x, y })

describe('连线方向标记', () => {
  it('竖向流：中点在两点之间，方向朝下', () => {
    const arrow = edgeArrow('flow', 'solid', at(0, 0), at(0, 200))

    assert.equal(arrow.x, 0)
    assert.equal(arrow.y, 100)
    assert.equal(arrow.deg, 90, '90 度 = 指向下方')
  })

  it('反向的边给出反向的角度', () => {
    assert.equal(edgeArrow('flow', 'solid', at(0, 200), at(0, 0)).deg, -90)
  })

  it('直线：中点与斜率', () => {
    const arrow = edgeArrow('web', 'solid', at(0, 0), at(100, 100))

    assert.deepEqual([arrow.x, arrow.y], [50, 50])
    assert.equal(arrow.deg, 45)
  })

  it('折线取中间那一段的方向', () => {
    assert.equal(edgeArrow('flow', 'step', at(0, 0), at(100, 200)).deg, 0)
    assert.equal(edgeArrow('mind', 'step', at(0, 0), at(200, 100)).deg, 90)
  })

  it('中点落在曲线上', () => {
    const a = at(0, 0)
    const b = at(120, 200)
    const m = (b.y - a.y) * 0.5
    const cubic = (p0: number, p1: number, p2: number, p3: number) =>
      0.125 * p0 + 0.375 * p1 + 0.375 * p2 + 0.125 * p3

    const arrow = edgeArrow('flow', 'solid', a, b)

    assert.equal(arrow.x, cubic(a.x, a.x, b.x, b.x))
    assert.equal(arrow.y, cubic(a.y, a.y + m, b.y - m, b.y))
  })
})

describe('方向箭头的成品路径', () => {
  it('三个点都落在中点附近，尖端朝着走向', () => {
    const d = edgeArrowPath('flow', 'solid', at(0, 0), at(0, 200))
    const pts = [...d.matchAll(/(-?\d+\.\d+) (-?\d+\.\d+)/g)].map(([, x, y]) => [+x, +y])

    assert.equal(pts.length, 3)
    const [tip, left, right] = pts as [number[], number[], number[]]
    assert.deepEqual(tip, [0, 100])
    assert.ok(left[1]! < tip[1]! && right[1]! < tip[1]!, '尾角在尖端上方')
    assert.equal(left[0]! + right[0]!, 0, '左右对称')
  })

  it('两端读同一组几何：路径的尖端 = edgeArrow 的中点', () => {
    const a = at(30, 10)
    const b = at(-120, 260)
    const mid = edgeArrow('mind', 'solid', a, b)
    const d = edgeArrowPath('mind', 'solid', a, b)

    assert.ok(d.startsWith(`M${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`), d)
  })

  it('线更粗的形态箭头也更大', () => {
    const span = (d: string) => {
      const xs = [...d.matchAll(/(-?\d+\.\d+) (-?\d+\.\d+)/g)].map(([, x]) => +x)
      return Math.max(...xs) - Math.min(...xs)
    }

    assert.ok(span(edgeArrowPath('flow', 'solid', at(0, 0), at(0, 200))) >
      span(edgeArrowPath('web', 'solid', at(0, 0), at(0, 200))))
  })
})

describe('节点轮廓', () => {
  const pts = (d: string): [number, number][] =>
    [...d.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map(([, x, y]) => [+x, +y])

  it('顶点只有一组：clip-path 那边读的和 path 这边画的是同一个六边形', () => {
    const poly = nodePoly('hex')

    assert.ok(poly)
    assert.deepEqual(
      poly.map(([, y]) => y),
      [6.7, 6.7, 50, 93.3, 93.3, 50],
    )
    assert.equal(nodePoly('circle'), undefined, '圆不是多边形，调用方自己画')
  })

  it('多边形横向画满整块见方，一个顶点都不许出界', () => {
    for (const shape of ['hex', 'diamond'] as const) {
      const all = pts(nodeShapePath(shape, 64))
      const xs = all.map(([x]) => x)
      const ys = all.map(([, y]) => y)

      assert.equal(Math.min(...xs), 0, shape)
      assert.equal(Math.max(...xs), 64, shape)
      assert.ok(Math.min(...ys) >= 0 && Math.max(...ys) <= 64, shape)
    }
    const hex = pts(nodeShapePath('hex', 100)).map(([, y]) => y)
    const diamond = pts(nodeShapePath('diamond', 100)).map(([, y]) => y)

    assert.deepEqual([Math.min(...hex), Math.max(...hex)], [6.7, 93.3])
    assert.deepEqual([Math.min(...diamond), Math.max(...diamond)], [0, 100])
  })

  it('描边要往里缩一半，不然有一半画到外面被切掉', () => {
    const all = pts(nodeShapePath('diamond', 64, 1.5))
    const xs = all.map(([x]) => x)

    assert.equal(Math.min(...xs), 1.5)
    assert.equal(Math.max(...xs), 62.5)
  })

  it('圆与方各自是闭合的一段，不是空串', () => {
    for (const shape of ['circle', 'square'] as const) {
      const d = nodeShapePath(shape, 40)

      assert.ok(d.startsWith('M'), d)
      assert.ok(d.endsWith('Z'), d)
    }
  })
})
