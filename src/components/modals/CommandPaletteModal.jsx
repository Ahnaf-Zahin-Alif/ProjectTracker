import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Search, 
  Plus, 
  Video, 
  Key, 
  Timer, 
  Download, 
  FolderKanban, 
  Sparkles, 
  Flame, 
  X,
  ArrowRight
} from 'lucide-react';

export function CommandPaletteModal() {
  const { 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen, 
    projects, 
    setActiveProjectId, 
    startTimer,
    setIsReelModalOpen, 
    setIsApiKeyModalOpen, 
    setIsNewProjectModalOpen,
    exportData 
  } = useAppState();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const defaultCommands = [
    {
      id: 'cmd_new_proj',
      title: 'Create New Project',
      subtitle: 'Open manual project creation modal',
      icon: Plus,
      category: 'Actions',
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsNewProjectModalOpen(true);
      }
    },
    {
      id: 'cmd_reel',
      title: 'Open Reel Link Quick-Start',
      subtitle: 'Convert Instagram/Facebook Reel into execution plan',
      icon: Video,
      category: 'Actions',
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsReelModalOpen(true);
      }
    },
    {
      id: 'cmd_api_key',
      title: 'Configure Gemini API Key',
      subtitle: 'Set up @google/genai SDK key for antigravity-preview-05-2026',
      icon: Key,
      category: 'Settings',
      action: () => {
        setIsCommandPaletteOpen(false);
        setIsApiKeyModalOpen(true);
      }
    },
    {
      id: 'cmd_timer_start',
      title: 'Start Focus Timer',
      subtitle: 'Begin Pomodoro session on active project',
      icon: Timer,
      category: 'Timer',
      action: () => {
        setIsCommandPaletteOpen(false);
        startTimer();
      }
    },
    {
      id: 'cmd_export',
      title: 'Export Workspace Backup JSON',
      subtitle: 'Download complete state backup',
      icon: Download,
      category: 'Data',
      action: () => {
        setIsCommandPaletteOpen(false);
        exportData();
      }
    }
  ];

  // Dynamic project selection commands
  const projectCommands = projects.map(p => ({
    id: `proj_${p.id}`,
    title: `Focus on Project: ${p.title}`,
    subtitle: `${p.category || 'Project'} • ${p.tasks?.length || 0} subtasks`,
    icon: FolderKanban,
    category: 'Projects',
    action: () => {
      setIsCommandPaletteOpen(false);
      setActiveProjectId(p.id);
      startTimer();
    }
  }));

  const allItems = [...defaultCommands, ...projectCommands].filter(item => {
    if (!query) return true;
    return item.title.toLowerCase().includes(query.toLowerCase()) ||
           item.subtitle.toLowerCase().includes(query.toLowerCase());
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md px-4 animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl glass-panel bg-slate-900/95 border-cyan-500/50 shadow-2xl overflow-hidden rounded-2xl"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search project..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-400 rounded">
            ESC
          </kbd>
          <button 
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-500 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching commands or projects found.
            </div>
          ) : (
            allItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-slate-100' 
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center space-x-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Use ↑ ↓ to navigate</span>
          <span>↵ to execute</span>
        </div>

      </div>
    </div>
  );
}
