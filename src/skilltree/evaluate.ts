import { condOf } from './cond.ts'
import { levelOf, rewardOf } from './economy.ts'
import { isTalent, maxRankOf, pointsOf, type Points } from './points.ts'
import { isDone, rankOf, type TreeState } from './state.ts'
import type { Award, Gate, NodeState, SkillNode, SkillTreeDoc } from './spec.ts'

export interface Check {
  kind: 'prereq' | 'cost' | 'level' | 'cond' | 'points'
  ok: boolean
  have: number
  need: number
  missing: readonly string[]
}

export interface TreeProgress {
  count: number
  earned: number
  spent: number
  stars: number
  level: number
}

export type Parents = ReadonlyMap<string, readonly string[]>

export function parentsOf(doc: SkillTreeDoc): Parents {
  const map = new Map<string, string[]>(doc.nodes.map((node) => [node.id, []]))
  for (const [from, to] of doc.edges) {
    map.get(to)?.push(from)
  }
  return map
}

export function progressOf(doc: SkillTreeDoc, state: TreeState): TreeProgress {
  const hit = doc.nodes.filter((node) => isDone(state, node.id))
  const earned = hit.reduce((sum, node) => sum + rewardOf(node), 0)
  const spent = hit.reduce((sum, node) => sum + (node.gate?.cost ?? 0), 0)

  return {
    count: hit.length,
    earned,
    spent,
    stars: earned - spent,
    level: levelOf(hit.length),
  }
}

export function requiredCount(doc: SkillTreeDoc, gate: Gate, inbound: number): number {
  if (inbound === 0) return 0
  const wanted = doc.rules?.strict || gate.all ? inbound : (gate.need ?? 1)
  return Math.min(wanted, inbound)
}

export function checksOf(
  doc: SkillTreeDoc,
  node: SkillNode,
  state: TreeState,
  progress: TreeProgress,
  parents: Parents = parentsOf(doc),
  points: Points = pointsOf(doc, state),
): Check[] {
  const inbound = parents.get(node.id) ?? []
  const gate = node.gate ?? {}
  const out: Check[] = []

  const need = requiredCount(doc, gate, inbound.length)
  if (need > 0) {
    const have = inbound.filter((id) => isDone(state, id)).length
    const missing = inbound.filter((id) => !isDone(state, id))
    out.push({ kind: 'prereq', ok: have >= need, have, need, missing })
  }
  if (gate.cost) {
    out.push({
      kind: 'cost',
      ok: progress.stars >= gate.cost,
      have: progress.stars,
      need: gate.cost,
      missing: [],
    })
  }
  if (gate.lv) {
    out.push({
      kind: 'level',
      ok: progress.level >= gate.lv,
      have: progress.level,
      need: gate.lv,
      missing: [],
    })
  }
  if (gate.when) {
    const ok = condOf({ doc, state, nodeId: node.id }, gate.when)
    out.push({ kind: 'cond', ok, have: ok ? 1 : 0, need: 1, missing: [] })
  }
  if (isTalent(doc) && rankOf(state, node.id) < maxRankOf(node)) {
    out.push({ kind: 'points', ok: points.free > 0, have: points.free, need: 1, missing: [] })
  }
  return out
}

export function stateOf(
  doc: SkillTreeDoc,
  node: SkillNode,
  state: TreeState,
  progress: TreeProgress,
  parents: Parents = parentsOf(doc),
  points: Points = pointsOf(doc, state),
): NodeState {
  if (rankOf(state, node.id) >= maxRankOf(node)) return 'done'

  const checks = checksOf(doc, node, state, progress, parents, points)
  const prereq = checks.find((check) => check.kind === 'prereq')
  if (prereq && !prereq.ok) return 'locked'

  return checks.every((check) => check.ok) ? 'open' : 'blocked'
}

export function evaluateTree(doc: SkillTreeDoc, state: TreeState): Map<string, NodeState> {
  const parents = parentsOf(doc)
  const progress = progressOf(doc, state)
  const points = pointsOf(doc, state)
  return new Map(
    doc.nodes.map((node) => [node.id, stateOf(doc, node, state, progress, parents, points)]),
  )
}

export function legalize(doc: SkillTreeDoc, ranks: Record<string, number>): Record<string, number> {
  const parents = parentsOf(doc)
  let current: Record<string, number> = {}
  for (const [id, rank] of Object.entries(ranks)) if (rank > 0) current[id] = rank

  for (;;) {
    const state: TreeState = { ranks: current }
    const progress = progressOf(doc, state)
    const points = pointsOf(doc, state)
    const next: Record<string, number> = {}
    let changed = false
    for (const node of doc.nodes) {
      const rank = current[node.id] ?? 0
      if (rank <= 0) continue
      const checks = checksOf(doc, node, state, progress, parents, points)
      const broken = checks.some(
        (c) => (c.kind === 'prereq' || c.kind === 'cond') && !c.ok,
      )
      if (broken) changed = true
      else next[node.id] = rank
    }
    if (!changed) return next
    current = next
  }
}

export interface AwardStatus extends Award {
  got: boolean
  at: number
}

export function awardsOf(doc: SkillTreeDoc, state: TreeState): AwardStatus[] {
  const count = doc.nodes.filter((node) => isDone(state, node.id)).length
  return (doc.awards ?? []).map((award) => {
    const met =
      count >= award.need &&
      (award.when === undefined || condOf({ doc, state, nodeId: '' }, award.when))
    return { ...award, got: met, at: count }
  })
}

export function cascadeOf(doc: SkillTreeDoc, nodeId: string, state: TreeState): string[] {
  const parents = parentsOf(doc)
  const gateOf = new Map(doc.nodes.map((node) => [node.id, node.gate ?? {}]))
  const done = doc.nodes.filter((node) => rankOf(state, node.id) > 0).map((node) => node.id)

  const stillMet = (id: string, pool: readonly string[]): boolean => {
    const inbound = parents.get(id) ?? []
    const need = requiredCount(doc, gateOf.get(id) ?? {}, inbound.length)
    if (need === 0) return true
    return inbound.filter((parent) => pool.includes(parent)).length >= need
  }

  let keep = done.filter((id) => id !== nodeId)
  for (;;) {
    const next = keep.filter((id) => stillMet(id, keep))
    if (next.length === keep.length) break
    keep = next
  }
  return done.filter((id) => id !== nodeId && !keep.includes(id))
}
