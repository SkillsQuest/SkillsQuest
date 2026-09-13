import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { clonePlain } from './clone.ts'
import { relayout } from './layout.ts'
import { applyPatch } from './patch.ts'
import type { SkillTreeDoc } from './spec.ts'

const MINE = { 'me.attr': { str: 15, tags: ['a', 'b'] }, 'me.flag': true }

const doc: SkillTreeDoc = {
  spec: 'skilltree/1',
  meta: { name: '带扩展的树' },
  layout: 'flow',
  nodes: [
    { id: 'a', title: 'A', x: 0, y: 0, ext: { ...MINE } },
    { id: 'b', title: 'B', x: 100, y: 0 },
  ],
  edges: [['a', 'b']],
  ext: { 'me.doc': { anything: [1, { deep: true }] } },
}

describe('ext 的 round-trip', () => {
  it('克隆一份不丢', () => {
    const copy = clonePlain(doc)

    assert.deepEqual(copy.ext, doc.ext)
    assert.deepEqual(copy.nodes[0]?.ext, MINE)
  })

  it('克隆是深拷贝 —— 改副本不许动到原件', () => {
    const copy = clonePlain(doc)
    const copied = copy.nodes[0]?.ext as Record<string, unknown> | undefined
    assert.ok(copied, '副本里得有 ext')
    copied['me.flag'] = false

    const original = doc.nodes[0]?.ext as Record<string, unknown> | undefined
    assert.equal(original?.['me.flag'], true)
  })

  it('重排坐标不丢', () => {
    const tidied = relayout(doc, 'web')

    assert.deepEqual(tidied.ext, doc.ext)
    assert.deepEqual(tidied.nodes[0]?.ext, MINE)
  })

  it('Patch 改一个节点的别的字段，它自己的 ext 不丢', () => {
    const result = applyPatch(doc, { update: [{ id: 'a', title: '改过' }] })

    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.doc.nodes[0]?.title, '改过')
    assert.deepEqual(result.doc.nodes[0]?.ext, MINE, 'update 不许连带清掉 ext')
    assert.deepEqual(result.doc.ext, doc.ext)
  })

  it('Patch 只改树级字段时，节点上的 ext 不丢', () => {
    const result = applyPatch(doc, { set: { meta: { name: '换个名' } } })

    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.doc.nodes[0]?.ext, MINE)
  })
})
