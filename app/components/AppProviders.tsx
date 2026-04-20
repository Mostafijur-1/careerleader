"use client"

import type { ReactNode } from "react"
import { UserProvider } from "../contexts/UserContext"
import { LanguageProvider } from "../contexts/LanguageContext"

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <UserProvider>{children}</UserProvider>
    </LanguageProvider>
  )
}
