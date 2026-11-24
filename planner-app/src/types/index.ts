// ===== Core Data Types =====

export type BlockType =
  | 'todo-list'
  | 'bullet-list'
  | 'numbered-list'
  | 'text'
  | 'heading'
  | 'divider'
  | 'reminder'
  | 'event'
  | 'time-block'
  | 'image';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ViewMode = 'day' | 'week' | 'month' | 'year';
export type ThemeMode = 'light' | 'dark';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible' | null;

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  tags: string[];
  completed: boolean;
  reminder: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  title: string;
  tasks: Task[];
}

export interface ScheduledEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  location: string;
  reminder: string | null;
  color: string;
  category: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  order: number;
  collapsed: boolean;
  // For todo-list blocks
  todoList?: TodoList;
  // For event blocks
  event?: ScheduledEvent;
  // For time-block blocks
  timeBlock?: {
    startTime: string;
    endTime: string;
    title: string;
    color: string;
  };
  // For bullet/numbered list blocks
  items?: string[];
  // For image blocks
  imageUrl?: string;
  imageCaption?: string;
  // For heading blocks
  headingLevel?: 1 | 2 | 3;
}

export interface DayPlanner {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  mood: Mood;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyTemplate {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  theme: ThemeMode;
  accentColor: string;
  backgroundColor: string;
  density: Density;
  sidebarCollapsed: boolean;
  calendarCollapsed: boolean;
  defaultView: ViewMode;
}

// Duplication types
export type DuplicationMode = 'individual' | 'range';

export type ContentOption =
  | 'everything'
  | 'tasks'
  | 'notes'
  | 'events'
  | 'selected';

export type ExistingContentHandling = 'replace' | 'merge' | 'skip';

export interface DuplicationConfig {
  mode: DuplicationMode;
  sourceDate: string;
  targetDates: string[];
  startDate?: string;
  endDate?: string;
  contentOption: ContentOption;
  resetCompletion: boolean;
  existingContentHandling: ExistingContentHandling;
  selectedBlockIds?: string[];
}

// Search
export interface SearchResult {
  type: 'task' | 'note' | 'event' | 'template';
  title: string;
  snippet: string;
  date?: string;
  id: string;
  blockId?: string;
}

// Navigation
export type Page = 'home' | 'calendar' | 'today' | 'notes' | 'tasks' | 'templates' | 'settings';
