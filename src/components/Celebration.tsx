import { motion } from 'motion/react'
import { ease, springs } from '../motion'

const COLORS = ['bg-accent', 'bg-amber-400', 'bg-rose-400', 'bg-sky-400']
const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2
  const reach = 70 + (i % 3) * 22
  return { x: Math.cos(angle) * reach, y: Math.sin(angle) * reach * 0.7 - 10, rotate: i * 47, color: COLORS[i % COLORS.length] }
})

/** Banner with a one-shot confetti burst, shown when every task is done. */
export function Celebration({ message }: { message: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={springs.pop}
      className="relative flex items-center justify-center gap-2 overflow-visible rounded-2xl bg-accent/12 px-4 py-3 text-sm font-medium text-accent ring-1 ring-accent/30"
    >
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
        {PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: p.x, y: p.y + 30, opacity: 0, scale: 0.6, rotate: p.rotate }}
            transition={{ duration: 1.1, ease }}
            className={`absolute -ml-1 -mt-1 block h-2 w-1.5 rounded-sm ${p.color}`}
          />
        ))}
      </span>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5">
        <path d="M10 2.5l2.1 4.6 5 .6-3.7 3.4 1 4.9L10 13.5l-4.4 2.5 1-4.9L2.9 7.7l5-.6L10 2.5z" />
      </svg>
      {message}
    </motion.div>
  )
}
