import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MetadataResult from './components/MetadataResult';
import { AnalysisItem } from './types';
import { generateMetadata } from './services/geminiService';

// Password configuration
const CORRECT_PASSWORD = 'gandatisa123';
const AUTH_STORAGE_KEY = 'amlo_auth_token';

// Simple hash function for storing auth token
const createAuthToken = (password: string): string => {
  return btoa(password + '_authenticated_' + new Date().getFullYear());
};

const verifyAuthToken = (token: string): boolean => {
  return token === createAuthToken(CORRECT_PASSWORD);
};

const App: React.FC = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for saved authentication on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedToken && verifyAuthToken(savedToken)) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      const token = createAuthToken(passwordInput);
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password');
      setPasswordInput('');
    }
  };

  // Function to add new files to the queue
  const handleFilesSelected = (files: File[]) => {
    const newItems: AnalysisItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      data: null,
      error: null
    }));
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
    if (!isAuthenticated) return;

    const processQueue = async () => {
      const idleItem = items.find(item => item.status === 'idle');

      if (idleItem) {
        setItems(prev => prev.map(i =>
          i.id === idleItem.id ? { ...i, status: 'analyzing' } : i
        ));

        try {
          const metadata = await generateMetadata(idleItem.file);
          setItems(prev => prev.map(i =>
            i.id === idleItem.id ? { ...i, status: 'success', data: metadata } : i
          ));
        } catch (error) {
          console.error("Processing error", error);
          const errorMessage = error instanceof Error ? error.message : "Failed to generate metadata.";
          setItems(prev => prev.map(i =>
            i.id === idleItem.id ? { ...i, status: 'error', error: errorMessage } : i
          ));
        }
      }
    };

    processQueue();
  }, [items, isAuthenticated]);

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto text-white font-bold text-3xl shadow-lg shadow-red-200 mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Amlo<span className="text-red-600">Metadata</span>
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              AI-powered Shutterstock metadata generator
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all text-lg"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-200"
            >
              Login
            </button>
          </form>

          {/* Install hint */}
          <p className="text-center text-xs text-slate-400 mt-6">
            💡 Tip: Add to Home Screen for app-like experience
          </p>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 hide-scrollbar">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 safe-area-top">
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
                className="text-[10px] sm:text-xs font-medium text-slate-500 hover:text-red-600 active:scale-95 transition-all"
              >
                Clear All
              </button>
            )}
            <div className="text-[10px] sm:text-xs font-medium text-slate-500 bg-slate-100 px-2 sm:px-3 py-1 rounded-full">
              Gemini AI
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
              📸 Upload Your Photos
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
              Get AI-generated titles, descriptions & keywords optimized for Shutterstock
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div className="sticky top-14 sm:top-16 z-40 bg-slate-50 pt-2 pb-6">
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
        <footer className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-slate-400 z-40 safe-area-bottom">
          <p className="px-4">Made with ❤️ for Shutterstock contributors</p>
        </footer>
      )}
    </div>
  );
};

export default App;