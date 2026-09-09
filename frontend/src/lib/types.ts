export type UserRole = 'organization' | 'university' | 'contributor' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  org_name?: string;
  university_name?: string;
  created_at?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  org_name?: string;
  university_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
