import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import translations, { type Lang } from './translations'

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: 'pt',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('ri_lang')
    return (stored as Lang) || 'pt'
  })

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    localStorage.setItem('ri_lang', l)
  }, [])

  const t = useCallback((key: string): string => {
    const entry = translations[key]
    if (!entry) return key
    return entry[lang] || entry['pt'] || key
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
