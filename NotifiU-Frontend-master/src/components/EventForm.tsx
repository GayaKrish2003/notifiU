import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NotificationModal from './NotificationModal';

interface EventFormData {
    title: string; description: string; date: string; time: string;
    location: string; organizingClub: string; category: string;
    priority: 'Normal' | 'Urgent'; type: 'Event' | 'Workshop';
    creatorRole: 'superadmin' | 'clubpresident' | 'lecturer'; seatLimit: number;
    posterImage?: string;
}
interface ExistingEvent extends EventFormData { _id: string; }
interface EventFormProps { onEventAdded: () => void; existingEvent?: ExistingEvent | null; onCancelEdit?: () => void; role?: string; }
interface NotificationState { isOpen: boolean; message: string; type: 'success' | 'error' | 'info'; }

const EventForm: React.FC<EventFormProps> = ({ onEventAdded, existingEvent, onCancelEdit, role = 'superadmin' }) => {
    const [notification, setNotification] = useState<NotificationState>({ isOpen: false, message: '', type: 'info' });
    const getInitial = (): EventFormData => ({ title: '', description: '', date: '', time: '', location: '', organizingClub: '', category: 'Workshop', priority: 'Normal', type: 'Event', creatorRole: role as any, seatLimit: 0, posterImage: '' });
    const [formData, setFormData] = useState<EventFormData>(getInitial());
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (existingEvent) {
            setFormData({ ...existingEvent, date: existingEvent.date ? new Date(existingEvent.date).toISOString().split('T')[0] : '', seatLimit: existingEvent.seatLimit || 0 });
            setImagePreview(existingEvent.posterImage || '');
        } else { 
            setFormData(getInitial()); 
            setImagePreview('');
        }
    }, [existingEvent, role]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: name === 'seatLimit' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setNotification({ isOpen: true, message: 'Image size should be less than 2MB', type: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setFormData(p => ({ ...p, posterImage: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            existingEvent ? await api.put(`/events/${existingEvent._id}`, formData) : await api.post('/events', formData);
            setNotification({ isOpen: true, message: existingEvent ? 'Event Updated!' : 'Event Created!', type: 'success' });
            setTimeout(() => { setNotification({ isOpen: false, message: '', type: 'info' }); setFormData(getInitial()); setImagePreview(''); onEventAdded(); if (onCancelEdit) onCancelEdit(); }, 1500);
        } catch { setNotification({ isOpen: true, message: 'Failed to save event', type: 'error' }); }
    };

    const inputClass = "w-full bg-[#F0F2F5] border-none rounded-2xl px-5 py-3.5 text-sm font-medium text-[#2D3A5D] focus:ring-2 focus:ring-[#FBB017] outline-none transition-all";
    const labelClass = "block text-[#2D3A5D] text-[10px] font-black uppercase tracking-widest mb-2";

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-sm mb-8">
            <h2 className="text-[#2D3A5D] font-black text-xl uppercase tracking-tight mb-1">{existingEvent ? 'Edit Event' : 'Create New Event'}</h2>
            <p className="text-[#FBB017] font-black text-[10px] uppercase tracking-widest mb-8">Event Management</p>
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Poster Image Upload */}
                <div className="mb-6">
                    <label className={labelClass}>Event Poster (Optional)</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] p-6 hover:border-[#FBB017]/50 transition-colors bg-gray-50/30 group relative overflow-hidden min-h-[200px]">
                        {imagePreview ? (
                            <>
                                <img src={imagePreview} alt="Preview" className="max-h-[300px] rounded-xl shadow-md" />
                                <button type="button" onClick={() => { setImagePreview(''); setFormData(p => ({ ...p, posterImage: '' })); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform">✕</button>
                            </>
                        ) : (
                            <div className="text-center">
                                <div className="text-4xl mb-2">🖼️</div>
                                <p className="text-[#2D3A5D]/40 text-xs font-bold uppercase tracking-widest">Click to upload poster</p>
                                <p className="text-[#2D3A5D]/40 text-[9px] mt-1">Recommended size: 1200x600 (Max 2MB)</p>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Event Title</label>
                    <input name="title" placeholder="Enter event title" value={formData.title} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea name="description" placeholder="Describe the event..." value={formData.description} onChange={handleChange} required rows={3} className={inputClass + ' resize-none'} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Time</label>
                        <input type="time" name="time" value={formData.time} onChange={handleChange} required className={inputClass} />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Location / Venue</label>
                    <input name="location" placeholder="e.g. Main Hall A" value={formData.location} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Organizing Club / Department</label>
                    <input name="organizingClub" placeholder="e.g. IT Club" value={formData.organizingClub} onChange={handleChange} required className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} title="Category" className={inputClass}>
                            <option value="Workshop">Workshop</option>
                            <option value="Seminar">Seminar</option>
                            <option value="Club Activity">Club Activity</option>
                            <option value="Sports">Sports</option>
                            <option value="Musical">Musical</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} title="Type" className={inputClass}>
                            <option value="Event">Event</option>
                            <option value="Workshop">Workshop</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Creator Role</label>
                        <select name="creatorRole" value={formData.creatorRole} onChange={handleChange} title="Creator Role" className={inputClass}>
                            <option value="superadmin">Admin</option>
                            <option value="clubpresident">Club President</option>
                            <option value="lecturer">Lecturer</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} title="Priority" className={inputClass}>
                            <option value="Normal">Normal</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={labelClass}>🪑 Seat Limit <span className="text-[#2D3A5D]/40 normal-case font-medium">(0 = Unlimited)</span></label>
                    <input type="number" name="seatLimit" value={formData.seatLimit} onChange={handleChange} min={0} placeholder="0 = Unlimited" className={inputClass} />
                </div>
                <div className="flex gap-3 pt-2">
                    <button type="submit" className="flex-1 bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest shadow-lg shadow-[#FBB017]/20 transition-all active:scale-[0.98]">
                        {existingEvent ? 'Update Event' : 'Post Event'}
                    </button>
                    {existingEvent && (
                        <button type="button" onClick={() => { setFormData(getInitial()); if (onCancelEdit) onCancelEdit(); }}
                            className="flex-1 bg-[#1A1C2C] hover:bg-[#2D3A5D] text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-widest transition-all active:scale-[0.98]">
                            Cancel
                        </button>
                    )}
                </div>
            </form>
            <NotificationModal isOpen={notification.isOpen} message={notification.message} type={notification.type} onClose={() => setNotification(p => ({ ...p, isOpen: false }))} />
        </div>
    );
};

export default EventForm;
