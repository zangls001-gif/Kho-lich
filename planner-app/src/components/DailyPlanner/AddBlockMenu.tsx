import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  CheckSquare,
  List,
  ListOrdered,
  Type,
  Heading,
  Minus,
  Bell,
  Calendar,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { BlockType } from '../../types';

interface AddBlockMenuProps {
  onAddBlock: (type: BlockType) => void;
  inline?: boolean;
}

interface BlockOption {
  type: BlockType;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'todo-list',
    label: 'To-do List',
    description: 'Track tasks with checkboxes, priorities & tags',
    icon: CheckSquare,
  },
  {
    type: 'heading',
    label: 'Heading',
    description: 'Section header with H1, H2, or H3 levels',
    icon: Heading,
  },
  {
    type: 'text',
    label: 'Text / Note',
    description: 'Rich-text note with bold, italic & links',
    icon: Type,
  },
  {
    type: 'bullet-list',
    label: 'Bullet List',
    description: 'Simple bulleted list for quick points',
    icon: List,
  },
  {
    type: 'numbered-list',
    label: 'Numbered List',
    description: 'Ordered list with automatic numbering',
    icon: ListOrdered,
  },
  {
    type: 'event',
    label: 'Scheduled Event',
    description: 'Calendar event with time, color & location',
    icon: Calendar,
  },
  {
    type: 'time-block',
    label: 'Time Block',
    description: 'Scheduled activity block for time-blocking',
    icon: Clock,
  },
  {
    type: 'reminder',
    label: 'Reminder',
    description: 'Time-sensitive reminder callout',
    icon: Bell,
  },
  {
    type: 'image',
    label: 'Image',
    description: 'Embed image via URL with optional caption',
    icon: ImageIcon,
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Subtle separator line between blocks',
    icon: Minus,
  },
];

export const AddBlockMenu: React.FC<AddBlockMenuProps> = ({ onAddBlock, inline = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (type: BlockType) => {
    onAddBlock(type);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {inline ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-md transition-colors hover:opacity-80"
          style={{
            color: 'var(--text-tertiary)',
            backgroundColor: 'transparent',
          }}
          title="Add block here"
        >
          <Plus size={14} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px dashed var(--border)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          <Plus size={16} />
          <span>Add Content Block</span>
        </button>
      )}

      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-72 rounded-xl shadow-xl z-50 border py-2 max-h-96 overflow-y-auto animate-scaleIn"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Choose Block Type
          </div>
          <div className="space-y-0.5 px-1">
            {BLOCK_OPTIONS.map(({ type, label, description, icon: Icon }) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className="w-full flex items-start gap-3 px-2.5 py-2 rounded-lg text-left transition-colors duration-100 hover:opacity-90"
                style={{
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div
                  className="p-1.5 rounded-md shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--accent)',
                  }}
                >
                  <Icon size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div
                    className="text-xs leading-snug line-clamp-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
