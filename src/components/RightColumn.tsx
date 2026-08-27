import React, { useState, useMemo } from 'react';
import { Assignment, ClassItem } from '../types';
import { AssignmentCard } from './AssignmentCard';
import { getTagBadgeStyle } from '../utils/dateUtils';
import { Tags, Sparkles, Filter, CheckCircle2, TrendingUp, Sparkle, Layers } from 'lucide-react';

interface RightColumnProps {
  assignments: Assignment[];
  classes: ClassItem[];
  onToggleComplete: (id: string) => void;
  onDeleteAssignment: (id: string) => void;
}

export const RightColumn: React.FC<RightColumnProps> = ({
  assignments,
  classes,
  onToggleComplete,
  onDeleteAssignment,
}) => {
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [hideCompletedInTags, setHideCompletedInTags] = useState<boolean>(true);

  // Map class lookup by ID
  const classMap = useMemo(() => {
    const map = new Map<string, ClassItem>();
    classes.forEach((c) => map.set(c.id, c));
    return map;
  }, [classes]);

  // Overall completion stats
  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => a.completed).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Extract all unique tags dynamically
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    assignments.forEach((a) => {
      if (a.tags && Array.isArray(a.tags)) {
        a.tags.forEach((t) => tagSet.add(t.toLowerCase().trim()));
      }
    });
    // Return sorted tags
    return Array.from(tagSet).sort();
  }, [assignments]);

  // Group assignments dynamically by tag
  const tagGroups = useMemo(() => {
    const groups: { [tag: string]: Assignment[] } = {};

    uniqueTags.forEach((tag) => {
      groups[tag] = [];
    });

    assignments.forEach((a) => {
      if (hideCompletedInTags && a.completed) {
        return; // skip completed if toggled
      }

      if (a.tags && Array.isArray(a.tags)) {
        a.tags.forEach((t) => {
          const norm = t.toLowerCase().trim();
          if (groups[norm]) {
            groups[norm].push(a);
          }
        });
      }
    });

    return groups;
  }, [assignments, uniqueTags, hideCompletedInTags]);

  // Filter groups if a specific tag is selected
  const displayedTags = useMemo(() => {
    if (selectedTagFilter === 'all') {
      return uniqueTags.filter((tag) => (tagGroups[tag] || []).length > 0);
    }
    return uniqueTags.filter((tag) => tag === selectedTagFilter);
  }, [uniqueTags, tagGroups, selectedTagFilter]);

  // Tag color mapping helper
  const getPillColor = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('writing') || t.includes('essay')) return 'bg-indigo-500';
    if (t.includes('photo') || t.includes('film') || t.includes('video')) return 'bg-emerald-500';
    if (t.includes('read') || t.includes('book')) return 'bg-amber-500';
    if (t.includes('easy') || t.includes('quick')) return 'bg-teal-500';
    if (t.includes('exam') || t.includes('quiz')) return 'bg-rose-500';
    if (t.includes('code') || t.includes('lab')) return 'bg-blue-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="space-y-6" id="right-column-tags">
      {/* Top Header & Tag Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Categorized View
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Automated workflow clustering by assignment tags & modalities
            </p>
          </div>

          {/* Toggle show/hide completed in tag view */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setHideCompletedInTags(!hideCompletedInTags)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                hideCompletedInTags
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {hideCompletedInTags ? 'Active Only' : 'Include Completed'}
            </button>
          </div>
        </div>

        {/* Tag Quick Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Tag Filter
          </span>

          <button
            type="button"
            onClick={() => setSelectedTagFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedTagFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({uniqueTags.length})
          </button>

          {uniqueTags.map((tag) => {
            const count = (tagGroups[tag] || []).length;
            const isSelected = selectedTagFilter === tag;
            const style = getTagBadgeStyle(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTagFilter(isSelected ? 'all' : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 bg-white ' + style.text + ' ' + style.border
                    : style.bg + ' ' + style.text + ' ' + style.border + ' hover:opacity-80'
                }`}
              >
                <span>#{tag}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/80 font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tag Blocks Grid & Productivity Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="tag-blocks-container">
        {displayedTags.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              No assignments found for this tag
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Add tags like "writing", "photo", "reading", "film", or "easy" when creating assignments.
            </p>
          </div>
        ) : (
          displayedTags.map((tag) => {
            const groupAssignments = tagGroups[tag] || [];
            const pillBg = getPillColor(tag);

            return (
              <div
                key={tag}
                id={`tag-group-block-${tag}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Tag Block Header with Vertical Accent Pill */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-2 h-5 ${pillBg} rounded-full flex-shrink-0`} />
                    <h3 className="font-bold text-slate-900 tracking-tight text-base capitalize">
                      {tag}
                    </h3>
                    <span className="ml-auto bg-slate-100 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {groupAssignments.length} {groupAssignments.length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>

                  {/* Assignments in this tag */}
                  <div className="space-y-2.5">
                    {groupAssignments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No active assignments currently tagged #{tag}
                      </p>
                    ) : (
                      groupAssignments.map((assignment) => (
                        <AssignmentCard
                          key={`${tag}-${assignment.id}`}
                          assignment={assignment}
                          classItem={classMap.get(assignment.classId)}
                          onToggleComplete={onToggleComplete}
                          onDelete={onDeleteAssignment}
                          compact={true}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="uppercase tracking-wider">Modality Cluster</span>
                  <span className="font-semibold text-slate-600">#{tag}</span>
                </div>
              </div>
            );
          })
        )}

        {/* Productivity Score & Study Momentum Card (From Professional Polish Theme) */}
        <div className="bg-indigo-900 p-5 rounded-2xl shadow-sm flex flex-col justify-between text-white col-span-1 md:col-span-2">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-800">
                Productivity Tracker
              </span>
              <span className="text-xs font-bold text-indigo-200">
                {completedCount} of {totalCount} Done
              </span>
            </div>

            <h4 className="font-bold text-white tracking-tight mb-1 text-base">
              Academic Momentum
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed max-w-xl">
              {completionPercentage >= 80
                ? 'Outstanding work! Almost all assignments for this study cycle are completed.'
                : completionPercentage >= 50
                ? 'Steady progress! You have completed over half your scheduled assignments.'
                : 'Stay focused! Track your due dates and check off tasks as you finish them.'}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-indigo-800/80">
            <div className="w-full bg-indigo-950 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, completionPercentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-indigo-300 font-bold tracking-wider uppercase">
              <span>Overall Completion</span>
              <span>{completionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
