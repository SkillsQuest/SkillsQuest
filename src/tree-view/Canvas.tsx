import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from 'react'
import { CAMERA_MS } from '../lib/index.ts'
import { stillness } from './motion.ts'

export type View = {
  x: number
  y: number
  k: number
  w?: number
  h?: number
}
type World = { x: number; y: number; w: number; h: number }
export type CanvasHandle = {
  fit: (all?: boolean) => void
  focus: (x: number, y: number, k?: number) => void
  moveTo: (x: number, y: number) => void
  zoomBy: (f: number) => void
  zoomTo: (k: number) => void
  view: () => View
}

export const ZOOM = { min: 0.25, max: 2.5 } as const

const FIT_MIN = 0.5

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export function Canvas({
  world,
  bg,
  start,
  ref,
  children,
  onViewChange,
  onTap,
  onDoubleTap,
}: {
  world: World
  bg?: React.CSSProperties
  start?: { x: number; y: number; k: number }
  ref?: Ref<CanvasHandle>
  children: ReactNode
  onViewChange?: (v: View) => void
  onTap?: (p: { x: number; y: number }) => void
  onDoubleTap?: (p: { x: number; y: number }) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const size = useRef({ w: 0, h: 0 })
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 })
  const viewRef = useRef(view)
  const moved = useRef(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ d: number; cx: number; cy: number } | null>(null)
  const frame = useRef(0)

  const apply = useCallback(
    (v: View) => {
      const full = { ...v, w: size.current.w, h: size.current.h }
      viewRef.current = full
      setView(full)
      onViewChange?.(full)
    },
    [onViewChange],
  )

  const at = useCallback((x: number, y: number, k: number): View => {
    const { w, h } = size.current
    return { k, x: w / 2 - x * k, y: h / 2 - y * k }
  }, [])

  const halt = useCallback(() => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [])

  const glide = useCallback(
    (to: View) => {
      halt()
      const from = viewRef.current
      const near =
        Math.abs(to.x - from.x) < 1 && Math.abs(to.y - from.y) < 1 && Math.abs(to.k - from.k) < 0.01
      if (near || stillness()) return apply(to)

      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / CAMERA_MS)
        const e = ease(p)
        apply({
          k: from.k + (to.k - from.k) * e,
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
        })
        frame.current = p < 1 ? requestAnimationFrame(step) : 0
      }
      frame.current = requestAnimationFrame(step)
    },
    [apply, halt],
  )

  const focus = useCallback(
    (x: number, y: number, k = viewRef.current.k) => glide(at(x, y, k)),
    [at, glide],
  )

  const moveTo = useCallback(
    (x: number, y: number) => {
      halt()
      apply(at(x, y, viewRef.current.k))
    },
    [apply, at, halt],
  )

  const whole = useCallback(
    (all?: boolean): View | undefined => {
      const { w, h } = size.current
      if (!w || !h) return undefined
      const k = clamp(Math.min(w / world.w, h / world.h), all ? ZOOM.min : FIT_MIN, 1.2)
      return at(world.x + world.w / 2, world.y + world.h / 2, k)
    },
    [at, world],
  )

  const zoomAt = useCallback(
    (factor: number, px: number, py: number) => {
      halt()
      const v = viewRef.current
      const k = clamp(v.k * factor, ZOOM.min, ZOOM.max)
      const r = k / v.k
      apply({ k, x: px - (px - v.x) * r, y: py - (py - v.y) * r })
    },
    [apply, halt],
  )

  const zoomCenter = useCallback(
    (factor: number) => zoomAt(factor, size.current.w / 2, size.current.h / 2),
    [zoomAt],
  )

  useImperativeHandle(ref, () => ({
    fit: (all) => {
      const to = whole(all)
      if (to) glide(to)
    },
    focus,
    moveTo,
    zoomBy: zoomCenter,
    zoomTo: (k) => zoomCenter(k / viewRef.current.k),
    view: () => viewRef.current,
  }))

  useEffect(() => halt, [halt])

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect()
      const prev = size.current
      size.current = { w: r.width, h: r.height }
      if (!prev.w) {
        const to = start ? at(start.x, start.y, start.k) : whole()
        if (to) apply(to)
      } else {
        halt()
        const v = viewRef.current
        apply({ ...v, x: v.x + (r.width - prev.w) / 2, y: v.y + (r.height - prev.h) / 2 })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [apply, at, halt, start, whole])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      halt()
      const r = el.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY / 200), px, py)
      else {
        const v = viewRef.current
        apply({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [apply, halt, zoomAt])

  const local = (e: { clientX: number; clientY: number }) => {
    const r = box.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const down = (e: React.PointerEvent) => {
    halt()
    if (e.button !== 0) return
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, local(e))
    moved.current = false
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      if (!a || !b) return
      pinch.current = {
        d: Math.hypot(a.x - b.x, a.y - b.y),
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
      }
    }
  }

  const move = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    if (e.buttons === 0) {
      pointers.current.delete(e.pointerId)
      pinch.current = null
      return
    }
    const p = local(e)
    pointers.current.set(e.pointerId, p)

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      if (!a || !b) return
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      const cx = (a.x + b.x) / 2
      const cy = (a.y + b.y) / 2
      zoomAt(d / pinch.current.d, cx, cy)
      const v = viewRef.current
      apply({ ...v, x: v.x + (cx - pinch.current.cx), y: v.y + (cy - pinch.current.cy) })
      pinch.current = { d, cx, cy }
      moved.current = true
      return
    }

    const dx = p.x - prev.x
    const dy = p.y - prev.y
    if (Math.abs(dx) + Math.abs(dy) > 1) moved.current = true
    const v = viewRef.current
    apply({ ...v, x: v.x + dx, y: v.y + dy })
  }

  const up = (e: React.PointerEvent) => {
    const mine = pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (mine && !moved.current && onTap && e.target === box.current) {
      const p = local(e)
      const v = viewRef.current
      onTap({ x: (p.x - v.x) / v.k, y: (p.y - v.y) / v.k })
    }
  }

  return (
    <div
      ref={box}
      className="canvas-surface relative h-full w-full overflow-hidden bg-background"
      style={bg}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onDoubleClick={(e) => {
        const p = local(e)
        if (onDoubleTap) {
          if (e.target !== box.current) return
          const v = viewRef.current
          return onDoubleTap({ x: (p.x - v.x) / v.k, y: (p.y - v.y) / v.k })
        }
        zoomAt(1.6, p.x, p.y)
      }}
      onClickCapture={(e) => {
        if (moved.current) {
          e.stopPropagation()
          e.preventDefault()
        }
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.k})` }}
      >
        {children}
      </div>
    </div>
  )
}
