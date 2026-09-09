import { getAuthToken } from './auth';
import { Challenge, ChallengeCreateInput, ChallengeUpdateInput, ChallengeFilters, Team, TeamCreateInput } from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Challenge API Functions
export async function getChallenges(filters: ChallengeFilters = {}): Promise<Challenge[]> {
  const query = new URLSearchParams();
  if (filters.search) query.append('search', filters.search);
  if (filters.skill) query.append('skill', filters.skill);
  if (filters.status) query.append('status', filters.status);
  if (filters.category) query.append('category', filters.category);
  if (filters.page) query.append('page', filters.page.toString());
  if (filters.limit) query.append('limit', filters.limit.toString());

  const res = await fetch(`${API_BASE_URL}/challenges?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch challenges');
  }
  return res.json();
}

export async function getChallengeById(id: number | string): Promise<Challenge> {
  const res = await fetch(`${API_BASE_URL}/challenges/${id}`);
  if (!res.ok) {
    throw new Error('Challenge not found');
  }
  return res.json();
}

export async function createChallenge(data: ChallengeCreateInput): Promise<Challenge> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/challenges`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create challenge' }));
    throw new Error(errorData.detail || 'Failed to create challenge');
  }

  return res.json();
}

export async function updateChallenge(id: number | string, data: ChallengeUpdateInput): Promise<Challenge> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to update challenge' }));
    throw new Error(errorData.detail || 'Failed to update challenge');
  }

  return res.json();
}

export async function deleteChallenge(id: number | string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to delete challenge' }));
    throw new Error(errorData.detail || 'Failed to delete challenge');
  }
}

// Team API Functions
export async function getTeams(challengeId?: number | string): Promise<Team[]> {
  const query = new URLSearchParams();
  if (challengeId) query.append('challenge_id', challengeId.toString());

  const res = await fetch(`${API_BASE_URL}/teams?${query.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch teams');
  }
  return res.json();
}

export async function getTeamById(id: number | string): Promise<Team> {
  const res = await fetch(`${API_BASE_URL}/teams/${id}`);
  if (!res.ok) {
    throw new Error('Team not found');
  }
  return res.json();
}

export async function createTeam(data: TeamCreateInput): Promise<Team> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to create team' }));
    throw new Error(errorData.detail || 'Failed to create team');
  }

  return res.json();
}

export async function joinTeam(teamId: number | string): Promise<Team> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/teams/${teamId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to join team' }));
    throw new Error(errorData.detail || 'Failed to join team');
  }

  return res.json();
}

export async function leaveTeam(teamId: number | string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/teams/${teamId}/leave`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to leave team' }));
    throw new Error(errorData.detail || 'Failed to leave team');
  }
}

export async function removeTeamMember(teamId: number | string, userId: number | string): Promise<Team> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Failed to remove member' }));
    throw new Error(errorData.detail || 'Failed to remove member');
  }

  return res.json();
}
