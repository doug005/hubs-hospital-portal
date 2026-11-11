import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useHubsStore } from './lib/store';
import type { Appointment, AppointmentStatus, AppointmentType, Doctor, Role } from './types';

const specialtyOptions = ['All specialties', 'General Practitioner', 'Cardiologist', 'Dermatologist', 'Paediatrician'];
const appointmentTypes: AppointmentType[] = ['Consultation', 'Follow-up', 'First visit'];
const dayOffset = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};
const formatDate = (value: string, withYear = false) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) }).format(new Date(`${value}T00:00:00`));
const formatLongDate = (value: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${value}T00:00:00`));
const formatToday = () => new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

function Logo() {
  return <div className="brand-lockup"><span className="brand-mark"><span /></span><span className="brand-name">HUBS</span></div>;
}

function Avatar({ initials, color = '#d7efe5', size = 'md' }: { initials: string; color?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${size}`} style={{ background: color }}>{initials}</span>;
}

function StatusChip({ status }: { status: AppointmentStatus }) {
  const labels: Record<AppointmentStatus, string> = { confirmed: 'Confirmed', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' };
  return <span className={`status-chip status-${status}`}><span className="status-dot" />{labels[status]}</span>;
}

function StarRating({ rating, count, compact = false }: { rating: number; count?: number; compact?: boolean }) {
  return <span className={`rating ${compact ? 'rating-compact' : ''}`}><span className="stars">★★★★★</span><strong>{rating.toFixed(1)}</strong>{count !== undefined && <small>({count})</small>}</span>;
}

function Sidebar({ role, active, onNavigate, onLogout, currentUser, onClose }: { role: Role; active: string; onNavigate: (value: string) => void; onLogout: () => void; currentUser: { name: string; avatar: string }; onClose?: () => void }) {
  const patientItems = [
    { id: 'find', label: 'Find a doctor', icon: Search },
    { id: 'appointments', label: 'My appointments', icon: CalendarDays },
    { id: 'reminders', label: 'Reminders', icon: Bell },
  ];
  const doctorItems = [
    { id: 'schedule', label: 'Clinic schedule', icon: LayoutDashboard },
    { id: 'patients', label: 'My patients', icon: UsersRound },
    { id: 'profile', label: 'My public profile', icon: UserRound },
    { id: 'reminders', label: 'Notifications', icon: Bell },
  ];
  const items = role === 'patient' ? patientItems : doctorItems;
  return <aside className="sidebar">
    <div className="sidebar-top"><Logo /><button className="icon-button mobile-only" onClick={onClose} aria-label="Close navigation"><X size={19} /></button></div>
    <div className="side-profile"><Avatar initials={currentUser.avatar} color="#c6e9da" size="lg" /><div><strong>{currentUser.name}</strong><span>{role === 'patient' ? 'Patient account' : 'Doctor account'}</span></div><button className="more-button" aria-label="Account options"><MoreHorizontal size={18} /></button></div>
    <div className="side-label">Workspace</div>
    <nav className="side-nav">{items.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'active' : ''} onClick={() => { onNavigate(id); onClose?.(); }}><Icon size={18} strokeWidth={active === id ? 2.4 : 1.8} /><span>{label}</span>{active === id && <ChevronRight size={15} className="nav-chevron" />}</button>)}</nav>
    <div className="sidebar-bottom"><div className="privacy-note"><ShieldCheck size={17} /><div><strong>Your care, private</strong><span>Protected by HUBS security</span></div></div><button className="logout-button" onClick={onLogout}><LogOut size={17} /><span>Log out</span></button></div>
  </aside>;
}

function TopBar({ title, eyebrow, unread, onNotify, onMenu, onProfile }: { title: string; eyebrow?: string; unread: number; onNotify: () => void; onMenu: () => void; onProfile: () => void }) {
  return <header className="topbar"><button className="icon-button mobile-only" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div><div className="eyebrow">{eyebrow || 'HUBS care portal'}</div><h1>{title}</h1></div><div className="top-actions"><button className="notification-button" onClick={onNotify} aria-label="Open reminders"><Bell size={19} />{unread > 0 && <span>{unread}</span>}</button><button className="top-profile" onClick={onProfile}><span className="top-profile-avatar"><UserRound size={16} /></span><ChevronDown size={15} /></button></div></header>;
}

function EmptyState({ icon: Icon, title, body, action }: { icon: typeof Search; title: string; body: string; action?: React.ReactNode }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={23} /></span><h3>{title}</h3><p>{body}</p>{action}</div>;
}

function Modal({ title, eyebrow, onClose, children, wide = false }: { title: string; eyebrow?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true"><div className="modal-header"><div><div className="eyebrow">{eyebrow || 'HUBS workspace'}</div><h2>{title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button></div>{children}</section></div>;
}

function LoginScreen() {
  const { signIn, createAccount } = useHubsStore();
  const [role, setRole] = useState<Role>('patient');
  const [mode, setMode] = useState<'signIn' | 'create'>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const chooseRole = (value: Role) => { setRole(value); setError(''); };
  const switchMode = (value: 'signIn' | 'create') => { setMode(value); setRole(value === 'create' ? 'patient' : role); setError(''); setName(''); setEmail(''); setPassword(''); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError('');
    try { if (mode === 'create') await createAccount(name, email, password, role); else await signIn(email, password, role); } catch (reason) { setError(reason instanceof Error ? reason.message : mode === 'create' ? 'We could not create your account.' : 'We could not sign you in.'); } finally { setBusy(false); }
  };
  return <main className="login-page"><div className="login-ambient ambient-one" /><div className="login-ambient ambient-two" /><section className="login-intro"><div className="intro-top"><Logo /><span className="secure-pill"><ShieldCheck size={15} /> Secure medical portal</span></div><div className="intro-copy"><div className="eyebrow eyebrow-light">A clearer way to care</div><h1>Find the right care.<br /><em>Keep it close.</em></h1><p>HUBS brings doctor discovery, appointments, and the details around your care into one calm, connected place.</p></div><div className="intro-footer"><div className="pulse-line"><span className="pulse-point" /><span /><span /><span /><span className="pulse-point" /></div><p>Designed for patients and the people who care for them.</p></div></section><section className="login-panel"><div className="login-card"><div className="mobile-brand"><Logo /></div><div className="eyebrow">{mode === 'create' ? 'Join HUBS' : 'Welcome back'}</div><h2>{mode === 'create' ? 'Create your account' : 'Sign in to HUBS'}</h2><p className="login-subtitle">{mode === 'create' ? 'Set up your secure care workspace.' : 'Choose your workspace to continue.'}</p><div className="role-switch" role="tablist" aria-label="Choose account role"><button type="button" className={role === 'patient' ? 'selected' : ''} onClick={() => chooseRole('patient')}><UserRound size={17} /> Patient</button>{mode === 'signIn' && <button type="button" className={role === 'doctor' ? 'selected' : ''} onClick={() => chooseRole('doctor')}><Stethoscope size={17} /> Doctor / Admin</button>}</div>{mode === 'create' && <p className="registration-note"><ShieldCheck size={14} /> Patient registration is open. Doctor accounts are created by a HUBS administrator.</p>}<form onSubmit={submit} className="login-form">{mode === 'create' && <label>Full name<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Your full name" /></label>}<label>Email or username<input value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="you@example.com" /></label><label>Password<div className="password-field"><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'create' ? 'new-password' : 'current-password'} placeholder={mode === 'create' ? 'At least 6 characters' : 'Enter password'} /><span>•••</span></div></label>{error && <div className="form-error"><CircleAlert size={16} />{error}</div>}<button className="primary-button button-wide" disabled={busy}>{busy ? mode === 'create' ? 'Creating account…' : 'Signing you in…' : mode === 'create' ? 'Create account' : 'Sign in'}<ArrowRight size={17} /></button></form><p className="account-prompt">{mode === 'create' ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={() => switchMode(mode === 'create' ? 'signIn' : 'create')}>{mode === 'create' ? 'Sign in' : 'Create one'}</button></p><p className="login-legal">By continuing, you agree to the HUBS <button type="button">privacy policy</button> and <button type="button">terms of care</button>.</p></div></section></main>;
}

function BookingModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const { currentUser, bookAppointment } = useHubsStore();
  const [date, setDate] = useState(dayOffset(1));
  const [time, setTime] = useState(doctor.availableSlots[0]);
  const [type, setType] = useState<AppointmentType>('Consultation');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;
    bookAppointment({ patientId: currentUser.id, patientName: currentUser.name, doctorId: doctor.id, doctorName: doctor.name, specialty: doctor.specialty, clinic: doctor.clinic, date, time, type, reason });
    setConfirmed(true);
  };
  if (confirmed) return <Modal title="You’re all set" eyebrow="Appointment confirmed" onClose={onClose}><div className="success-panel"><span className="success-check"><Check size={23} /></span><div><h3>{formatDate(date, true)} · {time}</h3><p>Your appointment with <strong>{doctor.name}</strong> at {doctor.clinic} is confirmed.</p></div></div><div className="modal-summary"><div><span>Appointment type</span><strong>{type}</strong></div><div><span>Reminder</span><strong>24 hours before</strong></div></div><button className="primary-button button-wide" onClick={onClose}>Done <ArrowRight size={17} /></button></Modal>;
  return <Modal title="Book your appointment" eyebrow="Choose a time that works for you" onClose={onClose}><div className="doctor-modal-summary"><Avatar initials={doctor.initials} color={doctor.color} size="lg" /><div><h3>{doctor.name}</h3><p>{doctor.specialty} · {doctor.clinic}</p><StarRating rating={doctor.rating} count={doctor.reviewCount} compact /></div></div><form onSubmit={submit} className="modal-form"><label>Appointment date<input type="date" value={date} min={dayOffset(0)} onChange={(event) => setDate(event.target.value)} /></label><div><label>Available times</label><div className="slot-grid">{doctor.availableSlots.map((slot) => <button type="button" key={slot} className={`slot-button ${time === slot ? 'selected' : ''}`} onClick={() => setTime(slot)}><Clock3 size={14} />{slot}</button>)}</div></div><label>Appointment type<select value={type} onChange={(event) => setType(event.target.value as AppointmentType)}>{appointmentTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>What would you like help with? <span className="optional">Optional</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="A short note can help your doctor prepare." rows={3} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Not now</button><button className="primary-button">Confirm appointment <Check size={17} /></button></div></form></Modal>;
}

function RescheduleModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const { rescheduleAppointment } = useHubsStore();
  const [date, setDate] = useState(dayOffset(2));
  const [time, setTime] = useState('10:30');
  const [done, setDone] = useState(false);
  const submit = (event: React.FormEvent) => { event.preventDefault(); rescheduleAppointment(appointment.id, date, time); setDone(true); };
  return <Modal title={done ? 'Reschedule requested' : 'Choose a new time'} eyebrow="Keep your care moving" onClose={onClose}>{done ? <><div className="success-panel"><span className="success-check"><Check size={23} /></span><div><h3>New time requested</h3><p>{appointment.doctorName} will confirm your new time. We’ll keep the original details visible until then.</p></div></div><button className="primary-button button-wide" onClick={onClose}>Back to appointments</button></> : <form onSubmit={submit} className="modal-form"><div className="reschedule-context"><CalendarDays size={18} /><div><strong>{appointment.doctorName}</strong><span>Currently {formatDate(appointment.date)} at {appointment.time}</span></div></div><label>New date<input type="date" value={date} min={dayOffset(0)} onChange={(event) => setDate(event.target.value)} /></label><label>New time<select value={time} onChange={(event) => setTime(event.target.value)}><option>09:00</option><option>10:30</option><option>13:30</option><option>15:00</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Request new time <ArrowRight size={17} /></button></div></form>}</Modal>;
}

function DoctorCard({ doctor, onBook, onView }: { doctor: Doctor; onBook: (doctor: Doctor) => void; onView: (doctor: Doctor) => void }) {
  return <article className="doctor-card"><div className="doctor-card-top"><Avatar initials={doctor.initials} color={doctor.color} size="lg" /><button className="more-button" aria-label={`More options for ${doctor.name}`}><MoreHorizontal size={19} /></button></div><div className="doctor-card-info"><div className="available-label"><span /> Available today</div><h3>{doctor.name}</h3><p className="doctor-specialty">{doctor.specialty}</p><p className="doctor-clinic"><span className="clinic-dot" />{doctor.clinic}</p><StarRating rating={doctor.rating} count={doctor.reviewCount} /></div><div className="card-divider" /><div className="slots-heading"><span>Next available</span><button onClick={() => onView(doctor)}>View profile <ArrowRight size={14} /></button></div><div className="slot-row">{doctor.availableSlots.slice(0, 3).map((slot) => <button key={slot} onClick={() => onBook(doctor)}>{slot}</button>)}</div></article>;
}

function PatientFind({ onBook, onView }: { onBook: (doctor: Doctor) => void; onView: (doctor: Doctor) => void }) {
  const { doctors } = useHubsStore();
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const filtered = doctors.filter((doctor) => doctor.name.toLowerCase().includes(query.toLowerCase()) && (specialty === 'All specialties' || doctor.specialty === specialty));
  return <><section className="hero-panel"><div className="hero-copy"><div className="eyebrow eyebrow-green">Find care that fits your day</div><h2>Who would you like<br /><em>to see?</em></h2><p>Search trusted specialists and choose a time that works for you.</p></div><div className="hero-orbit"><HeartPulse size={46} /><span className="orbit-dot orbit-one" /><span className="orbit-dot orbit-two" /><span className="orbit-dot orbit-three" /></div></section><section className="search-panel"><div className="search-field"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor name" /></div><div className="select-field"><Stethoscope size={18} /><select value={specialty} onChange={(event) => setSpecialty(event.target.value)}>{specialtyOptions.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={15} /></div><button className="primary-button search-submit"><Search size={17} /> Search doctors</button></section><div className="section-heading"><div><div className="eyebrow">Based on your search</div><h2>{filtered.length} specialists <span>available today</span></h2></div><button className="quiet-button"><Settings2 size={16} /> Filters</button></div>{filtered.length ? <div className="doctor-grid">{filtered.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} onBook={onBook} onView={onView} />)}</div> : <EmptyState icon={Search} title="No specialists found" body="Try a different name or specialty. We’ll help you find the right fit." />}</>;
}

function AppointmentCard({ appointment, onCancel, onReschedule }: { appointment: Appointment; onCancel: (appointment: Appointment) => void; onReschedule: (appointment: Appointment) => void }) {
  return <article className={`appointment-card appointment-${appointment.status}`}><div className="appointment-date"><strong>{new Date(`${appointment.date}T00:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(`${appointment.date}T00:00:00`))}</span></div><div className="appointment-main"><div className="appointment-heading"><div><h3>{appointment.doctorName}</h3><p>{appointment.specialty} · {appointment.clinic}</p></div><StatusChip status={appointment.status} /></div><div className="appointment-meta"><span><Clock3 size={15} /> {appointment.time}</span><span><FileText size={15} /> {appointment.type}</span></div>{appointment.reason && <p className="appointment-reason">“{appointment.reason}”</p>}{appointment.status === 'confirmed' || appointment.status === 'pending' ? <div className="appointment-actions"><button className="text-button" onClick={() => onReschedule(appointment)}>Reschedule <ArrowRight size={14} /></button><button className="danger-text-button" onClick={() => onCancel(appointment)}>Cancel</button></div> : appointment.notes && <p className="private-note"><ShieldCheck size={14} /> {appointment.notes}</p>}</div></article>;
}

function PatientAppointments() {
  const { currentUser, appointments, cancelAppointment } = useHubsStore();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [cancelled, setCancelled] = useState<Appointment | null>(null);
  const own = appointments.filter((appointment) => appointment.patientId === currentUser?.id && appointment.status !== 'cancelled');
  const upcoming = own.filter((appointment) => appointment.status === 'confirmed' || appointment.status === 'pending');
  const past = own.filter((appointment) => appointment.status === 'completed');
  return <><div className="page-intro-row"><div><div className="eyebrow">Your care timeline</div><h2>My appointments</h2><p className="subcopy">Everything you have coming up, in one calm view.</p></div><div className="mini-stat"><span>Next visit</span><strong>{upcoming[0] ? formatDate(upcoming[0].date) : 'None booked'}</strong><small>{upcoming[0]?.time || 'Find a specialist to begin'}</small></div></div><div className="tab-row"><button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming <span>{upcoming.length}</span></button><button className={tab === 'past' ? 'active' : ''} onClick={() => setTab('past')}>Past visits <span>{past.length}</span></button></div><div className="appointment-list">{(tab === 'upcoming' ? upcoming : past).map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} onCancel={setCancelled} onReschedule={setReschedule} />)}</div>{(tab === 'upcoming' ? upcoming : past).length === 0 && <EmptyState icon={CalendarDays} title={tab === 'upcoming' ? 'No upcoming appointments' : 'No past visits yet'} body={tab === 'upcoming' ? 'Start by finding a specialist who can help.' : 'Your completed visits will appear here.'} />}{reschedule && <RescheduleModal appointment={reschedule} onClose={() => setReschedule(null)} />}{cancelled && <Modal title="Cancel this appointment?" eyebrow="One more check" onClose={() => setCancelled(null)}><div className="warning-panel"><CircleAlert size={20} /><p>You’re about to cancel your {cancelled.type.toLowerCase()} with <strong>{cancelled.doctorName}</strong> on {formatDate(cancelled.date)} at {cancelled.time}.</p></div><div className="modal-actions"><button className="secondary-button" onClick={() => setCancelled(null)}>Keep appointment</button><button className="danger-button" onClick={() => { cancelAppointment(cancelled.id); setCancelled(null); }}>Cancel appointment</button></div></Modal>}</>;
}

function Reminders() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useHubsStore();
  const unread = notifications.filter((notification) => !notification.read).length;
  return <><div className="page-intro-row"><div><div className="eyebrow">Stay in the loop</div><h2>Reminders & notes</h2><p className="subcopy">Helpful nudges around the appointments that matter.</p></div>{unread > 0 && <button className="quiet-button" onClick={markAllNotificationsRead}><Check size={16} /> Mark all read</button>}</div><div className="reminders-layout"><div className="reminder-list">{notifications.map((notification) => <button key={notification.id} className={`reminder-card ${notification.read ? 'read' : ''}`} onClick={() => markNotificationRead(notification.id)}><span className={`reminder-icon reminder-${notification.kind}`}>{notification.kind === 'appointment' ? <CalendarDays size={18} /> : notification.kind === 'reminder' ? <Bell size={18} /> : <Sparkles size={18} />}</span><span className="reminder-content"><span className="reminder-top"><strong>{notification.title}</strong>{!notification.read && <i />}</span><span>{notification.body}</span><small>{notification.time}</small></span><ChevronRight size={17} /></button>)}</div><aside className="reminder-side-card"><span className="side-card-icon"><Bell size={20} /></span><div className="eyebrow">A little ahead</div><h3>Small reminders,<br /><em>less to remember.</em></h3><p>HUBS keeps appointment details close so you can focus on getting ready for care.</p></aside></div></>;
}

function ProfileModal({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) {
  const { reviews } = useHubsStore();
  const doctorReviews = reviews.filter((review) => review.doctorId === doctor.id);
  return <Modal title={doctor.name} eyebrow="Public doctor profile" onClose={onClose} wide><div className="public-profile-head"><Avatar initials={doctor.initials} color={doctor.color} size="lg" /><div><div className="available-label"><span /> Taking appointments</div><h3>{doctor.name}</h3><p>{doctor.specialty} · {doctor.experience}</p><StarRating rating={doctor.rating} count={doctor.reviewCount} /></div><div className="profile-stat"><strong>{doctor.languages.length}</strong><span>languages</span></div></div><div className="profile-grid"><div><div className="eyebrow">About</div><p className="profile-bio">{doctor.bio}</p><div className="profile-details"><span><Activity size={16} />{doctor.clinic}</span><span><MessageCircle size={16} />{doctor.languages.join(' · ')}</span></div></div><div className="review-column"><div className="eyebrow">Recent patient reviews</div>{doctorReviews.map((review) => <div className="review" key={review.id}><div className="review-top"><strong>{review.patientName}</strong><span>{review.date}</span></div><StarRating rating={review.rating} compact /><p>“{review.text}”</p></div>)}</div></div></Modal>;
}

function PatientWorkspace() {
  const { currentUser, notifications, signOutUser } = useHubsStore();
  const [active, setActive] = useState('find');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const unread = notifications.filter((notification) => !notification.read).length;
  return <div className="app-shell"><div className={`sidebar-wrap ${mobileOpen ? 'open' : ''}`}><Sidebar role="patient" active={active} onNavigate={setActive} onLogout={signOutUser} currentUser={currentUser!} onClose={() => setMobileOpen(false)} /></div>{mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" /> }<main className="workspace"><TopBar title={active === 'find' ? 'Find a doctor' : active === 'appointments' ? 'My appointments' : 'Reminders & notes'} eyebrow={active === 'find' ? 'Patient workspace' : 'Your care timeline'} unread={unread} onNotify={() => setActive('reminders')} onMenu={() => setMobileOpen(true)} onProfile={() => setActive('appointments')} /><div className="workspace-content">{active === 'find' && <PatientFind onBook={setBookingDoctor} onView={setProfileDoctor} />}{active === 'appointments' && <PatientAppointments />}{active === 'reminders' && <Reminders />}</div></main>{bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} />}{profileDoctor && <ProfileModal doctor={profileDoctor} onClose={() => setProfileDoctor(null)} />}</div>;
}

function DoctorSchedule({ doctor }: { doctor: Doctor }) {
  const { appointments, dutyStatus, setDutyStatus, addAvailability } = useHubsStore();
  const [addOpen, setAddOpen] = useState(false);
  const [slot, setSlot] = useState('16:30');
  const own = appointments.filter((appointment) => appointment.doctorId === doctor.id && appointment.date === dayOffset(0) && appointment.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time));
  const upcomingSlots = doctor.availableSlots.filter((value) => !own.some((appointment) => appointment.time === value));
  return <><section className="schedule-hero"><div><div className="eyebrow eyebrow-green">{formatToday()}</div><h2>Your clinic, <em>at a glance.</em></h2><p>Keep the day moving with a clear view of who is coming in and what they need.</p></div><div className="duty-control"><span className={dutyStatus ? 'duty-dot on' : 'duty-dot'} /><div><strong>{dutyStatus ? 'On duty' : 'Off duty'}</strong><span>Visible to patients</span></div><button className={dutyStatus ? 'toggle on' : 'toggle'} onClick={() => setDutyStatus(!dutyStatus)} aria-label="Toggle duty status"><span /></button></div></section><div className="schedule-toolbar"><div className="date-control"><button aria-label="Previous day"><ChevronRight size={17} className="rotate-180" /></button><div><span>Today</span><strong>{formatDate(dayOffset(0), true)}</strong></div><button aria-label="Next day"><ChevronRight size={17} /></button></div><button className="primary-button" onClick={() => setAddOpen(true)}><Plus size={17} /> Add availability</button></div><section className="timeline-card"><div className="timeline-heading"><div><div className="eyebrow">Daily schedule</div><h3>{own.length} {own.length === 1 ? 'appointment' : 'appointments'} today</h3></div><div className="legend"><span><i className="legend-confirmed" />Confirmed</span><span><i className="legend-pending" />Pending</span></div></div>{own.length ? <div className="timeline">{own.map((appointment) => <div className="timeline-item" key={appointment.id}><div className="timeline-time">{appointment.time}<span>{appointment.type}</span></div><div className="timeline-line"><span className="timeline-marker" /></div><div className="timeline-appointment"><div className="timeline-person"><Avatar initials={appointment.patientName.split(' ').map((part) => part[0]).join('').slice(0, 2)} color="#d9e8f7" size="md" /><div><h4>{appointment.patientName}</h4><p>{appointment.reason || 'General consultation'}</p></div></div><StatusChip status={appointment.status} /></div></div>)}</div> : <EmptyState icon={CalendarDays} title="A quiet clinic today" body="Add availability so patients can find a time that works." />}</section>{addOpen && <Modal title="Add availability" eyebrow="Open a new appointment slot" onClose={() => setAddOpen(false)}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); addAvailability(doctor.id, slot); setAddOpen(false); }}><div className="info-panel"><Clock3 size={18} /><p>Patients will see this slot on your public profile as soon as it is added.</p></div><label>Time<select value={slot} onChange={(event) => setSlot(event.target.value)}>{['08:30', '09:00', '10:30', '11:30', '13:30', '14:00', '15:00', '16:30'].map((value) => <option key={value} value={value} disabled={doctor.availableSlots.includes(value)}>{value}{doctor.availableSlots.includes(value) ? ' · already open' : ''}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setAddOpen(false)}>Cancel</button><button className="primary-button">Add slot <Plus size={17} /></button></div></form></Modal>}</>;
}

function DoctorPatients({ doctor }: { doctor: Doctor }) {
  const { appointments, updateAppointmentStatus, updateClinicalNote } = useHubsStore();
  const [editing, setEditing] = useState<string | null>(null);
  const own = appointments.filter((appointment) => appointment.doctorId === doctor.id).sort((a, b) => b.date.localeCompare(a.date));
  return <><div className="page-intro-row"><div><div className="eyebrow">Care relationships</div><h2>My patients</h2><p className="subcopy">Appointments and clinical context, kept together.</p></div><div className="mini-stat"><span>Total patients</span><strong>{new Set(own.map((item) => item.patientId)).size}</strong><small>Across recent visits</small></div></div><section className="patient-table-card"><div className="table-toolbar"><div className="search-field compact"><Search size={17} /><input placeholder="Search patients" /></div><button className="quiet-button"><Settings2 size={16} /> Filter</button></div><div className="patient-table"><div className="patient-table-head"><span>Patient</span><span>Appointment</span><span>Clinical note</span><span>Status</span><span /></div>{own.map((appointment) => <div className="patient-row" key={appointment.id}><div className="patient-cell"><Avatar initials={appointment.patientName.split(' ').map((part) => part[0]).join('').slice(0, 2)} color="#d7efe5" size="sm" /><div><strong>{appointment.patientName}</strong><small>{appointment.specialty}</small></div></div><div className="patient-visit"><strong>{formatDate(appointment.date)}</strong><small>{appointment.time} · {appointment.type}</small></div><div className="patient-note">{editing === appointment.id ? <textarea autoFocus defaultValue={appointment.notes || ''} onBlur={(event) => { updateClinicalNote(appointment.id, event.target.value); setEditing(null); }} /> : <button onClick={() => setEditing(appointment.id)}>{appointment.notes || 'Add a clinical note'}<Pencil size={13} /></button>}</div><div><select className={`status-select status-${appointment.status}`} value={appointment.status} onChange={(event) => updateAppointmentStatus(appointment.id, event.target.value as AppointmentStatus)}><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><button className="more-button" aria-label="Patient actions"><MoreHorizontal size={18} /></button></div>)}</div></section></>;
}

function DoctorProfile({ doctor }: { doctor: Doctor }) {
  const { reviews, updateDoctor } = useHubsStore();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(doctor.bio);
  const doctorReviews = reviews.filter((review) => review.doctorId === doctor.id);
  return <><div className="page-intro-row"><div><div className="eyebrow">How patients see you</div><h2>My public profile</h2><p className="subcopy">A clear introduction helps the right patients choose you.</p></div><button className="primary-button" onClick={() => { if (editing) updateDoctor(doctor.id, { bio }); setEditing(!editing); }}>{editing ? <><Check size={17} /> Save profile</> : <><Pencil size={17} /> Edit profile</>}</button></div><section className="profile-preview-card"><div className="public-profile-head"><Avatar initials={doctor.initials} color={doctor.color} size="lg" /><div><div className="available-label"><span /> Taking appointments</div><h3>{doctor.name}</h3><p>{doctor.specialty} · {doctor.experience}</p><StarRating rating={doctor.rating} count={doctor.reviewCount} /></div><div className="profile-stat"><strong>{doctor.availableSlots.length}</strong><span>open slots</span></div></div><div className="profile-preview-body"><div><div className="eyebrow">About me</div>{editing ? <textarea className="profile-editor" value={bio} onChange={(event) => setBio(event.target.value)} rows={5} /> : <p className="profile-bio">{doctor.bio}</p>}<div className="profile-details"><span><Activity size={16} />{doctor.clinic}</span><span><MessageCircle size={16} />{doctor.languages.join(' · ')}</span></div></div><div className="review-column"><div className="eyebrow">Recent patient reviews</div>{doctorReviews.length ? doctorReviews.map((review) => <div className="review" key={review.id}><div className="review-top"><strong>{review.patientName}</strong><span>{review.date}</span></div><StarRating rating={review.rating} compact /><p>“{review.text}”</p></div>) : <p className="muted-copy">Reviews from completed appointments will appear here.</p>}</div></div></section></>;
}

function DoctorWorkspace() {
  const { currentUser, doctors, notifications, signOutUser } = useHubsStore();
  const doctor = doctors.find((item) => item.id === currentUser?.id.replace('doctor-', 'dr-')) || doctors[0];
  const [active, setActive] = useState('schedule');
  const [mobileOpen, setMobileOpen] = useState(false);
  const unread = notifications.filter((notification) => !notification.read).length;
  return <div className="app-shell"><div className={`sidebar-wrap ${mobileOpen ? 'open' : ''}`}><Sidebar role="doctor" active={active} onNavigate={setActive} onLogout={signOutUser} currentUser={currentUser!} onClose={() => setMobileOpen(false)} /></div>{mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}<main className="workspace"><TopBar title={active === 'schedule' ? 'Clinic schedule' : active === 'patients' ? 'My patients' : active === 'profile' ? 'My public profile' : 'Notifications'} eyebrow="Doctor workspace" unread={unread} onNotify={() => setActive('reminders')} onMenu={() => setMobileOpen(true)} onProfile={() => setActive('profile')} /><div className="workspace-content">{active === 'schedule' && <DoctorSchedule doctor={doctor} />}{active === 'patients' && <DoctorPatients doctor={doctor} />}{active === 'profile' && <DoctorProfile doctor={doctor} />}{active === 'reminders' && <Reminders />}</div></main></div>;
}

export default function App() {
  const { currentUser } = useHubsStore();
  if (!currentUser) return <LoginScreen />;
  return currentUser.role === 'patient' ? <PatientWorkspace /> : <DoctorWorkspace />;
}
