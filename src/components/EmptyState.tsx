import { motion } from 'motion/react'
import { ease } from '../motion'

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-14 text-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, ease, repeat: Infinity }}
        className="mb-5 grid size-16 place-items-center rounded-2xl bg-surface shadow-card ring-1 ring-line"
      >
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-8 text-accent">
          <rect x="6" y="5" width="20" height="22" rx="4" />
          <path d="M11 12.5l2 2 3.5-4M11 20h10" />
        </svg>
      </motion.div>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-muted">{hint}</p>
    </div>
  )
}
