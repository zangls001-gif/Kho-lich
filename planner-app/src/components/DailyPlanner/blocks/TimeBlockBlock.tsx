import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';
import { formatTime, cn } from '../../../utils/helpers';

interface TimeBlockBlockProps {
  block: Block;
  date: string;
}

const PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#22c55e',
];

export default function TimeBlockBlock({ block, date }: TimeBlockBlockProps) {
  const { updateBlock } = useAppStore();
  const [showColors, setShowColors] = useState(false);
  const tb = block.timeBlock;

  if (!tb) return null;

  const handleUpdate = (updates: Partial<typeof tb>) => {
    updateBlock(date, block.id, { timeBlock: { ...tb, ...updates } });
  };

  return (
    <div
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2"
      style={{ border: '1px solid var(--border)' }}
    >
      {/* Color indicator */}
      <div className="relative">
        <button
          onClick={() => setShowColors(!showColors)}
          className="w-3 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          style={{ backgroundColor: tb.color }}
        />
        {showColors && (
          <div
            className="absolute left-full top-0 ml-2 z-20 p-1.5 rounded-lg shadow-lg flex flex-col gap-1"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  handleUpdate({ color });
                  setShowColors(false);
                }}
                className={cn(
                  'w-5 h-5 rounded-full transition-transform hover:scale-110',
                  tb.color === color && 'ring-2 ring-offset-1'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Time range */}
      <div className="flex items-center gap-1 shrink-0">
        <Clock size={12} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="time"
          value={tb.startTime}
          onChange={(e) => handleUpdate({ startTime: e.target.value })}
          className="text-xs bg-transparent border-none outline-none w-[70px]"
          style={{ color: 'var(--text-secondary)' }}
        />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>–</span>
        <input
          type="time"
          value={tb.endTime}
          onChange={(e) => handleUpdate({ endTime: e.target.value })}
          className="text-xs bg-transparent border-none outline-none w-[70px]"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Title */}
      <input
        type="text"
        value={tb.title}
        onChange={(e) => handleUpdate({ title: e.target.value })}
        className="flex-1 text-sm font-medium bg-transparent border-none outline-none"
        style={{ color: 'var(--text-primary)' }}
        placeholder="Time block title..."
      />
    </div>
  );
}
