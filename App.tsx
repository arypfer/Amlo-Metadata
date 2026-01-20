import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MetadataResult from './components/MetadataResult';
import { AnalysisItem } from './types';
import { generateMetadata } from './services/geminiService';

const CORRECT_PASSWORD = 'gandatisa123';
const AUTH_STORAGE_KEY = 'amlo_auth_token_v2';
const WIFE_NAME = "Gandatisa"; // Dedication name

const createAuthToken = (password: string) => btoa(password + '_studio_auth_' + new Date().getFullYear());
const verifyAuthToken = (token: string) => token === createAuthToken(CORRECT_PASSWORD);

const App: React.FC = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, history, settings

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedToken && verifyAuthToken(savedToken)) setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === CORRECT_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, createAuthToken(passwordInput));
      setIsAuthenticated(true);
    } else {
      setPasswordError('Passcode incorrect');
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const newItems = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file), // Note: In a real app, revoke these
      status: 'idle' as const,
      data: null,
      error: null
    }));
    setItems(prev => [...newItems, ...prev]);
  };

  // Processing Queue
  useEffect(() => {
    if (!isAuthenticated) return;
    const processNext = async () => {
      const next = items.find(i => i.status === 'idle');
      if (!next) return;

      setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'analyzing' } : i));
      try {
        const metadata = await generateMetadata(next.file);
        setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'success', data: metadata } : i));
      } catch (err) {
        setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'error', error: 'AI Analysis Failed' } : i));
      }
    };
    processNext();
  }, [items, isAuthenticated]);

  if (isCheckingAuth) return null;

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Backdrops */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="relative w-full max-w-sm glass-panel p-10 rounded-3xl backdrop-blur-3xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-studio rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-light tracking-tight mb-2">Amlo Studio</h1>
            <p className="text-zinc-500 text-sm">Professional Metadata Suite</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setPasswordError(''); }}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-center tracking-[0.5em] text-lg focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:tracking-normal"
                  placeholder="PASSCODE"
                  autoFocus
                />
              </div>
              {passwordError && <p className="text-red-400 text-xs text-center">{passwordError}</p>}
            </div>
            <button className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-zinc-200 transition-colors">
              Enter Studio
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Designed for {WIFE_NAME}</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP SHELL
  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/5 bg-zinc-900/30 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-studio flex items-center justify-center">
              <span className="font-bold text-sm">A</span>
            </div>
            <span className="font-medium text-lg tracking-tight">Amlo Studio</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="grid">Dashboard</NavButton>
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon="clock">History</NavButton>
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="settings">Settings</NavButton>
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-tr from-purple-400 to-pink-400">G</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{WIFE_NAME}</p>
              <p className="text-xs text-zinc-500">Pro Contributor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 w-full z-50 glass-nav h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-studio flex items-center justify-center text-white text-xs font-bold">A</div>
          <span className="font-medium text-white">Amlo Studio</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        {/* Top Bar (Desktop) */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 border-b border-white/5 bg-zinc-900/20">
          <h2 className="text-lg font-medium text-zinc-200 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {items.length > 0 && (
              <button onClick={() => setItems([])} className="text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors">
                Clear Session
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Welcome / Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Session Uploads" value={items.length} />
              <StatCard label="Completed" value={items.filter(i => i.status === 'success').length} highlight />
            </div>

            {/* Upload Area */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-1">
              <ImageUploader onFilesSelected={handleFilesSelected} compact={items.length > 0} />
            </div>

            {/* Results Grid */}
            {items.length > 0 && (
              <div className="grid gap-6">
                {items.map(item => (
                  <MetadataResult
                    key={item.id}
                    item={item}
                    onRemove={id => setItems(p => p.filter(x => x.id !== id))}
                    onRetry={id => setItems(p => p.map(x => x.id === id ? { ...x, status: 'idle', error: null } : x))}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="py-20 text-center opacity-50">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-zinc-500">Ready for your masterpiece</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-20 py-8 text-center border-t border-white/5">
            <p className="text-zinc-600 text-sm">Made with ❤️ for {WIFE_NAME}</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

// UI Components
const NavButton = ({ active, onClick, icon, children }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
  >
    {/* Icons (simplified) */}
    <span className={`w-5 h-5 ${active ? 'text-purple-400' : 'opacity-70'}`}>
      {icon === 'grid' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>}
      {icon === 'clock' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
      {icon === 'settings' && <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
    </span>
    {children}
  </button>
);

const StatCard = ({ label, value, highlight }: any) => (
  <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
    <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-light ${highlight ? 'text-transparent bg-clip-text bg-gradient-studio font-medium' : 'text-white'}`}>{value}</p>
  </div>
);

export default App;