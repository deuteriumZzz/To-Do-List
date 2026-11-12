import { motion } from 'motion/react'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import type { Filter } from '../todos'

const ORDER: Filter[] = ['all', 'active', 'completed']

interface FiltersProps {
  t: Messages
  value: Filter
  counts: Record<Filter, number>
  onChange: (f: Filter) => void
}

export function Filters({ t, value, counts, onChange }: FiltersProps) {
  return (
    <div role="group" aria-label={t.filterGroup} className="flex w-full gap-1 rounded-2xl bg-line/70 p-1 sm:w-auto">
      {ORDER.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={value === f}
          onClick={() => onChange(f)}
          className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent sm:flex-none sm:px-4 ${
            value === f ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          {value === f && (
            <motion.span
              layoutId="filter-pill"
              transition={springs.snappy}
              className="absolute inset-0 rounded-xl bg-surface shadow-sm"
            />
          )}
          <span className="relative">{t.filters[f]}</span>
          <span aria-hidden="true" className="relative text-xs tabular-nums text-muted">
            {counts[f]}
          </span>
        </button>
      ))}
    </div>
  )
}
