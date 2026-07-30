import React, { useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Zap, 
  Search, 
  Video, 
  Key, 
  Download, 
  Upload, 
  Plus, 
  Flame, 
  Clock, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { calculateActiveStreak, formatMinutesToHours } from '../../utils/dateUtils';

export function Header() {
  const { 
    projects, 
    heatmap, 
    settings, 
    setIsCommandPaletteOpen, 
    setIsReelModalOpen, 
    setIsApiKeyModalOpen,
    setIsNewProjectModalOpen,
    exportData,
    importData
  } = useAppState();

  const fileInputRef = useRef(null);

  const streak = calculateActiveStreak(heatmap);
  const totalMinutes = Object.values(heatmap).reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const totalTasksDone = projects.reduce((acc, p) => acc + (p.tasks?.filter(t => t.completed).length || 0), 0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        importData(evt.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
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
              <p className="text-xs text-slate-400 font-medium">Tiling Tracker & GenAI Research Dashboard</p>
            </div>
          </div>

          {/* Quick Command Trigger for Mobile */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Live Productivity Metrics Badges */}
        <div className="flex items-center space-x-2 lg:space-x-4 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800/90 text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Flame className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{streak} Day Streak</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold font-mono">{formatMinutesToHours(totalMinutes)} Focused</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{totalTasksDone} Tasks</span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          
          {/* Command Palette Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 border border-slate-700 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Reel Quick-Start Modal Button */}
          <button
            onClick={() => setIsReelModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition"
          >
            <Video className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Reel Quick-Start</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              settings.apiKey 
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900/50' 
                : 'bg-amber-950/40 text-amber-300 border-amber-800/80 hover:bg-amber-900/50'
            }`}
            title="Configure @google/genai API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{settings.apiKey ? 'GenAI Active' : 'Set API Key'}</span>
          </button>

          {/* Backup / Export */}
          <button
            onClick={exportData}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Export JSON Backup"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Import JSON Backup"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* New Project Button */}
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>

      </div>
    </header>
  );
}
