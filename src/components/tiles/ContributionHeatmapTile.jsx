import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
      title="52-Week Velocity & Activity Matrix"
      icon={Flame}
      badge={`${totalDaysWorked} Days Active`}
      colSpan="col-span-12"
      headerAccent="text-emerald-400"
    >
      <div className="flex flex-col space-y-4">
        
        {/* Heatmap Top Bar Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] p-3 rounded-xl border border-white/[0.08] text-xs">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">CURRENT STREAK</span>
                <span className="font-bold text-amber-300 font-mono tabular-nums text-sm">{streak} Days</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">YEARLY FOCUSED</span>
                <span className="font-bold text-cyan-300 font-mono tabular-nums text-sm">{formatMinutesToHours(totalMinutesAll)}</span>
              </div>
            </div>
          </div>

          {/* Intensity Color Legend */}
          <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <span>Less</span>
            <div className="flex items-center space-x-1">
              <div className="w-3.5 h-3.5 rounded-sm heatmap-level-0" title="Level 0: No activity"></div>
              <div className="w-3.5 h-3.5 rounded-sm heatmap-level-1" title="Level 1: 1-45 min"></div>
              <div className="w-3.5 h-3.5 rounded-sm heatmap-level-2" title="Level 2: 45-120 min"></div>
              <div className="w-3.5 h-3.5 rounded-sm heatmap-level-3" title="Level 3: 120-240 min"></div>
              <div className="w-3.5 h-3.5 rounded-sm heatmap-level-4" title="Level 4: 240+ min"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Scrollable Heatmap Canvas Container */}
        <div className="relative overflow-x-auto pb-2 scrollbar-thin">
          <div className="inline-block min-w-full">
            
            {/* Month Labels Header */}
            <div className="flex space-x-1 text-[10px] text-slate-500 font-mono mb-1.5 pl-7">
              {weeks.map((week, idx) => {
                const monthMatch = monthLabels.find(m => m.weekIndex === idx);
                return (
                  <div key={idx} className="w-3.5 text-center flex-shrink-0">
                    {monthMatch ? monthMatch.monthName : ''}
                  </div>
                );
              })}
            </div>

            {/* Grid Days Row (0=Sun to 6=Sat) */}
            <div className="flex items-center">
              {/* Day of Week Labels */}
              <div className="flex flex-col justify-between text-[9px] text-slate-500 font-mono pr-2.5 h-28 select-none">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              {/* 52 Columns of Weeks */}
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
                          className={`w-3.5 h-3.5 rounded-sm transition-transform cursor-pointer ${
                            day.isToday ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-[#06080d]' : ''
                          } heatmap-level-${level} hover:scale-130 hover:z-20`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Tooltip / Active Hover Indicator */}
        <div className="h-9 flex items-center justify-between px-3.5 rounded-xl bg-[#090d16] border border-white/[0.06] text-xs">
          {hoveredDay ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center space-x-4 text-slate-300"
            >
              <span className="font-bold text-cyan-300 font-mono tabular-nums">{hoveredDay.dateKey}</span>
              <span className="text-slate-200">
                {hoveredDay.minutes > 0 ? (
                  <>
                    <strong className="text-emerald-400 font-mono tabular-nums">{formatMinutesToHours(hoveredDay.minutes)}</strong> focused deep work
                    {hoveredDay.tasksCompleted > 0 && ` • ${hoveredDay.tasksCompleted} tasks completed`}
                  </>
                ) : (
                  <span className="text-slate-500">No focused activity recorded for this day</span>
                )}
              </span>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hover over any square on the 52-week matrix to inspect daily focused time</span>
            </div>
          )}
        </div>

      </div>
    </TileWrapper>
  );
}
