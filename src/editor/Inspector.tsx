import { Button, Chip } from '@heroui/react'
import type { AppKey } from '../i18n/index.ts'
import type { Gate, SkillNode, SkillTreeDoc } from '../skilltree/index.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { IconGrid } from './IconPicker'
import { Step } from '../components/ui'
import { CondBuilder } from './CondBuilder'
import { useT } from '../host/store.ts'

const KINDS: { k: SkillNode['kind']; label: AppKey }[] = [
  { k: undefined, label: 'editor.kind.plain' },
  { k: 'boss', label: 'editor.kind.boss' },
  { k: 'leaf', label: 'editor.kind.leaf' },
  { k: 'core', label: 'editor.kind.core' },
]

export function Inspector({
  doc,
  node,
  onChange,
  onUnlink,
  onLink,
  onDelete,
  onClose,
}: {
  doc: SkillTreeDoc
  node: SkillNode
  onChange: (p: Partial<SkillNode>) => void
  onUnlink: (parent: string) => void
  onLink: () => void
  onDelete: () => void
  onClose: () => void
}) {
  const t = useT()
  const gate = (g: Partial<Gate>) => onChange({ gate: { ...node.gate, ...g } })
  const accent = doc.meta.accent ?? 'var(--accent)'

  const parents = doc.edges
    .filter(([, b]) => b === node.id)
    .map(([a]) => doc.nodes.find((n) => n.id === a))
    .filter((n): n is SkillNode => n !== undefined)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <input
          value={node.title}
          aria-label={t('editor.nodeName')}
          onChange={(e) => onChange({ title: e.target.value })}
          className="min-w-0 flex-1 rounded-xl bg-surface-secondary px-3 py-2 font-medium outline-none"
        />
        <Button variant="ghost" isIconOnly aria-label={t('action.close')} onPress={onClose}>
          <Ico name="close" size={ICON.row} />
        </Button>
      </div>

      <IconGrid
        value={node.icon}
        accent={accent}
        onPick={(icon) => onChange({ icon })}
        className="max-h-52"
      />

      <div className="flex gap-1 self-start rounded-full bg-surface-secondary p-1">
        {KINDS.map(({ k, label }) => (
          <button
            key={label}
            onClick={() => onChange({ kind: k })}
            className="rounded-full px-3 py-1 text-xs"
            style={{
              background: node.kind === k ? 'var(--surface)' : undefined,
              fontWeight: node.kind === k ? 600 : 400,
            }}
          >
            {t(label)}
          </button>
        ))}
      </div>

      <div>
        <div className="mb-1.5 text-xs text-muted">{t('editor.note')}</div>
        <textarea
          value={node.note ?? ''}
          aria-label={t('editor.note')}
          rows={2}
          onChange={(e) => onChange({ note: e.target.value })}
          className="field-sizing-content w-full resize-none rounded-xl bg-surface-secondary px-3 py-2 text-sm outline-none"
        />
      </div>

      <div>
        <div className="mb-1.5 text-xs text-muted">{t('editor.gate')}</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-full bg-surface-secondary p-1">
            {(
              [
                { v: false, label: 'editor.gate.any' },
                { v: true, label: 'editor.gate.all' },
              ] as const
            ).map(({ v, label }) => (
              <button
                key={label}
                onClick={() => gate({ all: v })}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: !!node.gate?.all === v ? 'var(--surface)' : undefined,
                  fontWeight: !!node.gate?.all === v ? 600 : 400,
                }}
              >
                {t(label)}
              </button>
            ))}
          </div>
          <Step
            label={doc.res?.name ?? t('res.fallbackName')}
            value={node.gate?.cost ?? 0}
            onChange={(cost) => gate({ cost })}
          />
          <Step label="Lv" value={node.gate?.lv ?? 0} onChange={(lv) => gate({ lv })} />
        </div>
      </div>

      <CondBuilder doc={doc} when={node.gate?.when} onChange={(when) => gate({ when })} />

      <div>
        <div className="mb-1.5 text-xs text-muted">{t('editor.prereq')}</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {parents.map((p) => (
            <button key={p.id} onClick={() => onUnlink(p.id)}>
              <Chip size="sm" variant="soft">
                <span className="flex items-center gap-1">
                  <Ico name={p.icon ?? 'dot'} size={ICON.tiny} />
                  {p.title}
                  <Ico name="close" size={ICON.tiny} className="opacity-50" />
                </span>
              </Chip>
            </button>
          ))}
          <Button size="sm" variant="ghost" onPress={onLink}>
            {t('editor.addEdge')}
          </Button>
        </div>
      </div>

      <Button variant="danger-soft" onPress={onDelete}>
        {t('editor.deleteNode')}
      </Button>
    </div>
  )
}
