import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useState } from 'react'
import { addDays, formatDue, formatTime, type ISODate, type Time } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { PALETTE, painted, projectHue } from '../palette'
import { markSwipeHintSeen } from '../storage'
import { isOverdue, type Todo } from '../todos'
import { Burst } from './Burst'
import { DateButton } from './DatePicker'
import { CalendarIcon, PencilIcon, StarIcon, TrashIcon } from './icons'
import { PenText } from './PenText'

export interface ItemHandlers {
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (id: string, text: string) => boolean
  onPriority: (id: string) => void
  onDue: (id: string, due: ISODate | null) => void
  onTime: (id: string, time: Time | null) => void
}

interface TodoItemProps extends ItemHandlers {
  t: Messages
  todo: Todo
  today: ISODate
  /** Briefly swipe the row left and right to show the gesture (first run, touch screens). */
  peek?: boolean
  /** The task was just added: write its title out with a pen. */
  writing?: boolean
}

/** The pen that inks the tick: it follows the three points of the tick while the stroke is drawn. */
function CheckPen() {
  const xs = [7.4, 10.7, 17.9].map((v) => v - 3)
  const ys = [12.6, 16.1, 8.5].map((v) => v - 21)
  const line = { times: [0, 0.31, 1], duration: 0.45, ease: 'linear' as const }
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      initial={{ x: xs[0], y: ys[0], opacity: 0 }}
      animate={{ x: xs, y: ys, opacity: [0, 1, 1, 0] }}
      transition={{ x: line, y: line, opacity: { times: [0, 0.08, 0.85, 1], duration: 0.65, ease: 'linear' } }}
      className="pointer-events-none absolute left-0 top-0 z-10 size-6 drop-shadow-[0_1px_1px_rgb(0_0_0/0.3)]"
    >
      <path d="M3 21l1.6-5.2L16 4.4a2.2 2.2 0 013.1 3.1L7.8 19.4 3 21Z" fill="#141413" />
      <path d="M14.4 6l3.6 3.6" stroke="#ffe14d" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 21l1.6-5.2 3.6 3.6L3 21Z" fill="#ffe14d" />
    </motion.svg>
  )
}

const iconButton =
  'grid size-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:opacity-35 [@media(hover:hover)]:group-hover:opacity-100'

/** Distance after which letting go completes or deletes the task. */
const SWIPE_DISTANCE = 96

export function TodoItem({ t, todo, today, peek = false, writing = false, onToggle, onRemove, onEdit, onPriority, onDue, onTime }: TodoItemProps) {
  const [burst, setBurst] = useState(0)
  // however a task gets completed (checkbox, swipe), the pen draws the tick
  const [wasDone, setWasDone] = useState(todo.completed)
  if (todo.completed !== wasDone) {
    setWasDone(todo.completed)
    if (todo.completed) setBurst((b) => b + 1)
  }
  const [draft, setDraft] = useState<string | null>(null)
  const highlighted = todo.priority === true && !todo.completed
  const overdue = isOverdue(todo, today)

  // swipe feedback: the action colour fades in under the row, its icon grows near the threshold
  const x = useMotionValue(0)
  const showDone = useTransform(x, [0, 40], [0, 1])
  const showDelete = useTransform(x, [0, -40], [0, 1])
  // transparent at rest (so the paper shows through), opaque while swiping (to hide the action colour beneath)
  const rowFill = useTransform(x, [-2, 0, 2], ['rgb(239,236,228)', 'rgba(239,236,228,0)', 'rgb(239,236,228)'])
  const doneIcon = useTransform(x, [0, SWIPE_DISTANCE, 140], [0.7, 1.1, 1.3])
  const deleteIcon = useTransform(x, [0, -SWIPE_DISTANCE, -140], [0.7, 1.1, 1.3])

  useEffect(() => {
    if (!peek) return
    const controls = animate(x, [0, -72, 0, 72, 0], {
      duration: 2.4,
      delay: 1.2,
      ease: 'easeInOut',
      times: [0, 0.25, 0.5, 0.75, 1],
      onComplete: markSwipeHintSeen,
    })
    return () => controls.stop()
  }, [peek, x])

  function finishEdit(save: boolean) {
    if (save && draft !== null) onEdit(todo.id, draft)
    setDraft(null)
  }

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -28 }}
      transition={springs.snappy}
      className="group relative border-b border-line transition-colors hover:bg-ink/[0.03]"
    >
      {/* what the swipe will do, revealed under the row */}
      <div aria-hidden="true" className="absolute inset-0">
        <motion.div style={{ opacity: showDone, backgroundColor: PALETTE.green }} className="absolute inset-0 flex items-center gap-2 pl-4">
          <motion.span style={{ scale: doneIcon }} className="grid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="size-6">
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </motion.span>
          <span className="font-hand text-2xl font-bold leading-none">{todo.completed ? t.swipe.undo : t.swipe.done}</span>
        </motion.div>
        <motion.div style={{ opacity: showDelete, backgroundColor: '#ffc4ba' }} className="absolute inset-0 flex items-center justify-end gap-2 pr-4">
          <span className="font-hand text-2xl font-bold leading-none">{t.swipe.delete}</span>
          <motion.span style={{ scale: deleteIcon }} className="grid">
            <TrashIcon className="size-6" />
          </motion.span>
        </motion.div>
      </div>

      <motion.div
        drag="x"
        style={{ x, backgroundColor: rowFill }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.5 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -600) onRemove(todo.id)
          else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > 600) onToggle(todo.id)
        }}
        className="relative flex items-start gap-3 px-1 py-3"
      >
        <label className="group/check relative mt-px shrink-0 cursor-pointer">
          <input
            type="checkbox"
            aria-label={todo.text}
            checked={todo.completed}
            onChange={() => {
              if (!todo.completed) navigator.vibrate?.(12)
              onToggle(todo.id)
            }}
            className="peer sr-only"
          />
          {/* hand-drawn ring; the tick is drawn like a pen stroke */}
          <motion.svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            whileHover={{ rotate: -8, scale: 1.08 }}
            whileTap={{ scale: 0.85 }}
            transition={springs.pop}
            className="size-6 overflow-visible rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
          >
            <motion.path
              d="M12.2 3c4.9-.3 8.9 3.6 8.8 8.6-.1 5.2-3.9 9.2-9.1 9-4.9-.2-8.8-4.1-8.7-9C3.3 6.7 7.2 3.2 12.2 3Z"
              stroke="#141413"
              strokeWidth="1.8"
              initial={false}
              animate={{ fill: todo.completed ? (todo.project ? PALETTE[projectHue(todo.project)] : '#d3cebf') : 'rgba(255,255,255,0)' }}
            />
            {!todo.completed && (
              <path
                d="M7.4 12.6l3.3 3.5 6.2-7.6"
                stroke="#141413"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="opacity-0 transition-opacity group-hover/check:opacity-30"
              />
            )}
            <motion.path
              d="M7.4 12.6l3.3 3.5 6.2-7.6"
              stroke="#141413"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={false}
              animate={{ pathLength: todo.completed ? 1 : 0, opacity: todo.completed ? 1 : 0 }}
              transition={{ duration: todo.completed ? 0.45 : 0.15, ease: 'linear' }}
            />
          </motion.svg>
          {burst > 0 && <CheckPen key={`pen-${burst}`} />}
          {burst > 0 && <Burst key={burst} delay={0.45} />}
        </label>

        <div className="min-w-0 flex-1">
          {draft === null ? (
            <PenText text={todo.text} seed={todo.id} struck={todo.completed} highlighted={highlighted} writing={writing} onClick={() => setDraft(todo.text)} />
          ) : (
            <input
              autoFocus
              aria-label={t.editField}
              value={draft}
              maxLength={200}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => finishEdit(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') finishEdit(true)
                if (e.key === 'Escape') finishEdit(false)
              }}
              className="w-full border-b-2 border-ink bg-transparent py-0.5 font-hand text-[26px] font-bold leading-[1.1] focus:outline-none"
            />
          )}
          {(todo.due || todo.project) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-[13px] font-semibold leading-none">
              {todo.due && (
                <span className={`inline-flex items-center gap-1 ${overdue ? 'text-danger' : todo.due === today ? 'text-ok' : todo.due === addDays(today, 1) ? 'text-sky-ink' : 'text-ink-2'}`}>
                  <CalendarIcon className="size-3.5" />
                  {formatDue(todo.due, today, t.locale, t)}
                  {todo.time && `, ${formatTime(todo.time, t.locale)}`}
                </span>
              )}
              {todo.project && (
                <span className="marker px-1" style={painted(projectHue(todo.project))}>
                  #{todo.project}
                </span>
              )}
            </div>
          )}
        </div>

        {draft === null && (
          <div className="flex shrink-0 items-center">
            <motion.button
              type="button"
              aria-pressed={todo.priority === true}
              aria-label={t.flagTask(todo.text)}
              onClick={() => onPriority(todo.id)}
              className={`${iconButton} ${todo.priority ? 'text-ink [@media(hover:hover)]:opacity-100' : ''}`}
              {...hoverProps}
            >
              <StarIcon filled={todo.priority === true} />
            </motion.button>
            <DateButton
              t={t}
              today={today}
              value={todo.due}
              time={todo.time}
              label={t.setDue(todo.text)}
              onChange={(date) => onDue(todo.id, date)}
              onTime={(time) => onTime(todo.id, time)}
              className={iconButton}
            >
              <CalendarIcon />
            </DateButton>
            <motion.button type="button" aria-label={t.editTask(todo.text)} onClick={() => setDraft(todo.text)} className={`${iconButton} max-sm:hidden`} {...hoverProps}>
              <PencilIcon />
            </motion.button>
            <motion.button type="button" aria-label={t.deleteTask(todo.text)} onClick={() => onRemove(todo.id)} className={iconButton} {...hoverProps}>
              <TrashIcon />
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.li>
  )
}
