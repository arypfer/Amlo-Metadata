import React, { useState } from 'react';
import { AnalysisItem } from '../types';

interface MetadataResultProps {
  item: AnalysisItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const MetadataResult: React.FC<MetadataResultProps> = ({ item, onRemove, onRetry }) => {
  const { id, status, data, error, previewUrl } = item;
  const [isExpanded, setIsExpanded] = useState(false);

  // Handlers
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    // In a real app, show a toast here
  };

  const statusColor = {
    idle: 'bg-zinc-500',
    analyzing: 'bg-yellow-500 animate-pulse',
    success: 'bg-green-500',
    error: 'bg-red-500'
  }[status];

  return (
    <div className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all hover:bg-zinc-900/60">

      <div className="flex flex-col md:flex-row h-full">
        {/* IMAGE PREVIEW */}
        <div className="w-full md:w-64 h-64 md:h-auto bg-zinc-900 relative flex-shrink-0">
          {previewUrl && (
            <img src={previewUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Preview" />
          )}

          {/* Status Badge Over Image */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
            <span className="text-xs font-medium text-white capitalize">{status}</span>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            {status === 'error' && (
              <button onClick={() => onRetry(id)} className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
            <button onClick={() => onRemove(id)} className="bg-red-500/80 text-white p-2 rounded-full hover:bg-red-500 hover:scale-110 transition-all backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-6 md:p-8 space-y-6">
          {status === 'analyzing' && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
              <div className="h-20 bg-zinc-800/50 rounded-xl"></div>
              <div className="h-4 bg-zinc-800 rounded w-1/5"></div>
              <div className="h-24 bg-zinc-800/50 rounded-xl"></div>
            </div>
          )}

          {status === 'success' && data && (
            <>
              {/* Title & Desc */}
              <div className="grid md:grid-cols-2 gap-8 border-b border-white/5 pb-8">
                <FieldGroup label="Title" content={data.title} onCopy={() => handleCopy(data.title)} />
                <FieldGroup label="Description" content={data.description} onCopy={() => handleCopy(data.description)} />
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keywords ({data.keywords.length})</span>
                  <button onClick={() => handleCopy(data.keywords.join(', '))} className="text-xs text-purple-400 hover:text-purple-300">Copy All</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(isExpanded ? data.keywords : data.keywords.slice(0, 15)).map((k, i) => (
                    <span key={i} className="inline-block px-3 py-1 bg-zinc-800/50 border border-white/5 rounded-full text-xs text-zinc-300 hover:border-purple-500/30 hover:text-purple-200 transition-colors cursor-default">
                      {k}
                    </span>
                  ))}
                  {data.keywords.length > 15 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-zinc-500 hover:text-white underline decoration-zinc-700 underline-offset-4">
                      {isExpanded ? 'Show Less' : `+${data.keywords.length - 15} more`}
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Action */}
              <div className="pt-2">
                <button
                  onClick={() => handleCopy(`Title: ${data.title}\n\nDescription: ${data.description}\n\nKeywords: ${data.keywords.join(', ')}`)}
                  className="flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline decoration-purple-900 underline-offset-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Copy Metadata Package
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <p className="text-red-400 text-sm mb-2">{error}</p>
              <button onClick={() => onRetry(id)} className="text-xs text-white underline">Retry Analysis</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Component
const FieldGroup = ({ label, content, onCopy }: any) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
      <button onClick={onCopy} className="p-1 hover:bg-white/10 rounded transition-colors group/btn">
        <svg className="w-3.5 h-3.5 text-zinc-600 group-hover/btn:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
    </div>
    <p className="text-sm font-light leading-relaxed text-zinc-300">{content}</p>
  </div>
);

export default MetadataResult;
