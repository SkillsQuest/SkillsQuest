import { Button } from '@heroui/react'
import type { AppKey } from '../i18n/index.ts'
import type { Attr, AttrType, SkillTreeDoc } from '../skilltree/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { Seg } from '../components/ui'
import { useT, type AppT } from '../host/store.ts'

const TYPES: [AttrType, AppKey][] = [
  ['number', 'editor.attr.type.number'],
  ['enum', 'editor.attr.type.enum'],
  ['bool', 'editor.attr.type.bool'],
]

const labelled = (items: [AttrType, AppKey][], t: AppT): [AttrType, string][] =>
  items.map(([value, key]) => [value, t(key)])

function slug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
}) {
  return (
    <label className="flex items-center gap-1 text-xs text-muted">
      {label}
      <input
        type="number"
        value={value ?? ''}
        aria-label={label}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className="w-14 rounded-lg bg-surface-secondary px-2 py-1 text-sm text-foreground outline-none"
      />
    </label>
  )
}

export function AttrTable({
  doc,
  onChange,
}: {
  doc: SkillTreeDoc
  onChange: (p: Partial<SkillTreeDoc>) => void
}) {
  const t = useT()
  const attrs = doc.attrs ?? []
  const set = (next: Attr[]) => onChange({ attrs: next })
  const patch = (i: number, a: Partial<Attr>) => set(attrs.map((x, j) => (i === j ? { ...x, ...a } : x)))

  return (
    <div className="space-y-2">
      {attrs.map((attr, i) => (
        <div key={i} className="space-y-2 rounded-xl bg-surface-secondary p-2.5">
          <div className="flex items-center gap-1.5">
            <input
              value={attr.name}
              aria-label={t('editor.attr.name')}
              placeholder={t('editor.attr.name')}
              onChange={(e) => patch(i, { name: e.target.value })}
              className="min-w-0 flex-1 rounded-lg bg-surface px-2 py-1.5 text-sm outline-none"
            />
            <input
              value={attr.key}
              aria-label={t('editor.attr.key')}
              placeholder={t('editor.attr.key')}
              onChange={(e) => patch(i, { key: slug(e.target.value) })}
              className="w-20 rounded-lg bg-surface px-2 py-1.5 font-mono text-xs outline-none"
            />
            <button
              onClick={() => set(attrs.filter((_, j) => j !== i))}
              aria-label={t('action.delete')}
              className="px-1 text-muted"
            >
              <Ico name="trash" size={ICON.row} />
            </button>
          </div>

          <Seg
            items={labelled(TYPES, t)}
            value={attr.type}
            onPick={(type) =>
              patch(i, { type, min: undefined, max: undefined, options: type === 'enum' ? [] : undefined, default: undefined })
            }
          />

          {attr.type === 'number' && (
            <div className="flex flex-wrap gap-3">
              <NumField label={t('editor.attr.min')} value={attr.min} onChange={(min) => patch(i, { min })} />
              <NumField label={t('editor.attr.max')} value={attr.max} onChange={(max) => patch(i, { max })} />
              <NumField
                label={t('editor.attr.default')}
                value={typeof attr.default === 'number' ? attr.default : undefined}
                onChange={(d) => patch(i, { default: d })}
              />
            </div>
          )}

          {attr.type === 'enum' && (
            <div className="space-y-1.5">
              {(attr.options ?? []).map((opt, k) => (
                <div key={k} className="flex items-center gap-1.5">
                  <input
                    value={opt.value}
                    aria-label={t('editor.attr.optionValue')}
                    placeholder={t('editor.attr.optionValue')}
                    onChange={(e) =>
                      patch(i, {
                        options: (attr.options ?? []).map((o, m) =>
                          m === k ? { ...o, value: slug(e.target.value) } : o,
                        ),
                      })
                    }
                    className="w-20 rounded-lg bg-surface px-2 py-1 font-mono text-xs outline-none"
                  />
                  <input
                    value={opt.name}
                    aria-label={t('editor.attr.optionName')}
                    placeholder={t('editor.attr.optionName')}
                    onChange={(e) =>
                      patch(i, {
                        options: (attr.options ?? []).map((o, m) =>
                          m === k ? { ...o, name: e.target.value } : o,
                        ),
                      })
                    }
                    className="min-w-0 flex-1 rounded-lg bg-surface px-2 py-1 text-sm outline-none"
                  />
                  <button
                    onClick={() => patch(i, { options: (attr.options ?? []).filter((_, m) => m !== k) })}
                    aria-label={t('action.delete')}
                    className="px-1 text-muted"
                  >
                    <Ico name="close" size={ICON.chip} />
                  </button>
                </div>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onPress={() => patch(i, { options: [...(attr.options ?? []), { value: '', name: '' }] })}
              >
                <span className="flex items-center gap-1">
                  <Ico name="plus" size={ICON.chip} />
                  {t('editor.attr.optionAdd')}
                </span>
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button
        size="sm"
        variant="ghost"
        onPress={() => set([...attrs, { key: `attr${attrs.length + 1}`, name: '', type: 'number' }])}
      >
        <span className="flex items-center gap-1">
          <Ico name="plus" size={ICON.chip} />
          {t('editor.attr.add')}
        </span>
      </Button>
    </div>
  )
}
