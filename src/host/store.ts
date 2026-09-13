import { create } from 'zustand'
import type { SkillTreeDoc } from '../skilltree/index.ts'
import { appT, isLang, type AppT, type Lang } from '../i18n/index.ts'

export interface StoredTree {
  key: string
  doc: SkillTreeDoc
  saved: number
}

const TREES_KEY = 'skilltree-editor/trees'
const LANG_KEY = 'skilltree-editor/lang'

function readTrees(): StoredTree[] {
  try {
    const raw = localStorage.getItem(TREES_KEY)
    const list: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? (list as StoredTree[]) : []
  } catch {
    return []
  }
}

function writeTrees(trees: StoredTree[]) {
  try {
    localStorage.setItem(TREES_KEY, JSON.stringify(trees))
  } catch {
  }
}

function readLang(): Lang {
  const saved = (() => {
    try {
      return localStorage.getItem(LANG_KEY)
    } catch {
      return null
    }
  })()
  if (isLang(saved)) return saved
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const newTreeKey = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

export interface HostState {
  trees: StoredTree[]
  editing?: string
  busy?: string
  settings: { lang: Lang }

  set: (key: 'lang', value: Lang) => void
  openEditor: (key: string) => void
  closeEditor: () => void
  createTree: (doc: SkillTreeDoc) => StoredTree
  saveTree: (key: string, doc: SkillTreeDoc) => void
  deleteTree: (key: string) => void
  importTree: (doc: SkillTreeDoc) => StoredTree
}

export const useApp = create<HostState>()((set, get) => ({
  trees: readTrees(),
  settings: { lang: readLang() },

  set: (key, value) => {
    if (key === 'lang') {
      try {
        localStorage.setItem(LANG_KEY, value)
      } catch {
      }
      set({ settings: { lang: value } })
    }
  },

  openEditor: (key) => set({ editing: key }),
  closeEditor: () => set({ editing: undefined }),

  createTree: (doc) => {
    const tree: StoredTree = { key: newTreeKey(), doc, saved: Date.now() }
    const trees = [tree, ...get().trees]
    writeTrees(trees)
    set({ trees })
    return tree
  },

  saveTree: (key, doc) => {
    const trees = get().trees.map((t) => (t.key === key ? { ...t, doc, saved: Date.now() } : t))
    writeTrees(trees)
    set({ trees })
  },

  deleteTree: (key) => {
    const trees = get().trees.filter((t) => t.key !== key)
    writeTrees(trees)
    set({ trees })
  },

  importTree: (doc) => get().createTree(doc),
}))

export const useT = (): AppT => useApp((s) => appT[s.settings.lang])

export type { AppT }
