/**
 * Date and Time utilities for Heatmap and Timer computations
 */

// Returns "YYYY-MM-DD" formatted string in local time
export function formatDateKey(dateInput) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey() {
  return formatDateKey(new Date());
}

/**
 * Format total minutes into human readable string e.g. "4h 15m" or "45m"
 */
export function formatMinutesToHours(minutes) {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Format seconds into timer display MM:SS
 */
export function formatSecondsToTimer(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Generates an array of dates representing 52 weeks (364 days) up to today.
 * Returned as array of week columns: [{ weekIndex: 0, days: [{ dateKey, dayOfWeek, isToday, monthName }] }]
 */
export function generate365DayHeatmapGrid() {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We align to Sunday 52 weeks ago
  const totalDays = 52 * 7;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  let currentDate = new Date(startDate);

  let currentWeek = [];
  let weekIndex = 0;

  for (let i = 0; i < totalDays; i++) {
    const dateKey = formatDateKey(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat
    const isToday = dateKey === formatDateKey(today);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'short' });

    currentWeek.push({
      dateKey,
      dateObj: new Date(currentDate),
      dayOfWeek,
      isToday,
      monthName,
      dayOfMonth: currentDate.getDate()
    });

    if (currentWeek.length === 7) {
      weeks.push({
        weekIndex,
        days: currentWeek
      });
      currentWeek = [];
      weekIndex++;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push({
      weekIndex,
      days: currentWeek
    });
  }

  return weeks;
}

/**
 * Calculate current consecutive active streak (days with > 0 minutes)
 */
export function calculateActiveStreak(heatmapData) {
  let streak = 0;
  const today = new Date();
  let checkDate = new Date(today);

  // Check today or yesterday first
  let todayKey = formatDateKey(today);
  if (!heatmapData[todayKey] || heatmapData[todayKey].minutes === 0) {
    // If no work logged today yet, check starting from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = formatDateKey(checkDate);
    const entry = heatmapData[key];
    if (entry && entry.minutes > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
