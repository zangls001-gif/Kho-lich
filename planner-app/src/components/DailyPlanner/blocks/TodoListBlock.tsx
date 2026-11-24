import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block, Priority } from '../../../types';
import { cn } from '../../../utils/helpers';

interface TodoListBlockProps {
  block: Block;
  date: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  urgent: '#ef4444',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function TodoListBlock({ block, date }: TodoListBlockProps) {
  const { addTask, updateTask, deleteTask, toggleTask, updateTodoListTitle } = useAppStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [openPriorityId, setOpenPriorityId] = useState<string | null>(null);
  const newTaskInputRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLDivElement>(null);

  const todoList = block.todoList;
  if (!todoList) return null;

  useEffect(() => {
    if (isAddingTask && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [isAddingTask]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setOpenPriorityId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(date, block.id, { title: newTaskTitle.trim() });
    setNewTaskTitle('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <input
        type="text"
        value={todoList.title}
        onChange={(e) => updateTodoListTitle(date, block.id, e.target.value)}
        className="w-full text-sm font-semibold mb-2 bg-transparent border-none outline-none px-0"
        style={{ color: 'var(--text-primary)' }}
        placeholder="Todo list title..."
      />

      {/* Tasks */}
      <div className="flex flex-col gap-0.5">
        {todoList.tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
              task.completed && 'opacity-60'
            )}
            style={{ backgroundColor: hoveredTaskId === task.id ? 'var(--bg-tertiary)' : 'transparent' }}
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggleTask(date, block.id, task.id)}
              className={cn(
                'w-4 h-4 min-w-4 rounded border-2 flex items-center justify-center transition-all duration-300',
                task.completed ? 'border-transparent' : ''
              )}
              style={{
                borderColor: task.completed ? 'var(--accent)' : 'var(--border)',
                backgroundColor: task.completed ? 'var(--accent)' : 'transparent',
              }}
            >
              {task.completed && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Title */}
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(date, block.id, task.id, { title: e.target.value })}
              className={cn(
                'flex-1 text-sm bg-transparent border-none outline-none transition-all duration-200',
                task.completed && 'line-through'
              )}
              style={{ color: task.completed ? 'var(--text-tertiary)' : 'var(--text-primary)' }}
              placeholder="Task title..."
            />

            {/* Priority Indicator */}
            <div className="relative" ref={openPriorityId === task.id ? priorityRef : undefined}>
              <button
                onClick={() => setOpenPriorityId(openPriorityId === task.id ? null : task.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-opacity"
                style={{ opacity: hoveredTaskId === task.id || openPriorityId === task.id ? 1 : 0.6 }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                />
                <ChevronDown size={10} style={{ color: 'var(--text-tertiary)' }} />
              </button>

              {openPriorityId === task.id && (
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-lg shadow-lg py-1 min-w-[120px]"
                  style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)' }}
                >
                  {(Object.keys(PRIORITY_COLORS) as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        updateTask(date, block.id, task.id, { priority: p });
                        setOpenPriorityId(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:opacity-80 transition-opacity"
                      style={{
                        color: 'var(--text-primary)',
                        backgroundColor: task.priority === p ? 'var(--bg-tertiary)' : 'transparent',
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PRIORITY_COLORS[p] }}
                      />
                      {PRIORITY_LABELS[p]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Delete button */}
            <button
              onClick={() => deleteTask(date, block.id, task.id)}
              className={cn(
                'p-0.5 rounded transition-all duration-200',
                hoveredTaskId === task.id ? 'opacity-100' : 'opacity-0'
              )}
              style={{ color: 'var(--text-tertiary)' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Task */}
      {isAddingTask ? (
        <div className="flex items-center gap-2 mt-1 px-2">
          <div className="w-4 h-4 min-w-4" />
          <input
            ref={newTaskInputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTaskTitle.trim()) {
                setIsAddingTask(false);
              }
            }}
            className="flex-1 text-sm bg-transparent border-none outline-none"
            style={{ color: 'var(--text-primary)' }}
            placeholder="Task title..."
          />
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md text-xs transition-colors hover:opacity-80"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <Plus size={14} />
          Add task
        </button>
      )}
    </div>
  );
}
