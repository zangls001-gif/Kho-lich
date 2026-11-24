import React, { useEffect, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ScheduledEvent } from '../../types';
import {
  formatDate,
  getWeekDates,
  parseDate,
  isToday,
  formatTime,
  cn,
} from '../../utils/helpers';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // px per hour row

const WeekView: React.FC = () => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const addEvent = useAppStore((s) => s.addEvent);

  const scrollRef = useRef<HTMLDivElement>(null);

  const weekDates = useMemo(() => {
    return getWeekDates(parseDate(selectedDate));
  }, [selectedDate]);

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const scrollTo = (now.getHours() - 1) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollTo);
    }
  }, []);

  const getEventsForDate = (dateStr: string): Array<{ block: { id: string }; event: ScheduledEvent }> => {
    const planner = dayPlanners[dateStr];
    if (!planner) return [];
    return planner.blocks
      .filter((b) => b.type === 'event' && b.event)
      .map((b) => ({ block: { id: b.id }, event: b.event! }));
  };

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const getEventStyle = (event: ScheduledEvent): React.CSSProperties => {
    const startMin = timeToMinutes(event.startTime);
    const endMin = timeToMinutes(event.endTime);
    const duration = Math.max(endMin - startMin, 15); // minimum 15min
    const top = (startMin / 60) * HOUR_HEIGHT;
    const height = (duration / 60) * HOUR_HEIGHT;

    return {
      position: 'absolute',
      top: `${top}px`,
      height: `${height}px`,
      left: '2px',
      right: '2px',
      backgroundColor: event.color || 'var(--accent)',
      borderRadius: '4px',
      zIndex: 10,
    };
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const dateStr = formatDate(date);
    const startHour = String(hour).padStart(2, '0');
    const endHour = String(Math.min(hour + 1, 23)).padStart(2, '0');
    addEvent(dateStr, {
      title: '',
      startTime: `${startHour}:00`,
      endTime: `${endHour}:00`,
      date: dateStr,
    });
    setSelectedDate(dateStr);
    setCurrentPage('today');
  };

  const handleDayClick = (date: Date) => {
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);
    setCurrentPage('today');
  };

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;
  const todayStr = formatDate(now);

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="flex flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {/* Hour column spacer */}
        <div
          className="w-16 flex-shrink-0 border-b border-r"
          style={{ borderColor: 'var(--border)' }}
        />
        {weekDates.map((date) => {
          const dateStr = formatDate(date);
          const isTodayDate = isToday(date);
          const isSelected = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              className="flex-1 text-center py-2 border-b border-r cursor-pointer transition-colors"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: isTodayDate
                  ? 'var(--accent-light, rgba(99,102,241,0.08))'
                  : undefined,
              }}
              onClick={() => handleDayClick(date)}
            >
              <div
                className="text-xs uppercase font-medium"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={cn(
                  'text-lg font-semibold w-8 h-8 mx-auto flex items-center justify-center rounded-full',
                  isTodayDate && 'text-white'
                )}
                style={{
                  backgroundColor: isTodayDate ? 'var(--accent)' : undefined,
                  color: isTodayDate
                    ? '#ffffff'
                    : isSelected
                    ? 'var(--accent)'
                    : 'var(--text-primary)',
                }}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div className="flex" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          {/* Hour labels column */}
          <div
            className="w-16 flex-shrink-0 border-r relative"
            style={{ borderColor: 'var(--border)' }}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full text-right pr-2 text-xs"
                style={{
                  top: `${hour * HOUR_HEIGHT}px`,
                  height: `${HOUR_HEIGHT}px`,
                  color: 'var(--text-tertiary)',
                  transform: 'translateY(-6px)',
                }}
              >
                {hour === 0
                  ? ''
                  : `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDates.map((date) => {
            const dateStr = formatDate(date);
            const events = getEventsForDate(dateStr);
            const isTodayDate = isToday(date);

            return (
              <div
                key={dateStr}
                className="flex-1 relative border-r"
                style={{ borderColor: 'var(--border)' }}
              >
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b cursor-pointer hover:bg-opacity-50"
                    style={{
                      top: `${hour * HOUR_HEIGHT}px`,
                      height: `${HOUR_HEIGHT}px`,
                      borderColor: 'var(--border)',
                    }}
                    onClick={() => handleTimeSlotClick(date, hour)}
                  >
                    {/* Half-hour line */}
                    <div
                      className="absolute w-full border-b opacity-30"
                      style={{
                        top: `${HOUR_HEIGHT / 2}px`,
                        borderColor: 'var(--border)',
                      }}
                    />
                  </div>
                ))}

                {/* Events */}
                {events.map(({ event }) => (
                  <div
                    key={event.id}
                    className="cursor-pointer overflow-hidden px-1.5 py-1"
                    style={getEventStyle(event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(dateStr);
                      setCurrentPage('today');
                    }}
                  >
                    <div className="text-xs font-medium text-white truncate">
                      {event.title || 'Untitled'}
                    </div>
                    <div className="text-[10px] text-white/80 truncate">
                      {formatTime(event.startTime)} -{' '}
                      {formatTime(event.endTime)}
                    </div>
                    {event.location && (
                      <div className="text-[10px] text-white/70 truncate">
                        📍 {event.location}
                      </div>
                    )}
                  </div>
                ))}

                {/* Current time indicator */}
                {isTodayDate && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${currentTimeTop}px` }}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full -ml-1"
                        style={{ backgroundColor: '#ef4444' }}
                      />
                      <div
                        className="flex-1 h-[2px]"
                        style={{ backgroundColor: '#ef4444' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
