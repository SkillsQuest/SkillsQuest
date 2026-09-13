import { clonePlain } from './clone.ts'
import type {
  Award,
  Meta,
  Resource,
  Rules,
  SkillEdge,
  SkillNode,
  SkillTreeDoc,
  Theme,
} from './spec.ts'
import { validate, type Limits, type ValidationResult } from './validate.ts'

export const PATCH_SPEC_VERSION = 'skilltree-patch/1' as const

export interface PatchSet {
  meta?: Partial<Meta>
  layout?: SkillTreeDoc['layout']
  theme?: Theme
  res?: Resource
  rules?: Rules
  awards?: Award[]
}

export type NodeUpdate = { id: string } & Partial<Omit<SkillNode, 'id'>>

export interface Patch {
  say?: string
  set?: PatchSet
  drop?: string[]
  dropEdges?: SkillEdge[]
  nodes?: SkillNode[]
  edges?: SkillEdge[]
  update?: NodeUpdate[]
  replace?: boolean
  added?: string[]
}

export type ApplyResult =
  | { ok: true; doc: SkillTreeDoc; validation: ValidationResult }
  | { ok: false; reason: string; validation: ValidationResult | null }

function edgeKey(edge: readonly string[]): string {
  return `${edge[0]} ${edge[1]}`
}

export function applyPatch(
  doc: SkillTreeDoc,
  patch: Patch,
  limits?: Limits,
): ApplyResult {
  const next: SkillTreeDoc = clonePlain(doc)

  if (patch.replace) {
    next.nodes = clonePlain(patch.nodes ?? [])
    next.edges = clonePlain(patch.edges ?? [])
  } else {
    const dropped = new Set(patch.drop ?? [])
    if (dropped.size > 0) {
      next.nodes = next.nodes.filter((node) => !dropped.has(node.id))
      next.edges = next.edges.filter(([from, to]) => !dropped.has(from) && !dropped.has(to))
    }

    const droppedEdges = new Set((patch.dropEdges ?? []).map(edgeKey))
    if (droppedEdges.size > 0) {
      next.edges = next.edges.filter((edge) => !droppedEdges.has(edgeKey(edge)))
    }

    const existing = new Set(next.nodes.map((node) => node.id))
    for (const node of patch.nodes ?? []) {
      if (existing.has(node.id)) {
        return {
          ok: false,
          reason: `新增节点 id 已存在：${node.id}。改既有节点请用 update`,
          validation: null,
        }
      }
      existing.add(node.id)
      next.nodes.push(clonePlain(node))
    }

    const edgeSet = new Set(next.edges.map(edgeKey))
    for (const edge of patch.edges ?? []) {
      if (edgeSet.has(edgeKey(edge))) continue
      edgeSet.add(edgeKey(edge))
      next.edges.push([edge[0], edge[1]])
    }

    const byId = new Map(next.nodes.map((node) => [node.id, node]))
    for (const change of patch.update ?? []) {
      const target = byId.get(change.id)
      if (!target) {
        return { ok: false, reason: `update 的节点不存在：${change.id}`, validation: null }
      }
      const { id: _id, ...rest } = change
      Object.assign(target, clonePlain(rest))
    }
  }

  if (patch.set) {
    const { meta, layout, theme, res, rules, awards } = patch.set
    if (meta) next.meta = { ...next.meta, ...clonePlain(meta) }
    if (layout !== undefined) next.layout = layout
    if (theme !== undefined) next.theme = clonePlain(theme)
    if (res !== undefined) next.res = clonePlain(res)
    if (rules !== undefined) next.rules = clonePlain(rules)
    if (awards !== undefined) next.awards = clonePlain(awards)
  }

  const validation = validate(next, limits)
  if (!validation.ok) {
    return { ok: false, reason: 'Patch 应用后文档未通过语义校验', validation }
  }

  return { ok: true, doc: next, validation }
}

export function mayRelayout(patch: Patch): boolean {
  return Boolean(patch.replace) || patch.set?.layout !== undefined || (patch.drop?.length ?? 0) > 0
}
