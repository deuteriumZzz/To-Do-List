import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AddTask } from './components/AddTask'
import { CalendarView } from './components/CalendarView'
import { EmptyState } from './components/EmptyState'
import { ListHeader } from './components/ListHeader'
import { ReportView } from './components/ReportView'
import { Sidebar } from './components/Sidebar'
import { TaskList } from './components/TaskList'
import { Toast } from './components/Toast'
import type { ItemHandlers } from './components/TodoItem'
import { addDays, toISO } from './dates'
import { detectLang, messages, type Lang } from './i18n'
import { ease } from './motion'
import { buildReport } from './report'
import { loadLang, saveLang, swipeHintSeen } from './storage'
import { LIST_VIEWS, getStats, projectCounts, selectTodos, viewCounts, type ListView, type View } from './todos'
import { useTodos } from './useTodos'

const TONES = { all: 'idle', today: 'idle', upcoming: 'idle', active: 'celebrate', completed: 'sleepy' } as const
const isListView = (v: View): v is ListView => (LIST_VIEWS as View[]).includes(v)

export default function App() {
  const { todos, storageOk, undoState, lastAdded, add, edit, toggle, togglePriority, setDue, setTime, remove, clearCompleted, undo, dismissUndo } = useTodos()
  const [view, setView] = useState<View>('all')
  const [project, setProject] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [cheer, setCheer] = useState(0)
  const [lang, setLang] = useState<Lang>(() => loadLang() ?? detectLang())
  const [now] = useState(() => new Date())
  // on touch screens, the first task shows the swipe gesture once
  const [peek] = useState(() => window.matchMedia('(hover: none)').matches && !swipeHintSeen())

  const t = messages[lang]
  const today = toISO(now)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
  }, [lang, t.title])

  // "/" opens the add form from anywhere
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(e.target.tagName))
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView((v) => (isListView(v) ? v : 'all'))
        setAdding(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function changeLang(next: Lang) {
    setLang(next)
    saveLang(next)
  }

  function goTo(next: View) {
    setView(next)
    setProject(null)
    setSearch('')
    setAdding(false)
  }

  const projects = projectCounts(todos)
  const activeProject = project !== null && projects.some((p) => p.name === project) ? project : null
  const isList = isListView(view)
  const listView: ListView = isList ? view : 'all'
  const visible = selectTodos(todos, { view: listView, project: activeProject, search, today })
  const scope = getStats(activeProject === null ? todos : todos.filter((x) => x.project === activeProject))
  const searching = search.trim() !== ''
  const defaultDue = view === 'today' ? today : view === 'upcoming' ? addDays(today, 1) : undefined
  const dateLabel = new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(now)

  const handlers: ItemHandlers = {
    onToggle(id) {
      if (todos.some((x) => x.id === id && !x.completed)) setCheer((c) => c + 1)
      toggle(id)
    },
    onRemove: remove,
    onEdit: edit,
    onPriority: togglePriority,
    onDue: setDue,
    onTime: setTime,
  }

  const toastMessage =
    undoState?.kind === 'cleared' ? t.toastCleared(undoState.count) : undoState?.kind === 'completed' ? t.toastCompleted : t.toastRemoved

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh bg-frame p-2 sm:p-4">
        {/* shared SVG filter: gives highlighter shapes a hand-drawn edge */}
        <svg width="0" height="0" aria-hidden="true" className="absolute">
          <filter id="rough-edge" x="-2%" y="-30%" width="104%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.03 0.14" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.4" />
          </filter>
        </svg>
        <div className="paper mx-auto flex min-h-[calc(100svh-1rem)] max-w-6xl flex-col overflow-clip rounded-[1.75rem] sm:min-h-[calc(100svh-2rem)] md:flex-row">
          <Sidebar
            t={t}
            lang={lang}
            onLang={changeLang}
            view={view}
            project={activeProject}
            counts={viewCounts(todos, today)}
            projects={projects}
            cheer={cheer}
            onView={goTo}
            onProject={(name) => {
              setProject(name === activeProject ? null : name)
              setView('all')
              setSearch('')
            }}
            onAdd={() => {
              if (!isList) setView('all')
              setAdding(true)
            }}
          />

          <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-10 sm:pt-10">
            <div className={`mx-auto ${view === 'calendar' ? 'max-w-5xl' : 'max-w-3xl'}`}>
              <ListHeader
                t={t}
                view={view}
                project={activeProject}
                dateLabel={dateLabel}
                isList={isList}
                done={scope.completed}
                total={scope.total}
                search={search}
                onSearch={setSearch}
                onClearCompleted={clearCompleted}
              />

              <AnimatePresence>
                {!storageOk && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 rounded-xl bg-marker px-4 py-3 text-sm font-semibold"
                  >
                    {t.storageWarning}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.div
                key={`${view}:${activeProject}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease }}
              >
                {view === 'calendar' && <CalendarView t={t} todos={todos} today={today} onAdd={add} lastAdded={lastAdded} {...handlers} />}
                {view === 'report' && <ReportView t={t} report={buildReport(todos, today)} today={today} />}
                {isList && (
                  <>
                    {visible.length > 0 ? (
                      <>
                        <TaskList t={t} todos={visible} view={view} today={today} peek={peek} lastAdded={lastAdded} {...handlers} />
                        <p className="mt-3 text-center font-hand text-xl leading-tight text-ink-2 [@media(hover:hover)]:hidden">{t.swipe.hint}</p>
                      </>
                    ) : (
                      <EmptyState tone={searching ? 'idle' : TONES[listView]} {...(searching ? t.noResults : t.empty[listView])} />
                    )}
                    <AddTask
                      t={t}
                      today={today}
                      open={adding}
                      onOpen={() => setAdding(true)}
                      onClose={() => setAdding(false)}
                      defaultDue={defaultDue}
                      onAdd={add}
                    />
                  </>
                )}
              </motion.div>
            </div>
          </main>
        </div>

        <AnimatePresence>
          {undoState && <Toast key={undoState.id} message={toastMessage} actionLabel={t.undo} onAction={undo} onDismiss={dismissUndo} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
