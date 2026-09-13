import { Switch } from '@heroui/react'
import type { AppKey } from '../i18n/index.ts'
import { ACCENTS } from '../lib/index.ts'
import type {
  Background,
  EdgeStyle,
  Layout,
  Shape,
  SkillTreeDoc,
  Theme,
} from '../skilltree/index.ts'
import { DEFAULT_THEME } from '../skilltree/index.ts'
import { Seg } from '../components/ui'
import { useT, type AppT } from '../host/store.ts'
import { Field, PanelHead } from './panel'

const SHAPES: [Shape, AppKey][] = [
  ['circle', 'editor.shape.circle'],
  ['square', 'editor.shape.square'],
  ['hex', 'editor.shape.hex'],
  ['diamond', 'editor.shape.diamond'],
]
const EDGES: [EdgeStyle, AppKey][] = [
  ['solid', 'editor.edge.solid'],
  ['dashed', 'editor.edge.dashed'],
  ['glow', 'editor.edge.glow'],
  ['step', 'editor.edge.step'],
]
const BGS: [Background, AppKey][] = [
  ['dots', 'editor.bg.dots'],
  ['grid', 'editor.bg.grid'],
  ['glow', 'editor.bg.glow'],
  ['plain', 'editor.bg.plain'],
]
const LAYOUTS: [Layout, AppKey][] = [
  ['flow', 'editor.layout.flow'],
  ['web', 'editor.layout.web'],
  ['mind', 'editor.layout.mind'],
]

const labelled = <V extends string>(items: [V, AppKey][], t: AppT): [V, string][] =>
  items.map(([value, key]) => [value, t(key)])

export function StylePanel({
  doc,
  onChange,
  onLayout,
  onClose,
}: {
  doc: SkillTreeDoc
  onChange: (p: Partial<SkillTreeDoc>) => void
  onLayout: (layout: Layout) => void
  onClose: () => void
}) {
  const t = useT()
  const theme: Theme = doc.theme ?? DEFAULT_THEME
  const accent = doc.meta.accent ?? 'var(--accent)'
  const set = (p: Partial<SkillTreeDoc>) => onChange(p)

  return (
    <div className="flex flex-col gap-4 p-4">
      <PanelHead title={t('editor.style')} onClose={onClose} />

      <Field title={t('editor.field.color')}>
        <div className="flex gap-1.5">
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => set({ meta: { ...doc.meta, accent: c } })}
              aria-label={c}
              aria-pressed={doc.meta.accent === c}
              className="tap size-7 rounded-full"
              style={{
                background: c,
                outline: doc.meta.accent === c ? '2px solid var(--foreground)' : undefined,
                outlineOffset: 2,
              }}
            />
          ))}
        </div>
      </Field>

      <Field title={t('editor.field.shape')}>
        <Seg
          items={labelled(SHAPES, t)}
          value={theme.shape}
          accent={accent}
          onPick={(shape) => set({ theme: { ...theme, shape } })}
        />
      </Field>

      <Field title={t('editor.field.edge')}>
        <Seg
          items={labelled(EDGES, t)}
          value={theme.edge}
          accent={accent}
          onPick={(edge) => set({ theme: { ...theme, edge } })}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          {t('editor.edge.arrows')}
          <Switch
            isSelected={!!theme.arrows}
            onChange={(arrows) => set({ theme: { ...theme, arrows } })}
            aria-label={t('editor.edge.arrows')}
          >
            <Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Content>
          </Switch>
        </div>
      </Field>

      <Field title={t('editor.field.bg')}>
        <Seg
          items={labelled(BGS, t)}
          value={theme.bg}
          accent={accent}
          onPick={(bg) => set({ theme: { ...theme, bg } })}
        />
      </Field>

      <Field title={t('editor.field.layout')}>
        <Seg items={labelled(LAYOUTS, t)} value={doc.layout} accent={accent} onPick={onLayout} />
      </Field>
    </div>
  )
}
