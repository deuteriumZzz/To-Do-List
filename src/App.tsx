import { useState } from 'react'
import { AddTodoForm } from './components/AddTodoForm'
import { Filters } from './components/Filters'
import { Stats } from './components/Stats'
import { TodoItem } from './components/TodoItem'
import { filterTodos, getStats, type Filter } from './todos'
import { useTodos } from './useTodos'

const EMPTY_MESSAGES: Record<Filter, { title: string; hint: string }> = {
  all: { title: 'No tasks yet', hint: 'Add your first task above to get started.' },
  active: { title: 'Nothing left to do', hint: 'All tasks are completed. Nice work!' },
  completed: { title: 'No completed tasks', hint: 'Check off a task and it will show up here.' },
}

export default function App() {
  const { todos, storageOk, add, toggle, remove } = useTodos()
  const [filter, setFilter] = useState<Filter>('all')

  const stats = getStats(todos)
  const visible = filterTodos(todos, filter)
  const empty = EMPTY_MESSAGES[filter]

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-6 px-4 py-10 sm:py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Tasks</h1>
        <p className="mt-1 text-slate-600">Capture what matters and check it off.</p>
      </header>

      {!storageOk && (
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
          Your browser is blocking local storage, so tasks will be lost when you close or reload this page.
        </p>
      )}

      <Stats {...stats} />
      <AddTodoForm onAdd={add} />

      <section aria-label="Task list" className="flex flex-col gap-4">
        <Filters value={filter} onChange={setFilter} />
        {visible.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {visible.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onRemove={remove} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <p className="font-medium text-slate-900">{empty.title}</p>
            <p className="mt-1 text-sm text-slate-600">{empty.hint}</p>
          </div>
        )}
      </section>
    </main>
  )
}
