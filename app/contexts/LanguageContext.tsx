"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  SITE_LANG_STORAGE_KEY,
  getSiteMessages,
  type SiteLang,
  type SiteMessages,
} from "@/lib/siteI18n"

const LEGACY_ASSESSMENT_LANG_KEY = "careerleader_assessment_lang"

function readStoredLang(): SiteLang {
  if (typeof window === "undefined") return "en"
  try {
    const s = localStorage.getItem(SITE_LANG_STORAGE_KEY)
    if (s === "bn" || s === "en") return s
    const legacy = localStorage.getItem(LEGACY_ASSESSMENT_LANG_KEY)
    if (legacy === "bn" || legacy === "en") {
      localStorage.setItem(SITE_LANG_STORAGE_KEY, legacy)
      return legacy
    }
  } catch {
    /* ignore */
  }
  return "en"
}

type LanguageContextValue = {
  lang: SiteLang
  setLang: (lang: SiteLang) => void
  t: SiteMessages
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function DocumentLangSync({ lang }: { lang: SiteLang }) {
  useEffect(() => {
    document.documentElement.lang = lang === "bn" ? "bn" : "en"
  }, [lang])
  return null
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>("en")

  useEffect(() => {
    setLangState(readStoredLang())
  }, [])

  const setLang = useCallback((next: SiteLang) => {
    setLangState(next)
    try {
      localStorage.setItem(SITE_LANG_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: getSiteMessages(lang),
    }),
    [lang, setLang]
  )

  return (
    <LanguageContext.Provider value={value}>
      <DocumentLangSync lang={lang} />
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}

/** Safe hook for optional provider (e.g. Storybook) — falls back to English */
export function useOptionalLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (ctx) return ctx
  return {
    lang: "en",
    setLang: () => {},
    t: getSiteMessages("en"),
  }
}
