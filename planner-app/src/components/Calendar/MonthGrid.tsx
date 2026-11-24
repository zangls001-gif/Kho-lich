import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  formatDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  cn,
} from '../../utils/helpers';

interface MonthGridProps {
  year: number;
  month: number; // 0-indexed
  mini?: boolean;
  onDateClick?: (dateStr: string) => void;
  onMonthClick?: () => void;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  mini = false,
  onDateClick,
  onMonthClick,
}) => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const dayPlanners = useAppStore((s) => s.dayPlanners);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Previous month fill
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    const days: Array<{
      date: Date;
      dateStr: string;
      day: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Fill previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const date = new Date(prevYear, prevMonth, d);
      const dateStr = formatDate(date);
      days.push({
        date,
        dateStr,
        day: d,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: dateStr === selectedDate,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDate(date);
      days.push({
        date,
        dateStr,
        day: d,
        isCurrentMonth: true,
        isToday: isToday(date),
        isSelected: dateStr === selectedDate,
      });
    }

    // Fill next month days to complete 6 rows
    const remaining = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(nextYear, nextMonth, d);
      const dateStr = formatDate(date);
      days.push({
        date,
        dateStr,
        day: d,
        isCurrentMonth: false,
        isToday: isToday(date),
        isSelected: dateStr === selectedDate,
      });
    }

    return days;
  }, [year, month, selectedDate]);

  const getEventsForDate = (dateStr: string) => {
    const planner = dayPlanners[dateStr];
    if (!planner) return [];
    return planner.blocks.filter((b) => b.type === 'event' && b.event);
  };

  const getTaskCountForDate = (dateStr: string) => {
    const planner = dayPlanners[dateStr];
    if (!planner) return 0;
    let count = 0;
    planner.blocks.forEach((b) => {
      if (b.type === 'todo-list' && b.todoList) {
        count += b.todoList.tasks.length;
      }
    });
    return count;
  };

  const hasContent = (dateStr: string) => {
    return !!dayPlanners[dateStr] && dayPlanners[dateStr].blocks.length > 0;
  };

  const handleDateClick = (dateStr: string) => {
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  // ── Mini Month Grid (for Year View) ──
  if (mini) {
    return (
      <div
        className="rounded-lg p-2 cursor-pointer transition-colors hover:opacity-80"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        onClick={onMonthClick}
      >
        <div
          className="text-center text-sm font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {new Date(year, month).toLocaleDateString('en-US', { month: 'long' })}
        </div>
        <div className="grid grid-cols-7 gap-0">
          {DAY_NAMES_SHORT.map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-medium py-0.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {d}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            const hasData = hasContent(day.dateStr);
            return (
              <div
                key={i}
                className={cn(
                  'text-center text-[10px] py-0.5 rounded-sm relative cursor-pointer',
                  !day.isCurrentMonth && 'opacity-30',
                  day.isToday && 'font-bold'
                )}
                style={{
                  color: day.isToday
                    ? 'var(--accent)'
                    : day.isSelected
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
                  backgroundColor: day.isSelected
                    ? 'var(--accent-light, rgba(99,102,241,0.15))'
                    : undefined,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDateClick(day.dateStr);
                }}
              >
                {day.day}
                {hasData && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Full Month Grid ──
  return (
    <div className="w-full">
      {/* Day names header */}
      <div
        className="grid grid-cols-7 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold uppercase py-2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid - 6 rows */}
      <div className="grid grid-cols-7 grid-rows-6">
        {calendarDays.map((day, idx) => {
          const events = getEventsForDate(day.dateStr);
          const taskCount = getTaskCountForDate(day.dateStr);
          const maxPreview = 3;
          const displayedEvents = events.slice(0, maxPreview);
          const moreCount =
            events.length - maxPreview + (taskCount > 0 ? 1 : 0);

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[90px] border-b border-r p-1.5 cursor-pointer transition-colors',
                !day.isCurrentMonth && 'opacity-40'
              )}
              style={{
                borderColor: 'var(--border)',
                backgroundColor: day.isSelected
                  ? 'var(--accent-light, rgba(99,102,241,0.08))'
                  : day.isToday
                  ? 'var(--bg-tertiary, rgba(99,102,241,0.04))'
                  : 'transparent',
              }}
              onClick={() => handleDateClick(day.dateStr)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'text-sm w-6 h-6 flex items-center justify-center rounded-full',
                    day.isToday && 'font-bold'
                  )}
                  style={{
                    backgroundColor: day.isToday ? 'var(--accent)' : undefined,
                    color: day.isToday
                      ? '#ffffff'
                      : day.isSelected
                      ? 'var(--accent)'
                      : 'var(--text-primary)',
                  }}
                >
                  {day.day}
                </span>
              </div>

              {/* Event previews */}
              <div className="space-y-0.5">
                {displayedEvents.map((block) => (
                  <div
                    key={block.id}
                    className="text-[10px] leading-tight truncate rounded px-1 py-0.5"
                    style={{
                      backgroundColor:
                        block.event?.color || 'var(--accent)',
                      color: '#ffffff',
                    }}
                    title={block.event?.title}
                  >
                    {block.event?.startTime && (
                      <span className="opacity-80 mr-0.5">
                        {block.event.startTime}
                      </span>
                    )}
                    {block.event?.title || 'Untitled'}
                  </div>
                ))}

                {/* Task count indicator */}
                {taskCount > 0 && events.length < maxPreview && (
                  <div
                    className="text-[10px] leading-tight truncate rounded px-1 py-0.5 flex items-center gap-1"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </div>
                )}

                {/* More indicator */}
                {moreCount > 0 && events.length >= maxPreview && (
                  <div
                    className="text-[10px] font-medium px-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    +{moreCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthGrid;
