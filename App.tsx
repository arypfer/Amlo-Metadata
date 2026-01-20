import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import MetadataResult from './components/MetadataResult';
import History from './components/History';
import Settings from './components/Settings';
import { AnalysisItem, AppSettings } from './types';
import { generateMetadata } from './services/geminiService';
import { generateCSV, downloadCSV } from './utils/csvExport';

const CORRECT_PASSWORD = 'gandatisa123';
const AUTH_STORAGE_KEY = 'amlo_auth_token_v2';
const DATA_STORAGE_KEY = 'amlo_data_v1';
const SETTINGS_STORAGE_KEY = 'amlo_settings_v1';
const WIFE_NAME = "Gandatisa";

const createAuthToken = (password: string) => btoa(password + '_studio_auth_' + new Date().getFullYear());
const verifyAuthToken = (token: string) => token === createAuthToken(CORRECT_PASSWORD);

const DEFAULT_SETTINGS: AppSettings = {
  customInstructions: '',
  imgQuality: 'balanced',
  csvHeader: true
};

const App: React.FC = () => {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load Data & Auth
  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedToken && verifyAuthToken(savedToken)) setIsAuthenticated(true);

    const savedData = localStorage.getItem(DATA_STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Hydrate Date objects if needed, or keeping timestamp number is fine
        setItems(parsed);
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }

    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }

    setIsCheckingAuth(false);
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isAuthenticated]);

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
    const newItems: AnalysisItem[] = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'idle',
      data: null,
      error: null,
      timestamp: Date.now()
    }));
    // Add new items to the TOP
    setItems(prev => [...newItems, ...prev]);
    setActiveTab('dashboard'); // Switch to dashboard on upload
  };

  const handleUpdateItem = (id: string, newData: any) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, data: { ...item.data, ...newData } } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleRetryItem = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'idle', error: null } : i));
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      setItems([]);
    }
  };

  const exportCSV = () => {
    const csv = generateCSV(items);
    if (!csv) return alert('No completed items to export.');
    downloadCSV(csv, `shutterstock_metadata_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Processing Queue
  useEffect(() => {
    if (!isAuthenticated) return;
    const processNext = async () => {
      const next = items.find(i => i.status === 'idle');
      if (!next) return;

      setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'analyzing' } : i));
      try {
        const metadata = await generateMetadata(next.file, settings.customInstructions);
        setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'success', data: metadata } : i));
      } catch (err) {
        setItems(prev => prev.map(i => i.id === next.id ? { ...i, status: 'error', error: 'AI Analysis Failed' } : i));
      }
    };
    processNext();
  }, [items, isAuthenticated, settings.customInstructions]);

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
            <div className="w-24 h-24 mx-auto mb-6 relative flex items-center justify-center">
              <img src="/logo.png" alt="Amlo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
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
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Made for my loved wife</p>
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
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
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
          <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
          <span className="font-medium text-white">Amlo Studio</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-zinc-900/95 backdrop-blur-xl pt-20 px-6">
          <nav className="space-y-4">
            <NavButton active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} icon="grid">Dashboard</NavButton>
            <NavButton active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setIsMobileMenuOpen(false); }} icon="clock">History</NavButton>
            <NavButton active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }} icon="settings">Settings</NavButton>
          </nav>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pt-16 md:pt-0">
        {/* Top Bar (Desktop) */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 border-b border-white/5 bg-zinc-900/20">
          <h2 className="text-lg font-medium text-zinc-200 capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
            {activeTab === 'history' && (
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-zinc-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                Export CSV
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="Total Uploads" value={items.length} />
                  <StatCard label="Completed" value={items.filter(i => i.status === 'success').length} highlight />
                </div>

                {/* Upload */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-1">
                  <ImageUploader onFilesSelected={handleFilesSelected} compact={items.filter(i => i.status !== 'success').length > 0} />
                </div>

                {/* Active Results (Pending/Processing or recent) */}
                {items.length > 0 && (
                  <div className="grid gap-6">
                    {items.map(item => (
                      <MetadataResult
                        key={item.id}
                        item={item}
                        onRemove={handleRemoveItem}
                        onRetry={handleRetryItem}
                        onUpdate={handleUpdateItem}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB: HISTORY */}
            {activeTab === 'history' && (
              <History
                items={items}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateItem}
                onClearHistory={clearHistory}
              />
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <Settings settings={settings} onSave={setSettings} />
            )}

            {/* Footer */}
            <footer className="mt-20 py-8 text-center border-t border-white/5">
              <p className="text-zinc-600 text-sm">Made with ❤️ for my loved wife</p>
            </footer>

          </div>
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