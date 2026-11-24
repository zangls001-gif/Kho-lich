import React, { useState } from 'react';
import {
  CalendarDays,
  CheckSquare,
  Clock,
  Sparkles,
  ArrowRight,
  CopyPlus,
  LayoutTemplate,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatDate, getDayName, parseDate, cn } from '../utils/helpers';
import { DuplicationDialog } from '../components/Duplication/DuplicationDialog';

export const HomePage: React.FC = () => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const getCompletionForDate = useAppStore((s) => s.getCompletionForDate);
  const getOverdueTasks = useAppStore((s) => s.getOverdueTasks);
  const getUpcomingTasks = useAppStore((s) => s.getUpcomingTasks);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const templates = useAppStore((s) => s.templates);

  const [isDuplicationOpen, setIsDuplicationOpen] = useState(false);

  const todayStr = formatDate(new Date());
  const todayPlanner = dayPlanners[todayStr];
  const completionRate = getCompletionForDate(todayStr);
  const overdueTasks = getOverdueTasks();
  const upcomingTasks = getUpcomingTasks().slice(0, 5);

  const todayDateObj = new Date();
  const todayDayName = getDayName(todayDateObj);
  const formattedToday = todayDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Today's events
  const todayEvents = todayPlanner
    ? todayPlanner.blocks.filter((b) => b.type === 'event' && b.event).map((b) => b.event!)
    : [];

  // Today's tasks
  const todayTasks: Array<{ id: string; blockId: string; title: string; completed: boolean }> = [];
  if (todayPlanner) {
    todayPlanner.blocks.forEach((b) => {
      if (b.type === 'todo-list' && b.todoList) {
        b.todoList.tasks.forEach((t) => {
          todayTasks.push({
            id: t.id,
            blockId: b.id,
            title: t.title,
            completed: t.completed,
          });
        });
      }
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Hero Banner */}
        <div
          className="p-6 rounded-2xl border shadow-sm relative overflow-hidden transition-all"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>
                <Sparkles size={14} />
                <span>Today's Overview</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {todayDayName}, {formattedToday}
              </h1>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} planned • {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>

            {/* Daily Completion Progress Circle/Bar */}
            <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-3 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Day Completion
                </div>
                <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {completionRate}%
                </div>
              </div>
              <div className="w-28 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-5 mt-5 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => {
                setSelectedDate(todayStr);
                setCurrentPage('today');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <CalendarDays size={14} />
              <span>Open Today's Planner</span>
            </button>

            <button
              onClick={() => {
                setSelectedDate(todayStr);
                setIsDuplicationOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <CopyPlus size={14} style={{ color: 'var(--accent)' }} />
              <span>Duplicate Daily Schedule</span>
            </button>

            <button
              onClick={() => setCurrentPage('calendar')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Calendar size={14} style={{ color: 'var(--accent)' }} />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => setCurrentPage('templates')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <LayoutTemplate size={14} style={{ color: 'var(--accent)' }} />
              <span>Manage Templates</span>
            </button>
          </div>
        </div>

        {/* Overdue Tasks Alert (if any) */}
        {overdueTasks.length > 0 && (
          <div className="p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-red-900 dark:text-red-200">
                  {overdueTasks.length} Overdue Task{overdueTasks.length !== 1 ? 's' : ''} Need Attention
                </h3>
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  Unfinished tasks from past days are waiting for your review.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentPage('tasks')}
              className="flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline shrink-0"
            >
              <span>View Tasks</span>
              <ArrowRight size={12} />
            </button>
          </div>
        )}

        {/* 2-Column Section: Today's Tasks & Today's Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <div
            className="p-5 rounded-2xl border shadow-sm space-y-3"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <CheckSquare size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Today's Tasks
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedDate(todayStr);
                  setCurrentPage('today');
                }}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Open Day
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <p className="text-xs italic py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
                No tasks set for today yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-xs transition-colors hover:bg-black/5"
                  >
                    <button
                      onClick={() => toggleTask(todayStr, t.blockId, t.id)}
                      className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-all',
                        t.completed ? 'bg-indigo-500 border-indigo-500 text-white' : ''
                      )}
                      style={{
                        borderColor: t.completed ? 'var(--accent)' : 'var(--border)',
                        backgroundColor: t.completed ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {t.completed && <CheckCircle2 size={12} className="text-white" />}
                    </button>
                    <span
                      className={cn('truncate', t.completed && 'line-through opacity-50')}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {t.title || 'Untitled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Scheduled Events */}
          <div
            className="p-5 rounded-2xl border shadow-sm space-y-3"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: 'var(--accent)' }} />
                <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  Scheduled Events
                </h3>
              </div>
              <button
                onClick={() => setCurrentPage('calendar')}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--accent)' }}
              >
                Calendar
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-xs italic py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>
                No events scheduled for today.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {todayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      borderLeftWidth: '4px',
                      borderLeftColor: ev.color || 'var(--accent)',
                    }}
                  >
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {ev.title || 'Untitled'}
                      </div>
                      <div className="text-[11px] opacity-75" style={{ color: 'var(--text-secondary)' }}>
                        {ev.startTime} - {ev.endTime} {ev.location ? `• ${ev.location}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Saved Templates Quick Access */}
        <div
          className="p-5 rounded-2xl border shadow-sm space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <LayoutTemplate size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                Daily Templates ({templates.length})
              </h3>
            </div>
            <button
              onClick={() => setCurrentPage('templates')}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              View All
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="text-xs py-2" style={{ color: 'var(--text-secondary)' }}>
              No templates saved yet. Design a day and save it as a template to reuse anytime!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.slice(0, 3).map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setCurrentPage('templates')}
                  className="p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
                >
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                    {tpl.name}
                  </div>
                  <div className="text-[11px] opacity-70 truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                    {tpl.blocks.length} blocks
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Duplication Dialog */}
      <DuplicationDialog
        isOpen={isDuplicationOpen}
        onClose={() => setIsDuplicationOpen(false)}
        sourceDate={todayStr}
      />
    </div>
  );
};
