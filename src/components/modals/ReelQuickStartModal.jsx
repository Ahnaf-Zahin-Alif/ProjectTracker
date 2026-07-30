import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Video, 
  Sparkles, 
  X, 
  Globe, 
  Play, 
  CheckCircle2, 
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

  if (!isReelModalOpen) return null;

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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 animate-in fade-in duration-150"
      onClick={() => setIsReelModalOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel bg-slate-900/95 border-purple-500/50 shadow-2xl overflow-hidden rounded-2xl p-6 space-y-5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Instagram / FB Reel Quick-Start</h3>
              <p className="text-xs text-slate-400">Convert social media coding reels into actionable project plans</p>
            </div>
          </div>

          <button 
            onClick={() => setIsReelModalOpen(false)}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Icons */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
          <Instagram className="w-4 h-4 text-pink-400" />
          <Facebook className="w-4 h-4 text-blue-400" />
          <Youtube className="w-4 h-4 text-red-400" />
          <span>Supports Reel URLs, FB Watch, and YouTube Shorts</span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleProcessReel} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reel / Short Video Link
            </label>
            <input
              type="url"
              required
              placeholder="https://www.instagram.com/reel/C-example... or https://fb.watch/..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              className="glass-input text-xs w-full bg-slate-900 text-slate-100 placeholder-slate-500 font-mono"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Optional Highlights or Caption Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Creator built a dark-mode Spotify clone using Next.js and Tailwind..."
              value={extraNotes}
              onChange={(e) => setExtraNotes(e.target.value)}
              className="glass-input text-xs w-full resize-none"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !reelUrl.trim()}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-purple-600/25 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Extracting Reel Specs with GenAI Agent...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-pink-200" />
                <span>Turn Reel into Project Plan</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
