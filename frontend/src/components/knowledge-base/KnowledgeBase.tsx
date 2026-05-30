import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { coursesApi } from "../../lib/api";
import type { Course } from "../../lib/types";
import CreateCourseModal from "./CreateCourseModal";

export default function KnowledgeBase() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => coursesApi.list().then(setCourses);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this course and all its data?")) return;
    await coursesApi.delete(id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md"
        >
          + New Course
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
              <Link
                to={`/knowledge-base/${c.id}`}
                className="font-medium text-zinc-100 hover:text-indigo-400 truncate"
              >
                {c.title}
              </Link>
            </div>
            {c.description && <p className="text-xs text-zinc-500">{c.description}</p>}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800">
              <span className="text-xs text-zinc-500">
                {c.document_count} docs · {c.note_count} notes
              </span>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <CreateCourseModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { load(); setShowCreate(false); }}
        />
      )}
    </div>
  );
}
