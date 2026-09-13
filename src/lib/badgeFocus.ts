export type MedalTier = 'gold' | 'silver' | 'bronze'

export type MedalShape = 'hex' | 'circle' | 'squircle' | 'triangle'

export const MEDAL_SHAPES: readonly MedalShape[] = ['hex', 'circle', 'squircle', 'triangle']
export const MEDAL_TIERS: readonly MedalTier[] = ['gold', 'silver', 'bronze']

export function medalShape(shape?: string): MedalShape {
  return (MEDAL_SHAPES as readonly string[]).includes(shape ?? '')
    ? (shape as MedalShape)
    : 'hex'
}

export function tiersByNeed(
  items: readonly { id: string; need: number }[],
): Map<string, MedalTier> {
  const total = items.length
  const order = [...items].sort((a, b) => a.need - b.need || a.id.localeCompare(b.id))
  const out = new Map<string, MedalTier>()
  order.forEach((item, rank) => {
    out.set(item.id, tierAt(rank, total))
  })
  return out
}

export function tierAt(rank: number, total: number): MedalTier {
  if (total <= 1 || rank === total - 1) return 'gold'
  return rank >= Math.floor(total / 3) ? 'silver' : 'bronze'
}

export interface BadgeFocus {
  id: string
  name: string
  desc: string
  icon: string
  accent?: string
  tier: MedalTier
  shape: MedalShape
  from: string
  got: boolean
  gotAt: string | null
  at: number
  need: number
  gem: number | null
}

export function gotDay(iso: string | null | undefined, lang: 'zh' | 'en'): string | null {
  if (!iso) return null
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return null
  return at.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })
}

export function awardGems(
  gem: number | undefined,
  grantsGems: boolean,
  local: boolean,
): number | null {
  if (local || !grantsGems) return null
  return gem ?? 0
}
