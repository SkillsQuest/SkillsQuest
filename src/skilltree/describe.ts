import type { TreeState } from './state.ts'
import type { Attr, Cond, FactValue, Operand, SkillTreeDoc } from './spec.ts'

export type CondTextKey =
  | 'cond.and'
  | 'cond.or'
  | 'cond.not'
  | 'cond.atLeast'
  | 'cond.atMost'
  | 'cond.above'
  | 'cond.below'
  | 'cond.is'
  | 'cond.isNot'
  | 'cond.oneOfValues'
  | 'cond.done'
  | 'cond.rank'
  | 'cond.exclusive'
  | 'cond.compare'
  | 'cond.fact.streak'
  | 'cond.fact.today'
  | 'cond.fact.done'
  | 'cond.fact.res'
  | 'cond.fact.level'
  | 'cond.fact.spent'
  | 'cond.fact.points'
  | 'cond.fact.used'
  | 'cond.fact.free'
  | 'cond.fact.count'
  | 'cond.fact.at'
  | 'cond.fact.rank'

export type CondTranslate = (
  key: CondTextKey,
  params?: Record<string, string | number>,
) => string

const FACT_LABEL: Record<string, CondTextKey> = {
  'tree.streak': 'cond.fact.streak',
  'tree.today': 'cond.fact.today',
  'tree.done': 'cond.fact.done',
  'tree.res': 'cond.fact.res',
  'tree.level': 'cond.fact.level',
  'tree.spent': 'cond.fact.spent',
  'tree.points': 'cond.fact.points',
  'tree.used': 'cond.fact.used',
  'tree.free': 'cond.fact.free',
  'node.count': 'cond.fact.count',
  'node.at': 'cond.fact.at',
  'node.rank': 'cond.fact.rank',
}

const ATTR_PREFIX = 'attr.'

function attrOf(doc: SkillTreeDoc, key: string): Attr | undefined {
  if (!key.startsWith(ATTR_PREFIX)) return undefined
  const name = key.slice(ATTR_PREFIX.length)
  return doc.attrs?.find((attr) => attr.key === name)
}

function nodeTitle(doc: SkillTreeDoc, id: string): string {
  return doc.nodes.find((node) => node.id === id)?.title ?? id
}

function factName(doc: SkillTreeDoc, key: string, t: CondTranslate): string {
  const attr = attrOf(doc, key)
  if (attr) return attr.name
  const label = FACT_LABEL[key]
  if (label) return t(label)
  return key
}

function valueText(doc: SkillTreeDoc, left: Operand, value: FactValue): string {
  if (typeof left === 'object' && 'get' in left) {
    const attr = attrOf(doc, left.get)
    if (attr?.type === 'enum') {
      const option = attr.options?.find((opt) => opt.value === value)
      if (option) return option.name
    }
  }
  return String(value)
}

function operandText(doc: SkillTreeDoc, operand: Operand, t: CondTranslate): string {
  if (typeof operand === 'object' && 'get' in operand) return factName(doc, operand.get, t)
  return String(operand)
}

const COMPARE_KEY: Record<string, CondTextKey> = {
  gte: 'cond.atLeast',
  lte: 'cond.atMost',
  gt: 'cond.above',
  lt: 'cond.below',
  eq: 'cond.is',
  ne: 'cond.isNot',
}

function comparison(
  doc: SkillTreeDoc,
  op: string,
  pair: readonly [Operand, Operand],
  t: CondTranslate,
): string {
  const [left, right] = pair
  const key = COMPARE_KEY[op]
  if (typeof left === 'object' && 'get' in left && !(typeof right === 'object' && 'get' in right)) {
    return t(key as CondTextKey, {
      name: factName(doc, left.get, t),
      value: valueText(doc, left, right),
    })
  }
  return t('cond.compare', {
    a: operandText(doc, left, t),
    b: operandText(doc, right, t),
    op,
  })
}

function render(doc: SkillTreeDoc, cond: Cond, t: CondTranslate, depth: number): string {
  const group = (parts: string[], word: string): string => {
    const joined = parts.join(` ${word} `)
    return depth > 0 && parts.length > 1 ? `(${joined})` : joined
  }

  if ('all' in cond) {
    return group(
      cond.all.map((item) => render(doc, item, t, depth + 1)),
      t('cond.and'),
    )
  }
  if ('any' in cond) {
    return group(
      cond.any.map((item) => render(doc, item, t, depth + 1)),
      t('cond.or'),
    )
  }
  if ('not' in cond) return t('cond.not', { inner: render(doc, cond.not, t, depth + 1) })

  for (const op of ['gte', 'lte', 'gt', 'lt', 'eq', 'ne'] as const) {
    if (op in cond) {
      const pair = (cond as Record<string, readonly [Operand, Operand]>)[op] as readonly [
        Operand,
        Operand,
      ]
      return comparison(doc, op, pair, t)
    }
  }
  if ('in' in cond) {
    const [left, pool] = cond.in
    return t('cond.oneOfValues', {
      name: operandText(doc, left, t),
      values: pool.map((value) => valueText(doc, left, value)).join('、'),
    })
  }
  if ('has' in cond) {
    const [id, least] = cond.has
    const node = nodeTitle(doc, id)
    return least !== undefined && least > 1 ? t('cond.rank', { node, n: least }) : t('cond.done', { node })
  }
  if ('oneOf' in cond) {
    return t('cond.exclusive', {
      nodes: cond.oneOf.map((id) => nodeTitle(doc, id)).join('、'),
    })
  }
  return ''
}

export function describeCond(doc: SkillTreeDoc, cond: Cond, t: CondTranslate): string {
  return render(doc, cond, t, 0)
}

export function attrValueText(attr: Attr, state: TreeState): string | undefined {
  const value = state.facts?.[`${ATTR_PREFIX}${attr.key}`]
  if (value === undefined) return undefined
  if (attr.type === 'enum') {
    return attr.options?.find((opt) => opt.value === value)?.name ?? String(value)
  }
  return String(value)
}
