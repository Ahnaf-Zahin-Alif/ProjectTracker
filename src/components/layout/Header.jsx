import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Zap, Search, Plus, LayoutDashboard, Kanban, FolderKanban } from 'lucide-react';

export function Header() {
  const { setIsCommandPaletteOpen, setIsNewProjectModalOpen, currentView, setCurrentView } = useAppState();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Branding & Navigation Tabs */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute -inset-0.5 rounded-xl bg-cyan-500 blur-md opacity-40 -z-10"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-200 to-violet-400 bg-clip-text text-transparent">
                  ANTIGRAVITY
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  v2026.5
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Project Manager</p>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('workspaces')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'workspaces'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Workspaces (Twin-Tile)</span>
            </button>

            <button
              onClick={() => setCurrentView('kanban')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'kanban'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
          </nav>
        </div>

        {/* Right: Search & New Project Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 border border-slate-700 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>

      </div>
    </header>
  );
}
