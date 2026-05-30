import { useState } from "react";
import { coursesApi } from "../../lib/api";

const COLORS = ["#6366f1", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#a855f7"];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCourseModal({ onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await coursesApi.create({ title, description, color });
      onCreated();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-lg font-semibold">New Course</h2>

        <div>
          <label className="text-xs text-zinc-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Operating Systems"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400">Color</label>
          <div className="flex gap-2 mt-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "white" : "transparent",
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
