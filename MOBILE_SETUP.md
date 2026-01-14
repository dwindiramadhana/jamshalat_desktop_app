# Android Mobile Build Setup for Jam Shalat App

This document explains how to set up Android APK builds using **Capacitor** for the Jam Shalat prayer times app.

## Overview

The mobile setup uses a **hybrid approach**:
- **Capacitor** for Android APK builds (simpler, faster)
- **Tauri** for desktop builds (Windows, macOS, Linux)

**Note**: iOS builds are not included because they require a paid Apple Developer account ($99/year).

## Quick Setup

```bash
# Install dependencies
npm install

# Build web assets and sync to Android
npm run cap:build

# Open in Android Studio (optional)
npm run android:open
```

## Architecture

### Why Capacitor for Android?

| Aspect | Capacitor | Tauri Mobile |
|--------|-----------|--------------|
| Build simplicity | Pure JS/TS | Requires Rust + NDK |
| CI/CD complexity | Simple Node.js | Complex Rust cross-compilation |
| Build speed | Faster | Slower |
| Plugin ecosystem | Mature, 100+ plugins | Limited |

### Hybrid Setup

- **Desktop (Tauri)**: `src-tauri/` - Windows, macOS, Linux builds
- **Android (Capacitor)**: `android/` - APK builds

Both share the same frontend code from `dist/`.

## Local Development

### Build Android APK
```bash
# Build web assets and sync
npm run cap:build

# Build APK (requires Android Studio or command line)
cd android && ./gradlew assembleRelease
```

### Open in Android Studio
```bash
npm run android:open
```

## Configuration

### Capacitor Config (`capacitor.config.ts`)
```typescript
{
  appId: 'com.jamshalat.mobile',
  appName: 'Jam Shalat',
  webDir: 'dist'
}
```

### Android Signing
Keystore file: `android-release-key.jks`
- Alias: `jam-shalat-key`
- Password: `jamshalat2024`

## GitHub Actions Integration

The workflow includes:
- **Desktop builds**: Tauri (Windows, macOS, Linux)
- **Android builds**: Capacitor (APK)

### Android Build Steps
1. Setup Java 17 and Android SDK
2. Install dependencies
3. Build web assets (`npm run build`)
4. Sync Capacitor (`npx cap sync android`)
5. Build APK (`./gradlew assembleRelease`)

## Installation on Android

1. Download the `.apk` file from GitHub releases
2. Enable "Unknown Sources" in Settings → Security
3. Install the APK file
4. Grant necessary permissions

## File Structure

```
jam-shalat-app/
├── android/                         # Capacitor Android project
│   ├── app/
│   │   └── build.gradle            # Android build config
│   └── gradlew                     # Gradle wrapper
├── capacitor.config.ts             # Capacitor configuration
├── android-release-key.jks         # Android signing keystore
├── src-tauri/                      # Tauri desktop project (unchanged)
└── .github/workflows/build.yml     # CI/CD with Capacitor Android
```

## Troubleshooting

### Android Build Issues
- **Gradle error**: Ensure Java 17 is installed
- **Signing failed**: Check keystore path and credentials
- **Web assets not found**: Run `npm run build` first

### Sync Issues
```bash
# Force sync all assets
npx cap sync android --force
```

## Next Steps

1. **Android**: Ready to build via GitHub Actions
2. **iOS**: Would require paid Apple Developer account ($99/year)
3. **Production**: Use GitHub Secrets for keystore credentials
4. **Distribution**: Consider Google Play Store publishing
