import React from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { BarChart3, TrendingUp, CheckCircle, Target, Award, PieChart } from 'lucide-react';
import { formatMinutesToHours } from '../../utils/dateUtils';

export function AnalyticsTile() {
  const { projects, heatmap } = useAppState();

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in-progress').length;

  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const totalMinutes = Object.values(heatmap).reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const activeDaysCount = Object.values(heatmap).filter(curr => curr.minutes > 0).length;
  const avgMinutesPerActiveDay = activeDaysCount > 0 ? Math.round(totalMinutes / activeDaysCount) : 0;

  // Aggregate Top Tech Stack Tags
  const tagCounts = {};
  projects.forEach(p => {
    p.tags?.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <TileWrapper
      title="Productivity & Tech Velocity"
      icon={BarChart3}
      badge={`${completionRate}% Completed`}
      colSpan="col-span-12 lg:col-span-6"
      headerAccent="text-cyan-400"
    >
      <div className="flex flex-col space-y-4">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Projects</span>
            <span className="text-xl font-bold text-slate-100 mt-1 font-mono">{totalProjects}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{inProgressProjects} active</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Done</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 font-mono">{completedProjects}</span>
            <span className="text-[10px] text-emerald-500/80 mt-0.5">{completionRate}% rate</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Focused</span>
            <span className="text-xl font-bold text-cyan-400 mt-1 font-mono">{formatMinutesToHours(totalMinutes)}</span>
            <span className="text-[10px] text-cyan-500/80 mt-0.5">{activeDaysCount} active days</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Daily Pace</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 font-mono">{formatMinutesToHours(avgMinutesPerActiveDay)}</span>
            <span className="text-[10px] text-indigo-500/80 mt-0.5">per session day</span>
          </div>
        </div>

        {/* Tech Stack Distribution */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <div className="flex items-center space-x-1.5">
              <PieChart className="w-3.5 h-3.5 text-violet-400" />
              <span>Top Tech Stack Distribution</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{sortedTags.length} tags</span>
          </div>

          <div className="space-y-2">
            {sortedTags.map(([tag, count]) => {
              const tagPercent = Math.round((count / totalProjects) * 100);
              return (
                <div key={tag} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{tag}</span>
                    <span className="text-slate-400 text-[11px]">{count} project{count > 1 ? 's' : ''} ({tagPercent}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 h-1.5 rounded-full"
                      style={{ width: `${tagPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </TileWrapper>
  );
}
