import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { demoUsers, doctors as seedDoctors, initialAppointments, initialNotifications, initialReviews } from '../data/demoData';
import { firebaseAuth, firebaseConfigured, firestore } from './firebase';
import type { AppNotification, Appointment, AppointmentStatus, AppointmentType, Doctor, DemoState, Review, Role, UserProfile } from '../types';

const STORAGE_KEY = 'hubs-demo-state-v1';

interface StoreContextValue extends DemoState {
  isDemoMode: boolean;
  signIn: (email: string, password: string, role: Role) => Promise<void>;
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
  appointments: initialAppointments,
  notifications: initialNotifications,
  doctors: seedDoctors,
  reviews: initialReviews,
  dutyStatus: true,
});

function getStoredState(): DemoState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) as DemoState : freshState();
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
      const demoUser = demoUsers.find((user) => user.email === normalized && user.role === role);
      if (demoUser && password === 'demo123') {
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

    const signOutUser = async () => {
      if (firebaseAuth && firebaseConfigured) await signOut(firebaseAuth);
      setState((current) => ({ ...current, currentUser: null }));
    };

    const bookAppointment = (input: Omit<Appointment, 'id' | 'status'>) => {
      const id = `appt-${Date.now()}`;
      const appointment: Appointment = { ...input, id, status: 'confirmed' };
      setState((current) => ({
        ...current,
        appointments: [appointment, ...current.appointments],
        notifications: [{
          id: `note-${Date.now()}`,
          title: 'Appointment confirmed',
          body: `Your visit with ${input.doctorName} is booked for ${input.date} at ${input.time}.`,
          time: 'Just now',
          read: false,
          kind: 'appointment',
        }, ...current.notifications],
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
      setState((current) => ({ ...current, appointments: current.appointments.map((item) => item.id === id ? { ...item, status } : item) }));
      if (firestore && firebaseConfigured) void updateDoc(doc(firestore, 'appointments', id), { status });
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
