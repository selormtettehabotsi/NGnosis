import { AlertTriangle, FileText, Clock, Plus, Sparkles } from 'lucide-react';
import { useCourses, useProgress, useProfile } from '../hooks';

// ── Circular progress indicator ──────────────────────────────
function CircularProgress({ value, color = '#C49A3C' }: { value: number; color?: string }) {
  const size = 50;
  const sw = 3.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE8E0" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-semibold text-[#1A1714]">{value}%</span>
      </div>
    </div>
  );
}

// ── Mock data ────────────────────────────────────────────────
const MOCK_COURSES = [
  { code: 'PSY-101', name: 'Intro to Psychology', noteCount: 14, coverage: 75, gapType: 'gap', lastStudied: '2h ago', icon: '⚙' },
  { code: 'CS-201', name: 'Data Structures', noteCount: 18, coverage: 50, gapType: 'critical', lastStudied: '1d ago', icon: '<>' },
  { code: 'ECON-301', name: 'Macroeconomics', noteCount: 10, coverage: 20, gapType: 'tracking', lastStudied: '3d ago', icon: '↗' },
];

const MOCK_FOCUS = [
  { id: '1', topic: 'Recursive Algorithms', tag: 'DATA STRUCTURES', dim: false },
  { id: '2', topic: 'Keynesian Multiplier', tag: 'MACROECONOMICS', dim: false },
  { id: '3', topic: 'Neural Pruning', tag: 'PSYCHOLOGY', dim: true },
];

const MOCK_JOURNAL = [
  { id: '1', time: 'TODAY, 09:12 AM', icon: 'file', event: 'New PDF Uploaded', detail: '"Chapter 4: Monetary Policy.pdf" added to Macroeconomics.', action: null },
  { id: '2', time: 'YESTERDAY', icon: 'warning', event: 'AI Gap Detected', detail: 'Inconsistency found in "Recursive Algorithms" notes.', action: 'Fix Gap' },
  { id: '3', time: 'OCT 24, 2023', icon: 'star', event: 'AI Summary Generated', detail: 'High-level distillation for Psychology lecture ready.', action: null },
  { id: '4', time: '', icon: 'tip', event: 'Pro Tip', detail: 'Connecting your calendar allows the Digital Curator to prioritize knowledge gaps before upcoming exams.', action: 'Connect Calendar' },
];

const GAP_BADGE: Record<string, { label: string; cls: string; bar: string }> = {
  gap:      { label: '1 GAP FOUND',  cls: 'text-amber-700 bg-amber-50',  bar: '#C49A3C' },
  critical: { label: 'CRITICAL GAP', cls: 'text-red-700 bg-red-50',      bar: '#D4522A' },
  tracking: { label: 'TRACKING',     cls: 'text-[#6B6560] bg-[#F0EBE3]', bar: '#C49A3C' },
};

// ── Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useProfile();
  const { courses } = useCourses();
  const { gaps } = useProgress();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const name = profile?.name ?? 'Kofi';
  const displayCourses = courses.length ? courses : MOCK_COURSES;
  const activeGaps = gaps.filter(g => g.status === 'active');
  const focusItems = activeGaps.length ? activeGaps.map((g, i) => ({
    id: g.id, topic: g.topic, tag: g.course_code, dim: i >= 2,
  })) : MOCK_FOCUS;

  return (
    <div>
      {/* ── Greeting + CTA ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h2
            className="font-serif text-[46px] font-semibold text-[#1A1714] leading-none tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {greeting()}, {name}
          </h2>
          <p className="text-[14px] text-[#6B6560] mt-2.5">
            Your digital curator has identified{' '}
            <span className="text-[#C49A3C] font-semibold">{focusItems.length} Knowledge Gaps</span>{' '}
            across your courses.
          </p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 bg-[#F5E6C8] text-[#7A5C1E] text-[13px] font-semibold rounded-2xl hover:bg-[#EDD9A3] transition-colors whitespace-nowrap mt-3 shrink-0">
          Start Studying with Claude
          <span className="text-[15px]">✦</span>
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-7">
        {/* Courses */}
        <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#F0EBE3] rounded-xl flex items-center justify-center shrink-0 text-[20px]">
              🎓
            </div>
            <div>
              <p className="text-[26px] font-bold text-[#1A1714] leading-none">{displayCourses.length || 4} Courses</p>
              <p className="text-[9px] uppercase tracking-[1.2px] text-[#9E9890] mt-1">Active Enrollment</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#F0EBE3] rounded-xl flex items-center justify-center shrink-0">
              <FileText size={18} className="text-[#6B6560]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[26px] font-bold text-[#1A1714] leading-none">42 Notes</p>
              <p className="text-[9px] uppercase tracking-[1.2px] text-[#9E9890] mt-1">Archived Insights</p>
            </div>
          </div>
        </div>

        {/* Knowledge Gaps — amber accent */}
        <div className="bg-[#FBF4E1] border border-[#E8D8A0] rounded-2xl p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#F5E6C8] rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-[#C49A3C]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[26px] font-bold text-[#1A1714] leading-none">
                {focusItems.length} Knowledge{'\n'}Gaps
              </p>
              <p className="text-[9px] uppercase tracking-[1.2px] text-[#B8860B] mt-1">Priority Focus</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Knowledge Focus ── */}
      <div className="mb-7">
        <div className="flex items-baseline gap-3 mb-3">
          <h3 className="text-[15px] font-semibold text-[#1A1714]">Knowledge Focus</h3>
          <span className="text-[9px] uppercase tracking-[1.5px] text-[#9E9890]">Priority Marginalia</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {focusItems.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E5DDD5] rounded-full transition-opacity ${i >= 2 ? 'opacity-40' : ''}`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${i >= 2 ? 'bg-[#C4BDB6]' : 'bg-[#C49A3C]'}`} />
              <span className="text-[13px] font-medium text-[#1A1714]">{item.topic}</span>
              <span className="text-[9px] uppercase tracking-[0.5px] text-[#9E9890] font-medium">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Course Archives + Curator's Journal ── */}
      <div className="grid grid-cols-[1fr_268px] gap-5">

        {/* Course Archives */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1714] mb-4">Course Archives</h3>
          <div className="grid grid-cols-2 gap-3">
            {(displayCourses.slice(0, 3) as typeof MOCK_COURSES).map((course, i) => {
              const gapType = (course as typeof MOCK_COURSES[0]).gapType ?? (i === 0 ? 'gap' : i === 1 ? 'critical' : 'tracking');
              const badge = GAP_BADGE[gapType] ?? GAP_BADGE.tracking;
              return (
                <div
                  key={course.code}
                  className="bg-white border border-[#E5DDD5] rounded-2xl p-4 cursor-pointer hover:border-[#C49A3C] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 bg-[#F0EBE3] rounded-xl flex items-center justify-center text-[13px] text-[#6B6560] font-mono">
                      {(course as typeof MOCK_COURSES[0]).icon ?? '◈'}
                    </div>
                    <CircularProgress value={course.coverage} color={badge.bar} />
                  </div>
                  <p className="text-[15px] font-semibold text-[#1A1714] mb-2">{course.name}</p>
                  <div className="flex items-center gap-3 text-[11px] text-[#9E9890] mb-4">
                    <span className="flex items-center gap-1">
                      <FileText size={10} strokeWidth={1.5} />{course.noteCount} Notes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} strokeWidth={1.5} />{(course as typeof MOCK_COURSES[0]).lastStudied ?? '1d ago'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-[#6B6560] font-medium">Review Library</span>
                    <span className={`text-[9px] uppercase tracking-[0.5px] font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-3 h-px rounded-full" style={{ background: badge.bar, opacity: 0.25 }} />
                </div>
              );
            })}

            {/* Add New Course */}
            <div className="bg-white border border-dashed border-[#C4BDB6] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#C49A3C] transition-all min-h-[188px]">
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C4BDB6] flex items-center justify-center mb-2.5">
                <Plus size={16} className="text-[#9E9890]" strokeWidth={1.5} />
              </div>
              <p className="text-[13px] text-[#9E9890]">Add New Course</p>
            </div>
          </div>
        </div>

        {/* Curator's Journal */}
        <div>
          <h3 className="text-[15px] font-semibold text-[#1A1714] mb-4">Curator's Journal</h3>
          <div className="bg-white border border-[#E5DDD5] rounded-2xl overflow-hidden">
            {MOCK_JOURNAL.map((entry, i) => (
              <div
                key={entry.id}
                className={`p-4 ${i < MOCK_JOURNAL.length - 1 ? 'border-b border-[#F0EBE3]' : ''}`}
              >
                {entry.time && (
                  <p className="text-[9px] uppercase tracking-[1.2px] text-[#9E9890] mb-1.5">{entry.time}</p>
                )}
                <div className="flex gap-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${entry.icon === 'warning' ? 'bg-[#FBF4E1]' : 'bg-[#F0EBE3]'}`}>
                    {entry.icon === 'file'    && <FileText   size={12} className="text-[#6B6560]"  strokeWidth={1.5} />}
                    {entry.icon === 'warning' && <AlertTriangle size={12} className="text-[#C49A3C]" strokeWidth={1.5} />}
                    {entry.icon === 'star'    && <Sparkles   size={12} className="text-[#C49A3C]"  strokeWidth={1.5} />}
                    {entry.icon === 'tip'     && <span className="text-[12px] font-bold text-[#6B6560]">γ</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A1714] mb-0.5">{entry.event}</p>
                    <p className="text-[11px] text-[#6B6560] leading-relaxed">{entry.detail}</p>
                    {entry.action && (
                      <button
                        className={`mt-2.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                          entry.action === 'Connect Calendar'
                            ? 'w-full bg-[#1C1C2E] text-white hover:bg-[#2D2D42]'
                            : 'border border-[#E5DDD5] text-[#1A1714] hover:bg-[#F5F0EA]'
                        }`}
                      >
                        {entry.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
