import React, { useState } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { 
  FolderKanban, 
  Play, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Tag, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { formatMinutesToHours } from '../../utils/dateUtils';

export function ProjectListTile() {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    toggleTaskCompletion, 
    addTaskToProject, 
    deleteProject,
    setIsNewProjectModalOpen,
    setSelectedProjectDetail,
    startTimer
  } = useAppState();

  const [filter, setFilter] = useState('all'); // 'all' | 'in-progress' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState(projects[0]?.id || null);
  const [newTaskInput, setNewTaskInput] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' ? true : p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleAddTask = (projectId, e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTaskToProject(projectId, newTaskInput.trim());
    setNewTaskInput('');
  };

  const handleStartTimerOnProject = (projId, e) => {
    e.stopPropagation();
    setActiveProjectId(projId);
    startTimer();
  };

  return (
    <TileWrapper
      title="Project Tracker"
      icon={FolderKanban}
      badge={`${projects.length} Active`}
      colSpan="col-span-12 lg:col-span-7"
      headerAccent="text-cyan-400"
      actions={
        <button
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      }
    >
      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        {/* Status Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs w-full sm:w-auto">
          {['all', 'in-progress', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium capitalize transition ${
                filter === tab 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Filter projects or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input text-xs w-full sm:w-48"
        />
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            No projects match the current filter.
          </div>
        ) : (
          filteredProjects.map(proj => {
            const isExpanded = expandedProjectId === proj.id;
            const isActive = activeProjectId === proj.id;
            const completedCount = proj.tasks?.filter(t => t.completed).length || 0;
            const totalTasks = proj.tasks?.length || 0;
            const percentTasks = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
            
            const targetMinutes = (proj.targetHours || 10) * 60;
            const loggedMinutes = proj.loggedMinutes || 0;
            const percentTime = Math.min(100, Math.round((loggedMinutes / targetMinutes) * 100));

            return (
              <div
                key={proj.id}
                className={`rounded-xl border transition-all ${
                  isActive 
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/40' 
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
                }`}
              >
                {/* Project Header Row */}
                <div 
                  onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start space-x-3">
                    <ChevronRight className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : ''}`} />
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h4 className="font-bold text-slate-100 text-sm hover:text-cyan-300 transition">
                          {proj.title}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950">
                            ACTIVE TIMER
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                          proj.status === 'completed' 
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' 
                            : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'
                        }`}>
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{proj.description}</p>
                      
                      {/* Tags */}
                      {proj.tags && proj.tags.length > 0 && (
                        <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-y-1">
                          {proj.tags.map((t, idx) => (
                            <span key={idx} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300">
                              <Tag className="w-2.5 h-2.5 text-slate-400" />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics & Actions */}
                  <div className="flex items-center justify-between md:justify-end space-x-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                    
                    {/* Time Progress */}
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-xs text-slate-300 font-mono">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{formatMinutesToHours(loggedMinutes)} / {proj.targetHours}h</span>
                      </div>
                      <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${percentTime}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Timer Start Button */}
                    <button
                      onClick={(e) => handleStartTimerOnProject(proj.id, e)}
                      className="p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                      title="Focus on this project"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Tasks Section */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/60 bg-slate-950/40 space-y-3">
                    
                    {/* Task Progress Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Tasks ({completedCount}/{totalTasks})</span>
                      <span className="text-cyan-400 font-mono">{percentTasks}% Done</span>
                    </div>

                    {/* Task Checkboxes */}
                    <div className="space-y-1.5">
                      {proj.tasks && proj.tasks.length > 0 ? (
                        proj.tasks.map(task => (
                          <div
                            key={task.id}
                            onClick={() => toggleTaskCompletion(proj.id, task.id)}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/60 cursor-pointer transition"
                          >
                            <div className="flex items-center space-x-2.5">
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              )}
                              <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                {task.title}
                              </span>
                            </div>

                            {task.estimatedMinutes && (
                              <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800/60">
                                ~{task.estimatedMinutes}m
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-500 italic">No tasks added yet.</div>
                      )}
                    </div>

                    {/* Quick Add Subtask Input */}
                    <form onSubmit={(e) => handleAddTask(proj.id, e)} className="flex space-x-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add subtask title..."
                        value={newTaskInput}
                        onChange={(e) => setNewTaskInput(e.target.value)}
                        className="glass-input text-xs flex-1"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                      >
                        Add Task
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </TileWrapper>
  );
}
