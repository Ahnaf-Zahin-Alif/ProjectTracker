import { formatDateKey } from '../utils/dateUtils';

export const INITIAL_PROJECTS = [
  {
    id: 'proj_antigravity_1',
    title: 'Antigravity AI Tiling Engine',
    description: 'React tiling dashboard integrated with @google/genai SDK (antigravity-preview-05-2026) for autonomous project breakdown and focus tracking.',
    category: 'AI Systems',
    status: 'in-progress',
    tags: ['React', 'GenAI', 'Tailwind', 'Vite'],
    targetHours: 20,
    loggedMinutes: 480,
    createdAt: '2026-07-28T09:00:00.000Z',
    updatedAt: '2026-07-29T16:00:00.000Z',
    sourceUrl: 'https://www.instagram.com/reel/C-antigravity-demo',
    tasks: [
      { id: 'task_1_1', title: 'Initialize Vite React architecture & bento CSS system', completed: true, estimatedMinutes: 45 },
      { id: 'task_1_2', title: 'Implement @google/genai client with google_search tool', completed: true, estimatedMinutes: 90 },
      { id: 'task_1_3', title: 'Build Command Palette (Ctrl+K) navigation overlay', completed: true, estimatedMinutes: 60 },
      { id: 'task_1_4', title: 'Integrate Web Audio focus timer & heatmap sync', completed: false, estimatedMinutes: 75 },
      { id: 'task_1_5', title: 'Create Instagram/FB Reel quick-start modal', completed: false, estimatedMinutes: 60 }
    ]
  },
  {
    id: 'proj_reel_converter_2',
    title: 'Shorts & Reel Code Excerpt Extractor',
    description: 'Social video breakdown parser extracting code snippets, tech specs, and milestone tasks from Instagram Reels and YouTube Shorts.',
    category: 'Developer Tools',
    status: 'in-progress',
    tags: ['Python', 'OCR', 'LLM', 'FastAPI'],
    targetHours: 15,
    loggedMinutes: 310,
    createdAt: '2026-07-20T14:30:00.000Z',
    updatedAt: '2026-07-29T11:20:00.000Z',
    sourceUrl: 'https://www.instagram.com/reel/C9_reel_sample',
    tasks: [
      { id: 'task_2_1', title: 'Web Scraping metadata & thumbnail preview', completed: true, estimatedMinutes: 60 },
      { id: 'task_2_2', title: 'Video audio transcription pipeline', completed: true, estimatedMinutes: 120 },
      { id: 'task_2_3', title: 'Prompt engineering for Gemini 1.5/3.0 schema parsing', completed: false, estimatedMinutes: 90 }
    ]
  },
  {
    id: 'proj_mobile_tracker_3',
    title: 'Cross-Platform Focus & Habit Tracker',
    description: 'Minimalist offline-first habit tracker with native widget integrations.',
    category: 'Mobile Dev',
    status: 'completed',
    tags: ['React Native', 'SQLite', 'Zustand'],
    targetHours: 30,
    loggedMinutes: 1800,
    createdAt: '2026-06-10T10:00:00.000Z',
    updatedAt: '2026-07-25T18:00:00.000Z',
    tasks: [
      { id: 'task_3_1', title: 'Design dark theme UI components', completed: true, estimatedMinutes: 300 },
      { id: 'task_3_2', title: 'Setup SQLite local database schema', completed: true, estimatedMinutes: 240 },
      { id: 'task_3_3', title: 'Publish initial v1.0 bundle', completed: true, estimatedMinutes: 120 }
    ]
  }
];

export const INITIAL_NOTES = `# Quick Scratchpad & Code Snippets

- [x] Test Command Palette shortcut (\`Ctrl+K\` / \`Cmd+K\`)
- [ ] Connect `@google/genai` API key in settings modal
- [ ] Try pasting a video link in **Reel Quick-Start** modal

\`\`\`javascript
// Example GenAI agent initialization
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });
\`\`\`
`;

/**
 * Pre-populates 365 days of contribution heatmap data so the dashboard displays vibrant activity
 */
export function generateInitialHeatmapData() {
  const heatmap = {};
  const today = new Date();

  // Generate 365 days of activity initialized cleanly without random numbers
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = formatDateKey(d);
    heatmap[key] = { minutes: 0, tasksCompleted: 0, sessionsCount: 0 };
  }

  return heatmap;
}
