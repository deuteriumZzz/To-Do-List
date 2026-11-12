import { motion, useAnimationControls, useMotionValue } from 'motion/react'
import { useEffect } from 'react'

interface TickProps {
  className?: string
  /** "sleepy" closes the eye and floats a z. */
  mood?: 'idle' | 'sleepy'
  /** Increase to make Tick hop with joy. */
  cheer?: number
  /** Keep hopping forever (used on the "all done" screen). */
  celebrate?: boolean
}

/**
 * Tick: the mascot, a chunky check mark with one eye and two little feet.
 * Its pupil follows the pointer, it blinks, hops when a task is done and naps when idle.
 */
export function Tick({ className, mood = 'idle', cheer = 0, celebrate = false }: TickProps) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const hop = useAnimationControls()
  const squint = useAnimationControls()

  useEffect(() => {
    function onMove(e: PointerEvent) {
      px.set((e.clientX / window.innerWidth - 0.5) * 3.4)
      py.set((e.clientY / window.innerHeight - 0.5) * 3.4)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [px, py])

  useEffect(() => {
    if (cheer === 0) return
    void hop.start({ y: [0, -9, 0, -4, 0], transition: { duration: 0.7 } })
    void squint.start({ scaleY: [1, 0.15, 0.15, 1], transition: { duration: 0.9, times: [0, 0.15, 0.8, 1] } })
  }, [cheer, hop, squint])

  useEffect(() => {
    if (celebrate) void hop.start({ y: [0, -8, 0], transition: { duration: 0.9, repeat: Infinity, repeatDelay: 0.5 } })
    else hop.stop()
  }, [celebrate, hop])

  const asleep = mood === 'sleepy'

  return (
    <motion.svg viewBox="0 0 48 52" aria-hidden="true" className={className} animate={hop} initial={false}>
      <path d="M7 28l12 12L39 11" fill="none" stroke="#141413" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="42" width="5" height="7" rx="1.6" fill="#141413" />
      <rect x="21" y="42" width="5" height="7" rx="1.6" fill="#141413" />
      {asleep ? (
        <>
          <path d="M28 22.500h8" stroke="#efece4" strokeWidth="2" strokeLinecap="round" />
          <text x="38" y="9" fontSize="8" fontWeight="700" fill="#141413">
            z
          </text>
        </>
      ) : (
        <motion.g animate={squint} initial={false} style={{ originX: '32px', originY: '22px' }}>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 4, times: [0, 0.92, 0.96, 1], repeat: Infinity }}
            style={{ originX: '32px', originY: '22px' }}
          >
            <circle cx="32" cy="22" r="5" fill="#efece4" />
            <motion.circle cx="32" cy="22" r="2.4" fill="#141413" style={{ x: px, y: py }} />
          </motion.g>
        </motion.g>
      )}
    </motion.svg>
  )
}
