import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { Plus, X, FolderKanban } from 'lucide-react';

export function NewProjectModal() {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject, showToast } = useAppState();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [targetHours, setTargetHours] = useState(10);
  const [tagsInput, setTagsInput] = useState('React, Tailwind');
  const [initialTaskInput, setInitialTaskInput] = useState('');

  if (!isNewProjectModalOpen) return null;

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
      status: 'in-progress',
      tags,
      targetHours: Number(targetHours) || 10,
      loggedMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: initialTasks.length > 0 ? initialTasks : [
        { id: `task_default_${Date.now()}`, title: 'Setup project workspace and specs', completed: false, estimatedMinutes: 30 }
      ]
    };

    addProject(newProj);
    setIsNewProjectModalOpen(false);
    setTitle('');
    setDescription('');
    setTagsInput('React, Tailwind');
    setInitialTaskInput('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4 animate-in fade-in duration-150"
      onClick={() => setIsNewProjectModalOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel bg-slate-900/95 border-cyan-500/50 shadow-2xl overflow-hidden rounded-2xl p-6 space-y-4"
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

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
            <label className="block font-semibold text-slate-300 mb-1">Initial Subtasks (One per line)</label>
            <textarea
              rows={3}
              placeholder="Setup repo and environment&#10;Implement core auth endpoints&#10;Deploy initial staging build"
              value={initialTaskInput}
              onChange={(e) => setInitialTaskInput(e.target.value)}
              className="glass-input w-full text-xs font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            Create Project
          </button>
        </form>

      </div>
    </div>
  );
}
