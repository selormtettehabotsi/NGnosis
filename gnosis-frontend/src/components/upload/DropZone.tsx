import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function DropZone({ onFiles, disabled }: Props) {
  const [hovered, setHovered] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length) onFiles(accepted);
    setHovered(false);
  }, [onFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    disabled,
    onDragEnter: () => setHovered(true),
    onDragLeave: () => setHovered(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-[1.5px] border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
        isDragActive || hovered
          ? 'border-[#1D9E75] bg-[#E1F5EE]'
          : 'border-gray-200 bg-white hover:border-[#5DCAA5] hover:bg-[#f5fdf9]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3.5 transition-colors',
        isDragActive ? 'bg-[#9FE1CB]' : 'bg-[#E1F5EE]'
      )}>
        {isDragActive
          ? <FileText size={22} className="text-[#0F6E56]" />
          : <Upload size={22} className="text-[#1D9E75]" />
        }
      </div>
      <p className="text-[15px] font-medium text-gray-800 mb-1.5">
        {isDragActive ? 'Drop your notes here' : 'Drag & drop your notes'}
      </p>
      <p className="text-[12px] text-gray-400">
        PDF, DOCX, MD, TXT supported · or <span className="text-[#1D9E75] underline">browse files</span>
      </p>
    </div>
  );
}
