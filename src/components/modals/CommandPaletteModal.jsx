import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ArrowRight,
  LayoutDashboard,
  Kanban
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
    setCurrentView,
    exportData 
  } = useAppState();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

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
      id: 'cmd_view_dashboard',
      title: 'Switch to Studio Dashboard',
      subtitle: 'Jump to the main Bento workbench view',
      icon: LayoutDashboard,
      category: 'Navigation',
      action: () => {
        setIsCommandPaletteOpen(false);
        setCurrentView('dashboard');
      }
    },
    {
      id: 'cmd_view_kanban',
      title: 'Switch to Kanban Board',
      subtitle: 'View agile 4-column sprint board',
      icon: Kanban,
      category: 'Navigation',
      action: () => {
        setIsCommandPaletteOpen(false);
        setCurrentView('kanban');
      }
    },
    {
      id: 'cmd_view_workspaces',
      title: 'Switch to Workspaces',
      subtitle: 'Deep-dive workspace split view',
      icon: FolderKanban,
      category: 'Navigation',
      action: () => {
        setIsCommandPaletteOpen(false);
        setCurrentView('workspaces');
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
           item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
           item.category.toLowerCase().includes(query.toLowerCase());
  });

  // Keyboard navigation within command list
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setIsCommandPaletteOpen(false)}
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-[#06080d]/80 backdrop-blur-md" 
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl studio-panel bg-[#0b101b] border-cyan-500/40 shadow-2xl overflow-hidden rounded-2xl relative z-10"
          >
            {/* Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] space-x-3">
              <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command, project, or tool... (↑↓ to navigate, Enter to select)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-slate-100 text-xs outline-none font-medium placeholder-slate-500 border-none !p-0"
                aria-label="Search command palette"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded transition"
                aria-label="Close command palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Command List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {allItems.length > 0 ? (
                allItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected 
                          ? 'bg-cyan-500/15 border border-cyan-500/35 text-slate-100' 
                          : 'text-slate-300 hover:bg-[#111827] border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-[#111827] text-slate-400'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs truncate">{item.title}</div>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pl-2 flex-shrink-0">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#111827] text-slate-400 border border-white/[0.05]">
                          {item.category}
                        </span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No matching commands or projects found.
                </div>
              )}
            </div>

            {/* Footer Hint */}
            <div className="px-4 py-2 border-t border-white/[0.06] bg-[#090d16] flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Navigation: <kbd className="px-1 py-0.2 bg-[#111827] rounded text-slate-400">↑</kbd> <kbd className="px-1 py-0.2 bg-[#111827] rounded text-slate-400">↓</kbd></span>
              <span>Execute: <kbd className="px-1 py-0.2 bg-[#111827] rounded text-slate-400">↵ Enter</kbd></span>
              <span>Close: <kbd className="px-1 py-0.2 bg-[#111827] rounded text-slate-400">Esc</kbd></span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
