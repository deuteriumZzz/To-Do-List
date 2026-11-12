import { describe, expect, it } from 'vitest'
import { addDays, formatDue, formatTime, isISODate, isTime, monthGrid, parseQuickAdd, toISO } from './dates'

const TODAY = '2026-11-12'

describe('date helpers', () => {
  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(toISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('validates ISO dates', () => {
    expect(isISODate('2026-11-12')).toBe(true)
    expect(isISODate('2026-02-30')).toBe(false)
    expect(isISODate('12/11/2026')).toBe(false)
    expect(isISODate(20261112)).toBe(false)
  })

  it('builds a 6-week month grid starting on the chosen weekday', () => {
    const sunday = monthGrid(2026, 10, 0)
    const monday = monthGrid(2026, 10, 1)
    expect(sunday).toHaveLength(42)
    expect(sunday[0]).toBe('2026-11-01') // 1 Nov 2026 is a Sunday
    expect(monday[0]).toBe('2026-10-26')
    expect(monday).toContain('2026-11-30')
  })

  it('labels nearby days and formats others', () => {
    const labels = { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' }
    expect(formatDue(TODAY, TODAY, 'en-US', labels)).toBe('Today')
    expect(formatDue('2026-11-13', TODAY, 'en-US', labels)).toBe('Tomorrow')
    expect(formatDue('2026-11-11', TODAY, 'en-US', labels)).toBe('Yesterday')
    expect(formatDue('2026-11-20', TODAY, 'en-US', labels)).toBe('Nov 20')
    expect(formatDue('2027-01-05', TODAY, 'en-US', labels)).toContain('2027')
  })
})

describe('parseQuickAdd', () => {
  it('returns plain text untouched', () => {
    expect(parseQuickAdd('  Buy   milk ', TODAY)).toEqual({ text: 'Buy milk', priority: false, due: undefined, project: undefined })
  })

  it('reads priority, project and date words in English and Russian', () => {
    expect(parseQuickAdd('!Call mum tomorrow #Family', TODAY)).toMatchObject({ text: 'Call mum', priority: true, due: '2026-11-13', project: 'family' })
    expect(parseQuickAdd('Позвонить маме завтра #семья', TODAY)).toMatchObject({ text: 'Позвонить маме', due: '2026-11-13', project: 'семья' })
    expect(parseQuickAdd('сегодня Отчёт', TODAY)).toMatchObject({ text: 'Отчёт', due: TODAY })
  })

  it('reads an ISO date and ignores invalid ones', () => {
    expect(parseQuickAdd('Flight 2026-12-24', TODAY)).toMatchObject({ text: 'Flight', due: '2026-12-24' })
    expect(parseQuickAdd('Flight 2026-02-30', TODAY)).toMatchObject({ text: 'Flight 2026-02-30', due: undefined })
  })

  it('does not match date words inside other words', () => {
    expect(parseQuickAdd("Buy tomorrow's milk", TODAY).due).toBeUndefined()
    expect(parseQuickAdd('Todayish plans', TODAY).due).toBeUndefined()
  })

  it('leaves an empty title when only tokens are given', () => {
    expect(parseQuickAdd('!tomorrow #x', TODAY).text).toBe('')
  })
})

describe('time', () => {
  it('validates and formats times', () => {
    expect(isTime('18:30')).toBe(true)
    expect(isTime('24:00')).toBe(false)
    expect(isTime('9:30')).toBe(false)
    expect(formatTime('18:30', 'en-US')).toMatch(/6:30\sPM/)
    expect(formatTime('18:30', 'ru-RU')).toBe('18:30')
  })

  it('reads times typed as 24-hour or am/pm, with or without a preposition', () => {
    expect(parseQuickAdd('Call mum tomorrow at 18:30', TODAY)).toMatchObject({ text: 'Call mum', due: '2026-11-13', time: '18:30' })
    expect(parseQuickAdd('Позвонить маме в 9:05', TODAY)).toMatchObject({ text: 'Позвонить маме', time: '09:05' })
    expect(parseQuickAdd('Gym 6pm', TODAY)).toMatchObject({ text: 'Gym', time: '18:00' })
    expect(parseQuickAdd('Gym 6:30pm', TODAY)).toMatchObject({ text: 'Gym', time: '18:30' })
    expect(parseQuickAdd('Lunch at 12 am', TODAY)).toMatchObject({ time: '00:00' })
  })

  it('ignores impossible times', () => {
    expect(parseQuickAdd('Room 25:99', TODAY)).toMatchObject({ text: 'Room 25:99', time: undefined })
    expect(parseQuickAdd('Meet 13pm', TODAY).time).toBeUndefined()
  })
})
