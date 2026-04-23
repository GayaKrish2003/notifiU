import React, { useState, useEffect } from 'react';
import api from '../services/api';
import EventForm from './EventForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import NotificationModal from './NotificationModal';
import { Eye, EyeOff, Pencil, Trash2, FileText, FileSpreadsheet, Info } from 'lucide-react';
import type { Role } from './EventsDashboard';

interface AdminPanelProps { role: Role; isHistory?: boolean; setActiveTab?: (tab: string) => void; }
interface RsvpEntry { name?: string; studentId: string; contactNumber?: string; rsvpTime?: string; }
interface AttendanceEntry { studentId: string; markedAt?: string; }
interface Event {
    _id: string; title: string; description: string; date: string; time: string;
    location: string; organizingClub: string; category: string;
    type: 'Event' | 'Workshop'; priority: 'Normal' | 'Urgent';
    seatLimit: number; creatorRole: 'superadmin' | 'clubpresident' | 'lecturer';
    posterImage?: string;
    rsvpList: RsvpEntry[]; attendanceList: AttendanceEntry[];
}
interface NotificationState { isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; }

const AdminEventsPanel: React.FC<AdminPanelProps> = ({ role, isHistory = false, setActiveTab }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [viewingAttendees, setViewingAttendees] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationState>({ isOpen: false, message: '', type: 'info' });

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events', { params: { role, status: isHistory ? 'History' : 'Upcoming' } });
            let filtered: Event[] = response.data;
            if (role === 'lecturer') filtered = filtered.filter(e => e.type === 'Workshop' || e.creatorRole === 'lecturer');
            setEvents(filtered);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchEvents(); }, [role, isHistory]);

    const exportToPDF = (event: Event) => {
        const doc = new jsPDF();
        doc.text(`${event.title} - Attendees Report`, 14, 15);
        autoTable(doc, {
            head: [["Name", "Student ID", "Contact", "RSVP Time", "Attendance"]],
            body: event.rsvpList.map(r => [r.name || '-', r.studentId, r.contactNumber || '-', r.rsvpTime ? new Date(r.rsvpTime).toLocaleString() : '-', event.attendanceList.some(a => String(a.studentId) === String(r.studentId)) ? 'Yes' : 'No']),
            startY: 20
        });
        doc.save(`${event.title}_Attendees.pdf`);
    };

    const exportToExcel = (event: Event) => {
        if (!event.rsvpList.length) { setNotification({ isOpen: true, message: "No attendees to export", type: 'error' }); return; }
        const ws = XLSX.utils.json_to_sheet(event.rsvpList.map(r => ({ Name: r.name || '-', 'Student ID': r.studentId, Contact: r.contactNumber || '-', 'RSVP Time': r.rsvpTime ? new Date(r.rsvpTime).toLocaleString() : '-', Attendance: event.attendanceList.some(a => String(a.studentId) === String(r.studentId)) ? 'Yes' : 'No' })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        XLSX.writeFile(wb, `${event.title}_Attendees.xlsx`);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this event?')) {
            try { await api.delete(`/events/${id}`); fetchEvents(); if (editingEvent?._id === id) setEditingEvent(null); }
            catch (e) { console.error(e); }
        }
    };

    return (
        <div className="font-['Outfit',_sans-serif] bg-white rounded-3xl p-8 min-h-[80vh] w-full max-w-[1500px] mx-auto shadow-sm">
            {/* Page Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-[#2D3A5D]/10 tracking-[0.3em] uppercase">
                    {isHistory ? 'HISTORY' : 'MANAGE'}
                </h1>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mt-1">
                    <p className="text-[#FBB017] font-black text-[11px] uppercase tracking-widest">
                        {isHistory ? 'Past Event Archive' : 'Event Management Dashboard'}
                    </p>
                    {isHistory && (role === 'superadmin' || role === 'clubpresident') && (
                        <div className="flex items-center bg-[#EBECEF]/40 rounded-xl p-1 mt-2 md:mt-0">
                            <button className="bg-white text-[#FBB017] font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-sm cursor-default">
                                Event History
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {role === 'lecturer' && (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-[2rem] px-8 py-4 mb-8">
                    <Info size={18} className="text-blue-500 shrink-0" />
                    <p className="text-blue-700 text-xs font-bold">You are in <strong>View Only</strong> mode. Lecturers can view Workshop events and attendee lists.</p>
                </div>
            )}

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Create / Edit Form */}
                {!isHistory && role !== 'lecturer' && (
                    <div className="xl:w-[420px] shrink-0">
                        <EventForm role={role} onEventAdded={fetchEvents} existingEvent={editingEvent as any} onCancelEdit={() => setEditingEvent(null)} />
                    </div>
                )}

                {/* Events Table */}
                <div className="flex-1">
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="px-10 py-6 border-b border-gray-100">
                            <h2 className="text-[#2D3A5D] font-black text-base uppercase tracking-widest">{isHistory ? 'Past Events' : 'Upcoming Events'}</h2>
                        </div>

                        {events.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {events.map(event => (
                                    <div key={event._id}>
                                        <div className="px-10 py-5 flex items-center gap-6 hover:bg-[#EBECEF]/30 transition-all group">
                                            {/* Poster Thumbnail */}
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center bg-[#F0F2F5]">
                                                {event.posterImage ? (
                                                    <img src={event.posterImage} alt={event.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-xl opacity-20">{event.type === 'Workshop' ? '🛠️' : '🎈'}</div>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-[#FBB017] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{event.type}</span>
                                                    {event.priority === 'Urgent' && <span className="bg-red-100 text-red-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Urgent</span>}
                                                </div>
                                                <p className="text-[#2D3A5D] font-black text-sm uppercase tracking-tight truncate">{event.title}</p>
                                                <p className="text-[#2D3A5D]/50 text-[11px] font-bold mt-0.5">{new Date(event.date).toLocaleDateString()} · {event.time} · {event.location}</p>
                                            </div>

                                            {/* Attendee count */}
                                            <div className="text-center shrink-0">
                                                <div className="w-10 h-10 bg-[#FBB017]/10 rounded-2xl flex items-center justify-center text-[#FBB017] font-black text-sm">
                                                    {event.rsvpList?.length || 0}
                                                </div>
                                                <p className="text-[#2D3A5D]/40 text-[9px] font-bold uppercase tracking-wider mt-1">RSVPs</p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex xl:flex-row flex-col items-center gap-2 shrink-0">
                                                <button onClick={() => setViewingAttendees(viewingAttendees === event._id ? null : event._id)}
                                                    className="flex items-center gap-1.5 bg-[#F0F2F5] hover:bg-[#1A1C2C] text-[#2D3A5D] hover:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all">
                                                    {viewingAttendees === event._id ? <EyeOff size={13} /> : <Eye size={13} />}
                                                    {viewingAttendees === event._id ? 'Hide' : 'View'}
                                                </button>
                                                {!isHistory && role !== 'lecturer' && (
                                                    <button onClick={() => { setEditingEvent(event); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                        className="flex items-center gap-1.5 bg-[#FBB017]/10 hover:bg-[#FBB017] text-[#FBB017] hover:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all">
                                                        <Pencil size={13} /> Edit
                                                    </button>
                                                )}
                                                {!isHistory && role !== 'lecturer' && (
                                                    <button onClick={() => handleDelete(event._id)}
                                                        className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all">
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                )}
                                                {isHistory && (role === 'superadmin' || role === 'clubpresident') && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => exportToPDF(event)} className="flex items-center gap-1.5 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all">
                                                            <FileText size={13} /> PDF
                                                        </button>
                                                        <button onClick={() => exportToExcel(event)} className="flex items-center gap-1.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-wider transition-all">
                                                            <FileSpreadsheet size={13} /> Excel
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Attendees Expanded */}
                                        {viewingAttendees === event._id && (
                                            <div className="bg-[#EBECEF]/30 px-10 py-6 border-t border-gray-100">
                                                <p className="text-[#FBB017] font-black text-[10px] uppercase tracking-widest mb-4">Registered Students</p>
                                                {event.rsvpList?.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-gray-200">
                                                                    {["Name", "Student ID", "Contact", "RSVP Time", "Attendance"].map(h => (
                                                                        <th key={h} className="text-left text-[#2D3A5D] font-black text-[10px] uppercase tracking-widest pb-3 pr-6">{h}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {event.rsvpList.map((r, i) => (
                                                                    <tr key={i} className="hover:bg-white/50 transition-colors">
                                                                        <td className="py-3 pr-6 text-[#2D3A5D] font-bold">{r.name || '-'}</td>
                                                                        <td className="py-3 pr-6 text-[#2D3A5D]/60 font-bold">{r.studentId}</td>
                                                                        <td className="py-3 pr-6 text-[#2D3A5D]/60 font-bold">{r.contactNumber || '-'}</td>
                                                                        <td className="py-3 pr-6 text-[#2D3A5D]/40 font-bold">{r.rsvpTime ? new Date(r.rsvpTime).toLocaleString() : '-'}</td>
                                                                        <td className="py-3">
                                                                            {event.attendanceList?.some(a => String(a.studentId) === String(r.studentId))
                                                                                ? <span className="bg-green-100 text-green-700 font-black text-[10px] px-3 py-1 rounded-full uppercase">Yes</span>
                                                                                : <span className="bg-gray-100 text-gray-400 font-black text-[10px] px-3 py-1 rounded-full uppercase">No</span>}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : <p className="text-[#2D3A5D]/30 text-sm font-bold">No attendees yet.</p>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <h2 className="text-2xl font-black text-[#2D3A5D]/10 tracking-[0.4em] uppercase">No Events</h2>
                                <p className="text-[#2D3A5D]/20 font-bold mt-2 tracking-widest text-sm">Events will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(p => ({ ...p, isOpen: false }))} />
        </div>
    );
};

export default AdminEventsPanel;
