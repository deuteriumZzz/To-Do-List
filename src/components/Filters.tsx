import type { Messages } from '../i18n'
import type { Filter } from '../todos'

const ORDER: Filter[] = ['all', 'active', 'completed']

interface FiltersProps {
  t: Messages
  value: Filter
  counts: Record<Filter, number>
  onChange: (f: Filter) => void
}

/** Three interlocked push-keys: the selected one stays pressed with its LED lit. */
export function Filters({ t, value, counts, onChange }: FiltersProps) {
  return (
    <div role="group" aria-label={t.filterGroup} className="grid flex-1 grid-cols-3 gap-2">
      {ORDER.map((f) => (
        <button
          key={f}
          type="button"
          aria-pressed={value === f}
          onClick={() => onChange(f)}
          className="key flex min-w-0 flex-col items-center justify-center gap-0.5 px-1.5 py-2 text-[13px] font-semibold sm:flex-row sm:gap-2 sm:px-2 sm:py-2.5 sm:text-sm"
        >
          <span className="led hidden sm:inline-block" data-on={value === f} data-tone="signal" aria-hidden="true" />
          <span className="max-w-full truncate">{t.filters[f]}</span>
          <span aria-hidden="true" className="font-mono text-xs font-medium tabular-nums text-ink-2">
            {counts[f]}
          </span>
        </button>
      ))}
    </div>
  )
}
