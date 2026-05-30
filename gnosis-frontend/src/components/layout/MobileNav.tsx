import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Upload, BookOpen, TrendingUp, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/upload', label: 'Upload Notes', icon: Upload },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Topbar trigger — only visible on mobile */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="7" r="3.5" stroke="white" strokeWidth="1.5" />
              <path d="M4 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[15px] font-medium text-gray-900">Gnosis</span>
        </div>
        <button onClick={() => setOpen(true)} className="text-gray-500 hover:text-gray-800 transition-colors">
          <Menu size={20} />
        </button>
      </div>

      {/* Drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white z-40 flex flex-col shadow-xl transition-transform duration-200 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="7" r="3.5" stroke="white" strokeWidth="1.5" />
                <path d="M4 15c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[15px] font-medium text-gray-900">Gnosis</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-2.5 py-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-[14px] mb-1 transition-all',
                isActive
                  ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mx-2.5 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] inline-block" />
            <span className="text-[11px] font-medium text-[#0F6E56]">MCP connected</span>
          </div>
          <p className="text-[11px] text-gray-400 pl-3">Claude Desktop active</p>
        </div>
      </div>
    </>
  );
}
