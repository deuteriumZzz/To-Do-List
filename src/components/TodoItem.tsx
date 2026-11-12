import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { formatDue, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import { isOverdue, type Todo } from '../todos'
import { Burst } from './Burst'

export interface ItemHandlers {
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (id: string, text: string) => boolean
  onPriority: (id: string) => void
  onDue: (id: string, due: ISODate | null) => void
}

interface TodoItemProps extends ItemHandlers {
  t: Messages
  todo: Todo
  today: ISODate
}

const iconButton =
  'grid size-8 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100'

const svg = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'size-[18px]',
} as const

export function TodoItem({ t, todo, today, onToggle, onRemove, onEdit, onPriority, onDue }: TodoItemProps) {
  const [burst, setBurst] = useState(0)
  const [draft, setDraft] = useState<string | null>(null)
  const dateInput = useRef<HTMLInputElement>(null)
  const highlighted = todo.priority === true && !todo.completed
  const overdue = isOverdue(todo, today)

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
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0.5 }}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x < -96 || info.velocity.x < -600) onRemove(todo.id)
        else if (info.offset.x > 96 || info.velocity.x > 600) onToggle(todo.id)
      }}
      transition={springs.snappy}
      className="group border-b border-line"
    >
      <div className="flex items-start gap-3 py-3">
        <label className="group/check relative mt-px shrink-0 cursor-pointer">
          <input
            type="checkbox"
            aria-label={todo.text}
            checked={todo.completed}
            onChange={() => {
              if (!todo.completed) {
                setBurst((b) => b + 1)
                navigator.vibrate?.(12)
              }
              onToggle(todo.id)
            }}
            className="peer sr-only"
          />
          {/* hand-drawn ring; the tick is drawn like a pen stroke */}
          <motion.svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            whileTap={{ scale: 0.85 }}
            transition={springs.pop}
            className="size-6 overflow-visible rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
          >
            <motion.path
              d="M12.2 3c4.9-.3 8.9 3.6 8.8 8.6-.1 5.2-3.9 9.2-9.1 9-4.9-.2-8.8-4.1-8.7-9C3.3 6.7 7.2 3.2 12.2 3Z"
              stroke="#141413"
              strokeWidth="1.8"
              initial={false}
              animate={{ fill: todo.completed ? '#ffe14d' : 'rgba(255,225,77,0)' }}
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
              transition={{ duration: 0.28 }}
            />
          </motion.svg>
          {burst > 0 && <Burst key={burst} />}
        </label>

        <div className="min-w-0 flex-1">
          {draft === null ? (
            <span
              onClick={() => setDraft(todo.text)}
              style={{ backgroundSize: highlighted ? '100% 100%' : '0% 100%' }}
              className={`marker cursor-text break-words leading-snug ${
                todo.completed ? 'text-ink-2 line-through decoration-2' : ''
              }`}
            >
              {todo.text}
            </span>
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
              className="w-full border-b-2 border-ink bg-transparent py-0.5 focus:outline-none"
            />
          )}
          {(todo.due || todo.project) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 font-hand text-[17px] leading-none">
              {todo.due && (
                <span
                  className={`inline-flex items-center gap-1 ${
                    overdue ? 'text-danger' : todo.due === today ? 'text-ok' : 'text-ink-2'
                  }`}
                >
                  <svg {...svg} className="size-3.5">
                    <path d="M4 5h12v11H4zM4 8.500h12M7 3v3M13 3v3" />
                  </svg>
                  {formatDue(todo.due, today, t.locale, t)}
                </span>
              )}
              {todo.project && <span className="text-ink-2">#{todo.project}</span>}
            </div>
          )}
        </div>

        {draft === null && (
          <div className="relative flex shrink-0 items-center">
            <button
              type="button"
              aria-pressed={todo.priority === true}
              aria-label={t.flagTask(todo.text)}
              onClick={() => onPriority(todo.id)}
              className={`${iconButton} max-sm:hidden ${todo.priority ? 'text-ink [@media(hover:hover)]:opacity-100' : ''}`}
            >
              <svg {...svg} fill={todo.priority ? 'currentColor' : 'none'}>
                <path d="M10 2.800l2.200 4.500 4.900.7-3.600 3.400.9 4.900L10 14l-4.400 2.300.9-4.900L2.900 8l4.900-.7L10 2.800z" />
              </svg>
            </button>
            <button type="button" aria-label={t.setDue(todo.text)} onClick={() => dateInput.current?.showPicker?.()} className={iconButton}>
              <svg {...svg}>
                <path d="M4 5h12v11H4zM4 8.500h12M7 3v3M13 3v3" />
              </svg>
            </button>
            <input
              ref={dateInput}
              type="date"
              aria-label={t.dueDate}
              tabIndex={-1}
              value={todo.due ?? ''}
              onChange={(e) => onDue(todo.id, e.target.value || null)}
              className="pointer-events-none absolute size-0 opacity-0"
            />
            <button type="button" aria-label={t.editTask(todo.text)} onClick={() => setDraft(todo.text)} className={`${iconButton} max-sm:hidden`}>
              <svg {...svg}>
                <path d="M4 16l.8-3.600L13.600 3.600a1.800 1.800 0 012.600 2.600L7.400 15.200 4 16zM12 5.200l2.800 2.800" />
              </svg>
            </button>
            <button type="button" aria-label={t.deleteTask(todo.text)} onClick={() => onRemove(todo.id)} className={iconButton}>
              <svg {...svg}>
                <path d="M3.500 5.500h13M8 5.500V3.500h4v2M5.500 5.500l.7 10.500h7.600l.7-10.500M8.500 9v4.500M11.500 9v4.500" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.li>
  )
}
