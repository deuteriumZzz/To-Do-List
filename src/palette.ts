import type { View } from './todos'

/**
 * A stationery set: highlighters and washi tapes. Colours carry meaning:
 * yellow = important, green = today, blue = tomorrow / upcoming, red = overdue;
 * pink, orange and lilac (and blue) are handed out to projects.
 */
export const PALETTE = {
  yellow: '#ffe14d',
  green: '#8fe3b0',
  sky: '#8fd3ff',
  pink: '#ff9ec7',
  orange: '#ffb36b',
  lilac: '#cdb8ff',
} as const

export type Hue = keyof typeof PALETTE

const PROJECT_HUES: Hue[] = ['pink', 'sky', 'orange', 'lilac']

/** Every project name always gets the same colour. */
export function projectHue(name: string): Hue {
  const hash = [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11)
  return PROJECT_HUES[hash % PROJECT_HUES.length]
}

export const VIEW_HUES: Record<View, Hue> = {
  all: 'orange',
  today: 'green',
  upcoming: 'sky',
  active: 'lilac',
  completed: 'pink',
  calendar: 'sky',
  report: 'pink',
}

const cache = new Map<Hue, string>()

/** The brush-stroke background of `.marker`, painted in the given highlighter colour. */
export function brush(hue: Hue): string {
  let url = cache.get(hue)
  if (!url) {
    const c = PALETTE[hue].replace('#', '%23')
    url =
      `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 40' preserveAspectRatio='none'>` +
      `<path d='M6 22C4 18 10 16 18 16C60 12 110 18 160 14C210 11 260 16 292 13C297 15 298 20 295 24C296 29 293 33 286 33C240 37 200 31 150 35C100 38 50 32 14 34C7 34 3 30 4 26Z' fill='${c}'/>` +
      `<path d='M10 21L288 19M16 27L282 28' stroke='%23ffffff' stroke-width='1.4' opacity='.5' fill='none'/>` +
      `<path d='M14 31L270 32' stroke='%23000000' stroke-width='1.2' opacity='.12' fill='none'/>` +
      `<path d='M286 17L300 16M285 24L299 25M284 30L298 31' stroke='${c}' stroke-width='2' stroke-linecap='round' fill='none'/></svg>")`
    cache.set(hue, url)
  }
  return url
}

/** Inline style that paints a brush stroke of this colour behind the text. */
export function painted(hue: Hue, on = true) {
  return { backgroundImage: brush(hue), backgroundSize: on ? '100% 100%' : '0% 100%' }
}

const blockCache = new Map<string, string>()

/** A full brush swipe in any colour: ragged ends, bristle streaks. For chips and patches rather than underlines. */
export function brushBlock(color: string): string {
  let url = blockCache.get(color)
  if (!url) {
    const c = color.replace('#', '%23')
    url =
      `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 60' preserveAspectRatio='none'>` +
      `<path d='M5 14C3 9 9 6 18 6C70 3 120 8 170 5C220 3 262 7 289 5C296 8 298 17 295 25C297 34 296 45 291 52C284 56 262 54 230 56C180 59 130 55 80 57C50 58 22 56 12 54C5 50 3 38 5 28C2 22 3 18 5 14Z' fill='${c}'/>` +
      `<path d='M10 16L290 13M12 30L292 28M10 44L286 43' stroke='%23ffffff' stroke-width='1.6' opacity='.35' fill='none'/>` +
      `<path d='M14 52L270 54' stroke='%23000000' stroke-width='1.4' opacity='.1' fill='none'/>` +
      `<path d='M288 10L300 8M290 28L300 29M288 46L299 48M8 12L0 11M7 40L0 42' stroke='${c}' stroke-width='3' stroke-linecap='round' fill='none'/></svg>")`
    blockCache.set(color, url)
  }
  return url
}

/** Inline style that paints a full brush swipe of this colour as the element's background. */
export function paintedBlock(color: string) {
  return { backgroundImage: brushBlock(color), backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' } as const
}

const columnCache = new Map<string, string>()

/** A vertical brush stroke with a bristly top, for the bars of a chart. */
export function brushColumn(color: string): string {
  let url = columnCache.get(color)
  if (!url) {
    const c = color.replace('#', '%23')
    url =
      `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 200' preserveAspectRatio='none'>` +
      `<path d='M5 200C3 150 6 90 5 30C4 18 10 9 18 6C26 4 32 9 34 18C36 60 35 120 35 200Z' fill='${c}'/>` +
      `<path d='M12 190L11 24M20 196L20 14M28 190L29 22' stroke='%23ffffff' stroke-width='1.4' opacity='.28' fill='none'/>` +
      `<path d='M12 12L10 1M20 8L20 0M28 10L31 2M16 10L15 3' stroke='${c}' stroke-width='2.4' stroke-linecap='round' fill='none'/></svg>")`
    columnCache.set(color, url)
  }
  return url
}
