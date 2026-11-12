import { motion } from 'motion/react'
import type { Lang, Messages } from '../i18n'
import { springs } from '../motion'
import { LIST_VIEWS, type ListView, type View } from '../todos'
import { LangSwitch } from './LangSwitch'
import { Tick } from './Tick'

const ICONS: Record<View, string> = {
  all: 'M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5',
  today: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4M12 13v3',
  upcoming: 'M5 5h14v15H5zM5 10h14M9 3v4M15 3v4M9 15h6',
  active: 'M12 4a8 8 0 100 16 8 8 0 000-16z',
  completed: 'M12 4a8 8 0 100 16 8 8 0 000-16zM8.500 12.500l2.500 2.500 4.500-5',
  calendar: 'M4 5h16v15H4zM4 10h16M10 10v10M16 10v10',
  report: 'M5 20v-9M12 20V5M19 20v-6',
}

const NAV: View[] = [...LIST_VIEWS, 'calendar', 'report']
const isListView = (v: View): v is ListView => (LIST_VIEWS as View[]).includes(v)

interface SidebarProps {
  t: Messages
  lang: Lang
  onLang: (lang: Lang) => void
  view: View
  project: string | null
  counts: Record<ListView, number>
  projects: { name: string; count: number }[]
  cheer: number
  onView: (view: View) => void
  onProject: (name: string) => void
  onAdd: () => void
}

export function Sidebar({ t, lang, onLang, view, project, counts, projects, cheer, onView, onProject, onAdd }: SidebarProps) {
  const item = (selected: boolean) =>
    `relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-[15px] transition-colors ${
      selected ? 'font-bold text-ink' : 'font-medium text-ink-2 hover:text-ink'
    }`
  const pill = <motion.span layoutId="nav-pill" transition={springs.snappy} className="absolute inset-0 rounded-lg bg-ink/10" />
  const count = (n: number) => (
    <span aria-hidden="true" className="relative pl-1 text-xs font-semibold tabular-nums text-ink-2 md:ml-auto">
      {n}
    </span>
  )

  return (
    <aside className="flex flex-col border-b border-line bg-ink/[0.04] md:sticky md:top-4 md:h-[calc(100svh-2rem)] md:w-72 md:shrink-0 md:self-start md:overflow-y-auto md:border-b-0 md:border-r md:p-5">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 md:px-0 md:pt-0">
        <div className="flex items-center gap-2.5">
          <Tick className="h-9 w-9" cheer={cheer} />
          <span className="text-2xl font-extrabold tracking-tight">{t.title}</span>
        </div>
        <div className="md:hidden">
          <LangSwitch value={lang} label={t.language} onChange={onLang} />
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 hidden items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-bold hover:bg-ink/10 md:flex"
      >
        <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" className="size-3.5">
            <path d="M10 4v12M4 10h12" />
          </svg>
        </span>
        {t.addTask}
      </button>

      <nav aria-label={t.navLabel} className="flex gap-1 overflow-x-auto px-3 py-3 md:mt-1 md:flex-col md:overflow-visible md:px-0 md:py-0">
        {NAV.map((v) => {
          const selected = view === v && project === null
          return (
            <button key={v} type="button" aria-current={selected ? 'page' : undefined} onClick={() => onView(v)} className={item(selected)}>
              {selected && pill}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="relative size-5">
                <path d={ICONS[v]} />
              </svg>
              <span className="relative">{t.nav[v]}</span>
              {isListView(v) && count(counts[v])}
            </button>
          )
        })}

        {projects.length > 0 && (
          <p className="mt-4 hidden px-3 pb-1 text-xs font-bold uppercase tracking-wider text-ink-2 md:block">{t.projects}</p>
        )}
        {projects.map((p) => {
          const selected = project === p.name
          return (
            <button key={p.name} type="button" aria-current={selected ? 'page' : undefined} onClick={() => onProject(p.name)} className={item(selected)}>
              {selected && pill}
              <span aria-hidden="true" className="relative w-5 text-center text-lg text-ink-2">
                #
              </span>
              <span className="relative">{p.name}</span>
              {count(p.count)}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto hidden flex-col gap-3 pt-6 md:flex">
        <p className="px-1 font-hand text-2xl leading-tight">{t.tagline}</p>
        <p className="px-1 text-xs leading-relaxed text-ink-2">{t.shortcutHint}</p>
        <div className="px-1">
          <LangSwitch value={lang} label={t.language} onChange={onLang} />
        </div>
      </div>
    </aside>
  )
}
