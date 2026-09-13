import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { clonePlain } from './clone.ts'

describe('clonePlain', () => {
  it('嵌套结构是真拷贝，改副本不动原件', () => {
    const source = { a: [1, { b: 2 }], c: { d: [3] } }
    const copy = clonePlain(source)

    copy.a[1] = { b: 99 }
    copy.c.d.push(4)

    assert.deepEqual(source, { a: [1, { b: 2 }], c: { d: [3] } })
  })

  it('保留 null 与 undefined 字段', () => {
    const source = { kept: null, present: undefined }
    const copy = clonePlain(source)

    assert.ok('present' in copy, 'undefined 字段不该消失')
    assert.equal(copy.kept, null)
  })

  it('原始值原样返回', () => {
    assert.equal(clonePlain(1), 1)
    assert.equal(clonePlain('x'), 'x')
    assert.equal(clonePlain(null), null)
    assert.equal(clonePlain(undefined), undefined)
  })
})
