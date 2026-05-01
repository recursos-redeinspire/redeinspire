import type { ErrorResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'rede_inspire_token';
const REFRESH_TOKEN_KEY = 'rede_inspire_refresh_token';
const USER_KEY = 'rede_inspire_user';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function storeTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function storeUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetch wrapper
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let body: ErrorResponse | undefined;
    try {
      body = (await res.json()) as ErrorResponse;
    } catch {
      /* empty */
    }
    throw new ApiError(
      res.status,
      body?.errorCode ?? 'UNKNOWN',
      body?.message ?? 'Erro inesperado. Tente novamente.',
      body?.details,
    );
  }
  return res.json() as Promise<T>;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return handleResponse<T>(res);
}
