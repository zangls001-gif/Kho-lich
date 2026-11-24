import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Columns,
  Grid,
  CalendarDays,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ViewMode } from '../../types';
import {
  formatDate,
  parseDate,
  addDays,
  getMonthName,
  getShortMonthName,
  cn,
} from '../../utils/helpers';
import MonthGrid from './MonthGrid';
import WeekView from './WeekView';

export const CalendarView: React.FC = () => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const calendarViewMode = useAppStore((s) => s.calendarViewMode);
  const setCalendarViewMode = useAppStore((s) => s.setCalendarViewMode);
  const dayPlanners = useAppStore((s) => s.dayPlanners);

  const currentDateObj = parseDate(selectedDate);
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth());

  // Navigation handlers depending on view mode
  const handlePrev = () => {
    if (calendarViewMode === 'day') {
      const prev = addDays(currentDateObj, -1);
      setSelectedDate(formatDate(prev));
      setViewYear(prev.getFullYear());
      setViewMonth(prev.getMonth());
    } else if (calendarViewMode === 'week') {
      const prev = addDays(currentDateObj, -7);
      setSelectedDate(formatDate(prev));
      setViewYear(prev.getFullYear());
      setViewMonth(prev.getMonth());
    } else if (calendarViewMode === 'month') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (calendarViewMode === 'year') {
      setViewYear(viewYear - 1);
    }
  };

  const handleNext = () => {
    if (calendarViewMode === 'day') {
      const next = addDays(currentDateObj, 1);
      setSelectedDate(formatDate(next));
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
    } else if (calendarViewMode === 'week') {
      const next = addDays(currentDateObj, 7);
      setSelectedDate(formatDate(next));
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
    } else if (calendarViewMode === 'month') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (calendarViewMode === 'year') {
      setViewYear(viewYear + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(formatDate(today));
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setCurrentPage('today');
  };

  // Title string depending on current view mode
  const getHeaderTitle = () => {
    if (calendarViewMode === 'day') {
      return currentDateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    if (calendarViewMode === 'week') {
      const weekStart = addDays(currentDateObj, -currentDateObj.getDay());
      const weekEnd = addDays(weekStart, 6);
      return `${getShortMonthName(weekStart.getMonth())} ${weekStart.getDate()} – ${getShortMonthName(
        weekEnd.getMonth()
      )} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`;
    }
    if (calendarViewMode === 'month') {
      return `${getMonthName(new Date(viewYear, viewMonth, 1))} ${viewYear}`;
    }
    return `${viewYear}`;
  };

  // Day view rendering
  const renderDayView = () => {
    const planner = dayPlanners[selectedDate];
    const events = planner ? planner.blocks.filter((b) => b.type === 'event' && b.event) : [];
    const tasks = planner ? planner.blocks.filter((b) => b.type === 'todo-list' && b.todoList) : [];

    return (
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        <div
          className="p-6 rounded-2xl border shadow-sm space-y-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {currentDateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {events.length} event(s), {tasks.length} task list(s)
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('today')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Open in Daily Planner
            </button>
          </div>

          {/* Events Schedule for the Day */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Scheduled Events
            </h3>
            {events.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>No events scheduled for this day.</p>
            ) : (
              <div className="space-y-2">
                {events.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      borderLeftWidth: '4px',
                      borderLeftColor: b.event?.color || 'var(--accent)',
                    }}
                  >
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {b.event?.title || 'Untitled Event'}
                      </div>
                      <div className="text-xs opacity-75" style={{ color: 'var(--text-secondary)' }}>
                        {b.event?.startTime} - {b.event?.endTime} {b.event?.location ? `• ${b.event.location}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks for the Day */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
              To-Do Tasks
            </h3>
            {tasks.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-tertiary)' }}>No tasks for this day.</p>
            ) : (
              <div className="space-y-3">
                {tasks.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border"
                    style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
                  >
                    <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent)' }}>
                      {b.todoList?.title || 'Tasks'}
                    </div>
                    <div className="space-y-1.5">
                      {b.todoList?.tasks.map((t) => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                          <span
                            className={cn('w-3.5 h-3.5 rounded border flex items-center justify-center', t.completed ? 'bg-indigo-500 text-white' : '')}
                            style={{ borderColor: 'var(--border)' }}
                          >
                            {t.completed && '✓'}
                          </span>
                          <span className={cn(t.completed && 'line-through opacity-60')} style={{ color: 'var(--text-primary)' }}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Year view: 12 mini months grid
  const renderYearView = () => {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, m) => (
            <MonthGrid
              key={m}
              year={viewYear}
              month={m}
              mini
              onDateClick={handleDateSelect}
              onMonthClick={() => {
                setViewMonth(m);
                setCalendarViewMode('month');
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden transition-colors">
      {/* Calendar Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b shrink-0 gap-3"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            title="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-semibold rounded-lg border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
            title="Next"
          >
            <ChevronRight size={16} />
          </button>

          {/* Quick Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
                const d = parseDate(e.target.value);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }
            }}
            className="text-xs px-2.5 py-1 rounded-lg border bg-transparent font-medium outline-none cursor-pointer"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          />

          <h2 className="text-base font-bold ml-2 hidden sm:block" style={{ color: 'var(--text-primary)' }}>
            {getHeaderTitle()}
          </h2>
        </div>

        {/* View Mode Switcher: Day / Week / Month / Year */}
        <div
          className="flex items-center p-1 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
        >
          {[
            { mode: 'day', label: 'Day', icon: CalendarDays },
            { mode: 'week', label: 'Week', icon: Columns },
            { mode: 'month', label: 'Month', icon: Grid },
            { mode: 'year', label: 'Year', icon: LayoutGrid },
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setCalendarViewMode(mode as ViewMode)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                calendarViewMode === mode ? 'shadow-sm text-white' : 'hover:opacity-80'
              )}
              style={{
                backgroundColor: calendarViewMode === mode ? 'var(--accent)' : 'transparent',
                color: calendarViewMode === mode ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Calendar View Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {calendarViewMode === 'day' && renderDayView()}
        {calendarViewMode === 'week' && <WeekView />}
        {calendarViewMode === 'month' && (
          <div className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full">
            <div
              className="rounded-2xl border shadow-sm overflow-hidden"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <MonthGrid
                year={viewYear}
                month={viewMonth}
                onDateClick={handleDateSelect}
              />
            </div>
          </div>
        )}
        {calendarViewMode === 'year' && renderYearView()}
      </div>
    </div>
  );
};
