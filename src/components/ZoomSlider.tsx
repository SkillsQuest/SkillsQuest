import { useEffect, useRef, useState } from 'react'
import { Button, Slider } from '@heroui/react'
import { ZOOM } from '../tree-view/index.ts'
import { useT } from '../host/store.ts'

export function ZoomSlider({ k, onZoom }: { k: number; onZoom: (k: number) => void }) {
  const t = useT()
  const [dragging, setDragging] = useState<number>()
  const frame = useRef(0)
  const next = useRef(k)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const push = (to: number) => {
    next.current = to
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      onZoom(next.current)
    })
  }

  const settle = (to: number) => {
    cancelAnimationFrame(frame.current)
    frame.current = 0
    onZoom(to)
    setDragging(undefined)
  }

  const at = dragging ?? k

  return (
    <div className="flex h-10 items-center gap-1 rounded-full bg-overlay pr-1 pl-3 shadow-overlay md:h-9">
      <Slider
        aria-label={t('editor.zoom')}
        minValue={ZOOM.min}
        maxValue={ZOOM.max}
        step={0.01}
        value={at}
        formatOptions={{ style: 'percent' }}
        onChange={(v) => {
          const to = v as number
          setDragging(to)
          push(to)
        }}
        onChangeEnd={(v) => settle(v as number)}
        className="w-24 gap-0"
      >
        <Slider.Track className="h-1.5 border-x-8">
          <Slider.Fill />
          <Slider.Thumb className="w-4 after:size-4 after:rounded-full" />
        </Slider.Track>
      </Slider>
      <Button
        variant="ghost"
        size="sm"
        aria-label={t('editor.zoomReset')}
        onPress={() => settle(1)}
        className="w-12 px-0 text-xs tabular-nums"
      >
        {Math.round(at * 100)}%
      </Button>
    </div>
  )
}
