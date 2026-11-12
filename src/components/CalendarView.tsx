import { motion } from 'motion/react'
import { useState } from 'react'
import { fromISO, monthGrid, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import type { Todo } from '../todos'
import { AddTask } from './AddTask'
import { TaskList } from './TaskList'
import type { ItemHandlers } from './TodoItem'

interface CalendarViewProps extends ItemHandlers {
  t: Messages
  todos: Todo[]
  today: ISODate
  onAdd: (text: string, defaults: { due?: ISODate }) => boolean
}

const MAX_CHIPS = 2
const arrow = { viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: 'size-4' } as const

export function CalendarView({ t, todos, today, onAdd, ...handlers }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }))
  const [selected, setSelected] = useState<ISODate>(today)
  const [adding, setAdding] = useState(false)

  const weekStart = t.locale.startsWith('ru') ? 1 : 0
  const cells = monthGrid(cursor.year, cursor.month, weekStart)
  // 2023-01-01 is a Sunday
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(t.locale, { weekday: 'short' }).format(new Date(2023, 0, 1 + weekStart + i)),
  )
  const monthLabel = new Intl.DateTimeFormat(t.locale, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1))
  const longDay = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(selected))

  const byDay = new Map<ISODate, Todo[]>()
  for (const todo of todos) if (todo.due) byDay.set(todo.due, [...(byDay.get(todo.due) ?? []), todo])
  const dayTodos = byDay.get(selected) ?? []

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  function goToday() {
    setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 })
    setSelected(today)
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold capitalize tracking-tight">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button type="button" aria-label={t.calendar.prev} onClick={() => shift(-1)} className="grid size-9 place-items-center rounded-lg hover:bg-ink/10">
            <svg {...arrow}>
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>
          <button type="button" onClick={goToday} className="rounded-lg px-3 py-1.5 text-sm font-bold hover:bg-ink/10">
            {t.calendar.today}
          </button>
          <button type="button" aria-label={t.calendar.next} onClick={() => shift(1)} className="grid size-9 place-items-center rounded-lg hover:bg-ink/10">
            <svg {...arrow}>
              <path d="M8 4l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-l border-t border-line text-center">
        {weekdays.map((d) => (
          <div key={d} className="border-b border-r border-line py-1.5 text-xs font-bold uppercase tracking-wide text-ink-2">
            {d}
          </div>
        ))}
        {cells.map((iso) => {
          const inMonth = Number(iso.slice(5, 7)) - 1 === cursor.month
          const items = byDay.get(iso) ?? []
          const isSelected = iso === selected
          const label = new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long' }).format(fromISO(iso))
          return (
            <button
              key={iso}
              type="button"
              aria-label={items.length ? `${label}, ${t.tasksCount(items.length)}` : label}
              aria-pressed={isSelected}
              onClick={() => {
                setSelected(iso)
                setAdding(false)
              }}
              className={`relative flex min-h-16 flex-col items-stretch gap-0.5 border-b border-r border-line p-1 text-left transition-colors hover:bg-ink/5 sm:min-h-24 ${
                inMonth ? '' : 'text-ink-2/50'
              }`}
            >
              {isSelected && (
                <motion.span layoutId="day-ring" transition={springs.snappy} className="pointer-events-none absolute inset-0.5 rounded-md ring-2 ring-ink" />
              )}
              <span
                className={`grid size-6 place-items-center self-center rounded-full text-xs font-bold tabular-nums sm:self-start ${
                  iso === today ? 'bg-ink text-paper' : ''
                }`}
              >
                {Number(iso.slice(8))}
              </span>
              <span className="hidden flex-col gap-0.5 sm:flex">
                {items.slice(0, MAX_CHIPS).map((todo) => (
                  <span
                    key={todo.id}
                    className={`truncate rounded px-1 text-[11px] font-semibold leading-4 ${
                      todo.completed ? 'bg-ink/5 text-ink-2 line-through' : todo.priority ? 'bg-marker' : 'bg-ink/10'
                    }`}
                  >
                    {todo.text}
                  </span>
                ))}
                {items.length > MAX_CHIPS && (
                  <span className="px-1 text-[11px] font-semibold text-ink-2">{t.calendar.more(items.length - MAX_CHIPS)}</span>
                )}
              </span>
              {items.length > 0 && (
                <span aria-hidden="true" className="flex justify-center gap-0.5 sm:hidden">
                  {items.slice(0, 3).map((todo) => (
                    <span key={todo.id} className={`size-1.5 rounded-full ${todo.completed ? 'bg-ink/30' : 'bg-ink'}`} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <section className="mt-8" aria-label={longDay}>
        <h2 className="border-b border-line pb-2 text-lg font-extrabold capitalize tracking-tight">{longDay}</h2>
        {dayTodos.length > 0 ? (
          <TaskList t={t} todos={dayTodos} view="all" today={today} {...handlers} />
        ) : (
          <p className="py-6 font-hand text-2xl text-ink-2">{t.calendar.free}</p>
        )}
        <AddTask
          t={t}
          today={today}
          open={adding}
          onOpen={() => setAdding(true)}
          onClose={() => setAdding(false)}
          defaultDue={selected}
          onAdd={onAdd}
        />
      </section>
    </div>
  )
}
