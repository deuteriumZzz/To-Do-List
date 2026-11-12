import { Face, type Mood } from './Face'

interface EmptyStateProps {
  mood: Mood
  title: string
  hint: string
}

export function EmptyState({ mood, title, hint }: EmptyStateProps) {
  return (
    <div className="lcd flex flex-col items-center px-6 py-9 text-center">
      <Face mood={mood} />
      <p className="cursor mt-4 text-sm font-medium uppercase tracking-[0.14em]">{title}</p>
      <p className="mt-2 max-w-xs font-sans text-sm opacity-80">{hint}</p>
    </div>
  )
}
