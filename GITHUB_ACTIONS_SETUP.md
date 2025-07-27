# GitHub Actions Setup Guide for Jam Shalat App

This guide will help you set up automated builds for Windows, macOS, and Linux using GitHub Actions.

## 🚀 What You'll Get

The GitHub Actions workflow will automatically build your app for:
- **Windows** (.msi installer)
- **macOS** (Universal .dmg for Intel & Apple Silicon)
- **Linux** (.AppImage and .deb packages)

## 📋 Prerequisites

1. **GitHub Repository**: Your code needs to be in a GitHub repository
2. **Unsplash API Key**: For background images functionality

## 🔧 Setup Steps

### Step 1: Push Your Code to GitHub

If you haven't already, create a GitHub repository and push your code:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Initial commit - Jam Shalat v1.0.1"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/jam-shalat-app.git

# Push to GitHub
git push -u origin main
```

### Step 2: Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secret:

   - **Name**: `VITE_UNSPLASH_ACCESS_KEY`
   - **Value**: Your Unsplash API key

### Step 3: Enable GitHub Actions

The workflow file is already created at `.github/workflows/build.yml`. GitHub will automatically detect it when you push to your repository.

### Step 4: Trigger Builds

The workflow will automatically run when:
- You push code to `main` or `master` branch
- You create a pull request
- You create a new release

## 🎯 Creating a Release

To create a release with downloadable binaries:

1. Go to your GitHub repository
2. Click on **Releases** (right sidebar)
3. Click **Create a new release**
4. Choose a tag version (e.g., `v1.0.1`)
5. Fill in the release title and description
6. Click **Publish release**

GitHub Actions will automatically:
- Build for all platforms
- Create installers/packages
- Attach them to your release
- Generate release notes

## 📦 Build Artifacts

After a successful build, you'll get:

### Windows
- `Jam Shalat_1.0.1_x64_en-US.msi` - Windows installer

### macOS
- `Jam Shalat_1.0.1_aarch64.dmg` - Apple Silicon (M1/M2)
- `Jam Shalat_1.0.1_x64.dmg` - Intel Macs

### Linux
- `jam-shalat-app_1.0.1_amd64.AppImage` - Portable app
- `jam-shalat-app_1.0.1_amd64.deb` - Debian/Ubuntu package

## 🔍 Monitoring Builds

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You'll see all workflow runs and their status
4. Click on any run to see detailed logs

## 🛠️ Troubleshooting

### Build Fails
- Check the **Actions** tab for error logs
- Ensure all secrets are properly set
- Verify your `tauri.conf.json` is valid

### Missing Artifacts
- Make sure you created a **release** (not just a tag)
- Check that the workflow completed successfully
- Verify the `GITHUB_TOKEN` has proper permissions

## 🎉 Success!

Once set up, you'll have:
- ✅ Automated builds for all platforms
- ✅ Professional release management
- ✅ Easy distribution to users
- ✅ No need for local cross-compilation

Your users can now download the appropriate installer for their operating system directly from your GitHub releases page!
