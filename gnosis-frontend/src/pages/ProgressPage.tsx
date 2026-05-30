import { CheckCircle2, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import { useProgress, useCourses } from '../hooks';
import { formatRelativeTime } from '../lib/utils';

// ── Mock data ─────────────────────────────────────────────────
const MOCK_STATS = {
  total_notes: 1248, total_sessions: 128,
  gaps_found: 7, gaps_resolved: 0,
  overall_coverage: 84, study_hours_this_week: 14,
  socratic_score: 98,
};

const MOCK_COURSES = [
  { code: 'PSY-402', name: 'Advanced Cognitive Psychology', semester: 'Semester 2', covered: 72, gaps: 15, status: 'mastered' },
  { code: 'POL-210', name: 'Modern Political Theory', semester: 'Semester 2', covered: 45, gaps: 35, status: 'review' },
  { code: 'CS-512', name: 'Neural Network Architectures', semester: 'Semester 1', covered: 60, gaps: 5, status: 'inactive' },
];

const MOCK_TIMELINE = [
  { id: '1', label: 'TODAY, 09:15 AM', icon: '●', event: 'Resolved: Hegelian Dialectics', detail: 'Gaps filled after 45m deep study session.', color: '#4A7C59' },
  { id: '2', label: 'YESTERDAY, 04:39 PM', icon: 'B', event: 'New Entry: Epistemology PDF', detail: '24 topics extracted by AI.', color: '#1C1C2E' },
  { id: '3', label: '2 DAYS AGO', icon: 'P', event: 'Knowledge Gap Detected', detail: 'Context: Correlation vs Causality in Social Stats.', color: '#C49A3C' },
];

const MOCK_TOPICS = [
  { id: '1', name: 'The Social Contract', status: 'done' },
  { id: '2', name: 'Utilitarianism vs Deontology', status: 'gap', badge: 'PRIORITY GAP' },
  { id: '3', name: 'Post-Colonial Theory', status: 'untouched' },
  { id: '4', name: 'The State of Nature', status: 'done' },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  mastered:  { label: '72% Mastered', cls: 'bg-[#E6F4EC] text-[#2D6A4F]' },
  review:    { label: 'Needs Review', cls: 'bg-[#FBF4E1] text-[#8B6914]' },
  inactive:  { label: 'Inactive',     cls: 'bg-[#F0EBE3] text-[#6B6560]' },
};

// ── Page ──────────────────────────────────────────────────────
export default function ProgressPage() {
  const { stats: fetchedStats, timeline: fetchedTimeline } = useProgress();
  const { courses: fetchedCourses } = useCourses();

  const stats = fetchedStats ?? MOCK_STATS;
  const courses = fetchedCourses.length ? fetchedCourses : MOCK_COURSES;
  const timeline = fetchedTimeline.length ? fetchedTimeline : MOCK_TIMELINE;

  const topStats = [
    { delta: '+12 this week',    value: stats.total_notes.toLocaleString(), label: 'TOTAL NOTES',     highlight: false },
    { delta: '84% complete',     value: String(stats.overall_coverage),    label: 'TOPICS COVERED',  highlight: false },
    { delta: 'Priority focus',   value: String(stats.gaps_found).padStart(2, '0'), label: 'KNOWLEDGE GAPS', highlight: true },
    { delta: '14.2h avg/mo',     value: String(stats.total_sessions),      label: 'STUDY SESSIONS',  highlight: false },
  ];

  return (
    <div>
      {/* ── Top stat blocks ── */}
      <div className="grid grid-cols-4 gap-0 mb-8 border border-[#E5DDD5] rounded-2xl overflow-hidden bg-white">
        {topStats.map((s, i) => (
          <div
            key={s.label}
            className={`p-5 ${i < 3 ? 'border-r border-[#E5DDD5]' : ''} ${s.highlight ? 'bg-[#FBF4E1]' : ''}`}
          >
            <p className={`text-[11px] mb-2 font-medium ${s.highlight ? 'text-[#C49A3C]' : 'text-[#9E9890]'}`}>
              {s.delta}
            </p>
            <p className="text-[36px] font-bold text-[#1A1714] leading-none mb-1">{s.value}</p>
            <p className="text-[9px] uppercase tracking-[1.2px] text-[#9E9890]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Course Progress + Learning Timeline ── */}
      <div className="grid grid-cols-[1fr_300px] gap-6 mb-8">

        {/* Course Progress */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-[17px] font-semibold text-[#1A1714]">Course Progress</h3>
            <span className="text-[11px] text-[#9E9890] italic">Curated from latest uploads</span>
          </div>
          <div className="space-y-3">
            {(courses as typeof MOCK_COURSES).map(c => {
              const cov = (c as typeof MOCK_COURSES[0]).covered ?? 50;
              const gps = (c as typeof MOCK_COURSES[0]).gaps ?? 10;
              const st  = (c as typeof MOCK_COURSES[0]).status ?? 'mastered';
              const badge = STATUS_BADGE[st] ?? STATUS_BADGE.inactive;
              return (
                <div key={c.code} className="bg-white border border-[#E5DDD5] rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1A1714]">{c.name}</p>
                      <p className="text-[11px] text-[#9E9890]">
                        {c.code} · {(c as typeof MOCK_COURSES[0]).semester ?? 'Semester 1'}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden gap-px mb-2">
                    <div style={{ width: `${cov}%`, background: '#4A7C59' }} className="rounded-l-full" />
                    <div style={{ width: `${gps}%`, background: '#D4A843' }} />
                    <div style={{ width: `${Math.max(0, 100 - cov - gps)}%`, background: '#E5DDD5' }} className="rounded-r-full" />
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#9E9890]">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4A7C59] inline-block" />Covered</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D4A843] inline-block" />Gaps</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5DDD5] inline-block" />Untouched</span>
                    {st !== 'mastered' && (
                      <span className="ml-auto">{cov}% Covered · {gps}% Gaps</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Timeline */}
        <div>
          <h3 className="text-[17px] font-semibold text-[#1A1714] mb-4">Learning Timeline</h3>
          <div className="bg-white border border-[#E5DDD5] rounded-2xl p-5">
            <div className="relative pl-6">
              {(timeline as typeof MOCK_TIMELINE).map((event, i) => (
                <div key={event.id} className={`relative ${i < timeline.length - 1 ? 'pb-5' : ''}`}>
                  {/* Connector line */}
                  {i < timeline.length - 1 && (
                    <div className="absolute left-[-15px] top-[20px] bottom-0 w-px bg-[#E5DDD5]" />
                  )}
                  {/* Icon */}
                  <div
                    className="absolute left-[-22px] top-0 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: (event as typeof MOCK_TIMELINE[0]).color ?? '#1C1C2E' }}
                  >
                    {(event as typeof MOCK_TIMELINE[0]).icon === '●' ? '' : (event as typeof MOCK_TIMELINE[0]).icon ?? ''}
                  </div>
                  <p className="text-[9px] uppercase tracking-[1px] text-[#9E9890] mb-0.5">
                    {(event as typeof MOCK_TIMELINE[0]).label ?? formatRelativeTime('')}
                  </p>
                  <p className="text-[13px] font-semibold text-[#1A1714] mb-0.5">
                    {(event as typeof MOCK_TIMELINE[0]).event}
                  </p>
                  <p className="text-[11px] text-[#6B6560] leading-relaxed">
                    {(event as typeof MOCK_TIMELINE[0]).detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic Deep Dive ── */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 className="text-[17px] font-semibold text-[#1A1714]">Topic Deep Dive</h3>
            <p className="text-[11px] text-[#C49A3C] font-medium mt-0.5">Context: Modern Political Theory</p>
          </div>
          <button className="flex items-center gap-1 text-[12px] text-[#6B6560] hover:text-[#1A1714] transition-colors font-medium">
            View All Topics <ChevronRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-5">
          {/* Topic list */}
          <div className="space-y-2">
            {MOCK_TOPICS.map(topic => (
              <div
                key={topic.id}
                className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer hover:border-[#C49A3C] transition-all ${
                  topic.status === 'gap' ? 'bg-[#FBF4E1] border-[#E8D8A0]' : 'bg-white border-[#E5DDD5]'
                }`}
              >
                {topic.status === 'done'     && <CheckCircle2 size={18} className="text-[#4A7C59] shrink-0" strokeWidth={1.5} />}
                {topic.status === 'gap'      && <AlertTriangle size={18} className="text-[#C49A3C] shrink-0" strokeWidth={1.5} />}
                {topic.status === 'untouched'&& <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C4BDB6] shrink-0" />}
                <span className={`text-[13px] font-medium flex-1 ${topic.status === 'untouched' ? 'text-[#9E9890]' : 'text-[#1A1714]'}`}>
                  {topic.name}
                </span>
                {topic.badge && (
                  <span className="text-[9px] uppercase tracking-[0.5px] font-semibold px-2.5 py-1 rounded-full bg-[#C49A3C] text-white">
                    {topic.badge}
                  </span>
                )}
                <ChevronRight size={14} className="text-[#C4BDB6]" strokeWidth={1.5} />
              </div>
            ))}
          </div>

          {/* AI Insight card */}
          <div className="bg-[#FAF8F5] border border-[#E5DDD5] rounded-2xl p-5 flex flex-col">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-[#C49A3C]" strokeWidth={1.5} />
              <span className="text-[9px] uppercase tracking-[1.5px] text-[#9E9890] font-medium">AI Insight Gap Analysis</span>
            </div>
            <h4
              className="text-[22px] font-semibold text-[#1A1714] leading-tight mb-3"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bridge the gap between Bentham and Kant.
            </h4>
            <p className="text-[12px] text-[#6B6560] leading-relaxed mb-4">
              You've mastered the principle of 'greatest good', but you're struggling to reconcile it with categorical imperatives.
              Gnosis suggests connecting these two concepts via the 'rule utilitarianism' framework found in your Week 8 notes.
            </p>
            <div className="bg-white border border-[#E5DDD5] rounded-xl p-3 mb-4">
              <p className="text-[9px] uppercase tracking-[1px] text-[#9E9890] mb-1">Recommended Reading:</p>
              <p className="text-[12px] font-medium text-[#1A1714] italic">
                "Groundwork of the Metaphysics of Morals" – Section 2
              </p>
            </div>
            <button className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-[#1C1C2E] text-white text-[13px] font-semibold rounded-xl hover:bg-[#2D2D42] transition-colors">
              <Sparkles size={14} strokeWidth={1.5} />
              Study with Claude
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
