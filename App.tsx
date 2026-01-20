import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MetadataResult from './components/MetadataResult';
import { AnalysisItem } from './types';
import { generateMetadata } from './services/geminiService';

// Declare global AIStudio interface to ensure types are correct
// We augment the existing AIStudio interface which is referenced by window.aistudio
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

const App: React.FC = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  // Check for API Key availability on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(selected);
        } catch (e) {
          console.error("Error checking API key:", e);
          setHasApiKey(false);
        }
      } else {
        // If not in AI Studio, assume env var is set or handled elsewhere
        setHasApiKey(true);
      }
      setIsCheckingKey(false);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition
        setHasApiKey(true);
      } catch (e) {
        console.error("Error selecting API key:", e);
      }
    }
  };

  // Function to add new files to the queue
  const handleFilesSelected = (files: File[]) => {
    const newItems: AnalysisItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 11), // Simple ID gen
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      data: null,
      error: null
    }));
    
    // Add new items to the top of the list
    setItems(prev => [...newItems, ...prev]);
  };

  const handleRemove = (id: string) => {
    setItems(prev => {
      const itemToRemove = prev.find(i => i.id === id);
      if (itemToRemove && itemToRemove.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const handleRetry = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'idle', error: null } : item
    ));
  };

  const clearAll = () => {
    items.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
  };

  // Queue Processing Logic
  useEffect(() => {
    if (!hasApiKey) return;

    const processQueue = async () => {
      // Find items that need processing (idle)
      const idleItem = items.find(item => item.status === 'idle');
      
      if (idleItem) {
        // Mark as analyzing
        setItems(prev => prev.map(i => 
          i.id === idleItem.id ? { ...i, status: 'analyzing' } : i
        ));

        try {
          // Call API
          const metadata = await generateMetadata(idleItem.file);
          
          // Update success
          setItems(prev => prev.map(i => 
            i.id === idleItem.id ? { ...i, status: 'success', data: metadata } : i
          ));
        } catch (error) {
          console.error("Processing error", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to generate metadata.";
          // Update error
          setItems(prev => prev.map(i => 
            i.id === idleItem.id ? { ...i, status: 'error', error: errorMessage } : i
          ));
        }
      }
    };

    processQueue();
  }, [items, hasApiKey]); // Re-run whenever items change state

  // Loading state while checking for key
  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // API Key Selection Screen
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🔑
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">API Key Required</h1>
            <p className="text-slate-600">
              To use Amlo Metadata, you need to select a Google Cloud Project with billing enabled.
            </p>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-200"
          >
            Select API Key
          </button>
          <p className="text-xs text-slate-400">
            Learn more about billing at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">ai.google.dev/gemini-api/docs/billing</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
              A
            </div>
            <h1 className="font-bold text-lg sm:text-xl tracking-tight text-slate-800">
              Amlo<span className="text-red-600">Metadata</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             {items.length > 0 && (
               <button 
                 onClick={clearAll}
                 className="text-[10px] sm:text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
               >
                 Clear All
               </button>
             )}
             <div className="text-[10px] sm:text-xs font-medium text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
               Gemini 3 Flash
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Intro Text (only when empty) */}
        {items.length === 0 && (
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Batch Metadata Generator
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Upload multiple photos at once. We'll generate Shutterstock-optimized titles and keywords for each one automatically.
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div className="sticky top-16 z-40 bg-slate-50 pt-2 pb-6">
           <ImageUploader 
             onFilesSelected={handleFilesSelected} 
             compact={items.length > 0} 
           />
        </div>

        {/* Results List */}
        <div className="space-y-6">
           {items.map(item => (
             <MetadataResult 
               key={item.id} 
               item={item} 
               onRemove={handleRemove} 
               onRetry={handleRetry}
             />
           ))}
        </div>

      </main>

      {/* Footer */}
      {items.length === 0 && (
        <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-slate-400 z-40">
          <p className="px-4">Not affiliated with Shutterstock. Use metadata at your own discretion.</p>
        </footer>
      )}
    </div>
  );
};

export default App;