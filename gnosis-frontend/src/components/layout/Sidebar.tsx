import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Upload, BarChart2, Settings, Globe, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { to: '/upload', label: 'Upload Center', icon: Upload },
  { to: '/progress', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  // Derive initials from email (e.g. selorm@knust.edu.gh → "SE")
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className="w-[220px] min-w-[220px] flex flex-col bg-white border-r border-[#E5DDD5] h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-[#F0EBE3]">
        <div className="text-[20px] font-bold text-[#1A1714] tracking-tight leading-none">
          Gnosis
        </div>
        <div className="text-[9px] text-[#9E9890] uppercase tracking-[1.8px] mt-1">
          The Academic Archive
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] mb-0.5 transition-all',
                isActive
                  ? 'bg-[#EDE8E0] text-[#1A1714] font-medium'
                  : 'text-[#6B6560] hover:bg-[#F5F0EA] hover:text-[#1A1714]'
              )
            }
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Weekly Goal Card */}
      <div className="mx-3 mb-3 rounded-2xl bg-[#1C1C2E] p-4">
        <p className="text-[9px] uppercase tracking-[1.8px] text-[#8585A0] mb-2">Weekly Goal</p>
        <p className="text-[17px] font-semibold text-white leading-tight mb-4">
          85% Retention<br />Reach
        </p>
        <button className="w-full py-2 bg-white text-[#1C1C2E] text-[12px] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
          Start Studying
        </button>
      </div>

      {/* Bottom links */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-[#F0EBE3] pt-2">
        <NavLink
          to="/mcp-status"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 w-full text-[12px] transition-colors rounded-lg',
              isActive
                ? 'bg-[#EDE8E0] text-[#1A1714] font-medium'
                : 'text-[#9E9890] hover:text-[#6B6560] hover:bg-[#F5F0EA]'
            )
          }
        >
          <Globe size={13} strokeWidth={1.5} />
          MCP Status
        </NavLink>
        <NavLink
          to="/support"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 w-full text-[12px] transition-colors rounded-lg',
              isActive
                ? 'bg-[#EDE8E0] text-[#1A1714] font-medium'
                : 'text-[#9E9890] hover:text-[#6B6560] hover:bg-[#F5F0EA]'
            )
          }
        >
          <HelpCircle size={13} strokeWidth={1.5} />
          Support
        </NavLink>

        {/* User info + sign out */}
        <div className="mt-2 pt-2 border-t border-[#F0EBE3]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F5F0EA]">
            <div className="w-7 h-7 rounded-full bg-[#D4C5A9] flex items-center justify-center text-[10px] font-bold text-[#5C4A2A] shrink-0">
              {initials}
            </div>
            <p className="text-[11px] text-[#6B6560] truncate flex-1 leading-tight">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 w-full text-[12px] text-[#9E9890] hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg mt-0.5"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
