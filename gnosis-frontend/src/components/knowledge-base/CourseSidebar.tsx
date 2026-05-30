import { cn } from '../../lib/utils';
import type { Course } from '../../lib/types';

interface SidebarItem {
  id: string;
  label: string;
  count: number;
  dividerBefore?: boolean;
  color?: string;
}

interface Props {
  courses: Course[];
  totalNotes: number;
  aiCount: number;
  gapCount: number;
  active: string;
  onChange: (id: string) => void;
}

export default function CourseSidebar({ courses, totalNotes, aiCount, gapCount, active, onChange }: Props) {
  const items: SidebarItem[] = [
    { id: 'all', label: 'All notes', count: totalNotes },
    ...courses.map(c => ({ id: c.code, label: c.code, count: c.noteCount, color: c.color })),
    { id: 'ai', label: 'AI Generated', count: aiCount, dividerBefore: true },
    { id: 'gaps', label: 'Gap Notes', count: gapCount },
  ];

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.dividerBefore && <div className="border-t border-gray-100 my-2" />}
          <button
            onClick={() => onChange(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-all text-left',
              active === item.id
                ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            )}
          >
            <div className="flex items-center gap-2">
              {item.color && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              )}
              <span>{item.label}</span>
            </div>
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-full',
              active === item.id ? 'bg-[#9FE1CB] text-[#085041]' : 'bg-gray-100 text-gray-400'
            )}>
              {item.count}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
