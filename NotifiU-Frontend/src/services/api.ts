import axios from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';

interface StoredUser {
  accessToken?: string;
  [key: string]: unknown;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

interface ProfileUpdateData {
  name?: string;
  profileImage?: string;
  [key: string]: unknown;
}

interface ForgotPasswordData {
  email: string;
}

interface VerifyOTPData {
  email: string;
  otp: string;
}

interface ResetPasswordData {
  email?: string;
  token?: string;
  password: string;
}

const api = axios.create({
  baseURL: 'http://localhost:5005/api',
  withCredentials: true,
});

// Request interceptor: Attach token if it exists
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user: StoredUser = JSON.parse(userStr);
        if (user?.accessToken) {
          config.headers.Authorization = `Bearer ${user.accessToken}`;
        }
      }
    } catch (err) {
      console.error('Interceptor Error:', err);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor: Handle unauthorized errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized request detected (401).');
      // Optional: Clear storage and redirect if token is dead
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export const login = (data: LoginData): Promise<AxiosResponse> => api.post('/users/login', data);
export const register = (role: string | null, data: RegisterData): Promise<AxiosResponse> => api.post(`/users/register/${role}`, data);
export const getUserProfile = (): Promise<AxiosResponse> => api.get('/users/profile');
export const getUserById = (id: string): Promise<AxiosResponse> => api.get(`/users/details/${id}`);
export const getEditProfileRequest = (id: string | undefined): Promise<AxiosResponse> => api.get(`/users/profile/${id}`);
export const updateEditProfileRequest = (id: string | undefined, data: ProfileUpdateData): Promise<AxiosResponse> => api.put(`/users/profile/${id}`, data);
export const updateUserProfile = (data: ProfileUpdateData): Promise<AxiosResponse> => api.put('/users/profile', data);

export const forgotPassword = (data: ForgotPasswordData): Promise<AxiosResponse> => api.post('/auth/forgot-password', data);
export const verifyOTP = (data: VerifyOTPData): Promise<AxiosResponse> => api.post('/auth/verify-otp', data);
export const resetPassword = (data: ResetPasswordData): Promise<AxiosResponse> => api.post('/auth/reset-password', data);

// Lecturer-specific APIs
export const getLecturerProfile = (): Promise<AxiosResponse> => api.get('/lecturer/profile');
export const updateLecturerProfile = (data: ProfileUpdateData): Promise<AxiosResponse> => api.put('/lecturer/profile', data);

// Admin APIs
export const getUsersByRole = (
  role: string,
  search: string = '',
  status: string = 'all',
  page: number = 1,
  limit: number = 50,
): Promise<AxiosResponse> =>
  api.get(`/users?role=${role}&search=${search}&status=${status}&page=${page}&limit=${limit}`);
export const updateAccountStatus = (id: string, status: string): Promise<AxiosResponse> => api.patch(`/users/${id}/status`, { status });
export const updatePaymentStatus = (id: string, status: string): Promise<AxiosResponse> => api.patch(`/users/${id}/payment-status`, { status });
export const deleteUser = (id: string): Promise<AxiosResponse> => api.delete(`/users/${id}`);
export const updateUserByAdmin = (id: string, data: Record<string, unknown>): Promise<AxiosResponse> => api.put(`/users/${id}`, data);
export const getUserActivity = (id: string): Promise<AxiosResponse> => api.get(`/users/${id}/activity`);

export const exportUsersCSV = (role: string): Promise<AxiosResponse> => api.get(`/users/export/csv?role=${role}`, { responseType: 'blob' });
export const exportUsersExcel = (role: string): Promise<AxiosResponse> => api.get(`/users/export/excel?role=${role}`, { responseType: 'blob' });

// Announcement APIs
export interface AnnouncementFilters {
  module_id?: string;
  status?: 'draft' | 'published' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AnnouncementCreateData {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  publish_date?: string;
  expiry_date?: string;
  module_id?: string;
  status?: 'draft' | 'published' | 'archived';
}

export const getAnnouncements = (filters: AnnouncementFilters = {}): Promise<AxiosResponse> => {
  const params = new URLSearchParams();
  if (filters.module_id) params.append('module_id', filters.module_id);
  if (filters.status)    params.append('status', filters.status);
  if (filters.priority)  params.append('priority', filters.priority);
  const query = params.toString();
  return api.get(`/announcements${query ? `?${query}` : ''}`);
};

export const getAnnouncementById = (id: string): Promise<AxiosResponse> =>
  api.get(`/announcements/${id}`);

export const createAnnouncement = (data: AnnouncementCreateData, files?: File[]): Promise<AxiosResponse> => {
  if (files && files.length > 0) {
    const form = new FormData();
    (Object.keys(data) as (keyof AnnouncementCreateData)[]).forEach((key) => {
      const val = data[key];
      if (val !== undefined) form.append(key, val);
    });
    files.forEach((f) => form.append('attachments', f));
    return api.post('/announcements', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/announcements', data);
};

export const updateAnnouncement = (id: string, data: Partial<AnnouncementCreateData>): Promise<AxiosResponse> =>
  api.put(`/announcements/${id}`, data);

export const deleteAnnouncement = (id: string): Promise<AxiosResponse> =>
  api.delete(`/announcements/${id}`);

export const deleteAnnouncementAttachment = (id: string, attachmentId: string): Promise<AxiosResponse> =>
  api.delete(`/announcements/${id}/attachments/${attachmentId}`);

// Ticket APIs
export interface TicketCreateData {
  subject: string;
  description: string;
  category?: string;
}

export const getTickets = (): Promise<AxiosResponse> => api.get('/tickets');
export const getTicketById = (id: string): Promise<AxiosResponse> => api.get(`/tickets/${id}`);
export const createTicket = (data: TicketCreateData): Promise<AxiosResponse> => api.post('/tickets', data);
export const updateTicket = (id: string, data: Partial<TicketCreateData> & { status?: string }): Promise<AxiosResponse> => api.patch(`/tickets/${id}`, data);
export const deleteTicket = (id: string): Promise<AxiosResponse> => api.delete(`/tickets/${id}`);
export const addTicketResponse = (id: string, response_message: string): Promise<AxiosResponse> => api.post(`/tickets/${id}/responses`, { response_message });
export const deleteTicketResponse = (id: string, responseId: string): Promise<AxiosResponse> => api.delete(`/tickets/${id}/responses/${responseId}`);

export default api;
