import React from 'react';
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
  Target
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
    setSettings
  } = useAppState();

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Calculate total seconds for ring percentage
  const totalModeSeconds = timerMode === 'pomodoro' ? 25 * 60 
    : timerMode === 'shortBreak' ? 5 * 60 
    : timerMode === 'longBreak' ? 15 * 60 
    : 3600;

  const progressPercent = timerMode === 'stopwatch' 
    ? (timerSeconds % 3600) / 3600 
    : (totalModeSeconds - timerSeconds) / totalModeSeconds;

  const strokeDashoffset = 283 * (1 - progressPercent);

  return (
    <TileWrapper
      title="Focus Timer & Pomodoro"
      icon={Timer}
      badge={isRunning ? 'RUNNING' : 'PAUSED'}
      colSpan="col-span-12"
      headerAccent="text-indigo-400"
      actions={
        <button
          onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
          className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-cyan-400 transition"
          title={settings.soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
        >
          {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      }
    >
      <div className="flex flex-col items-center justify-between h-full space-y-5">
        
        {/* Active Project Dropdown */}
        <div className="w-full flex items-center space-x-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
          <Target className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Focus Target Project
            </label>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-100 outline-none w-full cursor-pointer truncate"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.title} ({formatMinutesToHours(p.loggedMinutes || 0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs w-full justify-around">
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
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  isSelected 
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dial Display Ring */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-52 h-52 transform -rotate-90">
            {/* Outer Track Ring */}
            <circle
              cx="104"
              cy="104"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-800/80"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="104"
              cy="104"
              r="45"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Time Digital Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight glow-cyan">
              {formatSecondsToTimer(timerSeconds)}
            </span>
            <span className="text-[11px] text-cyan-400/80 font-medium uppercase tracking-widest mt-1">
              {timerMode}
            </span>
          </div>
        </div>

        {/* Primary Control Buttons */}
        <div className="flex items-center space-x-3 w-full">
          {isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-amber-500/20"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={startTimer}
              className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-cyan-500/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Focus Session</span>
            </button>
          )}

          <button
            onClick={() => resetTimer(timerMode)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>
    </TileWrapper>
  );
}
