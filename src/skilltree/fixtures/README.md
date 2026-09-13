# 黄金测试集

`skilltree/1` 的双端一致性锚点（docs/architecture/backend.md §3.5）。
TypeScript 引擎（本包）与 Python 引擎（`server/packages/skilltree`）**读同一批 JSON**，
任何一端改引擎都必须先过这里。

规范开源后，第三方实现引擎也靠这批 fixtures 自证兼容。

```
eval/      求值：文档 + 完成集 → 期望四态 / 树内派生量 / 连带集合 / 结算事件
validate/  校验器：文档 → 期望 error / warning 列表
patch/     Patch 应用：文档 + Patch → 期望文档，含拒绝用例
```

## 一个 case 长什么样

```jsonc
{
  "name": "人能看懂的一句话",
  "why": "这个 case 在守什么，为什么不能删",
  "doc": { /* 一份完整的 skilltree/1 文档 */ },
  "cases": [
    {
      "done": ["a"],
      "states": { "a": "done", "b": "open" },   // 必须列全所有节点
      "progress": { "count": 1, "earned": 1, "spent": 0, "stars": 1, "level": 1 },
      "cascade": { "node": "a", "expect": ["b"] },        // 可选
      "settleUndo": { "node": "a", "energy": 2, "events": [] }  // 可选
    }
  ]
}
```

`states` 必须列全每个节点 —— 漏写等于没测那个节点，而遗漏是最容易漂移的地方。

## validate/ 的 case 长什么样

```jsonc
{
  "name": "...",
  "why": "...",
  "doc": { /* 一份完整的 skilltree/1 文档 */ },
  "expect": {
    "ok": false,                         // 有 error 就是 false，warning 不影响
    "issues": [
      { "level": "error", "code": "GRAPH_HAS_CYCLE", "path": "/edges" }
      // 想连 detail 一起钉住就加 "detail": {...}；不写则不比对
    ]
  }
}
```

`issues` 的**顺序也在断言范围内** —— 校验器的报告顺序稳定，UI 才能稳定展示。
