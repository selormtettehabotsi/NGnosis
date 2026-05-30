import { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useNotes, useCourses } from '../hooks';
import { cn, formatRelativeTime } from '../lib/utils';
import type { Note } from '../lib/types';

const MOCK_NOTES: Note[] = [
  { doc_id: '1', title: 'Supply & Demand — Week 3', course_code: 'ECON 201', note_type: 'note', source: 'upload', file_type: 'pdf', excerpt: 'Law of demand states that as price increases, quantity demanded falls. Market equilibrium occurs where supply and demand curves intersect...', chunk_count: 12, reference_count: 8, created_at: new Date(Date.now() - 3600000 * 48).toISOString() },
  { doc_id: '2', title: 'Elasticity — Chapter Summary', course_code: 'ECON 201', note_type: 'summary', source: 'claude_generated', file_type: 'md', excerpt: 'Price elasticity measures responsiveness of quantity to price changes. Coverage flagged as thin — formula: PED = %ΔQd / %ΔP...', chunk_count: 4, reference_count: 3, created_at: new Date(Date.now() - 3600000 * 168).toISOString() },
  { doc_id: '3', title: 'Cell Structure & Organelles', course_code: 'BIO 102', note_type: 'note', source: 'upload', file_type: 'md', excerpt: 'Eukaryotic cells contain membrane-bound organelles. Mitochondria produce ATP. Electron transport chain coverage is thin in these notes...', chunk_count: 8, reference_count: 5, created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
  { doc_id: '4', title: 'Market Structures', course_code: 'ECON 201', note_type: 'note', source: 'upload', file_type: 'pdf', excerpt: 'Perfect competition, monopoly, oligopoly, and monopolistic competition. Firms are price takers under perfect competition...', chunk_count: 10, reference_count: 6, created_at: new Date(Date.now() - 3600000 * 120).toISOString() },
  { doc_id: '5', title: 'ETC — Gap Note', course_code: 'BIO 102', note_type: 'gap', source: 'claude_generated', file_type: 'md', excerpt: 'Identified gap: Electron Transport Chain. You mentioned this is confusing. NADH donates electrons at Complex I, proton gradient drives ATP synthase...', chunk_count: 3, reference_count: 2, created_at: new Date(Date.now() - 3600000 * 96).toISOString() },
];

const FILE_TYPE_STYLE: Record<string, string> = {
  pdf: 'bg-blue-50 text-blue-700',
  md: 'bg-green-50 text-green-700',
  docx: 'bg-purple-50 text-purple-700',
  txt: 'bg-gray-100 text-gray-600',
};

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3.5 mb-2.5 cursor-pointer hover:border-gray-200 transition-all group">
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-[13px] font-medium text-gray-900 flex-1 mr-2">{note.title}</p>
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', FILE_TYPE_STYLE[note.file_type])}>
            {note.file_type.toUpperCase()}
          </span>
          {note.source === 'claude_generated' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700">AI</span>
          )}
          <button
            onClick={e => { e.stopPropagation(); onDelete(note.doc_id); }}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
          >
            <Trash2 size={12} />
          </button>
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

export default function KnowledgeBasePage() {
  const { notes: fetchedNotes, deleteNote } = useNotes();
  const { courses } = useCourses();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const notes = fetchedNotes.length ? fetchedNotes : MOCK_NOTES;

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'all' ||
      activeFilter === n.course_code ||
      (activeFilter === 'ai' && n.source === 'claude_generated') ||
      (activeFilter === 'gaps' && n.note_type === 'gap');
    return matchSearch && matchFilter;
  });

  const displayCourses = courses.length ? courses : [
    { code: 'ECON 201', noteCount: 9 },
    { code: 'BIO 102', noteCount: 7 },
    { code: 'CHEM 301', noteCount: 0 },
  ];

  const sidebarItems = [
    { id: 'all', label: 'All notes', count: notes.length },
    ...displayCourses.map(c => ({ id: c.code, label: c.code, count: c.noteCount })),
    { id: 'divider', label: '', count: 0 },
    { id: 'ai', label: 'AI Generated', count: notes.filter(n => n.source === 'claude_generated').length },
    { id: 'gaps', label: 'Gap Notes', count: notes.filter(n => n.note_type === 'gap').length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[22px] font-medium text-gray-900 tracking-tight">Knowledge Base</h2>
        <p className="text-[13px] text-gray-500 mt-1">{notes.length} notes across {displayCourses.length} courses — indexed and ready for Claude.</p>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search your notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-800 placeholder:text-gray-300 outline-none focus:border-[#5DCAA5] transition-colors bg-white"
        />
      </div>

      <div className="grid grid-cols-[175px_1fr] gap-4">
        {/* Sidebar */}
        <div>
          {sidebarItems.map(item => {
            if (item.id === 'divider') return <div key="div" className="border-t border-gray-100 my-2" />;
            return (
              <button
                key={item.id}
                onClick={() => setActiveFilter(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-all',
                  activeFilter === item.id
                    ? 'bg-[#E1F5EE] text-[#0F6E56] font-medium'
                    : 'text-gray-500 hover:bg-gray-50'
                )}
              >
                <span>{item.label}</span>
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  activeFilter === item.id ? 'bg-[#9FE1CB] text-[#085041]' : 'bg-gray-100 text-gray-400'
                )}>
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notes list */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-[13px]">No notes found.</div>
          ) : (
            filtered.map(note => (
              <NoteCard key={note.doc_id} note={note} onDelete={deleteNote} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
