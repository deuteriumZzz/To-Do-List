import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface Line {
  /** Wobbly pen path for crossing out this line of text. */
  d: string
  left: number
  top: number
  width: number
  height: number
}

/** Tiny seeded random generator, so a task is always crossed out with the same "hand". */
function random(seed: number) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function hash(text: string) {
  return [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
}

/** A slightly uneven pen stroke from (x, y) of the given width, overshooting a little at both ends. */
function strokePath(x: number, y: number, width: number, rand: () => number): string {
  const steps = Math.max(2, Math.round(width / 16))
  const pts = Array.from({ length: steps + 1 }, (_, k) => {
    const edge = k === 0 || k === steps
    return [
      x - 3 + (k / steps) * (width + 7) + (edge ? 0 : (rand() - 0.5) * 5),
      y + (rand() - 0.5) * 2.8 + (k / steps) * (rand() - 0.5) * 3,
    ] as const
  })
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let k = 1; k < pts.length; k++) {
    const mx = (pts[k - 1][0] + pts[k][0]) / 2
    const my = (pts[k - 1][1] + pts[k][1]) / 2
    d += `Q${pts[k - 1][0].toFixed(1)} ${pts[k - 1][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  return `${d}L${pts[steps][0].toFixed(1)} ${pts[steps][1].toFixed(1)}`
}

/** Tasks whose writing animation has already played in this session. */
const written = new Set<string>()

/** The part of the text written so far (progress 0-1), as one clip path of line fragments. */
function clipFor(lines: Line[], progress: number): string {
  let left = progress * lines.reduce((sum, l) => sum + l.width, 0)
  const parts = lines.map((l) => {
    const w = Math.max(0, Math.min(l.width, left))
    left -= l.width
    return w > 0 ? `M${l.left - 6} ${l.top - 6}h${w + 6}v${l.height + 12}h${-(w + 6)}Z` : ''
  })
  return `path('${parts.join('') || 'M0 0Z'}')`
}

/** Where the pen tip is at this progress: the end of the written part of the current line. */
function penTip(lines: Line[], progress: number): { x: number; y: number } {
  let left = progress * lines.reduce((sum, l) => sum + l.width, 0)
  for (const l of lines) {
    if (left <= l.width) return { x: l.left + left, y: l.top + l.height * 0.8 + Math.sin(progress * 80) * 1.5 }
    left -= l.width
  }
  const last = lines[lines.length - 1]
  return { x: last.left + last.width, y: last.top + last.height * 0.8 }
}

interface PenTextProps {
  text: string
  seed: string
  /** Draw the pen strike-through over the text. */
  struck: boolean
  /** Highlighter behind the text. */
  highlighted: boolean
  /** The task was just added: write the title out with a pen. */
  writing?: boolean
  onClick: () => void
}

/**
 * Task title written in our handwriting. New tasks are written out letter by letter with a pen that
 * travels along the line; finished tasks are crossed out with an uneven pen stroke. Everything is
 * measured from the rendered text, so wrapped titles are handled.
 */
export function PenText({ text, seed, struck, highlighted, writing = false, onClick }: PenTextProps) {
  const reduce = useReducedMotion()
  const box = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [progress, setProgress] = useState(() =>
    writing && typeof ResizeObserver !== 'undefined' && !written.has(seed) && !reduce ? 0 : 1,
  )

  useEffect(() => {
    const el = box.current
    const textNode = label.current?.firstChild
    if (!el || !textNode || typeof ResizeObserver === 'undefined') return

    function measure() {
      const origin = el!.getBoundingClientRect()
      const range = document.createRange()
      range.selectNodeContents(textNode!)
      const rects = Array.from(range.getClientRects?.() ?? []).filter((r) => r.width > 2)
      const rand = random(hash(seed))
      setLines(
        rects.map((r) => ({
          d: strokePath(r.left - origin.left, r.top - origin.top + r.height * 0.56, r.width, rand),
          left: r.left - origin.left,
          top: r.top - origin.top,
          width: r.width,
          height: r.height,
        })),
      )
    }

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text, seed])

  const ready = lines.length > 0
  useEffect(() => {
    if (!writing || !ready || written.has(seed) || reduce) return
    const controls = animate(0, 1, {
      duration: Math.min(2.2, 0.45 + text.length * 0.055),
      ease: 'linear',
      onUpdate: setProgress,
      onComplete: () => {
        written.add(seed)
        setProgress(1)
      },
    })
    return () => controls.stop()
  }, [writing, ready, seed, text.length, reduce])

  const inProgress = progress < 1
  const tip = inProgress && ready ? penTip(lines, progress) : null

  return (
    <span ref={box} onClick={onClick} className="relative inline-block max-w-full cursor-text break-words">
      <span
        style={{ clipPath: inProgress && ready ? clipFor(lines, progress) : 'none', opacity: inProgress && !ready ? 0 : 1 }}
        className="block"
      >
        <span
          ref={label}
          style={{ backgroundSize: highlighted ? '100% 100%' : '0% 100%' }}
          className={`marker font-hand text-[26px] font-bold leading-[1.1] transition-colors duration-300 ${struck ? 'text-ink-2' : ''}`}
        >
          {text}
        </span>
        <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
          {lines.map((line, i) => (
            <motion.path
              key={i}
              d={line.d}
              fill="none"
              stroke="#141413"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: struck ? 1 : 0, opacity: struck ? 0.9 : 0 }}
              transition={{
                duration: struck ? 0.2 + line.width / 900 : 0.12,
                delay: struck ? i * 0.14 : 0,
                ease: 'easeOut',
              }}
            />
          ))}
        </svg>
      </span>
      {tip && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          style={{ left: tip.x, top: tip.y }}
          className="pointer-events-none absolute z-10 size-7 -translate-x-[12%] -translate-y-[88%] drop-shadow-[0_2px_2px_rgb(0_0_0/0.25)]"
        >
          <path d="M3 21l1.6-5.2L16 4.4a2.2 2.2 0 013.1 3.1L7.8 19.4 3 21Z" fill="#141413" />
          <path d="M14.4 6l3.6 3.6" stroke="#ffe14d" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M3 21l1.6-5.2 3.6 3.6L3 21Z" fill="#ffe14d" />
        </svg>
      )}
    </span>
  )
}
