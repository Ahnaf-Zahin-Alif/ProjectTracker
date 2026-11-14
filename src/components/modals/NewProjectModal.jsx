import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { Plus, X, FolderKanban, UploadCloud, GraduationCap, Lightbulb } from 'lucide-react';

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
    <AnimatePresence>
      {isNewProjectModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={() => setIsNewProjectModalOpen(false)}
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
            className="w-full max-w-lg studio-panel bg-[#0b101b] border-cyan-500/40 shadow-2xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto relative z-10"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Create New Project</h3>
                  <p className="text-xs text-slate-400">Add a custom workspace project with subtasks</p>
                </div>
              </div>

              <button 
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded transition"
                aria-label="Close new project modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* Title */}
              <div>
                <label htmlFor="new-proj-title" className="block font-semibold text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  id="new-proj-title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Distributed Task Queue Engine"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08]"
                />
              </div>

              {/* Project Type */}
              <div className="p-2.5 rounded-xl bg-[#090d16] border border-white/[0.06] space-y-1.5">
                <span className="block font-semibold text-slate-300 text-xs">
                  Project Type <span className="text-cyan-400 font-normal font-mono">(Select Classification)</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectType('academic')}
                    className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      projectType === 'academic'
                        ? 'bg-indigo-600/25 text-indigo-300 border-indigo-500/50 shadow-sm'
                        : 'bg-[#111827]/60 text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Academic Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectType('learning')}
                    className={`flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      projectType === 'learning'
                        ? 'bg-cyan-600/25 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-[#111827]/60 text-slate-400 border-white/[0.05]'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Learning Project</span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="new-proj-desc" className="block font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  id="new-proj-desc"
                  name="description"
                  rows={2}
                  placeholder="High-level architecture overview and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] resize-none"
                />
              </div>

              {/* Image Upload Option */}
              <div>
                <span className="block font-semibold text-slate-300 mb-1">
                  Project Screenshot / Cover Image (Optional)
                </span>
                {imageUrl ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#090d16] border border-white/[0.08]">
                    <div className="flex items-center space-x-3">
                      <img src={imageUrl} alt="Cover preview" className="w-10 h-10 rounded-lg object-cover border border-white/[0.1]" />
                      <span className="text-xs text-cyan-400 font-mono">Image attached</span>
                    </div>
                    <button type="button" onClick={() => setImageUrl(null)} className="p-1 text-slate-400 hover:text-rose-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#090d16] hover:bg-[#111827] border border-dashed border-white/[0.1] text-slate-300 text-xs transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-cyan-400" />
                    <span>Upload Cover Image or Wireframe</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {/* Category & Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-proj-category" className="block font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    id="new-proj-category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-[#111827] text-slate-100 border border-white/[0.08]"
                  >
                    <option value="Web Dev">Web Dev</option>
                    <option value="AI Systems">AI Systems</option>
                    <option value="Mobile Dev">Mobile Dev</option>
                    <option value="Developer Tools">Developer Tools</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-proj-hours" className="block font-semibold text-slate-300 mb-1">
                    Target Hours
                  </label>
                  <input
                    id="new-proj-hours"
                    name="targetHours"
                    type="number"
                    min={1}
                    max={500}
                    value={targetHours}
                    onChange={(e) => setTargetHours(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-[#111827] text-slate-100 border border-white/[0.08] font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="new-proj-tags" className="block font-semibold text-slate-300 mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  id="new-proj-tags"
                  name="tags"
                  type="text"
                  placeholder="React, TypeScript, Tailwind, Rust"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08]"
                />
              </div>

              {/* Initial Subtasks */}
              <div>
                <label htmlFor="new-proj-tasks" className="block font-semibold text-slate-300 mb-1">
                  Initial Subtasks (One per line)
                </label>
                <textarea
                  id="new-proj-tasks"
                  name="initialTasks"
                  rows={3}
                  placeholder="Setup monorepo structure&#10;Implement authentication tokens&#10;Configure CI/CD"
                  value={initialTaskInput}
                  onChange={(e) => setInitialTaskInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08] font-mono resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition cursor-pointer"
              >
                Create Project
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
