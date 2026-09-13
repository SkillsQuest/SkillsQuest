import { SQUARE_RADIUS, nodePoly } from '../skilltree/index.ts'
import type { Background, Shape } from '../skilltree/index.ts'

export { GLOW_LAYERS, SQUARE_RADIUS } from '../skilltree/index.ts'

const CLIP: Record<Shape, string | undefined> = {
  circle: undefined,
  square: undefined,
  hex: clipOf('hex'),
  diamond: clipOf('diamond'),
}

function clipOf(shape: Shape): string | undefined {
  const pts = nodePoly(shape)
  return pts && `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(', ')})`
}

export function polyPoints(shape: Shape, cx: number, cy: number, size: number): string {
  const pts = nodePoly(shape)
  if (!pts) return ''
  return pts
    .map(([px, py]) => `${cx + (px / 100 - 0.5) * size},${cy + (py / 100 - 0.5) * size}`)
    .join(' ')
}

export const GATE_BADGE_ICON = 9

export function shapeStyle(shape: Shape): { clip?: string; radius: string } {
  return { clip: CLIP[shape], radius: shape === 'square' ? `${SQUARE_RADIUS * 100}%` : '50%' }
}

export function bgStyle(
  bg: Background,
  accent: string,
  view: { x: number; y: number; k: number },
): React.CSSProperties | undefined {
  if (bg === 'plain') return undefined
  if (bg === 'glow') {
    return {
      backgroundImage: `radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, ${accent} 18%, transparent), transparent 70%)`,
    }
  }
  if (bg === 'grid') {
    const s = 32 * view.k
    const line = 'color-mix(in oklab, var(--foreground) 8%, transparent)'
    return {
      backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
      backgroundSize: `${s}px ${s}px, ${s}px ${s}px`,
      backgroundPosition: `${view.x}px ${view.y}px`,
    }
  }
  return {
    backgroundImage:
      'radial-gradient(circle, color-mix(in oklab, var(--foreground) 14%, transparent) 1px, transparent 1px)',
    backgroundSize: `${28 * view.k}px ${28 * view.k}px`,
    backgroundPosition: `${view.x}px ${view.y}px`,
  }
}
