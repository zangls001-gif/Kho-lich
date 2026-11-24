import React, { useRef } from 'react';
import {
  Sun,
  Moon,
  Palette,
  Sliders,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  Layout,
  Eye,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeMode, Density, ViewMode } from '../../types';
import { cn } from '../../utils/helpers';

const ACCENT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Fuchsia', value: '#d946ef' },
];

const BACKGROUND_OPTIONS = [
  { name: 'Clean White', value: '#ffffff', darkValue: '#0f172a' },
  { name: 'Soft Gray / Slate', value: '#f8fafc', darkValue: '#020617' },
  { name: 'Pure Black / AMOLED', value: '#000000', darkValue: '#000000' },
  { name: 'Warm Paper', value: '#fafaf9', darkValue: '#1c1917' },
];

export const SettingsPage: React.FC = () => {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const dayPlanners = useAppStore((s) => s.dayPlanners);
  const templates = useAppStore((s) => s.templates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      dayPlanners,
      templates,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.dayPlanners && typeof parsed.dayPlanners === 'object') {
          localStorage.setItem('planner_app_days', JSON.stringify(parsed.dayPlanners));
        }
        if (parsed.templates && Array.isArray(parsed.templates)) {
          localStorage.setItem('planner_app_templates', JSON.stringify(parsed.templates));
        }
        if (parsed.settings) {
          localStorage.setItem('planner_app_settings', JSON.stringify(parsed.settings));
        }
        window.location.reload();
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to reset all planner data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 transition-colors">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Settings & Customization
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Personalize themes, colors, interface density, and manage your data.
          </p>
        </div>

        {/* 1. Theme Mode: Light vs Dark */}
        <div
          className="p-5 rounded-2xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Palette size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Appearance & Theme
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                settings.theme === 'light' ? 'ring-2' : 'hover:opacity-80'
              )}
              style={{
                backgroundColor: settings.theme === 'light' ? 'var(--bg-primary)' : 'transparent',
                borderColor: settings.theme === 'light' ? 'var(--accent)' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Sun size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold">Light Mode</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Crisp and clean for daytime productivity
                </div>
              </div>
              {settings.theme === 'light' && <Check size={16} className="ml-auto text-indigo-500" />}
            </button>

            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border text-left transition-all',
                settings.theme === 'dark' ? 'ring-2' : 'hover:opacity-80'
              )}
              style={{
                backgroundColor: settings.theme === 'dark' ? 'var(--bg-primary)' : 'transparent',
                borderColor: settings.theme === 'dark' ? 'var(--accent)' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="p-2 rounded-lg bg-indigo-900 text-indigo-300">
                <Moon size={20} />
              </div>
              <div>
                <div className="text-sm font-semibold">Dark Mode</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Easy on the eyes in low-light environments
                </div>
              </div>
              {settings.theme === 'dark' && <Check size={16} className="ml-auto text-indigo-500" />}
            </button>
          </div>

          {/* Accent Color Selection */}
          <div className="pt-2">
            <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-primary)' }}>
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {ACCENT_COLORS.map((col) => {
                const isSelected = settings.accentColor === col.value;
                return (
                  <button
                    key={col.value}
                    onClick={() => updateSettings({ accentColor: col.value })}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-transform hover:scale-105"
                    style={{
                      borderColor: isSelected ? col.value : 'var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: col.value }}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                    <span className="text-xs font-medium">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Interface Density */}
        <div
          className="p-5 rounded-2xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Sliders size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Interface Density
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'compact',
                label: 'Compact',
                desc: 'Smaller margins, high information density',
              },
              {
                id: 'comfortable',
                label: 'Comfortable',
                desc: 'Balanced spacing for optimal reading',
              },
              {
                id: 'spacious',
                label: 'Spacious',
                desc: 'Extra breathing room and larger cards',
              },
            ].map(({ id, label, desc }) => (
              <button
                key={id}
                onClick={() => updateSettings({ density: id as Density })}
                className={cn(
                  'p-3.5 rounded-xl border text-left transition-all',
                  settings.density === id ? 'ring-2' : 'hover:opacity-80'
                )}
                style={{
                  backgroundColor: settings.density === id ? 'var(--bg-primary)' : 'transparent',
                  borderColor: settings.density === id ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <div className="text-xs font-bold">{label}</div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Default Calendar View */}
        <div
          className="p-5 rounded-2xl border shadow-sm space-y-3"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Layout size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Default Calendar View
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['day', 'week', 'month', 'year'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => updateSettings({ defaultView: v })}
                className={cn(
                  'p-2.5 rounded-xl border text-center capitalize text-xs font-semibold transition-all',
                  settings.defaultView === v ? 'ring-2' : 'hover:opacity-80'
                )}
                style={{
                  backgroundColor: settings.defaultView === v ? 'var(--bg-primary)' : 'transparent',
                  borderColor: settings.defaultView === v ? 'var(--accent)' : 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {v} View
              </button>
            ))}
          </div>
        </div>

        {/* 4. Data Management: Backup & Export */}
        <div
          className="p-5 rounded-2xl border shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <Database size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Data & Persistence
            </h2>
          </div>

          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            All your planners, tasks, notes, templates, and events are automatically saved in local browser storage.
            You can export a JSON backup to keep your notes safe or transfer them between devices.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Download size={14} style={{ color: 'var(--accent)' }} />
              <span>Export JSON Backup</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              <Upload size={14} style={{ color: 'var(--accent)' }} />
              <span>Import Backup</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />

            <button
              onClick={handleClearAllData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 ml-auto transition-colors"
            >
              <RotateCcw size={14} />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
