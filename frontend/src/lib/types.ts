export type UserRole = 'organization' | 'university' | 'contributor' | 'admin';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}
