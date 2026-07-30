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
  AlertCircle
} from 'lucide-react';
import { formatMinutesToHours } from '../../utils/dateUtils';

const COLUMNS = [
  { id: 'todo', title: 'To Do / Backlog', icon: ListTodo, color: 'text-amber-400', badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-800/80', borderHeader: 'border-amber-500/40' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/80', borderHeader: 'border-cyan-500/40' },
  { id: 'in_review', title: 'In Review', icon: Layers, color: 'text-violet-400', badgeBg: 'bg-violet-950/60 text-violet-300 border-violet-800/80', borderHeader: 'border-violet-500/40' },
  { id: 'done', title: 'Done / Completed', icon: CheckCircle2, color: 'text-emerald-400', badgeBg: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80', borderHeader: 'border-emerald-500/40' }
];

export function KanbanBoardPage() {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    updateTaskStatus, 
    deleteTaskFromProject, 
    addTaskToProject,
    setIsNewProjectModalOpen,
    startTimer,
    showToast
  } = useAppState();

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [columnInput, setColumnInput] = useState({ todo: '', in_progress: '', in_review: '', done: '' });

  // Filter projects if selected
  const activeProjects = selectedProjectId === 'all' 
    ? projects 
    : projects.filter(p => p.id === selectedProjectId);

  // Extract all tasks with their parent project reference
  const allKanbanTasks = [];
  activeProjects.forEach(project => {
    (project.tasks || []).forEach(task => {
      // Determine status column fallback
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

    // Pick target project (either selected or first project)
    const targetProjId = selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || null);
    if (!targetProjId) {
      showToast('⚠️ Create a project first to add tasks!');
      setIsNewProjectModalOpen(true);
      return;
    }

    addTaskToProject(targetProjId, taskTitle, 30);
    // Move status immediately if column isn't todo
    setColumnInput(prev => ({ ...prev, [columnId]: '' }));
    showToast(`⚡ Added task to ${COLUMNS.find(c => c.id === columnId)?.title}`);
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

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Kanban className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="font-extrabold text-xl text-slate-100 tracking-tight">Kanban Task Workspace</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono">
                {totalTaskCount} Tasks
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize subtasks across workflow columns, update progress, and focus on active deliverables.
            </p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Selector Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input pl-8 py-1.5 text-xs w-44 md:w-56"
            />
          </div>

          {/* New Project Button */}
          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</span>
            <div className="text-xl font-bold text-slate-100 font-mono mt-0.5">{totalTaskCount}</div>
          </div>
          <ListTodo className="w-6 h-6 text-amber-400/80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">In Progress</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{inProgressCount}</div>
          </div>
          <Clock className="w-6 h-6 text-cyan-400/80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{doneCount}</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-center">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span>Overall Progress</span>
            <span className="text-cyan-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {COLUMNS.map(col => {
          const Icon = col.icon;
          const columnTasks = allKanbanTasks.filter(t => t.column === col.id);

          return (
            <div 
              key={col.id}
              className="flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/80 overflow-hidden shadow-lg min-h-[500px]"
            >
              {/* Column Header */}
              <div className={`p-4 bg-slate-900/90 border-b ${col.borderHeader} flex items-center justify-between`}>
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="font-bold text-sm text-slate-200">{col.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${col.badgeBg}`}>
                  {columnTasks.length}
                </span>
              </div>

              {/* Column Tasks Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px] scrollbar-thin">
                {columnTasks.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-slate-600 mb-1" />
                    <span className="text-xs text-slate-500 font-medium">No tasks in this column</span>
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="group p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition shadow-md flex flex-col space-y-2.5"
                    >
                      {/* Project Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 text-cyan-300 border border-slate-800 truncate max-w-[140px]">
                          {task.projectTitle}
                        </span>
                        
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          {/* Timer trigger */}
                          <button
                            onClick={() => {
                              setActiveProjectId(task.projectId);
                              startTimer();
                              showToast(`⏳ Started timer for "${task.projectTitle}"`);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                            title="Start focus timer for this project"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>

                          {/* Delete task */}
                          <button
                            onClick={() => deleteTaskFromProject(task.projectId, task.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Task Content */}
                      <div className="flex items-start space-x-2">
                        <button
                          onClick={() => updateTaskStatus(task.projectId, task.id, task.column === 'done' ? 'todo' : 'done')}
                          className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-cyan-400"
                        >
                          {task.column === 'done' ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <p className={`text-xs font-medium ${task.column === 'done' ? 'line-through text-slate-500' : 'text-slate-200'} leading-relaxed`}>
                          {task.title}
                        </p>
                      </div>

                      {/* Card Footer Actions & Time Estimate */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                        <span className="font-mono text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                          ~{task.estimatedMinutes || 30}m
                        </span>

                        {/* Move Column Buttons */}
                        <div className="flex items-center space-x-1">
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'prev')}
                              className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center space-x-0.5"
                              title="Move left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'next')}
                              className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center space-x-0.5"
                              title="Move right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Column Add Task Input Footer */}
              <form 
                onSubmit={(e) => handleAddColumnTask(col.id, e)}
                className="p-3 bg-slate-900/90 border-t border-slate-800/80"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`+ Add task to ${col.title}...`}
                    value={columnInput[col.id]}
                    onChange={(e) => setColumnInput({ ...columnInput, [col.id]: e.target.value })}
                    className="glass-input text-xs w-full py-1.5 px-2.5"
                  />
                  <button
                    type="submit"
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex-shrink-0"
                    title="Add task"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

    </div>
  );
}
