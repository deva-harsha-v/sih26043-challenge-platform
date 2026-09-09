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

export type ChallengeStatus = 'draft' | 'open' | 'active' | 'submission' | 'review' | 'completed';

export interface Challenge {
  id: number;
  organization_id: number;
  organization_name: string;
  organization_website?: string;
  title: string;
  description: string;
  problem_statement?: string;
  category: string;
  difficulty: string;
  reward?: string;
  max_team_size: number;
  status: ChallengeStatus;
  deadline?: string;
  skills: string[];
  created_at: string;
  updated_at?: string;
}

export interface ChallengeCreateInput {
  title: string;
  description: string;
  problem_statement: string;
  category: string;
  reward?: string;
  difficulty?: string;
  max_team_size?: number;
  deadline?: string;
  skills: string[];
}

export interface ChallengeUpdateInput {
  title?: string;
  description?: string;
  problem_statement?: string;
  category?: string;
  reward?: string;
  difficulty?: string;
  max_team_size?: number;
  status?: ChallengeStatus;
  deadline?: string;
  skills?: string[];
}

export interface ChallengeFilters {
  search?: string;
  skill?: string;
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface TeamMember {
  user_id: number;
  full_name: string;
  email: string;
  role_in_team: string;
  joined_at: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  challenge_id: number;
  challenge_title: string;
  leader_id: number;
  leader_name: string;
  members: TeamMember[];
  created_at: string;
}

export interface TeamCreateInput {
  name: string;
  challenge_id: number;
  description?: string;
}

export type SubmissionStatus = 'submitted' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected';

export interface Submission {
  id: number;
  challenge_id: number;
  challenge_title?: string;
  team_id: number;
  team_name?: string;
  team_members?: TeamMember[];
  title: string;
  description: string;
  document_url?: string;
  status: SubmissionStatus;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
}

export interface SubmissionCreateInput {
  title: string;
  description: string;
  document_url?: string;
  team_id: number;
  challenge_id: number;
}

export interface SubmissionStatusUpdateInput {
  status: SubmissionStatus;
  reviewer_notes?: string;
}
