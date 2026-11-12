/** Local calendar date as "YYYY-MM-DD" (no time zone surprises). */
export type ISODate = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isISODate(value: unknown): value is ISODate {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && toISO(fromISO(value)) === value
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** 42 consecutive days (6 weeks) covering the month, starting on `weekStartsOn` (0 = Sunday, 1 = Monday). */
export function monthGrid(year: number, month: number, weekStartsOn: 0 | 1): ISODate[] {
  const offset = (new Date(year, month, 1).getDay() - weekStartsOn + 7) % 7
  return Array.from({ length: 42 }, (_, i) => toISO(new Date(year, month, 1 - offset + i)))
}

/** Short weekday names in calendar order (2023-01-01 is a Sunday). */
export function weekdayNames(locale: string, weekStartsOn: 0 | 1): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2023, 0, 1 + weekStartsOn + i)),
  )
}

interface DueLabels {
  today: string
  tomorrow: string
  yesterday: string
}

/** "Today", "Tomorrow", "Yesterday" or a short date like "14 Nov". */
export function formatDue(iso: ISODate, today: ISODate, locale: string, labels: DueLabels): string {
  if (iso === today) return labels.today
  if (iso === addDays(today, 1)) return labels.tomorrow
  if (iso === addDays(today, -1)) return labels.yesterday
  const sameYear = iso.slice(0, 4) === today.slice(0, 4)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  }).format(fromISO(iso))
}

export interface QuickAdd {
  text: string
  priority: boolean
  due?: ISODate
  project?: string
}

const START = '(?<=^|\\s)'
const SPACE_OR_END = '(?=\\s|$)'
const END = '(?![\\p{L}\\p{N}])'
const DATE_WORDS: Record<string, number> = { today: 0, tomorrow: 1, сегодня: 0, завтра: 1 }

/**
 * Quick-add syntax, understood anywhere in the text:
 * a leading `!` = priority, `#name` = project, `today` / `tomorrow` / `сегодня` / `завтра`
 * or an ISO date = due date. Recognised tokens are removed from the title.
 */
export function parseQuickAdd(raw: string, today: ISODate): QuickAdd {
  let text = raw.trim()
  const priority = text.startsWith('!')
  if (priority) text = text.slice(1)

  let project: string | undefined
  text = text.replace(new RegExp(`(^|\\s)#([\\p{L}\\p{N}_-]+)${END}`, 'u'), (_, space: string, name: string) => {
    project = name.toLowerCase()
    return space
  })

  let due: ISODate | undefined
  text = text.replace(
    new RegExp(`${START}(today|tomorrow|сегодня|завтра|\\d{4}-\\d{2}-\\d{2})${SPACE_OR_END}`, 'iu'),
    (match: string, word: string) => {
      const offset = DATE_WORDS[word.toLowerCase()]
      if (offset !== undefined) due = addDays(today, offset)
      else if (isISODate(word)) due = word
      else return match
      return ''
    },
  )

  return { text: text.replace(/\s+/g, ' ').trim(), priority, due, project }
}
