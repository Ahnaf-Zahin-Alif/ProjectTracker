import React from 'react';
import { FocusTimerTile } from '../tiles/FocusTimerTile';
import { AiResearchTile } from '../tiles/AiResearchTile';
import { ContributionHeatmapTile } from '../tiles/ContributionHeatmapTile';

export function BentoGrid() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Row 1 Flagship: Active Focus Studio & Subtask Command Center (7 cols desktop) */}
        <FocusTimerTile />

        {/* Row 1 Secondary: GenAI Architect & Vision Research Lab (5 cols desktop) */}
        <AiResearchTile />

        {/* Row 2 Full-Width: 52-Week Velocity & Contribution Heatmap Matrix (12 cols) */}
        <ContributionHeatmapTile />
      </div>
    </main>
  );
}
