#!/bin/bash

# Mobile Setup Script for Jam Shalat App (Capacitor)
# This script helps initialize mobile platforms and prepare for signing

echo "🚀 Setting up mobile platforms for Jam Shalat..."

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building web assets..."
npm run build

echo "🤖 Syncing Capacitor Android..."
npx cap sync android

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

echo "🎯 Mobile setup complete!"
echo ""
echo "Next steps:"
echo "1. The Android keystore is ready for local builds"
echo "2. GitHub Actions will handle the Android builds automatically"
echo "3. iOS builds require paid Apple Developer account (\$99/year) - skipped for now"
echo ""
echo "To build Android APK locally:"
echo "  cd android && ./gradlew assembleRelease"
echo ""
echo "To open in Android Studio:"
echo "  npm run android:open"
