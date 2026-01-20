import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useI18n, type Language } from '@/lib/i18n'

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
]

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'buttons'
  showLabel?: boolean
}

export function LanguageSelector({ variant = 'buttons', showLabel = true }: LanguageSelectorProps) {
  const { language, setLanguage } = useI18n()

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-2">
        {showLabel && (
          <Globe className="w-4 h-4 text-gray-400" />
        )}
        <div className="flex rounded-lg bg-gray-800/50 p-1">
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`
                relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${language === lang.code ? 'text-white' : 'text-gray-400 hover:text-gray-200'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              {language === lang.code && (
                <motion.div
                  layoutId="language-bg"
                  className="absolute inset-0 bg-violet-500/30 rounded-md"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{lang.flag}</span>
                {showLabel && <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  )
}
