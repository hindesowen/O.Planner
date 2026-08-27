import React, { useState, useEffect } from 'react';
import { ClassItem, Assignment, AssignmentStep } from '../types';
import { AVAILABLE_TAGS } from '../data/dummyData';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Tag as TagIcon,
  FileText,
  Layers,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onSaveAssignment: (assignment: Omit<Assignment, 'createdAt'> & { createdAt?: string }) => void;
  onOpenAddClass: () => void;
  initialAssignment?: Assignment | null; // If provided, edit mode
  initialDueDate?: string;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  classes,
  onSaveAssignment,
  onOpenAddClass,
  initialAssignment,
  initialDueDate,
}) => {
  if (!isOpen) return null;

  const isEditMode = Boolean(initialAssignment);

  const getDefaultDateTime = () => {
    if (initialDueDate && initialDueDate.length === 10) {
      return `${initialDueDate}T23:59`;
    }
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(initialAssignment?.title || '');
  const [classId, setClassId] = useState(initialAssignment?.classId || classes[0]?.id || '');
  const [dueDate, setDueDate] = useState(initialAssignment?.dueDate || getDefaultDateTime());
  const [notes, setNotes] = useState(initialAssignment?.notes || '');
  const [estimatedTime, setEstimatedTime] = useState(initialAssignment?.estimatedTime || '1.5 hours');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialAssignment?.tags || ['writing']);
  const [customTagInput, setCustomTagInput] = useState('');
  
  // Step-based workflow state
  const [hasSteps, setHasSteps] = useState<boolean>(
    Boolean(initialAssignment?.steps && initialAssignment.steps.length > 0)
  );
  const [steps, setSteps] = useState<AssignmentStep[]>(
    initialAssignment?.steps && initialAssignment.steps.length > 0
      ? initialAssignment.steps
      : [
          { id: `step-${Date.now()}-1`, title: 'Initial draft / outline', completed: false },
          { id: `step-${Date.now()}-2`, title: 'Final review & submission', completed: false },
        ]
  );
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDueDate, setNewStepDueDate] = useState('');

  // Re-sync if initialAssignment changes
  useEffect(() => {
    if (initialAssignment) {
      setTitle(initialAssignment.title);
      setClassId(initialAssignment.classId);
      setDueDate(initialAssignment.dueDate);
      setNotes(initialAssignment.notes || '');
      setEstimatedTime(initialAssignment.estimatedTime || '1.5 hours');
      setSelectedTags(initialAssignment.tags || []);
      if (initialAssignment.steps && initialAssignment.steps.length > 0) {
        setHasSteps(true);
        setSteps(initialAssignment.steps);
      } else {
        setHasSteps(false);
        setSteps([
          { id: `step-${Date.now()}-1`, title: 'Initial draft / outline', completed: false },
          { id: `step-${Date.now()}-2`, title: 'Final review & submission', completed: false },
        ]);
      }
    } else {
      setTitle('');
      setClassId(classes[0]?.id || '');
      setDueDate(getDefaultDateTime());
      setNotes('');
      setEstimatedTime('1.5 hours');
      setSelectedTags(['writing']);
      setHasSteps(false);
      setSteps([
        { id: `step-${Date.now()}-1`, title: 'Initial draft / outline', completed: false },
        { id: `step-${Date.now()}-2`, title: 'Final review & submission', completed: false },
      ]);
    }
  }, [initialAssignment, isOpen, classes]);

  const timePresets = ['30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours', '3 hours', '4+ hours'];

  const toggleTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (selectedTags.includes(normalized)) {
      setSelectedTags(selectedTags.filter((t) => t !== normalized));
    } else {
      setSelectedTags([...selectedTags, normalized]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const normalized = customTagInput.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (normalized && !selectedTags.includes(normalized)) {
      setSelectedTags([...selectedTags, normalized]);
    }
    setCustomTagInput('');
  };

  // Step Management Handlers
  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    const newStep: AssignmentStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newStepTitle.trim(),
      dueDate: newStepDueDate ? newStepDueDate : undefined,
      completed: false,
    };
    setSteps([...steps, newStep]);
    setNewStepTitle('');
    setNewStepDueDate('');
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter((s) => s.id !== stepId));
  };

  const handleUpdateStepTitle = (stepId: string, text: string) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, title: text } : s)));
  };

  const handleUpdateStepDueDate = (stepId: string, d: string) => {
    setSteps(steps.map((s) => (s.id === stepId ? { ...s, dueDate: d || undefined } : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    // Filter non-empty steps if hasSteps is enabled
    const validSteps = hasSteps ? steps.filter((s) => s.title.trim() !== '') : undefined;

    // If all steps are completed, mark assignment completed
    const allStepsCompleted = Boolean(
      validSteps && validSteps.length > 0 && validSteps.every((s) => s.completed)
    );

    const assignmentData: Omit<Assignment, 'createdAt'> & { createdAt?: string } = {
      id: initialAssignment ? initialAssignment.id : `asg-${Date.now()}`,
      title: title.trim(),
      classId,
      dueDate,
      notes: notes.trim(),
      estimatedTime: estimatedTime.trim(),
      tags: selectedTags,
      completed: initialAssignment ? (hasSteps ? allStepsCompleted : initialAssignment.completed) : false,
      completedAt: initialAssignment?.completedAt,
      createdAt: initialAssignment?.createdAt,
      steps: validSteps && validSteps.length > 0 ? validSteps : undefined,
    };

    onSaveAssignment(assignmentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="apple-glass bg-zinc-950/95 w-full max-w-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden my-8"
        id="assignment-modal"
      >
        {/* Modal Header: Bauhaus Utilitarian Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-black/40">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
              {isEditMode ? <FileText className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                {isEditMode ? 'EDIT TASK ENTRY' : 'NEW TASK SPECIFICATION'}
              </h2>
              <p className="font-mono-numbers text-[10px] text-zinc-400">
                COURSEWORK // MILESTONES // .ICS TIMING
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Assignment Title */}
          <div>
            <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
              ASSIGNMENT TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Essay Draft Outline or Photo Shoot #3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-black/60 border border-white/[0.08] text-white rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium placeholder:text-zinc-600"
            />
          </div>

          {/* Linked Class Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                LINKED COURSE *
              </label>
              <button
                type="button"
                onClick={onOpenAddClass}
                className="font-mono-numbers text-[11px] text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 cursor-pointer uppercase"
              >
                <Plus className="w-3 h-3" /> <span>[NEW COURSE]</span>
              </button>
            </div>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] text-white rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-zinc-900 text-white">
                  {cls.code ? `[${cls.code}] ${cls.name}` : cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Estimated Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>DUE DATE & TIME *</span>
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] text-white rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>ESTIMATED DURATION</span>
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 1.5 hours, 45 mins"
                className="w-full px-2.5 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] text-white rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Time Presets Quick Chips */}
          <div className="flex flex-wrap gap-1">
            {timePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEstimatedTime(preset)}
                className={`px-2 py-0.5 rounded-md font-mono-numbers text-[10px] font-semibold border transition-all cursor-pointer uppercase ${
                  estimatedTime === preset
                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                    : 'bg-white/[0.04] text-zinc-400 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <span>{preset}</span>
              </button>
            ))}
          </div>

          {/* Multi-Step Project Toggle & Builder */}
          <div className="p-3.5 rounded-lg border border-white/[0.08] bg-black/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <label
                  htmlFor="multi-step-toggle"
                  className="font-heading text-xs font-bold uppercase tracking-wider text-zinc-200 cursor-pointer"
                >
                  MULTI-STAGE WORKFLOW / MILESTONES
                </label>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="multi-step-toggle"
                  type="checkbox"
                  checked={hasSteps}
                  onChange={(e) => setHasSteps(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <p className="font-mono-numbers text-[11px] text-zinc-400">
              Break down into linear phases with sequential step progression.
            </p>

            {hasSteps ? (
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                {/* Existing Steps List */}
                <div className="space-y-1.5">
                  {steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-md bg-zinc-950/80 border border-white/[0.06]"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-4 h-4 rounded-xs bg-blue-600/20 text-blue-400 font-mono-numbers font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateStepTitle(step.id, e.target.value)}
                          placeholder={`Step ${idx + 1} title...`}
                          className="flex-1 px-2 py-1 text-xs bg-black/60 border border-white/[0.06] rounded-xs text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={step.dueDate || ''}
                          onChange={(e) => handleUpdateStepDueDate(step.id, e.target.value)}
                          className="px-1.5 py-1 font-mono-numbers text-[10px] bg-black/60 border border-white/[0.06] text-zinc-300 rounded-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                          title="Optional step due date"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-white/[0.08] rounded transition-colors cursor-pointer"
                          title="Remove step"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Step Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="New milestone title..."
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-black/60 border border-white/[0.08] rounded-md text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="datetime-local"
                    value={newStepDueDate}
                    onChange={(e) => setNewStepDueDate(e.target.value)}
                    className="px-2 py-1.5 font-mono-numbers text-[10px] bg-black/60 border border-white/[0.08] text-zinc-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    title="Optional step due date"
                  />
                  <button
                    type="button"
                    onClick={handleAddStep}
                    disabled={!newStepTitle.trim()}
                    className="px-3 py-1.5 font-heading text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 uppercase"
                  >
                    <Plus className="w-3 h-3" /> <span>+ STEP</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Multiple Tags Selector */}
          <div>
            <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3 h-3 text-purple-400" />
              <span>MODALITY & TOPIC TAGS</span>
            </label>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {AVAILABLE_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`px-2 py-0.5 rounded-md font-mono-numbers text-[10px] font-semibold border transition-all cursor-pointer uppercase ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-500 shadow-xs'
                        : `${t.color} hover:opacity-90`
                    }`}
                  >
                    <span>#{t.name}{isSelected ? ' ✓' : ''}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom tag input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="ADD CUSTOM TAG (ENTER)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="flex-1 px-2.5 py-1.5 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] rounded-md text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500 uppercase"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 font-heading text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/10 rounded-md transition-colors cursor-pointer uppercase"
              >
                + ADD
              </button>
            </div>
          </div>

          {/* Notes & Links */}
          <div>
            <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-purple-400" />
              <span>INSTRUCTIONS, PORTALS & NOTES</span>
            </label>
            <textarea
              rows={2}
              placeholder="Paste rubric links, requirements, reading pages, or submission portals (e.g. https://...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-black/60 border border-white/[0.08] text-white rounded-md focus:outline-hidden focus:ring-1 focus:ring-purple-500 transition-all font-medium resize-none placeholder:text-zinc-600"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 font-heading text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-md transition-colors cursor-pointer uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-heading text-xs font-bold uppercase tracking-wider text-white bg-purple-700 hover:bg-purple-600 rounded-md shadow-md shadow-purple-900/40 border border-purple-500/50 transition-all focus:ring-1 focus:ring-purple-500 cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'COMMIT CHANGES' : 'CREATE TASK'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
