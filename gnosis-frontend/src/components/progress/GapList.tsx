import { CheckCircle2, AlertTriangle } from 'lucide-react';
import type { KnowledgeGap } from '../../lib/types';

interface Props {
  gaps: KnowledgeGap[];
  onResolve: (id: string) => void;
}

export default function GapList({ gaps, onResolve }: Props) {
  const active = gaps.filter(g => g.status === 'active');
  const resolved = gaps.filter(g => g.status === 'resolved');

  const GapItem = ({ gap }: { gap: KnowledgeGap }) => (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg mb-2">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${gap.status === 'resolved' ? 'bg-[#E1F5EE]' : 'bg-amber-50'}`}>
        {gap.status === 'resolved'
          ? <CheckCircle2 size={13} className="text-[#1D9E75]" />
          : <AlertTriangle size={13} className="text-amber-600" />
        }
      </div>
      <div className="flex-1">
        <p className={`text-[13px] font-medium ${gap.status === 'resolved' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
          {gap.topic}
        </p>
        <p className="text-[11px] text-gray-400">{gap.course_code}</p>
      </div>
      {gap.status === 'active'
        ? <button onClick={() => onResolve(gap.id)} className="text-[11px] text-[#1D9E75] hover:underline font-medium whitespace-nowrap">Mark resolved</button>
        : <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1F5EE] text-[#0F6E56] font-medium">Resolved</span>
      }
    </div>
  );

  return (
    <div>
      {active.map(g => <GapItem key={g.id} gap={g} />)}
      {resolved.length > 0 && (
        <>
          <p className="text-[11px] text-gray-400 mt-4 mb-2">Resolved</p>
          {resolved.map(g => <GapItem key={g.id} gap={g} />)}
        </>
      )}
      {gaps.length === 0 && (
        <p className="text-[13px] text-gray-400 text-center py-6">No knowledge gaps identified yet.</p>
      )}
    </div>
  );
}
