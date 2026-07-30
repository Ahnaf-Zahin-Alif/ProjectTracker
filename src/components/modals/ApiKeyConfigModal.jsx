import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Key, X, Check, ShieldCheck, Cpu } from 'lucide-react';

export function ApiKeyConfigModal() {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, settings, setSettings, showToast } = useAppState();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');

  if (!isApiKeyModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({ ...settings, apiKey: apiKeyInput.trim() });
    setIsApiKeyModalOpen(false);
    showToast('🔑 Gemini API Key configured in localStorage');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 animate-in fade-in duration-150"
      onClick={() => setIsApiKeyModalOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md glass-panel bg-slate-900/95 border-emerald-500/50 shadow-2xl overflow-hidden rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Gemini API Key Settings</h3>
              <p className="text-xs text-slate-400">@google/genai SDK • antigravity-preview-05-2026</p>
            </div>
          </div>

          <button 
            onClick={() => setIsApiKeyModalOpen(false)}
            className="text-slate-500 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Your key is stored strictly in your browser's <code className="text-cyan-400">localStorage</code>. Never sent to any third-party server.</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="glass-input text-xs w-full font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20"
            >
              Save API Key
            </button>
            <button
              type="button"
              onClick={() => { setApiKeyInput(''); setSettings({ ...settings, apiKey: '' }); }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
