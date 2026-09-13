import { levelOf, rewardOf } from './economy.ts'
import { pointBudget, pointsUsed } from './points.ts'
import { rankOf, type TreeState } from './state.ts'
import type { Cond, FactValue, Get, Operand, SkillTreeDoc } from './spec.ts'

export type Verdict = boolean | undefined

export const FACTS: readonly {
  key: string
  derived: boolean
  what: string
}[] = [
  { key: 'node.rank', derived: true, what: '这个节点的档位' },
  { key: 'node.count', derived: false, what: '这个节点被完成过几次' },
  { key: 'node.at', derived: false, what: '最近一次完成的日期（YYYY-MM-DD）' },
  { key: 'tree.done', derived: true, what: '已完成节点数' },
  { key: 'tree.res', derived: true, what: '树内资源余量' },
  { key: 'tree.level', derived: true, what: '树内等级' },
  { key: 'tree.spent', derived: true, what: '已花掉的树内资源' },
  { key: 'tree.points', derived: true, what: '加点池总量' },
  { key: 'tree.used', derived: true, what: '已投点数（跨层投入要求读它）' },
  { key: 'tree.free', derived: true, what: '剩余点数' },
  { key: 'tree.streak', derived: false, what: '这棵树的连续天数' },
  { key: 'tree.today', derived: false, what: '今天在这棵树上完成了几次' },
  { key: 'attr.', derived: false, what: '作者定义的属性（前缀）' },
  { key: 'tag.', derived: false, what: '节点或树上的标签（前缀）' },
]

export interface CondScope {
  doc: SkillTreeDoc
  state: TreeState
  nodeId: string
}

export function factOf(scope: CondScope, key: string): FactValue | undefined {
  const { doc, state, nodeId } = scope

  if (key === 'node.rank') return rankOf(state, nodeId)
  if (key.startsWith('node.')) return state.nodes?.[nodeId]?.[key.slice('node.'.length)]

  if (key === 'tree.done' || key === 'tree.res' || key === 'tree.level' || key === 'tree.spent') {
    const hit = doc.nodes.filter((node) => rankOf(state, node.id) > 0)
    if (key === 'tree.done') return hit.length
    if (key === 'tree.level') return levelOf(hit.length)
    const earned = hit.reduce((sum, node) => sum + rewardOf(node), 0)
    const spent = hit.reduce((sum, node) => sum + (node.gate?.cost ?? 0), 0)
    return key === 'tree.spent' ? spent : earned - spent
  }

  if (key === 'tree.points') return pointBudget(doc, state)
  if (key === 'tree.used') return pointsUsed(doc, state)
  if (key === 'tree.free') return pointBudget(doc, state) - pointsUsed(doc, state)

  return state.facts?.[key]
}

function valueOf(scope: CondScope, operand: Operand): FactValue | undefined {
  return isGet(operand) ? factOf(scope, operand.get) : operand
}

function isGet(operand: Operand): operand is Get {
  return typeof operand === 'object' && operand !== null && 'get' in operand
}

function compare(
  scope: CondScope,
  pair: readonly [Operand, Operand],
  how: (a: FactValue, b: FactValue) => boolean,
): Verdict {
  const left = valueOf(scope, pair[0])
  const right = valueOf(scope, pair[1])
  if (left === undefined || right === undefined) return undefined
  return how(left, right)
}

function numeric(how: (a: number, b: number) => boolean) {
  return (a: FactValue, b: FactValue): boolean =>
    typeof a === 'number' && typeof b === 'number' ? how(a, b) : false
}

export function verdictOf(scope: CondScope, cond: Cond): Verdict {
  if ('all' in cond) {
    let unknown = false
    for (const item of cond.all) {
      const one = verdictOf(scope, item)
      if (one === false) return false
      if (one === undefined) unknown = true
    }
    return unknown ? undefined : true
  }
  if ('any' in cond) {
    let unknown = false
    for (const item of cond.any) {
      const one = verdictOf(scope, item)
      if (one === true) return true
      if (one === undefined) unknown = true
    }
    return unknown ? undefined : false
  }
  if ('not' in cond) {
    const one = verdictOf(scope, cond.not)
    return one === undefined ? undefined : !one
  }
  if ('eq' in cond) return compare(scope, cond.eq, (a, b) => a === b)
  if ('ne' in cond) return compare(scope, cond.ne, (a, b) => a !== b)
  if ('gt' in cond) return compare(scope, cond.gt, numeric((a, b) => a > b))
  if ('gte' in cond) return compare(scope, cond.gte, numeric((a, b) => a >= b))
  if ('lt' in cond) return compare(scope, cond.lt, numeric((a, b) => a < b))
  if ('lte' in cond) return compare(scope, cond.lte, numeric((a, b) => a <= b))
  if ('in' in cond) {
    const [operand, pool] = cond.in
    const value = valueOf(scope, operand)
    return value === undefined ? undefined : pool.includes(value)
  }
  if ('has' in cond) {
    const [nodeId, least] = cond.has
    return rankOf(scope.state, nodeId) >= (least ?? 1)
  }
  return cond.oneOf.filter((id) => rankOf(scope.state, id) > 0).length <= 1
}

export function condOf(scope: CondScope, cond: Cond): boolean {
  return verdictOf(scope, cond) === true
}

export interface CondFault {
  code: 'COND_MALFORMED' | 'COND_FACT_UNKNOWN' | 'COND_NODE_MISSING' | 'COND_ATTR_UNDECLARED'
  path: string
  detail?: Record<string, unknown>
}

const PAIRS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'] as const

function factKnown(key: string): boolean {
  return FACTS.some((fact) => (fact.key.endsWith('.') ? key.startsWith(fact.key) : key === fact.key))
}

const ATTR_PREFIX = 'attr.'

function operandFaults(
  operand: unknown,
  path: string,
  attrKeys: ReadonlySet<string>,
): CondFault[] {
  if (typeof operand === 'number' || typeof operand === 'string' || typeof operand === 'boolean') {
    return []
  }
  if (typeof operand === 'object' && operand !== null && 'get' in operand) {
    const key = (operand as { get: unknown }).get
    if (typeof key !== 'string') return [{ code: 'COND_MALFORMED', path, detail: { get: key } }]
    if (key.startsWith(ATTR_PREFIX)) {
      const name = key.slice(ATTR_PREFIX.length)
      return attrKeys.has(name)
        ? []
        : [{ code: 'COND_ATTR_UNDECLARED', path, detail: { key, attr: name } }]
    }
    return factKnown(key) ? [] : [{ code: 'COND_FACT_UNKNOWN', path, detail: { key } }]
  }
  return [{ code: 'COND_MALFORMED', path, detail: { operand } }]
}

export function condFaults(
  cond: unknown,
  path: string,
  nodeIds: ReadonlySet<string>,
  attrKeys: ReadonlySet<string> = new Set(),
): CondFault[] {
  if (typeof cond !== 'object' || cond === null || Array.isArray(cond)) {
    return [{ code: 'COND_MALFORMED', path, detail: { got: typeof cond } }]
  }
  const keys = Object.keys(cond)
  if (keys.length !== 1) {
    return [{ code: 'COND_MALFORMED', path, detail: { keys } }]
  }
  const op = keys[0] as string
  const arg = (cond as Record<string, unknown>)[op]

  if (op === 'all' || op === 'any') {
    if (!Array.isArray(arg) || arg.length === 0) {
      return [{ code: 'COND_MALFORMED', path: `${path}/${op}`, detail: { op } }]
    }
    return arg.flatMap((item, index) => condFaults(item, `${path}/${op}/${index}`, nodeIds, attrKeys))
  }
  if (op === 'not') return condFaults(arg, `${path}/not`, nodeIds, attrKeys)

  if ((PAIRS as readonly string[]).includes(op)) {
    if (!Array.isArray(arg) || arg.length !== 2) {
      return [{ code: 'COND_MALFORMED', path: `${path}/${op}`, detail: { op } }]
    }
    return arg.flatMap((operand, index) => operandFaults(operand, `${path}/${op}/${index}`, attrKeys))
  }
  if (op === 'in') {
    if (!Array.isArray(arg) || arg.length !== 2 || !Array.isArray(arg[1])) {
      return [{ code: 'COND_MALFORMED', path: `${path}/in`, detail: { op } }]
    }
    return operandFaults(arg[0], `${path}/in/0`, attrKeys)
  }
  if (op === 'has') {
    if (!Array.isArray(arg) || arg.length < 1 || arg.length > 2 || typeof arg[0] !== 'string') {
      return [{ code: 'COND_MALFORMED', path: `${path}/has`, detail: { op } }]
    }
    return nodeIds.has(arg[0])
      ? []
      : [{ code: 'COND_NODE_MISSING', path: `${path}/has/0`, detail: { id: arg[0] } }]
  }
  if (op === 'oneOf') {
    if (!Array.isArray(arg) || arg.length === 0) {
      return [{ code: 'COND_MALFORMED', path: `${path}/oneOf`, detail: { op } }]
    }
    return arg.flatMap((id, index) =>
      typeof id === 'string' && nodeIds.has(id)
        ? []
        : [
            {
              code: 'COND_NODE_MISSING' as const,
              path: `${path}/oneOf/${index}`,
              detail: { id },
            },
          ],
    )
  }
  return [{ code: 'COND_MALFORMED', path, detail: { op } }]
}
