import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Messages } from '../i18n'
import { hoverProps, springs } from '../motion'
import { PALETTE } from '../palette'
import type { View } from '../todos'
import { CloseIcon, SearchIcon } from './icons'

interface ListHeaderProps {
  t: Messages
  view: View
  project: string | null
  dateLabel: string
  /** List views get search and the progress strip. */
  isList: boolean
  done: number
  total: number
  search: string
  onSearch: (value: string) => void
  onClearCompleted: () => void
}

/** Search written in the notebook: a hand-drawn baseline, and a marker swipe is painted behind it on focus. */
function SearchField({ t, value, onChange }: { t: Messages; value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <motion.div {...hoverProps} className="relative w-full transition-[width] duration-300 sm:w-56 sm:focus-within:w-72">
      <span
        aria-hidden="true"
        className="marker pointer-events-none absolute -inset-x-1.5 bottom-0 h-10"
        style={{ backgroundSize: focused ? '100% 100%' : '0% 100%' }}
      />
      <div className="relative flex items-center gap-2 pb-1.5">
        <motion.span animate={focused ? { rotate: [0, -14, 10, 0] } : { rotate: 0 }} transition={{ duration: 0.5 }} className="text-ink-2">
          <SearchIcon />
        </motion.span>
        <input
          type="search"
          value={value}
          placeholder={t.search}
          aria-label={t.search}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onChange('')
          }}
          className="min-w-0 flex-1 bg-transparent font-hand text-2xl font-bold leading-none placeholder:font-normal placeholder:text-ink-2/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              aria-label={t.cancel}
              onClick={() => onChange('')}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={springs.pop}
              whileHover="hover"
              whileTap="tap"
              className="grid size-6 place-items-center rounded-full text-ink-2 hover:bg-ink/10 hover:text-ink"
            >
              <CloseIcon className="size-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <svg aria-hidden="true" viewBox="0 0 100 8" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full overflow-visible">
        <path
          d="M0 4 Q8 1 18 4.500 T40 3.500 T64 5 T84 3 T100 4"
          fill="none"
          stroke="#141413"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </motion.div>
  )
}

export function ListHeader({ t, view, project, dateLabel, isList, done, total, search, onSearch, onClearCompleted }: ListHeaderProps) {
  const ratio = total === 0 ? 0 : done / total
  const percent = Math.round(ratio * 100)

  return (
    <header className="mb-6">
      <p className="font-hand text-2xl leading-none text-ink-2">{dateLabel}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <h1 className="py-1 pl-0.5 pr-5 font-hand text-5xl font-bold leading-none sm:text-7xl">{project !== null ? `#${project}` : t.views[view]}</h1>
        {isList && <SearchField t={t} value={search} onChange={onSearch} />}
      </div>

      {isList && (
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <div
              role="progressbar"
              aria-label={t.progress(done, total)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              style={{ filter: 'url(#rough-edge)' }}
              className="relative h-4 flex-1 overflow-hidden rounded-full bg-ink/10"
            >
              <motion.div
                initial={false}
                animate={{ x: `${(ratio - 1) * 100}%` }}
                transition={springs.gentle}
                style={{ backgroundColor: ratio < 1 / 3 ? PALETTE.pink : ratio < 2 / 3 ? PALETTE.yellow : PALETTE.green }}
                className="highlighter absolute inset-0 rounded-full transition-colors duration-500"
              />
            </div>
            <span className="min-w-[3.2ch] text-right font-hand text-5xl font-bold leading-none tabular-nums">{percent}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-ink-2">
            <span>{t.progress(done, total)}</span>
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
        </div>
      )}
    </header>
  )
}
