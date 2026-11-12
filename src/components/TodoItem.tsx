import type { Todo } from '../todos'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onRemove: (id: string) => void
}

export function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  const inputId = `todo-${todo.id}`
  return (
    <li
      className={`todo-enter group flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 transition ${
        todo.completed ? 'bg-slate-50 ring-slate-200' : 'bg-white shadow-sm ring-slate-200'
      }`}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="size-5 shrink-0 cursor-pointer accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      />
      <label
        htmlFor={inputId}
        className={`min-w-0 flex-1 cursor-pointer break-words transition ${
          todo.completed ? 'text-slate-500 line-through' : 'text-slate-900'
        }`}
      >
        {todo.text}
      </label>
      <button
        type="button"
        onClick={() => onRemove(todo.id)}
        aria-label={`Delete task: ${todo.text}`}
        className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-600"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-5"
        >
          <path d="M3.5 5.5h13M8 5.5V3.5h4v2M5.5 5.5l.7 10.5h7.6l.7-10.5M8.5 9v4.5M11.5 9v4.5" />
        </svg>
      </button>
    </li>
  )
}
