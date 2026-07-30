# Technical Architecture & System Design

## 1. System Architecture Diagram

```
+-------------------------------------------------------------------------------+
|                             React Frontend App                                |
|                                                                               |
|  +--------------------+   +-----------------------+   +--------------------+  |
|  |  Command Palette   |   |   Bento Tiling Grid   |   |   Reel QuickStart  |  |
|  |   (Ctrl+K / Cmd+K) |   |  (Layout State Mgr)   |   |     Modal Window   |  |
|  +---------+----------+   +-----------+-----------+   +---------+----------+  |
|            |                          |                         |             |
|            v                          v                         v             |
|  +-------------------------------------------------------------------------+  |
|  |                    Global React Context / State Hooks                   |  |
|  |   (ProjectsContext, TimerContext, HeatmapContext, GenAIContext)         |  |
|  +------------------------------------+------------------------------------+  |
|                                       |                                       |
|            +--------------------------+--------------------------+            |
|            |                          |                          |            |
|            v                          v                          v            |
|  +-------------------+      +-------------------+      +-------------------+  |
|  | LocalStorage Sync |      |  Web Audio Engine |      | `@google/genai`   |  |
|  | (Data Persistence)|      |  (Timer Chimes)   |      | SDK Service Client|  |
|  +-------------------+      +-------------------+      +---------+---------+  |
+------------------------------------------------------------------|------------+
                                                                   |
                                                                   v
                                                  +----------------------------------+
                                                  | Gemini API Service               |
                                                  | Agent: antigravity-preview-05-2026|
                                                  | Tools: google_search, url_context|
                                                  +----------------------------------+
```

## 2. Directory & Module Structure

```
ProjectTracker/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── BentoGrid.jsx
│   │   │   └── TileWrapper.jsx
│   │   ├── tiles/
│   │   │   ├── ProjectListTile.jsx
│   │   │   ├── FocusTimerTile.jsx
│   │   │   ├── ContributionHeatmapTile.jsx
│   │   │   ├── AiResearchTile.jsx
│   │   │   ├── AnalyticsTile.jsx
│   │   │   └── QuickNotesTile.jsx
│   │   ├── modals/
│   │   │   ├── CommandPaletteModal.jsx
│   │   │   ├── ReelQuickStartModal.jsx
│   │   │   ├── ProjectDetailModal.jsx
│   │   │   └── ApiKeyConfigModal.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── ProgressBar.jsx
│   │       └── Card.jsx
│   ├── context/
│   │   ├── AppStateContext.jsx
│   │   └── ThemeContext.jsx
│   ├── services/
│   │   ├── genAiService.js
│   │   ├── storageService.js
│   │   ├── audioService.js
│   │   └── seedData.js
│   └── utils/
│       ├── dateUtils.js
│       └── formatters.js
```

## 3. Data Schema & Types

### 3.1 Project Entity
```json
{
  "id": "proj_1720000000",
  "title": "Build AI Tiling Dashboard",
  "description": "Create a high-speed modular React dashboard with GenAI integration.",
  "category": "Web Dev",
  "status": "in-progress", // 'not-started' | 'in-progress' | 'completed'
  "tags": ["React", "GenAI", "Tailwind"],
  "targetHours": 12,
  "loggedMinutes": 240,
  "createdAt": "2026-07-29T10:00:00.000Z",
  "updatedAt": "2026-07-29T16:00:00.000Z",
  "sourceUrl": "https://www.instagram.com/reel/C-example", // optional reel link
  "tasks": [
    {
      "id": "task_1",
      "title": "Setup Vite & Tailwind project structure",
      "completed": true,
      "estimatedMinutes": 30
    },
    {
      "id": "task_2",
      "title": "Integrate @google/genai SDK with grounding tools",
      "completed": false,
      "estimatedMinutes": 60
    }
  ]
}
```

### 3.2 Activity Heatmap Log Entry
```json
{
  "2026-07-29": {
    "minutes": 180,
    "tasksCompleted": 4,
    "sessions": [
      {
        "projectId": "proj_1720000000",
        "durationMinutes": 45,
        "timestamp": "2026-07-29T14:30:00.000Z"
      }
    ]
  }
}
```

## 4. `@google/genai` Integration Design

```javascript
import { GoogleGenAI } from '@google/genai';

export async function generateProjectBreakdown({ prompt, apiKey, sourceUrl }) {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'antigravity-preview-05-2026',
    contents: prompt,
    config: {
      tools: [
        { googleSearch: {} },
        { urlContext: {} }
      ],
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          tagline: { type: 'STRING' },
          estimatedTotalHours: { type: 'NUMBER' },
          category: { type: 'STRING' },
          recommendedStack: { type: 'ARRAY', items: { type: 'STRING' } },
          milestones: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                tasks: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      description: { type: 'STRING' },
                      estimatedMinutes: { type: 'NUMBER' }
                    },
                    required: ['description', 'estimatedMinutes']
                  }
                }
              },
              required: ['title', 'tasks']
            }
          }
        },
        required: ['title', 'tagline', 'estimatedTotalHours', 'category', 'recommendedStack', 'milestones']
      }
    }
  });

  return JSON.parse(response.text);
}
```

---

## 5. Security & Browser Performance
- API keys are handled entirely client-side via secure local storage inputs, never committed to git.
- Heatmap computation uses date lookup maps $O(1)$ for rendering efficiency across 365 grid cells.
- Audio synthesizer uses Web Audio API oscillators to generate zero-dependency audio tones.
