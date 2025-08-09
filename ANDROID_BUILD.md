# Android Build Setup for Jam Shalat App

This document explains the Android APK build setup that runs as a separate job in GitHub Actions.

## Overview

The Android build is implemented as a **completely separate job** in GitHub Actions to ensure it doesn't interfere with the stable desktop builds (Windows, macOS, Linux).

### Key Features
- ✅ **Independent Android job** - doesn't touch desktop build configurations
- ✅ **Automatic APK signing** with demo keystore
- ✅ **Separate bundle identifier** (`com.jamshalat.mobile` vs `com.jamshalat.desktop`)
- ✅ **Dynamic configuration** - creates Android-specific configs at build time
- ✅ **Automatic restoration** - restores original configs after build

## How It Works

### 1. Separate Job Architecture
```yaml
jobs:
  build:           # Desktop builds (Windows, macOS, Linux)
  android-build:   # Android APK build (completely separate)
  release:         # Combines all artifacts
```

### 2. Dynamic Configuration
The Android job:
1. **Copies** original `tauri.conf.json` and `Cargo.toml`
2. **Modifies** copies with Android-specific settings
3. **Temporarily replaces** originals during build
4. **Restores** originals after build completion

### 3. Android-Specific Settings
- **Bundle ID**: `com.jamshalat.mobile` (different from desktop)
- **Mobile features**: Adds `["mobile"]` feature to Tauri
- **Mobile plugins**: `tauri-plugin-shell`, `tauri-plugin-fs`, `tauri-plugin-dialog`
- **Android config**: `minSdkVersion: 24`

### 4. Automatic Signing
- Creates demo keystore during build
- Configures Gradle signing automatically
- Generates signed APK ready for installation

## Build Process

### GitHub Actions Workflow
1. **Setup**: Java 17, Android SDK, Node.js, Rust with Android target
2. **Config Creation**: Dynamic Android-specific configurations
3. **Platform Init**: `tauri android init`
4. **Signing Setup**: Keystore creation and Gradle configuration
5. **Build**: `tauri android build` - generates signed APK
6. **Artifact Upload**: APK available as GitHub Actions artifact
7. **Cleanup**: Restore original configurations

### Local Development
For local Android development:
```bash
# Install Android target
rustup target add aarch64-linux-android

# You would need to manually create Android configs
# (The CI does this automatically)
```

## Outputs

### GitHub Actions Artifacts
- **Name**: `jam-shalat-android-apk`
- **Contains**: 
  - Universal APK (works on all Android devices)
  - Android App Bundle (AAB) for Play Store

### Release Downloads
When creating a GitHub release, users get:
- **Desktop**: Windows `.msi`, macOS `.dmg`, Linux `.AppImage`/`.deb`
- **Mobile**: Android `.apk` for sideloading

## Installation on Android

1. **Download** the `.apk` file from GitHub releases
2. **Enable** "Unknown Sources" in Android Settings → Security
3. **Install** the APK file
4. **Grant** necessary permissions when prompted

## Security Notes

### Demo Keystore
- **Current**: Uses demo keystore with hardcoded password
- **Production**: Should use GitHub Secrets for real keystore
- **Keystore Details**:
  - Alias: `jam-shalat-key`
  - Password: `jamshalat2024`
  - Validity: 10,000 days

### Bundle Identifier
- **Desktop**: `com.jamshalat.desktop`
- **Android**: `com.jamshalat.mobile`
- **Reason**: Allows separate app installations and configurations

## Advantages of This Approach

### ✅ **Safe Implementation**
- Desktop builds remain completely untouched
- No risk of breaking existing stable builds
- Independent job can fail without affecting desktop

### ✅ **Clean Separation**
- Different bundle identifiers for desktop vs mobile
- Separate configurations and dependencies
- No cross-contamination between platforms

### ✅ **Maintainable**
- Easy to modify Android settings without affecting desktop
- Can be disabled/enabled independently
- Clear separation of concerns

### ✅ **Scalable**
- Can add iOS the same way in the future
- Easy to add more mobile-specific features
- Doesn't complicate the main build matrix

## Troubleshooting

### Android Build Fails
- Check Java 17 installation
- Verify Android SDK setup
- Ensure Rust Android target is installed
- Check keystore creation logs

### APK Installation Issues
- Verify "Unknown Sources" is enabled
- Check Android version compatibility (min SDK 24)
- Ensure sufficient storage space
- Try clearing app data if updating

## Future Enhancements

### Production Ready
1. **Real Keystore**: Use GitHub Secrets for production keystore
2. **Play Store**: Add Google Play Console upload
3. **Fastlane**: Integrate Fastlane for advanced automation
4. **Testing**: Add Android-specific testing

### Additional Features
1. **iOS Support**: Add similar separate job for iOS
2. **Multiple Architectures**: Support more Android architectures
3. **Optimization**: APK size optimization and obfuscation

## Technical Details

### File Changes During Build
```
Original State:
├── src-tauri/tauri.conf.json (desktop config)
└── src-tauri/Cargo.toml (desktop features)

During Android Build:
├── src-tauri/tauri.conf.json (Android config)
├── src-tauri/Cargo.toml (mobile features)
├── src-tauri/tauri.conf.json.original (backup)
└── src-tauri/Cargo.toml.original (backup)

After Build:
├── src-tauri/tauri.conf.json (restored desktop config)
└── src-tauri/Cargo.toml (restored desktop features)
```

This ensures the repository always maintains the original desktop configuration while allowing Android builds to use mobile-specific settings.
