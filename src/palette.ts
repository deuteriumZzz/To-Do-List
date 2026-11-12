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
