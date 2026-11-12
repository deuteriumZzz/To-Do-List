import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState, type SubmitEvent } from 'react'
import { formatDue, parseQuickAdd, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { MAX_LENGTH } from '../todos'
import { DateButton } from './DatePicker'
import { CalendarIcon, PlusIcon, StarIcon } from './icons'

interface AddTaskProps {
  t: Messages
  today: ISODate
  open: boolean
  onOpen: () => void
  onClose: () => void
  /** Date used when the text does not name one (e.g. the day selected in the calendar). */
  defaultDue?: ISODate
  onAdd: (text: string, defaults: { due?: ISODate }) => boolean
}

function AddForm({ t, today, onClose, defaultDue, onAdd }: Omit<AddTaskProps, 'open' | 'onOpen'>) {
  const [text, setText] = useState('')
  const [picked, setPicked] = useState<ISODate | undefined>()
  const [example, setExample] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setExample((n) => n + 1), 3500)
    return () => clearInterval(timer)
  }, [])

  const parsed = parseQuickAdd(text, today)
  const due = parsed.due ?? picked ?? defaultDue
  const canAdd = parsed.text !== ''

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canAdd) return
    onAdd(text, due ? { due } : {})
    setText('')
    setPicked(undefined)
  }

  const tool = 'grid size-9 place-items-center rounded-lg hover:bg-ink/10'

  return (
    <motion.form
      aria-label={t.addTask}
      onSubmit={submit}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6, transition: { duration: 0.06 } }}
      transition={springs.snappy}
      className="relative rounded-2xl border border-ink/70 bg-paper p-3"
    >
      <input
        autoFocus
        value={text}
        maxLength={MAX_LENGTH}
        aria-label={t.taskName}
        placeholder={t.examples[example % t.examples.length]}
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
        className="w-full bg-transparent px-1 py-1.5 text-lg font-semibold placeholder:font-normal placeholder:text-ink-2/60 focus:outline-none"
      />

      <div className="flex min-h-7 flex-wrap items-center gap-2 px-1 pb-2 pt-1 text-sm">
        {parsed.priority && (
          <span className="marker rounded px-1.5 font-semibold" style={{ backgroundSize: '100% 100%' }}>
            {t.priority}
          </span>
        )}
        {due && <span className="rounded bg-ink/10 px-1.5 font-semibold">{formatDue(due, today, t.locale, t)}</span>}
        {parsed.project && <span className="rounded bg-ink/10 px-1.5 font-semibold">#{parsed.project}</span>}
      </div>

      <div className="flex items-center gap-1 border-t border-line pt-3">
        <motion.button
          type="button"
          aria-pressed={parsed.priority}
          aria-label={t.priority}
          onClick={() => setText(parsed.priority ? text.replace(/^\s*!/, '') : `!${text}`)}
          className={`${tool} ${parsed.priority ? 'bg-marker' : ''}`}
          {...hoverProps}
        >
          <StarIcon filled={parsed.priority} />
        </motion.button>
        <DateButton t={t} today={today} value={due} label={t.dueDate} onChange={(date) => setPicked(date ?? undefined)} className={tool}>
          <CalendarIcon />
        </DateButton>
        <span className="flex-1" />
        <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-ink-2 hover:bg-ink/10">
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={!canAdd}
          className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-paper transition-[opacity,transform] active:scale-95 disabled:opacity-35"
        >
          {t.addTask}
        </button>
      </div>
    </motion.form>
  )
}

/** Todoist-style inline add: a quiet "+ Add task" row that opens into a form. */
export function AddTask(props: AddTaskProps) {
  const { t, open, onOpen } = props
  return (
    <div className="mt-2">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <AddForm key="form" {...props} />
        ) : (
          <motion.button
            key="row"
            type="button"
            onClick={onOpen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            className="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left font-semibold text-ink-2 hover:text-ink"
            whileHover="hover"
            whileTap="tap"
          >
            <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
              <PlusIcon />
            </span>
            {t.addTask}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
