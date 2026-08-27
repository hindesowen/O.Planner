import React, { useState } from 'react';
import { ClassItem, Assignment } from '../types';
import { AVAILABLE_TAGS } from '../data/dummyData';
import { X, Plus, Calendar, Clock, BookOpen, Tag as TagIcon, FileText } from 'lucide-react';

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onOpenAddClass: () => void;
  initialDueDate?: string;
}

export const AddAssignmentModal: React.FC<AddAssignmentModalProps> = ({
  isOpen,
  onClose,
  classes,
  onAddAssignment,
  onOpenAddClass,
  initialDueDate,
}) => {
  if (!isOpen) return null;

  const getDefaultDateTime = () => {
    if (initialDueDate && initialDueDate.length === 10) {
      return `${initialDueDate}T23:59`;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [dueDate, setDueDate] = useState(getDefaultDateTime());
  const [notes, setNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('1.5 hours');
  const [selectedTags, setSelectedTags] = useState<string[]>(['writing']);
  const [customTagInput, setCustomTagInput] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    onAddAssignment({
      title: title.trim(),
      classId,
      dueDate,
      notes: notes.trim(),
      estimatedTime: estimatedTime.trim(),
      tags: selectedTags,
      completed: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        id="add-assignment-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Assignment</h2>
              <p className="text-xs text-slate-500">Plan tasks with tags, due dates, and reminders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Assignment Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Essay Draft Outline or Photo Shoot #3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Linked Class Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Linked Class *
              </label>
              <button
                type="button"
                onClick={onOpenAddClass}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Class
              </button>
            </div>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.code ? `${cls.code} - ${cls.name}` : cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date & Estimated Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Estimated Time
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 1.5 hours, 45 mins"
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Time Presets Quick Chips */}
          <div className="flex flex-wrap gap-1.5">
            {timePresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setEstimatedTime(preset)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                  estimatedTime === preset
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Multiple Tags Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <TagIcon className="w-3.5 h-3.5 text-slate-400" /> Assignment Tags (Dynamic Grouping)
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                        : `${t.color} hover:opacity-80`
                    }`}
                  >
                    #{t.name} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>

            {/* Custom tag input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Add custom tag (press Enter)..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                + Add Tag
              </button>
            </div>
          </div>

          {/* Notes & Links */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notes, Instructions & Links
            </label>
            <textarea
              rows={3}
              placeholder="Paste rubric links, requirements, reading pages, or submission portals (e.g. https://...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
