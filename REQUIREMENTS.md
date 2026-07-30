# Web-Based Tiling Project Tracker, Focus Timer & Activity Heatmap Dashboard

## Executive Overview
A high-performance, aesthetically rich web application designed for developers and creators to track projects, manage focused work sessions, monitor productivity via a GitHub-style contribution heatmap, and auto-generate structured project execution plans using Google's `@google/genai` SDK (`antigravity-preview-05-2026` agent).

---

## 1. Core Requirements

### 1.1 Dark-Mode Tiling User Interface (Bento Grid)
- Custom modular tile layout supporting grid rearrangement, panel collapse/expand, and full-screen tile focus.
- Visual style: Premium glassmorphic dark theme, glowing HSL/CSS custom variable accents, smooth CSS micro-interactions, subtle backdrop filters, and crisp typography (Inter/Outfit).
- Tiles included:
  1. **Project Dashboard Tile**: Lists active, completed, and archived projects with progress indicators.
  2. **Active Focus Timer Tile**: Integrated Pomodoro/Stopwatch timer linked to selected project with ambient sound & log persistence.
  3. **Contribution Heatmap Tile**: 365-day GitHub-style activity grid mapping hours logged & tasks finished.
  4. **AI Breakdown & Research Tile**: Interactive prompt box connected to Gemini API for web & GitHub research.
  5. **Reel Quick-Start Tile**: Modal/panel for converting Instagram/Facebook Reel/Short links into actionable project tasks.
  6. **Analytics & Productivity Tile**: Key performance metrics (daily streak, total hours focused, completion rate).
  7. **Quick Notes & Drafts Tile**: Instant scratchpad for thoughts, code snippets, and task dumps.

### 1.2 Global Command Palette (Ctrl+K / Cmd+K)
- Accessible anywhere via keyboard shortcut `Ctrl+K` or `Cmd+K`.
- Instant search across projects, subtasks, commands, and active views.
- Actions:
  - Jump to specific tile / view filter.
  - Create new project / task.
  - Start/Pause current Focus Timer.
  - Open Reel Link Quick-Start Modal.
  - Trigger AI Research Generator.
  - Toggle API Key configuration modal.
  - Export / Import data.

### 1.3 Focus Timer & Productivity Logging
- Modes: Pomodoro (25/5 min default), Short Break, Long Break, and Custom Stopwatch mode.
- Audio cues built with Web Audio API (chime on session end, ambient white noise / synth hum).
- Real-time logging: Stopping or completing a focus session automatically records timestamped duration to `localStorage` heatmap entries and updates the active project's logged hours.

### 1.4 GitHub-Style Activity Contribution Grid
- Interactive 52-week (365-day) contribution map.
- 4-level color intensity scaling (0: faint dark gray, 1: dim cyan, 2: vibrant cyan, 3: bright violet/blue, 4: neon glowing emerald).
- Hover tooltips showing date, hours logged, and completed subtasks.
- Filter by overall work or single project view.

### 1.5 Instagram/Facebook Reel Quick-Start Modal
- Accepts Instagram Reel URLs (`https://www.instagram.com/reel/...`), Facebook Reel URLs (`https://fb.watch/...`), YouTube Shorts (`https://youtube.com/shorts/...`), or raw video transcript text.
- Parses video metadata / topic / caption text.
- Provides a 1-click option to send parsed reel content into the `@google/genai` research breakdown engine.

### 1.6 `@google/genai` Integration with `antigravity-preview-05-2026` Agent
- SDK: `@google/genai` npm package.
- Agent Model: `antigravity-preview-05-2026`.
- Tools configured: `google_search` and `url_context`.
- Output: Enforced structured JSON containing:
  - `title`: String
  - `tagline`: String
  - `estimatedTotalHours`: Number
  - `category`: String
  - `recommendedStack`: Array of strings
  - `milestones`: Array of `{ title: string, tasks: [{ description: string, estimatedMinutes: number }] }`
- Graceful API Key handling: API key stored securely in `localStorage`. Provides live validation and fallback mock generator if API key is missing or quota is limited.

### 1.7 Data Persistence & State Management
- `localStorage` keys for:
  - `pt_projects`: Complete project list with subtasks and logged session histories.
  - `pt_heatmap`: Daily activity mapping (`{ "YYYY-MM-DD": { minutes: number, count: number } }`).
  - `pt_timer_state`: Active timer state to preserve session across tab refreshes.
  - `pt_settings`: User theme preferences, API key, sound settings.
- Export / Import workspace JSON state.
- Pre-populated rich mock seed data on initial load.
