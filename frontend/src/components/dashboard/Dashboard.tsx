import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "../../lib/api";
import type { Course } from "../../lib/types";
import { formatDate, formatScore } from "../../lib/utils";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi.list().then(setCourses).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Courses" value={courses.length} />
        <StatCard label="Documents" value={courses.reduce((s, c) => s + c.document_count, 0)} />
        <StatCard label="Notes" value={courses.reduce((s, c) => s + c.note_count, 0)} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Courses</h2>
          <Link to="/knowledge-base" className="text-sm text-indigo-400 hover:underline">
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
          {courses.length === 0 && (
            <p className="col-span-2 text-zinc-500 text-sm">
              No courses yet.{" "}
              <Link to="/knowledge-base" className="text-indigo-400 hover:underline">
                Create one
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-zinc-100 mt-1">{value}</p>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/knowledge-base/${course.id}`}
      className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 hover:border-indigo-600 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: course.color }}
        />
        <h3 className="font-medium text-zinc-100 truncate">{course.title}</h3>
      </div>
      <p className="text-xs text-zinc-500">
        {course.document_count} docs · {course.note_count} notes · updated {formatDate(course.updated_at)}
      </p>
    </Link>
  );
}
