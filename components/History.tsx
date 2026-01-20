import React from 'react';
import { AnalysisItem } from '../types';
import MetadataResult from './MetadataResult';

interface HistoryProps {
    items: AnalysisItem[];
    onRemove: (id: string) => void;
    onUpdate: (id: string, newData: any) => void;
    onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ items, onRemove, onUpdate, onClearHistory }) => {
    const completedItems = items.filter(i => i.status === 'success');

    if (completedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-zinc-500">No history yet</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-light text-white mb-2">History</h2>
                    <p className="text-zinc-500 text-sm">Review your past generations.</p>
                </div>
                <button
                    onClick={onClearHistory}
                    className="text-xs text-red-500 hover:text-red-400 transition-colors"
                >
                    Clear History
                </button>
            </div>

            <div className="grid gap-6">
                {completedItems.map(item => (
                    <MetadataResult
                        key={item.id}
                        item={item}
                        onRemove={onRemove}
                        onRetry={() => { }} // Retry not needed for history usually
                        onUpdate={onUpdate}
                        readonly={false} // Allow editing in history too
                    />
                ))}
            </div>
        </div>
    );
};

export default History;
