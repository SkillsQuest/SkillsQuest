# SkillsQuest 技能树编辑器

SkillsQuest 的技能树编辑器与它的文档格式 `skilltree/1`。代码就是这个仓库
（[`src/`](../src)），与安装包发布共用一处。

这是一个独立的前端工程。它不依赖 SkillsQuest 的服务端，也不需要账号：编辑器
读写一份 JSON 文档，树存在浏览器的 `localStorage` 里。

[English](skilltree-editor.en.md)

## 内容

| 目录 | 内容 |
| --- | --- |
| `src/skilltree` | 文档格式与引擎。类型定义、语义校验、节点四态求值、树内资源与等级、成就判定、连带取消、`skilltree-patch/1` 应用、三种布局算法、渲染几何。纯函数、零依赖，205 条单测与一套黄金测试集 |
| `src/tree-view` | 画布与只读视图。缩放与平移、节点气泡与卡点清单、整棵树导出为 SVG 或 PNG、2352 个节点图标的目录 |
| `src/editor` | 编辑器。加点、连线、剪边、拖拽摆位、自动整理；检查器（类型、图标、前置门控、解锁条件）；样式面板（配色、形状、连线、背景、排布）；资源与规则面板（树内资源、每日上限、打卡树、成就、属性表）；撤销重做 |
| `src/host` | 宿主。树存在哪儿、界面语言、深浅跟随。这一份存 `localStorage`，三个函数 `createTree` / `saveTree` / `deleteTree` 就是它与外界的全部接口 |
| `src/i18n` | 中英两份词表与取词内核 |

## 构建与运行

需要 Node ≥ 22。纯前端，没有后端，也没有构建期的外部服务。

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 开发服务器 |
| `npm run build` | 构建静态站点，产物在 `dist/` |
| `npm run test` | 引擎单测与黄金测试集 |
| `npm run typecheck` | 类型检查 |

## 文档格式

一棵树是一份自足的 JSON 文档：

```jsonc
{
  "spec": "skilltree/1",
  "meta": { "name": "日语", "icon": "book", "accent": "#f0663f" },
  "layout": "flow",
  "nodes": [
    { "id": "a1", "title": "五十音", "icon": "abc", "x": 0, "y": 0, "kind": "boss" },
    { "id": "a2", "title": "问候语", "icon": "talk", "x": 0, "y": 140,
      "gate": { "need": 1, "cost": 2 } }
  ],
  "edges": [["a1", "a2"]],
  "theme": { "shape": "circle", "edge": "solid", "bg": "dots" },
  "res": { "name": "假名", "icon": "star" },
  "rules": { "daily": 6 },
  "awards": [{ "id": "aw1", "name": "开口", "icon": "medal", "need": 4 }]
}
```

文档不含树的 id，也不含任何人的进度，因此可以在不同实现之间移植。界面上导入导出
的就是这份东西。

分层模型、字段语义、条件表达式、校验规则、Patch 协议与能力声明机制，见
[`skilltree/1` 文档格式](skilltree-spec.md)。

## 授权

[BSL 1.1](../LICENSE)（Business Source License 1.1）。

| | |
| --- | --- |
| 可以做的 | 查看、修改、再分发源码；个人、教学、研究与内部评估用途的生产使用 |
| 需要商业授权的 | 把它或它的衍生作品作为商业产品或服务的一部分提供给第三方 —— 托管、嵌入、分发都算 |
| 转换日期 | 2030-09-13 起自动转为 Apache License 2.0 |
| 商业授权 | 开 [issue](https://github.com/SkillsQuest/SkillsQuest/issues)，或经 [skillsquest.net](https://skillsquest.net) 联系 |

Releases 里发布的 SkillsQuest 安装包是产品本体，不在此授权范围内。
