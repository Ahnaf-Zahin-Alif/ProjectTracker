import React from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { 
  Zap, 
  Search, 
  Plus, 
  LayoutDashboard, 
  Kanban, 
  FolderKanban, 
  Timer, 
  Play, 
  Pause 
} from 'lucide-react';
import { formatSecondsToTimer } from '../../utils/dateUtils';

export function Header() {
  const { 
    setIsCommandPaletteOpen, 
    setIsNewProjectModalOpen, 
    currentView, 
    setCurrentView,
    isRunning,
    timerSeconds,
    timerMode,
    startTimer,
    pauseTimer
  } = useAppState();

  const navItems = [
    { id: 'dashboard', label: 'Studio Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Kanban Board', icon: Kanban },
    { id: 'workspaces', label: 'Workspaces', icon: FolderKanban }
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#06080d]/85 backdrop-blur-md border-b border-white/[0.07] px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Branding & Tag */}
        <div className="flex items-center space-x-3 select-none">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-violet-600 shadow-md shadow-cyan-500/20">
            <Zap className="w-4 h-4 text-white" />
            <div className="absolute -inset-0.5 rounded-xl bg-cyan-400 blur-sm opacity-30 -z-10"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ProjectManager
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                STUDIO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented Navigation Rail with Shared-Element Indicator */}
        <nav 
          aria-label="Workspace views"
          className="flex items-center bg-[#0b101b] p-1 rounded-xl border border-white/[0.07] shadow-inner"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'dashboard' && (currentView === 'page1' || !currentView));
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/25 via-indigo-600/25 to-violet-600/25 border border-cyan-500/40 rounded-lg shadow-sm"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Active Timer Pill, Search & New Project Actions */}
        <div className="flex items-center space-x-2.5">
          {/* Active Session Status Pill */}
          {isRunning && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono tabular-nums shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span>{formatSecondsToTimer(timerSeconds)}</span>
              <button 
                onClick={pauseTimer}
                className="p-0.5 rounded text-cyan-400 hover:text-white"
                title="Pause active timer"
              >
                <Pause className="w-3 h-3 fill-current" />
              </button>
            </motion.div>
          )}

          {/* Command Palette Trigger */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0b101b] hover:bg-[#111827] border border-white/[0.08] text-slate-300 text-xs font-medium transition cursor-pointer shadow-sm"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#06080d] border border-white/[0.1] rounded text-slate-400">
              Ctrl+K
            </kbd>
          </motion.button>

          {/* New Project CTA */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Project</span>
          </motion.button>
        </div>

      </div>
    </header>
  );
}
