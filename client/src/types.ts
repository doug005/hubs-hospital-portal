export type Role = 'patient' | 'doctor';
export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type AppointmentType = 'Consultation' | 'Follow-up' | 'First visit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  phone?: string;
}

export interface Doctor {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  clinic: string;
  location: string;
  rating: number;
  reviewCount: number;
  experience: string;
  bio: string;
  color: string;
  availableSlots: string[];
  languages: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string;
  time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number;
  text: string;
  date: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: 'appointment' | 'reminder' | 'system';
}

export interface DemoState {
  currentUser: UserProfile | null;
  users: UserProfile[];
  appointments: Appointment[];
  notifications: AppNotification[];
  doctors: Doctor[];
  reviews: Review[];
  dutyStatus: boolean;
}
