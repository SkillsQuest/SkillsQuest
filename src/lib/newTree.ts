import { randomAccent } from './accent.ts'
import { SPEC_VERSION, type SkillNode, type SkillTreeDoc } from '../skilltree/index.ts'

export function newNodeId(prefix = 'n'): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `${prefix}${Date.now().toString(36)}${rand}`
}

export function emptyDoc(name: string, resName: string): SkillTreeDoc {
  return {
    spec: SPEC_VERSION,
    meta: { name, icon: 'tree', accent: randomAccent() },
    layout: 'flow',
    nodes: [],
    edges: [],
    theme: { shape: 'circle', edge: 'solid', bg: 'dots' },
    res: { name: resName, icon: 'star' },
    rules: {},
    awards: [],
  }
}

export function newNode(title: string, x: number, y: number): SkillNode {
  return { id: newNodeId(), title, icon: 'dot', x, y }
}
