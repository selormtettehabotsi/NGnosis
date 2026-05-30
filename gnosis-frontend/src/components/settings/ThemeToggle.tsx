import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark') ||
      localStorage.getItem('gnosis-theme') === 'dark';
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('gnosis-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('gnosis-theme', 'light');
    }
  }, [dark]);

  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4">
      <div>
        <p className="text-[13px] font-medium text-gray-900">Appearance</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{dark ? 'Dark mode' : 'Light mode'}</p>
      </div>
      <button
        onClick={() => setDark(d => !d)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${dark ? 'bg-[#1D9E75]' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center transition-transform duration-200 ${dark ? 'translate-x-6' : 'translate-x-0'}`}
        >
          {dark
            ? <Moon size={10} className="text-[#1D9E75]" />
            : <Sun size={10} className="text-gray-400" />
          }
        </span>
      </button>
    </div>
  );
}
