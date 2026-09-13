import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { downstreamOf, relatedTo, upstreamOf } from './graph.ts'
import type { SkillTreeDoc } from './spec.ts'

const doc: SkillTreeDoc = {
  spec: 'skilltree/1',
  meta: { name: '菱形' },
  layout: 'flow',
  nodes: [
    { id: 'a', title: 'A', x: 0, y: 0 },
    { id: 'b', title: 'B', x: 0, y: 100 },
    { id: 'c', title: 'C', x: 100, y: 100 },
    { id: 'd', title: 'D', x: 50, y: 200 },
    { id: 'z', title: 'Z', x: 300, y: 0 },
  ],
  edges: [
    ['a', 'b'],
    ['a', 'c'],
    ['b', 'd'],
    ['c', 'd'],
  ],
}

const sorted = (set: Set<string>) => [...set].toSorted()

describe('图查询', () => {
  it('上游是全部直接与间接前置', () => {
    assert.deepEqual(sorted(upstreamOf(doc, 'd')), ['a', 'b', 'c'])
    assert.deepEqual(sorted(upstreamOf(doc, 'a')), [])
  })

  it('下游是全部直接与间接后继', () => {
    assert.deepEqual(sorted(downstreamOf(doc, 'a')), ['b', 'c', 'd'])
    assert.deepEqual(sorted(downstreamOf(doc, 'd')), [])
  })

  it('相关集合含自己，不含旁支', () => {
    assert.deepEqual(sorted(relatedTo(doc, 'b')), ['a', 'b', 'd'])
    assert.ok(!relatedTo(doc, 'b').has('c'), 'c 是旁支')
    assert.deepEqual(sorted(relatedTo(doc, 'z')), ['z'], '孤立节点只有自己')
  })

  it('有环也不死循环', () => {
    const cyclic: SkillTreeDoc = {
      ...doc,
      edges: [
        ['a', 'b'],
        ['b', 'a'],
      ],
    }

    assert.deepEqual(sorted(upstreamOf(cyclic, 'a')), ['b'])
    assert.deepEqual(sorted(downstreamOf(cyclic, 'a')), ['b'])
  })

  it('指向不存在节点的边直接忽略', () => {
    const dangling: SkillTreeDoc = { ...doc, edges: [['a', 'ghost']] }

    assert.deepEqual(sorted(downstreamOf(dangling, 'a')), [])
  })
})
