import { motion } from 'motion/react'

const BLOBS = [
  { className: 'left-[-8rem] top-[-6rem] bg-accent/25', x: [0, 60, -20, 0], y: [0, 40, 80, 0], duration: 26 },
  { className: 'right-[-10rem] top-[18rem] bg-sky-400/15', x: [0, -70, 20, 0], y: [0, -30, 50, 0], duration: 32 },
]

/** Slow ambient glow behind the app; purely decorative. */
export function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {BLOBS.map((b) => (
        <motion.div
          key={b.className}
          animate={{ x: b.x, y: b.y }}
          transition={{ duration: b.duration, ease: 'easeInOut', repeat: Infinity }}
          className={`absolute size-[28rem] rounded-full blur-3xl ${b.className}`}
        />
      ))}
    </div>
  )
}
