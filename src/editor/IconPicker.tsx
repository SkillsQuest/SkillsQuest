import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, Popover } from '@heroui/react'
import type { CommonKey } from '../i18n/index.ts'
import { loadNodeIcons, useNodeIcons } from '../tree-view/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { useT } from '../host/store.ts'

const GROUP_LABEL = {
  core: 'icon.group.core',
  study: 'icon.group.study',
  tech: 'icon.group.tech',
  body: 'icon.group.body',
  food: 'icon.group.food',
  nature: 'icon.group.nature',
  place: 'icon.group.place',
  make: 'icon.group.make',
  life: 'icon.group.life',
  brand: 'icon.group.brand',
  sign: 'icon.group.sign',
  other: 'icon.group.other',
} satisfies Record<string, CommonKey>

const EMPTY: readonly string[] = []
const NO_GROUPS: { key: string; icons: readonly string[] }[] = []

function Cell({
  icon,
  on,
  accent,
  onPick,
}: {
  icon: string
  on: boolean
  accent: string
  onPick: (icon: string) => void
}) {
  return (
    <button
      onClick={() => onPick(icon)}
      aria-label={icon}
      aria-pressed={on}
      className="tap flex size-8 items-center justify-center rounded-lg"
      style={{
        background: on ? `${accent}33` : 'var(--surface-secondary)',
        color: on ? accent : undefined,
      }}
    >
      <Ico name={icon} size={ICON.row} />
    </button>
  )
}

export function IconRow({
  icons,
  value,
  accent,
  onPick,
  className,
}: {
  icons: readonly string[]
  value: string | undefined
  accent: string
  onPick: (icon: string) => void
  className?: string
}) {
  return (
    <div className={`grid grid-cols-8 gap-1 ${className ?? ''}`}>
      {icons.map((i) => (
        <Cell key={i} icon={i} on={value === i} accent={accent} onPick={onPick} />
      ))}
    </div>
  )
}

export function IconGrid({
  value,
  accent,
  onPick,
  className,
}: {
  value: string | undefined
  accent: string
  onPick: (icon: string) => void
  className?: string
}) {
  const t = useT()
  const cat = useNodeIcons()
  const [group, setGroup] = useState('core')
  const [query, setQuery] = useState('')

  useEffect(() => void loadNodeIcons(), [])

  const q = query.trim()
  const groups = cat?.NODE_ICON_GROUPS ?? NO_GROUPS
  const shown = useMemo(() => {
    if (!cat) return EMPTY
    if (q) return cat.searchNodeIcons(q)
    return cat.NODE_ICON_GROUPS.find((g) => g.key === group)?.icons ?? EMPTY
  }, [cat, q, group])

  const picked = cat ? cat.nodeIconName(value) : value

  return (
    <div className={`flex min-h-0 flex-col gap-2 ${className ?? ''}`}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t('icon.search')}
        placeholder={t('icon.search')}
        className="shrink-0 rounded-xl bg-surface-secondary px-3 py-1.5 text-sm outline-none"
      />
      {!q && (
        <div className="flex shrink-0 flex-wrap gap-1">
          {groups.map((g) => (
            <button
              key={g.key}
              onClick={() => setGroup(g.key)}
              aria-pressed={group === g.key}
              className="shrink-0 rounded-full px-2.5 py-1 text-xs"
              style={{
                background: group === g.key ? `${accent}33` : 'var(--surface-secondary)',
                color: group === g.key ? accent : undefined,
              }}
            >
              {t(GROUP_LABEL[g.key as keyof typeof GROUP_LABEL])}
            </button>
          ))}
        </div>
      )}

      {q && cat && shown.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted">{t('icon.none')}</div>
      ) : (
        <div className="no-scrollbar grid min-h-0 grid-cols-8 gap-1 overflow-y-auto">
          {shown.map((i) => (
            <Cell key={i} icon={i} on={picked === i} accent={accent} onPick={onPick} />
          ))}
        </div>
      )}
    </div>
  )
}

export function IconPickerButton({
  icon,
  accent,
  label,
  onPick,
  trigger,
}: {
  icon: string
  accent: string
  label: string
  onPick: (icon: string) => void
  trigger?: ReactNode
}) {
  return (
    <Popover>
      {trigger ?? (
        <Button variant="ghost" isIconOnly aria-label={label} style={{ color: accent }}>
          <Ico name={icon} size={ICON.pill} />
        </Button>
      )}
      <Popover.Content placement="bottom start" className="w-[19.5rem]">
        <Popover.Dialog className="p-3">
          <div className="mb-2 text-xs text-muted">{label}</div>
          <IconGrid value={icon} accent={accent} onPick={onPick} className="max-h-72" />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}
