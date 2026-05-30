/**
 * Auth helpers — connects to the Node.js backend at /auth/*
 */
import axios from 'axios';

const AUTH_BASE = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3000';

const authApi = axios.create({
  baseURL: AUTH_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token storage ─────────────────────────────────────────────────────────
const TOKEN_KEY = 'gnosis_token';
const USER_KEY  = 'gnosis_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; } catch { return null; }
}

function saveSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

function updateStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete authApi.defaults.headers.common['Authorization'];
}

// ── Types ─────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// ── API calls ─────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const { data } = await authApi.post<AuthResponse>('/auth/register', { email, password });
  saveSession(data.token, data.user);
  return data;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data } = await authApi.post<AuthResponse>('/auth/login', { email, password });
  saveSession(data.token, data.user);
  return data;
}

export async function verifyEmailCode(code: string): Promise<void> {
  const token = getToken();
  await authApi.post('/auth/verify', { code }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  // Update stored user to reflect verified status
  const stored = getStoredUser();
  if (stored) {
    const updated = { ...stored, emailVerified: true };
    updateStoredUser(updated);
  }
}

export async function resendVerificationCode(): Promise<void> {
  const token = getToken();
  await authApi.post('/auth/resend-code', {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMe(): Promise<AuthUser> {
  const token = getToken();
  const { data } = await authApi.get<AuthUser>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// ── Init — attach stored token on page load ───────────────────────────────
const storedToken = getToken();
if (storedToken) {
  authApi.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}
