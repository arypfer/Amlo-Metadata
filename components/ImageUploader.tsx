import React, { useCallback, useState } from 'react';
import { UploadIcon, PhotoIcon } from './Icons';

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
    }
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    Array.from(fileList).forEach(file => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    } else {
      alert("Please upload valid image files.");
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${compact ? 'mb-4' : 'mb-8'}`}>
      <label
        htmlFor="image-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full 
          ${compact ? 'h-32 sm:h-40 border' : 'h-52 sm:h-64 border-2'} 
          border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 ease-in-out
          ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:bg-slate-50'}
        `}
      >
        <div className={`flex flex-col items-center justify-center text-center px-4 ${compact ? 'pt-3 pb-3' : 'pt-4 sm:pt-5 pb-5 sm:pb-6'}`}>
          <div className={`
            rounded-full ${compact ? 'p-2 mb-2' : 'p-3 sm:p-4 mb-3'} 
            ${dragActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}
          `}>
             {dragActive ? 
               <PhotoIcon className={compact ? "w-5 h-5" : "w-6 h-6 sm:w-8 sm:h-8"} /> : 
               <UploadIcon className={compact ? "w-5 h-5" : "w-6 h-6 sm:w-8 sm:h-8"} />
             }
          </div>
          <p className={`text-slate-600 font-medium ${compact ? 'text-xs sm:text-sm mb-1' : 'mb-2 text-sm'}`}>
            <span className="font-semibold text-indigo-600">Click to upload</span> <span className="hidden sm:inline">or drag images</span>
          </p>
          {!compact && <p className="text-xs text-slate-400">SVG, PNG, JPG or WEBP (Batch supported)</p>}
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
    </div>
  );
};

export default ImageUploader;
