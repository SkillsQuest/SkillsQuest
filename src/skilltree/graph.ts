import type { SkillTreeDoc } from './spec.ts'

function childrenOf(doc: SkillTreeDoc): Map<string, string[]> {
  const map = new Map<string, string[]>(doc.nodes.map((node) => [node.id, []]))
  for (const [from, to] of doc.edges) {
    if (map.has(from) && map.has(to)) map.get(from)?.push(to)
  }
  return map
}

function parentIndex(doc: SkillTreeDoc): Map<string, string[]> {
  const map = new Map<string, string[]>(doc.nodes.map((node) => [node.id, []]))
  for (const [from, to] of doc.edges) {
    if (map.has(from) && map.has(to)) map.get(to)?.push(from)
  }
  return map
}

function walk(index: Map<string, string[]>, start: string): Set<string> {
  const seen = new Set<string>()
  const queue = [...(index.get(start) ?? [])]

  while (queue.length > 0) {
    const id = queue.shift()
    if (id === undefined || id === start || seen.has(id)) continue
    seen.add(id)
    queue.push(...(index.get(id) ?? []))
  }
  return seen
}

export function upstreamOf(doc: SkillTreeDoc, nodeId: string): Set<string> {
  return walk(parentIndex(doc), nodeId)
}

export function downstreamOf(doc: SkillTreeDoc, nodeId: string): Set<string> {
  return walk(childrenOf(doc), nodeId)
}

export function relatedTo(doc: SkillTreeDoc, nodeId: string): Set<string> {
  const out = upstreamOf(doc, nodeId)
  for (const id of downstreamOf(doc, nodeId)) out.add(id)
  out.add(nodeId)
  return out
}
