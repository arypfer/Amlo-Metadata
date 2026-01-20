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

  if (compact) {
    return (
      <label
        htmlFor="image-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          flex items-center justify-center gap-3 w-full py-4 px-6
          rounded-2xl cursor-pointer transition-smooth
          ${dragActive
            ? 'bg-red-500/20 border-red-500/50'
            : 'glass hover:bg-white/10'
          }
          border border-dashed border-white/20
          group
        `}
      >
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center transition-smooth
          ${dragActive ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-400'}
        `}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">Add more photos</p>
          <p className="text-xs text-slate-500 hidden sm:block">or drag and drop</p>
        </div>
        <input
          id="image-upload"
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleChange}
        />
      </label>
    );
  }

  return (
    <label
      htmlFor="image-upload"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center w-full py-16 sm:py-20
        rounded-3xl cursor-pointer transition-smooth overflow-hidden
        ${dragActive
          ? 'bg-red-500/10 border-red-500/50'
          : 'glass hover:bg-white/10'
        }
        border-2 border-dashed border-white/20
        group
      `}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/20 transition-opacity duration-500 ${dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Icon */}
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-smooth
          ${dragActive
            ? 'bg-red-500 text-white scale-110'
            : 'bg-white/10 text-slate-400 group-hover:bg-red-500/20 group-hover:text-red-400 group-hover:scale-105'
          }
        `}>
          {dragActive ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {dragActive ? 'Drop your photos here' : 'Upload your photos'}
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          {dragActive ? 'Release to start processing' : 'Drag and drop or click to browse'}
        </p>

        {/* Button */}
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-smooth">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Choose Photos</span>
        </div>

        {/* Supported formats */}
        <p className="text-xs text-slate-500 mt-6">
          Supports JPEG, PNG, WEBP • Multiple files
        </p>
      </div>

      <input
        id="image-upload"
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
