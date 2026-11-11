# HUBS Hospital Appointment Portal — Delivery Checklist

## Project foundation and visual system
- [ ] The Vercel-ready React application uses a responsive clinical editorial dashboard direction with an ink-blue navigation rail, HUBS green actions, warm-gray surfaces, clear typography, and accessible focus states.
- [ ] The project includes a documented Firebase + Vercel setup path, browser-safe environment variables, SPA fallback configuration, and a synchronized route manifest.

## Role-based authentication and demo access
- [ ] Users can sign in as Patient or Doctor/Admin, see role-appropriate navigation, and log out back to the sign-in screen.
- [ ] The sign-in screen starts with blank email and password fields, does not expose quick-login cards, and lets visitors manually enter saved or Firebase credentials.
- [ ] Demo doctor accounts are available for the walkthrough with distinct notification feeds for Dr. Sello Nthunya, Dr. Mathepelo Mofokeng, Dr. Kabelo Rasekoai, and Dr. Ntate Mokete.
- [ ] Firebase Authentication is used when Firebase configuration is present; private credentials are not committed.

## Patient doctor discovery and booking
- [ ] Patients can search by doctor name and filter by specialty.
- [ ] Doctor cards show name, specialty, clinic, rating, review count, and available appointment slots.
- [ ] Patients can select an available slot, choose an appointment type, add an optional reason, and confirm a booking.
- [ ] Booking produces visible confirmation feedback and updates the patient appointment list without a full-page refresh.

## Patient appointment management and reminders
- [ ] Patients can view upcoming and past appointments with date, time, doctor, clinic, and status labels.
- [ ] Patients can reschedule or cancel eligible appointments with a confirmation step and clear result.
- [ ] Patients can view reminders/notifications with read state and appointment context.

## Doctor schedule and availability
- [ ] Doctors can view a daily clinic timeline with patient, appointment type, time, and status.
- [ ] Doctors can toggle duty status and add availability slots.
- [ ] Doctors can update appointment status and see the schedule update immediately.

## Doctor patient management and public profile
- [ ] Doctors can browse assigned patients with appointment details and clinical notes.
- [ ] Doctors can add or update clinical notes without exposing those notes in public profile views.
- [ ] Doctors can view and edit public profile information and see recent patient reviews with ratings.

## Backend persistence and delivery
- [ ] Firestore data structures and security rules cover users, doctors, availability, appointments, reviews, reminders, and notifications.
- [ ] The repository contains Firebase integration code, Firestore indexes/rules, `.env.example`, and setup documentation.
- [ ] Type checks and production build pass, the route manifest returns valid JSON, and the application is ready to connect to GitHub and deploy through Vercel.
