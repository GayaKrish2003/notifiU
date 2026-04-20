import React from 'react';

interface NotificationModalProps {
    isOpen: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, message, type = 'info', onClose }) => {
    if (!isOpen) return null;

    const icons = { success: { icon: '✓', bg: 'bg-green-500' }, error: { icon: '!', bg: 'bg-red-500' }, info: { icon: 'i', bg: 'bg-[#FBB017]' } };
    const { icon, bg } = icons[type];
    const title = type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification';

    return (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-[2rem] p-10 w-full max-w-sm text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className={`w-16 h-16 ${bg} rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto mb-5 shadow-lg`}>
                    {icon}
                </div>
                <h3 className="text-[#2D3A5D] font-black text-lg uppercase tracking-tight mb-3">{title}</h3>
                <p className="text-[#2D3A5D]/60 text-sm font-medium leading-relaxed mb-7">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black px-10 py-3 rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-[#FBB017]/20 transition-all active:scale-95"
                >
                    OK
                </button>
            </div>
        </div>
    );
};

export default NotificationModal;
