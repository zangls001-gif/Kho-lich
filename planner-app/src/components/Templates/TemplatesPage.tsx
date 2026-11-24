import React, { useState } from 'react';
import {
  LayoutTemplate,
  Plus,
  Trash2,
  Calendar,
  Copy,
  Edit2,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DailyTemplate } from '../../types';
import { formatDate } from '../../utils/helpers';

export const TemplatesPage: React.FC = () => {
  const templates = useAppStore((s) => s.templates);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);
  const updateTemplate = useAppStore((s) => s.updateTemplate);
  const applyTemplate = useAppStore((s) => s.applyTemplate);
  const saveAsTemplate = useAppStore((s) => s.saveAsTemplate);
  const selectedDate = useAppStore((s) => s.selectedDate);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  // Apply dialog state
  const [applyingTemplate, setApplyingTemplate] = useState<DailyTemplate | null>(null);
  const [targetDate, setTargetDate] = useState<string>(selectedDate);
  const [additionalDates, setAdditionalDates] = useState<string[]>([]);
  const [newDateInput, setNewDateInput] = useState<string>('');

  // Editing template state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Pre-seed some default templates if empty
  const handleCreateSampleTemplates = () => {
    saveAsTemplate(selectedDate, 'Deep Work Routine', 'Includes morning warm-up, focus blocks, code tasks, and reflection');
    saveAsTemplate(selectedDate, 'Gym & Fitness Day', 'Workout checklist, nutrition notes, protein intake tracking');
    saveAsTemplate(selectedDate, 'Weekend Leisure', 'Relaxation, errands, reading list, personal hobbies');
  };

  const handleApply = () => {
    if (!applyingTemplate) return;

    // Apply to targetDate
    applyTemplate(applyingTemplate.id, targetDate);

    // Apply to additional dates if selected
    additionalDates.forEach((d) => {
      applyTemplate(applyingTemplate.id, d);
    });

    setSelectedDate(targetDate);
    setCurrentPage('today');
    setApplyingTemplate(null);
  };

  const handleStartEdit = (t: DailyTemplate) => {
    setEditingId(t.id);
    setEditName(t.name);
    setEditDesc(t.description);
  };

  const handleSaveEdit = (id: string) => {
    updateTemplate(id, { name: editName.trim(), description: editDesc.trim() });
    setEditingId(null);
  };

  const handleDuplicateTemplate = (t: DailyTemplate) => {
    saveAsTemplate(selectedDate, `${t.name} (Copy)`, t.description);
  };

  const handleAddAdditionalDate = () => {
    if (newDateInput && !additionalDates.includes(newDateInput) && newDateInput !== targetDate) {
      setAdditionalDates([...additionalDates, newDateInput]);
      setNewDateInput('');
    }
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
                <LayoutTemplate size={18} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Reusable Daily Templates
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Design a routine once and apply it effortlessly to any single day or multiple days.
            </p>
          </div>

          <button
            onClick={() => {
              saveAsTemplate(selectedDate, `Template from ${selectedDate}`);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Plus size={16} />
            <span>Save Today as New Template</span>
          </button>
        </div>

        {/* Templates List */}
        {templates.length === 0 ? (
          <div
            className="p-12 rounded-2xl border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}
            >
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              No templates saved yet
            </h3>
            <p className="text-xs max-w-sm mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>
              Templates let you reuse entire daily structures like Work Day, Study Routine, or Weekend Planner with one click.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCreateSampleTemplates}
                className="px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Load Starter Templates
              </button>
              <button
                onClick={() => saveAsTemplate(selectedDate, `Daily Routine (${selectedDate})`)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Save Current Day as Template
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => {
              const isEditing = editingId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  className="rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all hover:shadow-md"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div>
                    {/* Header: Title or Edit Form */}
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm font-bold px-2 py-1 rounded border outline-none"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={2}
                          className="w-full text-xs px-2 py-1 rounded border outline-none"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-primary)',
                          }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(tpl.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white bg-green-600"
                          >
                            <Check size={12} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs border"
                          >
                            <X size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                            {tpl.name}
                          </h3>
                          {tpl.description && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {tpl.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleStartEdit(tpl)}
                            className="p-1 rounded hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Edit template name & description"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicateTemplate(tpl)}
                            className="p-1 rounded hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--text-tertiary)' }}
                            title="Duplicate template"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => deleteTemplate(tpl.id)}
                            className="p-1 rounded hover:opacity-80 transition-opacity text-red-500"
                            title="Delete template"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Block summary badge */}
                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}
                      >
                        {tpl.blocks.length} content blocks
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        Created {new Date(tpl.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Blocks preview list */}
                    <div className="mt-3 space-y-1">
                      {tpl.blocks.slice(0, 3).map((b, idx) => (
                        <div
                          key={idx}
                          className="text-[11px] truncate px-2 py-0.5 rounded opacity-80"
                          style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                        >
                          • <span className="capitalize">{b.type.replace('-', ' ')}</span>:{' '}
                          {b.todoList?.title || b.event?.title || b.content.slice(0, 20) || 'Block'}
                        </div>
                      ))}
                      {tpl.blocks.length > 3 && (
                        <div className="text-[10px] italic px-2" style={{ color: 'var(--text-tertiary)' }}>
                          +{tpl.blocks.length - 3} more blocks
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-5 mt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button
                      onClick={() => {
                        setApplyingTemplate(tpl);
                        setTargetDate(selectedDate);
                        setAdditionalDates([]);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      <Calendar size={14} />
                      <span>Apply to Date...</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Template Modal */}
      {applyingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl border animate-scaleIn"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
          >
            <h2 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Apply "{applyingTemplate.name}"
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Choose which date (or multiple dates) to apply this template's {applyingTemplate.blocks.length} blocks to.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Primary Target Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border outline-none cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Apply to Multiple Dates */}
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                  Also Apply to Additional Dates (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border outline-none"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    onClick={handleAddAdditionalDate}
                    disabled={!newDateInput}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 disabled:opacity-40"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  >
                    + Add
                  </button>
                </div>

                {additionalDates.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {additionalDates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                      >
                        {d}
                        <button
                          onClick={() => setAdditionalDates(additionalDates.filter((x) => x !== d))}
                          className="hover:opacity-70 text-neutral-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setApplyingTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                <Check size={14} />
                <span>Apply to {1 + additionalDates.length} Date(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
