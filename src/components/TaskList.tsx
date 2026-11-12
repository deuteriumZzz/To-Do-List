import { AnimatePresence } from 'motion/react'
import { formatDue, fromISO, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { isOverdue, type Todo, type View } from '../todos'
import { TodoItem, type ItemHandlers } from './TodoItem'

interface Group {
  key: string
  label?: string
  sub?: string
  danger?: boolean
  items: Todo[]
}

/** Today shows overdue tasks under their own heading; Upcoming is grouped by day. */
function group(t: Messages, todos: Todo[], view: View, today: ISODate): Group[] {
  if (view === 'upcoming') {
    const byDay = new Map<ISODate, Todo[]>()
    for (const todo of todos) byDay.set(todo.due!, [...(byDay.get(todo.due!) ?? []), todo])
    return [...byDay].map(([day, items]) => ({
      key: day,
      label: formatDue(day, today, t.locale, t),
      sub: new Intl.DateTimeFormat(t.locale, { weekday: 'long' }).format(fromISO(day)),
      items,
    }))
  }
  if (view === 'today') {
    const late = todos.filter((todo) => isOverdue(todo, today))
    const rest = todos.filter((todo) => !isOverdue(todo, today))
    return [
      ...(late.length ? [{ key: 'overdue', label: t.overdue, danger: true, items: late }] : []),
      ...(rest.length ? [{ key: 'today', label: late.length ? t.today : undefined, items: rest }] : []),
    ]
  }
  return [{ key: 'all', items: todos }]
}

interface TaskListProps extends ItemHandlers {
  t: Messages
  todos: Todo[]
  view: View
  today: ISODate
}

export function TaskList({ t, todos, view, today, ...handlers }: TaskListProps) {
  return (
    <div aria-label={t.taskList}>
      {group(t, todos, view, today).map((g) => (
        <section key={g.key}>
          {g.label && (
            <h2 className={`mb-0.5 mt-5 flex items-baseline gap-2 border-b border-line pb-1.5 text-sm font-bold ${g.danger ? 'text-danger' : ''}`}>
              {g.label}
              {g.sub && <span className="font-hand text-lg font-bold text-ink-2">{g.sub}</span>}
            </h2>
          )}
          <ul>
            <AnimatePresence mode="popLayout" initial={false}>
              {g.items.map((todo) => (
                <TodoItem key={todo.id} t={t} todo={todo} today={today} {...handlers} />
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  )
}
