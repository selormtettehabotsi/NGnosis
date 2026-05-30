import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires authentication + verified email.
 * - Unauthenticated users → /login
 * - Unverified users → /verify
 */
export default function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still verifying stored token — show nothing to avoid flash
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C49A3C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[12px] uppercase tracking-[1.5px] text-[#9E9890]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify" replace />;
  }

  return <>{children}</>;
}
