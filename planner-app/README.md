# Minimalist Personal Planner, Calendar & Notes Web Application

A modern, minimalist, and fully customizable personal productivity web workspace inspired by Notion, Google Calendar, Todoist, and Apple Calendar. It combines daily planning, flexible calendar views, checkbox task management, rich-text notes, scheduled events, reusable daily templates, and an advanced bulk schedule duplication engine.

---

## 🌟 Key Features

### 1. Daily Planner & Flexible Content Blocks
- **Independent Workspace per Date**: Every date has its own planning page with focus title, mood tracker (😊, 🙂, 😐, 😕, 😢), and live completion progress.
- **10 Modular Block Types**:
  1. **To-Do List**: Checkbox tasks with priority badges (Urgent, High, Medium, Low), inline title editing, and completion states.
  2. **Bullet List**: Flexible bullet points for quick note-taking.
  3. **Numbered List**: Ordered lists with automatic item sequencing.
  4. **Text / Notes**: Rich-text editing area with keyboard shortcuts (Ctrl+B, Ctrl+I).
  5. **Headings**: Section headers supporting H1, H2, and H3 levels.
  6. **Scheduled Events**: Visual time-blocked calendar cards with start/end time, category tags, location, and color tagging.
  7. **Time Blocks**: Hourly activity scheduling blocks.
  8. **Reminders**: Time-sensitive notification callouts.
  9. **Images**: Embed images with custom captions.
  10. **Dividers**: Clean visual separators between sections.
- **Drag-and-Drop Organization**: Reorder blocks freely using `@dnd-kit/core` and `@dnd-kit/sortable`, move blocks up/down, duplicate individual blocks, and collapse/expand blocks.

### 2. Multi-View Calendar System
- **4 View Modes**:
  - **Day View**: Hourly schedule with event details and daily task breakdown.
  - **Week View**: 7-day time slot grid with live current-time indicator line and click-to-schedule.
  - **Month View**: Standard 6-row month calendar displaying date indicators, event chips, and task counts.
  - **Year View**: 12-month bird's-eye overview grid with quick jump to any month or date.
- **Date Navigation**: Previous / Next buttons, "Today" button, custom date picker, and direct date click navigation.
- **Collapsible Mini Calendar**: Compact monthly calendar embedded in the sidebar for rapid date jumping and content indicators.

### 3. Critical Feature: Schedule Duplication Engine
Duplicate an entire daily schedule without recreating it from scratch:
- **Mode A (Select Individual Dates)**:
  - Interactive multi-date calendar picker.
  - Non-consecutive date selection (e.g. Jan 5, Jan 10, Feb 3).
  - Quick presets: "+7 Days", "+30 Days", "Weekdays".
  - Selected date tag preview and easy removal.
- **Mode B (Continuous Date Range)**:
  - Start Date and End Date range pickers.
  - Real-time calculation of affected days.
  - Scalable and efficient for large multi-month ranges.
- **Independent Copies**:
  - Creates brand-new unique IDs for all duplicated blocks and tasks.
  - Modifying a duplicated date never affects the source day.
  - Default resets all task checkboxes to incomplete for a fresh start (or optional preserve status).
- **Existing Content Handling**:
  - **Merge**: Safely append duplicated content to target dates without losing existing blocks.
  - **Replace**: Clean target dates and replace with source content (with overwrite confirmation modal).
  - **Skip**: Omit target dates that already contain existing content.
- **Content Filtering**:
  - Choose to duplicate everything, tasks only, notes only, events only, or pick specific blocks.

### 4. Reusable Daily Templates
- Save any daily planner as a named template (e.g., *Deep Work Routine*, *Gym & Fitness Day*, *Weekend Leisure*).
- Preview template block structures.
- Rename, edit descriptions, or delete templates.
- One-click application to any primary target date or multiple additional dates.
- Duplicate templates with ease.

### 5. Centralized Task & Notes Management
- **Tasks Page**: Consolidated view of all tasks across all dates, filtered by All, Pending, Overdue, Upcoming, and Completed, with priority filters and quick-add form.
- **Notes Page**: Central repository of all notes, reflections, and ideas with keyword search and direct links to origin dates.
- **Home Dashboard**: Today's overview, daily completion gauge, overdue task alerts, today's schedule, and quick action shortcuts.

### 6. Theme & Interface Customization
- **Light & Dark Mode**: Instant theme switching without refreshing the page.
- **Accent Colors**: Custom color themes (Indigo, Blue, Emerald, Rose, Amber, Violet, Cyan, Fuchsia).
- **Adjustable Density**: Compact, Comfortable, and Spacious options.
- **Default Calendar View**: Configurable startup calendar view.

### 7. Reliable Data Persistence & Global Search
- **Auto-Saving & Persistence**: Built with Zustand and LocalStorage. Content is saved continuously with a visual saving indicator.
- **Data Backup & Restore**: One-click JSON backup export and import functionality.
- **Global Search (`Ctrl+K`)**: Rapid debounced search across all tasks, notes, events, templates, and dates with instant navigation.
- **Keyboard Shortcuts**:
  - `Ctrl + K`: Open Global Search.
  - `Ctrl + Z`: Undo last block deletion.
  - `Alt + 1` to `Alt + 7`: Instant navigation between main pages.
  - `Ctrl + B` / `Ctrl + I`: Rich text bold and italic formatting.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 + Custom CSS Variables
- **State Management**: Zustand
- **Icons**: Lucide React
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## 🚀 Getting Started

### 1. Installation

```bash
cd planner-app
npm install
```

### 2. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### 3. Production Build & Preview

```bash
npm run build
npm run preview
```
