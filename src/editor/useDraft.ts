import { useCallback, useState } from 'react'
import type { SkillTreeDoc } from '../skilltree/index.ts'

interface Step {
  doc: SkillTreeDoc
  tag?: string
}

interface History {
  now: SkillTreeDoc
  past: Step[]
  future: Step[]
}

const push = (stack: Step[], v: Step) => [...stack.slice(-40), v]

export function useDraft(init: SkillTreeDoc) {
  const [h, setH] = useState<History>({ now: init, past: [], future: [] })

  const silent = useCallback(
    (fn: (d: SkillTreeDoc) => SkillTreeDoc) => setH((s) => ({ ...s, now: fn(s.now) })),
    [],
  )

  const mark = useCallback(
    () => setH((s) => ({ ...s, past: push(s.past, { doc: s.now }), future: [] })),
    [],
  )

  const apply = useCallback(
    (fn: (d: SkillTreeDoc) => SkillTreeDoc, tag?: string) =>
      setH((s) => ({ now: fn(s.now), past: push(s.past, { doc: s.now, tag }), future: [] })),
    [],
  )

  const undo = useCallback(
    () =>
      setH((s) => {
        const prev = s.past.at(-1)
        if (!prev) return s
        return {
          now: prev.doc,
          past: s.past.slice(0, -1),
          future: [{ doc: s.now, tag: prev.tag }, ...s.future],
        }
      }),
    [],
  )

  const redo = useCallback(
    () =>
      setH((s) => {
        const next = s.future[0]
        if (!next) return s
        return {
          now: next.doc,
          past: push(s.past, { doc: s.now, tag: next.tag }),
          future: s.future.slice(1),
        }
      }),
    [],
  )

  const forgetRedo = useCallback(() => setH((s) => ({ ...s, future: s.future.slice(1) })), [])

  const reset = useCallback(
    (doc: SkillTreeDoc) =>
      setH((s) => ({
        now: doc,
        past: s.past.map(({ doc: d }) => ({ doc: d })),
        future: s.future.map(({ doc: d }) => ({ doc: d })),
      })),
    [],
  )

  return {
    draft: h.now,
    apply,
    silent,
    mark,
    undo,
    redo,
    forgetRedo,
    reset,
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
    undoTag: h.past.at(-1)?.tag,
  }
}
