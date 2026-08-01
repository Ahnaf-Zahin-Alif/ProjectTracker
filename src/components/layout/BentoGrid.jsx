import React from 'react';
import { FocusTimerTile } from '../tiles/FocusTimerTile';
import { ContributionHeatmapTile } from '../tiles/ContributionHeatmapTile';
import { AiResearchTile } from '../tiles/AiResearchTile';

export function BentoGrid() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Row 1: GenAI Architecture & Breakdown (Left panel of Image 1 kept) */}
        <AiResearchTile />

        {/* Row 2: Focus Timer & Pomodoro (Time tracker of Image 2 kept) */}
        <FocusTimerTile />

        {/* Row 3: Contribution Activity Heatmap */}
        <ContributionHeatmapTile />
      </div>
    </main>
  );
}
