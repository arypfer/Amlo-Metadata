import React, { useState } from 'react';
import { AnalysisItem } from '../types';
import { CheckIcon, CopyIcon, TrashIcon, RefreshIcon, SparklesIcon } from './Icons';

interface MetadataResultProps {
  item: AnalysisItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

const CopyButton = ({ text, label, variant = 'small' }: { text: string; label: string; variant?: 'small' | 'large' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Haptic feedback on mobile if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'large') {
    return (
      <button
        onClick={handleCopy}
        className={`
          flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 
          active:scale-95 shadow-sm
          ${copied
            ? 'bg-green-500 text-white shadow-green-500/25'
            : 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-500/20'
          }
        `}
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <CopyIcon className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 
        active:scale-95 border
        ${copied
          ? 'bg-green-50 text-green-600 border-green-200'
          : 'bg-white text-slate-500 border-slate-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
        }
      `}
    >
      {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <CopyIcon className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
};

const MetadataResult: React.FC<MetadataResultProps> = ({ item, onRemove, onRetry }) => {
  const { id, status, data, error, previewUrl } = item;
  const [showAllKeywords, setShowAllKeywords] = useState(false);

  const keywordsString = data?.keywords.join(', ') || '';
  const displayedKeywords = showAllKeywords ? data?.keywords : data?.keywords.slice(0, 20);

  return (
    <div className={`
      w-full bg-white rounded-2xl shadow-sm border overflow-hidden
      transition-all duration-300 hover:shadow-lg
      ${status === 'success' ? 'border-slate-200' : 'border-slate-100'}
      ${status === 'analyzing' ? 'ring-2 ring-red-100' : ''}
    `}>

      {/* Header Bar */}
      <div className={`
        px-4 py-3 flex items-center justify-between border-b
        ${status === 'success'
          ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-transparent border-green-100'
          : status === 'analyzing'
            ? 'bg-gradient-to-r from-red-50 via-orange-50 to-transparent border-red-100'
            : status === 'error'
              ? 'bg-gradient-to-r from-red-50 to-transparent border-red-100'
              : 'bg-slate-50 border-slate-100'
        }
      `}>
        <div className="flex items-center gap-2">
          {status === 'analyzing' && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="relative">
                <div className="w-5 h-5 border-2 border-red-200 rounded-full"></div>
                <div className="w-5 h-5 border-2 border-transparent border-t-red-500 rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <span className="text-sm font-semibold">Analyzing with AI...</span>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <CheckIcon className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold">Ready to use!</span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-semibold">Analysis failed</span>
            </div>
          )}
          {status === 'idle' && (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              </div>
              <span className="text-sm font-medium">Waiting...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {status === 'error' && (
            <button
              onClick={() => onRetry(id)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95"
              title="Retry"
            >
              <RefreshIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onRemove(id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95"
            title="Remove"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-0">
        {/* Left: Image Preview */}
        <div className="md:col-span-4 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-4 flex items-center justify-center relative min-h-[180px]">
          {previewUrl && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Preview"
                className={`
                  max-h-56 max-w-full object-contain rounded-xl shadow-md border border-slate-200
                  transition-all duration-500
                  ${status === 'analyzing' ? 'opacity-60 scale-95' : 'opacity-100'}
                `}
              />
              {status === 'analyzing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-700">Processing...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="text-center px-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm text-red-600 font-medium mb-2">{error}</p>
                <button
                  onClick={() => onRetry(id)}
                  className="text-sm text-red-500 font-semibold hover:text-red-600 flex items-center gap-1 mx-auto"
                >
                  <RefreshIcon className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data */}
        <div className="md:col-span-8 p-5 sm:p-6">
          {status === 'success' && data ? (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Title</h3>
                  <CopyButton text={data.title} label="Copy" />
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                    {data.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-2 text-right">{data.title.length}/200 characters</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                  <CopyButton text={data.description} label="Copy" />
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {data.description}
                  </p>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Keywords <span className="text-red-500">({data.keywords.length})</span>
                  </h3>
                  <CopyButton text={keywordsString} label="Copy All" />
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {displayedKeywords?.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-red-200 hover:text-red-600 transition-colors cursor-default"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  {data.keywords.length > 20 && (
                    <button
                      onClick={() => setShowAllKeywords(!showAllKeywords)}
                      className="mt-3 text-xs font-medium text-red-500 hover:text-red-600"
                    >
                      {showAllKeywords ? 'Show less' : `Show all ${data.keywords.length} keywords`}
                    </button>
                  )}
                </div>
              </div>

              {/* Copy All Button */}
              <div className="pt-2 flex justify-end">
                <CopyButton
                  text={`Title: ${data.title}\n\nDescription: ${data.description}\n\nKeywords: ${keywordsString}`}
                  label="Copy Everything"
                  variant="large"
                />
              </div>
            </div>
          ) : (
            // Skeleton for loading or idle
            <div className="space-y-5">
              <div className="animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-16 mb-3"></div>
                <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-20 mb-3"></div>
                <div className="h-16 bg-slate-100 rounded-xl w-full"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-24 mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-7 bg-slate-100 rounded-lg" style={{ width: `${40 + Math.random() * 40}px` }}></div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataResult;
