import { motion } from 'motion/react'
import { useState } from 'react'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import type { Todo } from '../todos'
import { Burst } from './Burst'

interface TodoItemProps {
  t: Messages
  todo: Todo
  index: number
  onToggle: (id: string) => void
  onRemove: (id: string) => void
  onEdit: (id: string, text: string) => boolean
}

const iconKey =
  'key grid size-9 shrink-0 place-items-center text-ink-2 hover:text-ink focus-visible:opacity-100 group-focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100'

export function TodoItem({ t, todo, index, onToggle, onRemove, onEdit }: TodoItemProps) {
  const [burst, setBurst] = useState(0)
  const [draft, setDraft] = useState<string | null>(null)

  function finishEdit(save: boolean) {
    if (save && draft !== null) onEdit(todo.id, draft)
    setDraft(null)
  }

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -28, scale: 0.97 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0 }}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x < -96 || info.velocity.x < -600) onRemove(todo.id)
      }}
      transition={springs.snappy}
      className={`group flex items-center gap-3 px-3.5 py-3 ${todo.completed ? 'plate-flat' : 'plate'}`}
    >
      <span aria-hidden="true" className="w-5 shrink-0 font-mono text-[11px] tabular-nums text-ink-2">
        {String(index).padStart(2, '0')}
      </span>

      <label className="relative shrink-0 cursor-pointer">
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
        <span
          aria-hidden="true"
          className={`slot relative block h-7 w-[3.1rem] rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal ${
            todo.completed ? 'bg-signal' : ''
          }`}
        >
          <motion.span
            animate={{ x: todo.completed ? 22 : 0 }}
            transition={springs.pop}
            className="plate absolute left-0.5 top-0.5 block size-6 rounded-full"
          />
        </span>
        {burst > 0 && <Burst key={burst} />}
      </label>

      {draft === null ? (
        <span
          onClick={() => onToggle(todo.id)}
          className={`min-w-0 flex-1 cursor-pointer break-words transition-colors duration-300 ${
            todo.completed ? 'text-ink-2 line-through decoration-2' : 'text-ink'
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
          className="slot h-9 min-w-0 flex-1 bg-transparent px-3 text-ink focus:outline-none"
        />
      )}

      {draft === null && (
        <>
          <button type="button" onClick={() => setDraft(todo.text)} aria-label={t.editTask(todo.text)} className={iconKey}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[18px]">
              <path d="M4 16l.8-3.6L13.6 3.6a1.8 1.8 0 012.6 2.6L7.4 15.2 4 16zM12 5.2l2.8 2.8" />
            </svg>
          </button>
          <button type="button" onClick={() => onRemove(todo.id)} aria-label={t.deleteTask(todo.text)} className={iconKey}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[18px]">
              <path d="M3.5 5.5h13M8 5.5V3.5h4v2M5.5 5.5l.7 10.5h7.6l.7-10.5M8.5 9v4.5M11.5 9v4.5" />
            </svg>
          </button>
        </>
      )}
    </motion.li>
  )
}
