export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export type Filter = 'all' | 'active' | 'completed'

export type Action =
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }

export const MAX_LENGTH = 200

/** Builds a todo from raw input, or returns null if the text is blank. */
export function createTodo(raw: string): Todo | null {
  const text = raw.trim()
  if (!text) return null
  return { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() }
}

export function todosReducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case 'add':
      return [action.todo, ...todos]
    case 'toggle':
      return todos.map((t) => (t.id === action.id ? { ...t, completed: !t.completed } : t))
    case 'remove':
      return todos.filter((t) => t.id !== action.id)
  }
}

export function filterTodos(todos: Todo[], filter: Filter): Todo[] {
  if (filter === 'active') return todos.filter((t) => !t.completed)
  if (filter === 'completed') return todos.filter((t) => t.completed)
  return todos
}

export function getStats(todos: Todo[]) {
  const completed = todos.filter((t) => t.completed).length
  return { total: todos.length, active: todos.length - completed, completed }
}
