import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { type Patch, applyPatch, mayRelayout } from './patch.ts'
import type { SkillTreeDoc } from './spec.ts'

interface Fixture {
  name: string
  why: string
  doc: SkillTreeDoc
  patch: Patch
  expect: {
    ok: boolean
    doc?: SkillTreeDoc
    reasonContains?: string
    issueCodes?: string[]
  }
}

const dir = new URL('./fixtures/patch/', import.meta.url).pathname

const fixtures: Array<[string, Fixture]> = readdirSync(dir)
  .filter((file) => file.endsWith('.json'))
  .toSorted()
  .map((file) => [file, JSON.parse(readFileSync(join(dir, file), 'utf8')) as Fixture])

describe('黄金测试集 · Patch 应用', () => {
  it('fixtures 目录不能是空的', () => {
    assert.ok(fixtures.length > 0, `${dir} 下没有 fixture`)
  })

  for (const [file, fixture] of fixtures) {
    it(`${file} —— ${fixture.name}`, () => {
      const before = structuredClone(fixture.doc)
      const result = applyPatch(fixture.doc, fixture.patch)

      assert.deepEqual(fixture.doc, before, '原文档不得被就地修改')
      assert.equal(result.ok, fixture.expect.ok, `ok（${JSON.stringify(result)}）`)

      if (result.ok) {
        if (fixture.expect.doc) {
          assert.deepEqual(result.doc, fixture.expect.doc)
        }
      } else if (fixture.expect.reasonContains) {
        assert.ok(
          result.reason.includes(fixture.expect.reasonContains),
          `拒绝理由应含「${fixture.expect.reasonContains}」，实际：${result.reason}`,
        )
      }

      if (fixture.expect.issueCodes) {
        const codes = (result.validation?.issues ?? []).map((issue) => issue.code)
        for (const code of fixture.expect.issueCodes) {
          assert.ok(codes.includes(code), `应报出 ${code}，实际：${codes.join(',')}`)
        }
      }
    })
  }

  describe('坐标重排许可', () => {
    it('纯增量不许重排', () => {
      assert.equal(mayRelayout({ nodes: [] }), false)
      assert.equal(mayRelayout({ edges: [], update: [{ id: 'a', title: 'x' }] }), false)
    })

    it('replace / 换布局 / 有 drop 才许重排', () => {
      assert.equal(mayRelayout({ replace: true }), true)
      assert.equal(mayRelayout({ set: { layout: 'mind' } }), true)
      assert.equal(mayRelayout({ drop: ['a'] }), true)
    })

    it('drop 为空数组不算有 drop', () => {
      assert.equal(mayRelayout({ drop: [] }), false)
    })
  })
})
