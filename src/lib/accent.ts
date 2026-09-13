export const ACCENTS = ['#f0663f', '#4f7cf0', '#2fa872', '#7c5cf0', '#e0a33e', '#d94f7c'] as const

export type Accent = (typeof ACCENTS)[number]

export const DEFAULT_ACCENT: Accent = '#7c5cf0'

export function randomAccent(random: () => number = Math.random): Accent {
  return ACCENTS[Math.floor(random() * ACCENTS.length)] ?? DEFAULT_ACCENT
}
