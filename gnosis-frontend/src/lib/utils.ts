import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COURSE_COLORS: Record<string, string> = {
  'ECON 201': '#1D9E75',
  'BIO 102': '#378ADD',
  'CHEM 301': '#BA7517',
};

export function getCourseColor(code: string, fallback = '#888780') {
  return COURSE_COLORS[code] ?? fallback;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileType(filename: string): 'pdf' | 'md' | 'txt' | 'docx' {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'md') return 'md';
  if (ext === 'docx') return 'docx';
  return 'txt';
}

export const FILE_TYPE_COLORS = {
  pdf: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'PDF' },
  md: { bg: 'bg-green-50', text: 'text-green-700', label: 'MD' },
  docx: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'DOCX' },
  txt: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'TXT' },
};

export const SOURCE_COLORS = {
  upload: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Upload' },
  claude_generated: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'AI' },
};
