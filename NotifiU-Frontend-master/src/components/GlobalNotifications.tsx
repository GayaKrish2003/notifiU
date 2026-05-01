import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/premiumAlert';

interface Notification {
    eventId: string;
    title: string;
    message: string;
    type: 'reminder' | 'attendance';
    hasAttended?: boolean;
}

interface NotificationState {
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

const GlobalNotifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

    // Get student info from localStorage
    const getStudentInfo = () => {
        try {
            const raw = localStorage.getItem('user');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed.studentId) return null;
            return { studentId: parsed.studentId, role: parsed.role };
        } catch { return null; }
    };

    const student = getStudentInfo();

    const fetchNotifications = async () => {
        if (!student?.studentId) return;
        try {
            const response = await api.get('/events/user/notifications', { 
                params: { role: student.role, studentId: student.studentId } 
            });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching global notifications", error);
        }
    };

    useEffect(() => {
        if (!student?.studentId) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [student?.studentId]);

    const handleAttendance = async (eventId: string) => {
        try {
            await api.post(`/events/${eventId}/attendance`, { studentId: student?.studentId });
            showSuccess("Attendance Marked!", "Your attendance has been recorded successfully.");
            fetchNotifications(); // Refresh list to hide the one we just marked
        } catch (error) {
            showError("Failed", "Failed to mark attendance");
        }
    };

    const handleDismiss = (eventId: string, type: string) => {
        setDismissedNotifications(prev => [...prev, `${eventId}-${type}`]);
    };

    // Filter only those NOT dismissed
    const activeNotifications = notifications.filter(n => !dismissedNotifications.includes(`${n.eventId}-${n.type}`));

    // per USER request: "attence eka witaray kohe hitiyath enna oni"
    // Only display modals for 'attendance' type globally.
    const attendanceRequests = activeNotifications.filter(n => n.type === 'attendance' && !n.hasAttended);

    if (!student?.studentId) return null;

    return (
        <>
            {/* Global Attendance Modals */}
            {attendanceRequests.map((n, i) => (
                <div key={`global-a-${i}`} className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm text-center shadow-2xl animate-in zoom-in duration-300 border border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#FBB017] to-[#e9a215] rounded-full flex items-center justify-center text-4xl mb-6 mx-auto shadow-lg shadow-[#FBB017]/30 text-white">📋</div>
                        <h2 className="text-[#2D3A5D] font-black text-xl uppercase tracking-tight mb-2">Attendance Required</h2>
                        <div className="w-10 h-1 bg-[#FBB017] mx-auto mb-6 rounded-full"></div>
                        <p className="text-[#2D3A5D]/70 text-sm font-semibold leading-relaxed mb-10">{n.message}</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { handleAttendance(n.eventId); handleDismiss(n.eventId, n.type); }} 
                                className="w-full bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#FBB017]/20 active:scale-95"
                            >
                                Yes, I'm here
                            </button>
                            <button 
                                onClick={() => handleDismiss(n.eventId, n.type)} 
                                className="w-full bg-[#1A1C2C] hover:bg-[#2D3A5D] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95"
                            >
                                No, I'm not
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default GlobalNotifications;
