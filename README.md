<div align="center">

# SkillsQuest

![桌面端](https://img.shields.io/badge/桌面端-Windows%20%7C%20macOS%20%7C%20Linux-purple?style=flat&logo=tauri&logoColor=white) ![移动端](https://img.shields.io/badge/移动端-Android%20%7C%20iOS-00A98F?style=flat&logo=android&logoColor=white) [![GitHub all releases](https://img.shields.io/github/downloads/SkillsQuest/SkillsQuest/total?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases)

把想学的东西种成一棵树。技能树式的学习与习惯追踪。

[🏠 官网](https://skillsquest.net) | [🌐 网页版](https://skillsquest.app) | [🇬🇧 English](docs/README.en.md)

</div>

> SkillsQuest 是闭源软件，本仓库只用于发布安装包与接收反馈。

## ⬇️ 下载

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SkillsQuest/SkillsQuest?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases/latest)

| 平台 | 安装包 | 说明 |
| --- | --- | --- |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-x64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 安装程序 |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-arm64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM 设备 |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-arm64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Apple 芯片 |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-x64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Intel 芯片 |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-x64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 通用 |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-arm64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM 设备 |
| ![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat&logo=android&logoColor=white) | [android-arm64.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | 装不上换 universal |
| ![iOS](https://img.shields.io/badge/iOS-TestFlight-000000?style=flat&logo=apple&logoColor=white) | — | 开 issue 要邀请 |
| ![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=googlechrome&logoColor=white) | [skillsquest.app](https://skillsquest.app) | 不用装 |

## 🚀 安装说明

- **Windows**：未签名，SmartScreen 会拦，点「更多信息」→「仍要运行」
- **macOS**：未签名，首次打开右键点图标选「打开」，或 `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`
- **Linux**：`chmod +x` 后运行
- **Android**：允许安装未知来源的应用
- **iOS**：Release 里的 `.ipa` 是 App Store 提交产物，装不进设备

校验：`shasum -a 256 -c SHA256SUMS --ignore-missing`

---

© 2026 SkillsQuest. 保留所有权利，本仓库不授予任何软件许可。
