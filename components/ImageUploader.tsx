import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected, compact = false }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  // COMPACT MODE
  if (compact) {
    return (
      <label
        htmlFor="studio-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          flex items-center justify-center w-full py-8 
          rounded-2xl cursor-pointer transition-all duration-300
          border border-dashed
          ${dragActive
            ? 'bg-purple-500/10 border-purple-500/50 scale-[1.01]'
            : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-800/50 hover:border-white/10'
          }
          group
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-colors ${dragActive ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <div>
            <p className={`text-sm font-medium transition-colors ${dragActive ? 'text-purple-400' : 'text-zinc-300 group-hover:text-white'}`}>Upload New Photos</p>
            <p className="text-xs text-zinc-500">Drag & drop allowed</p>
          </div>
        </div>
        <input
          id="studio-upload"
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
      </label>
    );
  }

  // FULL MODE
  return (
    <label
      htmlFor="studio-upload"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full min-h-[400px]
        rounded-3xl cursor-pointer transition-all duration-500
        border border-dashed
        ${dragActive
          ? 'bg-zinc-900/80 border-purple-500/50 scale-[1.01]'
          : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/50 hover:border-white/10'
        }
        overflow-hidden group
      `}
    >
      {/* Animated Glow */}
      <div className={`absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${dragActive ? 'opacity-100' : ''}`}></div>

      <div className="relative z-10 flex flex-col items-center p-8 text-center max-w-sm mx-auto">
        <div className={`
          w-20 h-20 mb-8 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl
          ${dragActive
            ? 'bg-gradient-studio scale-110'
            : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300'
          }
        `}>
          {dragActive ? (
            <svg className="w-10 h-10 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          ) : (
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </div>

        <h3 className="text-3xl font-light text-white mb-3 tracking-tight">
          {dragActive ? 'Drop to Upload' : 'Start Creating'}
        </h3>

        <p className="text-zinc-400 mb-8 leading-relaxed">
          Upload your high-resolution photos for <br /> AI-powered metadata generation.
        </p>

        <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Browse Files
        </span>
      </div>

      <input
        id="studio-upload"
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
    </label>
  );
};

export default ImageUploader;
