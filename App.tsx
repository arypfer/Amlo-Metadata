import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MetadataResult from './components/MetadataResult';
import { AnalysisItem } from './types';
import { generateMetadata } from './services/geminiService';

// Password configuration
const CORRECT_PASSWORD = 'gandatisa123';
const AUTH_STORAGE_KEY = 'amlo_auth_token';

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
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedToken && verifyAuthToken(savedToken)) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    if (passwordInput === CORRECT_PASSWORD) {
      const token = createAuthToken(passwordInput);
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
    setLoginLoading(false);
  };

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

  // Stats
  const totalImages = items.length;
  const completedImages = items.filter(i => i.status === 'success').length;
  const processingImages = items.filter(i => i.status === 'analyzing').length;

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-red-500/30 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-transparent border-t-red-500 rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen - Premium Design
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Glass card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl p-8 sm:p-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/30 mb-5 transform hover:scale-105 transition-transform">
                <span className="text-4xl font-bold text-white">A</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Amlo<span className="text-red-400">Metadata</span>
              </h1>
              <p className="text-slate-400 text-sm">
                AI-powered metadata for Shutterstock
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
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
                    placeholder="Enter your password"
                    className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-lg backdrop-blur-sm"
                    autoComplete="current-password"
                    autoFocus
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {passwordError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginLoading || !passwordInput}
                className="w-full py-4 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Install hint */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-slate-500 text-xs">
                📱 Add to Home Screen for the best experience
              </p>
            </div>
          </div>

          {/* Footer branding */}
          <p className="text-center text-slate-600 text-xs mt-6">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    );
  }

  // Main App - Premium Design
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-red-500/20">
              A
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-800">
                Amlo<span className="text-red-500">Metadata</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalImages > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  ✓ {completedImages}
                </span>
                {processingImages > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium animate-pulse">
                    ⟳ {processingImages}
                  </span>
                )}
              </div>
            )}
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="text-xs font-medium text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero Section (only when empty) */}
        {items.length === 0 && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Powered by Gemini AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Generate Perfect Metadata
            </h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-2">
              Upload your photos and get AI-optimized titles, descriptions & 50 keywords ready for Shutterstock
            </p>
            <p className="text-sm text-slate-500">
              Works with JPEG, PNG, WEBP • Batch processing supported
            </p>
          </div>
        )}

        {/* Upload Area */}
        <div className={`${items.length > 0 ? 'sticky top-16 z-40 bg-gradient-to-b from-slate-50 to-transparent pb-6' : ''}`}>
          <ImageUploader
            onFilesSelected={handleFilesSelected}
            compact={items.length > 0}
          />
        </div>

        {/* Results List */}
        {items.length > 0 && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="flex items-center justify-between text-sm text-slate-500 px-1">
              <span>{totalImages} image{totalImages !== 1 ? 's' : ''}</span>
              {completedImages > 0 && (
                <span className="text-green-600 font-medium">
                  {completedImages} completed
                </span>
              )}
            </div>

            {items.map(item => (
              <MetadataResult
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onRetry={handleRetry}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      {items.length === 0 && (
        <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200/50 py-4 text-center z-40">
          <p className="text-xs text-slate-500">
            Made with ❤️ for Shutterstock contributors
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;