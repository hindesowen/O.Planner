import React, { useState, useMemo } from 'react';
import { Assignment, ClassItem, SortBy, SortOrder } from '../types';
import { AssignmentCard } from './AssignmentCard';
import {
  ArrowUpDown,
  CheckCircle2,
  ListFilter,
  Search,
  ChevronDown,
  ChevronRight,
  ListTodo,
  Sparkles,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

interface LeftColumnProps {
  assignments: Assignment[];
  classes: ClassItem[];
  onToggleComplete: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
  onOpenAddAssignment: () => void;
}

export const LeftColumn: React.FC<LeftColumnProps> = ({
  assignments,
  classes,
  onToggleComplete,
  onDeleteAssignment,
  onOpenAddAssignment,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCompletedExpanded, setIsCompletedExpanded] = useState<boolean>(true);

  // Map class lookup by ID
  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  // Active assignments
  const activeAssignments = useMemo(() => {
    return assignments.filter((a) => !a.completed);
  }, [assignments]);

  // Completed assignments
  const completedAssignments = useMemo(() => {
    return assignments.filter((a) => a.completed);
  }, [assignments]);

  // Filtered & Sorted active assignments
  const sortedAndFilteredActive = useMemo(() => {
    let result = [...activeAssignments];

    // Filter by class
    if (selectedClassId !== 'all') {
      result = result.filter((a) => a.classId === selectedClassId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.notes.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'dueDate') {
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      } else if (sortBy === 'class') {
        const classA = classMap.get(a.classId)?.name || '';
        const classB = classMap.get(b.classId)?.name || '';
        const cmp = classA.localeCompare(classB);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
      return 0;
    });

    return result;
  }, [activeAssignments, selectedClassId, searchQuery, sortBy, sortOrder, classMap]);

  return (
    <div className="space-y-6" id="left-column-assignments">
      {/* Top Header & Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Assignment List
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {activeAssignments.length} active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Sortable assignment feed & quick completion checklist
            </p>
          </div>

          {/* Sort Controls (Class vs Due Date) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
            <span className="text-[11px] font-semibold text-slate-400 pl-2 pr-1 uppercase tracking-wider hidden md:inline">
              Sort
            </span>
            
            <button
              id="sort-btn-due-date"
              type="button"
              onClick={() => {
                if (sortBy === 'dueDate') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('dueDate');
                  setSortOrder('asc');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                sortBy === 'dueDate'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Due Date</span>
              {sortBy === 'dueDate' && (
                <ArrowUpDown className="w-3 h-3 ml-0.5 text-indigo-500" />
              )}
            </button>

            <button
              id="sort-btn-class"
              type="button"
              onClick={() => {
                if (sortBy === 'class') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('class');
                  setSortOrder('asc');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                sortBy === 'class'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Class</span>
              {sortBy === 'class' && (
                <ArrowUpDown className="w-3 h-3 ml-0.5 text-indigo-500" />
              )}
            </button>
          </div>
        </div>

        {/* Filter by class & Search row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-3 border-t border-slate-100">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="search-assignments-input"
              placeholder="Search title, notes, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-class-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:bg-white"
            >
              <option value="all">All Classes ({classes.length})</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.code ? `${cls.code} - ${cls.name}` : cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Full Assignments List */}
      <div className="space-y-3.5" id="active-assignments-list">
        {sortedAndFilteredActive.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {searchQuery || selectedClassId !== 'all'
                ? 'No matching assignments found'
                : 'All caught up! No active assignments.'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery
                ? 'Try adjusting your search terms or filters.'
                : 'Click "+ New Assignment" above to plan your next task.'}
            </p>
            <button
              onClick={onOpenAddAssignment}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              + Create Assignment
            </button>
          </div>
        ) : (
          sortedAndFilteredActive.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              classItem={classMap.get(assignment.classId)}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteAssignment}
            />
          ))
        )}
      </div>

      {/* Simple Checklist Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4" id="simple-checklist-section">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Simple Quick Checklist</h3>
              <p className="text-[11px] text-slate-500">
                Check off items to instantly move them to Completed
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500 px-2 py-0.5 bg-slate-100 rounded-full">
            {activeAssignments.length} pending
          </span>
        </div>

        {/* Rapid Checklist Items */}
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {activeAssignments.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 italic">
              All checklist items are completed!
            </div>
          ) : (
            activeAssignments.map((a) => {
              const cls = classMap.get(a.classId);
              return (
                <label
                  key={a.id}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={a.completed}
                    onChange={() => onToggleComplete(a.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                  />
                  <span className="flex-1 font-medium text-slate-800 truncate">
                    {a.title}
                  </span>
                  {cls && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${cls.color}15`,
                        color: cls.color,
                      }}
                    >
                      {cls.code || cls.name}
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Completed List (Expandable) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3" id="completed-assignments-section">
        <button
          type="button"
          onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
          className="w-full flex items-center justify-between text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Completed List ({completedAssignments.length})
            </h3>
          </div>
          <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
            <span className="text-xs font-medium">{isCompletedExpanded ? 'Hide' : 'Show'}</span>
            {isCompletedExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </button>

        {isCompletedExpanded && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {completedAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">
                No completed assignments yet. Check an item off to see it here!
              </p>
            ) : (
              completedAssignments.map((assignment) => {
                const cls = classMap.get(assignment.classId);
                return (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleComplete(assignment.id)}
                        className="text-emerald-600 hover:text-slate-400 transition-colors cursor-pointer"
                        title="Uncheck to restore"
                      >
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      </button>
                      <span className="line-through text-slate-400 font-medium truncate">
                        {assignment.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {cls && (
                        <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                          {cls.code}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onToggleComplete(assignment.id)}
                        title="Restore to active list"
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteAssignment(assignment.id)}
                        title="Delete permanently"
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
