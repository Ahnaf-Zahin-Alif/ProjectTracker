import { formatDateKey } from '../utils/dateUtils';

export const INITIAL_PROJECTS = [];

export const INITIAL_NOTES = `# Quick Scratchpad
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
