# Tickle

A to-do list that feels like pen and paper. Built with React and TypeScript; everything is stored in the browser, no account and no server.

## Features

**The basics**
- Add tasks (button or Enter; blank input is rejected, whitespace is trimmed)
- Mark tasks as done and back to active, edit them in place (click the title), delete them
- Tasks persist in `localStorage`
- Undo after completing, deleting or clearing tasks (no "are you sure?" dialogs)

**Planning**
- Due dates and times of day (picker, or typed in the title) with overdue highlighting; tasks of a day are sorted by time
- Views: All, Today (includes overdue), Upcoming (grouped by day), Active, Completed
- Month calendar drawn as a spiral-notebook page: tasks are written right on their days (priority in highlighter), arrow keys to move between days, hover a day for a quick + to add a task to it, click a day to circle it and see its tasks
- A notebook-style date and time picker with quick chips (Today, Tomorrow, Next week; 9:00 to 21:00) and hour/minute steppers instead of the browser default
- Projects, created simply by writing `#name` in a task; every project gets its own highlighter colour, used on its tag, checkbox, sidebar entry and calendar notes
- Priority tasks are highlighted with a marker and listed first
- Search

**Quick add**, understood anywhere in the text: `!` at the start flags a task as priority, `#family` sets the project, `today` / `tomorrow` (`сегодня` / `завтра`) or `2026-12-24` sets the date, `18:30`, `6:30pm` or `в 18:30` sets the time. Example: `!Call mum tomorrow at 18:30 #family`. The recognised parts show up as chips under the input.

**Report**: tasks completed today and over the last 7 days, day streak, completion rate, overdue and due-today counts, and a 7-day bar chart (with a screen-reader table).

**Feel**
- Russian and English interface (Russian first and by default, English for English-language browsers; switchable and remembered)
- Tick, the mascot: a check mark with one eye that follows the pointer and hops when you finish a task
- A stationery colour code: yellow = important, green = today, blue = tomorrow, red = overdue; each section has its own highlight colour and the progress strip changes colour as the day goes on
- Hand-drawn checkboxes, brush-stroke highlighter, handwritten dates; finishing a task crosses it out with an uneven pen stroke that is drawn across the text
- Every icon has its own hover animation (the bin lifts its lid, the calendar flips, the pencil writes, ...); swipe a task left to delete, right to complete
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
`{ id, text, completed, priority?, due?, time?, project?, completedAt?, createdAt }` objects
(`due` is a local `YYYY-MM-DD` date, `time` a 24-hour `HH:MM`). All storage access lives in [`src/storage.ts`](src/storage.ts).

- Saved data is read and validated before the first render, so it is never overwritten by an empty list.
- Corrupted JSON, non-array data and malformed items are ignored instead of crashing the app.
- If the browser blocks storage, the app keeps working for the current session and shows a notice that tasks will not be saved.
- The chosen language is stored separately under `todo-list:lang` (`"en"` or `"ru"`).

There is no sync between devices or browsers, no reminders or notifications and no sharing: the app is client-only by design.

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
