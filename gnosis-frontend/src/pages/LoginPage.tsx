import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  // Redirect back to whatever page the user tried to visit before being bounced to /login
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-[36px] font-bold text-[#1A1714] tracking-tight leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Gnosis
          </h1>
          <p className="text-[11px] uppercase tracking-[2px] text-[#9E9890] mt-1.5">
            The Academic Archive
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E5DDD5] rounded-2xl p-8 shadow-sm">
          <h2 className="text-[20px] font-semibold text-[#1A1714] mb-1">Welcome back</h2>
          <p className="text-[13px] text-[#9E9890] mb-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#C49A3C] hover:underline font-medium">
              Sign up free
            </Link>
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-[#6B6560] mb-1.5 uppercase tracking-[0.5px]">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-4 py-2.5 border border-[#E5DDD5] rounded-xl text-[14px] text-[#1A1714] placeholder:text-[#C4BDB6] bg-[#FAFAF8] outline-none focus:border-[#C49A3C] focus:ring-2 focus:ring-[#C49A3C]/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[12px] font-medium text-[#6B6560] uppercase tracking-[0.5px]">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-2.5 border border-[#E5DDD5] rounded-xl text-[14px] text-[#1A1714] placeholder:text-[#C4BDB6] bg-[#FAFAF8] outline-none focus:border-[#C49A3C] focus:ring-2 focus:ring-[#C49A3C]/20 transition-all"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-[#1C1C2E] text-white text-[14px] font-semibold rounded-xl hover:bg-[#2D2D42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[#C4BDB6] mt-6">
          Gnosis v1.0.0 · Your knowledge, privately stored.
        </p>
      </div>
    </div>
  );
}
