import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { condOf, verdictOf } from './cond.ts'
import type { Cond, SkillTreeDoc } from './spec.ts'
import type { TreeState } from './state.ts'

interface CondCase {
  node: string
  state: TreeState
  cond: Cond
  verdict: boolean | null
}

interface Fixture {
  name: string
  why: string
  doc: SkillTreeDoc
  cases: CondCase[]
}

const dir = new URL('./fixtures/cond/', import.meta.url).pathname

const fixtures: Array<[string, Fixture]> = readdirSync(dir)
  .filter((file) => file.endsWith('.json'))
  .toSorted()
  .map((file) => [file, JSON.parse(readFileSync(join(dir, file), 'utf8')) as Fixture])

describe('黄金测试集 · 条件', () => {
  it('fixtures 目录不能是空的', () => {
    assert.ok(fixtures.length > 0, `${dir} 下没有 fixture`)
  })

  for (const [file, fixture] of fixtures) {
    describe(`${file} —— ${fixture.name}`, () => {
      fixture.cases.forEach((testCase, index) => {
        it(`case ${index} · ${JSON.stringify(testCase.cond)}`, () => {
          const scope = { doc: fixture.doc, state: testCase.state, nodeId: testCase.node }

          assert.equal(
            verdictOf(scope, testCase.cond) ?? null,
            testCase.verdict,
            '三值结论',
          )
          assert.equal(condOf(scope, testCase.cond), testCase.verdict === true)
        })
      })
    })
  }
})
