import type { AppNotification, Appointment, Doctor, Review, UserProfile } from '../types';

export const demoUsers: UserProfile[] = [
  { id: 'patient-toka', name: 'Toka Mokoena', email: 'toka@hubs.demo', role: 'patient', avatar: 'TM', phone: '+266 5912 0440' },
  { id: 'patient-mphonyane', name: 'Mphonyane Khubelu', email: 'mphonyane@hubs.demo', role: 'patient', avatar: 'MK', phone: '+266 6308 1550' },
  { id: 'doctor-sello', name: 'Dr. Sello Nthunya', email: 'sello@hubs.demo', role: 'doctor', avatar: 'SN', phone: '+266 5881 2201' },
  { id: 'doctor-mathepelo', name: 'Dr. Mathepelo Mofokeng', email: 'mathepelo@hubs.demo', role: 'doctor', avatar: 'MM', phone: '+266 5900 8032' },
];

export const doctors: Doctor[] = [
  {
    id: 'dr-sello',
    name: 'Dr. Sello Nthunya',
    initials: 'SN',
    specialty: 'General Practitioner',
    clinic: 'HUBS Central Clinic',
    location: 'Maseru · 1.2 km away',
    rating: 4.9,
    reviewCount: 126,
    experience: '12 years experience',
    bio: 'Dr. Sello provides thoughtful, practical care for adults and families, with a focus on early intervention and continuity of care.',
    color: '#d7efe5',
    availableSlots: ['09:00', '10:30', '13:30', '15:00'],
    languages: ['English', 'Sesotho'],
  },
  {
    id: 'dr-mathepelo',
    name: 'Dr. Mathepelo Mofokeng',
    initials: 'MM',
    specialty: 'Cardiologist',
    clinic: 'Maseru Heart Centre',
    location: 'Maseru · 2.8 km away',
    rating: 4.8,
    reviewCount: 94,
    experience: '9 years experience',
    bio: 'A patient-first cardiologist helping people understand their heart health with clear explanations and considered treatment plans.',
    color: '#e7def9',
    availableSlots: ['08:30', '11:00', '14:00'],
    languages: ['English', 'Sesotho', 'French'],
  },
  {
    id: 'dr-kabelo',
    name: 'Dr. Kabelo Rasekoai',
    initials: 'KR',
    specialty: 'Dermatologist',
    clinic: 'Maseru Skin & Wellness',
    location: 'Maseru · 3.4 km away',
    rating: 4.7,
    reviewCount: 68,
    experience: '7 years experience',
    bio: 'Specialist dermatology consultations for skin, hair, and nail concerns, always grounded in practical routines patients can keep.',
    color: '#f6e7c8',
    availableSlots: ['10:00', '12:30', '16:00'],
    languages: ['English', 'Sesotho'],
  },
  {
    id: 'dr-ntate',
    name: 'Dr. Ntate Mokete',
    initials: 'NM',
    specialty: 'Paediatrician',
    clinic: 'HUBS Family Health',
    location: 'Maseru · 4.1 km away',
    rating: 4.9,
    reviewCount: 152,
    experience: '15 years experience',
    bio: 'Warm, evidence-led care for children from newborn checkups through adolescence, with time for every parent question.',
    color: '#d9e8f7',
    availableSlots: ['09:30', '11:30', '14:30'],
    languages: ['English', 'Sesotho'],
  },
];

const today = new Date();
const iso = (offset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export const initialAppointments: Appointment[] = [
  {
    id: 'appt-001', patientId: 'patient-toka', patientName: 'Toka Mokoena', doctorId: 'dr-sello', doctorName: 'Dr. Sello Nthunya', specialty: 'General Practitioner', clinic: 'HUBS Central Clinic', date: iso(1), time: '10:30', type: 'Consultation', status: 'confirmed', reason: 'Annual wellness check',
  },
  {
    id: 'appt-002', patientId: 'patient-toka', patientName: 'Toka Mokoena', doctorId: 'dr-mathepelo', doctorName: 'Dr. Mathepelo Mofokeng', specialty: 'Cardiologist', clinic: 'Maseru Heart Centre', date: iso(4), time: '14:00', type: 'Follow-up', status: 'pending', reason: 'Follow-up on blood pressure readings',
  },
  {
    id: 'appt-003', patientId: 'patient-mphonyane', patientName: 'Mphonyane Khubelu', doctorId: 'dr-sello', doctorName: 'Dr. Sello Nthunya', specialty: 'General Practitioner', clinic: 'HUBS Central Clinic', date: iso(0), time: '09:00', type: 'Consultation', status: 'confirmed', reason: 'Shortness of breath', notes: 'Patient complains of shortness of breath.',
  },
  {
    id: 'appt-004', patientId: 'patient-mphonyane', patientName: 'Mphonyane Khubelu', doctorId: 'dr-sello', doctorName: 'Dr. Sello Nthunya', specialty: 'General Practitioner', clinic: 'HUBS Central Clinic', date: iso(-10), time: '11:00', type: 'First visit', status: 'completed', reason: 'Initial consultation', notes: 'Discussed sleep, hydration, and follow-up plan.',
  },
  {
    id: 'appt-005', patientId: 'patient-toka', patientName: 'Toka Mokoena', doctorId: 'dr-kabelo', doctorName: 'Dr. Kabelo Rasekoai', specialty: 'Dermatologist', clinic: 'Maseru Skin & Wellness', date: iso(-24), time: '15:00', type: 'Consultation', status: 'completed', reason: 'Skin consultation', notes: 'Routine check-in completed.',
  },
];

export const initialReviews: Review[] = [
  { id: 'review-1', doctorId: 'dr-sello', patientName: 'Lerato P.', rating: 5, text: 'I never felt rushed. Dr. Sello explained every option in a way that made sense.', date: '2 weeks ago' },
  { id: 'review-2', doctorId: 'dr-sello', patientName: 'Mpho K.', rating: 5, text: 'The appointment started on time and the follow-up note was very helpful.', date: '1 month ago' },
  { id: 'review-3', doctorId: 'dr-mathepelo', patientName: 'Ntho M.', rating: 5, text: 'A calm, thorough consultation. I left knowing exactly what to do next.', date: '3 weeks ago' },
];

export const initialNotifications: AppNotification[] = [
  { id: 'note-1', title: 'Appointment confirmed', body: 'Your visit with Dr. Sello Nthunya is confirmed for tomorrow at 10:30.', time: '12 min ago', read: false, kind: 'appointment' },
  { id: 'note-2', title: 'A gentle reminder', body: 'Bring your latest blood pressure readings to your cardiology follow-up.', time: 'Yesterday', read: false, kind: 'reminder' },
  { id: 'note-3', title: 'Welcome to HUBS', body: 'You can search specialists, book visits, and keep every detail in one place.', time: '3 days ago', read: true, kind: 'system' },
];
