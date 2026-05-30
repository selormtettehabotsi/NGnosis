import type {
  Course,
  CourseProgressSummary,
  Document,
  Note,
  SearchResult,
  Settings,
  TopicScore,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export const coursesApi = {
  list: () => request<Course[]>("/api/courses/"),

  get: (id: number) => request<Course>(`/api/courses/${id}`),

  create: (data: { title: string; description?: string; color?: string }) =>
    request<Course>("/api/courses/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Pick<Course, "title" | "description" | "color">>) =>
    request<Course>(`/api/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) => request<void>(`/api/courses/${id}`, { method: "DELETE" }),

  search: (id: number, query: string, n = 5) =>
    request<{ query: string; results: SearchResult[] }>(
      `/api/courses/${id}/search?q=${encodeURIComponent(query)}&n=${n}`
    ),
};

// ---------------------------------------------------------------------------
// Documents / Upload
// ---------------------------------------------------------------------------

export const uploadApi = {
  list: (courseId: number) => request<Document[]>(`/api/upload/${courseId}`),

  upload: async (courseId: number, file: File): Promise<Document> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/upload/${courseId}`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Upload failed");
    }
    return res.json();
  },

  delete: (courseId: number, documentId: number) =>
    request<void>(`/api/upload/${courseId}/${documentId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const notesApi = {
  list: (courseId?: number) =>
    request<Note[]>(`/api/notes/${courseId != null ? `?course_id=${courseId}` : ""}`),

  get: (id: number) => request<Note>(`/api/notes/${id}`),

  create: (data: { course_id: number; title: string; content?: string; tags?: string }) =>
    request<Note>("/api/notes/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<Pick<Note, "title" | "content" | "tags">>) =>
    request<Note>(`/api/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: number) => request<void>(`/api/notes/${id}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export const progressApi = {
  getCourse: (courseId: number) =>
    request<CourseProgressSummary>(`/api/progress/${courseId}`),

  getTopics: (courseId: number) =>
    request<TopicScore[]>(`/api/progress/${courseId}/topics`),

  record: (data: {
    course_id: number;
    topic: string;
    score: number;
    session_type?: string;
    notes?: string;
  }) => request<void>("/api/progress/", { method: "POST", body: JSON.stringify(data) }),
};

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const settingsApi = {
  getAll: () => request<Settings>("/api/settings/"),

  get: (key: string) => request<{ key: string; value: string }>(`/api/settings/${key}`),

  set: (key: string, value: string) =>
    request<{ key: string; value: string }>(`/api/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),

  reset: (key: string) => request<void>(`/api/settings/${key}`, { method: "DELETE" }),
};
