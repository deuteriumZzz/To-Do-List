import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import type { Messages } from '../i18n'
import { ease, springs } from '../motion'

interface StatsProps {
  t: Messages
  total: number
  active: number
  completed: number
}

function Num({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-9 overflow-hidden text-3xl font-semibold leading-9 tabular-nums text-ink">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={springs.snappy}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** Percentage that counts smoothly up or down to its target. */
function Percent({ value }: { value: number }) {
  const mv = useMotionValue(value)
  const text = useTransform(mv, (v) => `${Math.round(v)}%`)
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.6, ease: ease })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span>{text}</motion.span>
}

export function Stats({ t, total, active, completed }: StatsProps) {
  const ratio = total === 0 ? 0 : completed / total
  const items = [
    { label: t.stats.total, value: total },
    { label: t.stats.active, value: active },
    { label: t.stats.done, value: completed },
  ]
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-card ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p className="font-medium text-ink">{t.progress(completed, total)}</p>
        <p className="tabular-nums text-muted">
          <Percent value={Math.round(ratio * 100)} />
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        aria-label={t.progress(completed, total)}
        className="mt-3 h-2 overflow-hidden rounded-full bg-line"
      >
        <motion.div
          initial={false}
          animate={{ scaleX: ratio }}
          transition={springs.gentle}
          className="relative h-full origin-left overflow-hidden rounded-full bg-accent"
        >
          {ratio > 0 && (
            <motion.span
              aria-hidden="true"
              animate={{ x: ['-100%', '320%'] }}
              transition={{ duration: 1.8, ease: 'linear', repeat: Infinity, repeatDelay: 1.4 }}
              className="absolute inset-y-0 left-0 w-1/3 bg-white/35 blur-sm"
            />
          )}
        </motion.div>
      </div>
      <dl className="mt-5 grid grid-cols-3 divide-x divide-line">
        {items.map((i, idx) => (
          <div key={i.label} className={idx === 0 ? 'pr-4' : 'px-4'}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">{i.label}</dt>
            <dd>
              <Num value={i.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
