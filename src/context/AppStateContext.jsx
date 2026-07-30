import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  // 1. Projects State
  const [projects, setProjects] = useState(() => storageService.getProjects());

  // 2. Heatmap State
  const [heatmap, setHeatmap] = useState(() => storageService.getHeatmap());

  // 3. Settings State
  const [settings, setSettings] = useState(() => storageService.getSettings());

  // 4. Notes State
  const [notes, setNotes] = useState(() => storageService.getNotes());

  // 5. Active Focus Timer State
  const [activeProjectId, setActiveProjectId] = useState(() => projects[0]?.id || null);
  const [timerMode, setTimerMode] = useState('pomodoro'); // 'pomodoro' (25m), 'shortBreak' (5m), 'longBreak' (15m), 'stopwatch'
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSessionSeconds, setElapsedSessionSeconds] = useState(0);

  // 6. Modals & Overlays State
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'kanban'
  const [selectedKanbanProjectId, setSelectedKanbanProjectId] = useState('all');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);

  // 7. Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Timer Ref Interval
  const timerIntervalRef = useRef(null);

  // Save Projects to LocalStorage when changed
  useEffect(() => {
    storageService.saveProjects(projects);
  }, [projects]);

  // Save Settings to LocalStorage when changed
  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  // Save Notes when changed
  useEffect(() => {
    storageService.saveNotes(notes);
  }, [notes]);

  // Handle Timer Countdown & Stopwatch
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSessionSeconds(prev => prev + 1);

        if (timerMode === 'stopwatch') {
          setTimerSeconds(prev => prev + 1);
        } else {
          setTimerSeconds(prev => {
            if (prev <= 1) {
              // Timer completed
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, timerMode]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Timer Actions
  const startTimer = () => {
    if (settings.soundEnabled) audioService.playTimerStart();
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    // Log elapsed session work if greater than 30 seconds
    if (elapsedSessionSeconds >= 30) {
      const minutesWorked = Math.max(1, Math.round(elapsedSessionSeconds / 60));
      logSessionWork(minutesWorked);
    }
  };

  const resetTimer = (mode = timerMode) => {
    setIsRunning(false);
    setElapsedSessionSeconds(0);
    setTimerMode(mode);
    if (mode === 'pomodoro') setTimerSeconds((settings.defaultPomodoroTime || 25) * 60);
    else if (mode === 'shortBreak') setTimerSeconds(5 * 60);
    else if (mode === 'longBreak') setTimerSeconds(15 * 60);
    else if (mode === 'stopwatch') setTimerSeconds(0);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (settings.soundEnabled) audioService.playTimerComplete();

    const modeMinutes = timerMode === 'pomodoro' ? 25 : timerMode === 'shortBreak' ? 5 : 15;
    logSessionWork(modeMinutes);

    showToast(`🎉 Focus Session Complete! (${modeMinutes} min logged to Heatmap)`);
    resetTimer('pomodoro');
  };

  const logSessionWork = (minutes) => {
    const updatedHeatmap = storageService.logWorkSession(minutes, activeProjectId);
    setHeatmap({ ...updatedHeatmap });

    // Refresh projects from storage
    const updatedProjects = storageService.getProjects();
    setProjects(updatedProjects);

    setElapsedSessionSeconds(0);
  };

  // Project Management Actions
  const addProject = (newProject) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    if (!activeProjectId) setActiveProjectId(newProject.id);
    showToast(`✨ Project "${newProject.title}" created successfully!`);
  };

  const updateProject = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      const remaining = projects.filter(p => p.id !== projectId);
      setActiveProjectId(remaining[0]?.id || null);
    }
    showToast('🗑️ Project deleted');
  };

  const toggleTaskCompletion = (projectId, taskId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const updatedTasks = p.tasks.map(t => {
          if (t.id === taskId) {
            const nextCompleted = !t.completed;
            if (nextCompleted && settings.soundEnabled) {
              audioService.playTaskComplete();
            }
            return { ...t, completed: nextCompleted };
          }
          return t;
        });

        // Check if all completed
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed);
        return {
          ...p,
          tasks: updatedTasks,
          status: allCompleted ? 'completed' : p.status,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    setProjects(updated);
  };

  const addTaskToProject = (projectId, taskTitle, estimatedMinutes = 30) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title: taskTitle,
      completed: false,
      estimatedMinutes
    };

    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: [...(p.tasks || []), newTask],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
  };

  const updateTaskStatus = (projectId, taskId, newStatus) => {
    const isDone = newStatus === 'done';
    const updated = projects.map(p => {
      if (p.id === projectId) {
        const updatedTasks = (p.tasks || []).map(t => {
          if (t.id === taskId) {
            if (isDone && !t.completed && settings.soundEnabled) {
              audioService.playTaskComplete();
            }
            return { ...t, status: newStatus, completed: isDone };
          }
          return t;
        });
        const allCompleted = updatedTasks.length > 0 && updatedTasks.every(t => t.completed || t.status === 'done');
        return {
          ...p,
          tasks: updatedTasks,
          status: allCompleted ? 'completed' : p.status,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });
    setProjects(updated);
  };

  const deleteTaskFromProject = (projectId, taskId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: (p.tasks || []).filter(t => t.id !== taskId),
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    }));
    showToast('🗑️ Task removed');
  };

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        projects,
        activeProjectId,
        setActiveProjectId,
        heatmap,
        settings,
        setSettings,
        notes,
        setNotes,
        currentView,
        setCurrentView,
        selectedKanbanProjectId,
        setSelectedKanbanProjectId,

        // Timer
        timerMode,
        timerSeconds,
        isRunning,
        elapsedSessionSeconds,
        startTimer,
        pauseTimer,
        resetTimer,

        // Project CRUD
        addProject,
        updateProject,
        deleteProject,
        toggleTaskCompletion,
        addTaskToProject,
        updateTaskStatus,
        deleteTaskFromProject,

        // Modals
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isReelModalOpen,
        setIsReelModalOpen,
        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
        isNewProjectModalOpen,
        setIsNewProjectModalOpen,
        selectedProjectDetail,
        setSelectedProjectDetail,

        // Toast & Import/Export
        toastMessage,
        showToast,
        exportData: () => storageService.exportAllData(),
        importData: (jsonStr) => {
          const success = storageService.importData(jsonStr);
          if (success) {
            setProjects(storageService.getProjects());
            setHeatmap(storageService.getHeatmap());
            setNotes(storageService.getNotes());
            showToast('✅ Workspace data imported successfully!');
          } else {
            showToast('❌ Failed to import workspace JSON');
          }
        }
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
