import { useNavigate } from 'react-router-dom';
import type { Course } from '../../lib/types';
import { getCourseColor } from '../../lib/utils';

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  const navigate = useNavigate();
  const color = getCourseColor(course.code, course.color);

  return (
    <div
      onClick={() => navigate(`/knowledge?course=${course.code}`)}
      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:border-gray-200 transition-all"
    >
      <div className="w-2.5 h-2.5 rounded-full mb-3" style={{ background: color }} />
      <p className="text-[11px] text-gray-400 mb-0.5">{course.code}</p>
      <p className="text-[14px] font-medium text-gray-900 mb-2.5 leading-snug">{course.name}</p>
      <div className="h-1 bg-gray-100 rounded-full mb-2 overflow-hidden">
        <div
          className="h-1 rounded-full transition-all duration-500"
          style={{ width: `${course.coverage}%`, background: color }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>{course.noteCount} note{course.noteCount !== 1 ? 's' : ''}</span>
        <span>{course.coverage > 0 ? `${course.coverage}% covered` : 'Empty'}</span>
      </div>
    </div>
  );
}
