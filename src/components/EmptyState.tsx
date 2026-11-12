import { Tick } from './Tick'

interface EmptyStateProps {
  tone: 'idle' | 'sleepy' | 'celebrate'
  title: string
  hint: string
}

export function EmptyState({ tone, title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Tick className="h-24 w-24" mood={tone === 'sleepy' ? 'sleepy' : 'idle'} celebrate={tone === 'celebrate'} />
      <p className="mt-5 text-xl font-extrabold tracking-tight">{title}</p>
      <p className="mt-1 max-w-xs font-hand text-2xl leading-tight text-ink-2">{hint}</p>
    </div>
  )
}
