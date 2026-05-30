import { cn } from '../../lib/utils';
import type { Course } from '../../lib/types';

interface Props {
  courses: Course[];
  selected: string;
  onChange: (code: string) => void;
  onNewCourse?: () => void;
}

export default function CourseSelector({ courses, selected, onChange, onNewCourse }: Props) {
  return (
    <div>
      <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-2">Select course</p>
      <div className="flex gap-2 flex-wrap">
        {courses.map(c => (
          <button
            key={c.code}
            onClick={() => onChange(c.code)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12px] transition-all',
              selected === c.code
                ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#5DCAA5] font-medium'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: c.color }}
            />
            {c.code}
          </button>
        ))}
        <button
          onClick={onNewCourse}
          className="px-3.5 py-1.5 rounded-full border border-dashed border-gray-200 text-[12px] text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all"
        >
          + New course
        </button>
      </div>
    </div>
  );
}
