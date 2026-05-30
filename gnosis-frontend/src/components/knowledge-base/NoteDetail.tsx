import { X, ExternalLink, Clock, Hash, BarChart2 } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import type { Note } from '../../lib/types';

interface Props {
  note: Note | null;
  onClose: () => void;
}

const FILE_TYPE_STYLE: Record<string, string> = {
  pdf:  'bg-blue-50 text-blue-700',
  md:   'bg-green-50 text-green-700',
  docx: 'bg-purple-50 text-purple-700',
  txt:  'bg-gray-100 text-gray-600',
};

export default function NoteDetail({ note, onClose }: Props) {
  if (!note) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white border-l border-gray-100 z-40 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', FILE_TYPE_STYLE[note.file_type])}>
                {note.file_type.toUpperCase()}
              </span>
              {note.source === 'claude_generated' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700">AI Generated</span>
              )}
            </div>
            <h2 className="text-[16px] font-medium text-gray-900 leading-snug">{note.title}</h2>
            <p className="text-[12px] text-gray-400 mt-1">{note.course_code}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* Meta row */}
        <div className="flex gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock size={12} />
            {formatRelativeTime(note.created_at)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Hash size={12} />
            {note.chunk_count} chunks
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <BarChart2 size={12} />
            {note.reference_count} Claude refs
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-3">Excerpt</p>
          <p className="text-[13px] text-gray-700 leading-relaxed mb-6">{note.excerpt}</p>

          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-3">Full content</p>
          <div className="bg-gray-50 rounded-lg p-4 text-[13px] text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
            {note.excerpt}
            {'\n\n'}[Full content loaded from backend via GET /api/notes/{note.doc_id}]
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
          <button className="flex-1 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
            <ExternalLink size={13} />
            Open file
          </button>
          <button className="flex-1 py-2 bg-red-50 border border-red-100 rounded-lg text-[13px] text-red-500 hover:bg-red-100 transition-colors">
            Delete note
          </button>
        </div>
      </div>
    </>
  );
}
