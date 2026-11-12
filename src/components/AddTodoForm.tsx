import { motion, useAnimationControls } from 'motion/react'
import { useState, type SubmitEvent } from 'react'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import { MAX_LENGTH } from '../todos'

interface AddTodoFormProps {
  t: Messages
  onAdd: (text: string) => boolean
}

export function AddTodoForm({ t, onAdd }: AddTodoFormProps) {
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)
  const shake = useAnimationControls()

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const added = onAdd(text)
    setInvalid(!added)
    if (added) setText('')
    else void shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <motion.div
        animate={shake}
        className={`flex items-center gap-2 rounded-2xl bg-surface p-2 shadow-card ring-1 transition-shadow focus-within:ring-2 ${
          invalid ? 'ring-danger' : 'ring-line focus-within:ring-accent'
        }`}
      >
        <label htmlFor="new-task" className="sr-only">
          {t.newTask}
        </label>
        <input
          id="new-task"
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setText(e.target.value)
            setInvalid(false)
          }}
          placeholder={t.placeholder}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'new-task-error' : undefined}
          autoComplete="off"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-muted focus:outline-none"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={springs.pop}
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 font-medium text-on-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="size-4">
            <path d="M10 4v12M4 10h12" />
          </svg>
          {t.add}
        </motion.button>
      </motion.div>
      {invalid && (
        <p id="new-task-error" role="alert" className="mt-2 px-1 text-sm text-danger">
          {t.emptyInput}
        </p>
      )}
    </form>
  )
}
