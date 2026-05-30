import type { ProgressStats } from '../../lib/types';

interface Props {
  stats: ProgressStats;
}

export default function OverallStats({ stats }: Props) {
  const items = [
    { label: 'Coverage', value: `${stats.overall_coverage}%`, delta: '+8% this week' },
    { label: 'Gaps resolved', value: stats.gaps_resolved, delta: `${stats.gaps_found - stats.gaps_resolved} remaining` },
    { label: 'Study time', value: `${stats.study_hours_this_week}h`, delta: 'This week' },
    { label: 'Socratic score', value: stats.socratic_score, delta: '+4 pts' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {items.map(s => (
        <div key={s.label} className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-[11px] text-gray-400 mb-1.5">{s.label}</p>
          <p className="text-[24px] font-medium text-gray-900 leading-none">{s.value}</p>
          <p className="text-[11px] text-[#1D9E75] mt-1">{s.delta}</p>
        </div>
      ))}
    </div>
  );
}
