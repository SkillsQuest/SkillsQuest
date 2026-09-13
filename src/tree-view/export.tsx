import { renderToStaticMarkup } from 'react-dom/server'
import type { SkillTreeDoc } from '../skilltree/index.ts'
import { TreeSvg, treeSvgBounds, type TreeSvgProps } from './svg.tsx'

export type RenderSvgOptions = Omit<TreeSvgProps, 'doc'>

export function renderTreeSvg(doc: SkillTreeDoc, options: RenderSvgOptions = {}): string {
  return renderToStaticMarkup(<TreeSvg doc={doc} {...options} />)
}

const MAX_PX = 8000

export async function renderTreePng(
  doc: SkillTreeDoc,
  options: Omit<RenderSvgOptions, 'scale'> = {},
): Promise<Blob | null> {
  const box = treeSvgBounds(doc)
  const scale = Math.max(1, Math.min(2, MAX_PX / box.w, MAX_PX / box.h))
  const svg = renderTreeSvg(doc, { ...options, scale })
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const el = new Image()
      el.addEventListener('load', () => resolve(el), { once: true })
      el.addEventListener('error', () => resolve(null), { once: true })
      el.src = url
    })
    if (!img) return null
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(box.w * scale)
    canvas.height = Math.round(box.h * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}
