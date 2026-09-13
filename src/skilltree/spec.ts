export const SPEC_VERSION = 'skilltree/1' as const

export type NodeState = 'done' | 'open' | 'blocked' | 'locked'

export type Layout = 'flow' | 'web' | 'mind'

export type NodeKind = 'core' | 'leaf' | 'boss'

export type Shape = 'circle' | 'square' | 'hex' | 'diamond'
export type EdgeStyle = 'solid' | 'dashed' | 'glow' | 'step'
export type Background = 'dots' | 'grid' | 'plain' | 'glow'

export type Ext = Record<string, unknown>

export type FactValue = number | string | boolean

export interface Get {
  get: string
}

export type Operand = FactValue | Get

export type Cond =
  | { all: readonly Cond[] }
  | { any: readonly Cond[] }
  | { not: Cond }
  | { eq: readonly [Operand, Operand] }
  | { ne: readonly [Operand, Operand] }
  | { gt: readonly [Operand, Operand] }
  | { gte: readonly [Operand, Operand] }
  | { lt: readonly [Operand, Operand] }
  | { lte: readonly [Operand, Operand] }
  | { in: readonly [Operand, readonly FactValue[]] }
  | { has: readonly [string] | readonly [string, number] }
  | { oneOf: readonly string[] }

export type AttrType = 'number' | 'enum' | 'bool'

export interface AttrOption {
  value: string
  name: string
}

export interface Attr {
  key: string
  name: string
  type: AttrType
  min?: number
  max?: number
  options?: AttrOption[]
  default?: FactValue
}

export interface Gate {
  need?: number
  all?: boolean
  cost?: number
  lv?: number
  when?: Cond
}

export interface SkillNode {
  id: string
  title: string
  icon?: string
  x: number
  y: number
  kind?: NodeKind
  note?: string
  gate?: Gate
  maxRank?: number
  ext?: Ext
}

export type SkillEdge = readonly [from: string, to: string]

export interface Meta {
  name: string
  icon?: string
  accent?: string
  description?: string
}

export interface Theme {
  shape: Shape
  edge: EdgeStyle
  bg: Background
  arrows?: boolean
}

export interface Resource {
  name: string
  icon?: string
}

export interface Rules {
  daily?: number
  strict?: boolean
  checkin?: boolean
  points?: number
  pointsAttr?: string
}

export interface Award {
  id: string
  name: string
  icon?: string
  desc?: string
  shape?: 'hex' | 'circle' | 'squircle' | 'triangle'
  tier?: 'gold' | 'silver' | 'bronze'
  need: number
  gem?: number
  when?: Cond
}

export interface SkillTreeDoc {
  spec: typeof SPEC_VERSION
  meta: Meta
  layout: Layout
  nodes: SkillNode[]
  edges: SkillEdge[]
  theme?: Theme
  res?: Resource
  rules?: Rules
  attrs?: Attr[]
  awards?: Award[]
  requires?: string[]
  ext?: Ext
}

export type Done = readonly string[]

export const NODE_ID_PATTERN = /^[a-z0-9_-]{1,32}$/
