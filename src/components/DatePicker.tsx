import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { addDays, formatTime, fromISO, monthGrid, weekdayNames, type ISODate, type Time } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { PALETTE, painted, paintedBlock, type Hue } from '../palette'
import { ChevronIcon } from './icons'

const POPOVER_W = 304
const POPOVER_H = 600
const QUICK_TIMES: Time[] = ['09:00', '12:00', '15:00', '18:00', '21:00']
const DEFAULT_TIME: Time = '09:00'

const pad = (n: number) => String(n).padStart(2, '0')

interface DateButtonProps {
  t: Messages
  today: ISODate
  value?: ISODate
  time?: Time
  label: string
  className: string
  onChange: (date: ISODate | null) => void
  onTime: (time: Time | null) => void
  children: ReactNode
}

/** Icon button that opens a notebook-style date and time picker next to it. */
export function DateButton({ t, today, value, time, label, className, onChange, onTime, children }: DateButtonProps) {
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

  function close() {
    setPos(null)
    button.current?.focus()
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
              time={time}
              pos={pos}
              onPick={(date) => {
                onChange(date)
                close()
              }}
              onTime={onTime}
              onClose={close}
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
  time?: Time
  pos: { top: number; left: number }
  onPick: (date: ISODate | null) => void
  onTime: (time: Time | null) => void
  onClose: () => void
}

/** A number you nudge up and down with two small keys, wrapping around. */
function Stepper({ label, value, size, step, t, onChange }: { label: string; value: number; size: number; step: number; t: Messages; onChange: (v: number) => void }) {
  const key = 'grid size-8 place-items-center rounded-full font-hand text-3xl font-bold leading-none hover:bg-ink/10'
  return (
    <div role="group" aria-label={label} className="flex items-center gap-0.5">
      <button type="button" aria-label={t.time.dec(label)} onClick={() => onChange((value - step + size) % size)} className={key}>
        −
      </button>
      <span aria-live="polite" className="w-8 text-center font-hand text-3xl leading-none tabular-nums">
        {pad(value)}
      </span>
      <button type="button" aria-label={t.time.inc(label)} onClick={() => onChange((value + step) % size)} className={key}>
        +
      </button>
    </div>
  )
}

function DatePicker({ t, today, value, time, pos, onPick, onTime, onClose }: DatePickerProps) {
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
  const [hour, minute] = (time ?? DEFAULT_TIME).split(':').map(Number)

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  const quick: { label: string; date: ISODate | null; hue?: Hue }[] = [
    { label: t.today, date: today, hue: 'green' },
    { label: t.tomorrow, date: addDays(today, 1), hue: 'sky' },
    { label: t.nextWeek, date: addDays(today, 7), hue: 'orange' },
    { label: t.noDate, date: null },
  ]
  const arrow = 'grid size-8 place-items-center rounded-full hover:bg-ink/10'
  const chip = 'rounded-full border border-ink/25 px-3 py-1 text-sm font-semibold hover:bg-ink/10'

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
        <span className="font-hand text-3xl leading-none first-letter:uppercase">{monthLabel}</span>
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
              <span className={isToday ? 'marker px-1' : ''} style={isToday ? painted('green') : undefined}>
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
            style={q.hue ? paintedBlock(PALETTE[q.hue]) : undefined}
            className={`${chip} ${q.hue ? 'border-transparent' : ''} ${q.date === null ? 'text-ink-2' : ''}`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* time of day */}
      <div className="mt-3 border-t border-dashed border-ink/25 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-hand text-2xl leading-none">{t.time.title}</span>
          <div className="flex items-center gap-1">
            <Stepper label={t.time.hours} value={hour} size={24} step={1} t={t} onChange={(h) => onTime(`${pad(h)}:${pad(minute)}`)} />
            <span aria-hidden="true" className="font-hand text-3xl leading-none">
              :
            </span>
            <Stepper label={t.time.minutes} value={minute} size={60} step={5} t={t} onChange={(m) => onTime(`${pad(hour)}:${pad(m)}`)} />
          </div>
        </div>
        <p className="mt-1 text-right text-xs text-ink-2">{time ? formatTime(time, t.locale) : t.time.none}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_TIMES.map((q) => (
            <button
              key={q}
              type="button"
              aria-pressed={time === q}
              onClick={() => onTime(q)}
              className={`${chip} tabular-nums ${time === q ? 'bg-ink text-paper hover:bg-ink' : ''}`}
            >
              {formatTime(q, t.locale)}
            </button>
          ))}
          <button type="button" onClick={() => onTime(null)} className={`${chip} text-ink-2`}>
            {t.time.none}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
