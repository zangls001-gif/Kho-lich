import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Task, Priority } from '../../types';
import { formatDate, cn } from '../../utils/helpers';

const PRIORITY_BADGES: Record<Priority, { label: string; bg: string; text: string }> = {
  low: { label: 'Low', bg: '#dcfce7', text: '#15803d' },
  medium: { label: 'Medium', bg: '#fef3c7', text: '#b45309' },
  high: { label: 'High', bg: '#ffedd5', text: '#c2410c' },
  urgent: { label: 'Urgent', bg: '#fee2e2', text: '#b91c1c' },
};

export const TasksPage: React.FC = () => {
  const getAllTasks = useAppStore((s) => s.getAllTasks);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addTask = useAppStore((s) => s.addTask);
  const addBlock = useAppStore((s) => s.addBlock);
  const createOrGetDayPlanner = useAppStore((s) => s.createOrGetDayPlanner);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const selectedDate = useAppStore((s) => s.selectedDate);

  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState(selectedDate);
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  const allTasks = getAllTasks();
  const todayStr = formatDate(new Date());

  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      // Status filter
      if (filter === 'completed' && !t.completed) return false;
      if (filter === 'pending' && t.completed) return false;
      if (filter === 'overdue' && (t.completed || !t.dueDate || t.dueDate >= todayStr)) return false;
      if (filter === 'upcoming' && (t.completed || !t.dueDate || t.dueDate < todayStr)) return false;

      // Priority filter
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      return true;
    });
  }, [allTasks, filter, priorityFilter, todayStr]);

  const stats = useMemo(() => {
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.completed).length;
    const overdue = allTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr).length;
    const pending = total - completed;
    return { total, completed, overdue, pending };
  }, [allTasks, todayStr]);

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const planner = createOrGetDayPlanner(quickDate);
    let todoBlock = planner.blocks.find((b) => b.type === 'todo-list');

    if (!todoBlock) {
      addBlock(quickDate, 'todo-list');
      const updated = createOrGetDayPlanner(quickDate);
      todoBlock = updated.blocks.find((b) => b.type === 'todo-list');
    }

    if (todoBlock) {
      addTask(quickDate, todoBlock.id, {
        title: quickTitle.trim(),
        priority: quickPriority,
        dueDate: quickDate,
      });
      setQuickTitle('');
    }
  };

  const handleGoToDate = (date: string) => {
    setSelectedDate(date);
    setCurrentPage('today');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 transition-colors">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="p-6 rounded-2xl border shadow-sm flex flex-wrap items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <CheckSquare size={18} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Task Management
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage all your tasks across your calendar in one central place.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className="px-3 py-1.5 rounded-xl font-medium border"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <strong>{stats.pending}</strong> Pending
            </span>
            {stats.overdue > 0 && (
              <span className="px-3 py-1.5 rounded-xl font-medium bg-red-100 text-red-700">
                <strong>{stats.overdue}</strong> Overdue
              </span>
            )}
            <span
              className="px-3 py-1.5 rounded-xl font-medium border"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <strong>{stats.completed}</strong> Completed
            </span>
          </div>
        </div>

        {/* Quick Add Task Form */}
        <form
          onSubmit={handleQuickAddTask}
          className="p-4 rounded-2xl border shadow-sm flex flex-wrap items-center gap-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="Add a new task quickly..."
            className="flex-1 min-w-[200px] text-sm px-3.5 py-2 rounded-xl border outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />

          <input
            type="date"
            value={quickDate}
            onChange={(e) => setQuickDate(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as Priority)}
            className="text-xs px-3 py-2 rounded-xl border outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="urgent">Urgent Priority</option>
          </select>

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all disabled:opacity-40"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </form>

        {/* Filter Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex items-center p-1 rounded-xl border text-xs"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setFilter(id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-medium transition-all',
                  filter === id ? 'shadow-sm text-white' : 'hover:opacity-80'
                )}
                style={{
                  backgroundColor: filter === id ? 'var(--accent)' : 'transparent',
                  color: filter === id ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2 text-xs">
            <span style={{ color: 'var(--text-tertiary)' }}>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border bg-transparent outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div
              className="p-10 rounded-2xl border text-center"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                No tasks match your selected filter.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
              const isOverdue = !task.completed && task.dueDate && task.dueDate < todayStr;

              return (
                <div
                  key={`${task.date}-${task.id}`}
                  className="p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      onClick={() => toggleTask(task.date, task.blockId, task.id)}
                      className={cn(
                        'w-4 h-4 min-w-4 rounded border flex items-center justify-center transition-all',
                        task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : ''
                      )}
                      style={{
                        borderColor: task.completed ? 'var(--accent)' : 'var(--border)',
                        backgroundColor: task.completed ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {task.completed && <CheckCircle2 size={12} className="text-white" />}
                    </button>

                    <div className="truncate">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          task.completed && 'line-through opacity-60'
                        )}
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {task.title || 'Untitled Task'}
                      </span>
                      {task.description && (
                        <p className="text-xs truncate opacity-70" style={{ color: 'var(--text-secondary)' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Priority badge */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      style={{ backgroundColor: priorityInfo.bg, color: priorityInfo.text }}
                    >
                      {priorityInfo.label}
                    </span>

                    {/* Due date */}
                    <button
                      onClick={() => handleGoToDate(task.date)}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:underline',
                        isOverdue ? 'text-red-600 font-semibold' : 'text-neutral-500'
                      )}
                      title="Navigate to this day's workspace"
                    >
                      <Calendar size={12} />
                      <span>{task.date}</span>
                      <ArrowRight size={10} />
                    </button>

                    <button
                      onClick={() => deleteTask(task.date, task.blockId, task.id)}
                      className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
