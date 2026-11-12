import { describe, expect, it } from 'vitest'
import { addDays } from './dates'
import { buildReport } from './report'
import type { Todo } from './todos'

const TODAY = '2026-11-12'
const at = (iso: string) => new Date(`${iso}T12:00:00`).getTime()
const done = (id: string, day: string): Todo => ({ id, text: id, completed: true, completedAt: at(day), createdAt: 0 })

describe('buildReport', () => {
  it('counts completions per day for the last 7 days, oldest first', () => {
    const r = buildReport([done('a', TODAY), done('b', TODAY), done('c', addDays(TODAY, -2)), done('old', addDays(TODAY, -30))], TODAY)
    expect(r.days).toHaveLength(7)
    expect(r.days[0].date).toBe(addDays(TODAY, -6))
    expect(r.days[6]).toEqual({ date: TODAY, count: 2 })
    expect(r.days[4].count).toBe(1)
    expect(r.completedToday).toBe(2)
    expect(r.completedWeek).toBe(3)
  })

  it('computes the streak, keeping it alive when today is still empty', () => {
    const run = [done('a', TODAY), done('b', addDays(TODAY, -1)), done('c', addDays(TODAY, -2)), done('d', addDays(TODAY, -4))]
    expect(buildReport(run, TODAY).streak).toBe(3)
    expect(buildReport(run.slice(1), TODAY).streak).toBe(2)
    expect(buildReport([done('x', addDays(TODAY, -3))], TODAY).streak).toBe(0)
  })

  it('reports rate, overdue and due-today counts', () => {
    const todos: Todo[] = [
      done('a', TODAY),
      { id: 'b', text: 'b', completed: false, due: addDays(TODAY, -1), createdAt: 0 },
      { id: 'c', text: 'c', completed: false, due: TODAY, createdAt: 0 },
      { id: 'd', text: 'd', completed: false, createdAt: 0 },
    ]
    expect(buildReport(todos, TODAY)).toMatchObject({ total: 4, completed: 1, rate: 25, overdue: 1, dueToday: 1 })
    expect(buildReport([], TODAY)).toMatchObject({ rate: 0, streak: 0, completedWeek: 0 })
  })
})
