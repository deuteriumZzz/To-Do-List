import { render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { addDays, toISO } from './dates'
import { STORAGE_KEY } from './storage'

const today = toISO(new Date())

beforeEach(() => localStorage.clear())

function seed(...todos: object[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(todos.map((t, i) => ({ id: String(i), text: `Task ${i}`, completed: false, createdAt: i, ...t }))),
  )
}

async function addTask(user: UserEvent, text: string) {
  if (!screen.queryByRole('textbox', { name: 'Task name' })) {
    await user.click(screen.getAllByRole('button', { name: 'Add task' })[0])
  }
  await user.type(await screen.findByRole('textbox', { name: 'Task name' }), `${text}{Enter}`)
}

describe('core flow', () => {
  it('adds, completes, filters, deletes and persists tasks', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    expect(screen.getByText('No tasks yet')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Add task' })[0])
    const form = await screen.findByRole('form', { name: 'Add task' })
    expect(within(form).getByRole('button', { name: 'Add task' })).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Task name' }), '  Write report  {Enter}')
    expect(screen.getByLabelText('Write report')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Task name' })).toHaveValue('')

    await user.click(screen.getByLabelText('Write report'))
    await user.click(screen.getByRole('button', { name: /^Active/ }))
    expect(await screen.findByText('Nothing left to do')).toBeInTheDocument()

    // saved state survives a reload
    unmount()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Completed/ }))
    expect(screen.getByLabelText('Write report')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Delete task: Write report' }))
    expect(await screen.findByText('No completed tasks')).toBeInTheDocument()
  })

  it('clears completed tasks', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'One')
    await addTask(user, 'Two')
    await user.click(screen.getByLabelText('One'))
    await user.click(screen.getByRole('button', { name: 'Clear completed' }))
    await waitForElementToBeRemoved(() => screen.queryByLabelText('One'))
    expect(screen.getByLabelText('Two')).toBeInTheDocument()
  })

  it('edits a task in place and ignores a blank edit', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Old name')

    await user.click(screen.getByRole('button', { name: 'Edit task: Old name' }))
    await user.clear(screen.getByLabelText('Task text'))
    await user.type(screen.getByLabelText('Task text'), '  New name  {Enter}')
    expect(screen.getByLabelText('New name')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit task: New name' }))
    await user.clear(screen.getByLabelText('Task text'))
    await user.keyboard('{Enter}')
    expect(screen.getByLabelText('New name')).toBeInTheDocument()
  })

  it('undoes a deletion from the toast', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Keep me')
    await user.click(screen.getByRole('button', { name: 'Delete task: Keep me' }))
    await user.click(await screen.findByRole('button', { name: 'Undo' }))
    expect(await screen.findByLabelText('Keep me')).toBeInTheDocument()
  })

  it('opens the add form with the / shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.keyboard('/')
    expect(await screen.findByRole('textbox', { name: 'Task name' })).toHaveFocus()
  })

  it('searches tasks and shows a message when nothing matches', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Alpha')
    await addTask(user, 'Beta')
    await user.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'alp')
    expect(screen.getByLabelText('Alpha')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByLabelText('Beta')).not.toBeInTheDocument())
    await user.clear(screen.getByRole('searchbox', { name: 'Search tasks' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search tasks' }), 'zzz')
    expect(await screen.findByText('No matches')).toBeInTheDocument()
  })
})

describe('smart features', () => {
  it('understands quick-add syntax, priority order, dates and projects', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'plain')
    await addTask(user, '!Urgent tomorrow #work')

    const boxes = screen.getAllByRole('checkbox')
    expect(boxes[0]).toHaveAccessibleName('Urgent')
    expect(screen.getByRole('button', { name: 'Toggle priority: Urgent' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^Upcoming/ }))
    expect(screen.getByLabelText('Urgent')).toBeInTheDocument()
    expect(screen.queryByLabelText('plain')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^work/ }))
    expect(screen.getByRole('heading', { level: 1, name: '#work' })).toBeInTheDocument()
    expect(screen.queryByLabelText('plain')).not.toBeInTheDocument()
  })

  it('shows overdue tasks first in Today', async () => {
    seed({ text: 'Late one', due: addDays(today, -2) }, { text: 'Due now', due: today })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Today/ }))
    expect(screen.getByRole('heading', { name: 'Overdue' })).toBeInTheDocument()
    const names = screen.getAllByRole('checkbox').map((c) => c.getAttribute('aria-label'))
    expect(names).toEqual(['Late one', 'Due now'])
  })

  it('shows tasks on the calendar and for the selected day', async () => {
    seed({ text: 'Dentist', due: today })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Calendar/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Calendar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /1 task/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByLabelText('Dentist')).toBeInTheDocument()
  })

  it('builds the productivity report from completed tasks', async () => {
    seed({ text: 'Finished', completed: true, completedAt: Date.now() })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Report/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Productivity' })).toBeInTheDocument()
    expect(screen.getAllByText('Tasks completed per day').length).toBeGreaterThan(0)
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(8)
    expect(screen.getByText('Day streak')).toBeInTheDocument()
  })
})

describe('date picker', () => {
  it('sets a date from the notebook-style picker', async () => {
    seed({ text: 'Plan trip' })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Set date: Plan trip' }))
    const dialog = await screen.findByRole('dialog', { name: 'Due date' })
    await user.click(within(dialog).getByRole('button', { name: 'Tomorrow' }))
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
    expect(screen.getByText('Tomorrow')).toBeInTheDocument()
  })

  it('closes the picker with Escape', async () => {
    seed({ text: 'Plan trip' })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Set date: Plan trip' }))
    await screen.findByRole('dialog', { name: 'Due date' })
    await user.keyboard('{Escape}')
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
  })
})

describe('time', () => {
  it('reads a time from the title and shows it next to the date', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Call mum tomorrow at 6:30pm')
    expect(screen.getByLabelText('Call mum')).toBeInTheDocument()
    expect(screen.getByText(/Tomorrow, 6:30\sPM/)).toBeInTheDocument()
  })

  it('sets a time with the quick chips of the picker', async () => {
    seed({ text: 'Plan trip', due: today })
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Set date: Plan trip' }))
    const dialog = await screen.findByRole('dialog', { name: 'Due date' })
    await user.click(within(dialog).getByRole('button', { name: /9:00\sAM/ }))
    expect(await screen.findByText(/Today, 9:00\sAM/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Hours: later' }))
    expect(await screen.findByText(/Today, 10:00\sAM/)).toBeInTheDocument()
  })
})

describe('language', () => {
  it('switches to Russian and remembers the choice', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getAllByRole('button', { name: 'ru' })[0])
    expect(screen.getByRole('heading', { level: 1, name: 'Все задачи' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('ru')

    unmount()
    render(<App />)
    expect(screen.getAllByRole('button', { name: 'Добавить задачу' }).length).toBeGreaterThan(0)
  })
})
