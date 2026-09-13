import { rankOf, type TreeState } from './state.ts'
import type { SkillNode, SkillTreeDoc } from './spec.ts'

export function maxRankOf(node: SkillNode): number {
  return Math.max(1, Math.floor(node.maxRank ?? 1))
}

export function isTalent(doc: SkillTreeDoc): boolean {
  if (doc.rules?.points !== undefined || doc.rules?.pointsAttr !== undefined) return true
  return doc.nodes.some((node) => (node.maxRank ?? 1) > 1)
}

export function pointBudget(doc: SkillTreeDoc, state: TreeState): number {
  if (!isTalent(doc)) return 0
  let total = doc.rules?.points ?? 0
  const key = doc.rules?.pointsAttr
  if (key !== undefined) {
    const value = state.facts?.[`attr.${key}`]
    if (typeof value === 'number') total += value
  }
  return total
}

export function pointsUsed(doc: SkillTreeDoc, state: TreeState): number {
  return doc.nodes.reduce(
    (sum, node) => sum + Math.min(rankOf(state, node.id), maxRankOf(node)),
    0,
  )
}

export interface Points {
  total: number
  used: number
  free: number
}

export function pointsOf(doc: SkillTreeDoc, state: TreeState): Points {
  const total = pointBudget(doc, state)
  const used = pointsUsed(doc, state)
  return { total, used, free: total - used }
}
