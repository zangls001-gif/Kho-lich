import React, { useState, useMemo } from 'react';
import {
  StickyNote,
  Plus,
  Calendar,
  Search,
  ArrowRight,
  BookOpen,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatDate } from '../../utils/helpers';

export const NotesPage: React.FC = () => {
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const addBlock = useAppStore((s) => s.addBlock);
  const updateBlock = useAppStore((s) => s.updateBlock);
  const deleteBlock = useAppStore((s) => s.deleteBlock);
  const createOrGetDayPlanner = useAppStore((s) => s.createOrGetDayPlanner);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const selectedDate = useAppStore((s) => s.selectedDate);

  const [noteSearch, setNoteSearch] = useState('');
  const [quickNoteDate, setQuickNoteDate] = useState(selectedDate);
  const [quickNoteContent, setQuickNoteContent] = useState('');

  // Extract all text and heading blocks across all dates
  const allNotes = useMemo(() => {
    const list: Array<{
      date: string;
      blockId: string;
      type: string;
      content: string;
      headingLevel?: number;
    }> = [];

    Object.entries(dayPlanners).forEach(([date, planner]) => {
      planner.blocks.forEach((block) => {
        if (block.type === 'text' || block.type === 'heading') {
          list.push({
            date,
            blockId: block.id,
            type: block.type,
            content: block.content || '',
            headingLevel: block.headingLevel,
          });
        }
      });
    });

    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [dayPlanners]);

  const filteredNotes = useMemo(() => {
    if (!noteSearch.trim()) return allNotes;
    const lower = noteSearch.toLowerCase();
    return allNotes.filter(
      (n) => n.content.toLowerCase().includes(lower) || n.date.includes(lower)
    );
  }, [allNotes, noteSearch]);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteContent.trim()) return;

    createOrGetDayPlanner(quickNoteDate);
    addBlock(quickNoteDate, 'text');

    // Retrieve the newly created block and update its content
    setTimeout(() => {
      const planner = useAppStore.getState().dayPlanners[quickNoteDate];
      if (planner && planner.blocks.length > 0) {
        const lastBlock = planner.blocks[planner.blocks.length - 1];
        updateBlock(quickNoteDate, lastBlock.id, { content: quickNoteContent.trim() });
      }
    }, 50);

    setQuickNoteContent('');
  };

  const handleOpenDay = (date: string) => {
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
                <StickyNote size={18} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Integrated Notes & Journal
              </h1>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              All daily thoughts, ideas, study notes, and meeting logs in one searchable place.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {allNotes.length} Note{allNotes.length !== 1 ? 's' : ''} recorded
          </div>
        </div>

        {/* Quick Add Note Form */}
        <form
          onSubmit={handleCreateNote}
          className="p-5 rounded-2xl border shadow-sm space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Quick Note Entry
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Date:</span>
              <input
                type="date"
                value={quickNoteDate}
                onChange={(e) => setQuickNoteDate(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <textarea
            value={quickNoteContent}
            onChange={(e) => setQuickNoteContent(e.target.value)}
            placeholder="Write down ideas, meeting notes, reflections, or knowledge..."
            rows={3}
            className="w-full text-sm p-3 rounded-xl border outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!quickNoteContent.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Plus size={16} />
              <span>Save Note</span>
            </button>
          </div>
        </form>

        {/* Search Bar */}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={noteSearch}
            onChange={(e) => setNoteSearch(e.target.value)}
            placeholder="Search within notes by keywords or date..."
            className="flex-1 bg-transparent border-none outline-none text-xs"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div
            className="p-12 rounded-2xl border text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}
            >
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              No notes found
            </h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Add a quick note above or open any date's workspace to write long-form notes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={`${note.date}-${note.blockId}`}
                className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm transition-all hover:shadow-md"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent)' }}
                    >
                      <Calendar size={12} />
                      {note.date}
                    </span>

                    <button
                      onClick={() => deleteBlock(note.date, note.blockId)}
                      className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div
                    className="text-xs line-clamp-6 leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                    dangerouslySetInnerHTML={{ __html: note.content || '<em>Empty note</em>' }}
                  />
                </div>

                <div className="pt-3 mt-3 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => handleOpenDay(note.date)}
                    className="flex items-center gap-1 text-xs font-semibold hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Open in Daily Planner</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
