import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { Key, X, ShieldCheck } from 'lucide-react';

export function ApiKeyConfigModal() {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, settings, setSettings, showToast } = useAppState();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({ ...settings, apiKey: apiKeyInput.trim() });
    setIsApiKeyModalOpen(false);
    showToast('🔑 Gemini API Key configured in localStorage');
  };

  return (
    <AnimatePresence>
      {isApiKeyModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setIsApiKeyModalOpen(false)}
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
            className="w-full max-w-md studio-panel bg-[#0b101b] border-emerald-500/40 shadow-2xl rounded-2xl p-6 space-y-4 relative z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Gemini API Key Settings</h3>
                  <p className="text-xs text-slate-400 font-mono">@google/genai SDK • antigravity-preview-05-2026</p>
                </div>
              </div>

              <button 
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded transition"
                aria-label="Close API key settings modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#090d16] border border-white/[0.06] text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Your key is stored strictly in your browser's <code className="text-cyan-400 font-mono">localStorage</code>. Never sent to any intermediate server.</span>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="gemini-api-key-input" className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  id="gemini-api-key-input"
                  name="geminiApiKey"
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] font-mono"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Save API Key
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => { setApiKeyInput(''); setSettings({ ...settings, apiKey: '' }); }}
                  className="px-3 py-2.5 rounded-xl bg-[#111827] hover:bg-[#162033] text-slate-300 text-xs font-medium border border-white/[0.08] transition cursor-pointer"
                >
                  Clear
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
