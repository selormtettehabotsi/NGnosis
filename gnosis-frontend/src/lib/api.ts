import axios from 'axios';
import type { Course, Note, KnowledgeGap, StudentProfile, ProgressStats, TimelineEvent } from './types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Courses
export const getCourses = () => api.get<Course[]>('/api/courses').then(r => r.data);
export const createCourse = (data: Pick<Course, 'code' | 'name' | 'color'>) =>
  api.post<Course>('/api/courses', data).then(r => r.data);
export const updateCourse = (code: string, data: Partial<Course>) =>
  api.put<Course>(`/api/courses/${code}`, data).then(r => r.data);
export const deleteCourse = (code: string) =>
  api.delete(`/api/courses/${code}`).then(r => r.data);

// Notes
export const getNotes = (params?: { course?: string; type?: string; sort?: string }) =>
  api.get<Note[]>('/api/notes', { params }).then(r => r.data);
export const getNoteById = (doc_id: string) =>
  api.get<Note>(`/api/notes/${doc_id}`).then(r => r.data);
export const deleteNote = (doc_id: string) =>
  api.delete(`/api/notes/${doc_id}`).then(r => r.data);
export const searchNotes = (q: string) =>
  api.get<Note[]>('/api/notes/search', { params: { q } }).then(r => r.data);

// Upload
export const uploadFile = (file: File, course_code: string, onProgress?: (pct: number) => void) => {
  const form = new FormData();
  form.append('file', file);
  form.append('course_code', course_code);
  return api.post('/api/upload/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => onProgress?.(Math.round((e.loaded * 100) / (e.total ?? 1))),
  }).then(r => r.data);
};
export const saveQuickNote = (content: string, course_code: string, title: string) =>
  api.post('/api/upload/quick-note', { content, course_code, title }).then(r => r.data);
export const getUploadStatus = (id: string) =>
  api.get(`/api/upload/status/${id}`).then(r => r.data);

// Progress
export const getProgressStats = () =>
  api.get<ProgressStats>('/api/progress/stats').then(r => r.data);
export const getGaps = () =>
  api.get<KnowledgeGap[]>('/api/progress/gaps').then(r => r.data);
export const updateGap = (id: string, status: 'resolved' | 'active') =>
  api.put(`/api/progress/gaps/${id}`, { status }).then(r => r.data);
export const getTimeline = () =>
  api.get<TimelineEvent[]>('/api/progress/timeline').then(r => r.data);

// Settings
export const getProfile = () =>
  api.get<StudentProfile>('/api/settings/profile').then(r => r.data);
export const updateProfile = (data: Partial<StudentProfile>) =>
  api.put<StudentProfile>('/api/settings/profile', data).then(r => r.data);

export default api;
