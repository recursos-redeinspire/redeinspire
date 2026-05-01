import type { AuthSession, CreateLeaderDTO, UserProfile } from '../types';
import {
  apiFetch,
  storeTokens,
  storeUser,
  clearTokens,
  getAccessToken,
  getStoredUser,
} from './api';

export async function login(
  email: string,
  password: string,
): Promise<AuthSession> {
  const session = await apiFetch<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  storeTokens(session.accessToken, session.refreshToken);
  storeUser(session.userProfile);

  return session;
}

export async function register(
  leaderData: CreateLeaderDTO,
): Promise<UserProfile> {
  const profile = await apiFetch<UserProfile>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(leaderData),
  });
  return profile;
}

export function logout(): void {
  clearTokens();
}

export function getCurrentUser(): UserProfile | null {
  return getStoredUser<UserProfile>();
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}
