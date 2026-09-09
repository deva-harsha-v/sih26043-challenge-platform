import { getAuthToken } from './auth';
import { Challenge, ChallengeCreateInput, ChallengeUpdateInput, ChallengeFilters } from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
