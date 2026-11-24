// Storage utility using localStorage
const STORAGE_KEYS = {
  DAY_PLANNERS: 'planner_app_days',
  TEMPLATES: 'planner_app_templates',
  SETTINGS: 'planner_app_settings',
} as const;

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.error(`Error loading from storage: ${key}`, e);
  }
  return defaultValue;
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving to storage: ${key}`, e);
  }
}

export { STORAGE_KEYS };
