# Android Build Setup for Jam Shalat App

This document explains the Android APK build setup using **Capacitor** in GitHub Actions.

## Overview

The Android build uses **Capacitor** instead of Tauri Mobile for simpler and faster builds:
- ✅ **No Rust cross-compilation** - just JavaScript/TypeScript
- ✅ **Simpler CI/CD** - no NDK setup required
- ✅ **Faster builds** - no Rust compilation overhead
- ✅ **Automatic APK signing** with CI-provided keystore
- ✅ **Independent from desktop builds** - doesn't touch Tauri configs

## Architecture

```
jam-shalat-app/
├── src-tauri/          # Desktop builds (Tauri) - Windows, macOS, Linux
├── android/            # Mobile builds (Capacitor) - Android APK
└── dist/               # Shared web assets (built from src/)
```

### Build Flow
```
src/ → npm run build → dist/ → Capacitor sync → android/ → Gradle build → APK
```

## GitHub Actions Workflow

```yaml
jobs:
  build:           # Desktop builds (Tauri - Windows, macOS, Linux)
  android-build:   # Android APK build (Capacitor)
  release:         # Combines all artifacts
```

### Android Build Steps
1. **Setup**: Java 21, Android SDK, Node.js
2. **Build**: `npm run build` (creates dist/)
3. **Sync**: `npx cap sync android` (copies to android/)
4. **Sign**: Create keystore and configure Gradle
5. **Build APK**: `./gradlew assembleRelease`
6. **Upload**: APK artifact available for download

## Local Development

### Prerequisites
- Node.js 18+
- Java 21
- Android Studio (optional, for emulator)

### Build Commands
```bash
# Install dependencies
npm install

# Build web assets and sync to Android
npm run cap:build

# Build APK (command line)
cd android && ./gradlew assembleRelease

# Or open in Android Studio
npm run android:open
```

## Configuration

### Capacitor Config (`capacitor.config.ts`)
```typescript
{
  appId: 'com.jamshalat.mobile',
  appName: 'Jam Shalat',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: '../android-release-key.jks',
      keystoreAlias: 'jam-shalat-key'
    }
  }
}
```

### Android Signing
- **Keystore**: provided via GitHub Secrets in CI
- **Alias**: `jam-shalat-key` (set in secrets)

## Outputs

### GitHub Actions Artifacts
- **Name**: `jam-shalat-android-apk`
- **Location**: `android/app/build/outputs/apk/release/`

### Release Downloads
- **Desktop**: Windows `.msi`, macOS `.dmg`, Linux `.AppImage`/`.deb`
- **Android**: `.apk` for sideloading

## Installation on Android

1. Download the `.apk` file from GitHub releases
2. Enable "Unknown Sources" in Settings → Security
3. Install the APK file
4. Grant necessary permissions

## Advantages of Capacitor

| Aspect | Capacitor | Tauri Mobile |
|--------|-----------|--------------|
| **Build complexity** | Simple (JS only) | Complex (Rust + NDK) |
| **CI/CD setup** | Minimal | Extensive |
| **Build time** | ~2-3 minutes | ~10-15 minutes |
| **Plugin ecosystem** | 100+ plugins | Limited |
| **Desktop impact** | None | Required config changes |

## Security Notes

### Keystore Security
- **Current**: CI reads keystore from GitHub Secrets
- **Production**: Keep the keystore out of git and rotate if exposed

### Bundle Identifiers
- **Desktop (Tauri)**: `com.jamshalat.desktop`
- **Android (Capacitor)**: `com.jamshalat.mobile`

## Troubleshooting

### Build Fails
- Ensure Java 21 is installed
- Check Android SDK setup
- Run `npm run build` first

### APK Installation Issues
- Enable "Unknown Sources" in Android settings
- Check Android version (min SDK 24 / Android 7.0)
- Ensure sufficient storage space

### Sync Issues
```bash
npx cap sync android --force
```

## Future Enhancements

1. **Production Keystore**: Use GitHub Secrets
2. **Play Store**: Add Google Play Console upload
3. **iOS**: Add Capacitor iOS when Apple Developer account is available
4. **Optimization**: APK size optimization
