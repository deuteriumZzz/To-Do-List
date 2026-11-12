import { parseQuickAdd, type ISODate } from './dates'

export interface Todo {
  id: string
  text: string
  completed: boolean
  /** Highlighted as important; active priority tasks are listed first. */
  priority?: boolean
  due?: ISODate
  /** Lower-case project name from a `#tag` in the title. */
  project?: string
  /** When the task was completed (ms), used by the productivity report. */
  completedAt?: number
  createdAt: number
}

export type View = 'all' | 'today' | 'upcoming' | 'active' | 'completed' | 'calendar' | 'report'
export type ListView = Exclude<View, 'calendar' | 'report'>

export const LIST_VIEWS: ListView[] = ['all', 'today', 'upcoming', 'active', 'completed']
export const MAX_LENGTH = 200

export type Action =
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string; at: number }
  | { type: 'togglePriority'; id: string }
  | { type: 'setDue'; id: string; due: ISODate | null }
  | { type: 'edit'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'clearCompleted' }

/** Builds a todo from quick-add text, or returns null if no title is left. */
export function createTodo(raw: string, today: ISODate, defaults: { due?: ISODate } = {}): Todo | null {
  const parsed = parseQuickAdd(raw, today)
  if (!parsed.text) return null
  return {
    id: crypto.randomUUID(),
    text: parsed.text,
    completed: false,
    priority: parsed.priority,
    due: parsed.due ?? defaults.due,
    project: parsed.project,
    createdAt: Date.now(),
  }
}

export function todosReducer(todos: Todo[], action: Action): Todo[] {
  const patch = (id: string, change: (t: Todo) => Todo) => todos.map((t) => (t.id === id ? change(t) : t))
  switch (action.type) {
    case 'add':
      return [action.todo, ...todos]
    case 'toggle':
      return patch(action.id, (t) => ({
        ...t,
        completed: !t.completed,
        completedAt: t.completed ? undefined : action.at,
      }))
    case 'togglePriority':
      return patch(action.id, (t) => ({ ...t, priority: !t.priority }))
    case 'setDue':
      return patch(action.id, (t) => ({ ...t, due: action.due ?? undefined }))
    case 'edit':
      return patch(action.id, (t) => ({ ...t, text: action.text }))
    case 'remove':
      return todos.filter((t) => t.id !== action.id)
    case 'clearCompleted':
      return todos.filter((t) => !t.completed)
  }
}

export const isOverdue = (t: Todo, today: ISODate) => !t.completed && t.due !== undefined && t.due < today

export interface Query {
  view: ListView
  project: string | null
  search: string
  today: ISODate
}

const rank = (t: Todo) => (t.priority && !t.completed ? 1 : 0)

/** Tasks for a list view. Today includes overdue; priority tasks float up; Today/Upcoming sort by date. */
export function selectTodos(todos: Todo[], { view, project, search, today }: Query): Todo[] {
  const needle = search.trim().toLowerCase()
  const list = todos.filter((t) => {
    if (project !== null && t.project !== project) return false
    if (needle && !t.text.toLowerCase().includes(needle)) return false
    switch (view) {
      case 'active':
        return !t.completed
      case 'completed':
        return t.completed
      case 'today':
        return !t.completed && t.due !== undefined && t.due <= today
      case 'upcoming':
        return !t.completed && t.due !== undefined && t.due > today
      default:
        return true
    }
  })
  const byDate = view === 'today' || view === 'upcoming'
  return list.sort((a, b) => {
    const date = byDate ? (a.due ?? '').localeCompare(b.due ?? '') : 0
    return date || rank(b) - rank(a)
  })
}

export function viewCounts(todos: Todo[], today: ISODate): Record<ListView, number> {
  const counts = { all: todos.length, today: 0, upcoming: 0, active: 0, completed: 0 }
  for (const t of todos) {
    if (t.completed) counts.completed++
    else {
      counts.active++
      if (t.due !== undefined) counts[t.due <= today ? 'today' : 'upcoming']++
    }
  }
  return counts
}

/** Projects that exist because some task uses them, with their number of active tasks. */
export function projectCounts(todos: Todo[]): { name: string; count: number }[] {
  const map = new Map<string, number>()
  for (const t of todos) {
    if (t.project) map.set(t.project, (map.get(t.project) ?? 0) + (t.completed ? 0 : 1))
  }
  return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
}

export function getStats(todos: Todo[]) {
  const completed = todos.filter((t) => t.completed).length
  return { total: todos.length, active: todos.length - completed, completed }
}
