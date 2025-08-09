#!/bin/bash

# Generate Android icons from Icon.png
# This script generates all required Android icon sizes from the source Icon.png

SOURCE_ICON="public/Icon.png"
ANDROID_ICONS_DIR="src-tauri/gen/android/app/src/main/res"

echo "🎨 Generating Android icons from $SOURCE_ICON..."

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Source icon not found: $SOURCE_ICON"
    exit 1
fi

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Please install it:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create Android icon directories
mkdir -p "$ANDROID_ICONS_DIR/mipmap-mdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-hdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xhdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xxhdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xxxhdpi"

# Generate different density icons
echo "📱 Generating mipmap-mdpi (48x48)..."
convert "$SOURCE_ICON" -resize 48x48 "$ANDROID_ICONS_DIR/mipmap-mdpi/ic_launcher.png"

echo "📱 Generating mipmap-hdpi (72x72)..."
convert "$SOURCE_ICON" -resize 72x72 "$ANDROID_ICONS_DIR/mipmap-hdpi/ic_launcher.png"

echo "📱 Generating mipmap-xhdpi (96x96)..."
convert "$SOURCE_ICON" -resize 96x96 "$ANDROID_ICONS_DIR/mipmap-xhdpi/ic_launcher.png"

echo "📱 Generating mipmap-xxhdpi (144x144)..."
convert "$SOURCE_ICON" -resize 144x144 "$ANDROID_ICONS_DIR/mipmap-xxhdpi/ic_launcher.png"

echo "📱 Generating mipmap-xxxhdpi (192x192)..."
convert "$SOURCE_ICON" -resize 192x192 "$ANDROID_ICONS_DIR/mipmap-xxxhdpi/ic_launcher.png"

# Also generate adaptive icons (Android 8.0+)
echo "📱 Generating adaptive icons..."
mkdir -p "$ANDROID_ICONS_DIR/mipmap-mdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-hdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xhdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xxhdpi"
mkdir -p "$ANDROID_ICONS_DIR/mipmap-xxxhdpi"

# Generate foreground icons (slightly smaller for adaptive icons)
convert "$SOURCE_ICON" -resize 36x36 -background transparent -gravity center -extent 48x48 "$ANDROID_ICONS_DIR/mipmap-mdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 54x54 -background transparent -gravity center -extent 72x72 "$ANDROID_ICONS_DIR/mipmap-hdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 72x72 -background transparent -gravity center -extent 96x96 "$ANDROID_ICONS_DIR/mipmap-xhdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 108x108 -background transparent -gravity center -extent 144x144 "$ANDROID_ICONS_DIR/mipmap-xxhdpi/ic_launcher_foreground.png"
convert "$SOURCE_ICON" -resize 144x144 -background transparent -gravity center -extent 192x192 "$ANDROID_ICONS_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png"

echo "✅ Android icons generated successfully!"
echo "📁 Icons saved to: $ANDROID_ICONS_DIR/mipmap-*/"
echo ""
echo "📋 Generated icons:"
find "$ANDROID_ICONS_DIR" -name "ic_launcher*.png" -exec ls -la {} \;
