import { useEffect, useState } from "react";
import { coursesApi, uploadApi } from "../../lib/api";
import type { Course, Document } from "../../lib/types";
import UploadZone from "../upload/UploadZone";

interface Props {
  courseId: number;
}

export default function CourseDetail({ courseId }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);

  const loadDocs = () => uploadApi.list(courseId).then(setDocs);

  useEffect(() => {
    coursesApi.get(courseId).then(setCourse);
    loadDocs();
  }, [courseId]);

  const deleteDoc = async (docId: number) => {
    await uploadApi.delete(courseId, docId);
    loadDocs();
  };

  if (!course) return <p className="text-zinc-500 text-sm">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: course.color }} />
        <h2 className="text-xl font-semibold">{course.title}</h2>
      </div>

      <UploadZone courseId={courseId} onUploaded={() => loadDocs()} />

      <section>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Documents ({docs.length})
        </h3>
        <div className="space-y-2">
          {docs.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3"
            >
              <div>
                <p className="text-sm text-zinc-200">{d.filename}</p>
                <p className="text-xs text-zinc-500">
                  {d.indexed ? `${d.chunk_count} chunks indexed` : "Indexing…"}
                </p>
              </div>
              <button
                onClick={() => deleteDoc(d.id)}
                className="text-xs text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
          {docs.length === 0 && <p className="text-zinc-500 text-sm">No documents yet.</p>}
        </div>
      </section>
    </div>
  );
}
