"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"

type Conversation = {
  studentEmail: string
  studentName?: string
  studentMbti?: string
  lastMessage: string
  lastMessageAt: string
}

type MentorMessage = {
  id: string
  studentEmail: string
  mentorEmail: string
  senderType: "student" | "mentor"
  senderEmail: string
  text: string
  createdAt: string
}

type PendingRequest = {
  id: string
  studentEmail: string
  studentName?: string
  studentMbti?: string
}

export default function MentorPage() {
  const { user, setUser } = useUser()
  const { t } = useLanguage()
  const m = t.mentorPage
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [requestActionLoading, setRequestActionLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return
    if (user.type !== "mentor") {
      router.push("/")
    }
  }, [user, router])

  useEffect(() => {
    async function fetchConversations() {
      if (!user?.email || user.type !== "mentor") return
      setLoadingConversations(true)
      try {
        const params = new URLSearchParams({
          action: "mentor-conversations",
          mentorEmail: user.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        const list = Array.isArray(data?.conversations) ? data.conversations : []
        setConversations(list)
        if (list.length > 0 && !selectedStudent) {
          setSelectedStudent(list[0].studentEmail)
        }
      } finally {
        setLoadingConversations(false)
      }
    }
    fetchConversations()
  }, [user?.email, user?.type, selectedStudent])

  useEffect(() => {
    async function fetchPendingRequests() {
      if (!user?.email || user.type !== "mentor") return
      try {
        const params = new URLSearchParams({
          action: "mentor-requests",
          mentorEmail: user.email,
          status: "pending",
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        setPendingRequests(Array.isArray(data?.requests) ? data.requests : [])
      } catch (error) {
        console.error("Failed to load mentor requests", error)
      }
    }
    fetchPendingRequests()
  }, [user?.email, user?.type])

  useEffect(() => {
    async function fetchThread() {
      if (!user?.email || !selectedStudent) return
      setLoadingMessages(true)
      try {
        const params = new URLSearchParams({
          action: "messages",
          mentorEmail: user.email,
          studentEmail: selectedStudent,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        setMessages(Array.isArray(data?.messages) ? data.messages : [])
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchThread()
  }, [selectedStudent, user?.email])

  const selectedConversation = useMemo(
    () => conversations.find(c => c.studentEmail === selectedStudent) || null,
    [conversations, selectedStudent]
  )

  async function sendReply() {
    if (!user?.email || !selectedStudent || !draft.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          studentEmail: selectedStudent,
          mentorEmail: user.email,
          senderEmail: user.email,
          senderType: "mentor",
          text: draft.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data?.message) {
        setMessages(prev => [...prev, data.message])
        setDraft("")
      }
    } finally {
      setSending(false)
    }
  }

  async function respondRequest(studentEmail: string, decision: "accepted" | "rejected") {
    if (!user?.email) return
    const key = `${studentEmail}:${decision}`
    setRequestActionLoading(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond-request",
          studentEmail,
          mentorEmail: user.email,
          decision,
        }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        setPendingRequests(prev => prev.filter(r => r.studentEmail !== studentEmail))
        if (decision === "accepted") {
          const alreadyExists = conversations.some(c => c.studentEmail === studentEmail)
          if (!alreadyExists) {
            setConversations(prev => [
              {
                studentEmail,
                studentName: "",
                studentMbti: "",
                lastMessage: "",
                lastMessageAt: "",
              },
              ...prev,
            ])
          }
          setSelectedStudent(studentEmail)
        }
      }
    } catch (error) {
      console.error("Failed to respond request", error)
    } finally {
      setRequestActionLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
    } catch {
      // Always clear client session, even if the API call fails.
    } finally {
      setUser(null)
      router.push("/")
    }
  }

  if (!user || user.type !== "mentor") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">{m.loginRequired}</p>
          <Link href="/" className="text-blue-600 font-semibold">{m.goHome}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap justify-between items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{m.title}</h1>
            <p className="text-sm text-white/80 mt-1">{m.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={handleLogout}
              className="text-red-200 hover:text-red-100 font-semibold transition"
            >
              {t.auth.logout}
            </button>
            <Link href="/" className="text-white font-semibold hover:text-blue-200 transition">{m.backHome}</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid md:grid-cols-3 gap-4 sm:gap-6">
        <section className="md:col-span-1 bg-white rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <h2 className="font-bold text-lg">{m.students}</h2>
            <p className="text-xs text-white/80 mt-1">{m.studentsSub}</p>
          </div>
          {pendingRequests.length > 0 && (
            <div className="p-3 border-b border-gray-100 bg-amber-50">
              <p className="text-xs font-bold text-amber-900 mb-2">{m.pending}</p>
              <div className="space-y-2">
                {pendingRequests.map(req => (
                  <div key={req.id} className="rounded-lg border border-amber-200 bg-white p-2">
                    <p className="text-sm font-semibold text-gray-900">{req.studentName || req.studentEmail}</p>
                    <p className="text-xs text-gray-600">MBTI: {req.studentMbti || "N/A"}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => respondRequest(req.studentEmail, "accepted")}
                        disabled={requestActionLoading[`${req.studentEmail}:accepted`]}
                        className="flex-1 py-1.5 text-xs font-bold rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        {m.accept}
                      </button>
                      <button
                        onClick={() => respondRequest(req.studentEmail, "rejected")}
                        disabled={requestActionLoading[`${req.studentEmail}:rejected`]}
                        className="flex-1 py-1.5 text-xs font-bold rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        {m.reject}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingConversations ? (
              <p className="p-4 text-sm text-gray-500">{m.loadingConversations}</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">{m.noConversations}</p>
            ) : (
              conversations.map(c => (
                <button
                  key={c.studentEmail}
                  onClick={() => setSelectedStudent(c.studentEmail)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition ${selectedStudent === c.studentEmail ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900">{c.studentName || c.studentEmail}</p>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      MBTI: {c.studentMbti || "N/A"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{c.studentEmail}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{c.lastMessage || m.noMessages}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="md:col-span-2 bg-white rounded-2xl shadow-2xl border border-white/50 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <h2 className="font-semibold text-white">
              {selectedConversation
                ? m.chatWith(selectedConversation.studentName || selectedConversation.studentEmail)
                : m.selectStudent}
            </h2>
            {selectedConversation && (
              <p className="text-sm text-white/90 font-semibold mt-1">
                {m.studentMbti(selectedConversation.studentMbti || "—")}
              </p>
            )}
          </div>

          <div className="flex-1 p-4 sm:p-5 space-y-3 overflow-y-auto max-h-[55vh] bg-gradient-to-b from-gray-50 to-white">
            {!selectedStudent ? (
              <p className="text-sm text-gray-500">{m.selectFromLeft}</p>
            ) : loadingMessages ? (
              <p className="text-sm text-gray-500">{m.loadingMessages}</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500">{m.noMessagesThread}</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.senderType === "mentor"
                      ? "ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white flex gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={selectedStudent ? m.replyPlaceholder : m.selectFirst}
              disabled={!selectedStudent || sending}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendReply}
              disabled={!selectedStudent || sending || !draft.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sending ? m.sending : m.send}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
