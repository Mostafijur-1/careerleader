"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"

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

export default function MentorPage() {
  const { user } = useUser()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")

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

  if (!user || user.type !== "mentor") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-700 mb-4">Mentor login required.</p>
          <Link href="/" className="text-blue-600 font-semibold">Go to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Inbox</h1>
            <p className="text-sm text-gray-600">View and reply to students under your mentorship.</p>
          </div>
          <Link href="/" className="text-blue-600 font-semibold">Back Home</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid md:grid-cols-3 gap-4">
        <section className="md:col-span-1 bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Students</h2>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {loadingConversations ? (
              <p className="p-4 text-sm text-gray-500">Loading conversations...</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No student conversations yet.</p>
            ) : (
              conversations.map(c => (
                <button
                  key={c.studentEmail}
                  onClick={() => setSelectedStudent(c.studentEmail)}
                  className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${selectedStudent === c.studentEmail ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900">{c.studentName || c.studentEmail}</p>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                      MBTI: {c.studentMbti || "N/A"}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">{c.studentEmail}</p>
                  <p className="text-xs text-gray-600 mt-1 truncate">{c.lastMessage || "No messages"}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="md:col-span-2 bg-white rounded-xl border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              {selectedConversation ? `Chat with ${selectedConversation.studentName || selectedConversation.studentEmail}` : "Select a student"}
            </h2>
            {selectedConversation && (
              <p className="text-sm text-purple-700 font-semibold mt-1">
                Student MBTI: {selectedConversation.studentMbti || "Not available yet"}
              </p>
            )}
          </div>

          <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[55vh] bg-gray-50">
            {!selectedStudent ? (
              <p className="text-sm text-gray-500">Choose a student conversation from the left.</p>
            ) : loadingMessages ? (
              <p className="text-sm text-gray-500">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages in this conversation.</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.senderType === "mentor" ? "ml-auto bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900"}`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={selectedStudent ? "Reply to student..." : "Select a student first"}
              disabled={!selectedStudent || sending}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendReply}
              disabled={!selectedStudent || sending || !draft.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
