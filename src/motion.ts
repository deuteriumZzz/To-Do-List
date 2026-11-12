/** Shared motion tokens: every component takes its timing from here. */
export const springs = {
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  gentle: { type: 'spring', stiffness: 180, damping: 24 },
  pop: { type: 'spring', stiffness: 520, damping: 20 },
} as const

export const ease = [0.22, 1, 0.36, 1] as const
