import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

interface Line {
  /** Wobbly pen path for one line of text. */
  d: string
  width: number
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

interface PenTextProps {
  text: string
  seed: string
  /** Draw the pen strike-through over the text. */
  struck: boolean
  /** Highlighter behind the text. */
  highlighted: boolean
  onClick: () => void
}

/**
 * Task title that gets crossed out like with a pen: one uneven line per wrapped line of text,
 * drawn left to right. Lines are measured from the rendered text, so wrapping is handled.
 */
export function PenText({ text, seed, struck, highlighted, onClick }: PenTextProps) {
  const box = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const [lines, setLines] = useState<Line[]>([])

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
          width: r.width,
        })),
      )
    }

    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [text, seed])

  return (
    <span ref={box} onClick={onClick} className="relative inline-block max-w-full cursor-text break-words">
      <span
        ref={label}
        style={{ backgroundSize: highlighted ? '100% 100%' : '0% 100%' }}
        className={`marker text-base leading-snug transition-colors duration-300 ${struck ? 'text-ink-2' : ''}`}
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
  )
}
