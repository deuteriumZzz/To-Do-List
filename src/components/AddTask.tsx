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

const tag = 'inline-flex items-center gap-1 rounded-full bg-ink/10 px-2.5 py-0.5 font-hand text-xl leading-none'

/** A note page taped into the notebook: same paper, pen underline and handwriting as the rest. */
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

  const tool = 'grid size-9 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink'

  return (
    <motion.form
      aria-label={t.addTask}
      onSubmit={submit}
      initial={{ opacity: 0, y: 8, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: -0.5 }}
      exit={{ opacity: 0, y: 6, transition: { duration: 0.06 } }}
      transition={springs.snappy}
      className="paper relative mt-3 rounded-[1.1rem] px-5 pb-4 pt-6 shadow-[0_14px_28px_-16px_rgb(0_0_0/0.55)] ring-1 ring-ink/15"
    >
      {/* washi tape */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-8 h-6 w-24 -rotate-3 bg-marker/80 shadow-sm [clip-path:polygon(0_0,100%_0,98%_25%,100%_50%,98%_75%,100%_100%,0_100%,2%_75%,0_50%,2%_25%)]"
      />

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
        className="w-full bg-transparent py-1 text-xl font-semibold placeholder:font-hand placeholder:text-3xl placeholder:font-normal placeholder:text-ink-2/60 focus:outline-none"
      />
      <svg aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none" className="h-2 w-full overflow-visible">
        <motion.path
          d="M0 3 Q10 0.5 22 3 T46 3 T70 3 T100 2.5"
          fill="none"
          stroke="#141413"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        />
      </svg>

      <div className="flex min-h-9 flex-wrap items-center gap-2 pt-2">
        {parsed.priority && (
          <span className="marker px-2 font-hand text-xl leading-none" style={{ backgroundSize: '100% 100%' }}>
            {t.priority}
          </span>
        )}
        {due && (
          <span className={tag}>
            <CalendarIcon className="size-3.5" />
            {formatDue(due, today, t.locale, t)}
          </span>
        )}
        {parsed.project && <span className={tag}>#{parsed.project}</span>}
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-dashed border-ink/25 pt-3">
        <motion.button
          type="button"
          aria-pressed={parsed.priority}
          aria-label={t.priority}
          onClick={() => setText(parsed.priority ? text.replace(/^\s*!/, '') : `!${text}`)}
          className={`${tool} ${parsed.priority ? 'bg-marker text-ink' : ''}`}
          {...hoverProps}
        >
          <StarIcon filled={parsed.priority} />
        </motion.button>
        <DateButton t={t} today={today} value={due} label={t.dueDate} onChange={(date) => setPicked(date ?? undefined)} className={tool}>
          <CalendarIcon />
        </DateButton>
        <span className="flex-1" />
        <button type="button" onClick={onClose} className="rounded-full px-3 py-1 font-hand text-2xl leading-none text-ink-2 hover:text-ink">
          {t.cancel}
        </button>
        <button
          type="submit"
          disabled={!canAdd}
          className="rounded-[14px_20px_16px_22px] bg-ink px-5 py-1.5 font-hand text-2xl leading-none text-paper shadow-[0_3px_0_rgb(0_0_0/0.35)] transition-[opacity,transform,box-shadow] hover:-translate-y-px active:translate-y-0.5 active:shadow-none disabled:opacity-35 disabled:hover:translate-y-0"
        >
          {t.addTask}
        </button>
      </div>
    </motion.form>
  )
}

/** Inline add: a quiet "+ Add task" row that opens into a taped note. */
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
            className="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left font-hand text-2xl leading-none text-ink-2 hover:text-ink"
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
