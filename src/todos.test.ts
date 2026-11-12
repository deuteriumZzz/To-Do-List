import { describe, expect, it } from 'vitest'
import { createTodo, filterTodos, getStats, todosReducer, type Todo } from './todos'

const todo = (id: string, completed = false): Todo => ({ id, text: id, completed, createdAt: 0 })

describe('createTodo', () => {
  it('trims text and rejects blank input', () => {
    expect(createTodo('  buy milk  ')?.text).toBe('buy milk')
    expect(createTodo('')).toBeNull()
    expect(createTodo('   ')).toBeNull()
  })

  it('generates unique ids', () => {
    expect(createTodo('a')?.id).not.toBe(createTodo('a')?.id)
  })
})

describe('todosReducer', () => {
  it('adds new tasks to the top', () => {
    expect(todosReducer([todo('a')], { type: 'add', todo: todo('b') }).map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('toggles only the target task, back and forth', () => {
    const once = todosReducer([todo('a'), todo('b')], { type: 'toggle', id: 'a' })
    expect(once.map((t) => t.completed)).toEqual([true, false])
    expect(todosReducer(once, { type: 'toggle', id: 'a' })[0].completed).toBe(false)
  })

  it('removes only the target task', () => {
    expect(todosReducer([todo('a'), todo('b')], { type: 'remove', id: 'a' }).map((t) => t.id)).toEqual(['b'])
  })
})

describe('filterTodos / getStats', () => {
  const list = [todo('a'), todo('b', true), todo('c', true)]

  it('filters without mutating the source', () => {
    expect(filterTodos(list, 'all')).toHaveLength(3)
    expect(filterTodos(list, 'active').map((t) => t.id)).toEqual(['a'])
    expect(filterTodos(list, 'completed').map((t) => t.id)).toEqual(['b', 'c'])
    expect(list).toHaveLength(3)
  })

  it('counts total, active and completed', () => {
    expect(getStats(list)).toEqual({ total: 3, active: 1, completed: 2 })
    expect(getStats([])).toEqual({ total: 0, active: 0, completed: 0 })
  })
})
