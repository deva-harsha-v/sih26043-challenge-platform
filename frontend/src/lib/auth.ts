import { API_BASE_URL } from './api';
import { RegisterInput, LoginInput, AuthResponse, User } from './types';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  if (match) return match[2];
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  localStorage.setItem('auth_token', token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  localStorage.removeItem('auth_token');
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(errorData.detail || 'Registration failed');
  }

  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(errorData.detail || 'Invalid email or password');
  }

  const data: AuthResponse = await res.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      removeAuthToken();
      return null;
    }

    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  removeAuthToken();
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
  } catch (e) {
    // Ignore network error on logout
  }
}
