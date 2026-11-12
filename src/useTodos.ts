import { useState } from 'react'
import { loadTodos, saveTodos } from './storage'
import { createTodo, todosReducer, type Action } from './todos'

export function useTodos() {
  // Saved data is loaded synchronously before the first render, and nothing is
  // written until the user changes something, so it is never overwritten early.
  const [initial] = useState(loadTodos)
  const [todos, setTodos] = useState(initial.todos)
  const [storageOk, setStorageOk] = useState(initial.available)

  function apply(action: Action) {
    const next = todosReducer(todos, action)
    setTodos(next)
    setStorageOk(saveTodos(next))
  }

  return {
    todos,
    storageOk,
    /** Returns false when the text is blank and nothing was added. */
    add(text: string) {
      const todo = createTodo(text)
      if (todo) apply({ type: 'add', todo })
      return todo !== null
    },
    toggle: (id: string) => apply({ type: 'toggle', id }),
    remove: (id: string) => apply({ type: 'remove', id }),
  }
}
