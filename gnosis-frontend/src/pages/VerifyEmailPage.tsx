import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CODE_LENGTH = 6;

export default function VerifyEmailPage() {
  const { user, verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();

  const [digits, setDigits]       = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user is already verified, redirect to dashboard
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // If no user at all, redirect to signup
  useEffect(() => {
    if (!user) {
      navigate('/signup', { replace: true });
    }
  }, [user, navigate]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    // Auto-advance to the next field
    if (digit && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }

    // Auto-submit when all digits are filled
    if (digit && index === CODE_LENGTH - 1) {
      const code = newDigits.join('');
      if (code.length === CODE_LENGTH) {
        submitCode(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    // Focus the next empty input or the last one
    const nextEmpty = newDigits.findIndex((d) => d === '');
    focusInput(nextEmpty === -1 ? CODE_LENGTH - 1 : nextEmpty);

    // Auto-submit if all 6 digits pasted
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted);
    }
  };

  const submitCode = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      await verifyEmail(code);
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length !== CODE_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    submitCode(code);
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    try {
      await resendCode();
      setSuccess('A new code has been sent to your email.');
      setDigits(Array(CODE_LENGTH).fill(''));
      focusInput(0);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to resend code. Please try again.';
      setError(msg);
    } finally {
      setResending(false);
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
          <h2 className="text-[20px] font-semibold text-[#1A1714] mb-1">
            Verify your email
          </h2>
          <p className="text-[13px] text-[#9E9890] mb-6">
            We sent a 6-digit code to{' '}
            <span className="text-[#6B6560] font-medium">{user?.email ?? 'your email'}</span>.
            Enter it below.
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-[13px] text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6-digit code input */}
            <div className="flex justify-center gap-3 mb-6">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  autoFocus={i === 0}
                  className="w-12 h-14 text-center text-[24px] font-bold text-[#1A1714] border border-[#E5DDD5] rounded-xl bg-[#FAFAF8] outline-none focus:border-[#C49A3C] focus:ring-2 focus:ring-[#C49A3C]/20 transition-all"
                />
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || digits.join('').length !== CODE_LENGTH}
              className="w-full py-3 bg-[#1C1C2E] text-white text-[14px] font-semibold rounded-xl hover:bg-[#2D2D42] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify email'}
            </button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            <p className="text-[13px] text-[#9E9890]">
              Didn't receive a code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-[#C49A3C] hover:underline font-medium disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#C4BDB6] mt-6">
          Code expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}
