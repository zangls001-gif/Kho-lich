import React, { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';
import { cn } from '../../../utils/helpers';

interface HeadingBlockProps {
  block: Block;
  date: string;
}

const HEADING_SIZES: Record<number, string> = {
  1: 'text-3xl',
  2: 'text-2xl',
  3: 'text-xl',
};

export default function HeadingBlock({ block, date }: HeadingBlockProps) {
  const { updateBlock } = useAppStore();
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const level = block.headingLevel || 2;

  return (
    <div className="w-full flex items-start gap-2">
      {/* Level selector */}
      <div className="relative mt-0.5">
        <button
          onClick={() => setShowLevelPicker(!showLevelPicker)}
          className="text-xs font-medium px-1.5 py-0.5 rounded transition-colors"
          style={{
            color: 'var(--text-tertiary)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          H{level}
        </button>
        {showLevelPicker && (
          <div
            className="absolute left-0 top-full mt-1 z-10 rounded-lg shadow-lg py-1 min-w-[50px]"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
          >
            {([1, 2, 3] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  updateBlock(date, block.id, { headingLevel: l });
                  setShowLevelPicker(false);
                }}
                className="w-full px-3 py-1 text-xs text-center hover:opacity-80 transition-opacity"
                style={{
                  color: 'var(--text-primary)',
                  backgroundColor: level === l ? 'var(--bg-tertiary)' : 'transparent',
                }}
              >
                H{l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable heading */}
      <input
        type="text"
        value={block.content}
        onChange={(e) => updateBlock(date, block.id, { content: e.target.value })}
        className={cn('flex-1 font-bold bg-transparent border-none outline-none', HEADING_SIZES[level])}
        style={{ color: 'var(--text-primary)' }}
        placeholder="Heading..."
      />
    </div>
  );
}
