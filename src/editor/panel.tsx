import type { ReactNode } from 'react'
import { Button, Switch } from '@heroui/react'
import { ICON, Ico } from '../tree-view/index.ts'
import { useT } from '../host/store.ts'

export function PanelHead({ title, onClose }: { title: string; onClose: () => void }) {
  const t = useT()
  return (
    <div className="flex items-center justify-between">
      <div className="font-medium">{title}</div>
      <Button variant="ghost" isIconOnly aria-label={t('action.close')} onPress={onClose}>
        <Ico name="close" size={ICON.row} />
      </Button>
    </div>
  )
}

export function Field({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs text-muted">{title}</div>
      {children}
    </div>
  )
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl bg-surface-secondary/50 p-3">
      <div className="text-sm font-medium">{title}</div>
      {hint && <div className="mt-0.5 text-xs leading-relaxed text-muted">{hint}</div>}
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

export function SwitchRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string
  hint?: string
  on: boolean
  onChange: (on: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm">{label}</div>
        {hint && <div className="mt-0.5 text-xs leading-relaxed text-muted">{hint}</div>}
      </div>
      <Switch isSelected={on} onChange={onChange} aria-label={label}>
        <Switch.Content>
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Content>
      </Switch>
    </div>
  )
}
