# To-Do List

A small, clean task manager built with React and TypeScript. Tasks are saved in the browser, so they survive page reloads.

## Features

- Add tasks with the button or the Enter key (blank input is rejected, whitespace is trimmed)
- Mark tasks as done and move them back to active
- Delete tasks
- Filter by All / Active / Completed
- Live statistics: total, active and done
- Friendly empty states for an empty list and for filters with no results
- Responsive layout, keyboard-friendly, visible focus states
- Tasks persist in `localStorage`

## Tech stack

- [React](https://react.dev) 19 + TypeScript
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Vitest](https://vitest.dev) + React Testing Library
- [Oxlint](https://oxc.rs/docs/guide/usage/linter) for linting

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal (usually http://localhost:5173).

## Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the dev server                |
| `npm run build`     | Type-check and build for production |
| `npm run preview`   | Preview the production build        |
| `npm run lint`      | Lint the code                       |
| `npm run typecheck` | Run the TypeScript compiler         |
| `npm run test`      | Run the test suite once             |

## How data is stored

Tasks are kept in `localStorage` under the key `todo-list:v1` as a JSON array of
`{ id, text, completed, createdAt }` objects. All storage access lives in
[`src/storage.ts`](src/storage.ts).

- Saved data is read and validated before the first render, so it is never overwritten by an empty list.
- Corrupted JSON, non-array data and malformed items are ignored instead of crashing the app.
- If the browser blocks storage, the app keeps working for the current session and shows a notice that tasks will not be saved.

## Project structure

```
src/
  App.tsx            page layout and filter state
  useTodos.ts        state + persistence hook
  todos.ts           types and pure task logic
  storage.ts         localStorage read/write with validation
  components/        AddTodoForm, Filters, Stats, TodoItem
```

## Deploying

The app is a static site. On [Vercel](https://vercel.com), import the repository: the Vite preset is detected automatically (build command `npm run build`, output directory `dist`).

## AI tools

This project was built with [Claude Code](https://claude.com/claude-code) (Anthropic), which generated the code, tests and this documentation from a written specification. The result was reviewed and checked in the browser.
