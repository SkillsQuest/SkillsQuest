# SkillsQuest Skill Tree Editor

The SkillsQuest skill tree editor and its document format `skilltree/1`. The code
is this repository ([`src/`](../src)), which also serves as the download page.

It is a standalone front-end project. It does not depend on the SkillsQuest
backend and needs no account: the editor reads and writes one JSON document, and
trees are kept in the browser's `localStorage`.

[中文](skilltree-editor.md)

## Contents

| Directory | Contents |
| --- | --- |
| `src/skilltree` | Format and engine. Type definitions, semantic validation, four-state node evaluation, in-tree resource and level accounting, awards, cascading undo, `skilltree-patch/1` application, three layout algorithms, render geometry. Pure functions, zero dependencies, 205 unit tests and a golden fixture set |
| `src/tree-view` | Canvas and read-only view. Pan and zoom, node popover with a blocked-reason checklist, whole-tree export to SVG or PNG, a catalog of 2352 node icons |
| `src/editor` | The editor. Add nodes, link, cut edges, drag to place, auto-tidy; inspector (kind, icon, prerequisite gate, unlock conditions); style panel (color, shape, edges, background, arrangement); rules panel (in-tree resource, daily cap, check-in trees, awards, attribute table); undo and redo |
| `src/host` | The host. Where trees live, UI language, light or dark. This one uses `localStorage`; three functions — `createTree` / `saveTree` / `deleteTree` — are its entire interface to the outside |
| `src/i18n` | Chinese and English dictionaries with a lookup core |

## Build and run

Node ≥ 22 required. Front-end only: no backend, no external services at build
time.

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Development server |
| `npm run build` | Build the static site into `dist/` |
| `npm run test` | Engine unit tests and golden fixtures |
| `npm run typecheck` | Type check |

## Document format

A tree is one self-contained JSON document:

```jsonc
{
  "spec": "skilltree/1",
  "meta": { "name": "Japanese", "icon": "book", "accent": "#f0663f" },
  "layout": "flow",
  "nodes": [
    { "id": "a1", "title": "Kana", "icon": "abc", "x": 0, "y": 0, "kind": "boss" },
    { "id": "a2", "title": "Greetings", "icon": "talk", "x": 0, "y": 140,
      "gate": { "need": 1, "cost": 2 } }
  ],
  "edges": [["a1", "a2"]],
  "theme": { "shape": "circle", "edge": "solid", "bg": "dots" },
  "res": { "name": "Kana", "icon": "star" },
  "rules": { "daily": 6 },
  "awards": [{ "id": "aw1", "name": "First words", "icon": "medal", "need": 4 }]
}
```

The document carries no tree id and no progress, so it is portable between
implementations. This is exactly what the editor imports and exports.

The layer model, field semantics, condition expressions, validation rules, the
patch protocol and the capability-declaration mechanism are specified in
[`skilltree/1` 文档格式](skilltree-spec.md) (Chinese).

## License

[BSL 1.1](../LICENSE) (Business Source License 1.1).

| | |
| --- | --- |
| Permitted | Reading, modifying and redistributing the source; production use for personal, educational, research and internal evaluation purposes |
| Requires a commercial license | Offering the work, or a derivative of it, to third parties as part of a commercial product or service — hosted, embedded or distributed |
| Change Date | On 2030-09-13 it converts to the Apache License 2.0 |
| Commercial licensing | Open an [issue](https://github.com/SkillsQuest/SkillsQuest/issues), or reach us via [skillsquest.net](https://skillsquest.net) |

The SkillsQuest builds published under Releases are the product itself and are
not covered by it.
