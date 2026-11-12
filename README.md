# Tickle

A to-do list that feels like pen and paper. Built with React and TypeScript; everything is stored in the browser, no account and no server.

## Features

**The basics**
- Add tasks (button or Enter; blank input is rejected, whitespace is trimmed)
- Mark tasks as done and back to active, edit them in place (click the title), delete them
- Tasks persist in `localStorage`
- Undo after completing, deleting or clearing tasks (no "are you sure?" dialogs)

**Planning**
- Due dates (date picker or typed in the title) with overdue highlighting
- Views: All, Today (includes overdue), Upcoming (grouped by day), Active, Completed
- Month calendar: tasks on their days, click a day to see and add tasks for it
- Projects, created simply by writing `#name` in a task
- Priority tasks are highlighted with a marker and listed first
- Search

**Quick add**, understood anywhere in the text: `!` at the start flags a task as priority, `#family` sets the project, `today` / `tomorrow` (`сегодня` / `завтра`) or `2026-12-24` sets the date. Example: `!Call mum tomorrow #family`. The recognised parts show up as chips under the input.

**Report**: tasks completed today and over the last 7 days, day streak, completion rate, overdue and due-today counts, and a 7-day bar chart (with a screen-reader table).

**Feel**
- English and Russian interface (follows the browser language, switchable and remembered)
- Tick, the mascot: a check mark with one eye that follows the pointer and hops when you finish a task
- Hand-drawn checkboxes, highlighter marker, handwritten dates; swipe a task left to delete, right to complete
- Keyboard: `/` opens the add form from anywhere, `Esc` closes it or clears the search
- Responsive layout (sidebar on desktop, top bar on mobile); motion respects `prefers-reduced-motion`

## Tech stack

- [React](https://react.dev) 19 + TypeScript
- [Vite](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com) v4
- [Motion](https://motion.dev) for animations
- Self-hosted fonts via Fontsource: Onest (text) and Caveat (handwriting), both with Cyrillic
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
`{ id, text, completed, priority?, due?, project?, completedAt?, createdAt }` objects
(`due` is a local `YYYY-MM-DD` date). All storage access lives in [`src/storage.ts`](src/storage.ts).

- Saved data is read and validated before the first render, so it is never overwritten by an empty list.
- Corrupted JSON, non-array data and malformed items are ignored instead of crashing the app.
- If the browser blocks storage, the app keeps working for the current session and shows a notice that tasks will not be saved.
- The chosen language is stored separately under `todo-list:lang` (`"en"` or `"ru"`).

There is no sync between devices or browsers, no reminders and no sharing: the app is client-only by design.

## Project structure

```
src/
  App.tsx            layout, navigation state, keyboard shortcut
  useTodos.ts        state + persistence + undo
  todos.ts           task model, reducer and view selectors
  dates.ts           date helpers, month grid, quick-add parser
  report.ts          productivity report calculations
  storage.ts         localStorage read/write with validation
  i18n.ts            English and Russian strings
  motion.ts          shared spring and easing tokens
  components/        Sidebar, ListHeader, TaskList, TodoItem, AddTask,
                     CalendarView, ReportView, EmptyState, Toast,
                     LangSwitch, Burst, Tick
```

## Deploying

The app is a static site. On [Vercel](https://vercel.com), import the repository: the Vite preset is detected automatically (build command `npm run build`, output directory `dist`).

## AI tools

This project was built with [Claude Code](https://claude.com/claude-code) (Anthropic), which generated the code, tests and this documentation from a written specification. The result was reviewed and checked in the browser.
