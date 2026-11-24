import React, { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';

interface TextBlockProps {
  block: Block;
  date: string;
}

export default function TextBlock({ block, date }: TextBlockProps) {
  const { updateBlock } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitializedRef = useRef(false);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      editorRef.current.innerHTML = block.content || '';
      isInitializedRef.current = true;
    }
  }, [block.content]);

  const saveContent = useCallback(
    (html: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        updateBlock(date, block.id, { content: html });
      }, 400);
    },
    [date, block.id, updateBlock]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      saveContent(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold', false);
      } else if (e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic', false);
      }
    }
  };

  return (
    <div className="w-full">
      <div
        ref={editorRef}
        className="note-editor w-full min-h-[60px] text-sm leading-relaxed outline-none rounded-md px-1 py-0.5"
        style={{ color: 'var(--text-primary)' }}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Write something..."
      />
      <style>{`
        .note-editor:empty::before {
          content: attr(data-placeholder);
          color: var(--text-tertiary);
          pointer-events: none;
        }
        .note-editor b, .note-editor strong {
          font-weight: 700;
        }
        .note-editor i, .note-editor em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
