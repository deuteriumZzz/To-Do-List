import { motion } from 'motion/react'
import { LANGS, type Lang } from '../i18n'
import { springs } from '../motion'

interface LangSwitchProps {
  value: Lang
  label: string
  onChange: (lang: Lang) => void
}

export function LangSwitch({ value, label, onChange }: LangSwitchProps) {
  return (
    <div role="group" aria-label={label} className="relative inline-flex rounded-full bg-ink/10 p-0.5">
      {LANGS.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={value === lang}
          onClick={() => onChange(lang)}
          className={`relative rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${
            value === lang ? 'text-paper' : 'text-ink-2 hover:text-ink'
          }`}
        >
          {value === lang && (
            <motion.span layoutId="lang-pill" transition={springs.snappy} className="absolute inset-0 rounded-full bg-ink" />
          )}
          <span className="relative">{lang}</span>
        </button>
      ))}
    </div>
  )
}
