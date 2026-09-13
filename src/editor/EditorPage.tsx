import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Switch, toast } from '@heroui/react'
import type { AppKey } from '../i18n/index.ts'
import {
  boundsOf,
  clonePlain,
  layoutNodes,
  requiredCapabilities,
  themeOf,
  validate,
  type Layout,
  type SkillNode,
  type SkillTreeDoc,
} from '../skilltree/index.ts'
import { Canvas, type CanvasHandle } from '../tree-view/index.ts'
import { ZoomSlider } from '../components/ZoomSlider'
import { EditTreeView, type Mode } from './EditTreeView'
import { Inspector } from './Inspector'
import { IconPickerButton } from './IconPicker'
import { RulesPanel } from './RulesPanel'
import { StylePanel } from './StylePanel'
import { useDraft } from './useDraft'
import { bgStyle } from '../tree-view/index.ts'
import { Confirm } from '../components/ui'
import { useApp, useT } from '../host/store.ts'
import { ICON, Ico } from '../tree-view/index.ts'
import { docIssueKey, docIssueVars, emptyDoc, newNode } from '../lib/index.ts'

const MODES: { mode: Mode; label: AppKey; icon: string }[] = [
  { mode: 'pick', label: 'editor.mode.pick', icon: 'pointer' },
  { mode: 'link', label: 'editor.mode.link', icon: 'link' },
  { mode: 'add', label: 'editor.mode.add', icon: 'plus' },
]

type Dock = { kind: 'style' } | { kind: 'rules' } | { kind: 'node'; id: string }

export function EditorPage() {
  const editing = useApp((s) => s.editing) ?? '@new'
  const close = useApp((s) => s.closeEditor)
  const trees = useApp((s) => s.trees)
  const createTree = useApp((s) => s.createTree)
  const saveTree = useApp((s) => s.saveTree)
  const deleteTree = useApp((s) => s.deleteTree)
  const busy = useApp((s) => s.busy)
  const t = useT()

  const seed = useMemo<SkillTreeDoc>(() => {
    if (editing === '@new') return emptyDoc(t('editor.untitled'), t('res.fallbackName'))
    const found = trees.find((x) => x.key === editing)
    return found
      ? clonePlain(found.doc as unknown as SkillTreeDoc)
      : emptyDoc(t('editor.untitled'), t('res.fallbackName'))
  }, [editing])

  const { draft, apply, silent, mark, undo, redo, reset, canUndo, canRedo } = useDraft(seed)
  const [mode, setMode] = useState<Mode>('pick')
  const [dock, setDock] = useState<Dock>()
  const selected = dock?.kind === 'node' ? dock.id : undefined
  const [linkFrom, setLinkFrom] = useState<string>()
  const [drop, setDrop] = useState(false)
  const canvas = useRef<CanvasHandle>(null)
  const [view, setView] = useState({ x: 0, y: 0, k: 1 })
  const [fitTick, setFitTick] = useState(0)
  const [autoTidy, setAutoTidy] = useState(false)

  const live = useRef(draft)
  live.current = draft

  const world = useMemo(() => boundsOf(draft), [draft])
  const node = draft.nodes.find((n) => n.id === selected)
  const accent = draft.meta.accent ?? 'var(--accent)'

  const fitSoon = () => setFitTick((n) => n + 1)
  useEffect(() => {
    if (fitTick) canvas.current?.fit()
  }, [fitTick])

  const reshape = (fn: (d: SkillTreeDoc) => SkillTreeDoc) =>
    apply((d) => {
      const next = fn(d)
      return autoTidy ? { ...next, nodes: layoutNodes(next.nodes, next.edges, next.layout) } : next
    })

  const addEdge = (a: string, b: string) =>
    reshape((d) =>
      a === b || d.edges.some(([x, y]) => x === a && y === b)
        ? d
        : { ...d, edges: [...d.edges, [a, b] as const] },
    )

  const pick = (id: string) => {
    if (mode === 'link') {
      if (!linkFrom) setLinkFrom(id)
      else {
        addEdge(linkFrom, id)
        setLinkFrom(undefined)
      }
      return
    }
    setDock({ kind: 'node', id })
  }

  const togglePanel = (kind: 'style' | 'rules') =>
    setDock((v) => (v?.kind === kind ? undefined : { kind }))

  const clearPick = () => setDock((v) => (v?.kind === 'node' ? undefined : v))

  const addNode = (x: number, y: number, link?: string) => {
    const n = newNode(t('editor.newNode'), x, y)
    reshape((d) => ({
      ...d,
      nodes: [...d.nodes, n],
      edges: link ? [...d.edges, [link, n.id] as const] : d.edges,
    }))
    setDock({ kind: 'node', id: n.id })
  }

  const patchNode = (p: Partial<SkillNode>) =>
    silent((d) => ({
      ...d,
      nodes: d.nodes.map((n) => (n.id === selected ? { ...n, ...p } : n)),
    }))

  const removeNode = (id: string) =>
    reshape((d) => ({
      ...d,
      nodes: d.nodes.filter((n) => n.id !== id),
      edges: d.edges.filter(([a, b]) => a !== id && b !== id),
    }))

  const relayout = (layout: Layout = draft.layout) => {
    apply((d) => ({ ...d, layout, nodes: layoutNodes(d.nodes, d.edges, layout) }))
    fitSoon()
  }

  const toggleTidy = (on: boolean) => {
    setAutoTidy(on)
    if (on) relayout()
  }

  function save() {
    const caps = requiredCapabilities(live.current)
    const doc: SkillTreeDoc = { ...live.current }
    if (caps.length > 0) doc.requires = caps
    else delete doc.requires

    const check = validate(doc)
    if (!check.ok) {
      const first = check.issues.find((i) => i.level === 'error')
      const code = first?.code ?? 'DOC_INVALID'
      const key = docIssueKey(code)
      toast.danger(key ? t(key, docIssueVars(first?.detail)) : t('editor.stillInvalid', { code }))
      return
    }

    const short = check.issues.find((i) => i.code === 'COST_EXCEEDS_SUPPLY')
    if (short) {
      toast.info(
        t('editor.costExceeds', {
          demand: Number(short.detail?.['demand'] ?? 0),
          supply: Number(short.detail?.['supply'] ?? 0),
        }),
      )
    }

    if (editing === '@new') createTree(doc)
    else saveTree(editing, doc)

    toast.success(t('local.saved'))
    reset(doc)
    close()
  }

  const panelUi =
    dock?.kind === 'style' ? (
      <StylePanel
        doc={draft}
        onChange={(p) => silent((d) => ({ ...d, ...p }))}
        onLayout={(l) => relayout(l)}
        onClose={() => setDock(undefined)}
      />
    ) : dock?.kind === 'rules' ? (
      <RulesPanel
        doc={draft}
        onChange={(p) => silent((d) => ({ ...d, ...p }))}
        onClose={() => setDock(undefined)}
      />
    ) : null

  const dockStrip = useRef<HTMLElement>(null)
  const dockCard = useRef<HTMLDivElement>(null)
  const zoomRow = useRef<HTMLDivElement>(null)

  const dockKind = dock?.kind

  const dockUi =
    panelUi ??
    (node ? (
      <Inspector
        doc={draft}
        node={node}
        onChange={patchNode}
        onUnlink={(p) =>
          reshape((d) => ({
            ...d,
            edges: d.edges.filter(([a, b]) => !(a === p && b === node.id)),
          }))
        }
        onLink={() => {
          setMode('link')
          setLinkFrom(node.id)
        }}
        onDelete={() => {
          removeNode(node.id)
          setDock(undefined)
        }}
        onClose={() => setDock(undefined)}
      />
    ) : null)

  const [dockOverZoom, setDockOverZoom] = useState(false)
  useEffect(() => {
    const card = dockCard.current
    const row = zoomRow.current
    const strip = dockStrip.current
    if (!card || !row || !strip) {
      setDockOverZoom(false)
      return
    }
    const check = () => {
      const c = card.getBoundingClientRect()
      setDockOverZoom(c.height > 0 && c.bottom + 12 > row.getBoundingClientRect().top)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(card)
    ro.observe(strip)
    return () => ro.disconnect()
  }, [dockKind])

  return (
    <div className="absolute inset-0 z-40 flex bg-background">
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-separator px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <Button variant="ghost" isIconOnly aria-label={t('editor.back')} onPress={close}>
            <Ico name="back" size={ICON.pill} />
          </Button>
          <IconPickerButton
            icon={draft.meta.icon ?? 'tree'}
            accent={accent}
            label={t('editor.treeIcon')}
            onPick={(icon) => silent((d) => ({ ...d, meta: { ...d.meta, icon } }))}
          />
          <input
            value={draft.meta.name}
            aria-label={t('editor.treeName')}
            onChange={(e) => silent((d) => ({ ...d, meta: { ...d.meta, name: e.target.value } }))}
            className="min-w-0 flex-1 rounded-xl bg-surface-secondary px-3 py-2 font-medium outline-none"
          />
          <Button
            variant={dock?.kind === 'style' ? 'secondary' : 'ghost'}
            isIconOnly
            aria-label={t('editor.style')}
            onPress={() => togglePanel('style')}
          >
            <Ico name="palette" size={ICON.pill} />
          </Button>
          <Button
            variant={dock?.kind === 'rules' ? 'secondary' : 'ghost'}
            isIconOnly
            aria-label={t('editor.rules')}
            onPress={() => togglePanel('rules')}
          >
            <Ico name="sliders" size={ICON.pill} />
          </Button>
          {editing !== '@new' && (
            <Button
              variant="danger-soft"
              isIconOnly
              aria-label={t('action.delete')}
              onPress={() => setDrop(true)}
            >
              <Ico name="trash" size={ICON.pill} />
            </Button>
          )}
          <Button size="sm" isPending={busy === 'save'} onPress={save}>
            {t('action.save')}
          </Button>
        </div>

        <div className="relative min-h-0 flex-1">
          <Canvas
            ref={canvas}
            world={world}
            bg={bgStyle(themeOf(draft).bg, accent, view)}
            onViewChange={setView}
            onTap={(p) => (mode === 'add' ? addNode(p.x, p.y) : clearPick())}
            onDoubleTap={(p) => addNode(p.x, p.y)}
          >
            <EditTreeView
              doc={draft}
              mode={mode}
              locked={autoTidy}
              selected={selected}
              linkFrom={linkFrom}
              getK={() => canvas.current?.view().k ?? 1}
              onPick={pick}
              onDragStart={mark}
              onDrag={(id, dx, dy) =>
                silent((d) => ({
                  ...d,
                  nodes: d.nodes.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)),
                }))
              }
              onCutEdge={(i) => reshape((d) => ({ ...d, edges: d.edges.filter((_, x) => x !== i) }))}
              onLinkTo={addEdge}
              onLinkToBlank={(from, x, y) => addNode(x, y, from)}
            />
          </Canvas>

          {!draft.nodes.length && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-muted">
              {t('editor.emptyHint')}
            </div>
          )}

          {mode === 'link' && (
            <div className="pointer-events-none absolute inset-x-0 top-2 text-center text-xs text-muted">
              {linkFrom ? t('editor.linkNext') : t('editor.linkStart')}
            </div>
          )}

          <div
            ref={zoomRow}
            className={`absolute bottom-3 flex items-center gap-3 transition-[right] duration-200 ${
              dockOverZoom ? 'right-[21.5rem]' : 'right-3'
            }`}
          >
            <ZoomSlider k={view.k} onZoom={(k) => canvas.current?.zoomTo(k)} />
          </div>

          {dockUi && (
            <aside
              ref={dockStrip}
              className="pointer-events-none absolute inset-y-3 right-3 z-30 hidden w-80 md:block"
            >
              <div
                ref={dockCard}
                className="pointer-events-auto max-h-full overflow-y-auto rounded-3xl bg-overlay shadow-overlay"
              >
                {dockUi}
              </div>
            </aside>
          )}

        </div>

        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-t border-separator p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="flex shrink-0 items-center gap-0.5 rounded-2xl bg-surface-secondary p-1">
            {MODES.map(({ mode: m, label, icon }) => {
              const on = mode === m
              return (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m)
                    if (m !== 'link') setLinkFrom(undefined)
                  }}
                  aria-pressed={on}
                  className="tap flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                  style={{
                    background: on ? accent : 'transparent',
                    color: on ? '#fff' : 'var(--muted)',
                    boxShadow: on ? `0 2px 8px color-mix(in oklab, ${accent} 45%, transparent)` : undefined,
                  }}
                >
                  <Ico name={icon} size={ICON.row} />
                  {t(label)}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 text-xs text-muted">
            {t('editor.autoTidy')}
            <Switch
              isSelected={autoTidy}
              onChange={toggleTidy}
              aria-label={t('editor.autoTidyHint')}
            >
              <Switch.Content>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Content>
            </Switch>
          </div>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label={t('action.undo')}
            isDisabled={!canUndo}
            onPress={undo}
          >
            <Ico name="undo" size={ICON.row} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            aria-label={t('editor.redo')}
            isDisabled={!canRedo}
            onPress={redo}
          >
            <Ico name="redo" size={ICON.row} />
          </Button>
        </div>
      </div>

      {panelUi && (
        <div className="absolute inset-x-0 bottom-0 z-50 max-h-[75%] overflow-y-auto rounded-t-3xl bg-overlay shadow-overlay md:hidden">
          {panelUi}
        </div>
      )}

      {node && (
        <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70%] overflow-y-auto rounded-t-3xl bg-overlay shadow-overlay md:hidden">
          <Inspector
            doc={draft}
            node={node}
            onChange={patchNode}
            onUnlink={(p) =>
              reshape((d) => ({
                ...d,
                edges: d.edges.filter(([a, b]) => !(a === p && b === node.id)),
              }))
            }
            onLink={() => {
              setMode('link')
              setLinkFrom(node.id)
              setDock(undefined)
            }}
            onDelete={() => {
              removeNode(node.id)
              setDock(undefined)
            }}
            onClose={() => setDock(undefined)}
          />
        </div>
      )}

      {drop && (
        <Confirm
          title={t('editor.deleteTitle', { name: draft.meta.name })}
          hint={t('editor.deleteHint')}
          ok={t('action.delete')}
          onOk={() => {
            deleteTree(editing)
            close()
          }}
          onClose={() => setDrop(false)}
        />
      )}

    </div>
  )
}
