import { motion } from 'motion/react'

export type Mood = 'curious' | 'cheer' | 'sleepy'

/** Pixel face drawn on the LCD; the mood follows the screen it is shown on. */
export function Face({ mood }: { mood: Mood }) {
  return (
    <svg viewBox="0 0 16 11" shapeRendering="crispEdges" fill="currentColor" aria-hidden="true" className="h-14 w-20">
      {mood === 'curious' && (
        <>
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1] }}
            transition={{ duration: 3.4, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
            style={{ originY: '35%' }}
          >
            <rect x="3" y="2" width="3" height="4" />
            <rect x="10" y="2" width="3" height="4" />
          </motion.g>
          <rect x="7" y="8" width="2" height="2" />
        </>
      )}
      {mood === 'cheer' && (
        <>
          <path d="M3 5h1V3h1v-1h1v1h1v2H6V4H4v1z M9 5h1V3h1v-1h1v1h1v2h-1V4h-2v1z" />
          <path d="M3 7h10v1h-1v1h-1v1H5V9H4V8H3z" />
        </>
      )}
      {mood === 'sleepy' && (
        <>
          <rect x="3" y="4" width="3" height="1" />
          <rect x="10" y="4" width="3" height="1" />
          <rect x="6" y="8" width="4" height="1" />
          <path d="M13 0h2v1h-1v1h1v1h-2V2h1V1h-1z" />
        </>
      )}
    </svg>
  )
}
