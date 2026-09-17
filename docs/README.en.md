<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/logo-dark.png">
  <img src="images/logo-light.png" alt="SkillsQuest" width="88">
</picture>

# SkillsQuest

![Desktop](https://img.shields.io/badge/Desktop-Windows%20%7C%20macOS%20%7C%20Linux-purple?style=flat&logo=tauri&logoColor=white) ![Mobile](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS-00A98F?style=flat&logo=react&logoColor=white) [![Web](https://img.shields.io/badge/Web-Browser-4285F4?style=flat&logo=googlechrome&logoColor=white)](https://skillsquest.app)

Learn new skills by unlocking a skill tree. Master what stays human.

[🏠 Website](https://skillsquest.net) | [🌐 Web app](https://skillsquest.app) | [🇨🇳 中文](../README.md)

</div>

> This repository distributes builds, collects feedback, and publishes the source of the skill tree editor.

## ⬇️ Download

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SkillsQuest/SkillsQuest?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases/latest)

| Platform | x64 | ARM | Store | Notes |
| --- | --- | --- | --- | --- |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-x64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) (recommended) | [windows-arm64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | — | Most Windows devices are x64 |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-x64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | [macos-arm64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) (recommended) | — | Apple silicon (ARM) is more common |
| ![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=apple&logoColor=white) | — | — | App Store (in review) | — |
| ![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white) | [android-universal.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | [android-arm64.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) (recommended) | — | Use the universal build if arm64 won't install |
| ![Linux DEB](https://img.shields.io/badge/Linux%20DEB-FCC624?style=flat&logo=linux&logoColor=black) | [linux-x64.deb](https://github.com/SkillsQuest/SkillsQuest/releases/latest) (recommended) | [linux-arm64.deb](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | — | Debian / Ubuntu |
| ![Linux RPM](https://img.shields.io/badge/Linux%20RPM-FCC624?style=flat&logo=linux&logoColor=black) | [linux-x64.rpm](https://github.com/SkillsQuest/SkillsQuest/releases/latest) (recommended) | [linux-arm64.rpm](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | — | Fedora / RHEL |
| ![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=googlechrome&logoColor=white) | — | — | [skillsquest.app](https://skillsquest.app) | Open and use |

## 🚀 Installing

- **Windows**: unsigned — SmartScreen will warn, choose More info → Run anyway
- **macOS**: unsigned — right-click → Open the first time, or `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`
- **Linux**: `.deb` for Debian/Ubuntu, `.rpm` for Fedora/RHEL/openSUSE — install either with your package manager
- **Android**: allow installing from unknown sources
- **iOS**: the `.ipa` is an App Store submission build and cannot be installed on a device — open an issue for a TestFlight invite

Checksums: `shasum -a 256 -c SHA256SUMS --ignore-missing`

## 🧩 Source

This repository is also the source repository of the SkillsQuest Skill Tree
Editor. A standalone front-end project with no backend.

```bash
npm install
npm run dev
```

Node ≥ 22. [Skill Tree Editor](skilltree-editor.en.md) · [`skilltree/1` format](skilltree-spec.md)

---

Code licensed under [BSL 1.1](../LICENSE) · © 2026 SkillsQuest
