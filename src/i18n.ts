import type { Filter } from './todos'

const en = {
  title: 'Tasks',
  subtitle: 'Capture what matters and check it off.',
  storageWarning:
    'Your browser is blocking local storage, so tasks will be lost when you close or reload this page.',
  newTask: 'New task',
  placeholder: 'What needs to be done?',
  add: 'Add task',
  emptyInput: 'Please enter a task first.',
  filterGroup: 'Filter tasks',
  taskList: 'Task list',
  language: 'Language',
  locale: 'en-US',
  clearCompleted: 'Clear completed',
  allDone: 'All tasks complete — nice work!',
  progress: (done: number, total: number) => `${done} of ${total} done`,
  filters: { all: 'All', active: 'Active', completed: 'Completed' },
  stats: { total: 'Total', active: 'Active', done: 'Done' },
  empty: {
    all: { title: 'No tasks yet', hint: 'Add your first task above to get started.' },
    active: { title: 'Nothing left to do', hint: 'Open Completed to review what you finished.' },
    completed: { title: 'No completed tasks', hint: 'Check off a task and it will show up here.' },
  } satisfies Record<Filter, { title: string; hint: string }>,
  deleteTask: (text: string) => `Delete task: ${text}`,
}

export type Messages = typeof en
export type Lang = 'en' | 'ru'

const ru: Messages = {
  title: 'Задачи',
  subtitle: 'Записывайте важное и отмечайте сделанное.',
  storageWarning:
    'Браузер блокирует локальное хранилище, поэтому задачи пропадут после закрытия или перезагрузки страницы.',
  newTask: 'Новая задача',
  placeholder: 'Что нужно сделать?',
  add: 'Добавить',
  emptyInput: 'Сначала введите задачу.',
  filterGroup: 'Фильтр задач',
  taskList: 'Список задач',
  language: 'Язык',
  locale: 'ru-RU',
  clearCompleted: 'Очистить выполненные',
  allDone: 'Все задачи выполнены — отличная работа!',
  progress: (done, total) => `${done} из ${total} выполнено`,
  filters: { all: 'Все', active: 'Активные', completed: 'Выполненные' },
  stats: { total: 'Всего', active: 'Активные', done: 'Готово' },
  empty: {
    all: { title: 'Задач пока нет', hint: 'Добавьте первую задачу выше, чтобы начать.' },
    active: { title: 'Всё сделано', hint: 'Откройте «Выполненные», чтобы посмотреть сделанное.' },
    completed: { title: 'Нет выполненных задач', hint: 'Отметьте задачу, и она появится здесь.' },
  },
  deleteTask: (text) => `Удалить задачу: ${text}`,
}

export const LANGS: Lang[] = ['en', 'ru']
export const messages: Record<Lang, Messages> = { en, ru }

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ru'
}

/** Browser language, falling back to English. */
export function detectLang(): Lang {
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}
