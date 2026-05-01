import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationModal from './NotificationModal';
import { Calendar, MapPin, Users, Tag } from 'lucide-react';

interface RsvpEntry {
    name?: string;
    studentId: string;
    contactNumber: string;
    rsvpTime?: string;
}
interface AttendanceEntry { studentId: string; markedAt?: string; }
interface Event {
    _id: string; title: string; description: string; date: string; time: string;
    location: string; organizingClub: string; category: string; type: string;
    priority: 'Urgent' | 'Normal'; seatLimit: number;
    posterImage?: string;
    rsvpList: RsvpEntry[]; attendanceList: AttendanceEntry[];
}
interface EventCardProps {
    event: Event;
    role: string;
    // Real login data passed from EventsDashboard
    loggedInStudentId: string;
    loggedInName: string;
    loggedInPhone: string;
    onRsvp: () => void;
}
interface RsvpFormData { name: string; studentId: string; contactNumber: string; }
interface NotificationState { isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; }

const EventCard: React.FC<EventCardProps> = ({ event, role, loggedInStudentId, loggedInName, loggedInPhone, onRsvp }) => {
    const [showRsvpModal, setShowRsvpModal] = useState(false);
    const [notification, setNotification] = useState<NotificationState>({ isOpen: false, message: '', type: 'info' });
    const [rsvpData, setRsvpData] = useState<RsvpFormData>({
        name: loggedInName || '',
        studentId: loggedInStudentId || '',
        contactNumber: loggedInPhone || '07',
    });

    // Keep in sync if parent updates
    useEffect(() => {
        setRsvpData({
            name: loggedInName || '',
            studentId: loggedInStudentId || '',
            contactNumber: loggedInPhone || '07',
        });
    }, [loggedInStudentId, loggedInName, loggedInPhone]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'contactNumber') { if (/^\d*$/.test(value) && value.length <= 10) setRsvpData(p => ({ ...p, [name]: value })); }
        else if (name === 'studentId') { setRsvpData(p => ({ ...p, [name]: value })); }
        else setRsvpData(p => ({ ...p, [name]: value }));
    };

    const handleRsvpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!rsvpData.contactNumber.startsWith('07') || rsvpData.contactNumber.length !== 10) {
            setNotification({ isOpen: true, message: 'Contact Number must start with "07" and be 10 digits.', type: 'error' }); return;
        }
        if (!rsvpData.studentId.trim()) {
            setNotification({ isOpen: true, message: 'Student ID is required.', type: 'error' }); return;
        }
        try {
            await api.post(`/events/${event._id}/rsvp`, rsvpData);
            setShowRsvpModal(false);
            onRsvp();
            setNotification({ isOpen: true, message: 'RSVP Successful! You are registered.', type: 'success' });
            setTimeout(() => setNotification(p => ({ ...p, isOpen: false })), 2500);
        } catch (error: any) {
            setNotification({ isOpen: true, message: error.response?.data?.message || 'RSVP Failed', type: 'error' });
        }
    };

    const isFullyBooked = event.seatLimit > 0 && event.rsvpList.length >= event.seatLimit;
    const seatsLeft = event.seatLimit > 0 ? event.seatLimit - event.rsvpList.length : null;
    const alreadyRsvped = loggedInStudentId
        ? event.rsvpList.some(r => r.studentId === loggedInStudentId)
        : false;

    return (
        <>
            <div className={`bg-[#EBECEF]/40 hover:bg-white border border-transparent hover:border-[#FBB017]/20 rounded-[2.5rem] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group relative overflow-hidden ${event.priority === 'Urgent' ? 'border-red-200 bg-red-50/30' : ''}`}>
                
                {/* Poster Image or Fallback Header */}
                <div className="relative h-48 w-full overflow-hidden">
                    {event.posterImage ? (
                        <img 
                            src={event.posterImage} 
                            alt={event.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#FBB017]/20 to-[#FBB017]/5 flex items-center justify-center">
                            <div className="text-4xl opacity-20 group-hover:scale-125 transition-transform duration-500">
                                {event.type === 'Workshop' ? '🛠️' : '🎈'}
                            </div>
                        </div>
                    )}
                    {/* Priority Badge inside image */}
                    {event.priority === 'Urgent' && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">🔴 Urgent</div>
                    )}
                    {/* Category Overlay */}
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-[#FBB017] text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-lg shadow-[#FBB017]/20">{event.category}</span>
                    </div>
                </div>

                <div className="p-8">
                    {/* Type badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="border border-[#FBB017]/30 text-[#FBB017] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.15em]">{event.type}</span>
                        {alreadyRsvped && (
                            <span className="bg-green-100 text-green-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">✓ Registered</span>
                        )}
                    </div>

                {/* Title */}
                <h3 className="text-[#2D3A5D] font-black text-lg uppercase tracking-tight leading-tight group-hover:text-[#FBB017] transition-colors mb-4">{event.title}</h3>

                {/* Meta info */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-[#2D3A5D]/60 text-xs font-bold">
                        <Calendar size={13} className="text-[#FBB017]" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                    </div>
                    <div className="flex items-center gap-2 text-[#2D3A5D]/60 text-xs font-bold">
                        <MapPin size={13} className="text-[#FBB017]" />
                        {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-[#2D3A5D]/60 text-xs font-bold">
                        <Tag size={13} className="text-[#FBB017]" />
                        {event.organizingClub}
                    </div>
                </div>

                <p className="text-[#2D3A5D]/50 text-sm font-medium leading-relaxed mb-6">{event.description}</p>

                {/* Seat info + RSVP */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[#2D3A5D] text-xs font-black">
                            <Users size={14} className="text-[#FBB017]" />
                            {event.rsvpList.length}{event.seatLimit > 0 ? ` / ${event.seatLimit}` : ''} attending
                        </div>
                        {event.seatLimit > 0 && (
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${isFullyBooked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                {isFullyBooked ? '🔴 Full' : `🟢 ${seatsLeft} left`}
                            </span>
                        )}
                    </div>
                    {role === 'student' && (
                        alreadyRsvped ? (
                            <span className="text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-[0.1em] bg-green-100 text-green-700">✓ Registered</span>
                        ) : (
                            <button
                                onClick={() => setShowRsvpModal(true)}
                                disabled={isFullyBooked}
                                className={`text-[10px] font-black px-6 py-2.5 rounded-xl uppercase tracking-[0.1em] transition-all ${isFullyBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] shadow-lg shadow-[#FBB017]/20 hover:scale-105 active:scale-95'}`}
                            >
                                {isFullyBooked ? 'Fully Booked' : 'RSVP Now'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>



            {/* RSVP Modal */}
            {showRsvpModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRsvpModal(false)}>
                    <div className="bg-white rounded-[2rem] p-10 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-[#2D3A5D] font-black text-xl uppercase tracking-tight mb-1">RSVP</h3>
                        <p className="text-[#FBB017] font-black text-sm uppercase tracking-widest mb-8">{event.title}</p>
                        <form onSubmit={handleRsvpSubmit} className="space-y-5">
                            {[
                                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name', value: rsvpData.name, readOnly: !!loggedInName },
                                { label: 'Student ID', name: 'studentId', type: 'text', placeholder: 'ITxxxxxxxx', value: rsvpData.studentId, readOnly: !!loggedInStudentId },
                                { label: 'Contact Number (07xxxxxxxx)', name: 'contactNumber', type: 'text', placeholder: '07xxxxxxxx', value: rsvpData.contactNumber, readOnly: false },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-[#2D3A5D] text-[11px] font-black uppercase tracking-widest mb-2">{field.label}</label>
                                    <input
                                        type={field.type} name={field.name} value={field.value}
                                        onChange={handleInputChange} required placeholder={field.placeholder}
                                        readOnly={field.readOnly}
                                        className={`w-full border-none rounded-2xl px-5 py-3.5 text-sm font-medium text-[#2D3A5D] focus:ring-2 focus:ring-[#FBB017] outline-none transition-all ${field.readOnly ? 'bg-green-50 text-green-700' : 'bg-[#F0F2F5]'}`}
                                    />
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black py-3.5 rounded-2xl text-sm uppercase tracking-widest shadow-lg transition-all active:scale-95">Confirm RSVP</button>
                                <button type="button" onClick={() => setShowRsvpModal(false)} className="flex-1 bg-[#1A1C2C] hover:bg-[#2D3A5D] text-white font-black py-3.5 rounded-2xl text-sm uppercase tracking-widest transition-all active:scale-95">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(p => ({ ...p, isOpen: false }))} />
        </>
    );
};

export default EventCard;
