<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="images/logo-dark.png">
  <img src="images/logo-light.png" alt="SkillsQuest" width="88">
</picture>

# SkillsQuest

![Desktop](https://img.shields.io/badge/Desktop-Windows%20%7C%20macOS%20%7C%20Linux-purple?style=flat&logo=tauri&logoColor=white) ![Mobile](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS-00A98F?style=flat&logo=react&logoColor=white)

Learn new skills by unlocking a skill tree. Master what stays human.

[🏠 Website](https://skillsquest.net) | [🌐 Web app](https://skillsquest.app) | [🇨🇳 中文](../README.md)

</div>

> This repository distributes builds, collects feedback, and publishes the source of the skill tree editor and the `skilltree/1` document format.

## ⬇️ Download

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/SkillsQuest/SkillsQuest?style=flat)](https://github.com/SkillsQuest/SkillsQuest/releases/latest)

| Platform | Build | Notes |
| --- | --- | --- |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-x64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Installer (recommended) |
| ![Windows](https://custom-icon-badges.demolab.com/badge/Windows-0078D6?logo=windows11&logoColor=white) | [windows-arm64.exe](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM devices |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-arm64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Apple silicon (recommended) |
| ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) | [macos-x64.dmg](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Intel |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-x64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Generic (recommended) |
| ![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black) | [linux-arm64.AppImage](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | ARM devices |
| ![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat&logo=android&logoColor=white) | [android-arm64.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | Recent devices (recommended) |
| ![Android](https://img.shields.io/badge/Android-APK-3DDC84?style=flat&logo=android&logoColor=white) | [android-universal.apk](https://github.com/SkillsQuest/SkillsQuest/releases/latest) | If arm64 won't install |
| ![iOS](https://img.shields.io/badge/iOS-TestFlight-000000?style=flat&logo=apple&logoColor=white) | — |  |
| ![Web](https://img.shields.io/badge/Web-4285F4?style=flat&logo=googlechrome&logoColor=white) | [skillsquest.app](https://skillsquest.app) |  |

## 🚀 Installing

- **Windows**: unsigned — SmartScreen will warn, choose More info → Run anyway
- **macOS**: unsigned — right-click → Open the first time, or `xattr -dr com.apple.quarantine /Applications/SkillsQuest.app`
- **Linux**: `chmod +x` the AppImage
- **Android**: allow installing from unknown sources
- **iOS**: the `.ipa` is an App Store submission build and cannot be installed on a device — open an issue for a TestFlight invite

Checksums: `shasum -a 256 -c SHA256SUMS --ignore-missing`

## 🧩 Source

This repository is also the source repository of the **SkillsQuest Skill Tree
Editor**: the `skilltree/1` document format, its engine, and the canvas that
edits it. A standalone front-end project with no dependency on the SkillsQuest
backend — the editor reads and writes one JSON document, and trees are kept in
the browser.

```bash
npm install
npm run dev
```

Node ≥ 22. See [Skill Tree Editor](skilltree-editor.en.md) for details and
[`skilltree/1`](skilltree-spec.md) for the format.

Licensed under [BSL 1.1](../LICENSE): free to read, modify and redistribute, and
free to use for personal, educational, research and internal evaluation
purposes. **Offering it to third parties as part of a commercial product or
service requires a separate commercial license.** On 2030-09-13 it converts to
Apache-2.0. For commercial licensing, open an
[issue](https://github.com/SkillsQuest/SkillsQuest/issues) or reach us via
[skillsquest.net](https://skillsquest.net).

---

© 2026 SkillsQuest. All rights reserved. The code in this repository is licensed
under [BSL 1.1](../LICENSE).
