import { isISODate, isTime } from './dates'
import { isLang, type Lang } from './i18n'
import type { Todo } from './todos'

export const STORAGE_KEY = 'todo-list:v1'
export const LANG_KEY = 'todo-list:lang'

/** Saved interface language, or null if none or storage is unavailable. */
export function loadLang(): Lang | null {
  try {
    const value = localStorage.getItem(LANG_KEY)
    return isLang(value) ? value : null
  } catch {
    return null
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    // the language simply is not remembered
  }
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    (t.priority === undefined || typeof t.priority === 'boolean') &&
    (t.due === undefined || isISODate(t.due)) &&
    (t.time === undefined || isTime(t.time)) &&
    (t.project === undefined || typeof t.project === 'string') &&
    (t.completedAt === undefined || typeof t.completedAt === 'number') &&
    typeof t.createdAt === 'number'
  )
}

/**
 * Reads saved todos. Never throws: missing, corrupted or wrongly shaped data
 * yields an empty list; invalid items inside a valid array are dropped.
 * `available` is false only when localStorage itself cannot be accessed.
 */
export function loadTodos(): { todos: Todo[]; available: boolean } {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return { todos: [], available: false }
  }
  if (raw === null) return { todos: [], available: true }
  try {
    const data: unknown = JSON.parse(raw)
    return { todos: Array.isArray(data) ? data.filter(isTodo) : [], available: true }
  } catch {
    return { todos: [], available: true }
  }
}

/** Returns false if the data could not be written. */
export function saveTodos(todos: Todo[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    return true
  } catch {
    return false
  }
}
