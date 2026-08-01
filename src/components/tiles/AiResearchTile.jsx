import React, { useState, useRef } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { generateProjectBreakdown } from '../../services/genAiService';

export function AiResearchTile() {
  const { addProject, settings, setIsApiKeyModalOpen, showToast } = useAppState();

  const [promptText, setPromptText] = useState('');
  const [projectType, setProjectType] = useState('academic'); // 'academic' | 'learning'
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
        projectType
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
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onload = (evt) => {
            setSelectedImage({
              name: `pasted_image_${Date.now()}.png`,
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

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
        showToast('📥 Image dropped!');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TileWrapper
      title="GenAI Architecture & Breakdown"
      icon={Sparkles}
      badge="antigravity-preview-05-2026"
      colSpan="col-span-12"
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
      <div className="flex flex-col space-y-4" onPaste={handlePaste}>
        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Idea or Prompt (Paste image with Ctrl+V)
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Build a real-time web video clipper using WebAssembly... (Paste screenshot via Ctrl+V)"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onPaste={handlePaste}
              className="glass-input text-xs w-full resize-none"
              disabled={isLoading}
            />
          </div>

          {/* PROJECT TYPE TOGGLE (Academic Project vs Learning Project) */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
            <label className="block font-semibold text-slate-300">
              Project Type <span className="text-cyan-400 font-normal">(Academic vs Learning)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProjectType('academic')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                  projectType === 'academic'
                    ? 'bg-violet-600/25 text-violet-300 border-violet-500 shadow-md shadow-violet-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
                <span>🎓 Academic Project</span>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('learning')}
                className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                  projectType === 'learning'
                    ? 'bg-cyan-600/25 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                <span>💡 Learning Project</span>
              </button>
            </div>
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
              className="glass-input text-xs w-full bg-slate-900 text-slate-100 placeholder-slate-500 font-mono"
              disabled={isLoading}
            />
          </div>

          {/* Image Upload / Drag & Drop / Paste Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Attach Wireframe / UI Screenshot (Upload, Drag & Drop, or Paste Ctrl+V)
            </label>
            
            {selectedImage ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-cyan-500/50">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={selectedImage.dataUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-cyan-500/40" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{selectedImage.name}</p>
                    <p className="text-[10px] text-cyan-400">Attached • Ready for Gemini vision analysis</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-3 px-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-cyan-500/50 cursor-pointer transition text-center group"
              >
                <UploadCloud className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-xs font-medium text-slate-300">
                  <strong className="text-cyan-400">Upload Image</strong>, Drag & Drop, or Paste (<kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px] font-mono">Ctrl+V</kbd>)
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP screenshots</span>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 disabled:opacity-50 transition"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{loadingStep || 'Executing Grounding Tools & Vision Breakdown...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-violet-300" />
                <span>Research & Generate Structured JSON Plan ({projectType === 'academic' ? '🎓 Academic' : '💡 Learning'})</span>
              </>
            )}
          </button>
        </form>

        {/* Results Preview Card */}
        {generatedResult && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                  {generatedResult.category}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {generatedResult.projectType === 'academic' ? '🎓 Academic' : '💡 Learning'}
                </span>
                <h4 className="font-bold text-slate-100 text-sm">{generatedResult.title}</h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">Target ~{generatedResult.targetHours}h</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{generatedResult.description}</p>

            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {generatedResult.tags?.map((t, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                  #{t}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">Generated Subtasks Roadmap ({generatedResult.tasks?.length || 0} subtasks):</span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {generatedResult.tasks?.map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-300 font-mono truncate max-w-[80%]">{task.title}</span>
                    <span className="text-slate-400 text-[10px]">~{task.estimatedMinutes}m</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleImportProject}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Import to Active Project Workspace ({generatedResult.tasks?.length || 0} Subtasks)</span>
            </button>
          </div>
        )}
      </div>
    </TileWrapper>
  );
}
