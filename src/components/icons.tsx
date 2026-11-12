import { motion } from 'motion/react'
import { springs } from '../motion'
import type { View } from '../todos'

const svg = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const wiggle = { duration: 0.45 }

export function TrashIcon({ className = 'size-[18px]' }: { className?: string }) {
  return (
    <motion.svg {...svg} className={className} variants={{ tap: { scale: 0.85 } }}>
      <motion.path
        d="M3.5 5.5h13M8 5.5V3.5h4v2"
        variants={{ rest: { rotate: 0, y: 0 }, hover: { rotate: -24, y: -1.5, transition: springs.pop } }}
        style={{ originX: 0, originY: 1 }}
      />
      <motion.path
        d="M5.5 5.5l.7 10.5h7.6l.7-10.5M8.5 9v4.5M11.5 9v4.5"
        variants={{ rest: { x: 0 }, hover: { x: [0, -0.8, 0.8, -0.8, 0], transition: wiggle } }}
      />
    </motion.svg>
  )
}

export function CalendarIcon({ className = 'size-[18px]' }: { className?: string }) {
  return (
    <motion.svg
      {...svg}
      className={className}
      variants={{ rest: { rotate: 0 }, hover: { rotate: [0, -8, 6, 0], transition: wiggle }, tap: { scale: 0.85 } }}
    >
      <path d="M4 5h12v11H4zM4 8.5h12" />
      <motion.path d="M7 3v3" variants={{ rest: { y: 0 }, hover: { y: [0, -1.6, 0], transition: { duration: 0.35 } } }} />
      <motion.path d="M13 3v3" variants={{ rest: { y: 0 }, hover: { y: [0, -1.6, 0], transition: { duration: 0.35, delay: 0.08 } } }} />
      <motion.rect
        x="9"
        y="11"
        width="2"
        height="2"
        rx="0.5"
        fill="currentColor"
        stroke="none"
        variants={{ rest: { scale: 1 }, hover: { scale: [1, 2, 1], transition: { duration: 0.4, delay: 0.1 } } }}
      />
    </motion.svg>
  )
}

export function StarIcon({ filled = false, className = 'size-[18px]' }: { filled?: boolean; className?: string }) {
  return (
    <motion.svg
      {...svg}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: 72, scale: 1.25, transition: springs.pop }, tap: { scale: 0.8 } }}
    >
      <path d="M10 2.8l2.2 4.5 4.9.7-3.6 3.4.9 4.9L10 14l-4.4 2.3.9-4.9L2.9 8l4.9-.7L10 2.8z" />
    </motion.svg>
  )
}

export function PencilIcon({ className = 'size-[18px]' }: { className?: string }) {
  return (
    <motion.svg {...svg} className={className} variants={{ tap: { scale: 0.85 } }}>
      <motion.path
        d="M4 14.5l.8-3.6L13.6 2.1a1.8 1.8 0 012.6 2.6L7.4 13.7 4 14.5zM12 3.7l2.8 2.8"
        variants={{ rest: { x: 0, rotate: 0 }, hover: { x: [0, 1.5, 3, 1.5, 3], rotate: [0, -6, 0, -6, 0], transition: { duration: 0.6 } } }}
      />
      <motion.path
        d="M3.5 17.5c2-1 3-.2 4.5 0s2.5.8 4 0"
        variants={{ rest: { pathLength: 0, opacity: 0 }, hover: { pathLength: 1, opacity: 1, transition: { duration: 0.5 } } }}
      />
    </motion.svg>
  )
}

export function PlusIcon({ className = 'size-3.5', strokeWidth = 2.4 }: { className?: string; strokeWidth?: number }) {
  return (
    <motion.svg
      {...svg}
      strokeWidth={strokeWidth}
      className={className}
      variants={{ rest: { rotate: 0 }, hover: { rotate: 90, transition: springs.pop }, tap: { scale: 0.8 } }}
    >
      <path d="M10 4v12M4 10h12" />
    </motion.svg>
  )
}

export function SearchIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <motion.svg {...svg} className={className} variants={{ rest: { rotate: 0 }, hover: { rotate: [0, -14, 10, 0], transition: { duration: 0.5 } } }}>
      <circle cx="8.5" cy="8.5" r="5" />
      <path d="M12.5 12.5L17 17" />
    </motion.svg>
  )
}

export function CloseIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <motion.svg
      {...svg}
      strokeWidth={2}
      className={className}
      variants={{ rest: { rotate: 0 }, hover: { rotate: 90, transition: springs.pop }, tap: { scale: 0.8 } }}
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </motion.svg>
  )
}

/** Chevron that nudges in the direction it points. */
export function ChevronIcon({ dir, className = 'size-4' }: { dir: 'left' | 'right'; className?: string }) {
  const nudge = dir === 'left' ? -2.5 : 2.5
  return (
    <motion.svg
      {...svg}
      strokeWidth={2}
      className={className}
      variants={{ rest: { x: 0 }, hover: { x: [0, nudge, 0], transition: { duration: 0.4 } }, tap: { scale: 0.8 } }}
    >
      <path d={dir === 'left' ? 'M12 4l-6 6 6 6' : 'M8 4l6 6-6 6'} />
    </motion.svg>
  )
}

const nav = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Sidebar icons, each with its own hover animation. */
export function NavIcon({ view }: { view: View }) {
  const className = 'relative size-5'
  switch (view) {
    case 'all':
      return (
        <motion.svg {...nav} className={className}>
          <motion.path
            d="M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5"
            variants={{ rest: { y: 0 }, hover: { y: [0, 2, -0.5, 0], transition: { duration: 0.45 } } }}
          />
        </motion.svg>
      )
    case 'today':
      return (
        <motion.svg {...nav} className={className}>
          <path d="M5 5h14v15H5zM5 10h14M9 3v4M15 3v4" />
          <motion.circle cx="12" cy="15" r="1.6" fill="currentColor" variants={{ rest: { scale: 1 }, hover: { scale: [1, 1.9, 1], transition: { duration: 0.45 } } }} />
        </motion.svg>
      )
    case 'upcoming':
      return (
        <motion.svg {...nav} className={className}>
          <path d="M5 5h14v15H5zM5 10h14M9 3v4M15 3v4" />
          <motion.path d="M9 15h6" variants={{ rest: { x: 0 }, hover: { x: [0, 3, 0], transition: { duration: 0.45 } } }} />
        </motion.svg>
      )
    case 'active':
      return (
        <motion.svg {...nav} className={className} variants={{ rest: { scale: 1 }, hover: { scale: [1, 1.2, 0.95, 1], transition: { duration: 0.45 } } }}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16z" />
        </motion.svg>
      )
    case 'completed':
      return (
        <motion.svg {...nav} className={className}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16z" />
          <motion.path d="M8.5 12.5l2.5 2.5 4.5-5" variants={{ rest: { pathLength: 1 }, hover: { pathLength: [0, 1], transition: { duration: 0.45 } } }} />
        </motion.svg>
      )
    case 'calendar':
      return (
        <motion.svg {...nav} className={className} variants={{ rest: { rotate: 0 }, hover: { rotate: [0, -9, 7, 0], transition: { duration: 0.45 } } }}>
          <path d="M4 5h16v15H4zM4 10h16M10 10v10M16 10v10" />
        </motion.svg>
      )
    case 'report':
      return (
        <motion.svg {...nav} className={className}>
          {['M5 20v-9', 'M12 20V5', 'M19 20v-6'].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              style={{ originY: 1 }}
              variants={{ rest: { scaleY: 1 }, hover: { scaleY: [1, 0.35, 1], transition: { duration: 0.5, delay: i * 0.08 } } }}
            />
          ))}
        </motion.svg>
      )
  }
}
