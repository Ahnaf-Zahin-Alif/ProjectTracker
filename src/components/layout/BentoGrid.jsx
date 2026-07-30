import React from 'react';
import { ProjectListTile } from '../tiles/ProjectListTile';
import { FocusTimerTile } from '../tiles/FocusTimerTile';
import { ContributionHeatmapTile } from '../tiles/ContributionHeatmapTile';
import { AiResearchTile } from '../tiles/AiResearchTile';
import { AnalyticsTile } from '../tiles/AnalyticsTile';
import { QuickNotesTile } from '../tiles/QuickNotesTile';

export function BentoGrid() {
  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="bento-container">
        {/* Row 1: Project Tracker (7 cols) + Focus Timer (5 cols) */}
        <ProjectListTile />
        <FocusTimerTile />

        {/* Row 2: Contribution Heatmap Grid (12 cols) */}
        <ContributionHeatmapTile />

        {/* Row 3: GenAI Breakdown (6 cols) + Analytics (6 cols) */}
        <AiResearchTile />
        <AnalyticsTile />

        {/* Row 4: Scratchpad Notes (6 cols) */}
        <QuickNotesTile />
      </div>
    </main>
  );
}
