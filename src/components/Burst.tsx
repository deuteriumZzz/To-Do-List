import { motion } from 'motion/react'
import { ease } from '../motion'

const COLORS = ['#ff5b14', '#2fd26b', '#ffc933', '#1c1b19']

/** One-shot burst of tiny square sparks from the centre of the parent. */
export function Burst({ count = 10, radius = 34 }: { count?: number; radius?: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2
        const reach = radius * (0.7 + (i % 3) * 0.25)
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{ x: Math.cos(angle) * reach, y: Math.sin(angle) * reach, opacity: 0, scale: 0.4, rotate: i * 60 }}
            transition={{ duration: 0.65, ease }}
            style={{ background: COLORS[i % COLORS.length] }}
            className="absolute -ml-[3px] -mt-[3px] block size-[6px] rounded-[1px]"
          />
        )
      })}
    </span>
  )
}
