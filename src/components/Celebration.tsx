import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { springs } from '../motion'
import { Burst } from './Burst'

/** LCD banner with a chasing LED row and a confetti burst; shown when every task is done. */
export function Celebration({ message }: { message: string }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={springs.pop}
      className="lcd relative flex items-center gap-3 px-4 py-3.5 text-sm font-medium uppercase tracking-[0.08em]"
    >
      <span aria-hidden="true" className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="led led-chase" data-tone="signal" style={{ '--i': i } as CSSProperties} />
        ))}
      </span>
      <span className="flex-1">{message}</span>
      <Burst count={22} radius={110} />
    </motion.div>
  )
}
