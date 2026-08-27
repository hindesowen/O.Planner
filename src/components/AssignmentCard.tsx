import React, { useState } from 'react';
import { Assignment, ClassItem, AssignmentStep } from '../types';
import { formatDueDate, getTagBadgeStyle, getTimeRemainingInfo, downloadIcs } from '../utils/dateUtils';
import {
  CheckSquare,
  Square,
  Calendar,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CalendarPlus,
  FileText,
} from 'lucide-react';

interface AssignmentCardProps {
  assignment: Assignment;
  classItem?: ClassItem;
  onToggleComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (assignment: Assignment) => void;
  onAdvanceStep?: (id: string) => void;
  onToggleStep?: (assignmentId: string, stepId: string) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  classItem,
  onToggleComplete,
  onDelete,
  onEdit,
  onAdvanceStep,
  onToggleStep,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { text: dueText, isOverdue, isToday } = formatDueDate(assignment.dueDate);
  const timeInfo = getTimeRemainingInfo(assignment.dueDate);

  const hasSteps = Boolean(assignment.steps && assignment.steps.length > 0);
  const steps: AssignmentStep[] = assignment.steps || [];
  const completedStepsCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;

  // Active step index
  const currentStepIndex = steps.findIndex((s) => !s.completed);
  const currentStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

  // Single main tag (only the first tag)
  const mainTag = assignment.tags && assignment.tags.length > 0 ? assignment.tags[0] : null;
  const mainTagStyle = mainTag ? getTagBadgeStyle(mainTag) : null;

  const handleExportIcs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const className = classItem ? (classItem.code ? `${classItem.code} - ${classItem.name}` : classItem.name) : 'General';
    downloadIcs(assignment.title, className, assignment.dueDate, assignment.notes);
  };

  const renderNotesWithLinks = (notesText: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = notesText.split(urlRegex);

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={`link-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-0.5 break-all"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 inline-block ml-0.5 flex-shrink-0" />
          </a>
        );
      }
      return <span key={`text-${index}`}>{part}</span>;
    });
  };

  return (
    <div
      id={`assignment-item-${assignment.id}`}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`group rounded-lg border transition-all duration-150 cursor-pointer overflow-hidden apple-glass-hover ${
        assignment.completed
          ? 'bg-zinc-950/40 border-white/[0.04] opacity-50 hover:opacity-75'
          : timeInfo.isOverdue
          ? 'bg-zinc-950/85 border-red-500/30 hover:border-red-500/50 shadow-md shadow-red-950/20'
          : 'bg-zinc-950/70 border-white/[0.08] hover:border-white/20'
      }`}
    >
      {/* Precision Single-Plane Row */}
      <div className="px-3.5 py-3 flex items-center justify-between gap-3">
        {/* Left: Square Toggle + Course & Task Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Bauhaus Utilitarian Square Action Checkbox */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(assignment.id);
            }}
            className="text-zinc-500 hover:text-purple-400 transition-colors focus:outline-hidden flex-shrink-0 cursor-pointer p-0.5"
            title={assignment.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {assignment.completed ? (
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <Square className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
            )}
          </button>

          {/* Stacked Content */}
          <div className="min-w-0 flex-1">
            {/* Course label on top line */}
            <div className="flex items-center gap-2 leading-none mb-1">
              {classItem ? (
                <span
                  className="font-mono-numbers text-[10px] font-bold uppercase tracking-wider truncate flex items-center gap-1.5"
                  style={{ color: classItem.color || '#A855F7' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-xs flex-shrink-0"
                    style={{ backgroundColor: classItem.color || '#A855F7' }}
                  />
                  <span>[{classItem.code || classItem.name}]</span>
                </span>
              ) : (
                <span className="font-mono-numbers text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  [GENERAL]
                </span>
              )}

              {/* Multi-step indicator */}
              {hasSteps ? (
                <span className="font-mono-numbers text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5" />
                  <span>STEP {completedStepsCount}/{totalSteps}</span>
                </span>
              ) : null}
            </div>

            {/* Task Title */}
            <h3
              className={`text-xs sm:text-sm font-semibold truncate tracking-tight ${
                assignment.completed ? 'line-through text-zinc-500' : 'text-zinc-100 font-heading'
              }`}
              title={assignment.title}
            >
              {assignment.title}
            </h3>
          </div>
        </div>

        {/* Right Side: Precision Time Remaining + Main Tag + Chevron */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Time Remaining Metric with Precision Micro Gauge */}
          {!assignment.completed ? (
            <div
              className="flex items-center gap-1.5 font-mono-numbers"
              title={`Deadline status: ${timeInfo.badgeText}`}
            >
              {/* Micro Precision Progress Track */}
              <div className="w-8 sm:w-12 bg-zinc-900 rounded-xs h-1 overflow-hidden border border-white/[0.08]">
                <div
                  className={`h-full ${timeInfo.colorClass} rounded-xs transition-all duration-300`}
                  style={{ width: `${timeInfo.percentage}%` }}
                />
              </div>

              {/* Time Remaining monospaced badge */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold ${
                  timeInfo.isOverdue
                    ? 'text-red-400'
                    : timeInfo.diffHours <= 8
                    ? 'text-red-400'
                    : timeInfo.diffHours <= 12
                    ? 'text-amber-400'
                    : timeInfo.diffHours <= 24
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                {timeInfo.badgeText}
              </span>
            </div>
          ) : null}

          {/* Due Date (Swiss style) */}
          <div
            className={`hidden md:inline-flex items-center gap-1 font-mono-numbers text-[10px] sm:text-[11px] px-2 py-0.5 rounded ${
              assignment.completed
                ? 'text-zinc-600'
                : isOverdue
                ? 'text-red-400 font-bold bg-red-500/10'
                : isToday
                ? 'text-amber-300 font-semibold bg-amber-500/10'
                : 'text-zinc-400'
            }`}
          >
            <Calendar className="w-3 h-3 opacity-60" />
            <span className="truncate max-w-[130px]">{dueText}</span>
          </div>

          {/* Main Tag (Swiss monospaced pill) */}
          {mainTag && mainTagStyle ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono-numbers text-[10px] font-semibold border ${mainTagStyle.bg} ${mainTagStyle.text} ${mainTagStyle.border}`}
            >
              <span className={`w-1 h-1 rounded-full ${mainTagStyle.dot}`} />
              <span className="uppercase">#{mainTag}</span>
            </span>
          ) : null}

          {/* Expand / Collapse Chevron */}
          <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors p-0.5">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Utilitarian Detail Panel */}
      {isExpanded ? (
        <div
          className="px-4 py-3 bg-black/50 border-t border-white/[0.08] space-y-3 animate-in fade-in-50 duration-150 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Notes Section */}
          {assignment.notes ? (
            <div className="text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-lg border border-white/[0.08] leading-relaxed break-words">
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-zinc-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 font-normal">{renderNotesWithLinks(assignment.notes)}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic font-mono-numbers">[NO INSTRUCTIONS RECORDED]</p>
          )}

          {/* Multi-Step Projects Workflow & Milestone Timeline */}
          {hasSteps ? (
            <div className="p-3 bg-zinc-900/60 rounded-lg border border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    <span>MILESTONE PHASES ({completedStepsCount}/{totalSteps})</span>
                  </span>
                </div>

                {/* Advance Step Action Button */}
                {!assignment.completed && currentStep && onAdvanceStep ? (
                  <button
                    type="button"
                    onClick={() => onAdvanceStep(assignment.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-md text-xs font-heading font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                  >
                    <span>NEXT PHASE</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : null}
              </div>

              {/* Milestone Progress Bar */}
              <div className="w-full bg-zinc-950 rounded-xs h-1.5 overflow-hidden border border-white/[0.08]">
                <div
                  className="h-full bg-purple-500 rounded-xs transition-all duration-300 shadow-xs shadow-purple-500/50"
                  style={{ width: `${(completedStepsCount / totalSteps) * 100}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="space-y-1.5 pt-1">
                {steps.map((step, idx) => {
                  const isStepCurrent = currentStepIndex === idx;
                  const stepDue = step.dueDate ? formatDueDate(step.dueDate) : null;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between gap-2 p-2 rounded-md text-xs transition-all ${
                        step.completed
                          ? 'bg-zinc-950/40 text-zinc-500'
                          : isStepCurrent
                          ? 'bg-purple-950/50 border border-purple-500/40 text-purple-100'
                          : 'bg-zinc-950/70 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleStep && onToggleStep(assignment.id, step.id)}
                          className="text-zinc-500 hover:text-purple-400 transition-colors cursor-pointer"
                        >
                          {step.completed ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="font-mono-numbers font-bold text-[10px] text-zinc-500">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span
                          className={`truncate font-medium ${
                            step.completed ? 'line-through text-zinc-500' : 'text-zinc-200'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>

                      {stepDue ? (
                        <span
                          className={`font-mono-numbers text-[10px] px-2 py-0.5 rounded ${
                            stepDue.isOverdue && !step.completed
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {stepDue.text}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Full Meta & Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08] text-xs">
            {/* Meta tags & details */}
            <div className="flex flex-wrap items-center gap-2 font-mono-numbers">
              <span className="text-zinc-400 flex items-center gap-1 font-medium text-[11px]">
                <Calendar className="w-3 h-3 text-purple-400" />
                <span>{dueText}</span>
              </span>

              {assignment.estimatedTime ? (
                <span className="text-zinc-400 flex items-center gap-1 font-medium text-[11px]">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>EST: {assignment.estimatedTime}</span>
                </span>
              ) : null}

              {/* All Tags */}
              {assignment.tags && assignment.tags.length > 1 ? (
                <div className="flex flex-wrap items-center gap-1">
                  {assignment.tags.map((tag) => {
                    const style = getTagBadgeStyle(tag);
                    return (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${style.bg} ${style.text} ${style.border}`}
                      >
                        <span>#{tag}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* Actions: Export .ics, Edit, Delete */}
            <div className="flex items-center gap-1.5 ml-auto font-heading">
              <button
                type="button"
                onClick={handleExportIcs}
                title="Export .ics with 24-hr reminder"
                className="px-2.5 py-1 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <CalendarPlus className="w-3 h-3 text-blue-400" />
                <span>.ICS SYNC</span>
              </button>

              {onEdit ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(assignment);
                  }}
                  className="px-2.5 py-1 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-md text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Edit className="w-3 h-3 text-zinc-400" />
                  <span>EDIT</span>
                </button>
              ) : null}

              {onDelete ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(assignment.id);
                  }}
                  className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
