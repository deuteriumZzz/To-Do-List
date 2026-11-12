import { useState, type SubmitEvent } from 'react'
import { MAX_LENGTH } from '../todos'

export function AddTodoForm({ onAdd }: { onAdd: (text: string) => boolean }) {
  const [text, setText] = useState('')
  const [invalid, setInvalid] = useState(false)

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const added = onAdd(text)
    setInvalid(!added)
    if (added) setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2" noValidate>
      <div className="flex-1">
        <label htmlFor="new-task" className="sr-only">
          New task
        </label>
        <input
          id="new-task"
          type="text"
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(e) => {
            setText(e.target.value)
            setInvalid(false)
          }}
          placeholder="What needs to be done?"
          aria-invalid={invalid}
          aria-describedby={invalid ? 'new-task-error' : undefined}
          autoComplete="off"
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            invalid ? 'border-rose-400' : 'border-slate-200'
          }`}
        />
        {invalid && (
          <p id="new-task-error" role="alert" className="mt-1.5 text-sm text-rose-600">
            Please enter a task first.
          </p>
        )}
      </div>
      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-indigo-600 px-5 font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Add task
      </button>
    </form>
  )
}
