import React, { useState, useEffect } from 'react';
import { ClassItem, Assignment, ActiveTab } from './types';
import { INITIAL_CLASSES, INITIAL_ASSIGNMENTS } from './data/dummyData';
import { Navbar } from './components/Navbar';
import { ProductivityTracker } from './components/ProductivityTracker';
import { AssignmentDashboard } from './components/AssignmentDashboard';
import { CalendarView } from './components/CalendarView';
import { AssignmentModal } from './components/AssignmentModal';
import { AddClassModal } from './components/AddClassModal';
import { CheckCircle } from 'lucide-react';

const STORAGE_KEY_CLASSES = 'oplanner_local_classes';
const STORAGE_KEY_ASSIGNMENTS = 'oplanner_local_assignments';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Persistence purely local to the user's device
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLASSES) || localStorage.getItem('planner_classes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse local classes:', e);
      }
    }
    return INITIAL_CLASSES;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS) || localStorage.getItem('planner_assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse local assignments:', e);
      }
    }
    return INITIAL_ASSIGNMENTS;
  });

  // Automatically sync state to device's localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
      localStorage.setItem('planner_classes', JSON.stringify(classes));
    } catch (err) {
      console.warn('Error saving classes to device localStorage:', err);
    }
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
      localStorage.setItem('planner_assignments', JSON.stringify(assignments));
    } catch (err) {
      console.warn('Error saving assignments to device localStorage:', err);
    }
  }, [assignments]);

  // Modal states
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | undefined>(undefined);

  // Global Tag Filter state shared between ProductivityTracker and Dashboard
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle completion
  const handleToggleComplete = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextCompleted = !a.completed;
          showToast(
            nextCompleted
              ? `"${a.title}" marked Completed ✓`
              : `"${a.title}" restored to Active list`
          );

          // If completing an assignment with steps, mark all steps completed as well
          const updatedSteps = nextCompleted && a.steps
            ? a.steps.map((s) => ({ ...s, completed: true, completedAt: s.completedAt || new Date().toISOString() }))
            : a.steps;

          return {
            ...a,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            steps: updatedSteps,
          };
        }
        return a;
      })
    );
  };

  // Advance step for multi-step projects
  const handleAdvanceStep = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id || !a.steps || a.steps.length === 0) return a;

        const nextStepIdx = a.steps.findIndex((s) => !s.completed);
        if (nextStepIdx === -1) {
          // All steps already completed
          return a;
        }

        const stepToComplete = a.steps[nextStepIdx];
        const newSteps = a.steps.map((s, idx) =>
          idx === nextStepIdx
            ? { ...s, completed: true, completedAt: new Date().toISOString() }
            : s
        );

        const isNowFullyComplete = newSteps.every((s) => s.completed);

        if (isNowFullyComplete) {
          showToast(`🎉 Milestone reached! "${a.title}" project is 100% complete!`);
        } else {
          const upcomingStep = newSteps[nextStepIdx + 1];
          showToast(
            `Completed Step ${nextStepIdx + 1}: "${stepToComplete.title}". Next: "${upcomingStep?.title || 'Next'}"`
          );
        }

        return {
          ...a,
          steps: newSteps,
          completed: isNowFullyComplete,
          completedAt: isNowFullyComplete ? new Date().toISOString() : a.completedAt,
        };
      })
    );
  };

  // Toggle individual step in multi-step project
  const handleToggleStep = (assignmentId: string, stepId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== assignmentId || !a.steps) return a;

        const updatedSteps = a.steps.map((s) =>
          s.id === stepId
            ? {
                ...s,
                completed: !s.completed,
                completedAt: !s.completed ? new Date().toISOString() : undefined,
              }
            : s
        );

        const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.completed);

        return {
          ...a,
          steps: updatedSteps,
          completed: allDone,
          completedAt: allDone ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  // Delete assignment
  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    showToast('Assignment removed');
  };

  // Save Assignment (Handles both Create and Edit)
  const handleSaveAssignment = (assignmentData: Omit<Assignment, 'createdAt'> & { createdAt?: string }) => {
    const isExisting = assignments.some((a) => a.id === assignmentData.id);

    if (isExisting) {
      const existing = assignments.find((a) => a.id === assignmentData.id);
      const updated: Assignment = {
        ...assignmentData,
        createdAt: existing?.createdAt || new Date().toISOString(),
      };
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignmentData.id ? updated : a))
      );
      showToast(`Updated "${assignmentData.title}"`);
    } else {
      const newAssignment: Assignment = {
        ...assignmentData,
        id: assignmentData.id || `asg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setAssignments((prev) => [newAssignment, ...prev]);
      showToast(`Scheduled "${newAssignment.title}"`);
    }

    setEditingAssignment(null);
    setIsAssignmentModalOpen(false);
  };

  // Add class
  const handleAddClass = (newCls: Omit<ClassItem, 'id'>) => {
    const cls: ClassItem = {
      ...newCls,
      id: `cls-${Date.now()}`,
    };
    setClasses((prev) => [...prev, cls]);
    showToast(`Course "${cls.name}" added`);
  };

  // Remove / Delete class
  const handleDeleteClass = (classId: string) => {
    const targetClass = classes.find((c) => c.id === classId);
    const className = targetClass ? targetClass.name : 'Course';
    setClasses((prev) => prev.filter((c) => c.id !== classId));
    showToast(`Course "${className}" removed`);
  };

  // Modal open triggers
  const handleOpenAddAssignment = (dateKey?: string) => {
    setEditingAssignment(null);
    setModalInitialDate(dateKey);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (asg: Assignment) => {
    setEditingAssignment(asg);
    setModalInitialDate(undefined);
    setIsAssignmentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-midnight-gradient text-zinc-100 flex flex-col font-sans antialiased selection:bg-purple-600 selection:text-white">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        classes={classes}
        assignments={assignments}
        onOpenAddAssignment={() => handleOpenAddAssignment()}
        onOpenAddClass={() => setIsAddClassOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 md:pb-12 space-y-6">
        {/* Productivity & Progress Tracker */}
        <ProductivityTracker
          assignments={assignments}
          selectedTagFilter={selectedTagFilter}
          onSelectTagFilter={(tag) => setSelectedTagFilter(tag)}
        />

        {/* View Switcher: Dashboard or Calendar */}
        {activeTab === 'dashboard' ? (
          <AssignmentDashboard
            classes={classes}
            assignments={assignments}
            onToggleComplete={handleToggleComplete}
            onAdvanceStep={handleAdvanceStep}
            onToggleStep={handleToggleStep}
            onOpenEditModal={handleOpenEditAssignment}
            onDeleteAssignment={handleDeleteAssignment}
            onOpenAddAssignment={handleOpenAddAssignment}
            selectedTagFilter={selectedTagFilter}
            onSelectTagFilter={setSelectedTagFilter}
          />
        ) : (
          <CalendarView
            classes={classes}
            assignments={assignments}
            onToggleComplete={handleToggleComplete}
            onOpenAddModal={handleOpenAddAssignment}
            onOpenEditModal={handleOpenEditAssignment}
          />
        )}
      </main>

      {/* Assignment Add / Edit Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => {
          setIsAssignmentModalOpen(false);
          setEditingAssignment(null);
        }}
        classes={classes}
        onSave={handleSaveAssignment}
        editingAssignment={editingAssignment}
        initialDueDate={modalInitialDate}
      />

      {/* Add & Manage Class Modal */}
      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onAddClass={handleAddClass}
        classes={classes}
        assignments={assignments}
        onDeleteClass={handleDeleteClass}
      />

      {/* Utilitarian Dark Mode Toast Banner */}
      {toastMessage && (
        <div
          id="system-toast"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/95 border border-purple-500/40 text-white font-medium text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
