import React from 'react';
import {
  Home,
  Calendar,
  CalendarDays,
  StickyNote,
  CheckSquare,
  LayoutTemplate,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../utils/helpers';
import { Page } from '../../types';
import { MiniCalendar } from './MiniCalendar';

interface NavItem {
  id: Page;
  label: string;
  icon: React.FC<{ size?: number }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const currentPage = useAppStore((s) => s.currentPage);
  const setCurrentPage = useAppStore((s) => s.setCurrentPage);
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const isSaving = useAppStore((s) => s.isSaving);
  const toggleSearch = useAppStore((s) => s.toggleSearch);

  const collapsed = settings.sidebarCollapsed;

  const handleToggle = () => {
    updateSettings({ sidebarCollapsed: !collapsed });
  };

  return (
    <aside
      className="relative flex flex-col h-full shrink-0 border-r overflow-hidden transition-all duration-300 ease-in-out select-none"
      style={{
        width: collapsed ? 64 : 240,
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      {/* ====== Header: Logo + search ====== */}
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          {/* Logo dot */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-white text-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            P
          </div>
          {/* App name */}
          <span
            className={cn(
              'font-semibold text-base whitespace-nowrap transition-opacity duration-200',
              collapsed ? 'opacity-0 w-0' : 'opacity-100'
            )}
            style={{ color: 'var(--text-primary)' }}
          >
            Planner
          </span>
        </div>

        {/* Search button (only visible when expanded) */}
        {!collapsed && (
          <button
            onClick={toggleSearch}
            className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
            title="Search (Ctrl+K)"
          >
            <Search size={16} />
          </button>
        )}
      </div>

      {/* Search button when collapsed */}
      {collapsed && (
        <button
          onClick={toggleSearch}
          className="mx-auto mb-1 p-2 rounded-lg hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          title="Search"
        >
          <Search size={18} />
        </button>
      )}

      {/* ====== Navigation ====== */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;

          return (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={cn(
                'w-full flex items-center gap-3 rounded-lg transition-all duration-150',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2',
                'hover:opacity-90'
              )}
              style={{
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
              }}
              title={collapsed ? label : undefined}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Icon size={18} />
              {!collapsed && (
                <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ====== Mini Calendar (expanded only) ====== */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden border-t',
          collapsed ? 'max-h-0 opacity-0' : 'max-h-72 opacity-100'
        )}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="pt-2">
          <MiniCalendar />
        </div>
      </div>

      {/* ====== Footer: Collapse toggle + saving indicator ====== */}
      <div
        className="flex items-center justify-between px-3 h-11 shrink-0 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Saving indicator */}
        <div className="flex items-center gap-2">
          {isSaving && (
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--accent)' }}
              title="Saving..."
            />
          )}
          {!collapsed && isSaving && (
            <span
              className="text-[11px] font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Saving…
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={handleToggle}
          className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
