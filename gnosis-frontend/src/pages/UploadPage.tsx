import { useState } from 'react';
import { PenLine } from 'lucide-react';
import DropZone from '../components/upload/DropZone';
import UploadQueue from '../components/upload/UploadQueue';
import { useCourses, useUpload } from '../hooks';

const MOCK_COURSES = [
  { code: 'ECON 201', name: 'Microeconomics', color: '#1D9E75', noteCount: 9, coverage: 65 },
  { code: 'BIO 102', name: 'Introductory Biology', color: '#378ADD', noteCount: 7, coverage: 40 },
  { code: 'CHEM 301', name: 'Organic Chemistry', color: '#BA7517', noteCount: 0, coverage: 0 },
];

export default function UploadPage() {
  const { courses } = useCourses();
  const { queue, upload, removeFromQueue } = useUpload();
  const [selectedCourse, setSelectedCourse] = useState('ECON 201');
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNote, setShowQuickNote] = useState(false);

  const displayCourses = courses.length ? courses : MOCK_COURSES;

  const handleFiles = (files: File[]) => {
    files.forEach(f => upload(f, selectedCourse));
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-medium text-gray-900 tracking-tight">Upload Notes</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Drop in PDFs, DOCX, or markdown files. Gnosis will chunk, embed, and index them for Claude.
        </p>
      </div>

      {/* Course selector */}
      <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-2">Select course</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {displayCourses.map(c => (
          <button
            key={c.code}
            onClick={() => setSelectedCourse(c.code)}
            className={`px-3.5 py-1.5 rounded-full border text-[12px] transition-all ${
              selectedCourse === c.code
                ? 'bg-[#E1F5EE] text-[#0F6E56] border-[#5DCAA5] font-medium'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c.code}
          </button>
        ))}
        <button className="px-3.5 py-1.5 rounded-full border border-dashed border-gray-200 text-[12px] text-gray-400 hover:border-gray-300 transition-all">
          + New course
        </button>
      </div>

      {/* Dropzone */}
      <div className="mb-5">
        <DropZone onFiles={handleFiles} />
      </div>

      {/* Quick capture toggle */}
      <button
        onClick={() => setShowQuickNote(v => !v)}
        className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-800 transition-colors mb-5"
      >
        <PenLine size={14} />
        {showQuickNote ? 'Hide quick capture' : 'Quick capture a note instead'}
      </button>

      {showQuickNote && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5">
          <p className="text-[12px] font-medium text-gray-400 mb-2 uppercase tracking-[0.6px]">Quick Note</p>
          <textarea
            className="w-full h-32 text-[13px] text-gray-800 resize-none outline-none placeholder:text-gray-300"
            placeholder="Type or paste your notes here..."
            value={quickNote}
            onChange={e => setQuickNote(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              disabled={!quickNote.trim()}
              className="px-4 py-1.5 bg-[#1D9E75] text-white text-[12px] font-medium rounded-lg disabled:opacity-40 transition-opacity"
            >
              Save to {selectedCourse}
            </button>
          </div>
        </div>
      )}

      {/* Queue */}
      <UploadQueue items={queue} onRemove={removeFromQueue} />

      {/* Empty queue hint */}
      {!queue.length && (
        <div className="mt-2">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-3">Previously uploaded</p>
          {[
            { id: 'p1', filename: 'supply_demand_week3.pdf', size: '1.2 MB', course_code: 'ECON 201', progress: 100, status: 'indexed' as const },
            { id: 'p2', filename: 'cell_structure_notes.md', size: '45 KB', course_code: 'BIO 102', progress: 100, status: 'indexed' as const },
          ].map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg mb-2 opacity-60">
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-gray-500 uppercase">{item.filename.split('.').pop()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">{item.filename}</p>
                <p className="text-[11px] text-gray-400">{item.size} · {item.course_code}</p>
              </div>
              <span className="text-[11px] font-medium text-[#1D9E75]">Indexed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
