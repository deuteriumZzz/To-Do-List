import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => localStorage.clear())

describe('App', () => {
  it('adds, completes, filters, deletes and persists tasks', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)

    expect(screen.getByText('No tasks yet')).toBeInTheDocument()

    await user.type(screen.getByLabelText('New task'), '  Write report  {Enter}')
    expect(screen.getByLabelText('Write report')).toBeInTheDocument()
    expect(screen.getByLabelText('New task')).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Add task' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a task first.')

    await user.click(screen.getByLabelText('Write report'))
    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.getByText('Nothing left to do')).toBeInTheDocument()

    // saved state survives a reload
    unmount()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByLabelText('Write report')).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Delete task: Write report' }))
    expect(screen.getByText('No completed tasks')).toBeInTheDocument()
  })
})
