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
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (passwordInput === CORRECT_PASSWORD) {
      const token = createAuthToken(passwordInput);
      localStorage.setItem(AUTH_STORAGE_KEY, token);
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Invalid password');
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
      if (itemToRemove?.previewUrl) URL.revokeObjectURL(itemToRemove.previewUrl);
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
          const errorMessage = error instanceof Error ? error.message : "Failed to generate metadata";
          setItems(prev => prev.map(i =>
            i.id === idleItem.id ? { ...i, status: 'error', error: errorMessage } : i
          ));
        }
      }
    };
    processQueue();
  }, [items, isAuthenticated]);

  const totalImages = items.length;
  const completedImages = items.filter(i => i.status === 'success').length;
  const processingImages = items.filter(i => i.status === 'analyzing').length;

  // Loading
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-white/20 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-xl glow-red mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to <span className="gradient-text">Amlo</span>
            </h1>
            <p className="text-slate-400">
              AI-powered metadata for Shutterstock
            </p>
          </div>

          {/* Login Card */}
          <div className="glass rounded-3xl p-8">
            <form onSubmit={handleLogin} className="space-y-6">
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
                    placeholder="Enter password"
                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 outline-none transition-smooth text-base"
                    autoComplete="current-password"
                    autoFocus
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
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
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-slate-700 disabled:to-slate-800 text-white font-semibold rounded-xl transition-smooth disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/25"
              >
                {loginLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-600 text-sm mt-8">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Amlo
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            {totalImages > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                {completedImages > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-xs font-medium text-emerald-400">{completedImages} done</span>
                  </div>
                )}
                {processingImages > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                    <span className="text-xs font-medium text-amber-400">{processingImages} processing</span>
                  </div>
                )}
              </div>
            )}

            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-smooth"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero - only when empty */}
        {items.length === 0 && (
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
              <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-red-400">AI-Powered</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Generate Metadata<br />
              <span className="gradient-text">In Seconds</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-lg mx-auto mb-2">
              Upload your photos and get AI-optimized titles, descriptions, and 50 keywords ready for Shutterstock
            </p>
          </div>
        )}

        {/* Upload */}
        <div className={items.length > 0 ? 'sticky top-16 z-40 pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6' : ''}>
          <ImageUploader
            onFilesSelected={handleFilesSelected}
            compact={items.length > 0}
          />
        </div>

        {/* Results */}
        {items.length > 0 && (
          <div className="space-y-4 mt-4">
            {items.map((item, index) => (
              <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <MetadataResult
                  item={item}
                  onRemove={handleRemove}
                  onRetry={handleRetry}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      {items.length === 0 && (
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center">
          <p className="text-sm text-slate-600">
            Made for Shutterstock contributors
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;