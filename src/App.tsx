import { useRef, useState } from 'react'
import { Button, ToastProvider, toast } from '@heroui/react'
import { EditorPage } from './editor/EditorPage'
import { Confirm, Empty } from './components/ui'
import { ICON, Ico } from './tree-view/index.ts'
import { useApp, useT, type StoredTree } from './host/store.ts'
import { MARK_PATH, MARK_VIEW_BOX } from './brand.ts'
import { LANGS, LANG_LABEL } from './i18n/index.ts'
import { validate, type SkillTreeDoc } from './skilltree/index.ts'

export function App() {
  const editing = useApp((s) => s.editing)

  return (
    <>
      {editing === undefined ? <TreeList /> : <EditorPage />}
      <ToastProvider placement="top" />
    </>
  )
}

function TreeList() {
  const trees = useApp((s) => s.trees)
  const openEditor = useApp((s) => s.openEditor)
  const importTree = useApp((s) => s.importTree)
  const deleteTree = useApp((s) => s.deleteTree)
  const lang = useApp((s) => s.settings.lang)
  const setLang = useApp((s) => s.set)
  const t = useT()
  const file = useRef<HTMLInputElement>(null)
  const [drop, setDrop] = useState<StoredTree>()

  const load = async (f: File) => {
    let doc: SkillTreeDoc
    try {
      doc = JSON.parse(await f.text()) as SkillTreeDoc
    } catch {
      toast.danger(t('shell.importBroken'))
      return
    }
    const check = validate(doc)
    if (!check.ok) {
      const first = check.issues.find((i) => i.level === 'error')
      toast.danger(t('shell.importInvalid', { code: first?.code ?? 'DOC_INVALID' }))
      return
    }
    const tree = importTree(doc)
    openEditor(tree.key)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col gap-5 px-4 py-6">
        <header className="flex flex-wrap items-center gap-2">
          <h1 className="mr-auto flex items-center gap-2 text-lg font-semibold">
            <svg viewBox={MARK_VIEW_BOX} className="h-6 w-auto" aria-hidden="true">
              <path fillRule="evenodd" d={MARK_PATH} fill="currentColor" />
            </svg>
            {t('shell.title')}
          </h1>
          <div className="flex gap-1 rounded-full bg-surface-secondary p-1">
            {LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setLang('lang', l)}
                className="tap rounded-full px-3 py-1 text-xs"
                style={{
                  background: lang === l ? 'var(--surface)' : undefined,
                  fontWeight: lang === l ? 600 : 400,
                }}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onPress={() => file.current?.click()}>
            <span className="flex items-center gap-1.5">
              <Ico name="upload" size={ICON.chip} />
              {t('shell.import')}
            </span>
          </Button>
          <Button size="sm" onPress={() => openEditor('@new')}>
            <span className="flex items-center gap-1.5">
              <Ico name="plus" size={ICON.chip} />
              {t('shell.new')}
            </span>
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void load(f)
            }}
          />
        </header>

        {trees.length === 0 ? (
          <Empty
            icon="tree"
            text={t('shell.empty')}
            action={
              <Button size="sm" onPress={() => openEditor('@new')}>
                {t('shell.new')}
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {trees.map((tree) => (
              <TreeCard
                key={tree.key}
                tree={tree}
                onOpen={() => openEditor(tree.key)}
                onDrop={() => setDrop(tree)}
              />
            ))}
          </ul>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-separator pt-4 text-xs text-muted">
          <span>{t('shell.copyright')}</span>
          <span>{t('shell.license')}</span>
        </footer>
      </div>

      {drop && (
        <Confirm
          title={t('editor.deleteTitle', { name: drop.doc.meta.name })}
          hint={t('editor.deleteHint')}
          ok={t('action.delete')}
          onOk={() => deleteTree(drop.key)}
          onClose={() => setDrop(undefined)}
        />
      )}
    </div>
  )
}

function TreeCard({
  tree,
  onOpen,
  onDrop,
}: {
  tree: StoredTree
  onOpen: () => void
  onDrop: () => void
}) {
  const t = useT()
  const { doc } = tree
  const accent = doc.meta.accent ?? 'var(--accent)'

  const save = () => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.meta.name || 'skilltree'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-surface">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: `color-mix(in oklab, ${accent} 16%, transparent)`, color: accent }}
      >
        <Ico name={doc.meta.icon ?? 'tree'} size={ICON.hero} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{doc.meta.name}</div>
        <div className="text-xs text-muted">
          {t('shell.counts', { nodes: doc.nodes.length, edges: doc.edges.length })}
        </div>
      </div>
      <Button variant="ghost" isIconOnly size="sm" aria-label={t('shell.export')} onPress={save}>
        <Ico name="download" size={ICON.row} />
      </Button>
      <Button variant="ghost" isIconOnly size="sm" aria-label={t('action.delete')} onPress={onDrop}>
        <Ico name="trash" size={ICON.row} />
      </Button>
      <Button size="sm" onPress={onOpen}>
        {t('action.edit')}
      </Button>
    </li>
  )
}
