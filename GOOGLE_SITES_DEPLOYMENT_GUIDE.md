# RentEasy – Firebase Hosting & Google Sites Deployment Guide

This guide walks you through deploying **RentEasy** to a free hosting URL (Firebase Hosting) and embedding it seamlessly into your **Google Sites** website.

---

## 1. Understanding the Architecture

- **Google Sites** is an intuitive site builder ideal for landing pages, team information, and content showcases, but it cannot run full-stack Node.js / Vite build servers directly.
- **Firebase Hosting** provides free, high-speed global SSL hosting (`https://<project-id>.web.app`) for the production React/Vite application.
- By deploying the RentEasy React marketplace to Firebase Hosting and embedding it into Google Sites via the **Embed URL** tile, your visitors get the best of both worlds: a branded Google Sites landing page that displays the fully functional, interactive RentEasy marketplace with zero domain costs.

---

## 2. Deploying RentEasy to Firebase Hosting (100% Free)

### Prerequisites
- Node.js installed on your computer.
- A free Google account.

### Step 1: Install Firebase CLI
In your local terminal:
```bash
npm install -g firebase-tools
```

### Step 2: Log In to Google Firebase
```bash
firebase login
```

### Step 3: Initialize or Select Your Firebase Project
In the root directory of this project:
```bash
firebase use --add
```
*(Select or create your Firebase project name, e.g., `renteasy-app`).*

The project already includes pre-configured `firebase.json` and `.firebaserc` files with:
- SPA rewrite routing (`"source": "**", "destination": "/index.html"`)
- Optimized asset caching headers

### Step 4: Build and Deploy
Run:
```bash
npm run build
firebase deploy --only hosting
```

Your app will immediately be live on your free Firebase Hosting domain:
`https://renteasy-app.web.app` (or `https://renteasy-app.firebaseapp.com`)

---

## 3. Embedding RentEasy into Google Sites

### Method A: Direct Interactive Marketplace Embed (Recommended)

1. Open [Google Sites](https://sites.google.com/new) and create or open your site.
2. In the right-hand panel, click the **Insert** tab.
3. Click the **Embed** tool (represented by `< >` icon).
4. In the pop-up modal, select the **By URL** tab.
5. Paste your deployed Firebase Hosting URL:
   ```
   https://your-app-id.web.app
   ```
6. Choose **Whole page** and click **Insert**.
7. Resize the embedded frame on your Google Sites page:
   - Drag the side handles to fill the full page width.
   - Drag the bottom handle downward to set the height to at least `900px` to `1200px` so properties, filters, and cards display cleanly without nested scrolling.
8. Click **Publish** in the top-right corner of Google Sites.

---

### Method B: Clean Landing Portal Card Embed

If you prefer a lightweight hero banner on Google Sites that links users out to the full marketplace:

1. In Google Sites, click **Insert** > **Embed**.
2. Select the **Embed code** tab.
3. Paste the following responsive embed snippet (replace `https://your-app-id.web.app` with your actual URL):

```html
<iframe 
  src="https://your-app-id.web.app/google-sites-embed.html" 
  width="100%" 
  height="540px" 
  style="border:none; border-radius: 24px; overflow: hidden;"
  allow="camera; microphone; geolocation"
  loading="lazy"
></iframe>
```

4. Click **Next** and **Insert**.

---

## 4. Setting Up Custom Domains Later

When you are ready to connect your own domain (e.g. `www.renteasy.com`):
1. Go to the [Firebase Console](https://console.firebase.google.com) > **Hosting**.
2. Click **Add custom domain**.
3. Follow the DNS verification steps (adds A and TXT records at your registrar).
4. Firebase automatically provisions free SSL certificates.
5. You can also connect the custom domain directly to Google Sites under **Settings** > **Custom Domains**.
