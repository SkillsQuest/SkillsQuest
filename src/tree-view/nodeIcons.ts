import { useEffect, useSyncExternalStore } from 'react'

type Catalog = typeof import('../lib/nodeIcons.ts')

let catalog: Catalog | null = null
let pending: Promise<unknown> | null = null
const listeners = new Set<() => void>()

export function loadNodeIcons(): Promise<unknown> {
  pending ??= import('../lib/nodeIcons.ts').then((m) => {
    catalog = m
    for (const fn of listeners) fn()
  })
  return pending
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function useNodeIcons(): Catalog | null {
  const cat = useSyncExternalStore(
    subscribe,
    () => catalog,
    () => null,
  )
  useEffect(() => {
    if (!cat) void loadNodeIcons()
  }, [cat])
  return cat
}
