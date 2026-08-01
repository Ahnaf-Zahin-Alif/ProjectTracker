import { formatDateKey } from '../utils/dateUtils';

export const INITIAL_PROJECTS = [];

export const INITIAL_NOTES = `# Quick Scratchpad
`;

export function generateDefaultSubtasks(projectTitle = 'Project') {
  const timestamp = Date.now();
  return [
    // STEP 1: ARCHITECTURE PHASE (5 subtasks)
    { id: `task_st1_${timestamp}_1`, title: `[Architecture Phase] 1. Initialize repository, package.json dependencies & scripts for ${projectTitle}`, completed: false, estimatedMinutes: 20 },
    { id: `task_st1_${timestamp}_2`, title: `[Architecture Phase] 2. Configure build system, Tailwind CSS & global style tokens`, completed: false, estimatedMinutes: 25 },
    { id: `task_st1_${timestamp}_3`, title: `[Architecture Phase] 3. Setup core project folder structure & context state providers`, completed: false, estimatedMinutes: 30 },
    { id: `task_st1_${timestamp}_4`, title: `[Architecture Phase] 4. Define data model schemas, state types & local storage keys`, completed: false, estimatedMinutes: 25 },
    { id: `task_st1_${timestamp}_5`, title: `[Architecture Phase] 5. Setup environment variables & API client configurations`, completed: false, estimatedMinutes: 15 },

    // STEP 2: CORE ENGINE & UI COMPONENTS (6 subtasks)
    { id: `task_st2_${timestamp}_1`, title: `[Core Engine] 1. Build main responsive layout container, header & brand logo`, completed: false, estimatedMinutes: 35 },
    { id: `task_st2_${timestamp}_2`, title: `[Core Engine] 2. Construct primary workspace grid panels & tile wrappers`, completed: false, estimatedMinutes: 45 },
    { id: `task_st2_${timestamp}_3`, title: `[Core Engine] 3. Build interactive focus timer widget & circular progress gauge`, completed: false, estimatedMinutes: 50 },
    { id: `task_st2_${timestamp}_4`, title: `[Core Engine] 4. Create subtask checklist manager with CRUD & status toggles`, completed: false, estimatedMinutes: 40 },
    { id: `task_st2_${timestamp}_5`, title: `[Core Engine] 5. Implement 365-day heatmap grid & streak calculation engine`, completed: false, estimatedMinutes: 45 },
    { id: `task_st2_${timestamp}_6`, title: `[Core Engine] 6. Add modal overlays for new project creation & API settings`, completed: false, estimatedMinutes: 35 },

    // STEP 3: API INTEGRATION & PERSISTENCE (5 subtasks)
    { id: `task_st3_${timestamp}_1`, title: `[API Integration] 1. Connect LocalStorage service for real-time state persistence`, completed: false, estimatedMinutes: 30 },
    { id: `task_st3_${timestamp}_2`, title: `[API Integration] 2. Setup Google Generative AI (@google/genai) SDK model client`, completed: false, estimatedMinutes: 40 },
    { id: `task_st3_${timestamp}_3`, title: `[API Integration] 3. Implement image upload, drag & drop, and Ctrl+V paste listeners`, completed: false, estimatedMinutes: 45 },
    { id: `task_st3_${timestamp}_4`, title: `[API Integration] 4. Connect Web Search & URL grounding context tools`, completed: false, estimatedMinutes: 50 },
    { id: `task_st3_${timestamp}_5`, title: `[API Integration] 5. Build export/import JSON backup data handlers`, completed: false, estimatedMinutes: 30 },

    // STEP 4: TESTING, POLISH & PRODUCTION DEPLOY (5 subtasks)
    { id: `task_st4_${timestamp}_1`, title: `[Testing & Polish] 1. Audit cross-browser responsiveness & dark theme contrast`, completed: false, estimatedMinutes: 30 },
    { id: `task_st4_${timestamp}_2`, title: `[Testing & Polish] 2. Implement keyboard shortcuts (Ctrl+K Command Palette)`, completed: false, estimatedMinutes: 25 },
    { id: `task_st4_${timestamp}_3`, title: `[Testing & Polish] 3. Add sound triggers & toast notification banners`, completed: false, estimatedMinutes: 20 },
    { id: `task_st4_${timestamp}_4`, title: `[Testing & Polish] 4. Execute production build validation (npm run build)`, completed: false, estimatedMinutes: 15 },
    { id: `task_st4_${timestamp}_5`, title: `[Testing & Polish] 5. Stage, commit to GitHub & trigger automatic Vercel deploy`, completed: false, estimatedMinutes: 15 }
  ];
}

/**
 * Pre-populates 365 days of contribution heatmap data so the dashboard displays vibrant activity
 */
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
