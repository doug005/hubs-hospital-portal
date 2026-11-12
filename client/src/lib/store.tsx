import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { demoUsers, doctors as seedDoctors, initialAppointments, initialNotifications, initialReviews } from '../data/demoData';
import { firebaseAuth, firebaseConfigured, firestore } from './firebase';
import type { AppNotification, Appointment, AppointmentStatus, AppointmentType, Doctor, DemoState, Review, Role, UserProfile } from '../types';

const STORAGE_KEY = 'hubs-demo-state-v1';

interface StoreContextValue extends DemoState {
  isDemoMode: boolean;
  signIn: (email: string, password: string, role: Role) => Promise<void>;
  createAccount: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signOutUser: () => Promise<void>;
  bookAppointment: (input: Omit<Appointment, 'id' | 'status'>) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setDutyStatus: (active: boolean) => void;
  addAvailability: (doctorId: string, slot: string) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  updateClinicalNote: (id: string, notes: string) => void;
  updateDoctor: (id: string, patch: Partial<Doctor>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const freshState = (): DemoState => ({
  currentUser: null,
  users: demoUsers,
  appointments: initialAppointments,
  notifications: initialNotifications,
  doctors: seedDoctors,
  reviews: initialReviews,
  dutyStatus: true,
});

function getStoredState(): DemoState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return freshState();
    const parsed = JSON.parse(stored) as Partial<DemoState>;
    const restored = { ...freshState(), ...parsed, users: parsed.users || demoUsers };
    restored.appointments = restored.appointments.map((appointment) => appointment.id === 'appt-001' && appointment.status === 'confirmed' ? { ...appointment, status: 'pending' } : appointment);
    restored.notifications = restored.notifications.map((notification) => notification.id === 'note-1' && notification.title === 'Appointment confirmed' ? { ...notification, title: 'Appointment request sent', body: 'Your visit with Dr. Sello Nthunya is waiting for confirmation.', read: true } : notification);
    return restored;
  } catch {
    return freshState();
  }
}

export function HubsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(getStoredState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<StoreContextValue>(() => {
    const visibleNotifications = state.notifications.filter((notification) => notification.userId === state.currentUser?.id || (!notification.userId && state.currentUser?.role === 'patient'));
    const signIn = async (email: string, password: string, role: Role) => {
      const normalized = email.trim().toLowerCase();
      const demoUser = state.users.find((user) => user.email === normalized && user.role === role);
      if (demoUser && (password === 'demo123' || state.users.some((user) => user.id === demoUser.id && user.id.startsWith('local-')))) {
        setState((current) => ({ ...current, currentUser: demoUser }));
        return;
      }

      if (!firebaseConfigured || !firebaseAuth || !firestore) {
        throw new Error('Use a demo account or connect Firebase in .env.local to sign in with a real account.');
      }

      const credential = await signInWithEmailAndPassword(firebaseAuth, normalized, password);
      const profile: UserProfile = {
        id: credential.user.uid,
        name: credential.user.displayName || normalized.split('@')[0],
        email: normalized,
        role,
        avatar: (credential.user.displayName || normalized).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      };
      setState((current) => ({ ...current, currentUser: profile }));
    };

    const createAccount = async (name: string, email: string, password: string, role: Role) => {
      const normalized = email.trim().toLowerCase();
      const cleanName = name.trim();
      if (role !== 'patient') throw new Error('Only patients can create a new account. Doctor accounts are created by a HUBS administrator.');
      if (!cleanName || !normalized || password.length < 6) throw new Error('Enter your name, a valid email, and a password with at least 6 characters.');
      if (state.users.some((user) => user.email === normalized)) throw new Error('An account with this email already exists. Try signing in instead.');

      if (firebaseConfigured && firebaseAuth && firestore) {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, normalized, password);
        await updateProfile(credential.user, { displayName: cleanName });
        const profile: UserProfile = { id: credential.user.uid, name: cleanName, email: normalized, role, avatar: cleanName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() };
        try {
          await setDoc(doc(firestore, 'users', profile.id), profile);
        } catch (profileError) {
          console.warn('Account created, but the Firestore profile mirror was unavailable.', profileError);
        }
        setState((current) => ({ ...current, users: [...current.users, profile], currentUser: profile }));
        return;
      }

      const profile: UserProfile = { id: `local-${Date.now()}`, name: cleanName, email: normalized, role, avatar: cleanName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() };
      setState((current) => ({ ...current, users: [...current.users, profile], currentUser: profile }));
    };

    const signOutUser = async () => {
      if (firebaseAuth && firebaseConfigured) await signOut(firebaseAuth);
      setState((current) => ({ ...current, currentUser: null }));
    };

    const bookAppointment = (input: Omit<Appointment, 'id' | 'status'>) => {
      const id = `appt-${Date.now()}`;
      const appointment: Appointment = { ...input, id, status: 'pending' };
      setState((current) => ({
        ...current,
        appointments: [appointment, ...current.appointments],
      }));
      if (firestore && firebaseConfigured) {
        void addDoc(collection(firestore, 'appointments'), appointment);
      }
    };

    const cancelAppointment = (id: string) => {
      setState((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status: 'cancelled' } : item) }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'appointments', id), { status: 'cancelled' });
    };

    const rescheduleAppointment = (id: string, date: string, time: string) => {
      setState((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, date, time, status: 'pending' } : item) }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'appointments', id), { date, time, status: 'pending' });
    };

    const markNotificationRead = (id: string) => setState((current) => ({ ...current, notifications: current.notifications.map((notification) => notification.id === id ? { ...notification, read: true } : notification) }));
    const markAllNotificationsRead = () => setState((current) => ({ ...current, notifications: current.notifications.map((notification) => ({ ...notification, read: true })) }));
    const setDutyStatus = (active: boolean) => setState((current) => ({ ...current, dutyStatus: active }));
    const addAvailability = (doctorId: string, slot: string) => {
      setState((current) => ({ ...current, doctors: current.doctors.map((doctor) => doctor.id === doctorId && !doctor.availableSlots.includes(slot) ? { ...doctor, availableSlots: [...doctor.availableSlots, slot].sort() } : doctor) }));
      if (firestore && firebaseConfigured) void setDoc(doc(firestore, 'availability', `${doctorId}-${slot.replace(':', '')}`), { doctorId, slot });
    };
    const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
      const appointment = state.appointments.find((item) => item.id === id);
      const shouldNotifyPatient = appointment && appointment.status !== 'confirmed' && status === 'confirmed';
      const confirmationNotification = shouldNotifyPatient && appointment ? {
        id: `note-${Date.now()}`,
        userId: appointment.patientId,
        title: 'Appointment confirmed',
        body: `${appointment.doctorName} confirmed your visit for ${appointment.date} at ${appointment.time}.`,
        time: 'Just now',
        read: false,
        kind: 'appointment' as const,
      } : null;
      setState((current) => ({
        ...current,
        appointments: current.appointments.map((item) => item.id === id ? { ...item, status } : item),
        notifications: confirmationNotification ? [confirmationNotification, ...current.notifications] : current.notifications,
      }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'appointments', id), { status });
      if (firestore && firebaseConfigured && confirmationNotification) void addDoc(collection(firestore, 'notifications'), confirmationNotification);
    };
    const updateClinicalNote = (id: string, notes: string) => {
      setState((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, notes } : item) }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'appointments', id), { notes });
    };
    const updateDoctor = (id: string, patch: Partial<Doctor>) => {
      setState((current) => ({ ...current, doctors: current.doctors.map((doctor) => doctor.id === id ? { ...doctor, ...patch } : doctor) }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'doctors', id), patch);
    };

    return {
      ...state,
      notifications: visibleNotifications,
      isDemoMode: !firebaseConfigured,
      signIn,
      createAccount,
      signOutUser,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      markNotificationRead,
      markAllNotificationsRead,
      setDutyStatus,
      addAvailability,
      updateAppointmentStatus,
      updateClinicalNote,
      updateDoctor,
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHubsStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useHubsStore must be used inside HubsProvider');
  return value;
}

export type { Review };
