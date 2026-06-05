"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CareerOptionsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/explore-careers")
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
