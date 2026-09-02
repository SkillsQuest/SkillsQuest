# 更新记录 / Changelog

## v0.5.0 — 2026-09-02

首个公开发布。之前的版本只在内部分发。

- **技能树编辑器**：拖节点、连线、加点、撤销重做、一键整理，三种树形态各有一套摆法
- **AI 生成**：用一句话生成整棵树，也能对着已有的树下增量指令（细化某个节点、精简、加难度）。AI 改动先标成待采纳，可以整批撤销
- **本地模式**：不登录也能建树、打卡。数据存在这台设备上，登录时搬到帐号里
- **内置三棵树**：日语、全栈、健身，开箱就有
- 能量、宝石、连胜、徽章
- 技能树市场：浏览、获取别人做的树
- 界面支持中文与英文
- 九个平台的安装包：macOS（Apple 芯片 / Intel）、Windows（x64 / ARM64）、Linux（x64 / ARM64）、Android、iOS，以及浏览器直接用

已知问题：

- macOS 与 Windows 的安装包还没有签名，首次打开要手动放行（见 [README](README.md#安装说明)）
- iOS 暂时只能走 TestFlight

---

## v0.5.0 (English)

First public release. Earlier versions were distributed internally only.

- **Skill tree editor** — drag nodes, draw edges, add nodes, undo/redo, auto-tidy, three tree shapes
- **AI generation** — describe a tree in one sentence, or give incremental instructions on an existing
  one. AI edits land as a pending draft you can accept or discard as a batch
- **Local mode** — build trees and check off nodes without an account. Data stays on the device and
  moves to your account when you sign in
- **Three built-in trees** — Japanese, full-stack, fitness
- Energy, gems, streaks and badges
- Skill tree market — browse and pick up trees other people made
- Chinese and English UI
- Builds for macOS (Apple silicon / Intel), Windows (x64 / ARM64), Linux (x64 / ARM64), Android, iOS,
  plus the browser

Known issues:

- macOS and Windows builds are unsigned; you have to allow them manually on first launch
- iOS is TestFlight-only for now
