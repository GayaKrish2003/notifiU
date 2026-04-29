import React, { useEffect, useState } from 'react';
import api from '../services/api';
import EventCard from './EventCard';
import FilterBar from './FilterBar';
import NotificationModal from './NotificationModal';
import { Search } from 'lucide-react';

export type Role = 'student' | 'lecturer' | 'clubpresident' | 'superadmin';

interface DashboardProps { role: Role; setActiveTab?: (tab: string) => void; }
interface Filters { category: string; organizingClub: string; }
interface Notification { eventId: string; title: string; message: string; type: 'reminder' | 'attendance'; hasAttended?: boolean; }
interface NotificationState { isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; }

// Read logged-in student info from localStorage
const getLoggedInStudent = () => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return { studentId: '', name: '', phonenumber: '' };
        const parsed = JSON.parse(raw);
        return {
            studentId: parsed.studentId || '',
            name: parsed.name || '',
            phonenumber: parsed.phonenumber || parsed.phone || '',
        };
    } catch { return { studentId: '', name: '', phonenumber: '' }; }
};

const EventsDashboard: React.FC<DashboardProps> = ({ role, setActiveTab }) => {
    const [events, setEvents] = useState<any[]>([]);
    const [filters, setFilters] = useState<Filters>({ category: '', organizingClub: '' });
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
    const [notification, setNotification] = useState<NotificationState>({ isOpen: false, message: '', type: 'info' });
    const [searchQuery, setSearchQuery] = useState('');

    // Get real student ID from login session
    const loggedInStudent = getLoggedInStudent();
    const studentId = loggedInStudent.studentId;

    const fetchEvents = async () => {
        try {
            const params: Record<string, string> = { role, status: 'Upcoming' };
            if (filters.category) params.category = filters.category;
            if (filters.organizingClub) params.organizingClub = filters.organizingClub;
            const response = await api.get('/events', { params });
            setEvents(response.data);
        } catch (error) { console.error("Error fetching events", error); }
    };

    const fetchNotifications = async () => {
        if (role !== 'student' || !studentId) return;
        try {
            const response = await api.get('/events/user/notifications', { params: { role, studentId } });
            setNotifications(response.data);
        } catch (error) { console.error("Error fetching notifications", error); }
    };

    useEffect(() => { fetchEvents(); }, [filters.category, filters.organizingClub, role]);
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [role, studentId]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, [e.target.name]: e.target.value });
    const handleDismiss = (eventId: string, type: string) => setDismissedNotifications(p => [...p, `${eventId}-${type}`]);

    const activeNotifications = notifications.filter(n => !dismissedNotifications.includes(`${n.eventId}-${n.type}`));
    // NOTE: attendanceRequests is now handled by GlobalNotifications.tsx
    const regularReminders = activeNotifications.filter(n => n.type === 'reminder');

    const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="font-['Outfit',_sans-serif] bg-white rounded-3xl p-8 min-h-[80vh] w-full max-w-[1500px] mx-auto shadow-sm">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">EVENTS</h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mt-1">
                        <p className="text-[#FBB017] font-black text-[11px] uppercase tracking-widest">University Events Dashboard</p>
                        {(role === 'superadmin' || role === 'clubpresident') && (
                            <div className="flex items-center bg-[#EBECEF]/40 rounded-xl p-1 mt-2 md:mt-0">
                                <button className="bg-white text-[#FBB017] font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-sm cursor-default">
                                    Upcoming Events
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBB017] transition-colors" size={18} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className="bg-gray-50 border border-gray-100 rounded-[1.5rem] py-3.5 pl-14 pr-6 text-sm outline-none focus:bg-white focus:border-[#FBB017]/30 focus:shadow-xl text-[#2D3A5D] font-medium transition-all w-full xl:w-72" />
                </div>
            </div>

            {/* Reminder Modals (Retained for dashboard context) */}
            {regularReminders.map((n, i) => (
                <div key={`r-${i}`} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-10 w-full max-w-sm text-center shadow-2xl">
                        <div className="text-4xl mb-4">⏰</div>
                        <h2 className="text-[#FBB017] font-black text-xl uppercase tracking-tight mb-3">Event Reminder!</h2>
                        <p className="text-[#2D3A5D]/60 text-sm font-medium mb-8">{n.message}</p>
                        <button onClick={() => handleDismiss(n.eventId, n.type)} className="bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black px-10 py-3 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-95">Got it</button>
                    </div>
                </div>
            ))}

            <FilterBar onFilterChange={handleFilterChange} />

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <EventCard
                            key={event._id}
                            event={event}
                            role={role}
                            loggedInStudentId={studentId}
                            loggedInName={loggedInStudent.name}
                            loggedInPhone={loggedInStudent.phonenumber}
                            onRsvp={fetchEvents}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 text-center">
                    <h2 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.4em] uppercase">No Events Found</h2>
                    <p className="text-[#2D3A5D]/20 font-bold mt-3 tracking-widest text-sm">Events will appear here once created</p>
                </div>
            )}

            <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(p => ({ ...p, isOpen: false }))} />
        </div>
    );
};

export default EventsDashboard;
