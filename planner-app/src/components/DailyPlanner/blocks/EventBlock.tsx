import React, { useState } from 'react';
import { MapPin, Clock, Tag } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';
import { formatTime, cn } from '../../../utils/helpers';

interface EventBlockProps {
  block: Block;
  date: string;
}

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

export default function EventBlock({ block, date }: EventBlockProps) {
  const { updateEvent } = useAppStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const event = block.event;

  if (!event) return null;

  const handleUpdate = (updates: Partial<typeof event>) => {
    updateEvent(date, block.id, updates);
  };

  return (
    <div
      className="w-full rounded-lg overflow-hidden flex"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Color stripe */}
      <div
        className="w-1.5 min-h-full shrink-0 cursor-pointer relative"
        style={{ backgroundColor: event.color }}
        onClick={() => setShowColorPicker(!showColorPicker)}
      >
        {showColorPicker && (
          <div
            className="absolute left-full top-0 ml-2 z-20 p-2 rounded-lg shadow-lg flex flex-wrap gap-1.5 w-[120px]"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  handleUpdate({ color });
                  setShowColorPicker(false);
                }}
                className={cn(
                  'w-6 h-6 rounded-full transition-transform hover:scale-110',
                  event.color === color && 'ring-2 ring-offset-1'
                )}
                style={{
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-3 space-y-2">
        {/* Title */}
        <input
          type="text"
          value={event.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="w-full text-sm font-semibold bg-transparent border-none outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Event title..."
        />

        {/* Time range */}
        <div className="flex items-center gap-2">
          <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="time"
            value={event.startTime}
            onChange={(e) => handleUpdate({ startTime: e.target.value })}
            className="text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-secondary)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>—</span>
          <input
            type="time"
            value={event.endTime}
            onChange={(e) => handleUpdate({ endTime: e.target.value })}
            className="text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={event.location}
            onChange={(e) => handleUpdate({ location: e.target.value })}
            className="flex-1 text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-secondary)' }}
            placeholder="Add location..."
          />
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <Tag size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={event.category}
            onChange={(e) => handleUpdate({ category: e.target.value })}
            className="flex-1 text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-secondary)' }}
            placeholder="Category..."
          />
        </div>

        {/* Description */}
        <textarea
          value={event.description}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          className="w-full text-xs bg-transparent border-none outline-none resize-none min-h-[40px]"
          style={{ color: 'var(--text-secondary)' }}
          placeholder="Add description..."
          rows={2}
        />
      </div>
    </div>
  );
}
