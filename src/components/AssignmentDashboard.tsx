import React, { useState, useMemo } from 'react';
import { Assignment, ClassItem } from '../types';
import { AssignmentCard } from './AssignmentCard';
import {
  Search,
  Filter,
  CheckSquare2,
  Sparkles,
  BookOpen,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AssignmentDashboardProps {
  assignments: Assignment[];
  classes: ClassItem[];
  onToggleComplete: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onEditAssignment: (assignment: Assignment) => void;
  onAdvanceStep: (id: string) => void;
  onToggleStep: (assignmentId: string, stepId: string) => void;
  onOpenAddAssignment?: (dueDate?: string) => void;
  selectedTagFilter: string;
  onSelectTagFilter: (tag: string) => void;
}

export const AssignmentDashboard: React.FC<AssignmentDashboardProps> = ({
  assignments,
  classes,
  onToggleComplete,
  onDeleteAssignment,
  onEditAssignment,
  onAdvanceStep,
  onToggleStep,
  selectedTagFilter,
  onSelectTagFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [showCompletedSection, setShowCompletedSection] = useState<boolean>(true);

  // Extract all unique tags present across all assignments
  const allAvailableTags = useMemo(() => {
    const tagSet = new Set<string>();
    assignments.forEach((a) => {
      (a.tags || []).forEach((t) => tagSet.add(t.toLowerCase().trim()));
    });
    return Array.from(tagSet).sort();
  }, [assignments]);

  // Filtering & Sorting Logic (Always sorted by due date ascending)
  const filteredAndSortedAssignments = useMemo(() => {
    return assignments
      .filter((a) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchNotes = a.notes.toLowerCase().includes(q);
          const matchTags = (a.tags || []).some((t) => t.toLowerCase().includes(q));
          const matchSteps = (a.steps || []).some((s) => s.title.toLowerCase().includes(q));
          const cls = classes.find((c) => c.id === a.classId);
          const matchClass = cls
            ? cls.name.toLowerCase().includes(q) || (cls.code && cls.code.toLowerCase().includes(q))
            : false;

          if (!matchTitle && !matchNotes && !matchTags && !matchSteps && !matchClass) {
            return false;
          }
        }

        // Class Filter dropdown
        if (selectedClassId !== 'all' && a.classId !== selectedClassId) {
          return false;
        }

        // Project Type / Tag Filter dropdown
        if (selectedTagFilter !== 'all' && selectedTagFilter) {
          const hasTag = (a.tags || []).some(
            (t) => t.toLowerCase().trim() === selectedTagFilter.toLowerCase().trim()
          );
          if (!hasTag) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Always sorted by due date ascending (earliest first)
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return timeA - timeB;
      });
  }, [assignments, searchQuery, selectedClassId, selectedTagFilter, classes]);

  const activeFiltered = filteredAndSortedAssignments.filter((a) => !a.completed);
  const completedFiltered = filteredAndSortedAssignments.filter((a) => a.completed);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedClassId('all');
    onSelectTagFilter('all');
  };

  const isAnyFilterActive =
    searchQuery.trim() !== '' ||
    selectedClassId !== 'all' ||
    (selectedTagFilter !== 'all' && Boolean(selectedTagFilter));

  return (
    <div className="space-y-3" id="assignment-dashboard-container">
      {/* Utilitarian Swiss Filter Bar */}
      <div className="apple-glass rounded-lg p-2 sm:p-2.5 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {/* Small Search Bar with Utilitarian Monospaced Placeholder */}
          <div className="relative flex-1 min-w-[160px] sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH TASKS / TAGS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] rounded-md text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium uppercase"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            ) : null}
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex-1 min-w-[130px] sm:max-w-[190px]">
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full pl-2.5 pr-7 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] text-zinc-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium cursor-pointer appearance-none truncate uppercase"
              >
                <option value="all" className="bg-zinc-900">
                  ALL COURSES ({assignments.length})
                </option>
                {classes.map((cls) => {
                  const count = assignments.filter((a) => a.classId === cls.id).length;
                  return (
                    <option key={cls.id} value={cls.id} className="bg-zinc-900">
                      {cls.code ? `[${cls.code}]` : cls.name} ({count})
                    </option>
                  );
                })}
              </select>
              <BookOpen className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Tag Filter Dropdown */}
          <div className="flex-1 min-w-[120px] sm:max-w-[160px]">
            <div className="relative">
              <select
                value={selectedTagFilter || 'all'}
                onChange={(e) => onSelectTagFilter(e.target.value)}
                className="w-full pl-2.5 pr-7 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] text-zinc-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium cursor-pointer appearance-none truncate uppercase"
              >
                <option value="all" className="bg-zinc-900">
                  ALL TAGS
                </option>
                {allAvailableTags.map((tag) => {
                  const count = assignments.filter((a) =>
                    (a.tags || []).some((t) => t.toLowerCase().trim() === tag)
                  ).length;
                  return (
                    <option key={tag} value={tag} className="bg-zinc-900">
                      #{tag} ({count})
                    </option>
                  );
                })}
              </select>
              <Filter className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Reset Filters inline if any filter active */}
          {isAnyFilterActive ? (
            <button
              type="button"
              onClick={resetAllFilters}
              className="font-mono-numbers text-xs text-purple-400 hover:text-purple-300 uppercase tracking-wider underline px-2 py-1 cursor-pointer whitespace-nowrap"
            >
              [CLEAR]
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Condensed Assignments List */}
      <div className="space-y-1.5" id="main-assignments-stream">
        {/* Active Assignments Section */}
        {activeFiltered.length === 0 && completedFiltered.length === 0 ? (
          <div className="apple-glass rounded-lg p-8 text-center space-y-2">
            <Sparkles className="w-6 h-6 text-purple-400/60 mx-auto" />
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
              NO TASKS MATCH QUERY
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-mono-numbers">
              {isAnyFilterActive
                ? 'Adjust active query parameter or filters.'
                : 'Task queue empty. Click "+ New Task" in the top bar to populate.'}
            </p>
            {isAnyFilterActive ? (
              <button
                type="button"
                onClick={resetAllFilters}
                className="mt-2 px-3 py-1.5 font-mono-numbers text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white rounded-md transition-all cursor-pointer border border-white/10 uppercase"
              >
                [RESET FILTERS]
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Active Items */}
            {activeFiltered.map((assignment) => {
              const classItem = classes.find((c) => c.id === assignment.classId);
              return (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  classItem={classItem}
                  onToggleComplete={onToggleComplete}
                  onDelete={onDeleteAssignment}
                  onEdit={onEditAssignment}
                  onAdvanceStep={onAdvanceStep}
                  onToggleStep={onToggleStep}
                />
              );
            })}

            {/* Completed Section (Collapsible) */}
            {completedFiltered.length > 0 ? (
              <div className="pt-2 space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowCompletedSection(!showCompletedSection)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-zinc-950/40 hover:bg-zinc-900/60 border border-white/[0.06] rounded-lg font-heading text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COMPLETED ARCHIVE ({completedFiltered.length})</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono-numbers text-[10px] text-zinc-500">
                    <span>{showCompletedSection ? '[COLLAPSE]' : '[EXPAND]'}</span>
                    {showCompletedSection ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </button>

                {showCompletedSection ? (
                  <div className="space-y-1.5">
                    {completedFiltered.map((assignment) => {
                      const classItem = classes.find((c) => c.id === assignment.classId);
                      return (
                        <AssignmentCard
                          key={assignment.id}
                          assignment={assignment}
                          classItem={classItem}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDeleteAssignment}
                          onEdit={onEditAssignment}
                          onAdvanceStep={onAdvanceStep}
                          onToggleStep={onToggleStep}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
