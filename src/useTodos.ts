import { useState } from 'react'
import { toISO, type ISODate } from './dates'
import { loadTodos, saveTodos } from './storage'
import { createTodo, todosReducer, type Action, type Todo } from './todos'

export interface UndoState {
  /** Unique per change, so a new change restarts the toast timer. */
  id: number
  kind: 'removed' | 'cleared' | 'completed'
  count: number
  previous: Todo[]
}

export function useTodos() {
  // Saved data is loaded synchronously before the first render, and nothing is
  // written until the user changes something, so it is never overwritten early.
  const [initial] = useState(loadTodos)
  const [todos, setTodos] = useState(initial.todos)
  const [storageOk, setStorageOk] = useState(initial.available)
  const [undoState, setUndoState] = useState<UndoState | null>(null)

  function commit(next: Todo[]) {
    setTodos(next)
    setStorageOk(saveTodos(next))
  }

  function apply(action: Action, undo?: Pick<UndoState, 'kind' | 'count'>) {
    commit(todosReducer(todos, action))
    setUndoState(undo ? { ...undo, id: Date.now(), previous: todos } : null)
  }

  return {
    todos,
    storageOk,
    undoState,
    /** Returns false when no title is left after parsing (nothing was added). */
    add(text: string, defaults: { due?: ISODate } = {}) {
      const todo = createTodo(text, toISO(new Date()), defaults)
      if (todo) apply({ type: 'add', todo })
      return todo !== null
    },
    /** Returns false when the new text is blank (the task is left unchanged). */
    edit(id: string, text: string) {
      const trimmed = text.trim()
      if (trimmed) apply({ type: 'edit', id, text: trimmed })
      return trimmed !== ''
    },
    toggle(id: string) {
      const completing = todos.some((t) => t.id === id && !t.completed)
      apply({ type: 'toggle', id, at: Date.now() }, completing ? { kind: 'completed', count: 1 } : undefined)
    },
    togglePriority: (id: string) => apply({ type: 'togglePriority', id }),
    setDue: (id: string, due: ISODate | null) => apply({ type: 'setDue', id, due }),
    remove: (id: string) => apply({ type: 'remove', id }, { kind: 'removed', count: 1 }),
    clearCompleted() {
      const count = todos.filter((t) => t.completed).length
      apply({ type: 'clearCompleted' }, { kind: 'cleared', count })
    },
    undo() {
      if (!undoState) return
      commit(undoState.previous)
      setUndoState(null)
    },
    dismissUndo: () => setUndoState(null),
  }
}
