import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Sidebar } from './components/Sidebar/Sidebar';
import { SearchDialog } from './components/Search/SearchDialog';
import { HomePage } from './pages/HomePage';
import { CalendarView } from './components/Calendar/CalendarView';
import { DailyPlanner } from './components/DailyPlanner/DailyPlanner';
import { NotesPage } from './components/Notes/NotesPage';
import { TasksPage } from './components/Tasks/TasksPage';
import { TemplatesPage } from './components/Templates/TemplatesPage';
import { SettingsPage } from './components/Settings/SettingsPage';
import { Page } from './types';

export function App() {
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const settings = useAppStore((s) => s.settings);
  const loadFromDisk = useAppStore((s) => s.loadFromDisk);
  const undo = useAppStore((s) => s.undo);
  const undoStack = useAppStore((s) => s.undoStack);
  const toggleSearch = useAppStore((s) => s.toggleSearch);

  // Load saved state on mount
  useEffect(() => {
    loadFromDisk();
  }, [loadFromDisk]);

  // Apply theme and accent color CSS variables dynamically
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (settings.accentColor) {
      root.style.setProperty('--accent', settings.accentColor);
    }
  }, [settings.theme, settings.accentColor]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea or contenteditable
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Ctrl/Cmd + K: Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Ctrl/Cmd + Z: Undo (when not inside standard input)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isInput) {
        e.preventDefault();
        undo();
        return;
      }

      // Quick navigation: Alt + 1-7
      if (e.altKey && !isNaN(Number(e.key))) {
        const num = Number(e.key);
        const pages: Page[] = ['home', 'calendar', 'today', 'notes', 'tasks', 'templates', 'settings'];
        if (num >= 1 && num <= pages.length) {
          e.preventDefault();
          setCurrentPage(pages[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch, undo, setCurrentPage]);

  // Render the current view
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'calendar':
        return <CalendarView />;
      case 'today':
        return <DailyPlanner />;
      case 'notes':
        return <NotesPage />;
      case 'tasks':
        return <TasksPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden transition-theme density-${settings.density}`}
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {renderCurrentPage()}
      </main>

      {/* Global Search Dialog Modal */}
      <SearchDialog />
    </div>
  );
}

export default App;
