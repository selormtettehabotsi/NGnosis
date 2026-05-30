import type { TimelineEvent } from '../../lib/types';
import { formatRelativeTime } from '../../lib/utils';

interface Props {
  events: TimelineEvent[];
}

const ACTION_DOT: Record<string, string> = {
  upload:       'bg-blue-400',
  session:      'bg-[#1D9E75]',
  gap_found:    'bg-amber-400',
  gap_resolved: 'bg-[#1D9E75]',
};

export default function Timeline({ events }: Props) {
  if (!events.length) {
    return <p className="text-[13px] text-gray-400 text-center py-6">No activity yet.</p>;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <div className="relative pl-4">
        {events.map((event, i) => (
          <div key={event.id} className="relative pb-5 last:pb-0">
            {/* Dot */}
            <div className={`absolute -left-[7px] top-[5px] w-3 h-3 rounded-full border-2 border-white ${ACTION_DOT[event.action] ?? 'bg-gray-300'}`} />
            {/* Line */}
            {i < events.length - 1 && (
              <div className="absolute -left-[2px] top-[14px] w-px bottom-0 bg-gray-100" />
            )}
            <p className="text-[11px] text-gray-400 mb-0.5">{formatRelativeTime(event.timestamp)}</p>
            <p className="text-[13px] text-gray-800">{event.details}</p>
            {event.course_code && (
              <p className="text-[11px] text-gray-400 mt-0.5">{event.course_code}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
