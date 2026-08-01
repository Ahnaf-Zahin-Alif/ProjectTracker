import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { 
  Kanban, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  FolderKanban, 
  Sparkles, 
  Layers, 
  ListTodo, 
  CheckSquare, 
  Square,
  AlertCircle,
  FileText,
  Save,
  Grid,
  LayoutDashboard,
  FilePlus,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Tag,
  BarChart3,
  Target
} from 'lucide-react';
import { formatMinutesToHours } from '../../utils/dateUtils';

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do / Backlog', icon: ListTodo, color: 'text-amber-400', badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-800/80', borderHeader: 'border-amber-500/40' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80', borderHeader: 'border-cyan-500/40' },
  { id: 'in_review', title: 'In Review', icon: Layers, color: 'text-violet-400', badgeBg: 'bg-violet-950/60 text-violet-300 border-violet-800/80', borderHeader: 'border-violet-500/40' },
  { id: 'done', title: 'Done / Completed', icon: CheckCircle2, color: 'text-emerald-400', badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80', borderHeader: 'border-emerald-500/40' }
];

export function BlankPage() {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    updateTaskStatus, 
    deleteTaskFromProject, 
    addTaskToProject,
    toggleTaskCompletion,
    deleteProject,
    setIsNewProjectModalOpen,
    startTimer,
    setCurrentView,
    showToast
  } = useAppState();

  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'dashboard' | 'kanban' | 'notes'
  const [selectedDashboardProjId, setSelectedDashboardProjId] = useState(() => activeProjectId || projects[0]?.id || null);

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnInput, setColumnInput] = useState({ todo: '', in_progress: '', in_review: '', done: '' });
  const [newTaskInput, setNewTaskInput] = useState({});

  const [page2Notes, setPage2Notes] = useState(() => {
    try { return localStorage.getItem('pt_page2_notes') || ''; } catch (e) { return ''; }
  });

  const [projectNotes, setProjectNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_individual_proj_notes');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });

  const [page2Cards, setPage2Cards] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_page2_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');

  // Target project for individual dashboard view
  const targetDashboardProject = projects.find(p => p.id === selectedDashboardProjId) || projects[0] || null;

  // Filter projects for the list view
  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(query) ||
           (p.description && p.description.toLowerCase().includes(query)) ||
           (p.tags && p.tags.some(t => t.toLowerCase().includes(query)));
  });

  // Extract all tasks for Kanban view
  const activeProjectsForKanban = selectedProjectId === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  const allKanbanTasks = [];
  activeProjectsForKanban.forEach(project => {
    (project.tasks || []).forEach(task => {
      let taskCol = task.status || (task.completed ? 'done' : 'todo');
      if (searchQuery) {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              project.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return;
      }
      allKanbanTasks.push({
        ...task,
        column: taskCol,
        projectId: project.id,
        projectTitle: project.title,
        projectCategory: project.category || 'Development'
      });
    });
  });

  const handleAddColumnTask = (columnId, e) => {
    e.preventDefault();
    const taskTitle = columnInput[columnId]?.trim();
    if (!taskTitle) return;

    const targetProjId = selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || null);
    if (!targetProjId) {
      showToast('⚠️ Create a project first to add tasks!');
      setIsNewProjectModalOpen(true);
      return;
    }

    addTaskToProject(targetProjId, taskTitle, 30);
    if (columnId !== 'todo') {
      setTimeout(() => {
        const proj = projects.find(p => p.id === targetProjId);
        const lastTask = proj?.tasks?.[proj.tasks.length - 1];
        if (lastTask) updateTaskStatus(targetProjId, lastTask.id, columnId);
      }, 50);
    }
    setColumnInput(prev => ({ ...prev, [columnId]: '' }));
    showToast(`⚡ Task added to ${KANBAN_COLUMNS.find(c => c.id === columnId)?.title}`);
  };

  const handleMoveTask = (projectId, taskId, currentColumn, direction) => {
    const colOrder = ['todo', 'in_progress', 'in_review', 'done'];
    const currentIndex = colOrder.indexOf(currentColumn);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < colOrder.length) {
      const nextCol = colOrder[targetIndex];
      updateTaskStatus(projectId, taskId, nextCol);
    }
  };

  const handleAddInlineTask = (projectId, e) => {
    e.preventDefault();
    const taskTitle = newTaskInput[projectId]?.trim();
    if (!taskTitle) return;
    addTaskToProject(projectId, taskTitle, 30);
    setNewTaskInput(prev => ({ ...prev, [projectId]: '' }));
    showToast('✨ Task added to project!');
  };

  const savePage2Notes = (val) => {
    setPage2Notes(val);
    try { localStorage.setItem('pt_page2_notes', val); } catch (e) {}
  };

  const saveIndividualProjNotes = (projId, val) => {
    const updated = { ...projectNotes, [projId]: val };
    setProjectNotes(updated);
    try { localStorage.setItem('pt_individual_proj_notes', JSON.stringify(updated)); } catch (e) {}
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    const newCard = {
      id: `card_${Date.now()}`,
      title: newCardTitle.trim(),
      content: newCardContent.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [newCard, ...page2Cards];
    setPage2Cards(updated);
    try { localStorage.setItem('pt_page2_cards', JSON.stringify(updated)); } catch (e) {}

    setNewCardTitle('');
    setNewCardContent('');
    showToast('✨ Added card to Page 2 canvas!');
  };

  const handleDeleteCard = (cardId) => {
    const updated = page2Cards.filter(c => c.id !== cardId);
    setPage2Cards(updated);
    try { localStorage.setItem('pt_page2_cards', JSON.stringify(updated)); } catch (e) {}
    showToast('🗑️ Card removed from Page 2');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      


      {/* SEARCH BAR (Visible across Page 2 views) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, tags, or tasks on Page 2..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input text-xs w-full pl-9 bg-slate-950"
          />
        </div>

        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Project</span>
        </button>
      </div>

      {/* TAB 1: ALL PROJECTS AND THEIR TASKS LISTED */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-100 flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" />
              <span>All Workspace Projects & Listed Subtasks</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{filteredProjects.length} Projects Total</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3">
              <FolderKanban className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="font-bold text-slate-300 text-sm">No projects found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a project using the button above to populate your workspace.</p>
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Project</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map(proj => {
                const totalTasks = proj.tasks?.length || 0;
                const completedTasks = proj.tasks?.filter(t => t.completed).length || 0;
                const percentDone = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                const loggedMinutes = proj.loggedMinutes || 0;
                const percentTime = Math.min(100, Math.round((loggedMinutes / ((proj.targetHours || 10) * 60)) * 100));

                return (
                  <div key={proj.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                    
                    {/* Project Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                      <div className="flex items-start space-x-3.5">
                        {proj.imageUrl && (
                          <img src={proj.imageUrl} alt={proj.title} className="w-14 h-14 rounded-xl object-cover border border-slate-700/80 flex-shrink-0" />
                        )}
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {proj.category || 'Web Dev'}
                            </span>
                            <h4 className="font-bold text-slate-100 text-base">{proj.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              proj.status === 'completed' 
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' 
                                : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                            }`}>
                              {proj.status}
                            </span>
                          </div>
                          {proj.description && (
                            <p className="text-xs text-slate-300 mt-1">{proj.description}</p>
                          )}

                          {/* Tags */}
                          {proj.tags && proj.tags.length > 0 && (
                            <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-y-1">
                              {proj.tags.map((t, idx) => (
                                <span key={idx} className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-slate-950 text-slate-300 border border-slate-800">
                                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                                  <span>{t}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Controls */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <button
                          onClick={() => {
                            setSelectedDashboardProjId(proj.id);
                            setActiveTab('dashboard');
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-semibold transition"
                        >
                          <BarChart3 className="w-3.5 h-3.5" />
                          <span>Open Dedicated Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveProjectId(proj.id);
                            startTimer();
                            showToast(`⏱️ Started focus session for "${proj.title}"`);
                          }}
                          className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition"
                          title="Start Focus Timer"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Listed Tasks */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span>Tasks List ({completedTasks}/{totalTasks} Completed)</span>
                        <span className="text-cyan-400 font-mono">{percentDone}% Done • {formatMinutesToHours(loggedMinutes)} / {proj.targetHours}h Logged</span>
                      </div>

                      {/* Inline Task Add Form */}
                      <form onSubmit={(e) => handleAddInlineTask(proj.id, e)} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="+ Add new subtask to this project..."
                          value={newTaskInput[proj.id] || ''}
                          onChange={(e) => setNewTaskInput({ ...newTaskInput, [proj.id]: e.target.value })}
                          className="glass-input text-xs flex-1 bg-slate-950 py-1.5"
                        />
                        <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
                          Add Task
                        </button>
                      </form>

                      {/* Task Items List */}
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {proj.tasks?.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => toggleTaskCompletion(proj.id, task.id)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 cursor-pointer transition"
                          >
                            <div className="flex items-center space-x-2.5">
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              )}
                              <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {task.estimatedMinutes && (
                                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  ~{task.estimatedMinutes}m
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTaskFromProject(proj.id, task.id);
                                }}
                                className="text-slate-600 hover:text-rose-400 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INDIVIDUAL DEDICATED PROJECT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Project Dashboard Selector Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Select Project Dashboard:</span>
              <select
                value={selectedDashboardProjId || ''}
                onChange={(e) => setSelectedDashboardProjId(e.target.value)}
                className="glass-input text-xs font-bold text-slate-100 bg-slate-950 cursor-pointer"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="text-slate-400 font-mono text-xs">
              Viewing Dedicated Dashboard for: <strong className="text-cyan-300">{targetDashboardProject?.title}</strong>
            </div>
          </div>

          {targetDashboardProject ? (
            <div className="space-y-6">
              
              {/* Project Hero Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-4">
                  {targetDashboardProject.imageUrl && (
                    <img src={targetDashboardProject.imageUrl} alt={targetDashboardProject.title} className="w-20 h-20 rounded-2xl object-cover border border-cyan-500/40 flex-shrink-0 shadow-lg" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-cyan-500 text-slate-950">
                        {targetDashboardProject.category || 'Web Dev'}
                      </span>
                      <h2 className="font-extrabold text-xl text-slate-100">{targetDashboardProject.title}</h2>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">{targetDashboardProject.description}</p>
                    
                    {targetDashboardProject.tags && (
                      <div className="flex items-center space-x-1.5 mt-3 flex-wrap gap-y-1">
                        {targetDashboardProject.tags.map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-950 text-slate-300 border border-slate-800">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setActiveProjectId(targetDashboardProject.id);
                      startTimer();
                      showToast(`⏱️ Focus session started for "${targetDashboardProject.title}"`);
                    }}
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/25"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Launch Focus Timer</span>
                  </button>
                </div>
              </div>

              {/* Individual Dashboard Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Logged Focus Time</span>
                  <div className="text-2xl font-extrabold font-mono text-cyan-400">
                    {formatMinutesToHours(targetDashboardProject.loggedMinutes || 0)}
                  </div>
                  <span className="text-[11px] text-slate-500">Target Goal: {targetDashboardProject.targetHours || 10}h</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Subtask Progress</span>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400">
                    {targetDashboardProject.tasks?.filter(t => t.completed).length || 0} / {targetDashboardProject.tasks?.length || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {targetDashboardProject.tasks?.length > 0 ? Math.round(((targetDashboardProject.tasks.filter(t => t.completed).length) / targetDashboardProject.tasks.length) * 100) : 0}% Completed
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Estimated Time Remaining</span>
                  <div className="text-2xl font-extrabold font-mono text-violet-400">
                    {formatMinutesToHours(
                      (targetDashboardProject.tasks || [])
                        .filter(t => !t.completed)
                        .reduce((acc, curr) => acc + (curr.estimatedMinutes || 30), 0)
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">Pending tasks work</span>
                </div>
              </div>

              {/* Subtasks Management & Individual Scratchpad Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Subtask Checklist */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-200">Project Tasks Checklist</h3>
                    <span className="text-xs text-cyan-400 font-mono">
                      {targetDashboardProject.tasks?.length || 0} Tasks Listed
                    </span>
                  </div>

                  <form onSubmit={(e) => handleAddInlineTask(targetDashboardProject.id, e)} className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="+ Add task to this project..."
                      value={newTaskInput[targetDashboardProject.id] || ''}
                      onChange={(e) => setNewTaskInput({ ...newTaskInput, [targetDashboardProject.id]: e.target.value })}
                      className="glass-input text-xs flex-1 bg-slate-950 py-1.5"
                    />
                    <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs">
                      Add
                    </button>
                  </form>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {targetDashboardProject.tasks?.map(task => (
                      <div
                        key={task.id}
                        onClick={() => toggleTaskCompletion(targetDashboardProject.id, task.id)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 cursor-pointer transition"
                      >
                        <div className="flex items-center space-x-3">
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          )}
                          <span className={`text-xs font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            ~{task.estimatedMinutes || 30}m
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTaskFromProject(targetDashboardProject.id, task.id);
                            }}
                            className="text-slate-600 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Dedicated Project Scratchpad */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <h3 className="font-bold text-sm text-slate-200">Dedicated Project Notes</h3>
                    </div>
                    <button
                      onClick={() => showToast(`📝 Saved notes for "${targetDashboardProject.title}"`)}
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>

                  <textarea
                    value={projectNotes[targetDashboardProject.id] || ''}
                    onChange={(e) => saveIndividualProjNotes(targetDashboardProject.id, e.target.value)}
                    placeholder={`Notes and ideas for ${targetDashboardProject.title}...`}
                    className="glass-input font-mono text-xs w-full h-64 resize-none leading-relaxed bg-slate-950"
                  />
                </div>

              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">No project selected</div>
          )}

        </div>
      )}

      {/* TAB 3: 4-COLUMN KANBAN BOARD */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">Filter Project:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="glass-input text-xs font-semibold text-slate-100 bg-slate-950 cursor-pointer"
              >
                <option value="all">All Projects ({projects.length})</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(col => {
              const ColumnIcon = col.icon;
              const columnTasks = allKanbanTasks.filter(t => t.column === col.id);

              return (
                <div 
                  key={col.id}
                  className={`flex flex-col rounded-2xl bg-slate-900/70 border ${col.borderHeader} overflow-hidden shadow-xl min-h-[500px]`}
                >
                  <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ColumnIcon className={`w-4 h-4 ${col.color}`} />
                      <h3 className="font-bold text-xs text-slate-200">{col.title}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${col.badgeBg}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  <form onSubmit={(e) => handleAddColumnTask(col.id, e)} className="p-2 border-b border-slate-800/60 bg-slate-900/40">
                    <input
                      type="text"
                      placeholder={`+ Add task to ${col.title}...`}
                      value={columnInput[col.id] || ''}
                      onChange={(e) => setColumnInput({ ...columnInput, [col.id]: e.target.value })}
                      className="glass-input text-[11px] w-full bg-slate-950 py-1.5"
                    />
                  </form>

                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[600px]">
                    {columnTasks.length === 0 ? (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800/80 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-slate-600 mb-1" />
                        <span className="text-[11px] text-slate-500 font-medium">No tasks in this column</span>
                      </div>
                    ) : (
                      columnTasks.map(task => (
                        <div 
                          key={`${task.projectId}_${task.id}`}
                          className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold text-slate-200 line-clamp-2">
                              {task.title}
                            </span>
                            <button
                              onClick={() => deleteTaskFromProject(task.projectId, task.id)}
                              className="text-slate-600 hover:text-rose-400 p-0.5 transition"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 font-mono line-clamp-1 max-w-[110px]">
                              {task.projectTitle}
                            </span>

                            {task.estimatedMinutes && (
                              <span className="font-mono text-cyan-400 bg-slate-900 px-1 rounded">
                                ~{task.estimatedMinutes}m
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <button
                              disabled={col.id === 'todo'}
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'prev')}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setActiveProjectId(task.projectId);
                                startTimer();
                                showToast(`⏱️ Started timer for project: "${task.projectTitle}"`);
                              }}
                              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Focus</span>
                            </button>

                            <button
                              disabled={col.id === 'done'}
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'next')}
                              className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: PAGE 2 SCRATCHPAD & CUSTOM CARDS */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="glass-panel p-5 rounded-2xl bg-slate-900/80 border-slate-800 flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-slate-200">Page 2 Scratchpad & Notes</h3>
                </div>
                <button
                  onClick={() => showToast('📝 Page 2 notes saved!')}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              <textarea
                value={page2Notes}
                onChange={(e) => savePage2Notes(e.target.value)}
                placeholder="Type your notes, ideas, or temporary specs for Page 2..."
                className="glass-input font-mono text-xs w-full h-72 resize-none leading-relaxed bg-slate-950"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Auto-saves to Page 2 cache</span>
                <span>{page2Notes.length} characters</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="glass-panel p-5 rounded-2xl bg-slate-900/80 border-slate-800 space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">Add Custom Canvas Card</h3>
              </div>

              <form onSubmit={handleAddCard} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Card Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next.js API Architecture Ideas"
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Card Details / Snippet</label>
                  <textarea
                    rows={3}
                    placeholder="Details, checklist items, or links..."
                    value={newCardContent}
                    onChange={(e) => setNewCardContent(e.target.value)}
                    className="glass-input w-full text-xs font-mono resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Card to Canvas</span>
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {page2Cards.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
                  <FilePlus className="w-6 h-6 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">Page 2 Cards area is empty</p>
                </div>
              ) : (
                page2Cards.map((card) => (
                  <div key={card.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 relative group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-200 text-xs">{card.title}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{card.createdAt}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {card.content && (
                      <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        {card.content}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
