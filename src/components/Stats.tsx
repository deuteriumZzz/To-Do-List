interface StatsProps {
  total: number
  active: number
  completed: number
}

export function Stats({ total, active, completed }: StatsProps) {
  const items = [
    { label: 'Total', value: total },
    { label: 'Active', value: active },
    { label: 'Done', value: completed },
  ]
  return (
    <dl className="grid grid-cols-3 gap-3">
      {items.map((i) => (
        <div key={i.label} className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{i.label}</dt>
          <dd className="text-2xl font-semibold text-slate-900 tabular-nums">{i.value}</dd>
        </div>
      ))}
    </dl>
  )
}
