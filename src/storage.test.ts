import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadTodos, saveTodos, STORAGE_KEY } from './storage'

const valid = { id: 'a', text: 'task', completed: false, createdAt: 1 }

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('loadTodos', () => {
  it('returns an empty list when nothing is saved', () => {
    expect(loadTodos()).toEqual({ todos: [], available: true })
  })

  it('round-trips saved todos', () => {
    saveTodos([valid])
    expect(loadTodos().todos).toEqual([valid])
  })

  it('survives corrupted JSON and non-array data', () => {
    localStorage.setItem(STORAGE_KEY, '{oops')
    expect(loadTodos().todos).toEqual([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }))
    expect(loadTodos().todos).toEqual([])
  })

  it('drops malformed items but keeps valid ones', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([valid, { id: 1 }, null, 'x']))
    expect(loadTodos().todos).toEqual([valid])
  })

  it('reports unavailable storage instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadTodos()).toEqual({ todos: [], available: false })
  })
})

describe('saveTodos', () => {
  it('returns false when writing fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(saveTodos([valid])).toBe(false)
  })
})
