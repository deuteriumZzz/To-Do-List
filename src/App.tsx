import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AddTodoForm } from './components/AddTodoForm'
import { Celebration } from './components/Celebration'
import { EmptyState } from './components/EmptyState'
import type { Mood } from './components/Face'
import { Filters } from './components/Filters'
import { LangSwitch } from './components/LangSwitch'
import { Logo } from './components/Logo'
import { Stats } from './components/Stats'
import { Toast } from './components/Toast'
import { TodoItem } from './components/TodoItem'
import { detectLang, messages, type Lang } from './i18n'
import { ease, springs } from './motion'
import { loadLang, saveLang } from './storage'
import { filterTodos, getStats, type Filter } from './todos'
import { useTodos } from './useTodos'

const MOODS: Record<Filter, Mood> = { all: 'curious', active: 'cheer', completed: 'sleepy' }
const SCREWS = ['left-3 top-3', 'right-3 top-3', 'bottom-3 left-3', 'bottom-3 right-3']

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const rise = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
}

/** Title whose letters rise into place one after another. */
function Title({ text }: { text: string }) {
  return (
    <h1 aria-label={text} className="font-display text-4xl font-semibold leading-[1.2] tracking-tight sm:text-5xl">
      {[...text].map((char, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: '110%' }}
            animate={{ y: 0 }}
            transition={{ ...springs.snappy, delay: 0.15 + i * 0.045 }}
          >
            {char}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

export default function App() {
  const { todos, storageOk, undoState, add, edit, toggle, remove, clearCompleted, undo, dismissUndo } = useTodos()
  const [filter, setFilter] = useState<Filter>('all')
  const [lang, setLang] = useState<Lang>(() => loadLang() ?? detectLang())
  const [now] = useState(() => new Date())
  const inputRef = useRef<HTMLInputElement>(null)

  const t = messages[lang]

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
  }, [lang, t.title])

  // "/" jumps to the input from anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(e.target.tagName))
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function changeLang(next: Lang) {
    setLang(next)
    saveLang(next)
  }

  const stats = getStats(todos)
  const visible = filterTodos(todos, filter)
  const counts = { all: stats.total, active: stats.active, completed: stats.completed }
  const today = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  const empty = t.empty[filter]

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh px-3 py-4 sm:px-6 sm:py-10">
        <motion.main
          variants={container}
          initial="hidden"
          animate="show"
          className="panel relative mx-auto flex max-w-xl flex-col gap-5 px-4 pb-8 pt-9 sm:px-8 sm:pt-11"
        >
          {SCREWS.map((pos, i) => (
            <span key={pos} aria-hidden="true" className={`screw ${pos}`} style={{ '--r': `${25 + i * 40}deg` } as CSSProperties} />
          ))}

          <motion.header variants={rise} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div whileTap={{ y: 3 }} transition={springs.pop}>
                <Logo className="size-11 drop-shadow-[0_3px_3px_rgb(0_0_0/0.3)]" />
              </motion.div>
              <span className="font-display text-lg font-semibold tracking-tight">Tickle</span>
            </div>
            <LangSwitch value={lang} label={t.language} onChange={changeLang} />
          </motion.header>

          <motion.div variants={rise} className="lcd flex items-center justify-between px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em]">
            <span>{today}</span>
            <span className="flex items-center gap-2">
              TD-1 <span className="led" data-on="true" aria-hidden="true" />
            </span>
          </motion.div>

          <motion.div variants={rise}>
            <Title key={lang} text={t.title} />
            <p className="mt-2 text-ink-2">{t.subtitle}</p>
          </motion.div>

          <AnimatePresence>
            {!storageOk && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="plate flex items-center gap-3 px-4 py-3 text-sm"
              >
                <span className="led" data-on="true" data-tone="signal" aria-hidden="true" />
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
            <AddTodoForm t={t} inputRef={inputRef} onAdd={add} />
          </motion.div>

          <motion.section variants={rise} aria-label={t.taskList} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Filters t={t} value={filter} counts={counts} onChange={setFilter} />
            </div>

            {visible.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visible.map((todo, i) => (
                    <TodoItem key={todo.id} t={t} todo={todo} index={i + 1} onToggle={toggle} onRemove={remove} onEdit={edit} />
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <motion.div key={filter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease }}>
                <EmptyState mood={MOODS[filter]} {...empty} />
              </motion.div>
            )}

            <AnimatePresence>
              {stats.completed > 0 && (
                <motion.button
                  type="button"
                  onClick={clearCompleted}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={springs.snappy}
                  className="key self-start px-4 py-2 text-sm font-semibold"
                >
                  {t.clearCompleted}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.section>

          <motion.p variants={rise} className="hidden text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-2 sm:block">
            {t.shortcutHint}
          </motion.p>
        </motion.main>

        <AnimatePresence>
          {undoState && (
            <Toast
              key={undoState.id}
              message={undoState.kind === 'cleared' ? t.toastCleared(undoState.count) : t.toastRemoved}
              actionLabel={t.undo}
              onAction={undo}
              onDismiss={dismissUndo}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
