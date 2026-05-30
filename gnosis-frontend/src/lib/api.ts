/**
 * API module — maps the Node.js Express backend (localhost:3000) to the
 * shape expected by gnosis-frontend's hooks and components.
 *
 * Backend base URL is read from VITE_BACKEND_URL (set in .env).
 *
 * Route differences between the backend and what this frontend originally
 * expected are handled here with thin adapter functions so no component
 * code needs to change.
 */
import axios from 'axios';
import type { Course, Note, KnowledgeGap, StudentProfile, ProgressStats, TimelineEvent } from './types';

// ─── Axios instance ────────────────────────────────────────────────────────
const BASE = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach stored JWT to every request automatically
const token = localStorage.getItem('gnosis_token');
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// ─── Backend response shapes ───────────────────────────────────────────────
// These match what the Express backend actually returns.
interface BackendCourse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface BackendDocument {
  filePath: string;
  title: string;
  category: string;
  sourcePath: string | null;
  createdAt: string;
  topics: { id: string; displayName: string }[];
}

// ─── Mappers ───────────────────────────────────────────────────────────────
// The frontend's Course type uses `code` as the identifier and expects
// extra fields (color, noteCount, coverage). We derive sensible defaults
// from the backend data.
const COURSE_COLORS = [
  '#1D9E75', '#378ADD', '#BA7517', '#8B5CF6',
  '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
];

function mapCourse(c: BackendCourse, index = 0): Course {
  return {
    code: c.id,               // backend `id` → frontend `code`
    name: c.name,
    color: COURSE_COLORS[index % COURSE_COLORS.length],
    noteCount: 0,             // populated separately if needed
    coverage: 0,
    lastStudied: c.createdAt,
  };
}

function mapNote(doc: BackendDocument): Note {
  return {
    doc_id: doc.filePath,
    title: doc.title,
    course_code: '',          // filled in by caller
    note_type: doc.category === 'note' ? 'note' : doc.category === 'assignment' ? 'gap' : 'summary',
    source: 'upload',
    file_type: 'pdf',
    excerpt: '',
    chunk_count: 0,
    reference_count: doc.topics.length,
    created_at: doc.createdAt,
  };
}

// ─── Courses ───────────────────────────────────────────────────────────────
export const getCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<BackendCourse[]>('/courses');
  return data.map((c, i) => mapCourse(c, i));
};

export const createCourse = async (data: Pick<Course, 'code' | 'name' | 'color'>): Promise<Course> => {
  const { data: created } = await api.post<BackendCourse>('/courses', { name: data.name });
  return mapCourse(created);
};

export const updateCourse = async (code: string, data: Partial<Course>): Promise<Course> => {
  // Backend doesn't have a PATCH /courses/:id yet — return a locally-merged stub
  const { data: current } = await api.get<BackendCourse>(`/courses/${code}`);
  return { ...mapCourse(current), ...data, code };
};

export const deleteCourse = (_code: string): Promise<void> => {
  // Backend doesn't have DELETE /courses/:id yet
  return Promise.resolve();
};

// ─── Notes (documents in a course) ────────────────────────────────────────
export const getNotes = async (params?: { course?: string }): Promise<Note[]> => {
  if (!params?.course) return [];
  const { data } = await api.get<BackendDocument[]>(`/courses/${params.course}/documents`);
  return data.map(doc => ({ ...mapNote(doc), course_code: params.course ?? '' }));
};

export const getNoteById = async (doc_id: string): Promise<Note> => {
  const { data } = await api.get<{ filePath: string; title: string; category: string; createdAt: string }>(
    `/documents?filePath=${encodeURIComponent(doc_id)}`
  );
  return {
    doc_id: data.filePath,
    title: data.title,
    course_code: '',
    note_type: data.category === 'note' ? 'note' : 'summary',
    source: 'upload',
    file_type: 'pdf',
    excerpt: '',
    chunk_count: 0,
    reference_count: 0,
    created_at: data.createdAt,
  };
};

export const deleteNote = (_doc_id: string): Promise<void> => Promise.resolve();

export const searchNotes = async (q: string): Promise<Note[]> => {
  const { data } = await api.get<{ results: BackendDocument[] }>('/context/grep', { params: { q } });
  return (data.results ?? []).map(doc => mapNote(doc));
};

// ─── Upload ────────────────────────────────────────────────────────────────
// course_code here is actually the backend's course UUID (we map id→code above)
export const uploadFile = (file: File, course_code: string, onProgress?: (pct: number) => void) => {
  const form = new FormData();
  form.append('file', file);
  return api.post(
    `/courses/${course_code}/documents`,
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
    }
  ).then(r => r.data);
};

export const saveQuickNote = (_content: string, _course_code: string, _title: string) =>
  Promise.resolve(null);   // not yet implemented on backend

export const getUploadStatus = (_id: string) =>
  Promise.resolve({ status: 'indexed' });

// ─── Progress  (not yet on backend — return empty stubs) ──────────────────
export const getProgressStats = (): Promise<ProgressStats> =>
  Promise.resolve({
    total_notes: 0, total_sessions: 0,
    gaps_found: 0, gaps_resolved: 0,
    overall_coverage: 0, study_hours_this_week: 0,
    socratic_score: 0,
  });

export const getGaps = (): Promise<KnowledgeGap[]> => Promise.resolve([]);

export const updateGap = (_id: string, _status: 'resolved' | 'active'): Promise<void> =>
  Promise.resolve();

export const getTimeline = (): Promise<TimelineEvent[]> => Promise.resolve([]);

// ─── Profile / Settings (not yet on backend — return stub) ────────────────
export const getProfile = (): Promise<StudentProfile> =>
  Promise.resolve({ name: 'Student', university: '', study_preference: 'mixed' });

export const updateProfile = (data: Partial<StudentProfile>): Promise<StudentProfile> =>
  Promise.resolve({ name: 'Student', university: '', study_preference: 'mixed', ...data });

export default api;
