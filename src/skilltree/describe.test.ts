import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { attrValueText, type CondTranslate, describeCond } from './describe.ts'
import { stateFromDone, type TreeState } from './state.ts'
import type { Cond, SkillTreeDoc } from './spec.ts'

const DOC: SkillTreeDoc = {
  spec: 'skilltree/1',
  meta: { name: '测试' },
  layout: 'flow',
  nodes: [
    { id: 'fire', title: '火球', x: 0, y: 0 },
    { id: 'ice', title: '冰锥', x: 100, y: 0 },
    { id: 'meteor', title: '陨石', x: 200, y: 0 },
  ],
  edges: [],
  attrs: [
    { key: 'str', name: '力量', type: 'number', min: 1, max: 20 },
    {
      key: 'faction',
      name: '阵营',
      type: 'enum',
      options: [
        { value: 'law', name: '守序' },
        { value: 'chaos', name: '混沌' },
      ],
    },
  ],
  requires: ['cond/expr', 'attr/self'],
}

const t: CondTranslate = (key, p = {}) => {
  switch (key) {
    case 'cond.and':
      return '且'
    case 'cond.or':
      return '或'
    case 'cond.not':
      return `非(${p['inner']})`
    case 'cond.atLeast':
      return `${p['name']}≥${p['value']}`
    case 'cond.atMost':
      return `${p['name']}≤${p['value']}`
    case 'cond.above':
      return `${p['name']}>${p['value']}`
    case 'cond.below':
      return `${p['name']}<${p['value']}`
    case 'cond.is':
      return `${p['name']}=${p['value']}`
    case 'cond.isNot':
      return `${p['name']}≠${p['value']}`
    case 'cond.oneOfValues':
      return `${p['name']}∈{${p['values']}}`
    case 'cond.done':
      return `done(${p['node']})`
    case 'cond.rank':
      return `${p['node']}@${p['n']}`
    case 'cond.exclusive':
      return `oneOf(${p['nodes']})`
    case 'cond.compare':
      return `${p['a']}?${p['b']}`
    case 'cond.fact.streak':
      return '连续天数'
    default:
      return String(key)
  }
}

const say = (cond: Cond) => describeCond(DOC, cond, t)

describe('describeCond', () => {
  it('属性比较取属性的显示名', () => {
    assert.equal(say({ gte: [{ get: 'attr.str' }, 14] }), '力量≥14')
  })

  it('enum 的值换成选项显示名', () => {
    assert.equal(say({ eq: [{ get: 'attr.faction' }, 'law'] }), '阵营=守序')
    assert.equal(
      say({ in: [{ get: 'attr.faction' }, ['law', 'chaos']] }),
      '阵营∈{守序、混沌}',
    )
  })

  it('has 按有没有档位分「已完成」和「达到 N 阶」', () => {
    assert.equal(say({ has: ['fire'] }), 'done(火球)')
    assert.equal(say({ has: ['fire', 3] }), '火球@3')
  })

  it('oneOf 列节点名', () => {
    assert.equal(say({ oneOf: ['fire', 'ice'] }), 'oneOf(火球、冰锥)')
  })

  it('not 包住里层', () => {
    assert.equal(say({ not: { has: ['fire'] } }), '非(done(火球))')
  })

  it('嵌套的组包括号，(A 且 B) 或 C 不读串', () => {
    const cond: Cond = {
      any: [{ all: [{ has: ['fire'] }, { gte: [{ get: 'attr.str' }, 10] }] }, { has: ['meteor'] }],
    }
    assert.equal(say(cond), '(done(火球) 且 力量≥10) 或 done(陨石)')
  })

  it('顶层的组不包括号', () => {
    assert.equal(say({ all: [{ has: ['fire'] }, { has: ['ice'] }] }), 'done(火球) 且 done(冰锥)')
  })

  it('引擎自己算的事实有显示名', () => {
    assert.equal(say({ gte: [{ get: 'tree.streak' }, 30] }), '连续天数≥30')
  })

  it('查不到的属性退回原始 key，不崩不空', () => {
    assert.equal(say({ gte: [{ get: 'attr.ghost' }, 1] }), 'attr.ghost≥1')
  })
})

describe('attrValueText', () => {
  const withValues = (values: Record<string, number | string | boolean>): TreeState => ({
    ...stateFromDone([]),
    facts: values,
  })

  it('number 回显数值', () => {
    const state = withValues({ 'attr.str': 12 })
    assert.equal(attrValueText(DOC.attrs![0]!, state), '12')
  })

  it('enum 回显选项名', () => {
    const state = withValues({ 'attr.faction': 'law' })
    assert.equal(attrValueText(DOC.attrs![1]!, state), '守序')
  })

  it('没填的返回 undefined', () => {
    assert.equal(attrValueText(DOC.attrs![0]!, stateFromDone([])), undefined)
  })
})
