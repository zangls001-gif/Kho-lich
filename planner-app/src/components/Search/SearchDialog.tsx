import React, { useEffect, useRef } from 'react';
import {
  Search,
  X,
  CheckSquare,
  StickyNote,
  Calendar,
  LayoutTemplate,
  CalendarDays,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/helpers';

export const SearchDialog: React.FC = () => {
  const isSearchOpen = useAppStore((s) => s.isSearchOpen);
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const performSearch = useAppStore((s) => s.performSearch);
  const searchResults = useAppStore((s) => s.searchResults);
  const setSelectedDate = useAppStore((s) => s.setSelectedDate);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Handle Ctrl+K shortcut globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      } else if (e.key === 'Escape' && isSearchOpen) {
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, toggleSearch]);

  if (!isSearchOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    performSearch(q);
  };

  const handleSelectResult = (date?: string, page: 'today' | 'templates' = 'today') => {
    if (date) {
      setSelectedDate(date);
    }
    setCurrentPage(page);
    toggleSearch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center modal-backdrop pt-20 px-4">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl border animate-scaleIn overflow-hidden flex flex-col max-h-[75vh]"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
        >
          <Search size={18} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search tasks, notes, events, templates, dates..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                performSearch('');
              }}
              className="p-1 rounded hover:opacity-70 text-neutral-400"
            >
              <X size={16} />
            </button>
          )}
          <kbd
            className="px-2 py-0.5 text-[10px] font-semibold rounded border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-tertiary)' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {searchQuery.trim() === '' ? (
            <div className="text-center py-10" style={{ color: 'var(--text-tertiary)' }}>
              <p className="text-xs">Type anything to search across your whole planner.</p>
              <p className="text-[11px] mt-1 opacity-70">Tasks • Notes • Events • Templates • Dates</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--text-tertiary)' }}>
              <p className="text-xs">No results found for "{searchQuery}".</p>
            </div>
          ) : (
            searchResults.map((res) => {
              const Icon =
                res.type === 'task'
                  ? CheckSquare
                  : res.type === 'note'
                  ? StickyNote
                  : res.type === 'event'
                  ? Calendar
                  : LayoutTemplate;

              return (
                <button
                  key={`${res.type}-${res.id}`}
                  onClick={() =>
                    handleSelectResult(res.date, res.type === 'template' ? 'templates' : 'today')
                  }
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all hover:opacity-90 group"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                  }}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--accent)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {res.title || 'Untitled'}
                        </span>
                        <span
                          className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded"
                          style={{
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--accent)',
                          }}
                        >
                          {res.type}
                        </span>
                      </div>
                      <div className="text-xs truncate opacity-70 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {res.snippet}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {res.date && (
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                        {res.date}
                      </span>
                    )}
                    <ArrowRight
                      size={14}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--accent)' }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
