import type { Done, FactValue, SkillTreeDoc } from './spec.ts'

export interface TreeState {
  ranks: Readonly<Record<string, number>>
  facts?: Readonly<Record<string, FactValue>>
  nodes?: Readonly<Record<string, Readonly<Record<string, FactValue>>>>
}

export function stateFromDone(done: Done): TreeState {
  const ranks: Record<string, number> = {}
  for (const id of done) ranks[id] = 1
  return { ranks }
}

export function doneOf(doc: SkillTreeDoc, state: TreeState): string[] {
  return doc.nodes.filter((node) => rankOf(state, node.id) > 0).map((node) => node.id)
}

export function rankOf(state: TreeState, nodeId: string): number {
  return state.ranks[nodeId] ?? 0
}

export function isDone(state: TreeState, nodeId: string): boolean {
  return rankOf(state, nodeId) > 0
}
