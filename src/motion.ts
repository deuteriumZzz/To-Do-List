/** Shared motion tokens: every component takes its timing from here. */
export const springs = {
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  gentle: { type: 'spring', stiffness: 180, damping: 24 },
  pop: { type: 'spring', stiffness: 520, damping: 20 },
} as const

export const ease = [0.22, 1, 0.36, 1] as const

/**
 * Spread onto a `motion.button`: its hover and tap states reach every animated icon inside,
 * so each icon plays its own small animation (lid lifts, page flips, pencil writes, ...).
 */
export const hoverProps = { initial: 'rest', animate: 'rest', whileHover: 'hover', whileTap: 'tap' } as const
