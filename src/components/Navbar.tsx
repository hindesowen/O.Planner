import React from 'react';
import { ActiveTab, ClassItem, Assignment } from '../types';
import { LayoutDashboard, Calendar as CalendarIcon, Plus, FolderPlus } from 'lucide-react';
import { OwenLogo } from './OwenLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  classes: ClassItem[];
  assignments: Assignment[];
  onOpenAddAssignment: () => void;
  onOpenAddClass: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  assignments,
  onOpenAddAssignment,
  onOpenAddClass,
}) => {
  const pendingCount = assignments.filter((a) => !a.completed).length;

  return (
    <>
      {/* 
        TOP HEADER:
        - Totally solid pitch black (#000000) with no frosted blur to prevent Dynamic Island intrusion
        - On Desktop (md:flex): Full header with Logo, Navigation Tabs, and Quick Actions.
        - On Mobile (md:hidden): Compact, clean header with ONLY the Logo and "O.Planner".
      */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-black border-b border-white/[0.08] shrink-0 pt-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo & Brand Wordmark */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/15 flex items-center justify-center p-1 shadow-inner shadow-black">
                <OwenLogo className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading text-base sm:text-lg font-bold tracking-tight text-white">
                O.Planner
              </span>
            </div>

            {/* Desktop Navigation Tabs (Hidden on Mobile) */}
            <nav className="hidden md:flex items-center gap-1.5 h-full" id="desktop-navigation">
              <button
                id="nav-dashboard-tab"
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`h-9 flex items-center gap-2 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer font-heading ${
                  activeTab === 'dashboard'
                    ? 'bg-purple-950/60 text-white border border-purple-500/40 shadow-sm shadow-purple-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span>Tasks</span>
                {pendingCount > 0 ? (
                  <span className="font-mono-numbers text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 ml-0.5">
                    {pendingCount}
                  </span>
                ) : null}
              </button>

              <button
                id="nav-calendar-tab"
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`h-9 flex items-center gap-2 px-3.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer font-heading ${
                  activeTab === 'calendar'
                    ? 'bg-purple-950/60 text-white border border-purple-500/40 shadow-sm shadow-purple-950/40'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Schedule</span>
              </button>
            </nav>

            {/* Desktop Action Buttons (Hidden on Mobile) */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <button
                id="btn-add-class"
                type="button"
                onClick={onOpenAddClass}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold font-heading text-zinc-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-lg transition-all cursor-pointer active:scale-98 shadow-xs"
              >
                <FolderPlus className="w-3.5 h-3.5 text-zinc-400" />
                <span>+ Course</span>
              </button>

              <button
                id="btn-add-assignment"
                type="button"
                onClick={onOpenAddAssignment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-lg font-bold font-heading text-xs shadow-md shadow-purple-900/40 border border-purple-500/50 transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Task</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 
        MOBILE BOTTOM NAVIGATION BAR:
        - Fixed at bottom on small screens (`md:hidden`)
        - Frosted glass finish with tab switcher and creation actions
      */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 apple-glass border-t border-white/15 px-3 py-2.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1.5">
          {/* Tasks Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-white bg-purple-950/60 border border-purple-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-purple-400' : 'text-zinc-400'}`} />
              {pendingCount > 0 ? (
                <span className="absolute -top-1.5 -right-2 font-mono-numbers text-[8px] font-bold px-1 rounded-full bg-purple-600 text-white">
                  {pendingCount}
                </span>
              ) : null}
            </div>
            <span className="mt-0.5">Tasks</span>
          </button>

          {/* Schedule Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-white bg-purple-950/60 border border-purple-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CalendarIcon className={`w-4 h-4 ${activeTab === 'calendar' ? 'text-purple-400' : 'text-zinc-400'}`} />
            <span className="mt-0.5">Schedule</span>
          </button>

          {/* + Course Button */}
          <button
            type="button"
            onClick={onOpenAddClass}
            className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-semibold text-zinc-300 hover:text-white bg-white/[0.04] border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-zinc-300" />
            <span className="mt-0.5">+ Course</span>
          </button>

          {/* + New Task Primary Action */}
          <button
            type="button"
            onClick={onOpenAddAssignment}
            className="flex-1 flex flex-col items-center justify-center py-1 rounded-lg text-[11px] font-bold text-white bg-purple-700 hover:bg-purple-600 border border-purple-500/60 shadow-md shadow-purple-900/40 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="mt-0.5">+ Task</span>
          </button>
        </div>
      </div>
    </>
  );
};
