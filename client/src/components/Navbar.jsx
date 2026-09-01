import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, Library, Compass, Plus, LogOut, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddModal }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080c14]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer group select-none" 
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-white/[0.12] shadow-sm overflow-hidden group-hover:border-white/[0.24] transition-colors">
            <img 
              src="/kiroku.png" 
              alt="Kiroku Logo" 
              className="w-7 h-7 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="font-bold text-blue-400 text-lg">K</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                Kiroku
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 font-['Noto_Sans_JP',sans-serif]">
                記録
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Anime & Manga Tracker</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Library className="w-4 h-4" />
            <span className="hidden sm:inline">My Library</span>
          </button>

          <button
            onClick={() => setActiveTab('discover')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Discover (Jikan)</span>
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Title</span>
          </button>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-white/[0.1]">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <User className="w-3 h-3" />
              </div>
              <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate hidden md:inline">
                {user?.username || 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-white hover:text-rose-200 hover:bg-rose-950/60 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
