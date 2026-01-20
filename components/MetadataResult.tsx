import React, { useState, useEffect } from 'react';
import { AnalysisItem } from '../types';

interface MetadataResultProps {
  item: AnalysisItem;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onUpdate?: (id: string, newData: any) => void; // Optional for backward compatibility but essential for editing
  readonly?: boolean;
}

const MetadataResult: React.FC<MetadataResultProps> = ({ item, onRemove, onRetry, onUpdate, readonly = false }) => {
  const { id, status, data, error, previewUrl } = item;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(data || { title: '', description: '', keywords: [] as string[] });

  // Sync edits if data changes externally
  useEffect(() => {
    if (data) setEditForm(data);
  }, [data]);

  // Handlers
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const handleSave = () => {
    if (onUpdate && data) {
      onUpdate(id, editForm);
      setIsEditing(false);
    }
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

          {/* Status Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
            <span className="text-xs font-medium text-white capitalize">{status}</span>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 z-10">
            {/* Edit Button */}
            {status === 'success' && !isEditing && (
              <button onClick={() => setIsEditing(true)} className="bg-white/90 text-black p-2 rounded-full hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            )}

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
        <div className="flex-1 p-6 md:p-8 space-y-6 relative">

          {isEditing ? (
            // EDIT MODE
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Title</label>
                <input
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-xs text-right text-zinc-500 mt-1">{editForm.title.length}/200</p>
              </div>
              <div>
                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white h-24 focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-zinc-500 font-bold mb-1 block">Keywords (comma separated)</label>
                <textarea
                  value={editForm.keywords.join(', ')}
                  onChange={e => setEditForm({ ...editForm, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  className="w-full bg-zinc-800 border-none rounded-lg p-3 text-white h-32 focus:ring-1 focus:ring-purple-500 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-medium">Save Changes</button>
              </div>
            </div>
          ) : (
            // VIEW MODE
            <>
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
                  <div className="grid md:grid-cols-2 gap-8 border-b border-white/5 pb-8">
                    <FieldGroup label="Title" content={data.title} onCopy={() => handleCopy(data.title)} />
                    <FieldGroup label="Description" content={data.description} onCopy={() => handleCopy(data.description)} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Keywords ({data.keywords.length})</span>
                      <div className="flex gap-3">
                        <button onClick={() => setIsEditing(true)} className="text-xs text-zinc-500 hover:text-white">Edit</button>
                        <button onClick={() => handleCopy(data.keywords.join(', '))} className="text-xs text-purple-400 hover:text-purple-300">Copy All</button>
                      </div>
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
                  <div className="w-12 h-12 mx-auto mb-3 bg-red-500/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <p className="text-red-400 text-sm mb-2 font-medium">{error}</p>
                  <p className="text-zinc-500 text-xs mb-4">The analysis failed. Please try again or upload a smaller version.</p>
                  <button onClick={() => onRetry(id)} className="px-4 py-2 bg-red-500/10 text-red-400 text-xs font-medium rounded-lg hover:bg-red-500/20 transition-colors">Retry Analysis</button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

const FieldGroup = ({ label, content, onCopy }: any) => (
  <div className="space-y-2 group/field">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider group-hover/field:text-purple-400 transition-colors">{label}</span>
      <button onClick={onCopy} className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover/field:opacity-100">
        <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
    </div>
    <p className="text-sm font-light leading-relaxed text-zinc-300">{content}</p>
  </div>
);

export default MetadataResult;
