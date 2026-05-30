// ---------------------------------------------------------------------------
// Domain types — mirrors backend Pydantic schemas
// ---------------------------------------------------------------------------

export interface Course {
  id: number;
  title: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  note_count: number;
}

export interface Document {
  id: number;
  course_id: number;
  filename: string;
  file_type: string;
  chunk_count: number;
  indexed: boolean;
}

export interface Note {
  id: number;
  course_id: number;
  title: string;
  content: string;
  tags: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressEntry {
  id: number;
  course_id: number;
  topic: string;
  score: number;
  session_type: "quiz" | "review" | "tutor";
  notes: string | null;
  recorded_at: string;
}

export interface CourseProgressSummary {
  course_id: number;
  topic_count: number;
  average_score: number;
  sessions: ProgressEntry[];
}

export interface TopicScore {
  topic: string;
  latest_score: number;
  session_count: number;
}

export interface SearchResult {
  text: string;
  metadata: {
    document_id: number;
    course_id: number;
    filename: string;
    chunk_index: number;
  };
  distance: number;
}

export interface Settings {
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface ApiError {
  detail: string;
}
