interface Stat {
  label: string;
  value: string | number;
  delta?: string;
}

interface Props {
  stats: Stat[];
}

export default function StatsRow({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-[11px] text-gray-400 mb-1.5">{s.label}</p>
          <p className="text-[24px] font-medium text-gray-900 leading-none">{s.value}</p>
          {s.delta && <p className="text-[11px] text-[#1D9E75] mt-1">{s.delta}</p>}
        </div>
      ))}
    </div>
  );
}
