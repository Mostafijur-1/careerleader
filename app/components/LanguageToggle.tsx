"use client"

import { useLanguage } from "../contexts/LanguageContext"
import type { SiteLang } from "@/lib/siteI18n"

type Props = {
  className?: string
  compact?: boolean
  /** `dark` = nav on gradient/dark; `light` = white header */
  variant?: "dark" | "light"
}

export default function LanguageToggle({
  className = "",
  compact = false,
  variant = "dark",
}: Props) {
  const { lang, setLang, t } = useLanguage()

  function pick(next: SiteLang) {
    if (next === lang) return
    setLang(next)
  }

  const wrap =
    variant === "light"
      ? "bg-gray-100 border border-gray-200"
      : "bg-white/10 border border-white/20"
  const label = variant === "light" ? "text-gray-500" : "text-white/70"
  const idle = variant === "light" ? "text-gray-700 hover:bg-gray-200" : "text-white/90 hover:bg-white/10"
  const active = variant === "light" ? "bg-blue-600 text-white" : "bg-white text-blue-900"

  return (
    <div className={`flex items-center gap-1 sm:gap-2 rounded-lg px-1.5 sm:px-2 py-1 ${wrap} ${className}`}>
      {!compact && (
        <span className={`${label} text-xs hidden sm:inline`}>{t.common.language}:</span>
      )}
      <button
        type="button"
        onClick={() => pick("en")}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition ${
          lang === "en" ? active : idle
        }`}
      >
        {t.common.english}
      </button>
      <button
        type="button"
        onClick={() => pick("bn")}
        className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-semibold transition ${
          lang === "bn" ? active : idle
        }`}
      >
        {t.common.bangla}
      </button>
    </div>
  )
}
