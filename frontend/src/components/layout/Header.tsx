import { useLocation } from "react-router-dom";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/knowledge-base": "Knowledge Base",
  "/notes": "Notes",
  "/progress": "Progress",
  "/settings": "Settings",
};

export default function Header() {
  const { pathname } = useLocation();
  const base = "/" + pathname.split("/")[1];
  const title = TITLES[base] ?? "Gnosis";

  return (
    <header className="h-14 border-b border-zinc-800 flex items-center px-6 bg-zinc-950">
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
    </header>
  );
}
