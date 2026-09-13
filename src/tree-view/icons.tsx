import type { CSSProperties } from 'react'
import { ICONS, type IconKey } from './icons-data.ts'
import { IconArt } from './iconArt.tsx'
import { useNodeIcons } from './nodeIcons.ts'

export const ICON = {
  tiny: 12,
  chip: 14,
  row: 16,
  pill: 18,
  nav: 22,
  hero: 26,
} as const

export function Ico({
  name,
  size = ICON.nav,
  stroke = 1.8,
  className,
  style,
  ...aria
}: {
  name: string
  size?: number
  stroke?: number
  className?: string
  style?: CSSProperties
  role?: 'img'
  'aria-label'?: string
  title?: string
}) {
  const C = ICONS[name as IconKey]
  if (C) return <C size={size} stroke={stroke} className={className} style={style} {...aria} />
  return <NodeIcon name={name} size={size} stroke={stroke} className={className} style={style} {...aria} />
}

function NodeIcon({
  name,
  size,
  stroke,
  className,
  style,
  ...aria
}: {
  name: string
  size: number
  stroke: number
  className?: string
  style?: CSSProperties
  role?: 'img'
  'aria-label'?: string
  title?: string
}) {
  const cat = useNodeIcons()
  if (!cat) return <svg width={size} height={size} aria-hidden className={className} style={style} />
  return (
    <IconArt
      d={cat.nodeIconPath(name)}
      size={size}
      stroke={stroke}
      className={className}
      style={style}
      {...aria}
    />
  )
}
