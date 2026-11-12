import { addDays, toISO, type ISODate } from './dates'
import type { Todo } from './todos'

export interface Report {
  completedToday: number
  completedWeek: number
  /** Consecutive days with at least one completed task, ending today (or yesterday). */
  streak: number
  total: number
  completed: number
  /** Percentage of all tasks that are done, 0-100. */
  rate: number
  overdue: number
  dueToday: number
  /** Last 7 days, oldest first. */
  days: { date: ISODate; count: number }[]
}

export function buildReport(todos: Todo[], today: ISODate): Report {
  const perDay = new Map<ISODate, number>()
  for (const t of todos) {
    if (t.completed && t.completedAt) {
      const day = toISO(new Date(t.completedAt))
      perDay.set(day, (perDay.get(day) ?? 0) + 1)
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6)
    return { date, count: perDay.get(date) ?? 0 }
  })

  let streak = 0
  let cursor = perDay.get(today) ? today : addDays(today, -1)
  while (perDay.get(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }

  const completed = todos.filter((t) => t.completed).length
  return {
    completedToday: perDay.get(today) ?? 0,
    completedWeek: days.reduce((sum, d) => sum + d.count, 0),
    streak,
    total: todos.length,
    completed,
    rate: todos.length === 0 ? 0 : Math.round((completed / todos.length) * 100),
    overdue: todos.filter((t) => !t.completed && t.due && t.due < today).length,
    dueToday: todos.filter((t) => !t.completed && t.due === today).length,
    days,
  }
}
