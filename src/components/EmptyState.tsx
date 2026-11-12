import { PALETTE } from '../palette'
import { Tick } from './Tick'

interface EmptyStateProps {
  tone: 'idle' | 'sleepy' | 'celebrate'
  title: string
  hint: string
}

const BLOB = { idle: 'pink', sleepy: 'sky', celebrate: 'green' } as const

export function EmptyState({ tone, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute -inset-3 -rotate-6 rounded-[46%] opacity-80"
          style={{ backgroundColor: PALETTE[BLOB[tone]], filter: 'url(#rough-edge)' }}
        />
        <Tick className="relative h-24 w-24" mood={tone === 'sleepy' ? 'sleepy' : 'idle'} celebrate={tone === 'celebrate'} />
      </div>
      <p className="mt-6 font-hand text-4xl font-bold leading-none">{title}</p>
      <p className="mt-1 max-w-xs font-hand text-2xl leading-tight text-ink-2">{hint}</p>
    </div>
  )
}
