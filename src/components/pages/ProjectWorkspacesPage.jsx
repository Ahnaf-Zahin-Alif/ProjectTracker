import React, { useState, useRef } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  FolderKanban, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Tag, 
  Upload, 
  Globe, 
  Instagram, 
  Github, 
  Sparkles, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  Volume2,
  VolumeX,
  Layers,
  Zap,
  PlayCircle
} from 'lucide-react';
import { formatMinutesToHours, formatSecondsToTimer } from '../../utils/dateUtils';

export function ProjectWorkspacesPage() {
  const { 
    projects, 
    addProject, 
    deleteProject, 
    toggleTaskCompletion, 
    addTaskToProject,
    activeProjectId,
    setActiveProjectId,
    timerMode,
    timerSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    showToast
  } = useAppState();

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [reelUrl, setReelUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newTaskInputs, setNewTaskInputs] = useState({});

  const imageInputRef = useRef(null);

  // Handle Image Upload / Paste / Drop
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setSelectedImage({ name: file.name, dataUrl: evt.target.result });
        showToast('📥 Screenshot attached!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            setSelectedImage({ name: `pasted_screenshot_${Date.now()}.png`, dataUrl: evt.target.result });
            showToast('📋 Screenshot pasted from clipboard!');
          };
          reader.readAsDataURL(file);
        }
        break;
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
        setSelectedImage({ name: file.name, dataUrl: evt.target.result });
        showToast('📥 Image dropped!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Project with Twin Tiles
  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    const title = projectTitle.trim() || 
                  (githubUrl ? `Repo: ${githubUrl.split('/').pop()}` : null) || 
                  (reelUrl ? 'Insta Reel Project' : 'New Project Workspace');

    const newProj = {
      id: `proj_${Date.now()}`,
      title,
      description: 'Project workspace created with GitHub, Instagram Reel & Screenshot references.',
      category: 'FullStack',
      status: 'in-progress',
      githubUrl: githubUrl.trim() || null,
      reelUrl: reelUrl.trim() || null,
      imageUrl: selectedImage ? selectedImage.dataUrl : null,
      tags: ['React', 'Node.js', 'AI', 'Tailwind'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: `task_1_${Date.now()}`, title: 'Setup GitHub repository & environment', completed: true, estimatedMinutes: 25 },
        { id: `task_2_${Date.now()}`, title: 'Analyze Instagram Reel UI mockup breakdown', completed: false, estimatedMinutes: 45 },
        { id: `task_3_${Date.now()}`, title: 'Implement component architecture & state', completed: false, estimatedMinutes: 60 },
        { id: `task_4_${Date.now()}`, title: 'Verify responsive layout and deploy', completed: false, estimatedMinutes: 30 }
      ]
    };

    addProject(newProj);
    setActiveProjectId(newProj.id);
    
    // Reset Form
    setProjectTitle('');
    setGithubUrl('');
    setReelUrl('');
    setSelectedImage(null);
    showToast(`🚀 Twin Tiles created for project: "${title}"`);
  };

  const handleAddTaskInline = (projId, e) => {
    e.preventDefault();
    const inputVal = newTaskInputs[projId]?.trim();
    if (!inputVal) return;

    addTaskToProject(projId, inputVal, 30);
    setNewTaskInputs(prev => ({ ...prev, [projId]: '' }));
    showToast('✨ Subtask added');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-fadeIn" onPaste={handlePaste}>
      
      {/* Workspace Generator Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 backdrop-blur-md shadow-2xl space-y-5">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-slate-100 tracking-tight">Project Workspaces Generator</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter a GitHub Repository link, Instagram Reel link, and UI Screenshot to automatically generate a dedicated **Twin-Tile Pair** (Project Tracker + Focus Timer) for every project.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleCreateWorkspace} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Project Title / Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g., AI Video Clipper App"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="glass-input text-xs w-full py-2 px-3 bg-slate-950 text-slate-100"
            />
          </div>

          {/* GitHub Repository Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              <span>GitHub Repo Link</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/user/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="glass-input text-xs w-full py-2 px-3 bg-slate-950 text-slate-100 font-mono"
            />
          </div>

          {/* Instagram Reel Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
              <Instagram className="w-3.5 h-3.5 text-violet-400" />
              <span>Instagram Reel Link</span>
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              className="glass-input text-xs w-full py-2 px-3 bg-slate-950 text-slate-100 font-mono"
            />
          </div>

          {/* Screenshot Upload Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Attach Screenshot</span>
              <span className="text-[10px] text-slate-500">Upload or Ctrl+V</span>
            </label>
            
            {selectedImage ? (
              <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-950 border border-cyan-500/50">
                <div className="flex items-center space-x-2 min-w-0">
                  <img src={selectedImage.dataUrl} alt="Preview" className="w-7 h-7 rounded object-cover border border-slate-700 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{selectedImage.name}</span>
                </div>
                <button type="button" onClick={() => setSelectedImage(null)} className="p-1 text-slate-400 hover:text-rose-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => imageInputRef.current?.click()}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-dashed border-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-[11px] truncate">Upload / Paste Screenshot</span>
              </div>
            )}
            <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          {/* Submit Button (Full Width) */}
          <div className="md:col-span-2 lg:col-span-4 pt-1">
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Generate Project Workspace Twin Tiles</span>
            </button>
          </div>
        </form>
      </div>

      {/* List of Projects - Dynamic Twin-Tile Pair per Project */}
      <div className="space-y-8">
        {projects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-200 text-base">No Project Workspaces Created Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Fill out the GitHub, Insta Reel, and Screenshot form above to create your first twin-tile project workspace!</p>
          </div>
        ) : (
          projects.map((project) => {
            const completedCount = (project.tasks || []).filter(t => t.completed).length;
            const totalCount = (project.tasks || []).length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isThisProjectActiveTimer = activeProjectId === project.id;

            return (
              <div key={project.id} className="space-y-3">
                {/* Project Header Divider */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <h2 className="font-extrabold text-base text-slate-100 tracking-tight">{project.title}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      {completedCount}/{totalCount} Completed ({percent}%)
                    </span>
                  </div>

                  <button
                    onClick={() => deleteProject(project.id)}
                    className="flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-400 transition"
                    title="Delete project workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Workspace</span>
                  </button>
                </div>

                {/* Twin Tile Pair Grid (Side-by-side) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* TILE 1 (LEFT): Project Tracker Tile */}
                  <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                    
                    {/* Tile Header */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <FolderKanban className="w-4 h-4 text-cyan-400" />
                        <h3 className="font-bold text-sm text-slate-100">Project Tracker</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {totalCount} Tasks
                        </span>
                      </div>

                      {/* External Links */}
                      <div className="flex items-center space-x-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-cyan-300 transition"
                            title="Open GitHub Repo"
                          >
                            <Github className="w-3 h-3" />
                            <span>Repo</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}

                        {project.reelUrl && (
                          <a
                            href={project.reelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-violet-300 transition"
                            title="Open Instagram Reel"
                          >
                            <Instagram className="w-3 h-3" />
                            <span>Reel</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Tile Content */}
                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      
                      {/* Attached Screenshot Preview Banner if present */}
                      {project.imageUrl && (
                        <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <img src={project.imageUrl} alt="Mockup" className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                          <div>
                            <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block">Attached Reference Screenshot</span>
                            <span className="text-xs text-slate-300 font-medium line-clamp-1">{project.title} Wireframe Mockup</span>
                          </div>
                        </div>
                      )}

                      {/* Tasks Checklist */}
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {(project.tasks || []).map(task => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800/80 transition"
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <button
                                onClick={() => toggleTaskCompletion(project.id, task.id)}
                                className="text-slate-400 hover:text-cyan-400 transition flex-shrink-0"
                              >
                                {task.completed ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                              <span className={`text-xs font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 flex-shrink-0 ml-2">
                              ~{task.estimatedMinutes || 30}m
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add Task Inline Input */}
                      <form onSubmit={(e) => handleAddTaskInline(project.id, e)} className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
                        <input
                          type="text"
                          placeholder="+ Add subtask to this project..."
                          value={newTaskInputs[project.id] || ''}
                          onChange={(e) => setNewTaskInputs({ ...newTaskInputs, [project.id]: e.target.value })}
                          className="glass-input text-xs w-full py-1.5 px-3"
                        />
                        <button type="submit" className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex-shrink-0">
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </form>

                    </div>
                  </div>

                  {/* TILE 2 (RIGHT): Dedicated Focus Timer Tile */}
                  <div className="lg:col-span-5 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
                    
                    {/* Tile Header */}
                    <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <h3 className="font-bold text-sm text-slate-100">Focus Timer & Pomodoro</h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isThisProjectActiveTimer && isRunning 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {isThisProjectActiveTimer && isRunning ? 'RUNNING' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Tile Content */}
                    <div className="p-5 flex-1 flex flex-col items-center justify-between space-y-4 text-center">
                      
                      {/* Target Indicator */}
                      <div className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Project</span>
                        <span className="font-bold text-cyan-300 truncate max-w-[180px]">{project.title}</span>
                      </div>

                      {/* Timer Display Circle */}
                      <div className="relative flex flex-col items-center justify-center w-36 h-36 rounded-full bg-slate-950 border-4 border-cyan-500/40 shadow-inner shadow-cyan-500/20">
                        <span className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">
                          {isThisProjectActiveTimer ? formatSecondsToTimer(timerSeconds) : '25:00'}
                        </span>
                        <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-widest mt-0.5">
                          POMODORO
                        </span>
                      </div>

                      {/* Timer Controls */}
                      <div className="w-full flex items-center justify-center space-x-3">
                        {isThisProjectActiveTimer && isRunning ? (
                          <button
                            onClick={pauseTimer}
                            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
                          >
                            <Pause className="w-4 h-4 fill-current" />
                            <span>Pause Focus Session</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveProjectId(project.id);
                              startTimer();
                              showToast(`⏳ Started focus timer for "${project.title}"`);
                            }}
                            className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 transition cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Focus Session</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveProjectId(project.id);
                            resetTimer('pomodoro');
                          }}
                          className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition"
                          title="Reset Timer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
