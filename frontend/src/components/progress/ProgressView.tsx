import { useEffect, useState } from "react";
import { progressApi } from "../../lib/api";
import type { CourseProgressSummary, TopicScore } from "../../lib/types";
import { formatScore, scoreToColor } from "../../lib/utils";

interface Props {
  courseId: number;
}

export default function ProgressView({ courseId }: Props) {
  const [summary, setSummary] = useState<CourseProgressSummary | null>(null);
  const [topics, setTopics] = useState<TopicScore[]>([]);

  useEffect(() => {
    progressApi.getCourse(courseId).then(setSummary);
    progressApi.getTopics(courseId).then(setTopics);
  }, [courseId]);

  if (!summary) return <p className="text-zinc-500 text-sm">Loading progress…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatTile label="Topics Covered" value={summary.topic_count.toString()} />
        <StatTile label="Avg Score" value={formatScore(summary.average_score)} />
        <StatTile label="Sessions" value={summary.sessions.length.toString()} />
      </div>

      <section>
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Topic Mastery
        </h3>
        <div className="space-y-2">
          {topics.map((t) => (
            <div key={t.topic} className="flex items-center gap-3">
              <div className="flex-1 text-sm text-zinc-300 truncate">{t.topic}</div>
              <div className="w-32 bg-zinc-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${Math.round(t.latest_score * 100)}%` }}
                />
              </div>
              <span className={`text-xs font-mono w-10 text-right ${scoreToColor(t.latest_score)}`}>
                {formatScore(t.latest_score)}
              </span>
            </div>
          ))}
          {topics.length === 0 && (
            <p className="text-zinc-500 text-sm">No progress recorded yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-zinc-100 mt-1">{value}</p>
    </div>
  );
}
