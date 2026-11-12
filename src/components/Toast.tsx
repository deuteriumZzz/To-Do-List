import { motion } from 'motion/react'
import { useEffect } from 'react'
import { springs } from '../motion'

interface ToastProps {
  message: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
}

const LIFETIME_MS = 6000

/** Bottom toast with an undo key; dismisses itself after a few seconds. */
export function Toast({ message, actionLabel, onAction, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, LIFETIME_MS)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={springs.snappy}
      className="fixed inset-x-3 bottom-4 z-20 mx-auto flex max-w-sm items-center justify-between gap-4 rounded-2xl bg-ink py-2.5 pl-5 pr-2.5 text-sm text-panel shadow-[0_20px_40px_-12px_rgb(0_0_0/0.6)]"
    >
      <span className="font-mono">{message}</span>
      <button
        type="button"
        onClick={onAction}
        className="key key-signal rounded-xl px-4 py-1.5 font-semibold text-ink"
      >
        {actionLabel}
      </button>
    </motion.div>
  )
}
