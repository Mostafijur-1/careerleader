"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthButton from "./components/AuthButton"
import AuthModal from "./components/AuthModal"
import { useUser } from "./contexts/UserContext"

type Mentor = {
  id: string
  email: string
  name: string
  expertise: string[]
  active: boolean
  zoomLink?: string
  meetLink?: string
}

type MentorMessage = {
  id: string
  senderType: "student" | "mentor"
  senderEmail: string
  text: string
  createdAt: string
}

export default function Home() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [chatMessages, setChatMessages] = useState<MentorMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (user?.type === "mentor") {
      router.push("/mentor")
    }
  }, [user?.type, router])

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await fetch("/api/mentorship?action=mentors")
        const data = await res.json()
        setMentors(Array.isArray(data?.mentors) ? data.mentors : [])
      } catch (error) {
        console.error("Failed to load mentors", error)
      }
    }
    fetchMentors()
  }, [])

  useEffect(() => {
    async function fetchMessages() {
      if (!user?.email || !selectedMentor?.email) {
        setChatMessages([])
        return
      }
      setChatLoading(true)
      try {
        const params = new URLSearchParams({
          action: "messages",
          studentEmail: user.email,
          mentorEmail: selectedMentor.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        setChatMessages(Array.isArray(data?.messages) ? data.messages : [])
      } catch (error) {
        console.error("Failed to load chat", error)
      } finally {
        setChatLoading(false)
      }
    }
    fetchMessages()
  }, [selectedMentor, user?.email])

  async function sendMessage() {
    if (!user?.email || !selectedMentor?.email || !chatInput.trim()) return
    setChatSending(true)
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          studentEmail: user.email,
          mentorEmail: selectedMentor.email,
          senderEmail: user.email,
          senderType: user.type === "mentor" ? "mentor" : "student",
          text: chatInput.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data?.message) {
        setChatMessages(prev => [...prev, data.message])
        setChatInput("")
      }
    } catch (error) {
      console.error("Failed to send message", error)
    } finally {
      setChatSending(false)
    }
  }

  const handleLogout = () => {
    setUser(null)
    setMobileMenuOpen(false)
  }

  const displayName = isMounted ? (user ? user.name : "Guest") : "Guest"

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
            <span className="text-blue-600">🚀</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
          </div>
          <nav className="hidden md:flex gap-6 lg:gap-8 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
            <Link href="/assessment" className="text-gray-700 hover:text-blue-600 font-medium transition">Assessment</Link>
            {isMounted && user?.type === "mentor" && (
              <Link href="/mentor" className="text-blue-600 hover:text-blue-700 font-medium transition">Mentor Inbox</Link>
            )}
            {isMounted && user?.type === "admin" && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium transition">Admin</Link>
            )}
            <AuthButton onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
          </nav>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        <section className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Hello, {displayName} 👋</h1>
          <p className="text-gray-600 mt-2">Chat with mentors directly and schedule sessions over Zoom or Google Meet.</p>
          <Link
            href="/assessment"
            className="inline-flex mt-6 items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
          >
            Take Assessment
          </Link>
        </section>

        <section id="mentors">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Available Mentors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mentors.map(mentor => (
              <div key={mentor.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 mb-4 flex items-center justify-center text-white text-xl font-bold">
                  {(mentor.name || "M").charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg text-gray-900">{mentor.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{mentor.expertise?.join(", ") || "General mentorship"}</p>
                <div className="mt-4 flex gap-2 flex-wrap">
                  <a href={mentor.zoomLink || "https://zoom.us"} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Zoom</a>
                  <a href={mentor.meetLink || "https://meet.google.com"} target="_blank" rel="noreferrer" className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">Meet</a>
                </div>
                <button
                  onClick={() => setSelectedMentor(mentor)}
                  className="w-full mt-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2.5 rounded-lg"
                >
                  Chat with Mentor
                </button>
              </div>
            ))}
            {mentors.length === 0 && (
              <div className="col-span-full rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                No active mentors available right now.
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center text-gray-600">
        <p className="text-sm">Career Leader © 2026</p>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-5 sm:p-8 my-auto relative">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-gray-900">{selectedMentor.name}</h2>
            <p className="text-gray-600 mt-1">{selectedMentor.expertise?.join(", ") || "Career Mentor"}</p>

            <div className="mt-4 mb-5 flex flex-wrap gap-2">
              <a href={selectedMentor.zoomLink || "https://zoom.us"} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Contact via Zoom</a>
              <a href={selectedMentor.meetLink || "https://meet.google.com"} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">Contact via Meet</a>
            </div>

            <div className="rounded-lg border border-gray-200 p-3">
              <div className="h-56 overflow-y-auto bg-gray-50 rounded-md p-3 space-y-2 mb-3">
                {chatLoading ? (
                  <p className="text-sm text-gray-500">Loading messages...</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet. Start a conversation with your mentor.</p>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`text-sm p-2 rounded-md ${msg.senderEmail === user?.email ? "bg-blue-100 text-blue-900 ml-8" : "bg-white border border-gray-200 mr-8"}`}
                    >
                      <p className="font-semibold">{msg.senderEmail === user?.email ? "You" : selectedMentor.name}</p>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={user ? "Type your message..." : "Login to chat with mentor"}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!user || chatSending}
                />
                <button
                  onClick={sendMessage}
                  disabled={!user || chatSending || !chatInput.trim()}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {chatSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
