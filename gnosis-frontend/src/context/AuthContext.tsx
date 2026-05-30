import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signUp as apiSignUp,
  signIn as apiSignIn,
  verifyEmailCode,
  resendVerificationCode,
  clearSession,
  getStoredUser,
  getToken,
  getMe,
  type AuthUser,
} from '../lib/auth';

// ── Types ─────────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  verifyEmail: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage, then verify token is still valid
  useEffect(() => {
    const stored = getStoredUser();
    const token  = getToken();

    if (!stored || !token) {
      setLoading(false);
      return;
    }

    // Optimistically set user from localStorage so the UI loads fast
    setUser(stored);

    getMe()
      .then(me => setUser(me))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string) => {
    const { user } = await apiSignUp(email, password);
    setUser(user);
  };

  const signIn = async (email: string, password: string) => {
    const { user } = await apiSignIn(email, password);
    setUser(user);
  };

  const signOut = () => {
    clearSession();
    setUser(null);
  };

  const verifyEmail = async (code: string) => {
    await verifyEmailCode(code);
    // Update local state to reflect verified status
    setUser(prev => prev ? { ...prev, emailVerified: true } : null);
  };

  const resendCode = async () => {
    await resendVerificationCode();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, verifyEmail, resendCode }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
