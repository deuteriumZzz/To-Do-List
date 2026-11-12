import { motion } from 'motion/react'
import type { Lang, Messages } from '../i18n'
import { hoverProps } from '../motion'
import { PALETTE, VIEW_HUES, painted, paintedBlock, projectHue, type Hue } from '../palette'
import { LIST_VIEWS, type ListView, type View } from '../todos'
import { NavIcon, PlusIcon } from './icons'
import { LangSwitch } from './LangSwitch'
import { Tick } from './Tick'

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
  /** A brush stroke behind the item: painted on from left to right when selected, wiped off when not. */
  const patch = (selected: boolean, hue: Hue) => (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-x-1 inset-y-0 transition-[background-size] duration-500 ease-out motion-reduce:transition-none"
      style={{ ...paintedBlock(PALETTE[hue]), backgroundSize: selected ? '100% 100%' : '0% 100%', backgroundPosition: 'left center' }}
    />
  )
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
          <span className="font-hand text-4xl font-bold leading-none">{t.title}</span>
        </div>
        <div className="md:hidden">
          <LangSwitch value={lang} label={t.language} onChange={onLang} />
        </div>
      </div>

      <motion.button
        type="button"
        onClick={onAdd}
        className="mt-5 hidden items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-bold hover:bg-ink/10 md:flex"
        {...hoverProps}
      >
        <span className="grid size-6 place-items-center rounded-full bg-ink text-paper">
          <PlusIcon />
        </span>
        {t.addTask}
      </motion.button>

      <nav aria-label={t.navLabel} className="flex gap-1 overflow-x-auto px-3 py-3 md:mt-1 md:flex-col md:overflow-visible md:px-0 md:py-0">
        {NAV.map((v) => {
          const selected = view === v && project === null
          return (
            <motion.button
              key={v}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => onView(v)}
              className={item(selected)}
              {...hoverProps}
            >
              {patch(selected, VIEW_HUES[v])}
              <NavIcon view={v} />
              <span className="relative">{t.nav[v]}</span>
              {isListView(v) && count(counts[v])}
            </motion.button>
          )
        })}

        {projects.length > 0 && (
          <p className="mt-4 hidden px-3 pb-1 text-xs font-bold uppercase tracking-wider text-ink-2 md:block">{t.projects}</p>
        )}
        {projects.map((p) => {
          const selected = project === p.name
          return (
            <motion.button
              key={p.name}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => onProject(p.name)}
              className={item(selected)}
              {...hoverProps}
            >
              {patch(selected, projectHue(p.name))}
              <motion.span
                aria-hidden="true"
                variants={{ rest: { rotate: 0, scale: 1 }, hover: { rotate: [0, -14, 10, 0], scale: 1.2, transition: { duration: 0.45 } } }}
                style={painted(projectHue(p.name))}
                className="relative w-5 text-center font-hand text-2xl font-bold leading-none text-ink"
              >
                #
              </motion.span>
              <span className="relative">{p.name}</span>
              {count(p.count)}
            </motion.button>
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
