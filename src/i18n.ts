import type { ListView, View } from './todos'

const en = {
  title: 'Tickle',
  tagline: 'Feels like pen and paper.',
  storageWarning:
    'Your browser is blocking local storage, so tasks will be lost when you close or reload this page.',
  addTask: 'Add task',
  taskName: 'Task name',
  cancel: 'Cancel',
  priority: 'Priority',
  navLabel: 'Views',
  projects: 'Projects',
  taskList: 'Task list',
  language: 'Language',
  locale: 'en-US',
  search: 'Search tasks',
  nav: {
    all: 'All',
    today: 'Today',
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
    calendar: 'Calendar',
    report: 'Report',
  } satisfies Record<View, string>,
  views: {
    all: 'All tasks',
    today: 'Today',
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
    calendar: 'Calendar',
    report: 'Productivity',
  } satisfies Record<View, string>,
  tasksCount: (n: number) => `${n} ${n === 1 ? 'task' : 'tasks'}`,
  progress: (done: number, total: number) => `${done} of ${total} done`,
  clearCompleted: 'Clear completed',
  undo: 'Undo',
  toastRemoved: 'Task deleted',
  toastCompleted: 'Task completed',
  toastCleared: (n: number) => `Cleared ${n}`,
  editTask: (text: string) => `Edit task: ${text}`,
  editField: 'Task text',
  flagTask: (text: string) => `Toggle priority: ${text}`,
  deleteTask: (text: string) => `Delete task: ${text}`,
  setDue: (text: string) => `Set date: ${text}`,
  dueDate: 'Due date',
  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
  nextWeek: 'Next week',
  noDate: 'No date',
  overdue: 'Overdue',
  shortcutHint: 'Press / to add a task. Try: !call mum tomorrow #family',
  examples: ['Buy oat milk tomorrow', '!Call mum #family', 'Book the dentist today', 'Finish the report #work'],
  calendar: {
    prev: 'Previous month',
    next: 'Next month',
    today: 'Today',
    free: 'Nothing planned for this day.',
    more: (n: number) => `+${n} more`,
    byProject: 'colour = project',
    addOn: (date: string) => `Add a task for ${date}`,
  },
  report: {
    today: 'Done today',
    week: 'Last 7 days',
    streak: 'Day streak',
    rate: 'Completion rate',
    overdue: 'Overdue',
    dueToday: 'Due today',
    chartTitle: 'Tasks completed per day',
    chartHint: (n: number, date: string) => `${date}: ${n} completed`,
    tableDay: 'Day',
    tableDone: 'Completed',
    empty: 'Complete a task and your week starts to fill in here.',
  },
  noResults: { title: 'No matches', hint: 'Try another word.' },
  empty: {
    all: { title: 'No tasks yet', hint: 'A blank page. Write your first task.' },
    today: { title: 'Nothing due today', hint: 'Add a task with “today”, or enjoy the quiet.' },
    upcoming: { title: 'Nothing upcoming', hint: 'Give a task a date and it shows up here.' },
    active: { title: 'Nothing left to do', hint: 'Every task is crossed off. Tick is proud of you.' },
    completed: { title: 'No completed tasks', hint: 'Cross something off and it lands here.' },
  } satisfies Record<ListView, { title: string; hint: string }>,
}

export type Messages = typeof en
export type Lang = 'en' | 'ru'

const ruPlural = new Intl.PluralRules('ru')

const ru: Messages = {
  title: 'Tickle',
  tagline: 'Как ручка и бумага.',
  storageWarning:
    'Браузер блокирует локальное хранилище, поэтому задачи пропадут после закрытия или перезагрузки страницы.',
  addTask: 'Добавить задачу',
  taskName: 'Название задачи',
  cancel: 'Отмена',
  priority: 'Важно',
  navLabel: 'Разделы',
  projects: 'Проекты',
  taskList: 'Список задач',
  language: 'Язык',
  locale: 'ru-RU',
  search: 'Поиск задач',
  nav: {
    all: 'Все',
    today: 'Сегодня',
    upcoming: 'Предстоящие',
    active: 'Активные',
    completed: 'Выполненные',
    calendar: 'Календарь',
    report: 'Отчёт',
  },
  views: {
    all: 'Все задачи',
    today: 'Сегодня',
    upcoming: 'Предстоящие',
    active: 'Активные',
    completed: 'Выполненные',
    calendar: 'Календарь',
    report: 'Продуктивность',
  },
  tasksCount: (n) => {
    const form = ruPlural.select(n)
    return `${n} ${form === 'one' ? 'задача' : form === 'few' ? 'задачи' : 'задач'}`
  },
  progress: (done, total) => `${done} из ${total} выполнено`,
  clearCompleted: 'Очистить выполненные',
  undo: 'Отменить',
  toastRemoved: 'Задача удалена',
  toastCompleted: 'Задача выполнена',
  toastCleared: (n) => `Очищено: ${n}`,
  editTask: (text) => `Изменить задачу: ${text}`,
  editField: 'Текст задачи',
  flagTask: (text) => `Переключить важность: ${text}`,
  deleteTask: (text) => `Удалить задачу: ${text}`,
  setDue: (text) => `Назначить дату: ${text}`,
  dueDate: 'Срок',
  today: 'Сегодня',
  tomorrow: 'Завтра',
  yesterday: 'Вчера',
  nextWeek: 'Через неделю',
  noDate: 'Без даты',
  overdue: 'Просрочено',
  shortcutHint: 'Нажмите /, чтобы добавить задачу. Попробуйте: !позвонить маме завтра #семья',
  examples: ['Купить молоко завтра', '!Позвонить маме #семья', 'Записаться к врачу сегодня', 'Закончить отчёт #работа'],
  calendar: {
    prev: 'Предыдущий месяц',
    next: 'Следующий месяц',
    today: 'Сегодня',
    free: 'На этот день ничего не запланировано.',
    more: (n) => `ещё ${n}`,
    byProject: 'цвет = проект',
    addOn: (date) => `Добавить задачу на ${date}`,
  },
  report: {
    today: 'Сегодня сделано',
    week: 'За 7 дней',
    streak: 'Дней подряд',
    rate: 'Выполнено всего',
    overdue: 'Просрочено',
    dueToday: 'Срок сегодня',
    chartTitle: 'Выполнено задач по дням',
    chartHint: (n, date) => `${date}: выполнено ${n}`,
    tableDay: 'День',
    tableDone: 'Выполнено',
    empty: 'Выполните задачу, и здесь начнёт заполняться ваша неделя.',
  },
  noResults: { title: 'Ничего не найдено', hint: 'Попробуйте другое слово.' },
  empty: {
    all: { title: 'Задач пока нет', hint: 'Чистая страница. Запишите первую задачу.' },
    today: { title: 'На сегодня ничего', hint: 'Добавьте задачу со словом «сегодня» или наслаждайтесь тишиной.' },
    upcoming: { title: 'Впереди пусто', hint: 'Назначьте задаче дату, и она появится здесь.' },
    active: { title: 'Всё сделано', hint: 'Всё вычеркнуто. Тик гордится вами.' },
    completed: { title: 'Нет выполненных задач', hint: 'Вычеркните что-нибудь, и оно окажется здесь.' },
  },
}

export const LANGS: Lang[] = ['ru', 'en']
export const messages: Record<Lang, Messages> = { en, ru }

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'ru'
}

/** Russian is the default; English only for browsers that are set to English. */
export function detectLang(): Lang {
  return navigator.language.toLowerCase().startsWith('en') ? 'en' : 'ru'
}
