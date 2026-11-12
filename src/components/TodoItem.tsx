import { motion } from 'motion/react'
import { useState } from 'react'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import type { Todo } from '../todos'

interface TodoItemProps {
  t: Messages
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function TodoItem({ t, todo, onToggle, onRemove }: TodoItemProps) {
  const [burst, setBurst] = useState(0)

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -28, scale: 0.97 }}
      whileHover={{ y: -2 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0 }}
      dragSnapToOrigin
      onDragEnd={(_, info) => {
        if (info.offset.x < -96 || info.velocity.x < -600) onRemove(todo.id)
      }}
      transition={springs.snappy}
      className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 ring-1 ring-line transition-colors ${
        todo.completed ? 'bg-surface/60' : 'bg-surface shadow-card'
      }`}
    >
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => {
            if (!todo.completed) setBurst((b) => b + 1)
            onToggle(todo.id)
          }}
          className="peer sr-only"
        />
        <motion.span
          aria-hidden="true"
          whileTap={{ scale: 0.82 }}
          transition={springs.pop}
          className={`relative grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${
            todo.completed ? 'border-accent bg-accent' : 'border-line-strong hover:border-accent'
          }`}
        >
          {burst > 0 && (
            <motion.span
              key={burst}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="pointer-events-none absolute size-6 rounded-full border-2 border-accent"
            />
          )}
          <svg viewBox="0 0 16 16" fill="none" className="size-3.5 text-on-accent">
            <motion.path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: todo.completed ? 1 : 0, opacity: todo.completed ? 1 : 0 }}
              transition={{ duration: 0.25 }}
            />
          </svg>
        </motion.span>
        <span
          className={`min-w-0 break-words line-through transition-colors duration-300 ${
            todo.completed ? 'text-muted decoration-muted' : 'text-ink decoration-transparent'
          }`}
        >
          {todo.text}
        </span>
      </label>
      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        aria-label={t.deleteTask(todo.text)}
        className="shrink-0 rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-danger [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-5"
        >
          <path d="M3.5 5.5h13M8 5.5V3.5h4v2M5.5 5.5l.7 10.5h7.6l.7-10.5M8.5 9v4.5M11.5 9v4.5" />
        </svg>
      </button>
    </motion.li>
  )
}
