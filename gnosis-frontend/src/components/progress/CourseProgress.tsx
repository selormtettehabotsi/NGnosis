import type { Course } from '../../lib/types';
import { getCourseColor } from '../../lib/utils';

interface Props {
  courses: Course[];
  gaps: { course_code: string; status: string }[];
}

export default function CourseProgress({ courses, gaps }: Props) {
  return (
    <div>
      {courses.map(c => {
        const color = getCourseColor(c.code, c.color);
        const activeGaps = gaps.filter(g => g.course_code === c.code && g.status === 'active').length;
        return (
          <div key={c.code} className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <p className="text-[14px] font-medium text-gray-900 flex-1">{c.name}</p>
              <p className="text-[13px] text-gray-500 font-medium">{c.coverage}%</p>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full mb-2.5 overflow-hidden">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${c.coverage}%`, background: color }}
              />
            </div>
            <div className="flex gap-4 text-[11px] text-gray-400">
              <span>{c.noteCount} notes</span>
              <span>{activeGaps} gap{activeGaps !== 1 ? 's' : ''} active</span>
              {c.lastStudied && <span>Last: {c.lastStudied}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
