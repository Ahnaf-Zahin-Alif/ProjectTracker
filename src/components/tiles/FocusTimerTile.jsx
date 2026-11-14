import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Coffee, 
  Flame, 
  Volume2, 
  VolumeX,
  Target,
  CheckSquare,
  Square,
  Plus,
  Clock,
  Sparkles,
  FolderKanban
} from 'lucide-react';
import { formatSecondsToTimer, formatMinutesToHours } from '../../utils/dateUtils';

export function FocusTimerTile() {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId,
    timerMode,
    timerSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    settings,
    setSettings,
    toggleTaskCompletion,
    addTaskToProject,
    setIsNewProjectModalOpen
  } = useAppState();

  const [newTaskInput, setNewTaskInput] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || null;

  // Calculate total seconds for ring percentage
  const totalModeSeconds = timerMode === 'pomodoro' ? 25 * 60 
    : timerMode === 'shortBreak' ? 5 * 60 
    : timerMode === 'longBreak' ? 15 * 60 
    : 3600;

  const progressPercent = timerMode === 'stopwatch' 
    ? (timerSeconds % 3600) / 3600 
    : (totalModeSeconds - timerSeconds) / totalModeSeconds;

  const circumference = 2 * Math.PI * 52; // ~326.7
  const strokeDashoffset = circumference * (1 - Math.min(1, Math.max(0, progressPercent)));

  // Active Project Task Stats
  const tasks = activeProject?.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const percentComplete = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const handleQuickAddTask = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !activeProject) return;
    addTaskToProject(activeProject.id, newTaskInput.trim(), 30);
    setNewTaskInput('');
  };

  return (
    <TileWrapper
      title="Focus Studio & Active Workspace"
      icon={Timer}
      badge={isRunning ? 'SESSION RUNNING' : 'PAUSED'}
      colSpan="col-span-12 lg:col-span-7"
      headerAccent="text-cyan-400"
      actions={
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
          className="p-1 rounded-md bg-[#111827] text-slate-400 hover:text-cyan-400 transition"
          title={settings.soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
          aria-label={settings.soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
        >
          {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </motion.button>
      }
    >
      <div className="flex flex-col space-y-4">
        
        {/* Project Target Bar with Concentric Inset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#111827] border border-white/[0.08]">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex-shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <label htmlFor="active-project-select" className="block text-[10px] text-slate-400 uppercase tracking-wider font-mono font-semibold">
                Focus Target Project
              </label>
              {projects.length > 0 ? (
                <select
                  id="active-project-select"
                  value={activeProjectId || ''}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-100 outline-none w-full cursor-pointer truncate border-none !p-0"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#0b101b] text-slate-200">
                      {p.title} ({formatMinutesToHours(p.loggedMinutes || 0)} logged)
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-400">No project selected</span>
              )}
            </div>
          </div>

          {activeProject && (
            <div className="flex items-center space-x-3 text-right border-t sm:border-t-0 sm:border-l border-white/[0.08] pt-2 sm:pt-0 sm:pl-3">
              <div>
                <div className="text-[10px] font-mono text-slate-400">LOGGED TIME</div>
                <div className="text-xs font-mono font-bold text-cyan-300 tabular-nums">
                  {formatMinutesToHours(activeProject.loggedMinutes || 0)} / {activeProject.targetHours || 10}h
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dual-Col Studio Layout: Left Timer, Right Task Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column (5 cols): Pomodoro Radial Dial & Controls */}
          <div className="md:col-span-5 flex flex-col items-center justify-between p-4 rounded-xl bg-[#090d16] border border-white/[0.06] space-y-4">
            
            {/* Mode Pills */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              {[
                { id: 'pomodoro', label: '25m Focus', icon: Timer },
                { id: 'shortBreak', label: '5m Break', icon: Coffee },
                { id: 'longBreak', label: '15m Rest', icon: Flame },
                { id: 'stopwatch', label: 'Stopwatch', icon: Target }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = timerMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => resetTimer(m.id)}
                    className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                        : 'bg-[#111827]/60 text-slate-400 hover:text-slate-200 hover:bg-[#162033]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Circular Concentric Progress Ring */}
            <div className="relative flex items-center justify-center my-1">
              <svg className="w-44 h-44 transform -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="5"
                  fill="transparent"
                  className="text-white/[0.05]"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="52"
                  stroke="url(#studioTimerGradient)"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-linear"
                />
                <defs>
                  <linearGradient id="studioTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="60%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center select-none">
                <span className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight tabular-nums">
                  {formatSecondsToTimer(timerSeconds)}
                </span>
                <span className="text-[10px] text-cyan-400/90 font-mono font-semibold uppercase tracking-wider mt-0.5">
                  {timerMode}
                </span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center space-x-2 w-full pt-1">
              {isRunning ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={pauseTimer}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Focus</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={startTimer}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Focus Session</span>
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => resetTimer(timerMode)}
                className="p-2.5 rounded-xl bg-[#111827] hover:bg-[#162033] border border-white/[0.08] text-slate-400 hover:text-white transition cursor-pointer"
                title="Reset Timer"
                aria-label="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Right Column (7 cols): Active Project Task Checklist */}
          <div className="md:col-span-7 flex flex-col justify-between p-4 rounded-xl bg-[#090d16] border border-white/[0.06] space-y-3">
            
            {activeProject ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">Active Task Checklist</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {completedCount}/{totalTasks} Done
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
                    {percentComplete}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full"
                  />
                </div>

                {/* Scrollable Tasks */}
                <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                  {tasks.length > 0 ? (
                    tasks.map(task => (
                      <motion.div 
                        key={task.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleTaskCompletion(activeProject.id, task.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                          task.completed 
                            ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-400' 
                            : 'bg-[#111827]/80 hover:bg-[#162033] border-white/[0.06] text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400 flex-shrink-0" />
                          )}
                          <span className={`text-xs truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </span>
                        </div>
                        {task.estimatedMinutes && (
                          <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-[#0b101b] border border-white/[0.05] flex-shrink-0 tabular-nums">
                            ~{task.estimatedMinutes}m
                          </span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      No subtasks listed yet. Add one below!
                    </div>
                  )}
                </div>

                {/* Inline Quick Add Task Form */}
                <form onSubmit={handleQuickAddTask} className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add immediate subtask..."
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-[#111827] text-slate-100 placeholder-slate-500 border border-white/[0.08]"
                  />
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={!newTaskInput.trim()}
                    className="px-3 py-1.5 bg-[#162033] hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Add
                  </motion.button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-3">
                <FolderKanban className="w-8 h-8 text-slate-600" />
                <p className="text-xs text-slate-400">No project in workspace yet.</p>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Project</span>
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </TileWrapper>
  );
}
