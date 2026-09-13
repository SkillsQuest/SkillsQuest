export type Lang = 'zh' | 'en'

export const LANGS: readonly Lang[] = ['zh', 'en']

export const LANG_LABEL: Record<Lang, string> = {
  zh: '简体中文',
  en: 'English',
}

export const LANG_TAG: Record<Lang, string> = {
  zh: 'zh-Hans',
  en: 'en',
}

export function isLang(value: unknown): value is Lang {
  return value === 'zh' || value === 'en'
}

export function pickLang(tags: readonly string[] | undefined, fallback: Lang = 'zh'): Lang {
  if (!tags || tags.length === 0) return fallback
  for (const tag of tags) {
    if (/^zh\b/i.test(tag)) return 'zh'
    if (/^[a-z]{2}\b/i.test(tag)) return 'en'
  }
  return fallback
}

export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return []
  return header
    .split(',')
    .map((part) => {
      const [tag = '', ...params] = part.trim().split(';')
      const q = params
        .map((p) => /^\s*q\s*=\s*([\d.]+)/.exec(p))
        .find((m) => m !== null)
      return { tag: tag.trim(), q: q?.[1] ? Number(q[1]) : 1 }
    })
    .filter((entry) => entry.tag !== '')
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.tag)
}

export type Dict<K extends string> = Readonly<Record<K, string>>

export type Vars = Readonly<Record<string, string | number>>

export function defineDict<const D extends Record<string, string>>(dict: D): D {
  return dict
}

export function format(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => {
    const value = vars[name]
    return value === undefined ? whole : String(value)
  })
}

export type T<K extends string> = (key: K, vars?: Vars) => string

export function translator<K extends string>(dict: Dict<K>): T<K> {
  return (key, vars) => format(dict[key] ?? key, vars)
}

export function pack<K extends string>(dicts: Record<Lang, Dict<K>>): Record<Lang, T<K>> {
  return { zh: translator(dicts.zh), en: translator(dicts.en) }
}
