import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { awardsOf, cascadeOf, evaluateTree, progressOf } from './evaluate.ts'
import { pointsOf } from './points.ts'
import { settleComplete, settleUndo } from './settle.ts'
import { stateFromDone, type TreeState } from './state.ts'
import type { FactValue, NodeState, SkillTreeDoc } from './spec.ts'

interface EvalCase {
  done?: string[]
  state?: {
    ranks: Record<string, number>
    facts?: Record<string, FactValue>
    nodes?: Record<string, Record<string, FactValue>>
  }
  states: Record<string, NodeState>
  progress: { count: number; earned: number; spent: number; stars: number; level: number }
  points?: { total: number; used: number; free: number }
  awards?: Record<string, boolean>
  cascade?: { node: string; expect: string[] }
  settleComplete?: { node: string; energy: number; events: unknown[] }
  settleUndo?: { node: string; cascaded: string[]; energy: number; events: unknown[] }
}

function stateFrom(testCase: EvalCase): TreeState {
  if (testCase.state) {
    return {
      ranks: testCase.state.ranks,
      facts: testCase.state.facts ?? {},
      nodes: testCase.state.nodes ?? {},
    }
  }
  return stateFromDone(testCase.done ?? [])
}

interface Fixture {
  name: string
  why: string
  doc: SkillTreeDoc
  cases: EvalCase[]
}

const dir = new URL('./fixtures/eval/', import.meta.url).pathname

function load(): Array<[string, Fixture]> {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .toSorted()
    .map((file) => [file, JSON.parse(readFileSync(join(dir, file), 'utf8')) as Fixture])
}

const fixtures = load()

describe('黄金测试集 · 求值', () => {
  it('fixtures 目录不能是空的', () => {
    assert.ok(fixtures.length > 0, `${dir} 下没有 fixture`)
  })

  for (const [file, fixture] of fixtures) {
    describe(`${file} —— ${fixture.name}`, () => {
      fixture.cases.forEach((testCase, index) => {
        const label = `case ${index} · done=[${(testCase.done ?? []).join(',')}]`
        const state = stateFrom(testCase)

        it(`${label} 四态`, () => {
          const actual = evaluateTree(fixture.doc, state)
          assert.deepEqual(
            Object.keys(testCase.states).toSorted(),
            fixture.doc.nodes.map((node) => node.id).toSorted(),
            'states 必须列全文档里的所有节点',
          )
          for (const [id, expected] of Object.entries(testCase.states)) {
            assert.equal(actual.get(id), expected, `节点 ${id}`)
          }
        })

        it(`${label} 树内派生量`, () => {
          assert.deepEqual(progressOf(fixture.doc, state), testCase.progress)
        })

        if (testCase.points) {
          it(`${label} 加点池`, () => {
            assert.deepEqual(pointsOf(fixture.doc, state), testCase.points)
          })
        }

        if (testCase.awards) {
          it(`${label} 成就`, () => {
            const actual = new Map(awardsOf(fixture.doc, state).map((a) => [a.id, a.got]))
            for (const [id, got] of Object.entries(testCase.awards ?? {})) {
              assert.equal(actual.get(id), got, `成就 ${id}`)
            }
          })
        }

        const { cascade } = testCase
        if (cascade) {
          it(`${label} 连带取消 ${cascade.node}`, () => {
            assert.deepEqual(cascadeOf(fixture.doc, cascade.node, state), cascade.expect)
          })
        }

        const complete = testCase.settleComplete
        if (complete) {
          it(`${label} 完成 ${complete.node} 的结算`, () => {
            const actual = settleComplete(fixture.doc, complete.node, state)
            assert.equal(actual.energy, complete.energy, '能量')
            assert.deepEqual(actual.events, complete.events, '结算事件')
          })
        }

        const undo = testCase.settleUndo
        if (undo) {
          it(`${label} 撤销 ${undo.node} 的结算`, () => {
            const actual = settleUndo(fixture.doc, undo.node, state)
            assert.deepEqual(actual.cascaded, undo.cascaded, '连带集合')
            assert.equal(actual.energy, undo.energy, '能量')
            assert.deepEqual(actual.events, undo.events, '结算事件')
          })
        }
      })
    })
  }
})
