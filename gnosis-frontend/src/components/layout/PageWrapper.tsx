import { useLocation } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import { useProfile } from '../../hooks';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload Center',
  '/knowledge': 'Knowledge Base',
  '/progress': 'Progress & Insights',
  '/settings': 'User Settings',
};

interface Props {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: Props) {
  const location = useLocation();
  const { profile } = useProfile();
  const title = PAGE_TITLES[location.pathname] ?? 'Gnosis';

  const initials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : 'KO';

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#E5DDD5] px-6 h-14 flex items-center justify-between gap-4">
        <h1 className="text-[14px] font-semibold text-[#1A1714] whitespace-nowrap shrink-0">
          {title}
        </h1>

        <div className="flex-1 max-w-[280px] relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B2AA]" />
          <input
            type="text"
            placeholder="Search archives..."
            className="w-full pl-8 pr-3 py-1.5 border border-[#E5DDD5] rounded-full text-[12px] text-[#1A1714] placeholder:text-[#C4BDB6] outline-none focus:border-[#C49A3C] bg-[#FAF8F5] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6560] hover:bg-[#F5F0EA] transition-colors">
            <Bell size={15} strokeWidth={1.5} />
          </button>

          {profile?.name && (
            <div className="text-right hidden md:block">
              <p className="text-[12px] font-medium text-[#1A1714] leading-none">{profile.name}</p>
              <p className="text-[9px] uppercase tracking-[1px] text-[#9E9890] mt-0.5">
                {profile.university ?? 'Student'}
              </p>
            </div>
          )}

          <div className="w-8 h-8 rounded-full bg-[#D4C5A9] flex items-center justify-center text-[11px] font-semibold text-[#5C4A2A]">
            {initials}
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1C2E] text-white text-[12px] font-medium rounded-full hover:bg-[#2D2D42] transition-colors">
            <Plus size={12} strokeWidth={2} />
            New Entry
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 p-6 max-w-[1200px] w-full">
        {children}
      </main>
    </div>
  );
}
