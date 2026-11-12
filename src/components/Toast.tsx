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

/** Bottom toast with an undo action; dismisses itself after a few seconds. */
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
      className="fixed inset-x-4 bottom-5 z-20 mx-auto flex max-w-sm items-center justify-between gap-4 rounded-xl bg-ink px-4 py-3 text-sm text-paper shadow-[0_18px_40px_-12px_rgb(0_0_0/0.6)] md:left-6 md:right-auto md:mx-0"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onAction}
        className="rounded-md px-2 py-0.5 font-bold text-marker underline underline-offset-4 hover:no-underline focus-visible:outline-marker"
      >
        {actionLabel}
      </button>
    </motion.div>
  )
}
