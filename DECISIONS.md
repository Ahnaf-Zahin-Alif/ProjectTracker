# Architectural & Design System Decisions

## 1. Aesthetic Direction: Obsidian Studio Workbench
- **Spatial Paradigm**: Asymmetric 12-column Bento Workbench (`7 cols` Focus Studio + `5 cols` GenAI Architect + `12 cols` 52-Week Velocity Matrix).
- **Surface Depth Hierarchy**:
  - **Tier 1 (Base Canvas)**: `#06080d` Obsidian Void with faint ambient radial glows.
  - **Tier 2 (Elevated Panels)**: `#0b101b` Smoked Sapphire with `1px` border `rgba(255, 255, 255, 0.07)` and specular top hairline `rgba(255, 255, 255, 0.12)`.
  - **Tier 3 (Interactive Insets)**: `#111827` base, `#162033` hover, `rgba(6, 182, 212, 0.4)` active focus ring.
- **Color System (WCAG AA Compliant >= 4.5:1)**:
  - Primary CTA Accent: Electric Cyan (`#06b6d4` / `#22d3ee`)
  - Secondary Intelligence Accent: Royal Indigo/Violet (`#6366f1` / `#818cf8`)
  - Status Accents: Emerald (`#10b981`), Amber (`#f59e0b`), Rose (`#f43f5e`)

## 2. Typography & Geometry Discipline
- **Primary Typeface**: `Inter` with `-0.02em` tracking and `text-wrap: balance` on all headings (`h1`–`h3`).
- **Tabular Monospace**: `JetBrains Mono` strictly reserved for clocks (`25:00`), metrics, streaks, shortcuts (`Ctrl+K`), and indices.
- **Concentric Geometry**:
  - Outer card containers: `rounded-2xl` (`18px`)
  - Inner cards / controls: `rounded-lg` (`10px`) following `inner = outer - padding`.

## 3. Motion Choreography
- Wrapped root in `<MotionConfig reducedMotion="user">` for accessibility.
- Critically damped everyday UI springs (`stiffness: 340, damping: 30, bounce: 0`).
- Modal entrances: `scale: 0.95` $\rightarrow$ `1.0` with `ease-out [0.16, 1, 0.3, 1]`.
- Modal exits: `180ms` (20% faster than entrances for immediate feel).
- Shared element indicator: `layoutId="activeNavIndicator"` on the navigation rail.
- Micro-interactions: `whileTap={{ scale: 0.97 }}` on all interactive buttons.

## 4. Contract Preservation
- Preserved all LocalStorage state keys (`pt_projects_v3`, `pt_heatmap_v3`, `pt_settings_v3`, `pt_notes_v3`).
- Retained `@google/genai` model `antigravity-preview-05-2026` with Google Search and URL Context grounding tools.
- Retained Web Audio API synthesizers for timer and task chimes.
