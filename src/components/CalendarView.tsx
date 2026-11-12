import { motion } from 'motion/react'
import { useState } from 'react'
import { fromISO, monthGrid, weekdayNames, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import type { Todo } from '../todos'
import { AddTask } from './AddTask'
import { ChevronIcon } from './icons'
import { TaskList } from './TaskList'
import type { ItemHandlers } from './TodoItem'

interface CalendarViewProps extends ItemHandlers {
  t: Messages
  todos: Todo[]
  today: ISODate
  onAdd: (text: string, defaults: { due?: ISODate }) => boolean
}

const MAX_CHIPS = 3

/** Hand-drawn loop around the selected day, drawn once when it is picked. */
function PenRing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible">
      <motion.path
        d="M10 14C30 5 68 6 90 12c6 22 6 52 1 76-22 7-58 7-82 1C3 66 4 34 10 14Z"
        fill="none"
        stroke="#141413"
        strokeWidth="2.2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </svg>
  )
}

const rank = (t: Todo) => (t.completed ? 2 : t.priority ? 0 : 1)

/** A task written on its day: a colour-coded note, a thin bar on narrow screens. */
function Chip({ todo }: { todo: Todo }) {
  const tone = todo.completed
    ? 'border-ink/30 text-ink-2 line-through max-sm:bg-ink/20'
    : todo.priority
      ? 'border-ink bg-marker max-sm:ring-1 max-sm:ring-ink/60'
      : 'border-ink bg-ink/10 max-sm:bg-ink/70'
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04 }}
      transition={springs.pop}
      className={`block origin-left truncate rounded-md border-l-[3px] px-1.5 py-px text-xs font-semibold leading-5 max-sm:h-1.5 max-sm:rounded-full max-sm:border-l-0 max-sm:p-0 ${tone}`}
    >
      <span className="max-sm:hidden">{todo.text}</span>
    </motion.span>
  )
}

export function CalendarView({ t, todos, today, onAdd, ...handlers }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }))
  const [selected, setSelected] = useState<ISODate>(today)
  const [adding, setAdding] = useState(false)

  const weekStart = t.locale.startsWith('ru') ? 1 : 0
  const cells = monthGrid(cursor.year, cursor.month, weekStart)
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

  const nav = 'grid size-9 place-items-center rounded-full hover:bg-ink/10'

  return (
    <div>
      {/* a page of a spiral notebook */}
      <div className="relative rounded-[1.75rem] border border-line bg-paper-2/50 px-2 pb-3 pt-9 sm:px-5">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-around px-6 sm:px-10">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="-mt-2.5 h-5 w-2.5 rounded-full bg-ink shadow-[inset_0_-3px_0_rgb(255_255_255/0.22)]" />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="whitespace-nowrap font-hand text-3xl capitalize leading-none sm:text-5xl">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <motion.button type="button" aria-label={t.calendar.prev} onClick={() => shift(-1)} className={nav} {...hoverProps}>
              <ChevronIcon dir="left" />
            </motion.button>
            <button type="button" onClick={goToday} className="rounded-full px-3 py-1.5 text-sm font-bold hover:bg-ink/10">
              {t.calendar.today}
            </button>
            <motion.button type="button" aria-label={t.calendar.next} onClick={() => shift(1)} className={nav} {...hoverProps}>
              <ChevronIcon dir="right" />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pb-1 text-center font-hand text-xl leading-none text-ink-2 sm:gap-2">
          {weekdayNames(t.locale, weekStart).map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div key={`${cursor.year}-${cursor.month}`} className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((iso, i) => {
            const inMonth = Number(iso.slice(5, 7)) - 1 === cursor.month
            const items = (byDay.get(iso) ?? []).toSorted((a, b) => rank(a) - rank(b))
            const isSelected = iso === selected
            const isToday = iso === today
            const label = new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long' }).format(fromISO(iso))
            return (
              <motion.button
                key={iso}
                type="button"
                aria-label={items.length ? `${label}, ${t.tasksCount(items.length)}` : label}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelected(iso)
                  setAdding(false)
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: inMonth ? 1 : 0.45, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ ...springs.snappy, delay: i * 0.008 }}
                className="relative flex min-h-[5.25rem] flex-col gap-1 rounded-2xl bg-paper/80 p-1.5 pb-3 text-left shadow-[0_1px_0_var(--color-line)] transition-colors hover:bg-paper sm:min-h-36 sm:p-2 sm:pb-3"
              >
                {isSelected && <PenRing />}
                <span className="relative self-start">
                  {isToday && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute -inset-x-1.5 -inset-y-0.5 -rotate-3 rounded-[45%] bg-marker"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  <span className="relative font-hand text-2xl font-bold leading-none tabular-nums">{Number(iso.slice(8))}</span>
                </span>
                <span className="flex flex-col gap-1">
                  {items.slice(0, MAX_CHIPS).map((todo) => (
                    <Chip key={todo.id} todo={todo} />
                  ))}
                  {items.length > MAX_CHIPS && (
                    <span className="font-hand text-base leading-none text-ink-2">{t.calendar.more(items.length - MAX_CHIPS)}</span>
                  )}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>

      <section className="mt-8" aria-label={longDay}>
        <h2 className="border-b border-line pb-2 font-hand text-4xl capitalize leading-none">{longDay}</h2>
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
