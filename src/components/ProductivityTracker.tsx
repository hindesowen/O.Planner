import React, { useState, useEffect, useMemo } from 'react';
import { Assignment } from '../types';
import { isDateInCurrentWeek, getTagBadgeStyle } from '../utils/dateUtils';
import {
  Layers,
  Activity,
  CheckSquare2,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ProductivityTrackerProps {
  assignments: Assignment[];
  selectedTagFilter?: string;
  onSelectTagFilter?: (tag: string) => void;
  isHidden?: boolean;
  onToggleHidden?: () => void;
}

export const ProductivityTracker: React.FC<ProductivityTrackerProps> = ({
  assignments,
  selectedTagFilter,
  onSelectTagFilter,
  isHidden: externalIsHidden,
  onToggleHidden: externalOnToggleHidden,
}) => {
  // Local state with localStorage persistence
  const [internalHidden, setInternalHidden] = useState<boolean>(() => {
    return localStorage.getItem('planner_hide_productivity') === 'true';
  });

  const isHidden = externalIsHidden !== undefined ? externalIsHidden : internalHidden;

  const toggleHidden = () => {
    if (externalOnToggleHidden) {
      externalOnToggleHidden();
    } else {
      setInternalHidden((prev) => {
        const next = !prev;
        localStorage.setItem('planner_hide_productivity', String(next));
        return next;
      });
    }
  };

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.completed);
  const activeAssignments = assignments.filter((a) => !a.completed);

  // Overall Completion
  const overallPercentage =
    totalAssignments > 0
      ? Math.round((completedAssignments.length / totalAssignments) * 100)
      : 0;

  // This Week Metrics
  const thisWeekAssignments = assignments.filter((a) => isDateInCurrentWeek(a.dueDate));
  const thisWeekTotal = thisWeekAssignments.length;
  const thisWeekCompleted = thisWeekAssignments.filter((a) => a.completed).length;
  const thisWeekPercentage =
    thisWeekTotal > 0
      ? Math.round((thisWeekCompleted / thisWeekTotal) * 100)
      : 0;

  // Tag Breakdown: Tag name, color style, and task count (active/total)
  const tagStats = useMemo(() => {
    const stats: Record<
      string,
      {
        totalCount: number;
        activeCount: number;
      }
    > = {};

    assignments.forEach((a) => {
      (a.tags || []).forEach((t) => {
        const norm = t.toLowerCase().trim();
        if (!stats[norm]) {
          stats[norm] = {
            totalCount: 0,
            activeCount: 0,
          };
        }
        stats[norm].totalCount += 1;
        if (!a.completed) {
          stats[norm].activeCount += 1;
        }
      });
    });

    return Object.entries(stats).sort(
      (a, b) => b[1].activeCount - a[1].activeCount || b[1].totalCount - a[1].totalCount
    );
  }, [assignments]);

  // When hidden, render compact minimal strip with quick summary and Show button
  if (isHidden) {
    return (
      <div
        id="productivity-tracker-collapsed"
        className="apple-glass rounded-xl px-4 py-2.5 flex items-center justify-between shadow-md border border-white/[0.08] transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-md bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-2 font-mono-numbers text-xs truncate">
            <span className="font-heading font-bold text-zinc-300 text-xs tracking-wide">
              Productivity & Progress
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">
              <strong className="text-white font-semibold">{activeAssignments.length}</strong> active,{' '}
              <strong className="text-[#78BE06] font-semibold">{completedAssignments.length}</strong> done ({overallPercentage}%)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleHidden}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-heading font-semibold text-purple-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 rounded-lg transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Eye className="w-3.5 h-3.5 text-purple-400" />
          <span>Show Metrics</span>
        </button>
      </div>
    );
  }

  return (
    <section
      id="productivity-tracker-section"
      className="apple-glass rounded-xl p-4 sm:p-5 space-y-4 shadow-xl border border-white/[0.08] transition-all"
    >
      {/* Clean Metric Header with Hide Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="font-heading text-sm font-bold text-white tracking-wide">
            Productivity & Progress
          </span>
        </div>

        {/* Monospaced Status Counts & Hide Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3 font-mono-numbers text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <strong className="text-white font-bold">{activeAssignments.length}</strong> active
            </span>
            <span className="text-zinc-600">•</span>
            <span className="inline-flex items-center gap-1.5 text-zinc-400">
              <CheckSquare2 className="w-3.5 h-3.5 text-[#78BE06]" />
              <strong className="text-[#78BE06] font-bold">{completedAssignments.length}</strong> done
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">
              Rate: <strong className="text-white">{overallPercentage}%</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={toggleHidden}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-heading font-medium text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer shrink-0"
            title="Hide productivity and progress section"
          >
            <EyeOff className="w-3 h-3 text-zinc-400" />
            <span className="hidden xs:inline">Hide</span>
          </button>
        </div>
      </div>

      {/* Dual Linear Progress Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-1">
        {/* Track 1: This Week */}
        <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/[0.06] apple-glass">
          <div className="flex items-center justify-between font-mono-numbers text-xs">
            <span className="text-zinc-300 uppercase tracking-wider text-[11px] font-heading font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              THIS WEEK
            </span>
            <span className="text-purple-300 font-semibold text-[11px]">
              [{thisWeekCompleted} / {thisWeekTotal}] • {thisWeekPercentage}%
            </span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/[0.08] relative">
            <div
              className="h-full bg-gradient-to-r from-purple-700 to-purple-500 rounded-full transition-all duration-300 shadow-xs shadow-purple-500/50"
              style={{
                width: `${thisWeekTotal > 0 ? Math.max(thisWeekCompleted > 0 ? 5 : 0, thisWeekPercentage) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Track 2: All Assignments */}
        <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/[0.06] apple-glass">
          <div className="flex items-center justify-between font-mono-numbers text-xs">
            <span className="text-zinc-300 uppercase tracking-wider text-[11px] font-heading font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#78BE06]" />
              TOTAL TASKS
            </span>
            <span className="text-[#78BE06] font-semibold text-[11px]">
              [{completedAssignments.length} / {totalAssignments}] • {overallPercentage}%
            </span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-2 overflow-hidden border border-white/[0.08] relative">
            <div
              className="h-full bg-gradient-to-r from-[#78BE06] to-[#a3e635] rounded-full transition-all duration-300"
              style={{
                width: `${totalAssignments > 0 ? Math.max(completedAssignments.length > 0 ? 5 : 0, overallPercentage) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tag Filter Matrix */}
      <div className="pt-2 border-t border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-heading text-[11px] font-bold tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-zinc-400" />
            FILTER BY TAG
          </span>
          {selectedTagFilter && selectedTagFilter !== 'all' ? (
            <button
              type="button"
              onClick={() => onSelectTagFilter && onSelectTagFilter('all')}
              className="font-mono-numbers text-[10px] text-purple-400 hover:text-white uppercase tracking-wider underline cursor-pointer"
            >
              [Clear Filter]
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tagStats.length === 0 ? (
            <p className="text-xs text-zinc-500 font-mono-numbers">[No tags]</p>
          ) : (
            tagStats.map(([tag, stat]) => {
              const style = getTagBadgeStyle(tag);
              const isSelected = selectedTagFilter === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTagFilter && onSelectTagFilter(isSelected ? 'all' : tag)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono-numbers text-[11px] font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-700 text-white border-purple-500 shadow-sm shadow-purple-900/30'
                      : `${style.bg} ${style.text} ${style.border} hover:bg-white/[0.08]`
                  }`}
                  title={`${stat.activeCount} active tasks`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className="font-semibold uppercase">#{tag}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-black/40 text-zinc-400'
                    }`}
                  >
                    {stat.activeCount}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
