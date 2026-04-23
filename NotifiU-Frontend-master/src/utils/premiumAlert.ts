import Swal from 'sweetalert2';

const premiumAlert = Swal.mixin({
    customClass: {
        container: 'font-[\'Outfit\',_sans-serif]',
        popup: 'rounded-[2.5rem] p-10 shadow-2xl border-none',
        title: 'text-[#2D3A5D] font-black text-xl uppercase tracking-tight mb-2',
        htmlContainer: 'text-[#2D3A5D]/60 text-sm font-medium leading-relaxed mb-6',
        confirmButton: 'bg-[#FBB017] hover:bg-[#e9a215] text-[#1A1C2C] font-black px-10 py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-[#FBB017]/20 transition-all active:scale-95 outline-none mx-2',
        cancelButton: 'bg-[#1A1C2C] hover:bg-[#2D3A5D] text-white font-black px-10 py-3.5 rounded-2xl text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95 outline-none mx-2',
        icon: 'border-none scale-125 mb-4'
    },
    buttonsStyling: false,
    backdrop: `rgba(0,0,0,0.5)`,
    showClass: {
        popup: 'animate__animated animate__zoomIn animate__faster'
    },
    hideClass: {
        popup: 'animate__animated animate__zoomOut animate__faster'
    }
});

export const showSuccess = (title: string, message: string) => {
    return premiumAlert.fire({
        icon: 'success',
        title: title,
        text: message,
        iconColor: '#22c55e',
    });
};

export const showError = (title: string, message: string) => {
    return premiumAlert.fire({
        icon: 'error',
        title: title,
        text: message,
        iconColor: '#ef4444',
    });
};

export const showInfo = (title: string, message: string) => {
    return premiumAlert.fire({
        icon: 'info',
        title: title,
        text: message,
        iconColor: '#FBB017',
    });
};

export const showConfirm = (title: string, message: string, confirmText: string = 'Yes', cancelText: string = 'No') => {
    return premiumAlert.fire({
        title: title,
        text: message,
        icon: 'question',
        iconColor: '#FBB017',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
    });
};

export default premiumAlert;
