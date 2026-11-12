import { motion } from 'motion/react'
import { fromISO, type ISODate } from '../dates'
import type { Messages } from '../i18n'
import { springs } from '../motion'
import { painted, type Hue } from '../palette'
import type { Report } from '../report'
import { Tick } from './Tick'

interface ReportViewProps {
  t: Messages
  report: Report
  today: ISODate
}

export function ReportView({ t, report, today }: ReportViewProps) {
  const max = Math.max(1, ...report.days.map((d) => d.count))
  const tiles = [
    { label: t.report.today, value: report.completedToday, hue: 'green' as Hue },
    { label: t.report.week, value: report.completedWeek, hue: 'sky' as Hue },
    { label: t.report.streak, value: report.streak, hue: 'orange' as Hue },
    { label: t.report.rate, value: `${report.rate}%`, hue: 'pink' as Hue },
  ]
  const dayLabel = (iso: ISODate) =>
    new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(fromISO(iso))
  const short = (iso: ISODate) => new Intl.DateTimeFormat(t.locale, { weekday: 'short' }).format(fromISO(iso))

  return (
    <div className="flex flex-col gap-8">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-line p-4">
            <dd className="font-hand text-6xl font-bold leading-none tabular-nums">
              <span className="marker -mx-1 px-1 leading-[1.2]" style={painted(tile.hue)}>
                {tile.value}
              </span>
            </dd>
            <dt className="mt-2 text-sm text-ink-2">{tile.label}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-semibold">
        <span className={report.overdue > 0 ? 'text-danger' : 'text-ink-2'}>
          {t.report.overdue}: {report.overdue}
        </span>
        <span className={report.dueToday > 0 ? 'text-ok' : 'text-ink-2'}>
          {t.report.dueToday}: {report.dueToday}
        </span>
      </div>

      <figure>
        <figcaption className="mb-4 font-hand text-4xl font-bold leading-none">{t.report.chartTitle}</figcaption>
        <div className="flex">
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
                <span className="mb-1 h-5 text-sm font-bold tabular-nums">{d.count > 0 ? d.count : ''}</span>
                <span className="flex h-36 w-full items-end justify-center border-b border-ink/50">
                  <motion.span
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: d.count / max }}
                    transition={springs.gentle}
                    className="block h-full w-full max-w-10 origin-bottom rounded-t-[4px] bg-ink"
                  />
                </span>
                <span
                  className={`mt-2 text-xs font-bold uppercase tracking-wide ${isToday ? 'marker' : 'text-ink-2'}`}
                  style={isToday ? painted('green') : undefined}
                >
                  {short(d.date)}
                </span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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

      {report.completedWeek === 0 && (
        <div className="flex items-center gap-4">
          <Tick className="h-16 w-16 shrink-0" mood="sleepy" />
          <p className="font-hand text-2xl leading-tight text-ink-2">{t.report.empty}</p>
        </div>
      )}
    </div>
  )
}
