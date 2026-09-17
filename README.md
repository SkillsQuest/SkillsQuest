<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/images/logo-dark.png">
  <img src="docs/images/logo-light.png" alt="SkillsQuest" width="88">
</picture>

# SkillsQuest

![桌面端](https://img.shields.io/badge/桌面端-Windows%20%7C%20macOS%20%7C%20Linux-purple?style=flat&logo=tauri&logoColor=white) ![移动端](https://img.shields.io/badge/移动端-Android%20%7C%20iOS-00A98F?style=flat&logo=react&logoColor=white) [![网页端](https://img.shields.io/badge/网页端-Web-4285F4?style=flat&logo=googlechrome&logoColor=white)](https://skillsquest.app)

像点技能树一样学习新技能。掌握专属于人类的技能。

[🏠 官网](https://skillsquest.net) | [🌐 网页版](https://skillsquest.app) | [🇬🇧 English](docs/README.en.md)

</div>

> 本仓库用于发布安装包、接收反馈，并公开技能树编辑器的源码。

## ⬇️ 下载

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SkillsQuest/SkillsQuest?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases/latest)

| 平台 | 下载 |
| --- | --- |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [下载](https://github.com/SkillsQuest/SkillsQuest/releases/latest) |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [下载](https://github.com/SkillsQuest/SkillsQuest/releases/latest) |
| ![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white) | [下载](https://github.com/SkillsQuest/SkillsQuest/releases/latest) |
| ![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white) | [下载](https://github.com/SkillsQuest/SkillsQuest/releases/latest) |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [下载](https://github.com/SkillsQuest/SkillsQuest/releases/latest) |
| ![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=googlechrome&logoColor=white) | [访问官网](https://skillsquest.net) |

## 🚀 安装说明

- **Windows**：未签名，SmartScreen 会拦，点「更多信息」→「仍要运行」
- **macOS**：未签名，首次打开右键点图标选「打开」，或 `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`
- **Linux**：`.deb` 给 Debian / Ubuntu 系，`.rpm` 给 Fedora / RHEL / openSUSE 系，都用包管理器装
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
