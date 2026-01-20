import React, { useState } from 'react';
import { AnalysisItem } from '../types';
import { CheckIcon, CopyIcon, TrashIcon, RefreshIcon, SparklesIcon } from './Icons';

interface MetadataResultProps {
  item: AnalysisItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-2 py-1 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-200 border whitespace-nowrap
        ${copied 
          ? 'bg-green-50 text-green-700 border-green-200' 
          : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}
      `}
    >
      {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

const MetadataResult: React.FC<MetadataResultProps> = ({ item, onRemove, onRetry }) => {
  const { id, status, data, error, previewUrl } = item;

  // Keyword string helper
  const keywordsString = data?.keywords.join(', ') || '';

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 animate-fade-in-up transition-all hover:shadow-md">
      
      {/* Header Bar */}
      <div className={`
        px-4 py-3 border-b border-slate-100 flex items-center justify-between
        ${status === 'success' ? 'bg-gradient-to-r from-indigo-50 to-white' : 'bg-slate-50'}
      `}>
        <div className="flex items-center gap-2">
          {status === 'analyzing' && (
            <div className="flex items-center gap-2 text-indigo-600">
               <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
               <span className="text-xs font-semibold">Analyzing...</span>
            </div>
          )}
          {status === 'success' && (
             <div className="flex items-center gap-2 text-indigo-600">
               <SparklesIcon className="w-4 h-4" />
               <span className="text-xs font-semibold">Analysis Complete</span>
             </div>
          )}
          {status === 'error' && (
            <span className="text-xs font-semibold text-red-600">Analysis Failed</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
           {status === 'error' && (
             <button onClick={() => onRetry(id)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Retry">
               <RefreshIcon className="w-4 h-4" />
             </button>
           )}
           <button onClick={() => onRemove(id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Remove">
             <TrashIcon className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-0">
        {/* Left: Image Preview */}
        <div className="md:col-span-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex items-center justify-center relative min-h-[200px]">
           {previewUrl && (
             <div className="relative w-full h-full flex items-center justify-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className={`max-h-64 object-contain rounded-lg shadow-sm border border-slate-200 ${status === 'analyzing' ? 'opacity-50 blur-[1px]' : ''}`}
                />
             </div>
           )}
           
           {status === 'error' && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/50">
               <div className="text-center px-4">
                 <p className="text-xs text-red-500 font-medium mb-2">{error}</p>
                 <button onClick={() => onRetry(id)} className="text-xs text-indigo-600 font-medium hover:underline">Try Again</button>
               </div>
             </div>
           )}
        </div>

        {/* Right: Data */}
        <div className="md:col-span-8 p-4 sm:p-5 space-y-5">
           {status === 'success' && data ? (
             <>
               {/* Title */}
               <div className="space-y-1.5">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</h3>
                   <CopyButton text={data.title} label="Copy" />
                 </div>
                 <p className="text-sm text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                   {data.title}
                 </p>
                 <p className="text-[10px] text-slate-400 text-right">{data.title.length} / 200</p>
               </div>

               {/* Description */}
               <div className="space-y-1.5">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                   <CopyButton text={data.description} label="Copy" />
                 </div>
                 <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                   {data.description}
                 </p>
               </div>

               {/* Keywords */}
               <div className="space-y-1.5">
                 <div className="flex items-center justify-between">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                     Keywords <span className="text-indigo-500">({data.keywords.length})</span>
                   </h3>
                   <CopyButton text={keywordsString} label="Copy All" />
                 </div>
                 <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    {data.keywords.map((keyword, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-white border border-slate-200 text-slate-600">
                        {keyword}
                      </span>
                    ))}
                 </div>
               </div>
             </>
           ) : (
             // Placeholder / Skeleton for loading or idle
             <div className="space-y-4 animate-pulse opacity-40">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-12 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-16 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="flex gap-2">
                   <div className="h-6 bg-slate-200 rounded w-12"></div>
                   <div className="h-6 bg-slate-200 rounded w-16"></div>
                   <div className="h-6 bg-slate-200 rounded w-10"></div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default MetadataResult;
