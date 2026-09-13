import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evaluateTree, progressOf } from './evaluate.ts'
import { doneOf, isDone, rankOf, stateFromDone } from './state.ts'
import type { SkillTreeDoc } from './spec.ts'

const doc: SkillTreeDoc = {
  spec: 'skilltree/1',
  meta: { name: '链' },
  layout: 'flow',
  nodes: [
    { id: 'a', title: 'A', x: 0, y: 0, kind: 'core' },
    { id: 'b', title: 'B', x: 0, y: 100 },
    { id: 'c', title: 'C', x: 0, y: 200 },
  ],
  edges: [
    ['a', 'b'],
    ['b', 'c'],
  ],
}

describe('状态对象', () => {
  it('档位 1 就是旧形状里的「完成」', () => {
    const state = stateFromDone(['a', 'b'])

    assert.equal(rankOf(state, 'a'), 1)
    assert.equal(rankOf(state, 'c'), 0, '没记过的节点档位是 0')
    assert.equal(isDone(state, 'b'), true)
    assert.equal(isDone(state, 'c'), false)
  })

  it('档位大于 1 也算完成 —— 加点树里投了 3 点仍然是「做了」', () => {
    const state = { ranks: { a: 3 } }

    assert.equal(isDone(state, 'a'), true)
    assert.equal(progressOf(doc, state).count, 1, '这一档还不按点数计数，见 #165 阶段 4')
  })

  it('转回旧形状按**文档顺序**，不按 ranks 的键序', () => {
    assert.deepEqual(doneOf(doc, { ranks: { c: 1, a: 1 } }), ['a', 'c'])
    assert.deepEqual(doneOf(doc, { ranks: { ghost: 1 } }), [], '文档里没有的节点不算')
  })

  it('往返一趟结果不变', () => {
    const done = ['a', 'b']

    assert.deepEqual(doneOf(doc, stateFromDone(done)), done)
  })

  it('同一份状态，新旧两条路求出同样的四态', () => {
    const state = stateFromDone(['a'])

    assert.deepEqual(Object.fromEntries(evaluateTree(doc, state)), {
      a: 'done',
      b: 'open',
      c: 'locked',
    })
  })

  it('事实不传也能求值 —— 布尔树压根不需要它', () => {
    assert.doesNotThrow(() => evaluateTree(doc, { ranks: {} }))
  })
})
