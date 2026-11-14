import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { 
  Video, 
  Sparkles, 
  X, 
  Loader2, 
  Instagram, 
  Facebook,
  Youtube
} from 'lucide-react';
import { generateProjectBreakdown } from '../../services/genAiService';

export function ReelQuickStartModal() {
  const { 
    isReelModalOpen, 
    setIsReelModalOpen, 
    addProject, 
    settings, 
    showToast 
  } = useAppState();

  const [reelUrl, setReelUrl] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessReel = async (e) => {
    e.preventDefault();
    if (!reelUrl.trim()) return;

    setIsLoading(true);

    try {
      const promptText = `Convert social reel concept/video into developer project execution plan. Video URL: ${reelUrl}. ${extraNotes ? `Additional context: ${extraNotes}` : ''}`;
      
      const newProject = await generateProjectBreakdown({
        promptText,
        apiKey: settings.apiKey,
        sourceUrl: reelUrl.trim()
      });

      addProject(newProject);
      setIsReelModalOpen(false);
      setReelUrl('');
      setExtraNotes('');
      showToast(`🚀 Converted Reel into Project: "${newProject.title}"`);
    } catch (err) {
      console.error('Reel processing error:', err);
      showToast('❌ Failed to convert reel link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isReelModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setIsReelModalOpen(false)}
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg studio-panel bg-[#0b101b] border-indigo-500/40 shadow-2xl rounded-2xl p-6 space-y-4 relative z-10"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Reel & Video Quick-Start</h3>
                  <p className="text-xs text-slate-400">Scaffold coding project specs directly from a video link</p>
                </div>
              </div>

              <button 
                onClick={() => setIsReelModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg transition"
                aria-label="Close reel quick start modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Badges */}
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-[#090d16] border border-white/[0.06] text-xs text-slate-300">
              <Instagram className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <Facebook className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <Youtube className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="text-[11px] text-slate-400">Supports Instagram Reels, Facebook Watch, and YouTube Shorts</span>
            </div>

            {/* Input Form */}
            <form onSubmit={handleProcessReel} className="space-y-3.5">
              <div>
                <label htmlFor="reel-url-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Reel / Short Video Link *
                </label>
                <input
                  id="reel-url-input"
                  name="reelUrl"
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/..."
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] font-mono"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="reel-notes-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Highlights / Focus Notes
                </label>
                <textarea
                  id="reel-notes-input"
                  name="reelNotes"
                  rows={2}
                  placeholder="e.g. Focus on the WebAssembly canvas filter architecture..."
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] resize-none"
                  disabled={isLoading}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading || !reelUrl.trim()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Extracting Reel Specs with GenAI Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-pink-200" />
                    <span>Extract & Architect Project</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
