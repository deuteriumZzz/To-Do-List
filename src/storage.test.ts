import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LANG_KEY, loadLang, loadTodos, saveLang, saveTodos, STORAGE_KEY } from './storage'

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

  it('keeps optional fields when valid and drops tasks where they are malformed', () => {
    const rich = { ...valid, id: 'r', priority: true, due: '2026-11-12', project: 'work', time: '18:30', completedAt: 5 }
    const badDue = { ...valid, id: 'x', due: '12/11/2026' }
    const badTime = { ...valid, id: 'y', time: '25:61' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([rich, badDue, badTime]))
    expect(loadTodos().todos).toEqual([rich])
  })

  it('reports unavailable storage instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(loadTodos()).toEqual({ todos: [], available: false })
  })
})

describe('language storage', () => {
  it('round-trips a valid language and ignores junk', () => {
    expect(loadLang()).toBeNull()
    saveLang('ru')
    expect(loadLang()).toBe('ru')
    localStorage.setItem(LANG_KEY, 'de')
    expect(loadLang()).toBeNull()
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
