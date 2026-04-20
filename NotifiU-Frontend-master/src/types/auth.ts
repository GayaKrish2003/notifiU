export type UserRole = 'admin' | 'student' | 'lecturer' | 'jobprovider';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
}

// ──────────────── Job Post Types ────────────────
// This describes the shape of a job post object
// that comes back from your backend API
export interface JobPost {
    _id: string;
    postedBy: {
        _id: string;
        companyName: string;
        companyWebsite: string;
    };
    title: string;
    description: string;
    companyName: string;
    jobType: 'full-time' | 'part-time' | 'internship' | 'remote';
    location: string;
    skills: string[];
    salaryRange: string;
    applicationLink: string;
    deadline: string;       // dates come from the API as strings
    isExpired: boolean;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

// This is what the API returns when you fetch a list of job posts
export interface JobPostsResponse {
    success: boolean;
    count: number;
    data: JobPost[];
}


// This is what the API returns for a single job post action
export interface JobPostResponse {
    success: boolean;
    message: string;
    data: JobPost;
}
