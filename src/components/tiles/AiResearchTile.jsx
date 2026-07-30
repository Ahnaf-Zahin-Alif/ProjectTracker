import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { 
  Sparkles, 
  Search, 
  Bot, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ArrowRight, 
  Loader2, 
  Globe,
  PlusCircle,
  Key
} from 'lucide-react';
import { generateProjectBreakdown } from '../../services/genAiService';

export function AiResearchTile() {
  const { addProject, settings, setIsApiKeyModalOpen, showToast } = useAppState();

  const [promptText, setPromptText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    setLoadingStep('Initializing @google/genai SDK (antigravity-preview-05-2026)...');

    try {
      setTimeout(() => {
        setLoadingStep('Executing google_search & url_context tools on GitHub & Web...');
      }, 1000);

      setTimeout(() => {
        setLoadingStep('Structuring task breakdown and time estimates JSON...');
      }, 2200);

      const result = await generateProjectBreakdown({
        promptText,
        apiKey: settings.apiKey,
        sourceUrl: sourceUrl.trim() || null
      });

      setGeneratedResult(result);
      showToast(`✨ Generated project plan: "${result.title}"`);
    } catch (err) {
      console.error('AI Research Error:', err);
      showToast('❌ Failed to generate AI project breakdown');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleImportProject = () => {
    if (!generatedResult) return;
    addProject(generatedResult);
    setGeneratedResult(null);
    setPromptText('');
    setSourceUrl('');
  };

  return (
    <TileWrapper
      title="GenAI Architecture & Breakdown"
      icon={Sparkles}
      badge="antigravity-preview-05-2026"
      colSpan="col-span-12 lg:col-span-6"
      headerAccent="text-violet-400"
      actions={
        !settings.apiKey && (
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center space-x-1 px-2 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
          >
            <Key className="w-3 h-3" />
            <span>Set Key</span>
          </button>
        )
      }
    >
      <div className="flex flex-col space-y-4">
        
        {/* Agent Info Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-violet-950/40 border border-violet-800/60 text-xs">
          <div className="flex items-center space-x-2.5">
            <Bot className="w-4 h-4 text-violet-400" />
            <div>
              <span className="font-semibold text-slate-200">Agent Grounding Active</span>
              <p className="text-[11px] text-slate-400">Uses <code className="text-violet-300">google_search</code> & <code className="text-violet-300">url_context</code></p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-violet-900/80 text-violet-200 border border-violet-700">
            antigravity-preview-05-2026
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Idea or Prompt
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Build a real-time web video clipper using WebAssembly, ffmpeg.wasm, and React..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="glass-input text-xs w-full resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Reference Link / Reel URL (Optional)</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reel/... or GitHub URL"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="glass-input text-xs w-full"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !promptText.trim()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-xs transition shadow-lg shadow-violet-600/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Research & Generate Structured JSON Plan</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Structured Output Preview */}
        {generatedResult && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/50 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {generatedResult.category}
                </span>
                <h4 className="font-bold text-slate-100 text-sm mt-1">{generatedResult.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">{generatedResult.description}</p>
              </div>

              <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                ~{generatedResult.targetHours}h Target
              </span>
            </div>

            {/* Tags */}
            {generatedResult.tags && (
              <div className="flex flex-wrap gap-1">
                {generatedResult.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Actionable Subtask Breakdown List */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Generated Task Breakdown:</span>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {generatedResult.tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-1.5 rounded bg-slate-950/60 text-xs border border-slate-800">
                    <span className="text-slate-200 line-clamp-1">{task.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-slate-900 flex-shrink-0 ml-2">
                      ~{task.estimatedMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* One-Click Import Button */}
            <button
              onClick={handleImportProject}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import Plan as Active Workspace Project</span>
            </button>
          </div>
        )}

      </div>
    </TileWrapper>
  );
}
