import React, { useState, useMemo } from 'react';
import { useAppState } from '../../context/AppStateContext';
import { TileWrapper } from './TileWrapper';
import { Flame, Calendar, Info, Clock, CheckCircle } from 'lucide-react';
import { generate365DayHeatmapGrid, formatMinutesToHours, calculateActiveStreak } from '../../utils/dateUtils';

export function ContributionHeatmapTile() {
  const { heatmap } = useAppState();
  const [hoveredDay, setHoveredDay] = useState(null);

  // Generate 52 weeks x 7 days grid
  const weeks = useMemo(() => generate365DayHeatmapGrid(), []);
  const streak = calculateActiveStreak(heatmap);

  // Calculate intensity level (0 to 4)
  const getIntensityLevel = (minutes) => {
    if (!minutes || minutes === 0) return 0;
    if (minutes <= 45) return 1;
    if (minutes <= 120) return 2;
    if (minutes <= 240) return 3;
    return 4;
  };

  // Month headers extraction for top row
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = '';
    weeks.forEach((week, idx) => {
      const firstDayOfMonth = week.days.find(d => d.monthName !== lastMonth);
      if (firstDayOfMonth) {
        labels.push({ monthName: firstDayOfMonth.monthName, weekIndex: idx });
        lastMonth = firstDayOfMonth.monthName;
      }
    });
    return labels;
  }, [weeks]);

  // Aggregate stats
  const totalMinutesAll = Object.values(heatmap).reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  const totalDaysWorked = Object.values(heatmap).filter(curr => curr.minutes > 0).length;

  return (
    <TileWrapper
      title="Activity Contribution Grid"
      icon={Flame}
      badge={`${totalDaysWorked} Days Active`}
      colSpan="col-span-12 lg:col-span-12"
      headerAccent="text-emerald-400"
    >
      <div className="flex flex-col space-y-4">
        
        {/* Heatmap Top Bar Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Current Streak:</span>
              <span className="font-bold text-amber-300 font-mono">{streak} Days</span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Yearly Focused:</span>
              <span className="font-bold text-cyan-300 font-mono">{formatMinutesToHours(totalMinutesAll)}</span>
            </div>
          </div>

          {/* Intensity Color Legend */}
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm heatmap-level-0"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-1"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-2"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-3"></div>
            <div className="w-3 h-3 rounded-sm heatmap-level-4"></div>
            <span>More</span>
          </div>
        </div>

        {/* Scrollable Heatmap Canvas Container */}
        <div className="relative overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-block min-w-full">
            
            {/* Month Labels Header */}
            <div className="flex space-x-1 text-[10px] text-slate-500 font-mono mb-1 pl-6">
              {weeks.map((week, idx) => {
                const monthMatch = monthLabels.find(m => m.weekIndex === idx);
                return (
                  <div key={idx} className="w-3.5 text-center">
                    {monthMatch ? monthMatch.monthName : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid Days Row (0=Sun to 6=Sat) */}
            <div className="flex">
              {/* Day of Week Labels */}
              <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2 h-28">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Week Columns */}
              <div className="flex space-x-1">
                {weeks.map((week) => (
                  <div key={week.weekIndex} className="flex flex-col space-y-1">
                    {week.days.map((day) => {
                      const dayEntry = heatmap[day.dateKey] || { minutes: 0, tasksCompleted: 0 };
                      const level = getIntensityLevel(dayEntry.minutes);

                      return (
                        <div
                          key={day.dateKey}
                          onMouseEnter={() => setHoveredDay({ ...day, ...dayEntry })}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-3.5 h-3.5 rounded-sm transition-all duration-150 cursor-pointer ${
                            day.isToday ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950' : ''
                          } heatmap-level-${level} hover:scale-125 hover:z-10`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Day Detail Hover Bar */}
        <div className="h-8 flex items-center justify-between px-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          {hoveredDay ? (
            <div className="flex items-center space-x-4 text-slate-300">
              <span className="font-bold text-cyan-300 font-mono">{hoveredDay.dateKey}</span>
              <span>{hoveredDay.minutes > 0 ? `${formatMinutesToHours(hoveredDay.minutes)} logged` : 'No activity'}</span>
              {hoveredDay.sessionsCount > 0 && (
                <span className="text-slate-400">({hoveredDay.sessionsCount} sessions)</span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hover over any grid square to view daily focus activity breakdown</span>
            </div>
          )}
        </div>

      </div>
    </TileWrapper>
  );
}
