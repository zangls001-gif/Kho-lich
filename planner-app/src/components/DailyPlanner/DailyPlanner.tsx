import React, { useState } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
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
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Sparkles,
  BookmarkPlus,
  CopyPlus,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAppStore } from '../../store/useAppStore';
import { Block, BlockType, Mood } from '../../types';
import {
  formatDate,
  parseDate,
  getDayName,
  addDays,
  cn,
} from '../../utils/helpers';
import { BlockRenderer } from './BlockRenderer';
import { AddBlockMenu } from './AddBlockMenu';
import { DuplicationDialog } from '../Duplication/DuplicationDialog';

const MOODS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: 'great', emoji: '😊', label: 'Great' },
  { mood: 'good', emoji: '🙂', label: 'Good' },
  { mood: 'neutral', emoji: '😐', label: 'Neutral' },
  { mood: 'bad', emoji: '😕', label: 'Bad' },
  { mood: 'terrible', emoji: '😢', label: 'Terrible' },
];

const BLOCK_ICONS: Record<BlockType, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  'todo-list': CheckSquare,
  'bullet-list': List,
  'numbered-list': ListOrdered,
  'text': Type,
  'heading': Heading,
  'divider': Minus,
  'reminder': Bell,
  'event': Calendar,
  'time-block': Clock,
  'image': ImageIcon,
};

// Sortable Block Item wrapper
interface SortableBlockItemProps {
  block: Block;
  date: string;
  index: number;
  totalBlocks: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
  onAddAfter: (type: BlockType) => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  date,
  index,
  totalBlocks,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onToggleCollapse,
  onAddAfter,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const IconComponent = BLOCK_ICONS[block.type] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative mb-3 rounded-xl border transition-all duration-200"
    >
      <div
        className="rounded-xl p-3 transition-colors"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Block Header Toolbar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b select-none" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>

            {/* Block Type Badge */}
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
              }}
            >
              <IconComponent size={12} style={{ color: 'var(--accent)' }} />
              <span className="capitalize">{block.type.replace('-', ' ')}</span>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
              title={block.collapsed ? 'Expand block' : 'Collapse block'}
            >
              {block.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Block Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Insert block after */}
            <AddBlockMenu onAddBlock={onAddAfter} inline />

            {/* Move Up */}
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 rounded hover:opacity-80 disabled:opacity-30 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Move Up"
            >
              <ArrowUp size={14} />
            </button>

            {/* Move Down */}
            <button
              onClick={onMoveDown}
              disabled={index === totalBlocks - 1}
              className="p-1 rounded hover:opacity-80 disabled:opacity-30 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Move Down"
            >
              <ArrowDown size={14} />
            </button>

            {/* Duplicate */}
            <button
              onClick={onDuplicate}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
              title="Duplicate block"
            >
              <Copy size={14} />
            </button>

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--danger, #ef4444)' }}
              title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Block Content */}
        {block.collapsed ? (
          <div
            className="text-xs italic py-1 cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={onToggleCollapse}
          >
            Block collapsed (click to expand)
          </div>
        ) : (
          <div className="w-full">
            <BlockRenderer block={block} date={date} />
          </div>
        )}
      </div>
    </div>
  );
};

export const DailyPlanner: React.FC = () => {
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const createOrGetDayPlanner = useAppStore((s) => s.createOrGetDayPlanner);
  const updateDayTitle = useAppStore((s) => s.updateDayTitle);
  const updateDayMood = useAppStore((s) => s.updateDayMood);
  const addBlock = useAppStore((s) => s.addBlock);
  const deleteBlock = useAppStore((s) => s.deleteBlock);
  const duplicateBlock = useAppStore((s) => s.duplicateBlock);
  const reorderBlocks = useAppStore((s) => s.reorderBlocks);
  const toggleBlockCollapse = useAppStore((s) => s.toggleBlockCollapse);
  const saveAsTemplate = useAppStore((s) => s.saveAsTemplate);
  const getCompletionForDate = useAppStore((s) => s.getCompletionForDate);

  const [isDuplicationOpen, setIsDuplicationOpen] = useState(false);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Sensors for dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const planner = dayPlanners[selectedDate] || createOrGetDayPlanner(selectedDate);
  const currentDateObj = parseDate(selectedDate);
  const dayName = getDayName(currentDateObj);
  const completionRate = getCompletionForDate(selectedDate);

  const formattedDateTitle = currentDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = planner.blocks.findIndex((b) => b.id === active.id);
      const newIndex = planner.blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(planner.blocks, oldIndex, newIndex);
        reorderBlocks(selectedDate, reordered);
      }
    }
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= planner.blocks.length) return;
    const reordered = arrayMove(planner.blocks, index, targetIndex);
    reorderBlocks(selectedDate, reordered);
  };

  const handlePrevDay = () => {
    const prev = addDays(currentDateObj, -1);
    setSelectedDate(formatDate(prev));
  };

  const handleNextDay = () => {
    const next = addDays(currentDateObj, 1);
    setSelectedDate(formatDate(next));
  };

  const handleToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    saveAsTemplate(selectedDate, templateName.trim(), templateDescription.trim());
    setTemplateName('');
    setTemplateDescription('');
    setIsSaveTemplateOpen(false);
  };

  // Add default blocks if user wants quick setup
  const handleQuickSetup = () => {
    addBlock(selectedDate, 'heading');
    addBlock(selectedDate, 'todo-list');
    addBlock(selectedDate, 'event');
    addBlock(selectedDate, 'text');
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Date Header Bar */}
        <div
          className="p-5 rounded-2xl border shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Top row: Date navigation & Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                title="Previous Day"
              >
                <PrevIcon size={16} />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-xs font-semibold rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                Today
              </button>
              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                title="Next Day"
              >
                <NextIcon size={16} />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border bg-transparent font-medium outline-none cursor-pointer"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              />
            </div>

            {/* Action buttons: Duplicate Schedule & Save as Template */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSaveTemplateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                title="Save this day as a reusable template"
              >
                <BookmarkPlus size={14} style={{ color: 'var(--accent)' }} />
                <span>Save Template</span>
              </button>

              <button
                onClick={() => setIsDuplicationOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
                title="Duplicate this day to other dates or range"
              >
                <CopyPlus size={14} />
                <span>Duplicate Schedule</span>
              </button>
            </div>
          </div>

          {/* Main Date Display & Daily Title */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'var(--accent)' }}>
                {dayName}
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {formattedDateTitle}
              </h1>

              {/* Editable Daily Title */}
              <input
                type="text"
                value={planner.title}
                onChange={(e) => updateDayTitle(selectedDate, e.target.value)}
                placeholder="Give today a focus or title (e.g. Deep Work, Trip to Beach)..."
                className="mt-1.5 w-full md:w-96 text-sm bg-transparent border-b border-dashed outline-none py-0.5 transition-colors"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              />
            </div>

            {/* Mood Selector & Progress Bar */}
            <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
              {/* Mood selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)' }}>
                <span className="text-[11px] font-medium px-1.5" style={{ color: 'var(--text-tertiary)' }}>Mood:</span>
                {MOODS.map(({ mood, emoji, label }) => (
                  <button
                    key={mood}
                    onClick={() => updateDayMood(selectedDate, planner.mood === mood ? null : mood)}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all',
                      planner.mood === mood ? 'scale-110 shadow-sm' : 'opacity-60 hover:opacity-100'
                    )}
                    style={{
                      backgroundColor: planner.mood === mood ? 'var(--bg-tertiary)' : 'transparent',
                    }}
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Daily Progress */}
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${completionRate}%`,
                      backgroundColor: 'var(--accent)',
                    }}
                  />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {completionRate}% done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Blocks Section */}
        <div className="space-y-4">
          {planner.blocks.length === 0 ? (
            /* Empty State */
            <div
              className="p-10 rounded-2xl border text-center transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--accent)',
                }}
              >
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                Your workspace is empty for this day
              </h3>
              <p className="text-xs max-w-sm mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>
                Start planning by adding content blocks, applying a saved template, or duplicating another day's schedule.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleQuickSetup}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Quick Setup (Tasks + Events + Notes)
                </button>
                <AddBlockMenu onAddBlock={(type) => addBlock(selectedDate, type)} />
              </div>
            </div>
          ) : (
            /* Drag and Drop Blocks List */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={planner.blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {planner.blocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    date={selectedDate}
                    index={index}
                    totalBlocks={planner.blocks.length}
                    onMoveUp={() => handleMoveBlock(index, 'up')}
                    onMoveDown={() => handleMoveBlock(index, 'down')}
                    onDuplicate={() => duplicateBlock(selectedDate, block.id)}
                    onDelete={() => deleteBlock(selectedDate, block.id)}
                    onToggleCollapse={() => toggleBlockCollapse(selectedDate, block.id)}
                    onAddAfter={(type) => addBlock(selectedDate, type, block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}

          {/* Add Block at Bottom */}
          {planner.blocks.length > 0 && (
            <div className="pt-2 flex justify-center">
              <AddBlockMenu onAddBlock={(type) => addBlock(selectedDate, type)} />
            </div>
          )}
        </div>
      </div>

      {/* Duplication Dialog */}
      <DuplicationDialog
        isOpen={isDuplicationOpen}
        onClose={() => setIsDuplicationOpen(false)}
        sourceDate={selectedDate}
      />

      {/* Save Template Modal */}
      {isSaveTemplateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl border animate-scaleIn"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Save as Template
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Save the structure and blocks of {formattedDateTitle} to easily apply to future days.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Workday Routine, Study Day, Gym Day"
                  className="w-full text-sm px-3 py-2 rounded-xl border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Description (optional)
                </label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief summary of what this template contains..."
                  rows={2}
                  className="w-full text-sm px-3 py-2 rounded-xl border outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setIsSaveTemplateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!templateName.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-40"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
