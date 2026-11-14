import React from 'react';
import { MotionConfig, motion, AnimatePresence } from 'framer-motion';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { Header } from './components/layout/Header';
import { BentoGrid } from './components/layout/BentoGrid';
import { KanbanBoardPage } from './components/pages/KanbanBoardPage';
import { ProjectWorkspacesPage } from './components/pages/ProjectWorkspacesPage';
import { BlankPage } from './components/pages/BlankPage';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';
import { ReelQuickStartModal } from './components/modals/ReelQuickStartModal';
import { ApiKeyConfigModal } from './components/modals/ApiKeyConfigModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { Sparkles, Terminal } from 'lucide-react';

function AppContent() {
  const { toastMessage, currentView } = useAppState();

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Sticky Top Navigation Rail */}
      <Header />

      {/* Main View Area with Smooth Fluid Page Transitions */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {currentView === 'kanban' ? (
            <motion.div
              key="view-kanban"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <KanbanBoardPage />
            </motion.div>
          ) : currentView === 'workspaces' ? (
            <motion.div
              key="view-workspaces"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProjectWorkspacesPage />
            </motion.div>
          ) : currentView === 'page2' ? (
            <motion.div
              key="view-page2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <BlankPage />
            </motion.div>
          ) : (
            <motion.div
              key="view-dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <BentoGrid />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modern Studio Footer */}
      <footer className="mt-auto py-5 border-t border-white/[0.06] bg-[#06080d]/90 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">ProjectManager Studio</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-mono text-[11px]">@google/genai SDK (antigravity-preview-05-2026)</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
            <span>
              Press <kbd className="px-1.5 py-0.5 bg-[#111827] border border-white/[0.1] rounded text-slate-300 font-semibold">Ctrl+K</kbd> for Command Palette
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <CommandPaletteModal />
      <ReelQuickStartModal />
      <ApiKeyConfigModal />
      <NewProjectModal />

      {/* Interactive Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-[#0b101b] border border-cyan-500/50 shadow-2xl text-xs font-semibold text-cyan-200 backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppStateProvider>
        <AppContent />
      </AppStateProvider>
    </MotionConfig>
  );
}
