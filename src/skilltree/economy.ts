import type { NodeKind, SkillNode } from './spec.ts'

export function kindOf(node: SkillNode): NodeKind {
  return node.kind ?? 'leaf'
}

export function rewardOf(node: SkillNode): number {
  const kind = kindOf(node)
  if (kind === 'boss') return 3
  if (kind === 'core') return 2
  return 1
}

export function energyOf(node: SkillNode): number {
  return rewardOf(node)
}

export function levelOf(doneCount: number): number {
  return Math.floor(doneCount / 4) + 1
}
