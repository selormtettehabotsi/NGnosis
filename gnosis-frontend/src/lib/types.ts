export interface Course {
  code: string;
  name: string;
  color: string;
  noteCount: number;
  coverage: number;
  lastStudied?: string;
}

export interface Note {
  doc_id: string;
  title: string;
  course_code: string;
  note_type: 'note' | 'summary' | 'gap';
  source: 'upload' | 'claude_generated';
  file_type: 'pdf' | 'md' | 'txt' | 'docx';
  excerpt: string;
  chunk_count: number;
  reference_count: number;
  created_at: string;
}

export interface KnowledgeGap {
  id: string;
  course_code: string;
  topic: string;
  description: string;
  status: 'active' | 'resolved';
  identified_at: string;
  resolved_at?: string;
}

export interface StudentProfile {
  name: string;
  university: string;
  study_preference: 'socratic' | 'explanatory' | 'mixed';
}

export interface ProgressStats {
  total_notes: number;
  total_sessions: number;
  gaps_found: number;
  gaps_resolved: number;
  overall_coverage: number;
  study_hours_this_week: number;
  socratic_score: number;
}

export interface TimelineEvent {
  id: string;
  action: string;
  course_code?: string;
  details: string;
  timestamp: string;
}

export interface UploadQueueItem {
  id: string;
  filename: string;
  size: string;
  course_code: string;
  progress: number;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
}
