import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AddTodoForm } from './components/AddTodoForm'
import { Background } from './components/Background'
import { Celebration } from './components/Celebration'
import { EmptyState } from './components/EmptyState'
import { Filters } from './components/Filters'
import { LangSwitch } from './components/LangSwitch'
import { Stats } from './components/Stats'
import { TodoItem } from './components/TodoItem'
import { detectLang, messages, type Lang } from './i18n'
import { ease, springs } from './motion'
import { loadLang, saveLang } from './storage'
import { filterTodos, getStats, type Filter } from './todos'
import { useTodos } from './useTodos'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

export default function App() {
  const { todos, storageOk, add, toggle, remove, clearCompleted } = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const [lang, setLang] = useState<Lang>(() => loadLang() ?? detectLang())
  const [now] = useState(() => new Date())

  const t = messages[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
  }, [lang, t.title])

  function changeLang(next: Lang) {
    setLang(next)
    saveLang(next)
  }

  const stats = getStats(todos)
  const visible = filterTodos(todos, filter)
  const counts = { all: stats.total, active: stats.active, completed: stats.completed }
  const today = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  return (
    <MotionConfig reducedMotion="user">
      <Background />
      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex min-h-svh max-w-2xl flex-col gap-5 px-4 pb-16 pt-6 sm:pt-10"
      >
        <motion.header variants={rise} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-accent text-on-accent shadow-card" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                <path d="M5 10.5l3.5 3.5L15 6.5" />
              </svg>
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink">To-Do</span>
          </div>
          <LangSwitch value={lang} label={t.language} onChange={changeLang} />
        </motion.header>

        <motion.div variants={rise} className="pt-2">
          <p className="text-sm font-medium text-accent first-letter:uppercase">{today}</p>
          <h1 className="mt-1 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{t.title}</h1>
          <p className="mt-2 text-muted">{t.subtitle}</p>
        </motion.div>

        <AnimatePresence>
          {!storageOk && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-warn-bg px-4 py-3 text-sm text-warn-ink"
            >
              {t.storageWarning}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {stats.total > 0 && stats.active === 0 && <Celebration message={t.allDone} />}
        </AnimatePresence>

        <motion.div variants={rise}>
          <Stats t={t} {...stats} />
        </motion.div>

        <motion.div variants={rise}>
          <AddTodoForm t={t} onAdd={add} />
        </motion.div>

        <motion.section variants={rise} aria-label={t.taskList} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Filters t={t} value={filter} counts={counts} onChange={setFilter} />
            <AnimatePresence>
              {stats.completed > 0 && (
                <motion.button
                  type="button"
                  onClick={clearCompleted}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springs.snappy}
                  className="rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-danger"
                >
                  {t.clearCompleted}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {visible.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((todo) => (
                  <TodoItem key={todo.id} t={t} todo={todo} onToggle={toggle} onRemove={remove} />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <EmptyState {...t.empty[filter]} />
            </motion.div>
          )}
        </motion.section>
      </motion.main>
    </MotionConfig>
  )
}
