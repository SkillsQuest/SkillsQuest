import type { CSSProperties } from 'react'

export function IconArt({
  d,
  size,
  stroke = 1.8,
  className,
  style,
  title,
  ...rest
}: {
  d: string
  size: number
  stroke?: number
  className?: string
  style?: CSSProperties
  role?: 'img'
  'aria-label'?: string
  title?: string
}) {
  const bar = d.indexOf('|')
  const line = bar < 0 ? d : d.slice(0, bar)
  const solid = bar < 0 ? '' : d.slice(bar + 1)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={rest['aria-label'] ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={line} />
      {solid ? <path d={solid} fill="currentColor" stroke="none" /> : null}
    </svg>
  )
}
