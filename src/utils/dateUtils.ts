export function formatDueDate(dateString: string): { text: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const isPast = date.getTime() < now.getTime();

  if (diffDays < 0) {
    return {
      text: `Overdue (${Math.abs(diffDays)}d ago)`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }

  if (diffDays === 0) {
    return {
      text: `Today at ${timeStr}`,
      isOverdue: isPast,
      isToday: true,
      isTomorrow: false,
    };
  }

  if (diffDays === 1) {
    return {
      text: `Tomorrow at ${timeStr}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: true,
    };
  }

  if (diffDays < 7) {
    const dayName = date.toLocaleDateString([], { weekday: 'short' });
    return {
      text: `${dayName} at ${timeStr}`,
      isOverdue: false,
      isToday: false,
      isTomorrow: false,
    };
  }

  const monthDay = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return {
    text: `${monthDay} at ${timeStr}`,
    isOverdue: false,
    isToday: false,
    isTomorrow: false,
  };
}

export function isDateInCurrentWeek(dateString: string): boolean {
  if (!dateString) return false;
  const target = new Date(dateString);
  const now = new Date();

  // Get Monday of current week
  const day = now.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
  
  // End of Sunday of current week
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
}

export function parseEstimatedMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const str = timeStr.toLowerCase().trim();

  // Check for combined e.g. "1h 30m" or "1 hour 30 mins"
  const comboMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours)\s*(\d+)?\s*(?:m|min|mins|minute|minutes)?/);
  if (comboMatch) {
    const hours = parseFloat(comboMatch[1]) || 0;
    const mins = comboMatch[2] ? parseInt(comboMatch[2], 10) : 0;
    return Math.round(hours * 60 + mins);
  }

  // Check for hours only e.g. "2.5h", "2 hours", "4+ hours"
  const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hour|hours|\+)/);
  if (hoursMatch) {
    return Math.round(parseFloat(hoursMatch[1]) * 60);
  }

  // Check for minutes only e.g. "45m", "45 mins", "30 minutes"
  const minsMatch = str.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);
  if (minsMatch) {
    return parseInt(minsMatch[1], 10);
  }

  // Fallback to just digits
  const rawNum = parseFloat(str);
  if (!isNaN(rawNum)) {
    return rawNum > 10 ? Math.round(rawNum) : Math.round(rawNum * 60);
  }

  return 60; // Default 1 hr
}

/**
 * Returns time remaining status, color thresholds, and progress percentage:
 * - Starts green (> 24h)
 * - Yellow day before due (<= 24h)
 * - Orange 12h before due (<= 12h)
 * - Red 8h before due (<= 8h) or overdue
 */
export function getTimeRemainingInfo(dueDateString: string): {
  diffHours: number;
  percentage: number;
  colorClass: string;
  badgeText: string;
  isOverdue: boolean;
} {
  if (!dueDateString) {
    return {
      diffHours: 999,
      percentage: 100,
      colorClass: 'bg-emerald-500',
      badgeText: '',
      isOverdue: false,
    };
  }

  const dueDate = new Date(dueDateString);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const isOverdue = diffHours <= 0;

  let colorClass = 'bg-emerald-500';
  let badgeText = '';

  if (isOverdue) {
    colorClass = 'bg-red-500';
    const hoursAgo = Math.abs(Math.round(diffHours));
    badgeText = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
  } else if (diffHours <= 8) {
    colorClass = 'bg-red-500';
    badgeText = `${Math.ceil(diffHours)}h left`;
  } else if (diffHours <= 12) {
    colorClass = 'bg-orange-500';
    badgeText = `${Math.ceil(diffHours)}h left`;
  } else if (diffHours <= 24) {
    colorClass = 'bg-yellow-400';
    badgeText = `${Math.ceil(diffHours)}h left`;
  } else {
    colorClass = 'bg-emerald-500';
    const daysLeft = Math.ceil(diffHours / 24);
    badgeText = daysLeft === 1 ? '1d left' : `${daysLeft}d left`;
  }

  // Calculate visual percentage on a 4-day (96h) max scale
  const maxScaleHours = 96;
  let percentage = 0;
  if (!isOverdue) {
    percentage = Math.min(100, Math.max(8, Math.round((diffHours / maxScaleHours) * 100)));
  }

  return {
    diffHours,
    percentage,
    colorClass,
    badgeText,
    isOverdue,
  };
}

export function formatMinutesToDisplay(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

export function getTagBadgeStyle(tag: string): { bg: string; text: string; border: string; dot: string; hex?: string } {
  const normalized = tag.toLowerCase().trim();
  switch (normalized) {
    case 'writing':
    case 'essay':
      return { bg: 'bg-[#F35F98]/15', text: 'text-[#F35F98]', border: 'border-[#F35F98]/30', dot: 'bg-[#F35F98]', hex: '#F35F98' };
    case 'reading':
      return { bg: 'bg-[#EEA144]/15', text: 'text-[#EEA144]', border: 'border-[#EEA144]/30', dot: 'bg-[#EEA144]', hex: '#EEA144' };
    case 'photo':
      return { bg: 'bg-[#E85F2D]/15', text: 'text-[#E85F2D]', border: 'border-[#E85F2D]/30', dot: 'bg-[#E85F2D]', hex: '#E85F2D' };
    case 'film':
    case 'video':
      return { bg: 'bg-[#62092B]/40', text: 'text-[#f687b3]', border: 'border-[#62092B]/60', dot: 'bg-[#f687b3]', hex: '#62092B' };
    case 'easy':
      return { bg: 'bg-[#78BE06]/15', text: 'text-[#78BE06]', border: 'border-[#78BE06]/30', dot: 'bg-[#78BE06]', hex: '#78BE06' };
    case 'project':
      return { bg: 'bg-[#E85F2D]/20', text: 'text-[#EEA144]', border: 'border-[#E85F2D]/40', dot: 'bg-[#EEA144]', hex: '#EEA144' };
    case 'research':
      return { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400', hex: '#06B6D4' };
    case 'exam':
      return { bg: 'bg-[#E85F2D]/20', text: 'text-[#E85F2D]', border: 'border-[#E85F2D]/40', dot: 'bg-[#E85F2D]', hex: '#E85F2D' };
    case 'code':
    case 'lab':
      return { bg: 'bg-[#78BE06]/15', text: 'text-[#78BE06]', border: 'border-[#78BE06]/30', dot: 'bg-[#78BE06]', hex: '#78BE06' };
    default:
      return { bg: 'bg-white/[0.06]', text: 'text-zinc-300', border: 'border-white/10', dot: 'bg-zinc-400', hex: '#A1A1AA' };
  }
}

/**
 * Generates an iCalendar (.ics) string for an assignment with a 24-hour reminder alarm
 */
export function generateIcsFile(title: string, className: string, dueDateStr: string, notes: string): string {
  const dueDate = new Date(dueDateStr);
  const now = new Date();

  const formatDateToIcs = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const dtStamp = formatDateToIcs(now);
  const dtEnd = formatDateToIcs(dueDate);
  // Default start 1 hour before due date
  const dtStart = formatDateToIcs(new Date(dueDate.getTime() - 60 * 60 * 1000));
  const uid = `asg-${Date.now()}@assignmentplanner.pwa`;

  const cleanDescription = (notes || '').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Assignment Tracker PWA//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title} [${className}]`,
    `DESCRIPTION:${cleanDescription}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: ${title} is due in 24 hours!`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadIcs(title: string, className: string, dueDateStr: string, notes: string) {
  const icsData = generateIcsFile(title, className, dueDateStr, notes);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
