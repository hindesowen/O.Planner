import React, { useState } from 'react';
import { ClassItem, Assignment } from '../types';
import {
  X,
  BookPlus,
  Palette,
  Sparkles,
  Trash2,
  FolderKanban,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClass: (cls: Omit<ClassItem, 'id'>) => void;
  classes?: ClassItem[];
  assignments?: Assignment[];
  onDeleteClass?: (classId: string) => void;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  isOpen,
  onClose,
  onAddClass,
  classes = [],
  assignments = [],
  onDeleteClass,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'add' | 'manage'>('add');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  const swatches = [
    { label: 'Burnt Orange', hex: '#E85F2D' },
    { label: 'Neon Rose', hex: '#F35F98' },
    { label: 'Lime', hex: '#78BE06' },
    { label: 'Wine', hex: '#62092B' },
    { label: 'Golden Apricot', hex: '#EEA144' },
    { label: 'Purple', hex: '#8B5CF6' },
    { label: 'Cyan', hex: '#06B6D4' },
    { label: 'Blue', hex: '#3B82F6' },
    { label: 'Zinc', hex: '#71717A' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddClass({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      color,
    });

    setName('');
    setCode('');
    setInstructor('');
    onClose();
  };

  const handleConfirmDelete = () => {
    if (classToDelete && onDeleteClass) {
      onDeleteClass(classToDelete.id);
      setClassToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div
        className="apple-glass bg-zinc-950/95 w-full max-w-md rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        id="add-class-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-black/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold">
              <BookPlus className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-bold text-white">
                Course Management
              </h2>
              <p className="text-[11px] text-zinc-400">
                Add new courses or remove existing ones
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

        {/* Navigation Sub-Tabs */}
        <div className="flex border-b border-white/[0.08] bg-black/20 px-5 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('add');
              setClassToDelete(null);
            }}
            className={`pb-2 px-2 text-xs font-heading font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'add'
                ? 'text-purple-400 border-purple-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <BookPlus className="w-3.5 h-3.5" />
            <span>+ Add Course</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('manage');
              setClassToDelete(null);
            }}
            className={`pb-2 px-2 text-xs font-heading font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'manage'
                ? 'text-purple-400 border-purple-500'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Manage Courses ({classes.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeSubTab === 'add' ? (
            /* Add Course Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Academic Writing & Rhetoric"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-black/60 border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Course Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ENG 101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 font-mono-numbers text-xs bg-black/60 border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium uppercase"
                  />
                </div>

                <div>
                  <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Martinez"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-black/60 border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-medium"
                  />
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block font-heading text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  <span>Theme Color</span>
                </label>
                <div className="grid grid-cols-9 gap-1.5 pt-1">
                  {swatches.map((s) => (
                    <button
                      key={s.hex}
                      type="button"
                      onClick={() => setColor(s.hex)}
                      className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                        color === s.hex
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                          : 'hover:scale-105 opacity-75 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: s.hex }}
                      title={s.label}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 font-heading text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-heading text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-lg shadow-md shadow-purple-900/40 border border-purple-500/50 transition-all focus:ring-1 focus:ring-purple-500 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save Course</span>
                </button>
              </div>
            </form>
          ) : (
            /* Manage / Remove Courses List */
            <div className="space-y-3">
              {classes.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No courses registered yet.
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Select a course to remove it from your planner:
                  </p>

                  {classes.map((cls) => {
                    const taskCount = assignments.filter((a) => a.classId === cls.id).length;
                    const isConfirming = classToDelete?.id === cls.id;

                    return (
                      <div
                        key={cls.id}
                        className={`p-3 rounded-lg border transition-all ${
                          isConfirming
                            ? 'bg-rose-950/40 border-rose-500/40'
                            : 'bg-black/40 border-white/[0.08] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: cls.color || '#8B5CF6' }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-heading text-xs font-bold text-white truncate">
                                  {cls.name}
                                </span>
                                {cls.code && (
                                  <span className="font-mono-numbers text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 font-semibold uppercase">
                                    {cls.code}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono-numbers mt-0.5">
                                {cls.instructor && <span>{cls.instructor}</span>}
                                {cls.instructor && <span>•</span>}
                                <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Trigger */}
                          {!isConfirming ? (
                            <button
                              type="button"
                              onClick={() => setClassToDelete(cls)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
                              title={`Remove ${cls.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>

                        {/* Confirmation dialog banner inside the item */}
                        {isConfirming && (
                          <div className="mt-2.5 pt-2.5 border-t border-rose-500/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-rose-300 text-[11px] font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>Remove course?</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setClassToDelete(null)}
                                className="px-2.5 py-1 text-[11px] font-heading font-medium text-zinc-400 hover:text-white bg-black/40 rounded border border-white/10 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="px-2.5 py-1 text-[11px] font-heading font-bold text-white bg-rose-700 hover:bg-rose-600 rounded border border-rose-500/50 cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
