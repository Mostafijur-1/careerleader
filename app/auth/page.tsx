"use client"

import { useRouter } from "next/navigation"
import AuthModal from "../components/AuthModal"

export default function AuthPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.15),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(79,70,229,0.15),_transparent_42%),#f8fafc]">
      <AuthModal isOpen onClose={() => router.push("/")} />
    </main>
  )
}
