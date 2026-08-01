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
  FilePlus
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
    setIsNewProjectModalOpen,
    startTimer,
    setCurrentView,
    showToast
  } = useAppState();

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnInput, setColumnInput] = useState({ todo: '', in_progress: '', in_review: '', done: '' });
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'notes'

  const [page2Notes, setPage2Notes] = useState(() => {
    try { return localStorage.getItem('pt_page2_notes') || ''; } catch (e) { return ''; }
  });

  const [page2Cards, setPage2Cards] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_page2_cards');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardContent, setNewCardContent] = useState('');

  // Filter projects if selected
  const activeProjects = selectedProjectId === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  // Extract all tasks with their parent project reference
  const allKanbanTasks = [];
  activeProjects.forEach(project => {
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

  // Calculate task statistics
  const totalTaskCount = allKanbanTasks.length;
  const doneCount = allKanbanTasks.filter(t => t.column === 'done').length;
  const inProgressCount = allKanbanTasks.filter(t => t.column === 'in_progress').length;
  const todoCount = allKanbanTasks.filter(t => t.column === 'todo').length;
  const progressPercent = totalTaskCount > 0 ? Math.round((doneCount / totalTaskCount) * 100) : 0;

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
      // Find the newly added task ID after state update or pass column status
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

  const savePage2Notes = (val) => {
    setPage2Notes(val);
    try { localStorage.setItem('pt_page2_notes', val); } catch (e) {}
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
      
      {/* Page 2 Header Banner & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Kanban className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-lg text-slate-100 tracking-tight">Page 2: Kanban Board & Workspace</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">PAGE 2</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              4-column task board ({totalTaskCount} tasks) • {progressPercent}% Completed
            </p>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'kanban'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'notes'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes & Cards</span>
            </button>
          </div>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {activeTab === 'kanban' ? (
        <div className="space-y-4">
          
          {/* Kanban Toolbar (Project Selector & Search) */}
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

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search board tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input text-xs w-full pl-9 bg-slate-950"
              />
            </div>
          </div>

          {/* 4-COLUMN KANBAN BOARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(col => {
              const ColumnIcon = col.icon;
              const columnTasks = allKanbanTasks.filter(t => t.column === col.id);

              return (
                <div 
                  key={col.id}
                  className={`flex flex-col rounded-2xl bg-slate-900/70 border ${col.borderHeader} overflow-hidden shadow-xl min-h-[500px]`}
                >
                  {/* Column Header */}
                  <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ColumnIcon className={`w-4 h-4 ${col.color}`} />
                      <h3 className="font-bold text-xs text-slate-200">{col.title}</h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${col.badgeBg}`}>
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Inline Task Add Input */}
                  <form onSubmit={(e) => handleAddColumnTask(col.id, e)} className="p-2 border-b border-slate-800/60 bg-slate-900/40">
                    <input
                      type="text"
                      placeholder={`+ Add task to ${col.title}...`}
                      value={columnInput[col.id] || ''}
                      onChange={(e) => setColumnInput({ ...columnInput, [col.id]: e.target.value })}
                      className="glass-input text-[11px] w-full bg-slate-950 py-1.5"
                    />
                  </form>

                  {/* Column Task Cards Stream */}
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

                          {/* Column Shift Arrow Buttons */}
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
      ) : (
        /* PAGE 2 SCRATCHPAD & CUSTOM CARDS TAB */
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
