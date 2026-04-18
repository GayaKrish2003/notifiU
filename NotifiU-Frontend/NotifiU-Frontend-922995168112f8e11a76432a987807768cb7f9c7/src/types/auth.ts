export type UserRole = 'admin' | 'student' | 'lecturer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
}