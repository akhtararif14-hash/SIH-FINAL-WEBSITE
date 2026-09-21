# SriGen — Web

This is the Next.js (App Router) web version of the SriGen AI Business Advisor app —
ported from the original Expo/React Native app and its Express backend.

It's a single project now: the chat/transcription logic that used to live in a
separate `server.js` on Render is now built in as Next.js API routes
(`app/api/chat`, `app/api/transcribe`), so there's nothing separate to deploy
or keep awake — everything ships and scales together on Vercel.

## What changed from the mobile app

- **Google Sign-In is now trivial.** The Expo app needed a dev build, EAS,
  Android package names, SHA-1 fingerprints, `google-services.json`, all of
  it — because native Google Sign-In requires native code. On the web, it's
  just `signInWithPopup()`. Both Google and email/password sign-in are on
  the `/login` page.
- **Voice input records `.webm` instead of `.m4a`**, using the browser's
  built-in `MediaRecorder`. Groq's Whisper API accepts `webm` natively, so —
  unlike the Bhashini setup we built earlier for the mobile app — there's no
  ffmpeg conversion step needed here at all.
- **The bottom tab bar became a top nav bar** (Home / AI Advisor / Schemes /
  Calculator), which is the normal pattern for a website instead of a phone
  app.
- All the translations, scheme data, and loan-calculator math are ported
  over unchanged.

## Local setup

```bash
npm install
cp .env.local.example .env.local
# fill in .env.local with your real values (see below)
npm run dev
```

Visit http://localhost:3000.

## Environment variables you need

Set these in `.env.local` for local dev, **and again in Vercel's dashboard**
(Project Settings → Environment Variables) for production — `.env.local` is
never uploaded or read by Vercel automatically.

| Variable | Where it's used | Notes |
|---|---|---|
| `GROQ_API_KEY` | `app/api/chat`, `app/api/transcribe` | Server-only. Same key you used in the old `server.js`. |
| `GEMINI_API_KEY` | `app/api/chat` | Server-only. Used for embeddings, same as before. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `lib/firebase.js` | From the same Firebase **Web app** you already registered for the Expo app — reuse those exact values. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `lib/firebase.js` | Same source. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `lib/firebase.js` | Same source. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `lib/firebase.js` | Same source. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `lib/firebase.js` | Same source. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `lib/firebase.js` | Same source. |

The `NEXT_PUBLIC_` ones are the same values from your old `firebaseConfig.js`
in the Expo project (the `apiKey`, `authDomain`, etc. object) — just split
into separate env vars here instead of hardcoded. These are safe to expose
to the browser; that's normal for Firebase web config.

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to vercel.com → **Add New Project** → import that repo.
3. Vercel auto-detects Next.js — no build settings to change.
4. Before the first deploy (or right after), add all 8 environment variables
   from the table above in **Project Settings → Environment Variables**.
5. Deploy. You'll get a `*.vercel.app` URL immediately.

### One extra Firebase step for Google Sign-In to work on the deployed site

Firebase blocks Google Sign-In popups from domains it doesn't recognize.
After your first Vercel deploy:

1. Go to Firebase console → **Authentication** → **Settings** →
   **Authorized domains**.
2. Click **Add domain** and add your `*.vercel.app` URL (and your custom
   domain too, if you add one later).

Without this step, `signInWithPopup` will fail with an
`auth/unauthorized-domain` error.

## Project structure

```
app/
  page.js              — home page
  chat/                — AI advisor chat (text + voice)
  schemes/              — scheme list, each with an "Ask AI" button
  calculator/           — NSFDC loan calculator
  login/                — email/password + Google sign-in
  api/chat/route.js     — RAG chat endpoint (ported from server.js)
  api/transcribe/route.js — Whisper transcription endpoint
components/
  Header.js             — top nav, language switcher, profile menu
lib/
  firebase.js            — Firebase client init
  AuthProvider.js         — auth state context
  LanguageProvider.js     — language state context
  translations.js         — all UI strings, 4 languages
  schemes.js               — scheme data
  loanCalculator.js         — loan math
  knowledge-base.json        — RAG knowledge base (same one your backend used)
```

## Known limitations carried over

- Scheme names/descriptions and calculator result labels are still English-only
  in all four languages, same as in the mobile app — translating that content
  accurately is its own project.
- Voice input needs a browser with `MediaRecorder` support (all modern
  browsers have this; very old browsers or some in-app webviews may not).
