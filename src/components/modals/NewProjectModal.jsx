import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Plus, X, FolderKanban, UploadCloud, Image as ImageIcon, GraduationCap, Lightbulb } from 'lucide-react';

export function NewProjectModal() {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject, showToast } = useAppState();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('academic'); // 'academic' | 'learning'
  const [category, setCategory] = useState('Web Dev');
  const [targetHours, setTargetHours] = useState(10);
  const [tagsInput, setTagsInput] = useState('React, Tailwind');
  const [initialTaskInput, setInitialTaskInput] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  const fileInputRef = useRef(null);

  if (!isNewProjectModalOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImageUrl(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const initialTasks = initialTaskInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((t, idx) => ({
        id: `task_init_${Date.now()}_${idx}`,
        title: t,
        completed: false,
        estimatedMinutes: 30
      }));

    const newProj = {
      id: `proj_manual_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      projectType, // 'academic' | 'learning'
      status: 'in-progress',
      tags,
      targetHours: Number(targetHours) || 10,
      loggedMinutes: 0,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: initialTasks
    };

    addProject(newProj);
    setIsNewProjectModalOpen(false);
    setTitle('');
    setDescription('');
    setProjectType('academic');
    setTagsInput('React, Tailwind');
    setInitialTaskInput('');
    setImageUrl(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 animate-in fade-in duration-150"
      onClick={() => setIsNewProjectModalOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel bg-slate-900/95 border-cyan-500/50 shadow-2xl overflow-hidden rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Create New Project</h3>
              <p className="text-xs text-slate-400">Add a custom workspace project to track</p>
            </div>
          </div>

          <button 
            onClick={() => setIsNewProjectModalOpen(false)}
            className="text-slate-500 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Fullstack Realtime Chat App"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>

          {/* PROJECT TYPE SELECTOR (Academic Project vs Learning Project) */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <label className="block font-bold text-slate-200">
              Project Type <span className="text-cyan-400 font-normal">(Select Academic or Learning)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProjectType('academic')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  projectType === 'academic'
                    ? 'bg-violet-600/25 text-violet-300 border-violet-500 shadow-md shadow-violet-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <span>🎓 Academic Project</span>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('learning')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  projectType === 'learning'
                    ? 'bg-cyan-600/25 text-cyan-300 border-cyan-500 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>💡 Learning Project</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief overview of goal and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input w-full text-xs resize-none"
            />
          </div>

          {/* Project Cover Image Upload */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Screenshot / Cover Image (Optional)</label>
            {imageUrl ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <img src={imageUrl} alt="Cover Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                  <span className="text-xs text-cyan-400">Image attached</span>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-1 text-slate-400 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-dashed border-slate-700 text-slate-300 text-xs transition"
              >
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Upload Cover Image / Wireframe</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-input w-full text-xs"
              >
                <option value="Web Dev">Web Dev</option>
                <option value="AI Systems">AI Systems</option>
                <option value="Mobile Dev">Mobile Dev</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Target Hours</label>
              <input
                type="number"
                min={1}
                max={500}
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                className="glass-input w-full text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              placeholder="React, TypeScript, Tailwind, Node"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="glass-input w-full text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Initial Subtasks (One per line - optional)</label>
            <textarea
              rows={2}
              placeholder="Custom subtasks (Leave empty to generate 21 step-by-step subtasks automatically)"
              value={initialTaskInput}
              onChange={(e) => setInitialTaskInput(e.target.value)}
              className="glass-input w-full text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            Create Project ({projectType === 'academic' ? '🎓 Academic' : '💡 Learning'})
          </button>
        </form>

      </div>
    </div>
  );
}
