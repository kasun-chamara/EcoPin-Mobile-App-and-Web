# EcoPin — Clean Sri Lanka garbage-pin app

Citizens pin garbage spots (photo + GPS). Each pin is routed to the council that owns that place, an officer dispatches a truck, the driver navigates there (time + distance), marks it collected with an after photo, and the citizen gets a **"We cleaned it together!"** notification. A daily cleaned count shows everywhere.

```
ecopin/
├── mobile/     Expo (React Native + TypeScript) app for Android + iOS — citizen and driver
├── portal/     Next.js web portal for council officers (review + dispatch)
└── supabase/   Database schema (PostGIS), sample seed, push-notification edge function
```

## 1. Run the mobile app right now (demo mode)

No backend needed — without keys the app uses sample data.

```bash
cd mobile
npm install
npx expo start
```

- Press `a` for an Android emulator, `i` for the iOS simulator (Mac only), or scan the QR code.
- On the welcome screen tap **Get started → Try demo as citizen** or **Try demo as driver**.
- Maps, background location and push notifications need a **development build** (not Expo Go):
  `npx expo run:android` (or `npx eas-cli@latest build --profile development`).

## 2. Connect Supabase (real data)

1. Create a project at supabase.com.
2. SQL editor → run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
   The seed council boundary is a **rough sample rectangle** — load real local-authority boundaries before launch.
3. Authentication → Providers → **Phone**: turn on and connect an SMS provider (e.g. Twilio, or a local Sri Lankan SMS gateway).
4. Copy `mobile/.env.example` → `mobile/.env` and fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project settings → API).
5. Make staff accounts: in the `profiles` table set `role` to `driver` (plus `truck_no`) or `officer`.
6. Push notifications: `supabase functions deploy send-push`, then Database → Webhooks → on **INSERT** into `notifications` call that function.

## 3. Council portal

```bash
cd portal
cp .env.example .env      # same Supabase URL + anon key
npm install
npm run dev               # http://localhost:3000
```

Officers sign in with email + password (create them in Supabase Auth and set `role = 'officer'`). They verify new pins and dispatch them to a driver.

## 4. Google Maps (driver routes)

Put a key in `EXPO_PUBLIC_GOOGLE_MAPS_KEY` (enable **Maps SDK for Android** and **Directions API**). Without it the driver screen shows a straight-line estimate. Check current Google Maps pricing before launch.

## 5. Publish to Google Play and the App Store

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init                 # puts the project id in app config (needed for push)
npx eas-cli@latest build --platform all
npx eas-cli@latest submit --platform all
```

- Accounts: Google Play Developer (one-time fee) and Apple Developer Program (yearly fee).
- Test first with TestFlight (iOS) and the Internal testing track (Android).
- Stores need a privacy policy, screenshots and clear location wording — the permission texts are in `mobile/app.config.ts`.
- Change `lk.ecopin.app` (bundle id / package) to your own before the first build.

## What's where in the mobile app

| Screen (design canvas) | File |
| --- | --- |
| Citizen · 1 Welcome & sign-in | `src/app/index.tsx`, `src/app/verify.tsx` |
| Citizen · 2 Home map | `src/app/(citizen)/home.tsx` |
| Citizen · 3 Pin a spot (details popup) | `src/app/(citizen)/report.tsx` |
| Citizen · 4 My pins & tracking | `src/app/(citizen)/my-pins.tsx` |
| Citizen · 5 Collected notification | `src/app/collected/[id].tsx` |
| Citizen · 6 Impact, badges & ranks | `src/app/(citizen)/impact.tsx` |
| Nearby list | `src/app/(citizen)/nearby.tsx` |
| Driver · 1 Today's jobs | `src/app/(driver)/jobs.tsx` |
| Driver · 2 Route to pin | `src/app/driver/navigate/[id].tsx` |
| Driver · 3 Mark collected | `src/app/driver/complete/[id].tsx` |

- Colours and tokens: `src/lib/theme.ts` · Bottom nav: `src/components/BottomNav.tsx`
- Data layer (Supabase + demo fallback): `src/lib/api.ts` · Login: `src/lib/auth.tsx`
- Languages: `src/locales/si.json`, `en.json`, `ta.json` — **have a native speaker check the Sinhala and Tamil text**; missing keys fall back to English.

## Checked

- `mobile`: `npx tsc --noEmit` passes and `npx expo export --platform android` bundles.
- `portal`: `npm run build` and `npm run lint` pass.
- Not yet run on a real phone or against a live Supabase project.

## Not built yet

Duplicate-pin merging in the portal, offline pin queue, real badge rules, driver history screen, push deep-links, and the department dashboard charts from the canvas.
