import { motion } from 'motion/react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { addDays, formatTime, fromISO, monthGrid, weekdayNames, type ISODate, type Time } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { PALETTE, projectHue } from '../palette'
import type { Todo } from '../todos'
import { AddTask } from './AddTask'
import { ChevronIcon, PlusIcon } from './icons'
import { TaskList } from './TaskList'
import type { ItemHandlers } from './TodoItem'

interface CalendarViewProps extends ItemHandlers {
  t: Messages
  todos: Todo[]
  today: ISODate
  onAdd: (text: string, defaults: { due?: ISODate; time?: Time }) => boolean
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
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      />
    </svg>
  )
}

const rank = (t: Todo) => (t.completed ? 2 : t.priority ? 0 : 1)
const byTimeThenRank = (a: Todo, b: Todo) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99') || rank(a) - rank(b)

const TONES = {
  active: 'bg-ink/[0.1] max-sm:bg-ink/70',
  priority: 'bg-marker max-sm:ring-1 max-sm:ring-ink/60',
  done: 'text-ink-2 line-through ring-1 ring-inset ring-ink/15 max-sm:bg-ink/20 max-sm:ring-0',
}
const toneOf = (todo: Todo) => (todo.completed ? TONES.done : todo.priority ? TONES.priority : TONES.active)

/** A task written on its day: a colour-coded note, a thin bar on narrow screens. */
function Chip({ todo, locale }: { todo: Todo; locale: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springs.pop}
      style={!todo.completed && !todo.priority && todo.project ? { backgroundColor: PALETTE[projectHue(todo.project)] } : undefined}
      className={`block origin-left rounded-md px-1.5 py-0.5 text-xs font-semibold leading-4 max-sm:h-1.5 max-sm:rounded-full max-sm:p-0 ${toneOf(todo)}`}
    >
      <span className="line-clamp-3 hyphens-auto max-sm:hidden">
        {todo.time && <b className="block font-bold tabular-nums opacity-70">{formatTime(todo.time, locale)}</b>}
        {todo.text}
      </span>
    </motion.span>
  )
}

export function CalendarView({ t, todos, today, onAdd, ...handlers }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => ({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }))
  const [selected, setSelected] = useState<ISODate>(today)
  const [adding, setAdding] = useState(false)
  const grid = useRef<HTMLDivElement>(null)

  const weekStart = t.locale.startsWith('ru') ? 1 : 0
  const cells = monthGrid(cursor.year, cursor.month, weekStart)
  const monthLabel = new Intl.DateTimeFormat(t.locale, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1))
  const longDay = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(selected))
  const shortDay = (iso: ISODate) => new Intl.DateTimeFormat(t.locale, { day: 'numeric', month: 'long' }).format(fromISO(iso))

  const byDay = new Map<ISODate, Todo[]>()
  for (const todo of todos) if (todo.due) byDay.set(todo.due, [...(byDay.get(todo.due) ?? []), todo])
  const dayTodos = (byDay.get(selected) ?? []).toSorted(byTimeThenRank)

  function select(iso: ISODate, focus = false) {
    setSelected(iso)
    setAdding(false)
    setCursor({ year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) - 1 })
    if (focus) requestAnimationFrame(() => grid.current?.querySelector<HTMLElement>(`[data-iso="${iso}"]`)?.focus())
  }

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  function onKeyDown(e: KeyboardEvent) {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    select(addDays(selected, step), true)
  }

  function addOn(iso: ISODate) {
    setSelected(iso)
    setAdding(true)
    requestAnimationFrame(() => document.getElementById('day-panel')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }))
  }

  const nav = 'grid size-9 place-items-center rounded-full hover:bg-ink/10'
  const legend = [
    { label: t.nav.active, tone: TONES.active },
    { label: t.priority, tone: TONES.priority },
    { label: t.nav.completed, tone: TONES.done },
  ]

  return (
    <div>
      {/* a page of a spiral notebook */}
      <div className="relative rounded-[1.75rem] border border-line bg-paper-2/50 px-2 pb-4 pt-9 sm:px-5">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-around px-6 sm:px-10">
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className="-mt-2.5 h-5 w-2.5 rounded-full bg-ink shadow-[inset_0_-3px_0_rgb(255_255_255/0.22)]" />
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <h2 className="whitespace-nowrap font-hand text-3xl first-letter:uppercase leading-none sm:text-5xl">{monthLabel}</h2>
          <div className="flex items-center gap-1">
            <motion.button type="button" aria-label={t.calendar.prev} onClick={() => shift(-1)} className={nav} {...hoverProps}>
              <ChevronIcon dir="left" />
            </motion.button>
            <button
              type="button"
              onClick={() => select(today)}
              className="rounded-full border border-ink/25 px-3 py-1 text-sm font-bold hover:bg-ink/10"
            >
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

        <div ref={grid} key={`${cursor.year}-${cursor.month}`} onKeyDown={onKeyDown} className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {cells.map((iso, i) => {
            const inMonth = Number(iso.slice(5, 7)) - 1 === cursor.month
            const items = (byDay.get(iso) ?? []).toSorted(byTimeThenRank)
            const isSelected = iso === selected
            const label = shortDay(iso)
            const weekend = [0, 6].includes(fromISO(iso).getDay())
            return (
              <motion.div
                key={iso}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: inMonth ? 1 : 0.45, y: 0 }}
                transition={{ ...springs.snappy, delay: i * 0.004 }}
                className={`group relative flex min-h-[5.25rem] flex-col gap-1 rounded-2xl p-1.5 pb-4 shadow-[0_1px_0_var(--color-line)] transition-colors hover:bg-paper sm:min-h-28 sm:p-2 ${
                  weekend ? 'bg-[#8fd3ff]/15' : 'bg-paper/85'
                }`}
              >
                <button
                  type="button"
                  data-iso={iso}
                  tabIndex={isSelected ? 0 : -1}
                  aria-label={items.length ? `${label}, ${t.tasksCount(items.length)}` : label}
                  aria-pressed={isSelected}
                  onClick={() => select(iso)}
                  className="absolute inset-0 rounded-2xl"
                />
                {isSelected && <PenRing />}
                <span className="pointer-events-none relative self-start">
                  {iso === today && (
                    <motion.span
                      aria-hidden="true"
                      className="absolute -inset-x-1.5 -inset-y-0.5 -rotate-3 rounded-[45%]"
                      style={{ filter: 'url(#rough-edge)', backgroundColor: PALETTE.green }}
                    />
                  )}
                  <span className="relative font-hand text-2xl font-bold leading-none tabular-nums">{Number(iso.slice(8))}</span>
                </span>
                <span className="pointer-events-none flex flex-col gap-1">
                  {items.slice(0, MAX_CHIPS).map((todo) => (
                    <Chip key={todo.id} todo={todo} locale={t.locale} />
                  ))}
                  {items.length > MAX_CHIPS && (
                    <span className="font-hand text-lg leading-none text-ink-2">{t.calendar.more(items.length - MAX_CHIPS)}</span>
                  )}
                </span>
                <motion.button
                  type="button"
                  aria-label={t.calendar.addOn(label)}
                  onClick={() => addOn(iso)}
                  className="absolute right-1.5 top-1.5 z-10 grid size-6 place-items-center rounded-full bg-ink text-paper opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-sm:hidden"
                  {...hoverProps}
                >
                  <PlusIcon className="size-3" />
                </motion.button>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-3 hidden flex-wrap items-center justify-center gap-x-5 gap-y-1 font-hand text-lg leading-none text-ink-2 sm:flex">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5">
              <span className={`h-3.5 w-6 rounded-md ${l.tone.replace(/max-sm:\S+/g, '')}`} />
              {l.label}
            </span>
          ))}
          <span>{t.calendar.byProject}</span>
        </div>
      </div>

      <section id="day-panel" className="mt-8 scroll-mt-4" aria-label={longDay}>
        <div className="flex items-end justify-between gap-3 border-b border-line pb-2">
          <h2 className="font-hand text-4xl first-letter:uppercase leading-none">{longDay}</h2>
          <span className="pb-0.5 text-sm font-semibold text-ink-2">{t.tasksCount(dayTodos.length)}</span>
        </div>
        {dayTodos.length > 0 ? (
          <TaskList t={t} todos={dayTodos} view="all" today={today} {...handlers} />
        ) : (
          <p className="py-5 font-hand text-2xl text-ink-2">{t.calendar.free}</p>
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
