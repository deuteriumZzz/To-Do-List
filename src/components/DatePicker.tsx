import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { addDays, fromISO, monthGrid, weekdayNames, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { ChevronIcon } from './icons'

const POPOVER_W = 288
const POPOVER_H = 380

interface DateButtonProps {
  t: Messages
  today: ISODate
  value?: ISODate
  label: string
  className: string
  onChange: (date: ISODate | null) => void
  children: ReactNode
}

/** Icon button that opens a notebook-style date picker next to it. */
export function DateButton({ t, today, value, label, className, onChange, children }: DateButtonProps) {
  const button = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  function open() {
    const r = button.current?.getBoundingClientRect()
    if (!r) return
    const left = Math.min(Math.max(8, r.right - POPOVER_W), window.innerWidth - POPOVER_W - 8)
    const below = r.bottom + 8
    const top = below + POPOVER_H > window.innerHeight ? Math.max(8, r.top - POPOVER_H - 8) : below
    setPos({ top, left })
  }

  return (
    <>
      <motion.button ref={button} type="button" aria-label={label} aria-haspopup="dialog" onClick={open} className={className} {...hoverProps}>
        {children}
      </motion.button>
      {createPortal(
        <AnimatePresence>
          {pos && (
            <DatePicker
              key="picker"
              t={t}
              today={today}
              value={value}
              pos={pos}
              onPick={(date) => {
                onChange(date)
                setPos(null)
                button.current?.focus()
              }}
              onClose={() => {
                setPos(null)
                button.current?.focus()
              }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

interface DatePickerProps {
  t: Messages
  today: ISODate
  value?: ISODate
  pos: { top: number; left: number }
  onPick: (date: ISODate | null) => void
  onClose: () => void
}

function DatePicker({ t, today, value, pos, onPick, onClose }: DatePickerProps) {
  const start = value ?? today
  const [cursor, setCursor] = useState({ year: Number(start.slice(0, 4)), month: Number(start.slice(5, 7)) - 1 })
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panel.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onDown(e: PointerEvent) {
      if (!panel.current?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [onClose])

  const weekStart = t.locale.startsWith('ru') ? 1 : 0
  const cells = monthGrid(cursor.year, cursor.month, weekStart)
  const monthLabel = new Intl.DateTimeFormat(t.locale, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1))

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  const quick: { label: string; date: ISODate | null }[] = [
    { label: t.today, date: today },
    { label: t.tomorrow, date: addDays(today, 1) },
    { label: t.nextWeek, date: addDays(today, 7) },
    { label: t.noDate, date: null },
  ]
  const arrow = 'grid size-8 place-items-center rounded-full hover:bg-ink/10'

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-label={t.dueDate}
      tabIndex={-1}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.08 } }}
      transition={springs.snappy}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: POPOVER_W }}
      className="paper z-40 rounded-3xl border border-ink/20 p-4 pt-6 text-ink shadow-[0_24px_48px_-16px_rgb(0_0_0/0.45)] outline-none"
    >
      {/* notebook binding */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-around px-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="-mt-2 h-4 w-2 rounded-full bg-ink" />
        ))}
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="font-hand text-3xl capitalize leading-none">{monthLabel}</span>
        <span className="flex">
          <motion.button type="button" aria-label={t.calendar.prev} onClick={() => shift(-1)} className={arrow} {...hoverProps}>
            <ChevronIcon dir="left" />
          </motion.button>
          <motion.button type="button" aria-label={t.calendar.next} onClick={() => shift(1)} className={arrow} {...hoverProps}>
            <ChevronIcon dir="right" />
          </motion.button>
        </span>
      </div>

      <div className="grid grid-cols-7 text-center font-hand text-lg text-ink-2">
        {weekdayNames(t.locale, weekStart).map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {cells.map((iso) => {
          const inMonth = Number(iso.slice(5, 7)) - 1 === cursor.month
          const selected = iso === value
          const isToday = iso === today && !selected
          const label = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(iso))
          return (
            <button
              key={iso}
              type="button"
              aria-label={label}
              aria-pressed={selected}
              onClick={() => onPick(iso)}
              className={`mx-auto grid size-9 place-items-center rounded-full text-sm font-semibold tabular-nums transition-colors hover:bg-ink/10 ${
                inMonth ? '' : 'text-ink-2/40'
              } ${selected ? 'bg-ink text-paper hover:bg-ink' : ''}`}
            >
              <span className={isToday ? 'marker px-1' : ''} style={isToday ? { backgroundSize: '100% 100%' } : undefined}>
                {Number(iso.slice(8))}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
        {quick.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => onPick(q.date)}
            className={`rounded-full border border-ink/25 px-3 py-1 text-sm font-semibold hover:bg-ink/10 ${q.date === null ? 'text-ink-2' : ''}`}
          >
            {q.label}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
