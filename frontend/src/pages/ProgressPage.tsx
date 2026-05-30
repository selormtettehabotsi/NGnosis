import { useEffect, useState } from "react";
import { coursesApi } from "../lib/api";
import type { Course } from "../lib/types";
import ProgressView from "../components/progress/ProgressView";

export default function ProgressPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    coursesApi.list().then((cs) => {
      setCourses(cs);
      if (cs.length > 0) setSelectedId(cs[0].id);
    });
  }, []);

  return (
    <div className="space-y-4">
      {courses.length > 1 && (
        <div className="flex gap-2">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                selectedId === c.id
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
      {selectedId != null ? (
        <ProgressView courseId={selectedId} />
      ) : (
        <p className="text-zinc-500 text-sm">No courses yet.</p>
      )}
    </div>
  );
}
