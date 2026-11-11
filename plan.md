# HUBS Hospital Appointment Portal — Implementation Plan

## Scope and implementation approach

Build a responsive React + TypeScript single-page application for a simplified hospital appointment booking system. The app will preserve the HUBS prototype’s two role-based workflows while improving clarity, accessibility, mobile behavior, feedback, and data persistence.

Firebase will be the external application backend:

- Firebase Authentication: email/password sign-in and role-aware session handling.
- Cloud Firestore: users, doctors, availability, appointments, reviews, reminders, and notifications.
- Firebase Storage: optional doctor profile photos; the first functional build can use curated local avatar assets while the storage adapter is ready.
- Firestore security rules: patients can manage their own appointments, doctors can manage their own schedule and assigned patients, and public doctor profiles/reviews are readable without exposing private clinical notes.

The frontend will use Firebase’s browser SDK and will read only browser-safe `VITE_FIREBASE_*` values from environment variables. No service-account credentials will be placed in the repository. A local demo mode with seeded sample data will keep the prototype usable before Firebase credentials are connected; the data layer will switch to Firestore when configuration is present.

The repository will be Vercel-ready with a standard Vite build, SPA rewrites, an `.env.example`, and documentation for Firebase and Vercel configuration. GitHub will be the source repository and Vercel will deploy from the main branch.

## Product structure

### Patient flow

1. Sign in as a patient.
2. Search and filter doctors by specialty and name.
3. Inspect doctor identity, specialty, clinic, rating, reviews, and available slots.
4. Select a slot and confirm an appointment with appointment type and optional reason.
5. View upcoming and past appointments with clear statuses.
6. Reschedule or cancel an eligible appointment with confirmation feedback.
7. Review reminders and notification history.

### Doctor/Admin flow

1. Sign in as a doctor/admin.
2. View today’s clinic schedule and duty status.
3. Add or remove availability slots.
4. View assigned patients and appointment details.
5. Update appointment status and add clinical notes.
6. View and edit the public-facing profile and recent reviews.

### Shared behavior

- Role-aware route protection and logout.
- Responsive sidebar that becomes a mobile drawer.
- Consistent loading, empty, error, and success states.
- Accessible labels, keyboard navigation, focus states, contrast-safe status chips, and confirmation dialogs.
- Friendly seeded demo accounts for the assignment walkthrough, clearly labeled as demo data.

## Project structure

```text
hubsportal/
├── client/
│   ├── src/
│   │   ├── components/       # Sidebar, cards, dialogs, fields, status chips
│   │   ├── data/             # Seed/demo data and static metadata
│   │   ├── lib/              # Firebase initialization and utilities
│   │   ├── pages/            # Auth, patient, doctor, appointments, profile
│   │   ├── App.tsx           # Route and session composition
│   │   ├── main.tsx          # Browser entry
│   │   └── styles.css        # Design tokens and responsive styles
│   ├── public/               # Route manifest and static assets
│   └── index.html
├── firestore.rules
├── firestore.indexes.json
├── .env.example
├── vercel.json
├── package.json
├── TODO.md
└── README.md
```

## Design direction

### Design movement

- **Clinical editorial dashboard — 0.07:** calm medical utility with a magazine-like information hierarchy.
- **Soft glassmorphism — 0.06:** translucent cards, gradients, and ambient glow as the dominant visual language.
- **Civic service console — 0.04:** dense public-service information design with strict tables and monochrome controls.

Chosen direction: **Clinical editorial dashboard**.

### Core principles

1. **Calm first:** use generous whitespace and restrained contrast so appointment decisions feel low-pressure.
2. **Scan before reading:** surface names, specialties, time slots, status, and next actions before secondary detail.
3. **Trust through structure:** separate public doctor information from private clinical notes and use explicit confirmation for irreversible actions.
4. **Useful warmth:** retain the prototype’s emerald action color but pair it with an ink-blue foundation and soft warm-gray surfaces.

### Color philosophy

A deep ink-blue sidebar anchors the portal as dependable and serious. An ownable **HUBS green** signals action, availability, and successful progress without looking like an emergency alert. Warm paper-gray surfaces keep the interface human and reduce the coldness of hospital-white layouts. Amber is reserved for pending attention; muted coral is reserved for cancellation and destructive emphasis.

### Layout paradigm

Use a persistent left rail on desktop with a wide editorial workspace to its right. The main content should open with a compact orientation row, then a prominent task panel, then a staggered set of supporting cards. Avoid a generic centered dashboard grid: information should follow a reading path from “what needs my attention” to “what can I do next.” On mobile, the rail collapses into a top bar and bottom-safe action area.

### Signature elements

- A small circular pulse mark beside the HUBS wordmark, reused as the availability indicator.
- “Today” timeline rails for doctor schedules and appointment status progression.
- Softly rounded slot pills with a visible selected state, rather than generic buttons.

### Interaction and animation

Interactions should feel immediate and reassuring. Use 150–220ms ease-out transitions for cards, drawer movement, focus rings, and status changes. Avoid decorative motion on clinical content. When booking succeeds, show a concise confirmation panel and update the appointment list without a full-page refresh. Destructive actions require a confirmation dialog and a clear cancellation result.

### Typography system

Use **Manrope** for headings and **Inter** for body/UI text, with a compact uppercase eyebrow label for context and sentence-case action labels. Headings should be confident but not oversized; body text should remain at a comfortable reading size with generous line height.

### Brand essence and voice

HUBS is a calmer way to move from “I need care” to “I know what happens next.” Personality: **reassuring, organized, human**.

Example voice:

- “Find care that fits your day.”
- “Your next appointment is confirmed. We’ll keep the details close.”

### Wordmark and signature color

The wordmark is HUBS in a custom-weighted geometric treatment with a four-node pulse mark suggesting patients, clinicians, time, and care connected. Signature brand color: **HUBS green `#2BB673`**.

## Delivery workflow

1. Create the initial project files, seeded demo data, Firebase adapter, and responsive UI.
2. Add Firestore rules, indexes, environment documentation, and Vercel SPA configuration.
3. Run type checks, build checks, and route-manifest verification.
4. Start Preview and inspect the primary patient and doctor routes.
5. Connect GitHub and push the main branch.
6. Connect the repository to Vercel, add Firebase environment variables, and deploy.
7. Create Firebase Authentication users and seed Firestore data once the Firebase project is available.
8. Deliver the Vercel URL plus setup notes and any remaining account-side actions.

## Open account-side dependency

The build can proceed with demo mode before sign-in. Firebase project configuration and GitHub/Vercel authorization will be completed through the user’s own browser session when required. Passwords, recovery codes, and service-account private keys should not be shared in chat.
