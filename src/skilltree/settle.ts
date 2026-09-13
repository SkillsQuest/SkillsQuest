import { energyOf, kindOf } from './economy.ts'
import { awardsOf, cascadeOf } from './evaluate.ts'
import { doneOf, isDone, stateFromDone, type TreeState } from './state.ts'
import type { NodeKind, SkillTreeDoc } from './spec.ts'

export type SettlementEvent =
  | { type: 'node-completed'; nodeId: string; kind: NodeKind }
  | { type: 'node-undone'; nodeId: string; kind: NodeKind }
  | { type: 'award-crossed'; awardId: string; gemHint: number | undefined }
  | { type: 'award-revoked'; awardId: string; gemHint: number | undefined }

export interface CompleteSettlement {
  energy: number
  events: SettlementEvent[]
  nextDone: string[]
}

export interface UndoSettlement {
  cascaded: string[]
  energy: number
  events: SettlementEvent[]
  nextDone: string[]
}

function awardDelta(
  doc: SkillTreeDoc,
  before: readonly string[],
  after: readonly string[],
): SettlementEvent[] {
  const wasGot = new Map(
    awardsOf(doc, stateFromDone(before)).map((award) => [award.id, award.got]),
  )

  return awardsOf(doc, stateFromDone(after)).flatMap((award): SettlementEvent[] => {
    const had = wasGot.get(award.id) ?? false
    if (award.got === had) return []
    return [
      {
        type: award.got ? 'award-crossed' : 'award-revoked',
        awardId: award.id,
        gemHint: award.gem,
      },
    ]
  })
}

export function settleComplete(
  doc: SkillTreeDoc,
  nodeId: string,
  state: TreeState,
): CompleteSettlement {
  const node = doc.nodes.find((candidate) => candidate.id === nodeId)
  if (!node) throw new Error(`[skill-tree] 节点不存在：${nodeId}`)
  if (isDone(state, nodeId)) throw new Error(`[skill-tree] 节点已完成：${nodeId}`)

  const done = doneOf(doc, state)
  const nextDone = [...done, nodeId]

  return {
    energy: energyOf(node),
    events: [
      { type: 'node-completed', nodeId, kind: kindOf(node) },
      ...awardDelta(doc, done, nextDone),
    ],
    nextDone,
  }
}

export function settleUndo(doc: SkillTreeDoc, nodeId: string, state: TreeState): UndoSettlement {
  if (!isDone(state, nodeId)) throw new Error(`[skill-tree] 节点未完成，无从撤销：${nodeId}`)

  const done = doneOf(doc, state)
  const cascaded = cascadeOf(doc, nodeId, state)
  const removed = new Set([nodeId, ...cascaded])
  const nextDone = done.filter((id) => !removed.has(id))

  const byId = new Map(doc.nodes.map((node) => [node.id, node]))
  const undone = [nodeId, ...cascaded]
    .map((id) => byId.get(id))
    .filter((node): node is NonNullable<typeof node> => node !== undefined)

  return {
    cascaded,
    energy: undone.reduce((sum, node) => sum + energyOf(node), 0),
    events: [
      ...undone.map(
        (node): SettlementEvent => ({ type: 'node-undone', nodeId: node.id, kind: kindOf(node) }),
      ),
      ...awardDelta(doc, done, nextDone),
    ],
    nextDone,
  }
}
