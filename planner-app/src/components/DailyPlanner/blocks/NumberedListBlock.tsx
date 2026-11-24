import React, { useRef } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';

interface NumberedListBlockProps {
  block: Block;
  date: string;
}

export default function NumberedListBlock({ block, date }: NumberedListBlockProps) {
  const { addListItem, updateListItem, deleteListItem } = useAppStore();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const items = block.items || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addListItem(date, block.id, '');
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
      }, 50);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      deleteListItem(date, block.id, index);
      setTimeout(() => {
        const focusIndex = Math.max(0, index - 1);
        inputRefs.current[focusIndex]?.focus();
      }, 50);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 px-1 py-0.5 rounded-md hover:bg-opacity-50 transition-colors"
          >
            {/* Number */}
            <span
              className="text-sm font-medium min-w-5 text-right select-none"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {index + 1}.
            </span>

            {/* Item input */}
            <input
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              value={item}
              onChange={(e) => updateListItem(date, block.id, index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="flex-1 text-sm bg-transparent border-none outline-none"
              style={{ color: 'var(--text-primary)' }}
              placeholder="List item..."
            />

            {/* Delete button */}
            <button
              onClick={() => deleteListItem(date, block.id, index)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <button
        onClick={() => {
          addListItem(date, block.id, '');
          setTimeout(() => {
            inputRefs.current[items.length]?.focus();
          }, 50);
        }}
        className="flex items-center gap-1.5 mt-1 px-1 py-1 rounded-md text-xs transition-colors hover:opacity-80"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <Plus size={14} />
        Add item
      </button>
    </div>
  );
}
