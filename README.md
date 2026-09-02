# SkillsQuest

把想学的东西种成一棵树。

技能树式的学习与习惯追踪。一块可缩放的画布，上面长着各种形态的技能树 —— 完成一个节点，解锁下一个。

官网 [skillsquest.net](https://skillsquest.net) · 网页版 [skillsquest.app](https://skillsquest.app)

> **这个仓库不含源码。** SkillsQuest 是闭源软件，这里只用来发布安装包和接收问题反馈。
> 有问题或想要某个功能，开一个 [issue](../../issues/new/choose)。

[English](#skillsquest-english) ↓

## 下载

最新版本 **v0.5.0**。所有安装包都在 [Releases](../../releases) 页面。

| 平台 | 下载 |
| --- | --- |
| macOS（Apple 芯片） | [SkillsQuest-0.5.0-macos-arm64.dmg](../../releases/download/v0.5.0/SkillsQuest-0.5.0-macos-arm64.dmg) |
| macOS（Intel） | [SkillsQuest-0.5.0-macos-x64.dmg](../../releases/download/v0.5.0/SkillsQuest-0.5.0-macos-x64.dmg) |
| Windows（x64） | [SkillsQuest-0.5.0-windows-x64.exe](../../releases/download/v0.5.0/SkillsQuest-0.5.0-windows-x64.exe) |
| Windows（ARM64） | [SkillsQuest-0.5.0-windows-arm64.exe](../../releases/download/v0.5.0/SkillsQuest-0.5.0-windows-arm64.exe) |
| Linux（x64） | [SkillsQuest-0.5.0-linux-x64.AppImage](../../releases/download/v0.5.0/SkillsQuest-0.5.0-linux-x64.AppImage) |
| Linux（ARM64） | [SkillsQuest-0.5.0-linux-arm64.AppImage](../../releases/download/v0.5.0/SkillsQuest-0.5.0-linux-arm64.AppImage) |
| Android | [SkillsQuest-0.5.0-android-arm64.apk](../../releases/download/v0.5.0/SkillsQuest-0.5.0-android-arm64.apk)（新机型选这个）<br>[SkillsQuest-0.5.0-android-universal.apk](../../releases/download/v0.5.0/SkillsQuest-0.5.0-android-universal.apk)（装不上时用这个） |
| iOS | 走 TestFlight，见下 |
| 浏览器 | [skillsquest.app](https://skillsquest.app)，不用装 |

校验文件完整性：[SHA256SUMS](../../releases/download/v0.5.0/SHA256SUMS)

```bash
shasum -a 256 -c SHA256SUMS --ignore-missing
```

## 安装说明

**macOS** —— 安装包目前没有 Apple 签名，直接双击会被拦。装好后第一次打开时右键点图标选「打开」，或者：

```bash
xattr -dr com.apple.quarantine /Applications/SkillsQuest.app
```

**Windows** —— 安装包目前没有代码签名，SmartScreen 会提示「已阻止不受信任的应用」。点「更多信息」→「仍要运行」。

**Linux** —— AppImage 下载后要自己加执行权限：

```bash
chmod +x SkillsQuest-0.5.0-linux-x64.AppImage && ./SkillsQuest-0.5.0-linux-x64.AppImage
```

**Android** —— 需要在系统里允许「安装未知来源的应用」。先试 `arm64`，提示「应用未安装」时换 `universal`。

**iOS** —— Release 里那个 `.ipa` 是提交 App Store 用的构建产物，**下载了装不进设备**。iOS 想提前用请走 TestFlight，[开 issue](../../issues/new/choose) 说一声。

## 反馈

- 用着有问题 → [报告缺陷](../../issues/new/choose)
- 想要某个功能 → [提功能建议](../../issues/new/choose)

帐号、付费、数据相关的私事请不要开公开 issue。

[更新记录](CHANGELOG.md)

---

<a name="skillsquest-english"></a>

# SkillsQuest (English)

Grow what you want to learn into a tree.

Skill-tree learning and habit tracking. One zoomable canvas with trees of every shape growing on it — finish a node, unlock the next.

Website [skillsquest.net](https://skillsquest.net) · Web app [skillsquest.app](https://skillsquest.app)

> **No source code here.** SkillsQuest is closed-source software. This repository exists only to
> distribute builds and collect feedback. Found a bug or want a feature?
> [Open an issue](../../issues/new/choose).

## Download

Latest release **v0.5.0**. Every build lives on the [Releases](../../releases) page.

| Platform | Download |
| --- | --- |
| macOS (Apple silicon) | [SkillsQuest-0.5.0-macos-arm64.dmg](../../releases/download/v0.5.0/SkillsQuest-0.5.0-macos-arm64.dmg) |
| macOS (Intel) | [SkillsQuest-0.5.0-macos-x64.dmg](../../releases/download/v0.5.0/SkillsQuest-0.5.0-macos-x64.dmg) |
| Windows (x64) | [SkillsQuest-0.5.0-windows-x64.exe](../../releases/download/v0.5.0/SkillsQuest-0.5.0-windows-x64.exe) |
| Windows (ARM64) | [SkillsQuest-0.5.0-windows-arm64.exe](../../releases/download/v0.5.0/SkillsQuest-0.5.0-windows-arm64.exe) |
| Linux (x64) | [SkillsQuest-0.5.0-linux-x64.AppImage](../../releases/download/v0.5.0/SkillsQuest-0.5.0-linux-x64.AppImage) |
| Linux (ARM64) | [SkillsQuest-0.5.0-linux-arm64.AppImage](../../releases/download/v0.5.0/SkillsQuest-0.5.0-linux-arm64.AppImage) |
| Android | [SkillsQuest-0.5.0-android-arm64.apk](../../releases/download/v0.5.0/SkillsQuest-0.5.0-android-arm64.apk) (try this first)<br>[SkillsQuest-0.5.0-android-universal.apk](../../releases/download/v0.5.0/SkillsQuest-0.5.0-android-universal.apk) (fallback) |
| iOS | TestFlight — see below |
| Browser | [skillsquest.app](https://skillsquest.app), nothing to install |

Verify your download against [SHA256SUMS](../../releases/download/v0.5.0/SHA256SUMS).

## Installing

**macOS** — builds are not Apple-signed yet, so Gatekeeper blocks a plain double-click. Right-click
the app and choose Open the first time, or run `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`.

**Windows** — builds are not code-signed yet. SmartScreen will warn you; choose More info → Run anyway.

**Linux** — `chmod +x` the AppImage before running it.

**Android** — allow installing from unknown sources. Try the `arm64` APK first; use `universal` if
Android refuses to install it.

**iOS** — the `.ipa` on the Releases page is an App Store submission build and **cannot be installed
on a device**. Ask for TestFlight access in an [issue](../../issues/new/choose).

## Feedback

Bugs and feature requests go to [issues](../../issues/new/choose). Please don't file public issues
about your account, payments or data.

[Changelog](CHANGELOG.md)

---

© 2026 SkillsQuest. 保留所有权利 / All rights reserved. 本仓库不授予任何软件许可。
No software license is granted by this repository.
