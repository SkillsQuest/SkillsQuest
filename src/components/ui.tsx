import type { ReactNode } from 'react'
import { AlertDialog, Button, EmptyState } from '@heroui/react'
import { useT } from '../host/store.ts'
import { ICON, Ico } from '../tree-view/index.ts'

type Item<T> = T | readonly [T, string]

export function Seg<T extends string>({
  items,
  value,
  onPick,
  accent,
}: {
  items: readonly Item<T>[]
  value: T
  onPick: (v: T) => void
  accent?: string
}) {
  return (
    <div
      className="flex shrink-0 flex-wrap gap-1 rounded-full p-1"
      style={{ background: accent ? undefined : 'var(--surface-secondary)' }}
    >
      {items.map((raw) => {
        const [k, t] = (Array.isArray(raw) ? raw : [raw, raw]) as readonly [T, string]
        const on = value === k
        return (
          <button
            key={k}
            onClick={() => onPick(k)}
            className="tap rounded-full px-2.5 py-1 text-xs whitespace-nowrap"
            style={{
              background: on
                ? accent
                  ? `${accent}22`
                  : 'var(--surface)'
                : accent
                  ? 'var(--surface-secondary)'
                  : undefined,
              color: on && accent ? accent : undefined,
              fontWeight: on ? 600 : 400,
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

export function Step({
  label,
  value,
  max = 9,
  step = 1,
  onChange,
}: {
  label?: string
  value: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  const t = useT()
  return (
    <div className="flex items-center gap-1 rounded-full bg-surface-secondary px-1 py-1 text-xs">
      <button
        className="tap px-1.5"
        aria-label={t('ui.decrease')}
        onClick={() => onChange(Math.max(0, value - step))}
      >
        <Ico name="minus" size={ICON.tiny} />
      </button>
      <span className="min-w-8 text-center font-medium" style={{ opacity: value ? 1 : 0.4 }}>
        {label ? `${label} ${value}` : value || '—'}
      </span>
      <button
        className="tap px-1.5"
        aria-label={t('ui.increase')}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <Ico name="plus" size={ICON.tiny} />
      </button>
    </div>
  )
}

export function Notice({
  title,
  hint,
  onClose,
}: {
  title: string
  hint?: ReactNode
  onClose: () => void
}) {
  const t = useT()
  return (
    <AlertDialog isOpen onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Backdrop className="absolute inset-0 z-[70]">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-full max-w-72">
            <AlertDialog.Header>
              <AlertDialog.Heading className="font-medium">{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            {hint && (
              <AlertDialog.Body className="text-sm leading-relaxed text-muted">
                {hint}
              </AlertDialog.Body>
            )}
            <AlertDialog.Footer className="mt-4">
              <Button fullWidth size="sm" onPress={onClose}>
                {t('action.gotIt')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

export function Confirm({
  title,
  hint,
  ok,
  onOk,
  onClose,
}: {
  title: string
  hint?: ReactNode
  ok?: ReactNode
  onOk: () => void
  onClose: () => void
}) {
  const t = useT()
  return (
    <AlertDialog isOpen onOpenChange={(v) => !v && onClose()}>
      <AlertDialog.Backdrop className="absolute inset-0 z-[70]">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="w-full max-w-72">
            <AlertDialog.Header>
              <AlertDialog.Heading className="font-medium">{title}</AlertDialog.Heading>
            </AlertDialog.Header>
            {hint && (
              <AlertDialog.Body className="flex items-center gap-1 text-sm text-muted">
                {hint}
              </AlertDialog.Body>
            )}
            <AlertDialog.Footer className="mt-4 flex gap-2">
              <Button fullWidth size="sm" variant="ghost" onPress={onClose}>
                {t('action.cancel')}
              </Button>
              <Button
                fullWidth
                size="sm"
                onPress={() => {
                  onOk()
                  onClose()
                }}
              >
                {ok ?? t('action.confirm')}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}

const stateBox =
  'rise flex w-full flex-1 flex-col items-center justify-center gap-3 py-12 text-center'

const stateIcon = 'flex size-16 items-center justify-center rounded-2xl bg-surface-secondary'
export function Empty({ icon, text, action }: { icon: string; text: string; action?: ReactNode }) {
  return (
    <EmptyState className={stateBox}>
      <span className={stateIcon}>
        <Ico name={icon} size={ICON.hero} />
      </span>
      <div className="text-sm font-medium text-foreground">{text}</div>
      {action}
    </EmptyState>
  )
}
