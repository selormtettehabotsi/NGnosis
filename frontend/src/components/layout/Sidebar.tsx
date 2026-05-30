import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "⊞" },
  { to: "/knowledge-base", label: "Knowledge Base", icon: "◈" },
  { to: "/notes", label: "Notes", icon: "✎" },
  { to: "/progress", label: "Progress", icon: "▲" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="px-5 py-5 border-b border-zinc-800">
        <span className="text-xl font-bold tracking-tight text-indigo-400">gnosis</span>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
