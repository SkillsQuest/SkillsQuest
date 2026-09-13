<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/logo-dark.png">
  <img src="docs/images/logo-light.png" alt="SkillsQuest" width="88">
</picture>

# SkillsQuest

![桌面端](https://img.shields.io/badge/桌面端-Windows%20%7C%20macOS%20%7C%20Linux-purple?style=flat&logo=tauri&logoColor=white) ![移动端](https://img.shields.io/badge/移动端-Android%20%7C%20iOS-00A98F?style=flat&logo=react&logoColor=white)

像点技能树一样学习新技能。掌握专属于人类的技能。

[🏠 官网](https://skillsquest.net) | [🌐 网页版](https://skillsquest.app) | [🇬🇧 English](docs/README.en.md)

</div>

> 本仓库用于发布安装包、接收反馈，并公开技能树编辑器的源码。

## ⬇️ 下载

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SkillsQuest/SkillsQuest?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases/latest)

| 平台 | 安装包 | 说明 |
| --- | --- | --- |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-x64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 安装程序（推荐） |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-arm64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM 设备 |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-arm64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Apple 芯片（推荐） |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-x64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Intel 芯片 |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-x64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 通用（推荐） |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-arm64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM 设备 |
| ![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat&logo=android&logoColor=white) | [android-arm64.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 新机型（推荐） |
| ![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat&logo=android&logoColor=white) | [android-universal.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | arm64 装不上时用 |
| ![iOS](https://img.shields.io/badge/iOS-TestFlight-000000?style=flat&logo=apple&logoColor=white) | — |  |
| ![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=googlechrome&logoColor=white) | [skillsquest.app](https://skillsquest.app) |  |

## 🚀 安装说明

- **Windows**：未签名，SmartScreen 会拦，点「更多信息」→「仍要运行」
- **macOS**：未签名，首次打开右键点图标选「打开」，或 `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`
- **Linux**：`chmod +x` 后运行
- **Android**：允许安装未知来源的应用
- **iOS**：Release 里的 `.ipa` 是 App Store 提交产物，装不进设备，开 issue 要 TestFlight 邀请

校验：`shasum -a 256 -c SHA256SUMS --ignore-missing`

## 🧩 源码

本仓库同时是 SkillsQuest 技能树编辑器的源码仓库。独立前端工程，不依赖服务端。

```bash
npm install
npm run dev
```

Node ≥ 22。[技能树编辑器](docs/skilltree-editor.md) · [`skilltree/1` 文档格式](docs/skilltree-spec.md)

---

代码按 [BSL 1.1](LICENSE) 授权 · © 2026 SkillsQuest
