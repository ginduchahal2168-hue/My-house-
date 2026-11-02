# RentEasy – Free Global Rental Marketplace & Android App

> **Tagline:** Find. Rent. Connect.  
> **Brand Color:** Emerald Green (`#167B62`)  
> **Platform Model:** 100% Free Forever · Zero Commissions · No Mandatory Registration

RentEasy is a production-ready international rental marketplace web and Android mobile application connecting property landlords and tenants directly.

---

## 🚀 Key Features

1. **Zero Fake Data & Clean First-Launch**:
   - Fresh installation starts with 0 properties, 0 chats, and 0 favorites.
   - Genuine user listings submitted via an 8-step wizard.
   - Clean, welcoming empty-state prompts with instant "List Your Property" call-to-actions.

2. **Real Property Listing Wizard**:
   - Mandatory field validation for real titles, locations, rental prices, currency, periods, and contact details.
   - Upload up to 15 actual photographs from phone camera or gallery (file type & size validated).
   - Generates unique reference code (`RE-YYYY-XXXXXX`) and a secret **Private Owner Management Token**.
   - Zero-password owner management: Landlords can edit rent, update availability, mark as rented, or delete anytime.

3. **Real Realtime Messaging**:
   - Built on Supabase PostgreSQL & Realtime channel subscriptions (`chat_messages` table).
   - Direct two-way messaging between guest seekers and verified property owners.
   - Zero simulated or automatic landlord replies.

4. **Honest Moderation & Community Reporting**:
   - Listings support real statuses: `approved`, `pending_review`, `rented`, `rejected`.
   - Built-in Moderator Portal (`#admin`) to review submissions.
   - Tenant community abuse reporting for fraud or unauthorized broker commissions.

5. **Cross-Platform Native Android App**:
   - Full native Android project powered by Capacitor (`com.renteasy.app`).
   - Integrated camera, storage, telephone dialer, and WhatsApp deep links.
   - Pre-configured Gradle wrapper, debug APK, release APK, and AAB instructions.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Database & Storage:** Supabase (PostgreSQL 15+, Supabase Storage bucket `property-photos`, Supabase Realtime)
- **Local Persistence Fallback:** Browser LocalStorage for seamless offline operation
- **Mobile Engine:** Capacitor 8.6 (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)
- **PWA:** Web App Manifest & Service Worker readiness

---

## 📦 Getting Started

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/renteasy.git
cd renteasy

# Install dependencies
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Supabase credentials:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-public-anon-key"
```
*(Note: Supabase credentials can also be set or changed at runtime via the "Supabase Live Database" modal in the website footer.)*

### 3. Database Migration
Run the complete SQL migration file in your Supabase SQL Editor:
```bash
# File location:
src/services/supabaseSchema.sql
```
This automatically sets up:
- `public.properties` table with index on city, country, rent, and owner token.
- `public.conversations` & `public.chat_messages` tables.
- `public.property_reports` moderation table.
- Storage bucket `property-photos` with public read access.
- Realtime publication on `chat_messages` and `conversations`.
- Row-Level Security (RLS) policies.

### 4. Running Web Development Server
```bash
npm run dev
# App will run on http://localhost:3000
```

---

## 📱 Android App Packaging with Capacitor

### 1. Sync Web Assets to Android
```bash
npm run build
npx cap sync android
```

### 2. Build Debug APK
```bash
cd android
./gradlew assembleDebug
# The output APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Build Release APK
```bash
cd android
./gradlew assembleRelease
# The output APK will be at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### 4. Build Android App Bundle (AAB for Google Play Store)
```bash
cd android
./gradlew bundleRelease
# The output bundle will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 5. Open in Android Studio
```bash
npx cap open android
```

---

## 🛡️ Security & Privacy

- **No Public Token Exposure:** Owner secret management tokens are only known to the poster and verified against backend database rows.
- **Client Storage:** Guest chat sessions and favorites are stored locally on device without tracking cookies.
- **Zero Commission:** RentEasy does not process payments or collect bank credentials.

---

## 📄 License
Apache-2.0. Open-source global rental marketplace.
