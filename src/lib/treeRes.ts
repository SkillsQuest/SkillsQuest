import type { CommonKey } from '../i18n/index.ts'

export const RES_ICONS = [
  'star', 'seed', 'puzzle', 'heart', 'pulse', 'bulb', 'clock', 'target',
  'book', 'abc', 'music', 'brush', 'run', 'mountain', 'lungs', 'rocket',
] as const
export type ResIcon = (typeof RES_ICONS)[number]

export const RES_ICON_NAMES = {
  star: 'resIcon.star',
  seed: 'resIcon.seed',
  puzzle: 'resIcon.puzzle',
  heart: 'resIcon.heart',
  pulse: 'resIcon.pulse',
  bulb: 'resIcon.bulb',
  clock: 'resIcon.clock',
  target: 'resIcon.target',
  book: 'resIcon.book',
  abc: 'resIcon.abc',
  music: 'resIcon.music',
  brush: 'resIcon.brush',
  run: 'resIcon.run',
  mountain: 'resIcon.mountain',
  lungs: 'resIcon.lungs',
  rocket: 'resIcon.rocket',
} satisfies Record<ResIcon, CommonKey>

export const AWARD_ICONS = ['medal', 'trophy', 'crown', 'flame', 'seed', 'rocket']

export function renameRes(
  current: string | undefined,
  icon: string,
  names: Readonly<Record<string, string>>,
): string | undefined {
  const next = names[icon]
  if (next === undefined) return undefined
  const name = (current ?? '').trim()
  if (name === '') return next
  return Object.values(names).includes(name) ? next : undefined
}
