import { AnimatePresence, motion } from 'motion/react'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import type { View } from '../todos'

interface ListHeaderProps {
  t: Messages
  view: View
  project: string | null
  dateLabel: string
  /** List views get search, a task count and the progress bar. */
  isList: boolean
  visibleCount: number
  done: number
  total: number
  search: string
  onSearch: (value: string) => void
  onClearCompleted: () => void
}

export function ListHeader({
  t,
  view,
  project,
  dateLabel,
  isList,
  visibleCount,
  done,
  total,
  search,
  onSearch,
  onClearCompleted,
}: ListHeaderProps) {
  const ratio = total === 0 ? 0 : done / total
  const percent = Math.round(ratio * 100)

  return (
    <header className="mb-6">
      <p className="font-hand text-2xl leading-none text-ink-2">{dateLabel}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <h1 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
          {project !== null ? `#${project}` : t.views[view]}
        </h1>
        {isList && (
          <div className="relative w-full sm:w-56">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2">
              <circle cx="9" cy="9" r="5.500" />
              <path d="M13.500 13.500L17 17" />
            </svg>
            <input
              type="search"
              value={search}
              placeholder={t.search}
              aria-label={t.search}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onSearch('')
              }}
              className="h-10 w-full rounded-full border border-ink/25 bg-transparent pl-9 pr-3 text-sm placeholder:text-ink-2 focus:border-ink focus:outline-none"
            />
          </div>
        )}
      </div>

      {isList && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3 text-sm text-ink-2">
            <span>
              <span className="font-semibold text-ink">{t.tasksCount(visibleCount)}</span> · {t.progress(done, total)}
            </span>
            <AnimatePresence>
              {done > 0 && (
                <motion.button
                  type="button"
                  onClick={onClearCompleted}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-md px-2 py-1 font-semibold hover:bg-ink/10 hover:text-ink"
                >
                  {t.clearCompleted}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div
            role="progressbar"
            aria-label={t.progress(done, total)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/10"
          >
            <motion.div
              initial={false}
              animate={{ scaleX: ratio }}
              transition={springs.gentle}
              className="h-full origin-left rounded-full bg-marker ring-1 ring-inset ring-ink/60"
            />
          </div>
        </div>
      )}
    </header>
  )
}
