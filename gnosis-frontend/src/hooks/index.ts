import { useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';
import type { Course, Note, KnowledgeGap, ProgressStats, TimelineEvent, StudentProfile } from '../lib/types';

// ── useCourses ──────────────────────────────────────────────
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCourses();
      setCourses(data);
    } catch {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { courses, loading, error, refetch: fetch };
}

// ── useNotes ────────────────────────────────────────────────
export function useNotes(filters?: { course?: string; type?: string; sort?: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getNotes(filters);
      setNotes(data);
    } catch {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  const deleteNote = async (doc_id: string) => {
    await api.deleteNote(doc_id);
    setNotes(prev => prev.filter(n => n.doc_id !== doc_id));
  };

  return { notes, loading, error, deleteNote, refetch: fetch };
}

// ── useUpload ───────────────────────────────────────────────
export function useUpload() {
  const [queue, setQueue] = useState<Array<{
    id: string; filename: string; size: string;
    course_code: string; progress: number;
    status: 'uploading' | 'processing' | 'indexed' | 'error';
  }>>([]);

  const upload = async (file: File, course_code: string) => {
    const id = crypto.randomUUID();
    const sizeKb = (file.size / 1024).toFixed(0);
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${sizeKb} KB`;

    setQueue(q => [...q, { id, filename: file.name, size: sizeStr, course_code, progress: 0, status: 'uploading' }]);

    try {
      await api.uploadFile(file, course_code, (pct) => {
        setQueue(q => q.map(item => item.id === id ? { ...item, progress: pct } : item));
      });
      setQueue(q => q.map(item => item.id === id ? { ...item, status: 'processing', progress: 100 } : item));
      // Simulate processing delay
      setTimeout(() => {
        setQueue(q => q.map(item => item.id === id ? { ...item, status: 'indexed' } : item));
      }, 1500);
    } catch {
      setQueue(q => q.map(item => item.id === id ? { ...item, status: 'error' } : item));
    }
  };

  const removeFromQueue = (id: string) => setQueue(q => q.filter(item => item.id !== id));

  return { queue, upload, removeFromQueue };
}

// ── useProgress ─────────────────────────────────────────────
export function useProgress() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, g, t] = await Promise.all([
          api.getProgressStats(),
          api.getGaps(),
          api.getTimeline(),
        ]);
        setStats(s); setGaps(g); setTimeline(t);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resolveGap = async (id: string) => {
    await api.updateGap(id, 'resolved');
    setGaps(prev => prev.map(g => g.id === id ? { ...g, status: 'resolved' } : g));
  };

  return { stats, gaps, timeline, loading, resolveGap };
}

// ── useProfile ──────────────────────────────────────────────
export function useProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProfile().then(setProfile).finally(() => setLoading(false));
  }, []);

  const save = async (data: Partial<StudentProfile>) => {
    const updated = await api.updateProfile(data);
    setProfile(updated);
  };

  return { profile, loading, save };
}
