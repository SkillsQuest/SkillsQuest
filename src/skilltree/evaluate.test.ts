import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { checksOf, progressOf } from './evaluate.ts'
import { stateFromDone } from './state.ts'
import type { SkillTreeDoc } from './spec.ts'

const doc: SkillTreeDoc = {
  spec: 'skilltree/1',
  meta: { name: '三前置' },
  layout: 'flow',
  nodes: [
    { id: 'p1', title: '前一', x: 0, y: 0 },
    { id: 'p2', title: '前二', x: 100, y: 0 },
    { id: 'p3', title: '前三', x: 200, y: 0 },
    { id: 'target', title: '目标', x: 100, y: 100, gate: { need: 2, cost: 2 } },
  ],
  edges: [
    ['p1', 'target'],
    ['p2', 'target'],
    ['p3', 'target'],
  ],
}

const target = doc.nodes[3]!

function checks(done: string[]) {
  const state = stateFromDone(done)
  return checksOf(doc, target, state, progressOf(doc, state))
}

describe('检查表 · 缺哪几个前置', () => {
  it('按入边顺序列出还没完成的前置', () => {
    const prereq = checks(['p2']).find((check) => check.kind === 'prereq')

    assert.deepEqual(prereq?.missing, ['p1', 'p3'])
    assert.equal(prereq?.have, 1)
    assert.equal(prereq?.need, 2)
  })

  it('条件已满足时也照实列出没完成的前置', () => {
    const prereq = checks(['p1', 'p2']).find((check) => check.kind === 'prereq')

    assert.equal(prereq?.ok, true)
    assert.deepEqual(prereq?.missing, ['p3'])
  })

  it('前置全完成后是空表', () => {
    const prereq = checks(['p1', 'p2', 'p3']).find((check) => check.kind === 'prereq')

    assert.deepEqual(prereq?.missing, [])
  })

  it('资源与等级那两条恒为空表', () => {
    for (const check of checks(['p1', 'p2'])) {
      if (check.kind !== 'prereq') assert.deepEqual(check.missing, [], check.kind)
    }
  })
})
