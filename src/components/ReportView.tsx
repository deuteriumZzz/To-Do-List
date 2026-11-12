import { motion } from 'motion/react'
import { fromISO, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import { PALETTE, brushColumn, paintedBlock, type Hue } from '../palette'
import type { Report } from '../report'
import { Tick } from './Tick'

interface ReportViewProps {
  t: Messages
  report: Report
  today: ISODate
}

const TAPE =
  '[clip-path:polygon(0_0,100%_0,98%_25%,100%_50%,98%_75%,100%_100%,0_100%,2%_75%,0_50%,2%_25%)]'

/** A hand-drawn ring that draws itself up to the given share (0-1). */
function HandRing({ share }: { share: number }) {
  const d = 'M28 4C42 3 53 14 52 28C51 43 40 53 27 52C13 51 3 41 4 27C5 14 15 5 28 4Z'
  return (
    <svg aria-hidden="true" viewBox="0 0 56 56" className="pointer-events-none absolute right-2 top-3 size-[4.5rem] -rotate-90 opacity-30">
      <path d={d} fill="none" stroke="#141413" strokeOpacity="0.15" strokeWidth="5" strokeLinecap="round" />
      <motion.path
        d={d}
        fill="none"
        stroke="#141413"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: share }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

export function ReportView({ t, report, today }: ReportViewProps) {
  const max = Math.max(1, ...report.days.map((d) => d.count))
  const notes: { label: string; value: string | number; hue: Hue; tilt: number; ring?: boolean }[] = [
    { label: t.report.today, value: report.completedToday, hue: 'green', tilt: -1.5 },
    { label: t.report.week, value: report.completedWeek, hue: 'sky', tilt: 1 },
    { label: t.report.streak, value: report.streak, hue: 'orange', tilt: -0.8 },
    { label: t.report.rate, value: `${report.rate}%`, hue: 'pink', tilt: 1.4, ring: true },
  ]
  const dayLabel = (iso: ISODate) =>
    new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(iso))
  const short = (iso: ISODate) => new Intl.DateTimeFormat(t.locale, { weekday: 'short' }).format(fromISO(iso))

  return (
    <div className="flex flex-col gap-9">
      {/* sticky notes taped to the page */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {notes.map((n, i) => (
          <motion.div
            key={n.label}
            initial={{ opacity: 0, y: 14, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: n.tilt }}
            whileHover={{ rotate: 0, y: -4 }}
            transition={{ ...springs.snappy, delay: i * 0.07 }}
            style={{ backgroundColor: PALETTE[n.hue] }}
            className="relative rounded-[4px] px-4 pb-4 pt-6 shadow-[0_14px_20px_-14px_rgb(0_0_0/0.55)]"
          >
            <span aria-hidden="true" className={`absolute -top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 bg-paper/70 shadow-sm ${TAPE}`} />
            {n.ring && <HandRing share={report.rate / 100} />}
            <dd className="font-hand text-7xl font-bold leading-none tabular-nums">{n.value}</dd>
            <dt className="mt-1 font-hand text-2xl leading-none text-ink/70">{n.label}</dt>
          </motion.div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Tick className="h-14 w-14 shrink-0" mood={report.streak > 0 ? 'idle' : 'sleepy'} />
        <p className="font-hand text-3xl leading-tight">{t.report.cheer(report.streak)}</p>
        <span className="ml-auto flex flex-wrap gap-2 font-hand text-2xl leading-none">
          <span className={`px-3 py-1.5 ${report.overdue > 0 ? 'text-danger' : 'text-ink-2'}`} style={paintedBlock(report.overdue > 0 ? '#ffc4ba' : '#e9e5da')}>
            {t.report.overdue}: {report.overdue}
          </span>
          <span className="px-3 py-1.5" style={paintedBlock(report.dueToday > 0 ? PALETTE.green : '#e9e5da')}>
            {t.report.dueToday}: {report.dueToday}
          </span>
        </span>
      </div>

      {/* chart on a ruled notebook page */}
      <figure className="relative overflow-hidden rounded-[1.75rem] border border-line bg-paper-2/50 px-3 pb-5 pt-10 sm:px-6">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 flex justify-around px-8 sm:px-12">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="-mt-2.5 h-5 w-2.5 rounded-full bg-ink shadow-[inset_0_-3px_0_rgb(255_255_255/0.22)]" />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-20 opacity-70 [background-image:repeating-linear-gradient(transparent_0_35px,var(--color-line)_35px_36px)]"
        />
        <figcaption className="relative mb-3 font-hand text-4xl font-bold leading-none">{t.report.chartTitle}</figcaption>

        <div className="relative flex">
          {report.days.map((d) => {
            const hint = t.report.chartHint(d.count, dayLabel(d.date))
            const isToday = d.date === today
            return (
              <button
                key={d.date}
                type="button"
                aria-label={hint}
                className="group relative flex flex-1 flex-col items-center px-1 focus-visible:outline-offset-0 sm:px-3"
              >
                <span className="mb-1 h-8 font-hand text-4xl font-bold leading-none tabular-nums">{d.count > 0 ? d.count : ''}</span>
                <span className="relative -mx-1 flex h-36 w-[calc(100%+0.5rem)] items-end justify-center sm:-mx-3 sm:w-[calc(100%+1.5rem)]">
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: d.count / max }}
                    transition={springs.gentle}
                    style={{ backgroundImage: brushColumn(isToday ? PALETTE.green : '#141413'), backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}
                    className="block h-full w-10 origin-bottom"
                  />
                  <svg aria-hidden="true" viewBox="0 0 100 4" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1.5 w-full">
                    <path d="M0 2 Q10 0.6 22 2.2 T46 1.8 T70 2.4 T100 1.9" fill="none" stroke="#141413" strokeOpacity="0.5" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className={`mt-1 font-hand text-2xl font-bold leading-none ${isToday ? 'text-ok' : 'text-ink-2'}`}>{short(d.date)}</span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-hand text-xl leading-none text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {hint}
                </span>
              </button>
            )
          })}
        </div>
        <table className="sr-only">
          <caption>{t.report.chartTitle}</caption>
          <thead>
            <tr>
              <th>{t.report.tableDay}</th>
              <th>{t.report.tableDone}</th>
            </tr>
          </thead>
          <tbody>
            {report.days.map((d) => (
              <tr key={d.date}>
                <td>{dayLabel(d.date)}</td>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </div>
  )
}
