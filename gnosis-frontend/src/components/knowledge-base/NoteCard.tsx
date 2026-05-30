import { Trash2 } from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import type { Note } from '../../lib/types';

interface Props {
  note: Note;
  onClick?: (note: Note) => void;
  onDelete?: (doc_id: string) => void;
}

const FILE_TYPE_STYLE: Record<string, string> = {
  pdf:  'bg-blue-50 text-blue-700',
  md:   'bg-green-50 text-green-700',
  docx: 'bg-purple-50 text-purple-700',
  txt:  'bg-gray-100 text-gray-600',
};

const NOTE_TYPE_LABEL: Record<string, string> = {
  note:    '',
  summary: 'Summary',
  gap:     'Gap',
};

const NOTE_TYPE_STYLE: Record<string, string> = {
  summary: 'bg-purple-50 text-purple-700',
  gap:     'bg-amber-50 text-amber-700',
};

export default function NoteCard({ note, onClick, onDelete }: Props) {
  return (
    <div
      onClick={() => onClick?.(note)}
      className={cn(
        'bg-white border border-gray-100 rounded-lg p-3.5 mb-2.5 transition-all group',
        onClick && 'cursor-pointer hover:border-gray-200'
      )}
    >
      <div className="flex items-start justify-between mb-1.5 gap-2">
        <p className="text-[13px] font-medium text-gray-900 flex-1 leading-snug">{note.title}</p>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', FILE_TYPE_STYLE[note.file_type])}>
            {note.file_type.toUpperCase()}
          </span>
          {note.note_type !== 'note' && (
            <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', NOTE_TYPE_STYLE[note.note_type])}>
              {NOTE_TYPE_LABEL[note.note_type]}
            </span>
          )}
          {note.source === 'claude_generated' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700">AI</span>
          )}
          {onDelete && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(note.doc_id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all ml-0.5"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
      <p className="text-[12px] text-gray-500 line-clamp-2 mb-2 leading-relaxed">{note.excerpt}</p>
      <div className="flex gap-3 text-[11px] text-gray-400">
        <span>{note.course_code}</span>
        <span>{note.chunk_count} chunks</span>
        <span>Refs: {note.reference_count}</span>
        <span>{formatRelativeTime(note.created_at)}</span>
      </div>
    </div>
  );
}
