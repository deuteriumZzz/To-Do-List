import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'
import type { Messages } from '../i18n'
import { ease, springs } from '../motion'

const LEDS = 12

interface StatsProps {
  t: Messages
  total: number
  active: number
  completed: number
}

/** LCD digit that rolls to its new value. */
function Num({ value }: { value: number }) {
  return (
    <span className="relative inline-flex h-10 overflow-hidden">
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
    const controls = animate(mv, value, { duration: 0.6, ease })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span>{text}</motion.span>
}

export function Stats({ t, total, active, completed }: StatsProps) {
  const ratio = total === 0 ? 0 : completed / total
  const percent = Math.round(ratio * 100)
  const lit = Math.round(ratio * LEDS)
  const items = [
    { label: t.stats.total, value: total },
    { label: t.stats.active, value: active },
    { label: t.stats.done, value: completed },
  ]

  return (
    <section className="flex flex-col gap-3">
      <dl className="grid grid-cols-3 gap-2.5">
        {items.map((i) => (
          <div key={i.label} className="lcd px-3.5 py-3">
            <dt className="text-[10px] font-medium uppercase tracking-[0.16em] opacity-70">{i.label}</dt>
            <dd className="relative mt-1 flex h-10 justify-end text-4xl font-medium leading-10 tabular-nums">
              <span aria-hidden="true" className="absolute right-0 opacity-[0.09]">
                88
              </span>
              <Num value={i.value} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="slot flex flex-col gap-2.5 px-4 py-3">
        <div className="flex items-center justify-between font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
          <span>{t.progress(completed, total)}</span>
          <span className="tabular-nums text-ink">
            <Percent value={percent} />
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t.progress(completed, total)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="flex items-center justify-between gap-1"
        >
          {Array.from({ length: LEDS }, (_, i) => (
            <span
              key={i}
              className="led led-boot"
              data-on={i < lit}
              data-tone="signal"
              style={{ '--i': i, transitionDelay: `${i * 30}ms` } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
