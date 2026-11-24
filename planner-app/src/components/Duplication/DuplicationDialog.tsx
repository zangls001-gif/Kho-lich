import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Copy,
  Layers,
  CalendarRange,
  CalendarCheck,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import {
  DuplicationConfig,
  DuplicationMode,
  ContentOption,
  ExistingContentHandling,
} from '../../types';
import {
  formatDate,
  parseDate,
  getDatesBetween,
  getDaysInMonth,
  getFirstDayOfMonth,
  getShortMonthName,
  cn,
} from '../../utils/helpers';

interface DuplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDate: string;
}

export const DuplicationDialog: React.FC<DuplicationDialogProps> = ({
  isOpen,
  onClose,
  sourceDate,
}) => {
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const duplicateDay = useAppStore((s) => s.duplicateDay);

  const sourcePlanner = dayPlanners[sourceDate];

  // Mode: individual or range
  const [mode, setMode] = useState<DuplicationMode>('individual');

  // Mode A: Individual selected dates
  const [targetDates, setTargetDates] = useState<string[]>([]);

  // Mode B: Date range
  const [startDate, setStartDate] = useState<string>(sourceDate);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = parseDate(sourceDate);
    d.setDate(d.getDate() + 7);
    return formatDate(d);
  });

  // Calendar navigation for Mode A
  const [calYear, setCalYear] = useState(() => parseDate(sourceDate).getFullYear());
  const [calMonth, setCalMonth] = useState(() => parseDate(sourceDate).getMonth());

  // Content options
  const [contentOption, setContentOption] = useState<ContentOption>('everything');
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(() =>
    sourcePlanner ? sourcePlanner.blocks.map((b) => b.id) : []
  );

  // Completion status
  const [resetCompletion, setResetCompletion] = useState<boolean>(true);

  // Existing content handling
  const [existingContentHandling, setExistingContentHandling] =
    useState<ExistingContentHandling>('merge');

  // Overwrite confirmation modal state
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);

  // Calculate target dates list depending on mode
  const effectiveTargetDates = useMemo(() => {
    if (mode === 'individual') {
      return targetDates.filter((d) => d !== sourceDate);
    } else {
      if (!startDate || !endDate || startDate > endDate) return [];
      return getDatesBetween(startDate, endDate).filter((d) => d !== sourceDate);
    }
  }, [mode, targetDates, sourceDate, startDate, endDate]);

  // Identify dates that already have existing content
  const conflictingDates = useMemo(() => {
    return effectiveTargetDates.filter(
      (d) => dayPlanners[d] && dayPlanners[d].blocks.length > 0
    );
  }, [effectiveTargetDates, dayPlanners]);

  if (!isOpen) return null;

  // Toggle individual date selection
  const toggleDateSelection = (dateStr: string) => {
    if (dateStr === sourceDate) return;
    if (targetDates.includes(dateStr)) {
      setTargetDates(targetDates.filter((d) => d !== dateStr));
    } else {
      setTargetDates([...targetDates, dateStr].sort());
    }
  };

  // Select a preset (e.g., Next 7 Days, Next 30 Days, All Weekdays)
  const handlePresetSelect = (preset: 'next7' | 'next30' | 'weekdays') => {
    const base = parseDate(sourceDate);
    const dates: string[] = [];
    const count = preset === 'next7' ? 7 : preset === 'next30' ? 30 : 14;

    for (let i = 1; i <= count; i++) {
      const d = new Date(base);
      d.setDate(d.getDate() + i);
      if (preset === 'weekdays') {
        const day = d.getDay();
        if (day !== 0 && day !== 6) {
          dates.push(formatDate(d));
        }
      } else {
        dates.push(formatDate(d));
      }
    }
    setTargetDates(dates);
  };

  const handleExecuteDuplication = () => {
    // If replacing and there are conflicting dates, confirm first
    if (existingContentHandling === 'replace' && conflictingDates.length > 0 && !showConfirmOverwrite) {
      setShowConfirmOverwrite(true);
      return;
    }

    const config: DuplicationConfig = {
      mode,
      sourceDate,
      targetDates: effectiveTargetDates,
      startDate: mode === 'range' ? startDate : undefined,
      endDate: mode === 'range' ? endDate : undefined,
      contentOption,
      resetCompletion,
      existingContentHandling,
      selectedBlockIds: contentOption === 'selected' ? selectedBlockIds : undefined,
    };

    duplicateDay(config);
    setShowConfirmOverwrite(false);
    onClose();
  };

  // Calendar calculations for Mode A
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4 overflow-y-auto">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border animate-scaleIn overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Copy size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Duplicate Daily Schedule
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Source date: <span className="font-semibold">{sourceDate}</span> ({sourcePlanner?.blocks.length || 0} blocks)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Mode Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-tertiary)' }}>
              1. Choose Duplication Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('individual')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  mode === 'individual' ? 'ring-2' : 'hover:opacity-90'
                )}
                style={{
                  backgroundColor: mode === 'individual' ? 'var(--bg-secondary)' : 'transparent',
                  borderColor: mode === 'individual' ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    backgroundColor: mode === 'individual' ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: mode === 'individual' ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <CalendarCheck size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mode A: Select Specific Dates</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Pick multiple non-consecutive dates on calendar
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('range')}
                className={cn(
                  'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                  mode === 'range' ? 'ring-2' : 'hover:opacity-90'
                )}
                style={{
                  backgroundColor: mode === 'range' ? 'var(--bg-secondary)' : 'transparent',
                  borderColor: mode === 'range' ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div
                  className="p-2 rounded-lg shrink-0"
                  style={{
                    backgroundColor: mode === 'range' ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: mode === 'range' ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  <CalendarRange size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mode B: Continuous Date Range</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Distribute across every day from start to end date
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Mode Target Selection Area */}
          {mode === 'individual' ? (
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Click dates to select or unselect ({targetDates.length} selected):
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Presets:</span>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('next7')}
                    className="px-2 py-0.5 text-xs rounded border hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    +7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('next30')}
                    className="px-2 py-0.5 text-xs rounded border hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSelect('weekdays')}
                    className="px-2 py-0.5 text-xs rounded border hover:opacity-80"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    Weekdays
                  </button>
                  {targetDates.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTargetDates([])}
                      className="px-2 py-0.5 text-xs rounded text-red-500 hover:opacity-80 ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Monthly Interactive Calendar */}
              <div
                className="p-3 rounded-xl border max-w-md mx-auto shadow-sm"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                    {getShortMonthName(calMonth)} {calYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1 rounded hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`blank-${i}`} className="h-7" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDate(new Date(calYear, calMonth, day));
                    const isSource = dateStr === sourceDate;
                    const isSelected = targetDates.includes(dateStr);
                    const hasData = dayPlanners[dateStr] && dayPlanners[dateStr].blocks.length > 0;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        disabled={isSource}
                        onClick={() => toggleDateSelection(dateStr)}
                        className={cn(
                          'h-7 rounded-lg text-xs font-medium relative flex items-center justify-center transition-all',
                          isSource ? 'opacity-40 cursor-not-allowed line-through' : 'hover:scale-105'
                        )}
                        style={{
                          backgroundColor: isSelected
                            ? 'var(--accent)'
                            : isSource
                            ? 'var(--bg-tertiary)'
                            : 'transparent',
                          color: isSelected ? '#ffffff' : 'var(--text-primary)',
                          border: isSource ? '1px dashed var(--border)' : undefined,
                        }}
                        title={isSource ? 'Source Date' : dateStr}
                      >
                        {day}
                        {hasData && !isSelected && (
                          <span
                            className="absolute bottom-1 w-1 h-1 rounded-full"
                            style={{ backgroundColor: 'var(--accent)' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Dates preview pill list */}
              {targetDates.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-1">
                  {targetDates.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {d}
                      <button
                        type="button"
                        onClick={() => toggleDateSelection(d)}
                        className="hover:opacity-70 text-neutral-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Mode B: Date Range Input */
            <div
              className="p-4 rounded-xl border space-y-3"
              style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none cursor-pointer"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--text-secondary)' }}>
                <span>
                  Number of days affected:{' '}
                  <strong className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    {effectiveTargetDates.length} days
                  </strong>
                </span>
                {effectiveTargetDates.length > 90 && (
                  <span className="text-amber-500 flex items-center gap-1 font-medium">
                    <AlertTriangle size={14} /> Large batch will be processed efficiently
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Content Selection Options */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-tertiary)' }}>
              2. Content to Duplicate
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'everything', label: 'Everything (All Blocks)' },
                { id: 'tasks', label: 'To-do Lists & Tasks only' },
                { id: 'notes', label: 'Notes & Text only' },
                { id: 'events', label: 'Events & Time Blocks only' },
                { id: 'selected', label: 'Pick Selected Blocks' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setContentOption(id as ContentOption)}
                  className={cn(
                    'px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all',
                    contentOption === id ? 'ring-2' : 'hover:opacity-80'
                  )}
                  style={{
                    backgroundColor: contentOption === id ? 'var(--bg-secondary)' : 'transparent',
                    borderColor: contentOption === id ? 'var(--accent)' : 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: contentOption === id ? 'var(--accent)' : 'var(--border)',
                        backgroundColor: contentOption === id ? 'var(--accent)' : 'transparent',
                      }}
                    >
                      {contentOption === id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span>{label}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* If "Pick Selected Blocks" is chosen, show checkboxes */}
            {contentOption === 'selected' && sourcePlanner && (
              <div
                className="mt-3 p-3 rounded-xl border max-h-40 overflow-y-auto space-y-1.5"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <div className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Check the blocks you want to duplicate:
                </div>
                {sourcePlanner.blocks.map((block) => {
                  const isChecked = selectedBlockIds.includes(block.id);
                  return (
                    <label
                      key={block.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer hover:bg-black/5"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedBlockIds(selectedBlockIds.filter((id) => id !== block.id));
                          } else {
                            setSelectedBlockIds([...selectedBlockIds, block.id]);
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize font-medium">{block.type.replace('-', ' ')}</span>
                      <span className="truncate opacity-70 text-[11px]">
                        {block.todoList?.title || block.event?.title || block.content.slice(0, 30) || 'Block'}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Completion Status & Existing Content Handling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completion Status */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-tertiary)' }}>
                3. Task Completion Status
              </label>
              <div
                className="p-3 rounded-xl border space-y-2"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={resetCompletion}
                    onChange={(e) => setResetCompletion(e.target.checked)}
                    className="mt-0.5 rounded cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      Reset tasks to incomplete (Default)
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Duplicated days start fresh with unchecked checkboxes.
                    </span>
                  </div>
                </label>

                {!resetCompletion && (
                  <div className="text-[11px] text-amber-600 font-medium">
                    Note: Tasks will retain their current checked/completed state.
                  </div>
                )}
              </div>
            </div>

            {/* Existing Content Handling */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-tertiary)' }}>
                4. Existing Content Handling
              </label>
              <div
                className="p-3 rounded-xl border space-y-2"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                {[
                  {
                    id: 'merge',
                    label: 'Merge (Recommended)',
                    desc: 'Append duplicated blocks to target day without losing existing work',
                  },
                  {
                    id: 'replace',
                    label: 'Replace / Overwrite',
                    desc: 'Clear target days and replace with source content',
                  },
                  {
                    id: 'skip',
                    label: 'Skip',
                    desc: 'Do not touch target days that already have content',
                  },
                ].map(({ id, label, desc }) => (
                  <label key={id} className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="existingHandling"
                      value={id}
                      checked={existingContentHandling === id}
                      onChange={() => setExistingContentHandling(id as ExistingContentHandling)}
                      className="mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                        {label}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Operation Summary Preview */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="text-xs space-y-0.5">
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                Duplication Preview:
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Duplicating to <strong>{effectiveTargetDates.length} target dates</strong> ({conflictingDates.length} currently have data)
                using <strong className="capitalize">{existingContentHandling}</strong> mode.
              </div>
            </div>

            <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-black/10">
              {effectiveTargetDates.length} days
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecuteDuplication}
            disabled={effectiveTargetDates.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-40 hover:opacity-95"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Copy size={14} />
            <span>Duplicate Schedule to {effectiveTargetDates.length} Days</span>
          </button>
        </div>
      </div>

      {/* Confirmation Overwrite Modal */}
      {showConfirmOverwrite && (
        <div className="fixed inset-0 z-60 flex items-center justify-center modal-backdrop p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl border animate-scaleIn"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3 mb-3 text-amber-500">
              <AlertTriangle size={24} />
              <h3 className="text-base font-bold text-red-500">Confirm Overwrite</h3>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              You selected <strong>Replace / Overwrite</strong>. This will completely overwrite existing content on{' '}
              <strong className="text-red-500">{conflictingDates.length} dates</strong> (including{' '}
              {conflictingDates.slice(0, 3).join(', ')}
              {conflictingDates.length > 3 ? ` and ${conflictingDates.length - 3} more` : ''}).
              <br />
              This action cannot be fully undone. Are you sure you want to proceed?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmOverwrite(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={() => {
                  const config: DuplicationConfig = {
                    mode,
                    sourceDate,
                    targetDates: effectiveTargetDates,
                    startDate: mode === 'range' ? startDate : undefined,
                    endDate: mode === 'range' ? endDate : undefined,
                    contentOption,
                    resetCompletion,
                    existingContentHandling,
                    selectedBlockIds: contentOption === 'selected' ? selectedBlockIds : undefined,
                  };
                  duplicateDay(config);
                  setShowConfirmOverwrite(false);
                  onClose();
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-500 hover:bg-red-600 shadow-sm"
              >
                Yes, Overwrite & Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
