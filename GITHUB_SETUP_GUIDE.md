# RentEasy – GitHub Repository Setup & CI/CD Guide

This guide explains how to initialize your GitHub repository for **RentEasy**, push your codebase, and utilize automated GitHub Actions for Android and web builds.

---

## 1. Initializing Git & Pushing to GitHub

In your project root directory:

```bash
# 1. Initialize git if not already initialized
git init

# 2. Add all audited source files
git add .

# 3. Create initial commit
git commit -m "feat: complete RentEasy production audit with hardened Supabase security and Android setup"

# 4. Set main branch
git branch -M main

# 5. Add your remote GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/renteasy.git

# 6. Push to GitHub
git push -u origin main
```

---

## 2. Configuring Repository Secrets (Optional for Custom Supabase Projects)

If you have provisioned a remote Supabase project and want it embedded into your production web and Android builds:

1. Go to your repository on GitHub.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret** and add:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyzcompany.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key (starts with `eyJ...`)
4. Click **Add secret**.

*Note: Never add `service_role` secrets to frontend repositories. Only the public anon key is safe for client applications.*

---

## 3. Automated Android Builds via GitHub Actions

Because this project includes `.github/workflows/android-build.yml`, every time you push to the `main` branch:

1. GitHub automatically spins up a clean Ubuntu runner with JDK 21 and Node.js 20.
2. It compiles the React application and runs `cap sync android`.
3. It compiles:
   - `RentEasy-Debug-APK` (`app-debug.apk`)
   - `RentEasy-Release-AAB` (`app-release.aab`)
4. To download your APK/AAB:
   - Go to your GitHub repository > Click the **Actions** tab.
   - Click the latest workflow run.
   - Scroll down to the **Artifacts** section at the bottom.
   - Click to download the `RentEasy-Debug-APK` or `RentEasy-Release-AAB` zip archive!
