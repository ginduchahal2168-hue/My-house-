# RentEasy – Android Build, Signing & Google Play Publishing Guide

This document details how to build, test, sign, and publish the **RentEasy** native Android application (`com.renteasy.app`) to the Google Play Store.

---

## 1. Project Specifications

- **Application Name**: RentEasy
- **Package ID / Application ID**: `com.renteasy.app`
- **Framework**: Capacitor 8.6 with React 19 + TypeScript
- **Target SDK**: Android 34 (Android 14)
- **Minimum SDK**: Android 22 (Android 5.1 Lollipop - 99%+ global device reach)
- **Permissions Configured**:
  - `INTERNET`: Realtime messaging, property queries, Supabase sync
  - `CAMERA`: In-app property photography upload
  - `READ_MEDIA_IMAGES` / `READ_EXTERNAL_STORAGE`: Photo gallery selection
  - `CALL_PHONE`: Direct dialer invocation for landlord calls

---

## 2. Shared Backend Architecture

Both the **RentEasy Website** and the **RentEasy Android Application** communicate with the **same Supabase database and storage bucket**:
- Any property posted on Android appears on the website immediately after administrator approval.
- Any property posted on the website appears on Android in real time.
- Direct messages, chats, and image uploads sync across both platforms with zero discrepancy.
- No secrets or service-role keys are packaged inside the Android APK.

---

## 3. How to Build Locally

### Option A: Using Android Studio (Recommended)

1. Open Android Studio.
2. Select **Open an Existing Project** and choose the `/android` folder in this repository.
3. Wait for Gradle sync to complete.
4. **Build Debug APK**:
   - In the top menu, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
   - Once finished, click **locate** to find `app-debug.apk` in `android/app/build/outputs/apk/debug/`.
5. Connect your Android phone via USB (with Developer Mode & USB Debugging enabled) and click the green **Run (▶)** button to install and test directly.

### Option B: Using the Command Line (Requires JDK 21 & Android SDK)

```bash
# 1. Compile web assets
npm run build

# 2. Sync web build into Android assets
npx cap sync android

# 3. Build Debug APK
cd android
./gradlew assembleDebug

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Automatic Cloud Compilation via GitHub Actions

This repository includes `.github/workflows/android-build.yml`.
Whenever you push to GitHub, GitHub's Ubuntu runners will automatically:
1. Build the production React web bundle.
2. Sync the Capacitor assets.
3. Run `./gradlew assembleDebug` to produce `app-debug.apk`.
4. Run `./gradlew bundleRelease` to produce `app-release.aab`.
5. Make both files directly downloadable from the **Actions** tab of your repository without needing Android Studio installed on your computer!

---

## 5. Generating Release Keystore & Signing for Google Play

Google Play requires all production apps to be packaged as an **Android App Bundle (.aab)** and cryptographically signed.

### Step 1: Generate a Keystore File
In your terminal, run:
```bash
keytool -genkey -v -keystore renteasy-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias renteasy-key
```
*(Store `renteasy-release-key.jks` and your password in a safe, secure backup. Do NOT commit the keystore file to public git repositories).*

### Step 2: Configure Signing in `android/app/build.gradle`
Add your release credentials to the `signingConfigs` block:
```groovy
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../renteasy-release-key.jks")
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: "YOUR_KEYSTORE_PASSWORD"
            keyAlias "renteasy-key"
            keyPassword System.getenv("KEY_PASSWORD") ?: "YOUR_KEY_PASSWORD"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Build the Signed AAB Bundle
```bash
cd android
./gradlew bundleRelease
```
The signed AAB file will be located at:
`android/app/build/outputs/bundle/release/app-release.aab`

---

## 6. Publishing to Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - App name: **RentEasy**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free** (Zero commission, 100% free)
3. Set up your Store Listing:
   - **Short description**: Find. Rent. Connect. 100% free global rental marketplace connecting tenants and property owners directly.
   - **Full description**: RentEasy connects property owners with people looking for rental accommodation anywhere in the world. Browse single rooms, shared flats, studio apartments, 1-4 BHK, villas, and commercial spaces with zero commissions, direct phone/WhatsApp contact, and no mandatory login.
   - **App icon**: 512x512 PNG with RentEasy Emerald branding.
   - **Feature graphic**: 1024x500 PNG.
   - **Screenshots**: Upload phone screenshots of the Home, Explore, and Property Details screens.
4. Privacy Policy URL: Provide your live URL link (e.g. `https://your-app.web.app/#privacy` or Google Sites privacy page).
5. In the left navigation, go to **Testing** > **Internal testing** (or **Production**).
6. Click **Create new release**, upload `app-release.aab`, review the release, and submit for rollout!
