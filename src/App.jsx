import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Zap, Search, Video, Key, Download, Upload, Plus, Flame, Clock, 
  CheckCircle2, Sparkles, Maximize2, Minimize2, ChevronDown, ChevronUp, 
  FolderKanban, Play, CheckSquare, Square, Trash2, ExternalLink, Tag, 
  ChevronRight, Pause, RotateCcw, Timer, Coffee, Volume2, VolumeX, 
  Target, Info, Bot, Globe, PlusCircle, Loader2, BarChart3, TrendingUp, 
  Award, PieChart, FileText, Save, X, ArrowRight, Instagram, Facebook, 
  Youtube, ShieldCheck, LayoutDashboard, Kanban, FilePlus, Grid 
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { KanbanBoardPage } from './components/pages/KanbanBoardPage';
import { ProjectWorkspacesPage } from './components/pages/ProjectWorkspacesPage';
import { BlankPage } from './components/pages/BlankPage';
import { AppStateProvider, useAppState } from './context/AppStateContext';

/* ==========================================================================
   1. DATE & TIME UTILITIES
   ========================================================================== */
export function formatDateKey(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return formatDateKey(new Date());
}

export function formatMinutesToHours(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

export function formatSecondsToTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function generate365DayHeatmapGrid() {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = 52 * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  let currentDate = new Date(startDate);
  let currentWeek = [];
  let weekIndex = 0;

  for (let i = 0; i < totalDays; i++) {
    const dateKey = formatDateKey(currentDate);
    const dayOfWeek = currentDate.getDay();
    const isToday = dateKey === formatDateKey(today);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });

    currentWeek.push({
      dateKey,
      dateObj: new Date(currentDate),
      dayOfWeek,
      isToday,
      monthName,
      dayOfMonth: currentDate.getDate()
    });

    if (currentWeek.length === 7) {
      weeks.push({ weekIndex, days: currentWeek });
      currentWeek = [];
      weekIndex++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push({ weekIndex, days: currentWeek });
  }

  return weeks;
}

export function calculateActiveStreak(heatmapData) {
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  let todayKey = formatDateKey(today);
  if (!heatmapData[todayKey] || heatmapData[todayKey].minutes === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    const entry = heatmapData[key];
    if (entry && entry.minutes > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/* ==========================================================================
   2. INITIAL SEED DATA
   ========================================================================== */
export const INITIAL_PROJECTS = [];

export const INITIAL_NOTES = `# Quick Scratchpad
`;

export function generateInitialHeatmapData() {
  const heatmap = {};
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    heatmap[key] = { minutes: 0, tasksCompleted: 0, sessionsCount: 0 };
  }

  return heatmap;
}

/* ==========================================================================
   3. STORAGE & AUDIO SERVICES
   ========================================================================== */
const KEYS = {
  PROJECTS: 'pt_projects_v3',
  HEATMAP: 'pt_heatmap_v3',
  TIMER: 'pt_timer_v3',
  SETTINGS: 'pt_settings_v3',
  NOTES: 'pt_notes_v3'
};

try {
  localStorage.removeItem('pt_projects_v1');
  localStorage.removeItem('pt_projects_v2');
  localStorage.removeItem('pt_heatmap_v1');
  localStorage.removeItem('pt_heatmap_v2');
} catch (e) {}

export const storageService = {
  getProjects() {
    try {
      const data = localStorage.getItem(KEYS.PROJECTS);
      if (!data) {
        localStorage.setItem(KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
        return INITIAL_PROJECTS;
      }
      return JSON.parse(data);
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  },
  saveProjects(projects) {
    try { localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects)); } catch (e) {}
  },
  getHeatmap() {
    try {
      const data = localStorage.getItem(KEYS.HEATMAP);
      if (!data) {
        const seedHeatmap = generateInitialHeatmapData();
        localStorage.setItem(KEYS.HEATMAP, JSON.stringify(seedHeatmap));
        return seedHeatmap;
      }
      return JSON.parse(data);
    } catch (e) {
      return generateInitialHeatmapData();
    }
  },
  saveHeatmap(heatmap) {
    try { localStorage.setItem(KEYS.HEATMAP, JSON.stringify(heatmap)); } catch (e) {}
  },
  logWorkSession(minutesLogged, projectId = null) {
    const heatmap = this.getHeatmap();
    const todayKey = getTodayDateKey();
    const currentEntry = heatmap[todayKey] || { minutes: 0, tasksCompleted: 0, sessionsCount: 0 };

    const updatedEntry = {
      ...currentEntry,
      minutes: currentEntry.minutes + minutesLogged,
      sessionsCount: (currentEntry.sessionsCount || 0) + 1
    };

    heatmap[todayKey] = updatedEntry;
    this.saveHeatmap(heatmap);

    if (projectId) {
      const projects = this.getProjects();
      const projectIndex = projects.findIndex(p => p.id === projectId);
      if (projectIndex !== -1) {
        projects[projectIndex].loggedMinutes = (projects[projectIndex].loggedMinutes || 0) + minutesLogged;
        projects[projectIndex].updatedAt = new Date().toISOString();
        this.saveProjects(projects);
      }
    }
    return heatmap;
  },
  getSettings() {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : { apiKey: '', soundEnabled: true, theme: 'dark', defaultPomodoroTime: 25 };
    } catch (e) {
      return { apiKey: '', soundEnabled: true, theme: 'dark', defaultPomodoroTime: 25 };
    }
  },
  saveSettings(settings) {
    try { localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)); } catch (e) {}
  },
  getNotes() {
    try { return localStorage.getItem(KEYS.NOTES) || INITIAL_NOTES; } catch (e) { return INITIAL_NOTES; }
  },
  saveNotes(notes) {
    try { localStorage.setItem(KEYS.NOTES, notes); } catch (e) {}
  },
  exportAllData() {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      heatmap: this.getHeatmap(),
      settings: this.getSettings(),
      notes: this.getNotes()
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `antigravity-tracker-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.projects) this.saveProjects(parsed.projects);
      if (parsed.heatmap) this.saveHeatmap(parsed.heatmap);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.notes) this.saveNotes(parsed.notes);
      return true;
    } catch (e) {
      return false;
    }
  }
};

let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export const audioService = {
  playTimerStart() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  },
  playTimerComplete() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const frequencies = [523.25, 659.25, 783.99, 1046.50];
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.01, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.8);
      });
    } catch (e) {}
  },
  playTaskComplete() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }
};

/* ==========================================================================
   4. GENAI SDK INTEGRATION
   ========================================================================== */
export async function generateProjectBreakdown({ promptText, apiKey, sourceUrl = null }) {
  if (apiKey && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are Antigravity, an elite software architect AI agent (antigravity-preview-05-2026). Always output pure valid JSON adhering to the specified schema with milestones and actionable subtasks with time estimates.`;
      let fullPrompt = `Analyze the following project idea or video link and break it down into milestones, step-by-step tasks, and time estimates:\n\nProject Prompt: ${promptText}`;
      if (sourceUrl) fullPrompt += `\n\nReference URL / Reel Link: ${sourceUrl}`;

      const response = await ai.models.generateContent({
        model: 'antigravity-preview-05-2026',
        contents: fullPrompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }, { urlContext: {} }],
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        return formatGenAiResponse(parsed, sourceUrl);
      }
    } catch (err) {
      console.warn('GenAI API fallback triggered:', err);
    }
  }

  return generateFallbackBreakdown(promptText, sourceUrl);
}

function formatGenAiResponse(rawJson, sourceUrl) {
  const allTasks = [];
  let taskIdCounter = 1;
  if (Array.isArray(rawJson.milestones)) {
    rawJson.milestones.forEach((m) => {
      if (Array.isArray(m.tasks)) {
        m.tasks.forEach((t) => {
          allTasks.push({
            id: `task_gen_${Date.now()}_${taskIdCounter++}`,
            title: `[${m.milestoneTitle || 'Milestone'}] ${t.title || t.description}`,
            completed: false,
            estimatedMinutes: t.estimatedMinutes || 45
          });
        });
      }
    });
  }

  return {
    id: `proj_ai_${Date.now()}`,
    title: rawJson.title || 'AI Generated Research Project',
    description: rawJson.description || 'Generated task breakdown from web search & GitHub research.',
    category: rawJson.category || 'Web App',
    status: 'in-progress',
    tags: Array.isArray(rawJson.tags) ? rawJson.tags : ['React', 'AI', 'Node'],
    targetHours: rawJson.targetHours || 12,
    loggedMinutes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceUrl: sourceUrl || null,
    tasks: allTasks.length > 0 ? allTasks : [
      { id: `task_1`, title: 'Setup project architecture and repository', completed: false, estimatedMinutes: 30 },
      { id: `task_2`, title: 'Implement core application features', completed: false, estimatedMinutes: 120 },
      { id: `task_3`, title: 'Conduct automated testing & deploy', completed: false, estimatedMinutes: 60 }
    ]
  };
}

function generateFallbackBreakdown(promptText, sourceUrl) {
  const cleanPrompt = promptText.trim();
  const timestamp = Date.now();
  let category = 'Web Dev';
  let tags = ['React', 'Node.js', 'Tailwind', 'AI'];
  let targetHours = 10;

  if (cleanPrompt.toLowerCase().includes('reel') || cleanPrompt.toLowerCase().includes('instagram') || sourceUrl) {
    category = 'Social Media / Reel Project';
    tags = ['Social API', 'Media Processing', 'React', 'Vite'];
    targetHours = 12;
  } else if (cleanPrompt.toLowerCase().includes('python') || cleanPrompt.toLowerCase().includes('data')) {
    category = 'Data & AI';
    tags = ['Python', 'FastAPI', 'Pandas', 'Gemini'];
    targetHours = 15;
  }

  return {
    id: `proj_ai_${timestamp}`,
    title: cleanPrompt.length > 50 ? cleanPrompt.substring(0, 50) + '...' : cleanPrompt,
    description: `Grounding search breakdown (antigravity-preview-05-2026): Researched web & GitHub trends for "${cleanPrompt}".`,
    category,
    status: 'in-progress',
    tags,
    targetHours,
    loggedMinutes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceUrl: sourceUrl || null,
    tasks: [
      { id: `task_fb_${timestamp}_1`, title: '[Architecture Phase] Setup project workspace, dependencies & environment configs', completed: false, estimatedMinutes: 45 },
      { id: `task_fb_${timestamp}_2`, title: '[Core Engine] Build state management & primary user interface components', completed: false, estimatedMinutes: 120 },
      { id: `task_fb_${timestamp}_3`, title: '[API Integration] Connect external API endpoints and data persistence layer', completed: false, estimatedMinutes: 90 },
      { id: `task_fb_${timestamp}_4`, title: '[Testing & Polish] Implement unit tests, keyboard shortcuts & responsive styling', completed: false, estimatedMinutes: 60 }
    ]
  };
}

/* ==========================================================================
   5. REACT CONTEXT & STATE PROVIDER
   (Imported from ./context/AppStateContext.jsx)
   ========================================================================== */

/* ==========================================================================
   6. UI COMPONENTS & TILES
   ========================================================================== */
function Header() {
  const { setIsCommandPaletteOpen, setIsNewProjectModalOpen, currentView, setCurrentView } = useAppState();

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Branding & View Tabs */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-600 shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-200 to-violet-400 bg-clip-text text-transparent">ANTIGRAVITY</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">v2026.5</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Project Manager</p>
            </div>
          </div>

          {/* Navigation Page Switcher Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('page1')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'page1' || currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Page 1 (Dashboard)</span>
            </button>

            <button
              onClick={() => setCurrentView('page2')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                currentView === 'page2'
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Page 2 (Blank Canvas)</span>
            </button>
          </nav>
        </div>

        {/* Right: Search & New Project Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium transition"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950 border border-slate-700 rounded text-slate-400">Ctrl+K</kbd>
          </button>

          <button
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function TileWrapper({ title, icon: Icon, badge, colSpan = 'col-span-12 lg:col-span-6', actions, children, headerAccent = 'text-cyan-400' }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  if (isMaximized) {
    return (
      <div className="fixed inset-4 z-50 flex flex-col glass-panel bg-slate-950/95 border-cyan-500/50 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={`w-6 h-6 ${headerAccent}`} />}
            <h2 className="text-xl font-bold text-slate-100">{title}</h2>
            {badge && <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">{badge}</span>}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            <button onClick={() => setIsMaximized(false)} className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"><Minimize2 className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2">{children}</div>
      </div>
    );
  }

  return (
    <div className={`${colSpan} glass-panel flex flex-col overflow-hidden`}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-2.5">
          {Icon && <Icon className={`w-4 h-4 ${headerAccent}`} />}
          <h3 className="font-bold text-sm text-slate-200">{title}</h3>
          {badge && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-cyan-300 border border-slate-700">{badge}</span>}
        </div>
        <div className="flex items-center space-x-1.5">
          {actions}
          <button onClick={() => setIsMaximized(true)} className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-cyan-400"><Maximize2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => setIsCollapsed(prev => !prev)} className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-slate-200">
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {!isCollapsed && <div className="p-5 flex-1 overflow-y-auto max-h-[500px]">{children}</div>}
    </div>
  );
}

function ProjectListTile() {
  const { projects, activeProjectId, setActiveProjectId, toggleTaskCompletion, addTaskToProject, deleteProject, setIsNewProjectModalOpen, startTimer } = useAppState();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState(projects[0]?.id || null);
  const [newTaskInput, setNewTaskInput] = useState('');

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' ? true : p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleAddTask = (projectId, e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    addTaskToProject(projectId, newTaskInput.trim());
    setNewTaskInput('');
  };

  return (
    <TileWrapper title="Project Tracker" icon={FolderKanban} badge={`${projects.length} Active`} colSpan="col-span-12 lg:col-span-7" headerAccent="text-cyan-400" actions={
      <button onClick={() => setIsNewProjectModalOpen(true)} className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"><Plus className="w-3.5 h-3.5" /><span>Add</span></button>
    }>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs w-full sm:w-auto">
          {['all', 'in-progress', 'completed'].map(tab => (
            <button key={tab} onClick={() => setFilter(tab)} className={`flex-1 sm:flex-none px-3 py-1 rounded-md font-medium capitalize ${filter === tab ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400'}`}>
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Filter projects or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="glass-input text-xs w-full sm:w-48" />
      </div>

      <div className="space-y-3">
        {filteredProjects.map(proj => {
          const isExpanded = expandedProjectId === proj.id;
          const isActive = activeProjectId === proj.id;
          const completedCount = proj.tasks?.filter(t => t.completed).length || 0;
          const totalTasks = proj.tasks?.length || 0;
          const percentTasks = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
          const loggedMinutes = proj.loggedMinutes || 0;
          const percentTime = Math.min(100, Math.round((loggedMinutes / ((proj.targetHours || 10) * 60)) * 100));

          return (
            <div key={proj.id} className={`rounded-xl border ${isActive ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/40' : 'bg-slate-900/40 border-slate-800/80'}`}>
              <div onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)} className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <ChevronRight className={`w-4 h-4 text-slate-400 mt-1 transition-transform ${isExpanded ? 'rotate-90 text-cyan-400' : ''}`} />
                  {proj.imageUrl && (
                    <img src={proj.imageUrl} alt={proj.title} className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-bold text-slate-100 text-sm">{proj.title}</h4>
                      {isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950">ACTIVE TIMER</span>}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${proj.status === 'completed' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-indigo-950/60 text-indigo-300 border-indigo-800'}`}>{proj.status}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                    {proj.tags && (
                      <div className="flex items-center space-x-1.5 mt-2 flex-wrap gap-y-1">
                        {proj.tags.map((t, idx) => (
                          <span key={idx} className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300"><Tag className="w-2.5 h-2.5 text-slate-400" /><span>{t}</span></span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-xs text-slate-300 font-mono"><Clock className="w-3 h-3 text-cyan-400" /><span>{formatMinutesToHours(loggedMinutes)} / {proj.targetHours}h</span></div>
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden"><div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full" style={{ width: `${percentTime}%` }} /></div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setActiveProjectId(proj.id); startTimer(); }} className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"><Play className="w-3.5 h-3.5 fill-current" /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }} className="p-1.5 text-slate-500 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-950/40 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium"><span>Tasks ({completedCount}/{totalTasks})</span><span className="text-cyan-400 font-mono">{percentTasks}% Done</span></div>
                  <div className="space-y-1.5">
                    {proj.tasks?.map(task => (
                      <div key={task.id} onClick={() => toggleTaskCompletion(proj.id, task.id)} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer">
                        <div className="flex items-center space-x-2.5">
                          {task.completed ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                          <span className={`text-xs ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                        </div>
                        {task.estimatedMinutes && <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">~{task.estimatedMinutes}m</span>}
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => handleAddTask(proj.id, e)} className="flex space-x-2 pt-1">
                    <input type="text" placeholder="Add subtask title..." value={newTaskInput} onChange={(e) => setNewTaskInput(e.target.value)} className="glass-input text-xs flex-1" />
                    <button type="submit" className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700">Add Task</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TileWrapper>
  );
}

function FocusTimerTile() {
  const { projects, activeProjectId, setActiveProjectId, timerMode, timerSeconds, isRunning, startTimer, pauseTimer, resetTimer, settings, setSettings } = useAppState();
  const totalModeSeconds = timerMode === 'pomodoro' ? 25 * 60 : timerMode === 'shortBreak' ? 5 * 60 : timerMode === 'longBreak' ? 15 * 60 : 3600;
  const progressPercent = timerMode === 'stopwatch' ? (timerSeconds % 3600) / 3600 : (totalModeSeconds - timerSeconds) / totalModeSeconds;
  const strokeDashoffset = 283 * (1 - progressPercent);

  return (
    <TileWrapper title="Focus Timer & Pomodoro" icon={Timer} badge={isRunning ? 'RUNNING' : 'PAUSED'} colSpan="col-span-12 lg:col-span-5" headerAccent="text-indigo-400" actions={
      <button onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })} className="p-1 rounded bg-slate-900/60 text-slate-400 hover:text-cyan-400">
        {settings.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
      </button>
    }>
      <div className="flex flex-col items-center justify-between h-full space-y-5">
        <div className="w-full flex items-center space-x-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <Target className="w-4 h-4 text-cyan-400" />
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Focus Target Project</label>
            <select value={activeProjectId || ''} onChange={(e) => setActiveProjectId(e.target.value)} className="bg-transparent text-xs font-bold text-slate-100 outline-none w-full cursor-pointer">
              {projects.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title} ({formatMinutesToHours(p.loggedMinutes || 0)})</option>)}
            </select>
          </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-full justify-around">
          {[{ id: 'pomodoro', label: '25m Focus', icon: Timer }, { id: 'shortBreak', label: '5m Break', icon: Coffee }, { id: 'longBreak', label: '15m Rest', icon: Flame }, { id: 'stopwatch', label: 'Stopwatch', icon: Target }].map(m => {
            const Icon = m.icon;
            return (
              <button key={m.id} onClick={() => resetTimer(m.id)} className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium ${timerMode === m.id ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}>
                <Icon className="w-3 h-3" /><span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative flex items-center justify-center my-2">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle cx="104" cy="104" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800/80" />
            <circle cx="104" cy="104" r="45" stroke="url(#timerGradient)" strokeWidth="6" strokeDasharray="283" strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-linear" />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold font-mono text-slate-100 tracking-tight glow-cyan">{formatSecondsToTimer(timerSeconds)}</span>
            <span className="text-[11px] text-cyan-400/80 font-medium uppercase tracking-widest mt-1">{timerMode}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full">
          {isRunning ? (
            <button onClick={pauseTimer} className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20">
              <Pause className="w-4 h-4 fill-current" /><span>Pause Focus</span>
            </button>
          ) : (
            <button onClick={startTimer} className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25">
              <Play className="w-4 h-4 fill-current" /><span>Start Focus Session</span>
            </button>
          )}
          <button onClick={() => resetTimer(timerMode)} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>
    </TileWrapper>
  );
}

function ContributionHeatmapTile() {
  const { heatmap } = useAppState();
  const [hoveredDay, setHoveredDay] = useState(null);
  const weeks = useMemo(() => generate365DayHeatmapGrid(), []);
  const streak = calculateActiveStreak(heatmap);

  const getIntensityLevel = (minutes) => {
    if (!minutes || minutes === 0) return 0;
    if (minutes <= 45) return 1;
    if (minutes <= 120) return 2;
    if (minutes <= 240) return 3;
    return 4;
  };

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = '';
    weeks.forEach((week, idx) => {
      const firstDayOfMonth = week.days.find(d => d.monthName !== lastMonth);
      if (firstDayOfMonth) {
        labels.push({ monthName: firstDayOfMonth.monthName, weekIndex: idx });
        lastMonth = firstDayOfMonth.monthName;
      }
    });
    return labels;
  }, [weeks]);

  const totalMinutesAll = Object.values(heatmap).reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const totalDaysWorked = Object.values(heatmap).filter(curr => curr.minutes > 0).length;

  return (
    <TileWrapper title="Activity Contribution Grid" icon={Flame} badge={`${totalDaysWorked} Days Active`} colSpan="col-span-12 lg:col-span-12" headerAccent="text-emerald-400">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2"><Flame className="w-4 h-4 text-amber-400" /><span className="text-slate-400">Current Streak:</span><span className="font-bold text-amber-300 font-mono">{streak} Days</span></div>
            <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-cyan-400" /><span className="text-slate-400">Yearly Focused:</span><span className="font-bold text-cyan-300 font-mono">{formatMinutesToHours(totalMinutesAll)}</span></div>
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm heatmap-level-0"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-1"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-2"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-3"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-4"></div>
            <span>More</span>
          </div>
        </div>

        <div className="relative overflow-x-auto pb-2">
          <div className="inline-block min-w-full">
            <div className="flex space-x-1 text-[10px] text-slate-500 font-mono mb-1 pl-6">
              {weeks.map((week, idx) => {
                const monthMatch = monthLabels.find(m => m.weekIndex === idx);
                return <div key={idx} className="w-3.5 text-center">{monthMatch ? monthMatch.monthName : ''}</div>;
              })}
            </div>
            <div className="flex">
              <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2 h-28">
                <span>Mon</span><span>Wed</span><span>Fri</span>
              </div>
              <div className="flex space-x-1">
                {weeks.map((week) => (
                  <div key={week.weekIndex} className="flex flex-col space-y-1">
                    {week.days.map((day) => {
                      const dayEntry = heatmap[day.dateKey] || { minutes: 0, tasksCompleted: 0 };
                      const level = getIntensityLevel(dayEntry.minutes);
                      return (
                        <div key={day.dateKey} onMouseEnter={() => setHoveredDay({ ...day, ...dayEntry })} onMouseLeave={() => setHoveredDay(null)} className={`w-3.5 h-3.5 rounded-sm cursor-pointer ${day.isToday ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950' : ''} heatmap-level-${level} hover:scale-125`} />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 flex items-center justify-between px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          {hoveredDay ? (
            <div className="flex items-center space-x-4 text-slate-300"><span className="font-bold text-cyan-300 font-mono">{hoveredDay.dateKey}</span><span>{hoveredDay.minutes > 0 ? `${formatMinutesToHours(hoveredDay.minutes)} logged` : 'No activity'}</span></div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500 text-[11px]"><Info className="w-3.5 h-3.5 text-cyan-400" /><span>Hover over grid square to view daily activity breakdown</span></div>
          )}
        </div>
      </div>
    </TileWrapper>
  );
}

function AiResearchTile() {
  const { addProject, settings, setIsApiKeyModalOpen, showToast } = useAppState();
  const [promptText, setPromptText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const imageInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('⚠️ Please select a valid image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => setSelectedImage({ name: file.name, dataUrl: evt.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const effectivePrompt = promptText.trim() || (selectedImage ? 'Build and architect developer project from attached UI mockup screenshot' : sourceUrl.trim() ? `Analyze and architect project from reference link: ${sourceUrl}` : '');
    if (!effectivePrompt) return;

    setIsLoading(true);
    setLoadingStep('Initializing @google/genai SDK (antigravity-preview-05-2026)...');

    try {
      setTimeout(() => setLoadingStep(selectedImage ? 'Analyzing design mockup & google_search...' : 'Executing google_search & url_context tools...'), 1000);
      setTimeout(() => setLoadingStep('Structuring task breakdown JSON...'), 2200);

      const result = await generateProjectBreakdown({
        promptText: effectivePrompt,
        apiKey: settings.apiKey,
        sourceUrl: sourceUrl.trim() || null,
        imageDataUrl: selectedImage ? selectedImage.dataUrl : null
      });
      setGeneratedResult(result);
      showToast(`✨ Generated project plan: "${result.title}"`);
    } catch (err) {
      showToast('❌ Failed to generate AI project breakdown');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (evt) => {
            setSelectedImage({ name: file.name || `pasted-${Date.now()}.png`, dataUrl: evt.target.result });
            showToast('📋 Image pasted from clipboard!');
          };
          reader.readAsDataURL(file);
          break;
        }
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

  return (
    <TileWrapper title="GenAI Architecture & Breakdown" icon={Sparkles} badge="antigravity-preview-05-2026" colSpan="col-span-12 lg:col-span-6" headerAccent="text-violet-400" actions={
      !settings.apiKey && <button onClick={() => setIsApiKeyModalOpen(true)} className="flex items-center space-x-1 px-2 py-0.5 text-[11px] rounded bg-amber-500/10 text-amber-300 border border-amber-500/30"><Key className="w-3 h-3" /><span>Set Key</span></button>
    }>
      <div className="flex flex-col space-y-4" onPaste={handlePaste}>
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Project Idea or Prompt (Paste image with Ctrl+V)</label>
            <textarea rows={2} placeholder="e.g., Build a real-time web video clipper using WebAssembly... (Paste image via Ctrl+V)" value={promptText} onChange={(e) => setPromptText(e.target.value)} onPaste={handlePaste} className="glass-input text-xs w-full resize-none" disabled={isLoading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Reference Link / Reel URL (Optional)</span><Globe className="w-3 h-3 text-slate-400" />
            </label>
            <input type="url" placeholder="https://www.instagram.com/reel/... or GitHub URL" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="glass-input text-xs w-full bg-slate-900 text-slate-100 placeholder-slate-500 font-mono" disabled={isLoading} />
          </div>

          {/* Image Upload / Drop / Paste Zone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Attach Wireframe / Screenshot (Upload, Drag & Drop, or Paste Ctrl+V)</label>
            {selectedImage ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-cyan-500/50">
                <div className="flex items-center space-x-3 min-w-0">
                  <img src={selectedImage.dataUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                  <div className="min-w-0"><span className="block text-xs font-semibold text-slate-200 truncate">{selectedImage.name}</span><span className="block text-[10px] text-cyan-400">Attached for Gemini vision</span></div>
                </div>
                <button type="button" onClick={() => setSelectedImage(null)} className="p-1.5 text-slate-400 hover:text-rose-400"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => imageInputRef.current?.click()} className="w-full flex flex-col items-center justify-center space-y-1 py-3 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-dashed border-slate-700 text-slate-300 text-xs transition cursor-pointer">
                <div className="flex items-center space-x-2"><Upload className="w-4 h-4 text-cyan-400" /><span className="font-medium">Upload Image, Drag & Drop, or Paste (Ctrl+V)</span></div>
                <span className="text-[10px] text-slate-500">Supports PNG, JPG, WebP screenshots</span>
              </div>
            )}
            <input type="file" ref={imageInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <button type="submit" disabled={isLoading || (!promptText.trim() && !sourceUrl.trim() && !selectedImage)} className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/20 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>{loadingStep}</span></>) : (<><Sparkles className="w-4 h-4 text-cyan-200" /><span>Research & Generate Structured JSON Plan</span></>)}
          </button>
        </form>

        {generatedResult && (
          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/50 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3 min-w-0">
                {generatedResult.imageUrl && (
                  <img src={generatedResult.imageUrl} alt="Mockup" className="w-12 h-12 rounded-lg object-cover border border-slate-700 flex-shrink-0" />
                )}
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">{generatedResult.category}</span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{generatedResult.title}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{generatedResult.description}</p>
                </div>
              </div>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {generatedResult.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-1.5 rounded bg-slate-950 text-xs border border-slate-800">
                  <span className="text-slate-200 line-clamp-1">{task.title}</span>
                  <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-slate-900 ml-2">~{task.estimatedMinutes}m</span>
                </div>
              ))}
            </div>
            <button onClick={() => { addProject(generatedResult); setGeneratedResult(null); setPromptText(''); setSourceUrl(''); setSelectedImage(null); }} className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20">
              <PlusCircle className="w-4 h-4" /><span>Import Plan as Active Workspace Project</span>
            </button>
          </div>
        )}
      </div>
    </TileWrapper>
  );
}

function AnalyticsTile() {
  const { projects, heatmap } = useAppState();
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
  const totalMinutes = Object.values(heatmap).reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const activeDaysCount = Object.values(heatmap).filter(curr => curr.minutes > 0).length;

  const tagCounts = {};
  projects.forEach(p => p.tags?.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <TileWrapper title="Productivity & Tech Velocity" icon={BarChart3} badge={`${completionRate}% Completed`} colSpan="col-span-12 lg:col-span-6" headerAccent="text-cyan-400">
      <div className="flex flex-col space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col"><span className="text-[10px] text-slate-400 font-semibold uppercase">Projects</span><span className="text-xl font-bold text-slate-100 mt-1 font-mono">{totalProjects}</span></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col"><span className="text-[10px] text-slate-400 font-semibold uppercase">Done</span><span className="text-xl font-bold text-emerald-400 mt-1 font-mono">{completedProjects}</span></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col"><span className="text-[10px] text-slate-400 font-semibold uppercase">Total Focused</span><span className="text-xl font-bold text-cyan-400 mt-1 font-mono">{formatMinutesToHours(totalMinutes)}</span></div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col"><span className="text-[10px] text-slate-400 font-semibold uppercase">Active Days</span><span className="text-xl font-bold text-indigo-400 mt-1 font-mono">{activeDaysCount}</span></div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300"><div className="flex items-center space-x-1.5"><PieChart className="w-3.5 h-3.5 text-violet-400" /><span>Top Tech Stack Distribution</span></div></div>
          <div className="space-y-2">
            {sortedTags.map(([tag, count]) => {
              const tagPercent = Math.round((count / totalProjects) * 100);
              return (
                <div key={tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono"><span className="text-slate-300">{tag}</span><span className="text-slate-400 text-[11px]">{count} proj ({tagPercent}%)</span></div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden"><div className="bg-gradient-to-r from-cyan-500 to-violet-500 h-1.5 rounded-full" style={{ width: `${tagPercent}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TileWrapper>
  );
}

function BentoGrid() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="bento-container">
        <ProjectListTile />
        <FocusTimerTile />
        <ContributionHeatmapTile />
        <AiResearchTile />
        <AnalyticsTile />
      </div>
    </main>
  );
}

function CommandPaletteModal() {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, projects, setActiveProjectId, startTimer, setIsReelModalOpen, setIsApiKeyModalOpen, setIsNewProjectModalOpen, exportData } = useAppState();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const defaultCommands = [
    { id: 'cmd_new_proj', title: 'Create New Project', subtitle: 'Open project creation modal', icon: Plus, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); setIsNewProjectModalOpen(true); } },
    { id: 'cmd_reel', title: 'Open Reel Link Quick-Start', subtitle: 'Convert Instagram/FB Reel into execution plan', icon: Video, category: 'Actions', action: () => { setIsCommandPaletteOpen(false); setIsReelModalOpen(true); } },
    { id: 'cmd_api_key', title: 'Configure Gemini API Key', subtitle: 'Set up @google/genai SDK key for antigravity-preview-05-2026', icon: Key, category: 'Settings', action: () => { setIsCommandPaletteOpen(false); setIsApiKeyModalOpen(true); } },
    { id: 'cmd_timer_start', title: 'Start Focus Timer', subtitle: 'Begin session on active project', icon: Timer, category: 'Timer', action: () => { setIsCommandPaletteOpen(false); startTimer(); } },
    { id: 'cmd_export', title: 'Export Workspace Backup JSON', subtitle: 'Download complete state backup', icon: Download, category: 'Data', action: () => { setIsCommandPaletteOpen(false); exportData(); } }
  ];

  const projectCommands = projects.map(p => ({
    id: `proj_${p.id}`, title: `Focus on Project: ${p.title}`, subtitle: `${p.category || 'Project'} • ${p.tasks?.length || 0} subtasks`, icon: FolderKanban, category: 'Projects', action: () => { setIsCommandPaletteOpen(false); setActiveProjectId(p.id); startTimer(); }
  }));

  const allItems = [...defaultCommands, ...projectCommands].filter(item => {
    if (!query) return true;
    return item.title.toLowerCase().includes(query.toLowerCase()) || item.subtitle.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/80 backdrop-blur-md px-4" onClick={() => setIsCommandPaletteOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl glass-panel bg-slate-900 border-cyan-500/50 shadow-2xl overflow-hidden rounded-2xl">
        <div className="flex items-center px-4 py-3 border-b border-slate-800 space-x-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <input ref={inputRef} type="text" placeholder="Type a command or search project..." value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }} className="w-full bg-transparent text-slate-100 text-sm outline-none font-medium" />
          <button onClick={() => setIsCommandPaletteOpen(false)} className="text-slate-500 hover:text-white p-1"><X className="w-4 h-4" /></button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {allItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div key={item.id} onClick={item.action} onMouseEnter={() => setSelectedIndex(idx)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${isSelected ? 'bg-cyan-500/20 border border-cyan-500/40 text-slate-100' : 'text-slate-300 hover:bg-slate-800'}`}>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}><Icon className="w-4 h-4" /></div>
                  <div><div className="font-semibold text-xs">{item.title}</div><p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p></div>
                </div>
                {isSelected && <ArrowRight className="w-4 h-4 text-cyan-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReelQuickStartModal() {
  const { isReelModalOpen, setIsReelModalOpen, addProject, settings, showToast } = useAppState();
  const [reelUrl, setReelUrl] = useState('');
  const [extraNotes, setExtraNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isReelModalOpen) return null;

  const handleProcessReel = async (e) => {
    e.preventDefault();
    if (!reelUrl.trim()) return;
    setIsLoading(true);
    try {
      const promptText = `Convert social reel concept into developer project plan. URL: ${reelUrl}. ${extraNotes}`;
      const newProject = await generateProjectBreakdown({ promptText, apiKey: settings.apiKey, sourceUrl: reelUrl.trim() });
      addProject(newProject);
      setIsReelModalOpen(false);
      setReelUrl(''); setExtraNotes('');
      showToast(`🚀 Converted Reel into Project: "${newProject.title}"`);
    } catch (err) {
      showToast('❌ Failed to convert reel link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4" onClick={() => setIsReelModalOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg glass-panel bg-slate-900 border-purple-500/50 shadow-2xl rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white"><Video className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-base text-slate-100">Instagram / FB Reel Quick-Start</h3><p className="text-xs text-slate-400">Convert social coding reels into actionable project plans</p></div>
          </div>
          <button onClick={() => setIsReelModalOpen(false)} className="text-slate-500 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleProcessReel} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">Reel / Short Video Link</label><input type="url" required placeholder="https://www.instagram.com/reel/..." value={reelUrl} onChange={(e) => setReelUrl(e.target.value)} className="glass-input text-xs w-full" disabled={isLoading} /></div>
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">Optional Highlight Notes</label><textarea rows={2} placeholder="e.g. Built Spotify clone using Next.js and Tailwind..." value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} className="glass-input text-xs w-full resize-none" disabled={isLoading} /></div>
          <button type="submit" disabled={isLoading || !reelUrl.trim()} className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-lg shadow-purple-600/25 disabled:opacity-50">
            {isLoading ? (<><Loader2 className="w-4 h-4 animate-spin" /><span>Extracting Reel Specs with GenAI Agent...</span></>) : (<><Sparkles className="w-4 h-4" /><span>Turn Reel into Project Plan</span></>)}
          </button>
        </form>
      </div>
    </div>
  );
}

function ApiKeyConfigModal() {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen, settings, setSettings, showToast } = useAppState();
  const [apiKeyInput, setApiKeyInput] = useState(settings.apiKey || '');

  if (!isApiKeyModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSettings({ ...settings, apiKey: apiKeyInput.trim() });
    setIsApiKeyModalOpen(false);
    showToast('🔑 Gemini API Key configured in localStorage');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4" onClick={() => setIsApiKeyModalOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md glass-panel bg-slate-900 border-emerald-500/50 shadow-2xl rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Key className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-base text-slate-100">Gemini API Key Settings</h3><p className="text-xs text-slate-400">@google/genai SDK • antigravity-preview-05-2026</p></div>
          </div>
          <button onClick={() => setIsApiKeyModalOpen(false)} className="text-slate-500 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key</label><input type="password" placeholder="AIzaSy..." value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className="glass-input text-xs w-full font-mono" /></div>
          <div className="flex items-center space-x-2 pt-2">
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20">Save API Key</button>
            <button type="button" onClick={() => { setApiKeyInput(''); setSettings({ ...settings, apiKey: '' }); }} className="px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">Clear</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewProjectModal() {
  const { isNewProjectModalOpen, setIsNewProjectModalOpen, addProject } = useAppState();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Dev');
  const [targetHours, setTargetHours] = useState(10);
  const [tagsInput, setTagsInput] = useState('React, Tailwind');
  const [initialTaskInput, setInitialTaskInput] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const fileInputRef = useRef(null);

  if (!isNewProjectModalOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setImageUrl(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const initialTasks = initialTaskInput.split('\n').map(t => t.trim()).filter(Boolean).map((t, idx) => ({ id: `task_init_${Date.now()}_${idx}`, title: t, completed: false, estimatedMinutes: 30 }));

    addProject({
      id: `proj_manual_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'in-progress',
      tags,
      targetHours: Number(targetHours) || 10,
      loggedMinutes: 0,
      imageUrl: imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: initialTasks.length > 0 ? initialTasks : [{ id: `task_default_${Date.now()}`, title: 'Setup project workspace and specs', completed: false, estimatedMinutes: 30 }]
    });

    setIsNewProjectModalOpen(false);
    setTitle(''); setDescription(''); setTagsInput('React, Tailwind'); setInitialTaskInput(''); setImageUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4" onClick={() => setIsNewProjectModalOpen(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg glass-panel bg-slate-900 border-cyan-500/50 shadow-2xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"><FolderKanban className="w-5 h-5" /></div>
            <div><h3 className="font-bold text-base text-slate-100">Create New Project</h3><p className="text-xs text-slate-400">Add custom workspace project</p></div>
          </div>
          <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-500 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div><label className="block font-semibold text-slate-300 mb-1">Project Title</label><input type="text" required placeholder="e.g. Fullstack Realtime Chat App" value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input w-full text-xs" /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Description</label><textarea rows={2} placeholder="Brief overview..." value={description} onChange={(e) => setDescription(e.target.value)} className="glass-input w-full text-xs resize-none" /></div>

          {/* Image Upload Option */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Project Screenshot / Cover Image (Optional)</label>
            {imageUrl ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <img src={imageUrl} alt="Cover" className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                  <span className="text-xs text-cyan-400">Image attached</span>
                </div>
                <button type="button" onClick={() => setImageUrl(null)} className="p-1 text-slate-400 hover:text-rose-400"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-dashed border-slate-700 text-slate-300 text-xs transition">
                <Upload className="w-4 h-4 text-cyan-400" /><span>Upload Cover Image / Wireframe</span>
              </button>
            )}
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block font-semibold text-slate-300 mb-1">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="glass-input w-full text-xs"><option value="Web Dev">Web Dev</option><option value="AI Systems">AI Systems</option><option value="Mobile Dev">Mobile Dev</option><option value="Developer Tools">Developer Tools</option></select></div>
            <div><label className="block font-semibold text-slate-300 mb-1">Target Hours</label><input type="number" min={1} max={500} value={targetHours} onChange={(e) => setTargetHours(e.target.value)} className="glass-input w-full text-xs font-mono" /></div>
          </div>
          <div><label className="block font-semibold text-slate-300 mb-1">Tags (Comma-separated)</label><input type="text" placeholder="React, TypeScript, Tailwind" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="glass-input w-full text-xs" /></div>
          <div><label className="block font-semibold text-slate-300 mb-1">Initial Subtasks (One per line)</label><textarea rows={3} placeholder="Setup repo&#10;Build UI" value={initialTaskInput} onChange={(e) => setInitialTaskInput(e.target.value)} className="glass-input w-full text-xs font-mono" /></div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20">Create Project</button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   7. MAIN APP APPLICATION ENTRYPOINT
   ========================================================================== */
function AppContent() {
  const { toastMessage, currentView } = useAppState();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Header />
      {currentView === 'page2' ? (
        <BlankPage />
      ) : currentView === 'workspaces' ? (
        <ProjectWorkspacesPage />
      ) : currentView === 'kanban' ? (
        <KanbanBoardPage />
      ) : (
        <BentoGrid />
      )}

      <footer className="mt-auto py-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">Antigravity Tiling Workspace</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">@google/genai SDK (antigravity-preview-05-2026)</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-slate-400">Ctrl+K</kbd> to open Command Palette
          </div>
        </div>
      </footer>

      <CommandPaletteModal />
      <ReelQuickStartModal />
      <ApiKeyConfigModal />
      <NewProjectModal />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/60 shadow-2xl text-xs font-semibold text-cyan-200">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

// Mount to DOM
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
