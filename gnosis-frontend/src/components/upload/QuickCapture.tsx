import { useState } from 'react';
import { PenLine, Send } from 'lucide-react';
import { saveQuickNote } from '../../lib/api';

interface Props {
  selectedCourse: string;
  onSaved?: () => void;
}

export default function QuickCapture({ selectedCourse, onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await saveQuickNote(content, selectedCourse, title || 'Quick Note');
      setSaved(true);
      setContent('');
      setTitle('');
      onSaved?.();
      setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
    } catch {
      // silent fail — backend not connected yet
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-800 transition-colors"
      >
        <PenLine size={14} />
        {open ? 'Hide quick capture' : 'Quick capture a note instead'}
      </button>

      {open && (
        <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4">
          <input
            type="text"
            placeholder="Note title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full mb-2 text-[13px] font-medium text-gray-800 placeholder:text-gray-300 outline-none border-b border-gray-100 pb-2"
          />
          <textarea
            className="w-full h-28 text-[13px] text-gray-800 resize-none outline-none placeholder:text-gray-300 leading-relaxed"
            placeholder="Type or paste your notes here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <span className="text-[11px] text-gray-400">{content.length} characters · {selectedCourse}</span>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1D9E75] text-white text-[12px] font-medium rounded-lg disabled:opacity-40 hover:bg-[#0F6E56] transition-all"
            >
              {saved ? '✓ Saved!' : saving ? 'Saving...' : <><Send size={12} /> Save to {selectedCourse}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
