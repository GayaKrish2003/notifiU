import axios from "axios";
import type { JobPostsResponse, JobPostResponse } from '../types/auth';

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Payload = Record<string, unknown>;
type ApiData = Payload | FormData;

const api = axios.create({
  baseURL: "http://localhost:5005/api",
});

const sanitizeToken = (value: string): string => {
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1);
  }
  return value;
};

const getAccessToken = (): string | null => {
  const directToken = localStorage.getItem("token");
  if (directToken) {
    return sanitizeToken(directToken);
  }

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as {
      accessToken?: string;
      token?: string;
    };
    const fallbackToken = parsed.accessToken || parsed.token;
    return fallbackToken ? sanitizeToken(fallbackToken) : null;
  } catch {
    return null;
  }
};

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Chat Bot API - Do not change the function
export const sendChatMessage = (messages: ChatMessage[]) =>
  api.post("/chat", { messages });

export const login = (data: Payload) => api.post("/users/login", data);
export const register = (role: string | null, data: Payload) =>
  api.post(`/users/register/${role}`, data);

export const getUserProfile = () => api.get("/users/profile");
export const updateUserProfile = (data: Payload) =>
  api.put("/users/profile", data);
export const getEditProfileRequest = () => api.get("/users/profile");
export const updateEditProfileRequest = (data: Payload) =>
  api.put("/users/profile", data);
export const getLecturerProfile = () => api.get("/users/lecturer-profile");
export const updateLecturerProfile = (data: Payload) =>
  api.put("/users/lecturer-profile", data);
export const getStudentProfile = () => api.get("/users/student-profile");
export const updateStudentProfile = (data: Payload) =>
  api.put("/users/student-profile", data);

export const getAllUsers = () => api.get("/users");
export const getUserById = (id: string) => api.get(`/users/${id}`);
export const getUsersByRole = (role?: string, search?: string, status?: string) => 
  api.get("/users", { params: { role, search, status } });
export const updateUserByAdmin = (id: string, data: Payload) =>
  api.patch(`/users/${id}`, data);
export const updateAccountStatus = (id: string, status: string) =>
  api.patch(`/users/${id}/status`, { status });
export const deleteUser = (id: string) => api.delete(`/users/${id}`);
export const exportUsersCSV = () =>
  api.get("/users/export/csv", { responseType: "blob" });
export const exportUsersExcel = () =>
  api.get("/users/export/excel", { responseType: "blob" });
export const getUserActivity = (id?: string) =>
  api.get(id ? `/users/${id}/activity` : "/users/activity");

export const forgotPassword = (data: Payload) =>
  api.post("/auth/forgot-password", data);
export const verifyOTP = (data: Payload) => api.post("/auth/verify-otp", data);
export const resetPassword = (data: Payload) =>
  api.post("/auth/reset-password", data);

export const getTickets = () => api.get("/tickets");
export const getTicketById = (id: string) => api.get(`/tickets/${id}`);
export const createTicket = (data: Payload) => api.post("/tickets", data);
export const updateTicket = (id: string, data: Payload) =>
  api.patch(`/tickets/${id}`, data);
export const deleteTicket = (id: string) => api.delete(`/tickets/${id}`);
export const addTicketResponse = (id: string, message: string) =>
  api.post(`/tickets/${id}/responses`, { response_message: message });

export const getAnnouncements = (params?: Record<string, string>) =>
  api.get("/announcements", { params });
export const getAnnouncementById = (id: string) =>
  api.get(`/announcements/${id}`);
export const createAnnouncement = (data: ApiData) =>
  api.post("/announcements", data);
export const updateAnnouncement = (id: string, data: ApiData) =>
  api.put(`/announcements/${id}`, data);
export const deleteAnnouncement = (id: string) =>
  api.delete(`/announcements/${id}`);
export const deleteAnnouncementAttachment = (
  id: string,
  attachmentId: string,
) => api.delete(`/announcements/${id}/attachments/${attachmentId}`);

export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id: string) =>
  api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () =>
  api.patch("/notifications/read-all");



// ════════════════════════════════════════════════════
//  JOB POST API FUNCTIONS
// ════════════════════════════════════════════════════

// ── Job Provider ──

// Create a new job post
export const createJobPost = (data: Payload) =>
    api.post<JobPostResponse>('/jobs', data);

// Get the logged-in job provider's own posts
export const getMyJobPosts = () =>
    api.get<JobPostsResponse>('/jobs/my-posts');

// Delete a job post by id
export const deleteJobPost = (id: string) =>
    api.delete<JobPostResponse>(`/jobs/${id}`);

// ── Student ──

// Get all approved non-expired jobs (optional filters)
// Example call: getApprovedJobPosts({ search: 'react', jobType: 'internship' })
export const getApprovedJobPosts = (params?: Record<string, string>) =>
    api.get<JobPostsResponse>('/jobs', { params });

// Get the student's bookmarked jobs
export const getBookmarkedJobs = () =>
    api.get<JobPostsResponse>('/jobs/bookmarks');

// Get the student's applied jobs
export const getAppliedJobs = () =>
    api.get<JobPostsResponse>('/jobs/applied');

// Toggle bookmark — same endpoint adds or removes
export const toggleBookmark = (id: string) =>
    api.patch<JobPostResponse>(`/jobs/${id}/bookmark`);

// Toggle mark as applied — same endpoint adds or removes
export const toggleMarkApplied = (id: string) =>
    api.patch<JobPostResponse>(`/jobs/${id}/mark-applied`);


// Call this when student clicks the Apply Now button
// It increments the view count for the job provider's analytics
export const incrementViewCount = (id: string) =>
    api.patch<JobPostResponse>(`/jobs/${id}/view`);

// ── SuperAdmin ──

// Get all job posts regardless of status (for admin review panel)
// Optional: pass ?status=pending to filter
export const getAllJobPostsAdmin = (params?: Record<string, string>) =>
    api.get<JobPostsResponse>('/jobs/admin', { params });

// Approve a job post
export const approveJobPost = (id: string) =>
    api.patch<JobPostResponse>(`/jobs/${id}/approve`);

// Reject a job post with a reason
export const rejectJobPost = (id: string, rejectionReason: string) =>
    api.patch<JobPostResponse>(`/jobs/${id}/reject`, { rejectionReason });

// ── Club President Approval (Admin) ──

// Get all Club President accounts with pending status awaiting admin approval
export const getPendingClubPresidents = () =>
    api.get('/users', { params: { role: 'clubpresident', status: 'pending' } });

// Get all Club Presidents (any status)
export const getAllClubPresidents = () =>
    api.get('/users', { params: { role: 'clubpresident' } });

export default api;
