import { INITIAL_PROJECTS, INITIAL_NOTES, generateInitialHeatmapData } from './seedData';
import { getTodayDateKey } from '../utils/dateUtils';

const KEYS = {
  PROJECTS: 'pt_projects_v1',
  HEATMAP: 'pt_heatmap_v1',
  TIMER: 'pt_timer_v1',
  SETTINGS: 'pt_settings_v1',
  NOTES: 'pt_notes_v1'
};

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
      console.error('Error loading projects from localStorage:', e);
      return INITIAL_PROJECTS;
    }
  },

  saveProjects(projects) {
    try {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Error saving projects to localStorage:', e);
    }
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
      console.error('Error loading heatmap from localStorage:', e);
      return generateInitialHeatmapData();
    }
  },

  saveHeatmap(heatmap) {
    try {
      localStorage.setItem(KEYS.HEATMAP, JSON.stringify(heatmap));
    } catch (e) {
      console.error('Error saving heatmap to localStorage:', e);
    }
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

    // If a project ID was linked, update project logged minutes
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

  getTimerState() {
    try {
      const data = localStorage.getItem(KEYS.TIMER);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  saveTimerState(timerState) {
    try {
      localStorage.setItem(KEYS.TIMER, JSON.stringify(timerState));
    } catch (e) {
      console.error('Error saving timer state:', e);
    }
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
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  },

  getNotes() {
    try {
      return localStorage.getItem(KEYS.NOTES) || INITIAL_NOTES;
    } catch (e) {
      return INITIAL_NOTES;
    }
  },

  saveNotes(notes) {
    try {
      localStorage.setItem(KEYS.NOTES, notes);
    } catch (e) {
      console.error('Error saving notes:', e);
    }
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
      console.error('Import failed:', e);
      return false;
    }
  }
};
