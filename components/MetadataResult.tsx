import React, { useState } from 'react';
import { AnalysisItem } from '../types';

interface MetadataResultProps {
  item: AnalysisItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(50);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-smooth
        ${copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
        }
      `}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
};

const MetadataResult: React.FC<MetadataResultProps> = ({ item, onRemove, onRetry }) => {
  const { id, status, data, error, previewUrl } = item;
  const [expanded, setExpanded] = useState(false);

  const keywordsString = data?.keywords.join(', ') || '';
  const displayKeywords = expanded ? data?.keywords : data?.keywords.slice(0, 15);

  return (
    <div className={`
      glass rounded-2xl overflow-hidden transition-smooth
      ${status === 'analyzing' ? 'ring-2 ring-red-500/30' : ''}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              <span className="text-sm font-medium">Queued</span>
            </div>
          )}
          {status === 'analyzing' && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Analyzing...</span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Failed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {status === 'error' && (
            <button
              onClick={() => onRetry(id)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-smooth"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onRemove(id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-smooth"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="md:w-1/3 p-4 flex items-center justify-center bg-slate-900/50 min-h-[200px]">
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className={`
                  max-h-48 rounded-xl object-contain transition-all duration-500
                  ${status === 'analyzing' ? 'opacity-50 scale-95' : ''}
                `}
              />
              {status === 'analyzing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                      <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      AI Processing
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
              <div className="text-center px-4">
                <p className="text-sm text-red-400 mb-3">{error}</p>
                <button
                  onClick={() => onRetry(id)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-smooth"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="md:w-2/3 p-5">
          {status === 'success' && data ? (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</span>
                  <CopyButton text={data.title} label="Copy" />
                </div>
                <p className="text-white text-sm leading-relaxed bg-slate-800/50 rounded-xl p-3 border border-white/5">
                  {data.title}
                </p>
                <p className="text-xs text-slate-500 mt-1 text-right">{data.title.length}/200</p>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</span>
                  <CopyButton text={data.description} label="Copy" />
                </div>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 rounded-xl p-3 border border-white/5">
                  {data.description}
                </p>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Keywords <span className="text-red-400">({data.keywords.length})</span>
                  </span>
                  <CopyButton text={keywordsString} label="Copy All" />
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {displayKeywords?.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2.5 py-1 rounded-lg bg-slate-700/50 border border-white/5 text-xs text-slate-300"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  {data.keywords.length > 15 && (
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="mt-3 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                    >
                      {expanded ? 'Show less' : `Show all ${data.keywords.length} keywords`}
                    </button>
                  )}
                </div>
              </div>

              {/* Copy All Button */}
              <div className="pt-2">
                <button
                  onClick={async () => {
                    const fullText = `Title:\n${data.title}\n\nDescription:\n${data.description}\n\nKeywords:\n${keywordsString}`;
                    await navigator.clipboard.writeText(fullText);
                    if (navigator.vibrate) navigator.vibrate(50);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold text-sm hover:from-red-600 hover:to-red-700 transition-smooth shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Everything
                </button>
              </div>
            </div>
          ) : (
            // Skeleton
            <div className="space-y-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-slate-700/50 rounded w-16 mb-2"></div>
                  <div className={`bg-slate-800/30 rounded-xl p-3 border border-white/5 ${i === 3 ? 'h-24' : 'h-12'}`}>
                    <div className="shimmer h-full rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataResult;
