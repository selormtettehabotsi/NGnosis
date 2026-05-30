import { useCallback, useState } from "react";
import { uploadApi } from "../../lib/api";
import type { Document } from "../../lib/types";
import { fileSizeLabel } from "../../lib/utils";

interface Props {
  courseId: number;
  onUploaded: (doc: Document) => void;
}

export default function UploadZone({ courseId, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const doc = await uploadApi.upload(courseId, file);
        onUploaded(doc);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [courseId, onUploaded]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition-colors ${
          dragging ? "border-indigo-400 bg-indigo-900/20" : "border-zinc-700 hover:border-zinc-500"
        }`}
      >
        <input type="file" className="hidden" accept=".pdf,.md,.txt,.rst" onChange={onFileInput} />
        {uploading ? (
          <p className="text-sm text-zinc-400">Uploading…</p>
        ) : (
          <>
            <p className="text-sm text-zinc-300">Drop a file here or click to browse</p>
            <p className="text-xs text-zinc-500 mt-1">PDF, Markdown, TXT — max 50 MB</p>
          </>
        )}
      </label>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
