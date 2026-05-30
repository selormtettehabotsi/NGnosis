interface Props {
  name: string;
  activeGaps: number;
  sessionsThisWeek: number;
}

export default function GreetingBar({ name, activeGaps, sessionsThisWeek }: Props) {
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-medium text-gray-900 tracking-tight">
        {greeting()}, {name} 👋
      </h2>
      <p className="text-[13px] text-gray-500 mt-1">
        You have <span className="text-amber-600 font-medium">{activeGaps} active knowledge gap{activeGaps !== 1 ? 's' : ''}</span>
        {sessionsThisWeek > 0 && <> and <span className="text-[#1D9E75] font-medium">{sessionsThisWeek} study sessions</span> this week</>}.
      </p>
    </div>
  );
}
