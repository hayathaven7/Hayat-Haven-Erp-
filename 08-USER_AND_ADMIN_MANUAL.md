# 06. Environment Variables & Deployment Guide

## ⚙️ Environment Variables Setup

Create a `.env` file in the project root by copying `.env.example`:

```env
# Google Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=galvanized-kite-ljk7s.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=galvanized-kite-ljk7s
VITE_FIREBASE_STORAGE_BUCKET=galvanized-kite-ljk7s.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=18651801599
VITE_FIREBASE_APP_ID=1:18651801599:web:a1b2c3d4e5f6

# Optional SMS Gateway API Key
VITE_SMS_API_KEY=HH-SMS-GATEWAY-KEY-9988
```

---

## 🚀 Production Deployment Instructions

### Method A: Build & Deploy via Cloud Run / Container
1. **Build Static Assets**:
   ```bash
   npm run build
   ```
   This compiles all React components and TypeScript files into optimized static bundles inside the `dist/` directory.

2. **Containerize & Host**:
   - The application runs on Port `3000` served by Nginx or Express static middleware.
   - Set environment variable `NODE_ENV=production`.

---

### Method B: Firebase Hosting Deployment
1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```
2. **Login & Initialize**:
   ```bash
   firebase login
   firebase init hosting
   ```
   Set public directory to `dist` and configure as a single-page app (`index.html` rewrite).

3. **Deploy Security Rules & App**:
   ```bash
   firebase deploy --only firestore:rules,hosting
   ```
