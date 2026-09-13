export function clonePlain<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value

  if (Array.isArray(value)) {
    return value.map((item) => clonePlain(item)) as unknown as T
  }

  const out: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = clonePlain(item)
  }
  return out as T
}
