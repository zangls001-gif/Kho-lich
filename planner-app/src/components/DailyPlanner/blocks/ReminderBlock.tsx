import React from 'react';
import { Bell } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';

interface ReminderBlockProps {
  block: Block;
  date: string;
}

export default function ReminderBlock({ block, date }: ReminderBlockProps) {
  const { updateBlock } = useAppStore();

  return (
    <div
      className="w-full rounded-lg px-3 py-2.5 flex items-start gap-3"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}
    >
      {/* Bell icon */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
      >
        <Bell size={14} style={{ color: '#f59e0b' }} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1.5">
        <input
          type="text"
          value={block.content}
          onChange={(e) => updateBlock(date, block.id, { content: e.target.value })}
          className="w-full text-sm font-medium bg-transparent border-none outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Reminder..."
        />

        {/* Time input */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Remind at:
          </span>
          <input
            type="time"
            value={block.todoList?.tasks?.[0]?.dueTime || ''}
            onChange={(e) => {
              // Store reminder time in the content field with a separator
              const currentContent = block.content.split('|||')[0] || '';
              updateBlock(date, block.id, {
                content: currentContent + '|||' + e.target.value,
              });
            }}
            className="text-xs bg-transparent border-none outline-none"
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </div>
    </div>
  );
}
