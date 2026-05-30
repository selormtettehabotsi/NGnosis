import { useEffect, useState } from "react";
import { notesApi } from "../lib/api";
import type { Note } from "../lib/types";
import { formatDate } from "../lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { notesApi.list().then(setNotes); }, []);

  const select = (note: Note) => {
    setSelected(note);
    setContent(note.content);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    const updated = await notesApi.update(selected.id, { content });
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelected(updated);
    setSaving(false);
  };

  return (
    <div className="flex gap-4 h-full">
      <aside className="w-56 flex-shrink-0 space-y-1">
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => select(n)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              selected?.id === n.id
                ? "bg-indigo-600 text-white"
                : "text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            <p className="truncate font-medium">{n.title}</p>
            <p className="text-xs opacity-60">{formatDate(n.updated_at)}</p>
          </button>
        ))}
        {notes.length === 0 && <p className="text-zinc-500 text-xs px-3">No notes yet.</p>}
      </aside>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-zinc-100">{selected.title}</h2>
              <button
                onClick={save}
                disabled={saving}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-md disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-4 text-sm text-zinc-100 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
            Select a note to edit
          </div>
        )}
      </div>
    </div>
  );
}
