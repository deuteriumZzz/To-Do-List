import { describe, expect, it } from 'vitest'
import { createTodo, getStats, projectCounts, selectTodos, todosReducer, viewCounts, type Query, type Todo } from './todos'

const TODAY = '2026-11-12'
const todo = (id: string, extra: Partial<Todo> = {}): Todo => ({ id, text: id, completed: false, createdAt: 0, ...extra })
const query = (view: Query['view'], extra: Partial<Query> = {}): Query => ({ view, project: null, search: '', today: TODAY, ...extra })
const ids = (list: Todo[]) => list.map((t) => t.id)

describe('createTodo', () => {
  it('trims text, rejects blank input and a lone "!"', () => {
    expect(createTodo('  buy milk  ', TODAY)?.text).toBe('buy milk')
    expect(createTodo('', TODAY)).toBeNull()
    expect(createTodo('   ', TODAY)).toBeNull()
    expect(createTodo('!', TODAY)).toBeNull()
  })

  it('applies quick-add syntax and the default date', () => {
    const t = createTodo('!Call mum tomorrow #family', TODAY)
    expect(t).toMatchObject({ text: 'Call mum', priority: true, due: '2026-11-13', project: 'family' })
    expect(createTodo('Plan', TODAY, { due: '2026-12-01' })?.due).toBe('2026-12-01')
    expect(createTodo('Plan today', TODAY, { due: '2026-12-01' })?.due).toBe(TODAY)
  })

  it('adds a time, and a time alone means today', () => {
    expect(createTodo('Call at 18:30', TODAY)).toMatchObject({ text: 'Call', time: '18:30', due: TODAY })
    expect(createTodo('Call tomorrow at 9:00', TODAY)).toMatchObject({ time: '09:00', due: '2026-11-13' })
    expect(createTodo('Call', TODAY)?.time).toBeUndefined()
  })

  it('generates unique ids', () => {
    expect(createTodo('a', TODAY)?.id).not.toBe(createTodo('a', TODAY)?.id)
  })
})

describe('todosReducer', () => {
  it('adds new tasks to the top', () => {
    expect(ids(todosReducer([todo('a')], { type: 'add', todo: todo('b') }))).toEqual(['b', 'a'])
  })

  it('toggles back and forth and tracks completedAt', () => {
    const done = todosReducer([todo('a'), todo('b')], { type: 'toggle', id: 'a', at: 123 })
    expect(done.map((t) => t.completed)).toEqual([true, false])
    expect(done[0].completedAt).toBe(123)
    const undone = todosReducer(done, { type: 'toggle', id: 'a', at: 456 })
    expect(undone[0]).toMatchObject({ completed: false, completedAt: undefined })
  })

  it('toggles priority, sets and clears the date, edits text', () => {
    const list = [todo('a'), todo('b')]
    expect(todosReducer(list, { type: 'togglePriority', id: 'a' })[0].priority).toBe(true)
    const dated = todosReducer(list, { type: 'setDue', id: 'a', due: '2026-11-20' })
    expect(dated[0].due).toBe('2026-11-20')
    expect(todosReducer(dated, { type: 'setDue', id: 'a', due: null })[0].due).toBeUndefined()
    expect(todosReducer(list, { type: 'edit', id: 'a', text: 'new' }).map((t) => t.text)).toEqual(['new', 'b'])
  })

  it('sets a time (defaulting the date to today) and clears it with the date', () => {
    const list = [todo('a')]
    const timed = todosReducer(list, { type: 'setTime', id: 'a', time: '08:15', today: TODAY })
    expect(timed[0]).toMatchObject({ time: '08:15', due: TODAY })
    expect(todosReducer(timed, { type: 'setTime', id: 'a', time: null, today: TODAY })[0].time).toBeUndefined()
    expect(todosReducer(timed, { type: 'setDue', id: 'a', due: null })[0]).toMatchObject({ due: undefined, time: undefined })
  })

  it('removes the target and clears only completed tasks', () => {
    expect(ids(todosReducer([todo('a'), todo('b')], { type: 'remove', id: 'a' }))).toEqual(['b'])
    expect(ids(todosReducer([todo('a'), todo('b', { completed: true })], { type: 'clearCompleted' }))).toEqual(['a'])
  })
})

describe('selectTodos', () => {
  const list = [
    todo('plain'),
    todo('late', { due: '2026-11-10' }),
    todo('now', { due: TODAY }),
    todo('soon', { due: '2026-11-14', project: 'work' }),
    todo('done', { completed: true, due: TODAY }),
    todo('star', { priority: true }),
  ]

  it('filters by view without mutating the source', () => {
    expect(ids(selectTodos(list, query('all')))).toHaveLength(6)
    expect(ids(selectTodos(list, query('active')))).not.toContain('done')
    expect(ids(selectTodos(list, query('completed')))).toEqual(['done'])
    expect(list).toHaveLength(6)
  })

  it('Today includes overdue and sorts by date; Upcoming only future dates', () => {
    expect(ids(selectTodos(list, query('today')))).toEqual(['late', 'now'])
    expect(ids(selectTodos(list, query('upcoming')))).toEqual(['soon'])
  })

  it('sorts Today by time, timed tasks before untimed ones', () => {
    const day = [todo('late', { due: TODAY, time: '18:00' }), todo('none', { due: TODAY }), todo('early', { due: TODAY, time: '08:00' })]
    expect(ids(selectTodos(day, query('today')))).toEqual(['early', 'late', 'none'])
  })

  it('floats active priority tasks to the top', () => {
    expect(ids(selectTodos(list, query('all')))[0]).toBe('star')
  })

  it('filters by project and search text', () => {
    expect(ids(selectTodos(list, query('all', { project: 'work' })))).toEqual(['soon'])
    expect(ids(selectTodos(list, query('all', { search: 'LAT' })))).toEqual(['late'])
  })
})

describe('counts', () => {
  const list = [todo('a', { due: '2026-11-10' }), todo('b', { due: '2026-11-20', project: 'x' }), todo('c', { completed: true, project: 'x' })]

  it('counts views, projects and stats', () => {
    expect(viewCounts(list, TODAY)).toEqual({ all: 3, today: 1, upcoming: 1, active: 2, completed: 1 })
    expect(projectCounts(list)).toEqual([{ name: 'x', count: 1 }])
    expect(getStats(list)).toEqual({ total: 3, active: 2, completed: 1 })
    expect(getStats([])).toEqual({ total: 0, active: 0, completed: 0 })
  })
})
