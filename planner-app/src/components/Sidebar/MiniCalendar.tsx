import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, getShortMonthName, cn } from '../../utils/helpers';

const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MiniCalendar: React.FC = () => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const getDatesWithContent = useAppStore((s) => s.getDatesWithContent);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const datesWithContent = useMemo(() => getDatesWithContent(), [getDatesWithContent]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthLabel = `${getShortMonthName(viewMonth)} ${viewYear}`;

  const todayStr = formatDate(today);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const dateStr = formatDate(new Date(viewYear, viewMonth, day));
    setSelectedDate(dateStr);
    setCurrentPage('today');
  };

  // Build the grid: leading blanks + day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="px-2 pb-3">
      {/* Month header */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={handlePrevMonth}
          className="p-0.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={14} />
        </button>
        <span
          className="text-xs font-semibold select-none"
          style={{ color: 'var(--text-primary)' }}
        >
          {monthLabel}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-0.5 rounded hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-0 mb-0.5">
        {DAY_NAMES.map((name, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-medium select-none py-0.5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="h-6" />;
          }

          const dateStr = formatDate(new Date(viewYear, viewMonth, day));
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasContent = datesWithContent.has(dateStr);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              className={cn(
                'relative h-6 w-full flex items-center justify-center rounded-md text-[11px] font-medium transition-all duration-150',
                'hover:opacity-80'
              )}
              style={{
                backgroundColor: isSelected
                  ? 'var(--accent)'
                  : isToday
                  ? 'var(--bg-tertiary)'
                  : 'transparent',
                color: isSelected
                  ? '#ffffff'
                  : isToday
                  ? 'var(--accent)'
                  : 'var(--text-primary)',
              }}
            >
              {day}
              {hasContent && !isSelected && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
