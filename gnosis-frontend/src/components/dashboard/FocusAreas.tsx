import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { KnowledgeGap } from '../../lib/types';
import { formatRelativeTime } from '../../lib/utils';

interface Props {
  gaps: KnowledgeGap[];
}

export default function FocusAreas({ gaps }: Props) {
  const navigate = useNavigate();
  const active = gaps.filter(g => g.status === 'active').slice(0, 3);

  if (!active.length) {
    return (
      <div className="text-center py-6 text-[13px] text-gray-400">
        No active knowledge gaps — you're on top of it 🎉
      </div>
    );
  }

  return (
    <div>
      {active.map(gap => (
        <div key={gap.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg mb-2 group hover:border-gray-200 transition-all cursor-pointer" onClick={() => navigate('/progress')}>
          <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={13} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-gray-900">{gap.topic}</p>
            <p className="text-[11px] text-gray-400">{gap.course_code} · found {formatRelativeTime(gap.identified_at)}</p>
          </div>
          <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
      ))}
      {gaps.filter(g => g.status === 'active').length > 3 && (
        <button onClick={() => navigate('/progress')} className="text-[12px] text-[#1D9E75] hover:underline mt-1">
          +{gaps.filter(g => g.status === 'active').length - 3} more gaps — view all
        </button>
      )}
    </div>
  );
}
