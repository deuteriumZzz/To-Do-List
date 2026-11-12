import { motion } from 'motion/react'
import { LANGS, type Lang } from '../i18n'
import { springs } from '../motion'

interface LangSwitchProps {
  value: Lang
  label: string
  onChange: (lang: Lang) => void
}

/** Two-position rocker: the raised half is the active language. */
export function LangSwitch({ value, label, onChange }: LangSwitchProps) {
  return (
    <div role="group" aria-label={label} className="slot relative inline-flex rounded-xl p-1">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={value === lang}
          onClick={() => onChange(lang)}
          className={`relative rounded-lg px-3 py-1 font-mono text-xs font-medium uppercase tracking-wider transition-colors ${
            value === lang ? 'text-ink' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {value === lang && (
            <motion.span layoutId="lang-key" transition={springs.snappy} className="plate absolute inset-0 rounded-lg" />
          )}
          <span className="relative">{lang}</span>
        </button>
      ))}
    </div>
  )
}
