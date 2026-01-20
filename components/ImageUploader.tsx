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
      // Reset the input so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    const invalidCount = { count: 0 };

    Array.from(fileList).forEach(file => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      } else {
        invalidCount.count++;
      }
    });

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    if (invalidCount.count > 0) {
      // Could show a toast here instead of alert
      console.warn(`${invalidCount.count} non-image files were skipped`);
    }
  };

  if (compact) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <label
          htmlFor="image-upload"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            relative flex items-center justify-center w-full h-14
            border-2 border-dashed rounded-2xl cursor-pointer 
            transition-all duration-300 ease-out
            ${dragActive
              ? 'border-red-400 bg-red-50 scale-[1.02]'
              : 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50/30'
            }
            shadow-sm hover:shadow-md active:scale-[0.99]
          `}
        >
          <div className="flex items-center gap-3 px-4">
            <div className={`
              p-2 rounded-xl transition-colors
              ${dragActive ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}
            `}>
              {dragActive ? (
                <PhotoIcon className="w-5 h-5" />
              ) : (
                <UploadIcon className="w-5 h-5" />
              )}
            </div>
            <div className="text-sm">
              <span className="font-semibold text-red-500">Add more photos</span>
              <span className="text-slate-400 hidden sm:inline"> or drag here</span>
            </div>
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
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <label
        htmlFor="image-upload"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-64 sm:h-72
          border-2 border-dashed rounded-3xl cursor-pointer 
          transition-all duration-300 ease-out overflow-hidden
          ${dragActive
            ? 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50 scale-[1.02]'
            : 'border-slate-200 bg-white hover:border-red-300'
          }
          shadow-sm hover:shadow-lg active:scale-[0.99]
          group
        `}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-8">
          {/* Icon */}
          <div className={`
            p-5 rounded-2xl mb-5 transition-all duration-300
            ${dragActive
              ? 'bg-red-100 text-red-500 scale-110'
              : 'bg-slate-100 text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 group-hover:scale-105'
            }
          `}>
            {dragActive ? (
              <PhotoIcon className="w-10 h-10" />
            ) : (
              <UploadIcon className="w-10 h-10" />
            )}
          </div>

          {/* Text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-slate-700">
              {dragActive ? (
                <span className="text-red-500">Drop your photos here</span>
              ) : (
                <>
                  <span className="text-red-500">Click to upload</span>
                  <span className="text-slate-500"> or drag and drop</span>
                </>
              )}
            </p>
            <p className="text-sm text-slate-400">
              JPEG, PNG, WEBP supported • Multiple files allowed
            </p>
          </div>

          {/* Visual hint for mobile */}
          <div className="mt-6 sm:hidden">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-red-500/25">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Choose Photos
            </div>
          </div>
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
