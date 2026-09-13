export const POPOVER_W = 224

export const POPOVER_GAP = 14

export type Place = { x: number; y: number; flip: boolean }

export function popoverPlace({
  anchor,
  size,
  box,
  height,
  width = POPOVER_W,
  gap = POPOVER_GAP,
  edge = 8,
}: {
  anchor: { x: number; y: number }
  size: number
  box: { w: number; h: number }
  height: number
  width?: number
  gap?: number
  edge?: number
}): Place {
  const half = size / 2
  const right = anchor.x + half + gap
  const flip = right + width > box.w - edge
  const x = Math.max(edge, flip ? anchor.x - half - gap - width : right)
  const y = Math.min(
    Math.max(edge, anchor.y - height / 2),
    Math.max(edge, box.h - height - edge),
  )
  return { x, y, flip }
}
