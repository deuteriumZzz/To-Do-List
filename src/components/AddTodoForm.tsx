import { motion, useAnimationControls } from 'motion/react'
import { useEffect, useState, type RefObject, type SubmitEvent } from 'react'
import type { Messages } from '../i18n'
import { MAX_LENGTH } from '../todos'

interface AddTodoFormProps {
  t: Messages
  inputRef: RefObject<HTMLInputElement | null>
  onAdd: (text: string) => boolean
}

export function AddTodoForm({ t, inputRef, onAdd }: AddTodoFormProps) {
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [example, setExample] = useState(0)
  const shake = useAnimationControls()

  // rotating example in the placeholder
  useEffect(() => {
    const timer = setInterval(() => setExample((n) => n + 1), 3500)
    return () => clearInterval(timer)
  }, [])

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const added = onAdd(text)
    setInvalid(!added)
    if (added) setText('')
    else void shake.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <motion.div animate={shake} className={`slot flex items-center gap-2 p-2 ${invalid ? 'ring-2 ring-signal' : ''}`}>
        <label htmlFor="new-task" className="sr-only">
          {t.newTask}
        </label>
        <input
          ref={inputRef}
          id="new-task"
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setText(e.target.value)
            setInvalid(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setText('')
              e.currentTarget.blur()
            }
          }}
          placeholder={t.examples[example % t.examples.length]}
          aria-invalid={invalid}
          aria-describedby={invalid ? 'new-task-error' : undefined}
          autoComplete="off"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-base text-ink placeholder:text-ink-2/70 focus:outline-none"
        />
        <kbd
          aria-hidden="true"
          className="hidden h-6 min-w-6 items-center justify-center rounded-md bg-plate px-1.5 font-mono text-xs text-ink-2 shadow-[0_1px_0_#aaa598] sm:inline-flex"
        >
          /
        </kbd>
        <button
          type="submit"
          className="key key-signal flex h-11 shrink-0 items-center gap-1.5 px-4 font-semibold text-ink"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="size-4">
            <path d="M10 4v12M4 10h12" />
          </svg>
          {t.add}
        </button>
      </motion.div>
      {invalid && (
        <p id="new-task-error" role="alert" className="mt-2 px-1 font-mono text-xs font-medium text-signal-ink">
          ▲ {t.emptyInput}
        </p>
      )}
    </form>
  )
}
