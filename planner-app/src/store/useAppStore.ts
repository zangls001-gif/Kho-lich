import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  DayPlanner, Block, Task, TodoList, ScheduledEvent, DailyTemplate,
  AppSettings, Page, ViewMode, Mood, Priority, DuplicationConfig,
  SearchResult, BlockType
} from '../types';
import { generateId, formatDate, getDatesBetween, getCompletionPercentage } from '../utils/helpers';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentColor: '#6366f1',
  backgroundColor: '#ffffff',
  density: 'comfortable',
  sidebarCollapsed: false,
  calendarCollapsed: false,
  defaultView: 'month',
};

interface UndoAction {
  type: string;
  data: unknown;
  timestamp: number;
}

interface AppState {
  // Navigation
  currentPage: Page;
  selectedDate: string;
  calendarViewMode: ViewMode;
  
  // Data
  dayPlanners: Record<string, DayPlanner>;
  templates: DailyTemplate[];
  settings: AppSettings;
  
  // UI State
  searchQuery: string;
  searchResults: SearchResult[];
  isSearchOpen: boolean;
  isSaving: boolean;
  undoStack: UndoAction[];
  
  // Navigation actions
  setCurrentPage: (page: Page) => void;
  setSelectedDate: (date: string) => void;
  setCalendarViewMode: (mode: ViewMode) => void;
  
  // Day Planner actions
  getDayPlanner: (date: string) => DayPlanner;
  createOrGetDayPlanner: (date: string) => DayPlanner;
  updateDayTitle: (date: string, title: string) => void;
  updateDayMood: (date: string, mood: Mood) => void;
  
  // Block actions
  addBlock: (date: string, type: BlockType, afterBlockId?: string) => void;
  updateBlock: (date: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (date: string, blockId: string) => void;
  reorderBlocks: (date: string, blocks: Block[]) => void;
  duplicateBlock: (date: string, blockId: string) => void;
  toggleBlockCollapse: (date: string, blockId: string) => void;
  
  // Task actions
  addTask: (date: string, blockId: string, task?: Partial<Task>) => void;
  updateTask: (date: string, blockId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (date: string, blockId: string, taskId: string) => void;
  toggleTask: (date: string, blockId: string, taskId: string) => void;
  updateTodoListTitle: (date: string, blockId: string, title: string) => void;
  
  // Event actions
  addEvent: (date: string, event: Partial<ScheduledEvent>) => void;
  updateEvent: (date: string, blockId: string, event: Partial<ScheduledEvent>) => void;
  deleteEvent: (date: string, blockId: string) => void;
  
  // List item actions
  addListItem: (date: string, blockId: string, item: string) => void;
  updateListItem: (date: string, blockId: string, index: number, item: string) => void;
  deleteListItem: (date: string, blockId: string, index: number) => void;
  
  // Template actions
  saveAsTemplate: (date: string, name: string, description?: string) => void;
  applyTemplate: (templateId: string, date: string) => void;
  updateTemplate: (templateId: string, updates: Partial<DailyTemplate>) => void;
  deleteTemplate: (templateId: string) => void;
  
  // Duplication
  duplicateDay: (config: DuplicationConfig) => void;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  performSearch: (query: string) => void;
  
  // Undo
  undo: () => void;
  
  // Persistence
  saveToDisk: () => void;
  loadFromDisk: () => void;
  
  // Utility
  getDatesWithContent: () => Set<string>;
  getCompletionForDate: (date: string) => number;
  getAllTasks: () => Array<Task & { date: string; blockId: string }>;
  getOverdueTasks: () => Array<Task & { date: string; blockId: string }>;
  getUpcomingTasks: () => Array<Task & { date: string; blockId: string }>;
}

function createDefaultBlock(type: BlockType, order: number): Block {
  const id = generateId();
  const base: Block = { id, type, content: '', order, collapsed: false };
  
  switch (type) {
    case 'todo-list':
      base.todoList = { id: generateId(), title: 'Tasks', tasks: [] };
      break;
    case 'bullet-list':
    case 'numbered-list':
      base.items = [''];
      break;
    case 'heading':
      base.headingLevel = 2;
      base.content = '';
      break;
    case 'event':
      base.event = {
        id: generateId(),
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        date: formatDate(new Date()),
        location: '',
        reminder: null,
        color: '#6366f1',
        category: '',
      };
      break;
    case 'time-block':
      base.timeBlock = {
        startTime: '09:00',
        endTime: '10:00',
        title: '',
        color: '#6366f1',
      };
      break;
    case 'image':
      base.imageUrl = '';
      base.imageCaption = '';
      break;
    default:
      break;
  }
  
  return base;
}

function createDefaultDayPlanner(date: string): DayPlanner {
  return {
    id: generateId(),
    date,
    title: '',
    mood: null,
    blocks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function deepCloneBlocks(blocks: Block[], resetCompletion: boolean): Block[] {
  return blocks.map((block, index) => {
    const newBlock: Block = {
      ...block,
      id: generateId(),
      order: index,
    };
    
    if (block.todoList) {
      newBlock.todoList = {
        ...block.todoList,
        id: generateId(),
        tasks: block.todoList.tasks.map(task => ({
          ...task,
          id: generateId(),
          completed: resetCompletion ? false : task.completed,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      };
    }
    
    if (block.event) {
      newBlock.event = { ...block.event, id: generateId() };
    }
    
    if (block.items) {
      newBlock.items = [...block.items];
    }
    
    if (block.timeBlock) {
      newBlock.timeBlock = { ...block.timeBlock };
    }
    
    return newBlock;
  });
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentPage: 'today',
    selectedDate: formatDate(new Date()),
    calendarViewMode: 'month',
    dayPlanners: {},
    templates: [],
    settings: DEFAULT_SETTINGS,
    searchQuery: '',
    searchResults: [],
    isSearchOpen: false,
    isSaving: false,
    undoStack: [],
    
    // Navigation
    setCurrentPage: (page) => set({ currentPage: page }),
    setSelectedDate: (date) => set({ selectedDate: date }),
    setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),
    
    // Day Planner
    getDayPlanner: (date) => {
      const { dayPlanners } = get();
      return dayPlanners[date] || createDefaultDayPlanner(date);
    },
    
    createOrGetDayPlanner: (date) => {
      const { dayPlanners } = get();
      if (dayPlanners[date]) return dayPlanners[date];
      
      const planner = createDefaultDayPlanner(date);
      set({
        dayPlanners: { ...dayPlanners, [date]: planner },
      });
      get().saveToDisk();
      return planner;
    },
    
    updateDayTitle: (date, title) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, title, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    updateDayMood: (date, mood) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, mood, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    // Block actions
    addBlock: (date, type, afterBlockId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      const blocks = [...planner.blocks];
      
      let insertIndex = blocks.length;
      if (afterBlockId) {
        const idx = blocks.findIndex(b => b.id === afterBlockId);
        if (idx >= 0) insertIndex = idx + 1;
      }
      
      const newBlock = createDefaultBlock(type, insertIndex);
      if (type === 'event' && newBlock.event) {
        newBlock.event.date = date;
      }
      
      blocks.splice(insertIndex, 0, newBlock);
      // Re-order
      blocks.forEach((b, i) => { b.order = i; });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    updateBlock: (date, blockId, updates) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b =>
        b.id === blockId ? { ...b, ...updates } : b
      );
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    deleteBlock: (date, blockId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      // Save undo
      const deletedBlock = planner.blocks.find(b => b.id === blockId);
      if (deletedBlock) {
        set({
          undoStack: [...get().undoStack.slice(-19), {
            type: 'deleteBlock',
            data: { date, block: deletedBlock },
            timestamp: Date.now(),
          }],
        });
      }
      
      const blocks = planner.blocks
        .filter(b => b.id !== blockId)
        .map((b, i) => ({ ...b, order: i }));
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    reorderBlocks: (date, blocks) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const reorderedBlocks = blocks.map((b, i) => ({ ...b, order: i }));
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks: reorderedBlocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    duplicateBlock: (date, blockId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blockIndex = planner.blocks.findIndex(b => b.id === blockId);
      if (blockIndex < 0) return;
      
      const original = planner.blocks[blockIndex];
      const cloned = deepCloneBlocks([original], false)[0];
      
      const blocks = [...planner.blocks];
      blocks.splice(blockIndex + 1, 0, cloned);
      blocks.forEach((b, i) => { b.order = i; });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    toggleBlockCollapse: (date, blockId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b =>
        b.id === blockId ? { ...b, collapsed: !b.collapsed } : b
      );
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    // Task actions
    addTask: (date, blockId, taskPartial) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      
      const newTask: Task = {
        id: generateId(),
        title: '',
        description: '',
        dueDate: date,
        dueTime: null,
        priority: 'medium',
        tags: [],
        completed: false,
        reminder: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...taskPartial,
      };
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.todoList) {
          return {
            ...b,
            todoList: {
              ...b.todoList,
              tasks: [...b.todoList.tasks, newTask],
            },
          };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    updateTask: (date, blockId, taskId, updates) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.todoList) {
          return {
            ...b,
            todoList: {
              ...b.todoList,
              tasks: b.todoList.tasks.map(t =>
                t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
              ),
            },
          };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    deleteTask: (date, blockId, taskId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.todoList) {
          return {
            ...b,
            todoList: {
              ...b.todoList,
              tasks: b.todoList.tasks.filter(t => t.id !== taskId),
            },
          };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    toggleTask: (date, blockId, taskId) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.todoList) {
          return {
            ...b,
            todoList: {
              ...b.todoList,
              tasks: b.todoList.tasks.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
              ),
            },
          };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    updateTodoListTitle: (date, blockId, title) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.todoList) {
          return {
            ...b,
            todoList: { ...b.todoList, title },
          };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    // Event actions
    addEvent: (date, eventPartial) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      
      const newEvent: ScheduledEvent = {
        id: generateId(),
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '10:00',
        date,
        location: '',
        reminder: null,
        color: '#6366f1',
        category: '',
        ...eventPartial,
      };
      
      const newBlock: Block = {
        id: generateId(),
        type: 'event',
        content: '',
        order: planner.blocks.length,
        collapsed: false,
        event: newEvent,
      };
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: {
            ...planner,
            blocks: [...planner.blocks, newBlock],
            updatedAt: new Date().toISOString(),
          },
        },
      });
      get().saveToDisk();
    },
    
    updateEvent: (date, blockId, eventUpdates) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.event) {
          return { ...b, event: { ...b.event, ...eventUpdates } };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    deleteEvent: (date, blockId) => {
      get().deleteBlock(date, blockId);
    },
    
    // List item actions
    addListItem: (date, blockId, item) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.items) {
          return { ...b, items: [...b.items, item] };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    updateListItem: (date, blockId, index, item) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.items) {
          const items = [...b.items];
          items[index] = item;
          return { ...b, items };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    deleteListItem: (date, blockId, index) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const blocks = planner.blocks.map(b => {
        if (b.id === blockId && b.items) {
          const items = b.items.filter((_, i) => i !== index);
          return { ...b, items };
        }
        return b;
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: { ...planner, blocks, updatedAt: new Date().toISOString() },
        },
      });
      get().saveToDisk();
    },
    
    // Template actions
    saveAsTemplate: (date, name, description) => {
      const { dayPlanners, templates } = get();
      const planner = dayPlanners[date];
      if (!planner) return;
      
      const template: DailyTemplate = {
        id: generateId(),
        name,
        description: description || '',
        blocks: deepCloneBlocks(planner.blocks, true),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({ templates: [...templates, template] });
      get().saveToDisk();
    },
    
    applyTemplate: (templateId, date) => {
      const { templates, dayPlanners } = get();
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      
      const planner = dayPlanners[date] || createDefaultDayPlanner(date);
      const clonedBlocks = deepCloneBlocks(template.blocks, true);
      
      // Update event dates
      clonedBlocks.forEach(block => {
        if (block.event) {
          block.event.date = date;
        }
      });
      
      set({
        dayPlanners: {
          ...dayPlanners,
          [date]: {
            ...planner,
            blocks: [...planner.blocks, ...clonedBlocks],
            updatedAt: new Date().toISOString(),
          },
        },
      });
      get().saveToDisk();
    },
    
    updateTemplate: (templateId, updates) => {
      const { templates } = get();
      set({
        templates: templates.map(t =>
          t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        ),
      });
      get().saveToDisk();
    },
    
    deleteTemplate: (templateId) => {
      const { templates } = get();
      set({ templates: templates.filter(t => t.id !== templateId) });
      get().saveToDisk();
    },
    
    // Duplication
    duplicateDay: (config) => {
      const { dayPlanners } = get();
      const sourcePlanner = dayPlanners[config.sourceDate];
      if (!sourcePlanner) return;
      
      let targetDates: string[] = [];
      
      if (config.mode === 'individual') {
        targetDates = config.targetDates;
      } else if (config.mode === 'range' && config.startDate && config.endDate) {
        targetDates = getDatesBetween(config.startDate, config.endDate);
      }
      
      // Filter source blocks based on content option
      let sourceBlocks = sourcePlanner.blocks;
      if (config.contentOption === 'tasks') {
        sourceBlocks = sourceBlocks.filter(b => b.type === 'todo-list');
      } else if (config.contentOption === 'notes') {
        sourceBlocks = sourceBlocks.filter(b => b.type === 'text' || b.type === 'heading');
      } else if (config.contentOption === 'events') {
        sourceBlocks = sourceBlocks.filter(b => b.type === 'event' || b.type === 'time-block');
      } else if (config.contentOption === 'selected' && config.selectedBlockIds) {
        sourceBlocks = sourceBlocks.filter(b => config.selectedBlockIds!.includes(b.id));
      }
      
      const updatedPlanners = { ...dayPlanners };
      
      targetDates.forEach(date => {
        if (date === config.sourceDate) return;
        
        const existing = updatedPlanners[date];
        const clonedBlocks = deepCloneBlocks(sourceBlocks, config.resetCompletion);
        
        // Update event dates in cloned blocks
        clonedBlocks.forEach(block => {
          if (block.event) {
            block.event.date = date;
          }
        });
        
        if (!existing || !existing.blocks.length) {
          // No existing content, just create
          updatedPlanners[date] = {
            ...(existing || createDefaultDayPlanner(date)),
            blocks: clonedBlocks,
            updatedAt: new Date().toISOString(),
          };
        } else {
          // Handle existing content
          switch (config.existingContentHandling) {
            case 'replace':
              updatedPlanners[date] = {
                ...existing,
                blocks: clonedBlocks,
                updatedAt: new Date().toISOString(),
              };
              break;
            case 'merge':
              const mergedBlocks = [...existing.blocks, ...clonedBlocks];
              mergedBlocks.forEach((b, i) => { b.order = i; });
              updatedPlanners[date] = {
                ...existing,
                blocks: mergedBlocks,
                updatedAt: new Date().toISOString(),
              };
              break;
            case 'skip':
              // Don't modify
              break;
          }
        }
      });
      
      set({ dayPlanners: updatedPlanners });
      get().saveToDisk();
    },
    
    // Settings
    updateSettings: (updates) => {
      const { settings } = get();
      const newSettings = { ...settings, ...updates };
      set({ settings: newSettings });
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
    },
    
    // Search
    setSearchQuery: (query) => set({ searchQuery: query }),
    toggleSearch: () => set(state => ({ isSearchOpen: !state.isSearchOpen })),
    
    performSearch: (query) => {
      if (!query.trim()) {
        set({ searchResults: [] });
        return;
      }
      
      const { dayPlanners, templates } = get();
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();
      
      Object.entries(dayPlanners).forEach(([date, planner]) => {
        planner.blocks.forEach(block => {
          if (block.type === 'todo-list' && block.todoList) {
            block.todoList.tasks.forEach(task => {
              if (task.title.toLowerCase().includes(lowerQuery) ||
                  task.description.toLowerCase().includes(lowerQuery)) {
                results.push({
                  type: 'task',
                  title: task.title,
                  snippet: task.description || `Task in ${block.todoList!.title}`,
                  date,
                  id: task.id,
                  blockId: block.id,
                });
              }
            });
          } else if (block.type === 'text' || block.type === 'heading') {
            if (block.content.toLowerCase().includes(lowerQuery)) {
              results.push({
                type: 'note',
                title: block.content.substring(0, 50),
                snippet: block.content.substring(0, 100),
                date,
                id: block.id,
              });
            }
          } else if (block.type === 'event' && block.event) {
            if (block.event.title.toLowerCase().includes(lowerQuery) ||
                block.event.description.toLowerCase().includes(lowerQuery)) {
              results.push({
                type: 'event',
                title: block.event.title,
                snippet: block.event.description || `${block.event.startTime} - ${block.event.endTime}`,
                date,
                id: block.event.id,
                blockId: block.id,
              });
            }
          }
        });
      });
      
      templates.forEach(template => {
        if (template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery)) {
          results.push({
            type: 'template',
            title: template.name,
            snippet: template.description,
            id: template.id,
          });
        }
      });
      
      set({ searchResults: results });
    },
    
    // Undo
    undo: () => {
      const { undoStack, dayPlanners } = get();
      if (undoStack.length === 0) return;
      
      const lastAction = undoStack[undoStack.length - 1];
      const newStack = undoStack.slice(0, -1);
      
      if (lastAction.type === 'deleteBlock') {
        const { date, block } = lastAction.data as { date: string; block: Block };
        const planner = dayPlanners[date];
        if (planner) {
          const blocks = [...planner.blocks, block].sort((a, b) => a.order - b.order);
          set({
            dayPlanners: {
              ...dayPlanners,
              [date]: { ...planner, blocks },
            },
            undoStack: newStack,
          });
          get().saveToDisk();
        }
      }
      
      set({ undoStack: newStack });
    },
    
    // Persistence
    saveToDisk: () => {
      const { dayPlanners, templates, settings } = get();
      set({ isSaving: true });
      saveToStorage(STORAGE_KEYS.DAY_PLANNERS, dayPlanners);
      saveToStorage(STORAGE_KEYS.TEMPLATES, templates);
      saveToStorage(STORAGE_KEYS.SETTINGS, settings);
      setTimeout(() => set({ isSaving: false }), 500);
    },
    
    loadFromDisk: () => {
      const dayPlanners = loadFromStorage<Record<string, DayPlanner>>(STORAGE_KEYS.DAY_PLANNERS, {});
      const templates = loadFromStorage<DailyTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
      const settings = loadFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      set({ dayPlanners, templates, settings });
    },
    
    // Utility
    getDatesWithContent: () => {
      const { dayPlanners } = get();
      const dates = new Set<string>();
      Object.entries(dayPlanners).forEach(([date, planner]) => {
        if (planner.blocks.length > 0) {
          dates.add(date);
        }
      });
      return dates;
    },
    
    getCompletionForDate: (date) => {
      const { dayPlanners } = get();
      const planner = dayPlanners[date];
      if (!planner) return 0;
      return getCompletionPercentage(planner.blocks);
    },
    
    getAllTasks: () => {
      const { dayPlanners } = get();
      const tasks: Array<Task & { date: string; blockId: string }> = [];
      
      Object.entries(dayPlanners).forEach(([date, planner]) => {
        planner.blocks.forEach(block => {
          if (block.type === 'todo-list' && block.todoList) {
            block.todoList.tasks.forEach(task => {
              tasks.push({ ...task, date, blockId: block.id });
            });
          }
        });
      });
      
      return tasks;
    },
    
    getOverdueTasks: () => {
      const today = formatDate(new Date());
      return get().getAllTasks().filter(task => 
        !task.completed && task.dueDate && task.dueDate < today
      );
    },
    
    getUpcomingTasks: () => {
      const today = formatDate(new Date());
      return get().getAllTasks().filter(task => 
        !task.completed && task.dueDate && task.dueDate >= today
      ).sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    },
  }))
);
