import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Key,
  UploadCloud,
  X,
  FileImage,
  GraduationCap,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { generateProjectBreakdown } from '../../services/genAiService';

export function AiResearchTile() {
  const { addProject, settings, setIsApiKeyModalOpen, showToast } = useAppState();

  const [promptText, setPromptText] = useState('');
  const [projectType, setProjectType] = useState('academic'); // 'academic' | 'learning'
  const [preferredTechStack, setPreferredTechStack] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // { name, dataUrl }
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);

  const imageInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage({
          name: file.name,
          dataUrl: evt.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const effectivePrompt = promptText.trim() || (selectedImage ? 'Build and architect developer project from attached UI mockup screenshot' : sourceUrl.trim() ? `Analyze and architect project from reference link: ${sourceUrl}` : '');
    if (!effectivePrompt) return;

    setIsLoading(true);
    setLoadingStep('Initializing @google/genai SDK (antigravity-preview-05-2026)...');

    try {
      setTimeout(() => {
        setLoadingStep(selectedImage ? 'Analyzing design mockup screenshot & executing google_search...' : 'Executing google_search & url_context tools on GitHub & Web...');
      }, 1000);

      setTimeout(() => {
        setLoadingStep('Structuring task breakdown and 21 subtasks JSON...');
      }, 2200);

      const result = await generateProjectBreakdown({
        promptText: effectivePrompt,
        apiKey: settings.apiKey,
        sourceUrl: sourceUrl.trim() || null,
        imageDataUrl: selectedImage ? selectedImage.dataUrl : null,
        projectType,
        preferredTechStack: preferredTechStack.trim() || null
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
    addProject({
      ...generatedResult,
      projectType
    });
    setGeneratedResult(null);
    setPromptText('');
    setSourceUrl('');
    setSelectedImage(null);
    setPreferredTechStack('');
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            setSelectedImage({
              name: file.name || `pasted-wireframe-${Date.now()}.png`,
              dataUrl: evt.target.result
            });
            showToast('📋 Image pasted from clipboard!');
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage({
          name: file.name,
          dataUrl: evt.target.result
        });
        showToast('📥 Mockup dropped successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TileWrapper
      title="GenAI Architect & Research"
      icon={Sparkles}
      badge="GEMINI 2026"
      colSpan="col-span-12 lg:col-span-5"
      headerAccent="text-indigo-400"
      actions={
        !settings.apiKey && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition cursor-pointer"
            title="Configure Gemini API Key"
          >
            <Key className="w-3 h-3" />
            <span>Set Key</span>
          </motion.button>
        )
      }
    >
      <div className="flex flex-col space-y-3.5" onPaste={handlePaste}>
        
        {/* Project Type Selector */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setProjectType('academic')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              projectType === 'academic'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-[#111827]/60 text-slate-400 border-white/[0.06] hover:bg-[#162033]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Project</span>
          </button>

          <button
            type="button"
            onClick={() => setProjectType('learning')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
              projectType === 'learning'
                ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-[#111827]/60 text-slate-400 border-white/[0.06] hover:bg-[#162033]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Learning Project</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          
          {/* Prompt Input */}
          <div>
            <label htmlFor="ai-prompt-input" className="block text-[11px] font-semibold text-slate-300 mb-1">
              Project Idea or Prompt <span className="text-slate-500 font-normal">(Ctrl+V to paste screenshot)</span>
            </label>
            <textarea
              id="ai-prompt-input"
              rows={2}
              placeholder="e.g., Build an offline-first markdown notes sync engine with CRDTs..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onPaste={handlePaste}
              className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Reference URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="ai-url-input" className="text-[11px] font-semibold text-slate-300">
                Reference Link / Reel URL <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <Globe className="w-3 h-3 text-slate-500" />
            </div>
            <input
              id="ai-url-input"
              type="url"
              placeholder="https://instagram.com/reel/... or GitHub URL"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full text-xs p-2 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] font-mono"
              disabled={isLoading}
            />
          </div>

          {/* Mockup Upload / Drop Zone */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-300 mb-1">
              Wireframe / Screenshot Attachment
            </span>
            {selectedImage ? (
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#111827] border border-cyan-500/40">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <img
                    src={selectedImage.dataUrl}
                    alt="Mockup preview"
                    className="w-9 h-9 rounded object-cover border border-white/[0.1] flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-200 truncate">{selectedImage.name}</span>
                    <span className="block text-[10px] text-cyan-400 font-mono">Attached for Gemini vision</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-[#111827]/60 hover:bg-[#111827] border border-dashed border-white/[0.1] hover:border-cyan-500/40 text-slate-400 text-xs transition cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-cyan-400" />
                <span>Upload, Drop, or Paste Screenshot</span>
              </div>
            )}
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Generate Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || (!promptText.trim() && !sourceUrl.trim() && !selectedImage)}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-indigo-600/25 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
                <span className="truncate">{loadingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Architect & Generate Execution Plan</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Generated Result Card Preview */}
        <AnimatePresence>
          {generatedResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-xl bg-[#090d16] border border-cyan-500/40 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {generatedResult.category || 'Developer Project'}
                  </span>
                  <h4 className="font-bold text-slate-100 text-xs mt-1">{generatedResult.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{generatedResult.description}</p>
                </div>
              </div>

              {/* Task list preview */}
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {generatedResult.tasks?.slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-1.5 rounded bg-[#111827] text-[11px] border border-white/[0.05]">
                    <span className="text-slate-300 truncate">{task.title}</span>
                    <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-[#0b101b] ml-1 flex-shrink-0 tabular-nums">
                      ~{task.estimatedMinutes}m
                    </span>
                  </div>
                ))}
                {generatedResult.tasks?.length > 6 && (
                  <div className="text-center text-[10px] font-mono text-slate-500 py-1">
                    + {generatedResult.tasks.length - 6} more subtasks generated
                  </div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleImportProject}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Import Plan to Workspace</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </TileWrapper>
  );
}
