#!/bin/bash

# Mobile Setup Script for Jam Shalat App
# This script helps initialize mobile platforms and prepare for signing

echo "🚀 Setting up mobile platforms for Jam Shalat..."

# Check if we're in the right directory
if [ ! -f "src-tauri/tauri.conf.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📱 Installing mobile Rust targets..."
rustup target add aarch64-linux-android aarch64-apple-ios

echo "🤖 Initializing Android platform..."
npm run tauri android init

echo "🍎 Initializing iOS platform..."
echo "Note: iOS initialization requires Apple Developer Team ID"
echo "You can set it in tauri.conf.json under bundle.iOS.developmentTeam"
echo "For now, skipping iOS init until you have Apple Developer account"
# npm run tauri ios init

echo "🔑 Creating Android keystore for signing..."
if [ ! -f "android-release-key.jks" ]; then
    keytool -genkey -v -keystore ./android-release-key.jks \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -alias jam-shalat-key \
        -dname "CN=Jam Shalat, OU=Development, O=Jam Shalat App, L=Jakarta, ST=Jakarta, C=ID" \
        -storepass jamshalat2024 -keypass jamshalat2024
    echo "✅ Android keystore created: android-release-key.jks"
else
    echo "✅ Android keystore already exists"
fi

echo "📝 Setting up Android signing configuration..."
mkdir -p src-tauri/gen/android
cd src-tauri/gen/android
cat > keystore.properties << EOF
keyAlias=jam-shalat-key
password=jamshalat2024
storeFile=../../../android-release-key.jks
EOF
cd ../../..

echo "🎯 Mobile setup complete!"
echo ""
echo "Next steps:"
echo "1. For iOS: Get Apple Developer account and set developmentTeam in tauri.conf.json"
echo "2. For Android: The keystore is ready for local builds"
echo "3. GitHub Actions will handle the mobile builds automatically"
echo ""
echo "To test mobile builds locally:"
echo "- Android: npm run tauri android build"
echo "- iOS: npm run tauri ios build (requires Apple Developer setup)"
