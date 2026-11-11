# HUBS Hospital Appointment Portal

HUBS is a polished prototype of a hospital appointment booking system for the HCI assignment. It supports patient and doctor workflows, appointment search and booking, appointment management, clinic schedules, patient notes, reminders, reviews, and public doctor profiles.

## Run locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app works immediately in demo mode without Firebase variables. Use either of these demo accounts with password `demo123`:

- Patient: `toka@hubs.demo`
- Patient: `mphonyane@hubs.demo`
- Doctor: `sello@hubs.demo`
- Doctor: `mathepelo@hubs.demo`

## Connect Firebase

Create a Firebase Web App, enable Email/Password Authentication, create a Cloud Firestore database, and copy the browser configuration values into `.env.local` using `.env.example` as the template. Do not use a Firebase service-account private key in the browser or commit it to GitHub.

Deploy the included rules and indexes with the Firebase CLI after reviewing them:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

When Firebase variables are present, sign-in uses Firebase Authentication and appointment/availability writes are mirrored to Firestore. The intended collections are `users`, `doctors`, `appointments`, `availability`, `reviews`, and `notifications`.

## Deploy to Vercel

Import the GitHub repository into Vercel, set the framework preset to Vite, and add the six `VITE_FIREBASE_*` values as Production and Preview environment variables. Vercel will use `pnpm build` and publish the `dist` directory. The included `vercel.json` rewrites client-side routes to `index.html`.

## HCI walkthrough

The app intentionally keeps the prototype’s quick testing accounts, strong role separation, clear sidebar navigation, time-slot booking, status labels, and doctor schedule while adding responsive behavior, confirmations, useful empty states, and visible feedback for booking and schedule changes.
