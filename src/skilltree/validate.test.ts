import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import type { SkillTreeDoc } from './spec.ts'
import { type Issue, validate } from './validate.ts'

interface Fixture {
  name: string
  why: string
  doc: SkillTreeDoc
  expect: { ok: boolean; issues: Issue[] }
}

const dir = new URL('./fixtures/validate/', import.meta.url).pathname

const fixtures: Array<[string, Fixture]> = readdirSync(dir)
  .filter((file) => file.endsWith('.json'))
  .toSorted()
  .map((file) => [file, JSON.parse(readFileSync(join(dir, file), 'utf8')) as Fixture])

function project(issue: Issue, template: Issue): Record<string, unknown> {
  const out: Record<string, unknown> = { level: issue.level, code: issue.code, path: issue.path }
  if (template.detail !== undefined) out['detail'] = issue.detail
  return out
}

describe('黄金测试集 · 校验器', () => {
  it('fixtures 目录不能是空的', () => {
    assert.ok(fixtures.length > 0, `${dir} 下没有 fixture`)
  })

  for (const [file, fixture] of fixtures) {
    it(`${file} —— ${fixture.name}`, () => {
      const actual = validate(fixture.doc)

      assert.equal(actual.ok, fixture.expect.ok, 'ok')
      assert.equal(
        actual.issues.length,
        fixture.expect.issues.length,
        `issue 条数不符，实际：${JSON.stringify(actual.issues)}`,
      )
      fixture.expect.issues.forEach((expected, index) => {
        const got = actual.issues[index]
        assert.ok(got, `缺少第 ${index} 条 issue`)
        assert.deepEqual(project(got, expected), project(expected, expected))
      })
    })
  }

  it('多环文档报出的是文档顺序上第一个环', () => {
    const doc: SkillTreeDoc = {
      spec: 'skilltree/1',
      meta: { name: '两个环' },
      layout: 'flow',
      nodes: [
        { id: 'a', title: 'A', x: 0, y: 0 },
        { id: 'b', title: 'B', x: 100, y: 0 },
        { id: 'c', title: 'C', x: 200, y: 0 },
        { id: 'd', title: 'D', x: 300, y: 0 },
      ],
      edges: [
        ['a', 'b'],
        ['b', 'a'],
        ['c', 'd'],
        ['d', 'c'],
      ],
    }

    const cycles = validate(doc)
      .issues.filter((issue) => issue.code === 'GRAPH_HAS_CYCLE')
      .map((issue) => issue.detail?.['cycle'])
    assert.deepEqual(cycles, [['a', 'b', 'a']])
  })
})
