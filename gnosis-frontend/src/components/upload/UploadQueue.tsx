import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface QueueItem {
  id: string;
  filename: string;
  size: string;
  course_code: string;
  progress: number;
  status: 'uploading' | 'processing' | 'indexed' | 'error';
}

interface Props {
  items: QueueItem[];
  onRemove: (id: string) => void;
}

const STATUS_CONFIG = {
  uploading: { label: 'Uploading...', color: 'text-blue-500' },
  processing: { label: 'Processing...', color: 'text-amber-500' },
  indexed: { label: 'Indexed', color: 'text-[#1D9E75]' },
  error: { label: 'Error', color: 'text-red-500' },
};

export default function UploadQueue({ items, onRemove }: Props) {
  if (!items.length) return null;

  return (
    <div>
      <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.6px] mb-3">Upload queue</p>
      <div className="space-y-2">
        {items.map(item => {
          const cfg = STATUS_CONFIG[item.status];
          return (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
              {/* File icon */}
              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-medium text-gray-500 uppercase">
                  {item.filename.split('.').pop()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">{item.filename}</p>
                <p className="text-[11px] text-gray-400">{item.size} · {item.course_code}</p>
                {/* Progress bar */}
                {(item.status === 'uploading' || item.status === 'processing') && (
                  <div className="h-0.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-0.5 rounded-full transition-all',
                        item.status === 'processing' ? 'bg-amber-400 animate-pulse' : 'bg-blue-400'
                      )}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Status icon */}
              <div className="flex items-center gap-2">
                {item.status === 'indexed' && <CheckCircle size={15} className="text-[#1D9E75]" />}
                {item.status === 'error' && <AlertCircle size={15} className="text-red-500" />}
                {(item.status === 'uploading' || item.status === 'processing') && (
                  <Loader2 size={15} className={cn('animate-spin', cfg.color)} />
                )}
                <span className={cn('text-[11px] font-medium', cfg.color)}>{cfg.label}</span>
                {(item.status === 'indexed' || item.status === 'error') && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="ml-1 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
