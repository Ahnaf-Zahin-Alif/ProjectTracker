import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Layers,
  ListTodo
} from 'lucide-react';
import { formatMinutesToHours } from '../../utils/dateUtils';

const COLUMNS = [
  { id: 'todo', title: 'To Do / Backlog', icon: ListTodo, color: 'text-amber-400', badgeBg: 'bg-amber-950/40 text-amber-300 border-amber-800/60', borderHeader: 'border-amber-500/30' },
  { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-cyan-400', badgeBg: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60', borderHeader: 'border-cyan-500/30' },
  { id: 'in_review', title: 'In Review', icon: Layers, color: 'text-violet-400', badgeBg: 'bg-violet-950/40 text-violet-300 border-violet-800/60', borderHeader: 'border-violet-500/30' },
  { id: 'done', title: 'Done / Completed', icon: CheckCircle2, color: 'text-emerald-400', badgeBg: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60', borderHeader: 'border-emerald-500/30' }
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
    setColumnInput(prev => ({ ...prev, [columnId]: '' }));
    showToast(`⚡ Added task to ${COLUMNS.find(c => c.id === columnId)?.title}`);
  };

  const handleMoveTask = (projectId, taskId, currentColumn, direction) => {
    const colOrder = ['todo', 'in_progress', 'in_review', 'done'];
    const currentIndex = colOrder.indexOf(currentColumn);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < colOrder.length) {
      const nextCol = colOrder[nextIndex];
      updateTaskStatus(projectId, taskId, nextCol);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 studio-panel p-4 bg-[#0b101b]">
        
        {/* Left: View Title & Project Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">Interactive Kanban Pipeline</h2>
              <p className="text-[11px] text-slate-400">Drag, organize & execute across sprint columns</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:pl-3 sm:border-l border-white/[0.08]">
            <label htmlFor="kanban-filter-project" className="text-xs font-semibold text-slate-400 font-mono">
              PROJECT:
            </label>
            <select
              id="kanban-filter-project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs font-bold text-cyan-300 py-1.5 px-2.5 rounded-lg bg-[#111827] border border-white/[0.08] cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Search & Sprint Progress */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08]"
              aria-label="Filter tasks"
            />
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">Pipeline:</span>
            <span className="font-bold text-cyan-400 tabular-nums">{progressPercent}%</span>
            <div className="w-20 bg-[#111827] rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* 4-Column Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map(col => {
          const colTasks = allKanbanTasks.filter(t => t.column === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className="studio-panel flex flex-col bg-[#0b101b] border-white/[0.07] overflow-hidden"
            >
              {/* Column Header */}
              <div className={`flex items-center justify-between p-3 border-b ${col.borderHeader} bg-[#090d16]`}>
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    {col.title}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${col.badgeBg} tabular-nums`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-2.5 min-h-[380px] max-h-[620px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      key={task.id}
                      className="p-3 rounded-xl bg-[#111827] hover:bg-[#162033] border border-white/[0.06] hover:border-white/[0.12] transition shadow-sm space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090d16] text-cyan-400 border border-white/[0.05] truncate max-w-[150px]">
                          {task.projectTitle}
                        </div>
                        <button
                          onClick={() => deleteTaskFromProject(task.projectId, task.id)}
                          className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-0.5"
                          title="Delete task"
                          aria-label="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className={`text-xs font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                          ~{task.estimatedMinutes || 30}m
                        </span>

                        <div className="flex items-center space-x-1">
                          {col.id !== 'todo' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'prev')}
                              className="p-1 rounded bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-white"
                              title="Move left"
                              aria-label="Move task left"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </motion.button>
                          )}

                          {col.id !== 'done' && (
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleMoveTask(task.projectId, task.id, col.id, 'next')}
                              className="p-1 rounded bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-white"
                              title="Move right"
                              aria-label="Move task right"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
                    <p>No tasks in this lane</p>
                  </div>
                )}
              </div>

              {/* Quick Add Form at Column Footer */}
              <form onSubmit={(e) => handleAddColumnTask(col.id, e)} className="p-2.5 border-t border-white/[0.06] bg-[#090d16]">
                <div className="flex items-center space-x-1.5">
                  <input
                    type="text"
                    placeholder={`+ Add to ${col.title.split('/')[0]}...`}
                    value={columnInput[col.id] || ''}
                    onChange={(e) => setColumnInput(prev => ({ ...prev, [col.id]: e.target.value }))}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08]"
                    aria-label={`Add task to ${col.title}`}
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!columnInput[col.id]?.trim()}
                    className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Submit new task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </form>
            </div>
          );
        })}
      </div>

    </main>
  );
}
