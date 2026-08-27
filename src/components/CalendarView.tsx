import React, { useState, useMemo } from 'react';
import { Assignment, ClassItem } from '../types';
import { formatDueDate, downloadIcs } from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  CheckSquare2,
  Square,
  Download,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface CalendarViewProps {
  assignments: Assignment[];
  classes: ClassItem[];
  onToggleComplete: (id: string) => void;
  onOpenAddAssignment: (defaultDate?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  assignments,
  classes,
  onToggleComplete,
  onOpenAddAssignment,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);

  // Map class lookup by ID
  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  // Year & Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter assignments based on completion toggle
  const visibleAssignments = useMemo(() => {
    if (hideCompleted) {
      return assignments.filter((a) => !a.completed);
    }
    return assignments;
  }, [assignments, hideCompleted]);

  // Map assignments by date string "YYYY-MM-DD"
  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, Assignment[]>();

    visibleAssignments.forEach((a) => {
      if (!a.dueDate) return;
      const dateKey = a.dueDate.slice(0, 10); // YYYY-MM-DD
      const existing = map.get(dateKey) || [];
      existing.push(a);
      map.set(dateKey, existing);
    });

    return map;
  }, [visibleAssignments]);

  // Calendar Grid Days
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateKey: string }[] = [];

    // Previous month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      const dateKey = prevDate.toISOString().slice(0, 10);
      days.push({ date: prevDate, isCurrentMonth: false, dateKey });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      const dateKey = thisDate.toISOString().slice(0, 10);
      days.push({ date: thisDate, isCurrentMonth: true, dateKey });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateKey = nextDate.toISOString().slice(0, 10);
      days.push({ date: nextDate, isCurrentMonth: false, dateKey });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
  };

  // Assignments for the selected day
  const selectedDateKey = selectedDay ? selectedDay.toISOString().slice(0, 10) : '';
  const selectedDayAssignments = selectedDateKey ? assignmentsByDate.get(selectedDateKey) || [] : [];

  const handleExportAllIcs = () => {
    if (visibleAssignments.length === 0) return;
    const first = visibleAssignments[0];
    const cls = classMap.get(first.classId);
    downloadIcs(first.title, cls?.name || 'Class', first.dueDate, first.notes);
  };

  return (
    <div className="space-y-4" id="calendar-page-container">
      {/* Calendar Header & Controls: Swiss layout */}
      <div className="apple-glass p-4 sm:p-5 rounded-xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F35F98]/20 border border-[#F35F98]/40 text-[#F35F98] flex items-center justify-center font-bold">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-heading text-base sm:text-lg font-bold text-white">
                  Schedule & Timeline
                </h2>
                <span className="font-mono-numbers px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F35F98]/20 text-[#F35F98] border border-[#F35F98]/30">
                  {visibleAssignments.length} Scheduled
                </span>
              </div>
              <p className="font-mono-numbers text-[11px] text-zinc-400 mt-0.5">
                Monthly calendar & .ics sync
              </p>
            </div>
          </div>

          {/* Action and view buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-heading text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                hideCompleted
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  : 'bg-purple-950/50 text-purple-300 border-purple-500/30 hover:bg-purple-900/40'
              }`}
            >
              {hideCompleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideCompleted ? 'Done Hidden' : 'Showing Done'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllIcs}
              title="Download Apple Calendar .ics file with 24-hr reminder"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 font-heading text-xs font-semibold text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              <span>Export .ics</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAddAssignment(selectedDateKey)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 font-heading text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-lg shadow-md shadow-purple-900/40 border border-purple-500/50 transition-all cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>+ Add to Date</span>
            </button>
          </div>
        </div>

        {/* Month Navigation Row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
          <div className="flex items-center gap-3">
            <h3 className="font-heading text-base font-bold uppercase tracking-wider text-white">
              {monthName}
            </h3>
            <button
              type="button"
              onClick={handleToday}
              className="font-mono-numbers px-2 py-0.5 text-[11px] font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 rounded border border-purple-500/40 transition-all cursor-pointer uppercase"
            >
              [TODAY]
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Calendar Section (Grid + Selected Day Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Grid (2 Cols on lg) */}
        <div className="lg:col-span-2 apple-glass p-4 sm:p-5 rounded-xl shadow-xl space-y-3">
          {/* Day of Week Headers - Swiss Stark Typographic Design */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono-numbers text-[10px] font-bold uppercase tracking-widest text-zinc-400 py-1 border-b border-white/[0.08]">
            <span>SUN</span>
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map(({ date, isCurrentMonth, dateKey }) => {
              const dayAssignments = assignmentsByDate.get(dateKey) || [];
              const isToday = new Date().toISOString().slice(0, 10) === dateKey;
              const isSelected = selectedDateKey === dateKey;

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDay(date)}
                  className={`min-h-[80px] sm:min-h-[95px] p-1.5 sm:p-2 rounded-md border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-1 ring-purple-500 bg-purple-950/50 border-purple-500/60 shadow-md shadow-purple-950/50'
                      : isToday
                      ? 'bg-purple-950/25 border-purple-400/40'
                      : isCurrentMonth
                      ? 'bg-zinc-950/60 border-white/[0.06] hover:border-white/20 hover:bg-zinc-900/60'
                      : 'bg-black/30 border-transparent text-zinc-700 opacity-25'
                  }`}
                >
                  {/* Day number header */}
                  <div className="flex items-center justify-between font-mono-numbers">
                    <span
                      className={`text-[11px] font-semibold inline-flex items-center justify-center w-5 h-5 rounded-xs ${
                        isToday
                          ? 'bg-purple-400 text-zinc-950 font-bold'
                          : isSelected
                          ? 'bg-purple-600 text-white font-bold'
                          : isCurrentMonth
                          ? 'text-zinc-300'
                          : 'text-zinc-600'
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayAssignments.length > 0 ? (
                      <span className="text-[9px] font-bold text-zinc-400 bg-white/[0.04] px-1 rounded">
                        {dayAssignments.length}
                      </span>
                    ) : null}
                  </div>

                  {/* Assignment mini badges */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayAssignments.slice(0, 2).map((a) => {
                      const cls = classMap.get(a.classId);
                      return (
                        <div
                          key={a.id}
                          className={`text-[9px] font-mono-numbers px-1 py-0.2 rounded-xs truncate font-medium flex items-center gap-1 ${
                            a.completed
                              ? 'line-through bg-zinc-900 text-zinc-600'
                              : 'text-zinc-200 bg-black/50 border border-white/[0.06]'
                          }`}
                          title={a.title}
                        >
                          <span
                            className="w-1 h-1 rounded-xs flex-shrink-0"
                            style={{ backgroundColor: cls?.color || '#3B82F6' }}
                          />
                          <span className="truncate">{a.title}</span>
                        </div>
                      );
                    })}
                    {dayAssignments.length > 2 ? (
                      <span className="text-[8px] text-zinc-500 font-mono-numbers font-semibold block text-right">
                        +{dayAssignments.length - 2} MORE
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Details Panel (1 Col on lg) */}
        <div className="apple-glass p-4 sm:p-5 rounded-xl shadow-xl space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
            <div>
              <h3 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                {selectedDay
                  ? selectedDay.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Select a Day'}
              </h3>
              <p className="font-mono-numbers text-[10px] text-zinc-500 mt-0.5">
                [{selectedDayAssignments.length} TASKS LOGGED]
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenAddAssignment(selectedDateKey)}
              className="px-2.5 py-1 bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-500/40 rounded-md font-heading text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3 h-3" />
              <span>+ ADD</span>
            </button>
          </div>

          {/* Assignments Due on Selected Day */}
          <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
            {selectedDayAssignments.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs italic font-mono-numbers">
                <Sparkles className="w-5 h-5 mx-auto mb-2 text-zinc-600" />
                <span>[NO TASKS SCHEDULED FOR DATE]</span>
              </div>
            ) : (
              selectedDayAssignments.map((a) => {
                const cls = classMap.get(a.classId);
                const { text: dueText } = formatDueDate(a.dueDate);

                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border transition-all ${
                      a.completed
                        ? 'bg-zinc-950/40 border-white/[0.04] opacity-50'
                        : 'bg-zinc-950/70 border-white/[0.08] hover:border-white/20 shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(a.id)}
                        className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        {a.completed ? (
                          <CheckSquare2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        {cls ? (
                          <span
                            className="inline-flex items-center gap-1 font-mono-numbers text-[10px] font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: cls.color }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-xs"
                              style={{ backgroundColor: cls.color }}
                            />
                            <span>[{cls.code || cls.name}]</span>
                          </span>
                        ) : null}

                        <h4
                          className={`text-xs font-semibold truncate ${
                            a.completed ? 'line-through text-zinc-500' : 'text-white font-heading'
                          }`}
                        >
                          {a.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1 font-mono-numbers text-[10px] text-zinc-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>{dueText}</span>
                          </span>
                          {a.estimatedTime ? (
                            <span className="text-zinc-500">• {a.estimatedTime}</span>
                          ) : null}
                        </div>

                        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              downloadIcs(
                                a.title,
                                cls?.name || 'Class',
                                a.dueDate,
                                a.notes
                              )
                            }
                            className="font-mono-numbers text-[10px] text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 cursor-pointer uppercase"
                          >
                            <Download className="w-3 h-3" />
                            <span>[.ICS SYNC ALARM]</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
