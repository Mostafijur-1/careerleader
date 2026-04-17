"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import AuthButton from "./components/AuthButton"
import AuthModal from "./components/AuthModal"
import ClientOnly from "./components/HydrationBoundary"
import { useUser } from "./contexts/UserContext"
import { useRouter } from "next/navigation"

type MentorVM = {
  id: string
  email: string
  name: string
  role: string
  rating: number
  reviews: number
  recommended: boolean
  image: string
  expertise: string[]
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

type MessageNotification = {
  id: string
  mentorEmail: string
  senderEmail: string
  text: string
  createdAt: string
}

type ConnectionStatus = "none" | "pending" | "accepted" | "rejected"

export default function Home() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"job" | "higher_study" | "entrepreneurship">("job")
  const [selectedMentor, setSelectedMentor] = useState<MentorVM | null>(null)
  const [mentors, setMentors] = useState<MentorVM[]>([])

  const [chatMessages, setChatMessages] = useState<MentorMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState<MessageNotification[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [requestStatuses, setRequestStatuses] = useState<Record<string, ConnectionStatus>>({})
  const [requestLoadingByMentor, setRequestLoadingByMentor] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (user?.type === "mentor") router.push("/mentor")
  }, [user?.type, router])

  useEffect(() => {
    async function fetchMentors() {
      try {
        const res = await fetch("/api/mentorship?action=mentors")
        const data = await res.json()
        const list = Array.isArray(data?.mentors) ? data.mentors : []
        const mapped: MentorVM[] = list.map((m: any) => {
          const name = String(m?.name || "Mentor")
          const expertise: string[] = Array.isArray(m?.expertise) ? m.expertise : []
          return {
            id: String(m?.id || m?._id || name),
            email: String(m?.email || "").toLowerCase(),
            name,
            role: expertise[0] ? String(expertise[0]) : "Career Mentor",
            rating: 4.6,
            reviews: 100,
            recommended: true,
            image: name.charAt(0).toUpperCase(),
            expertise,
            zoomLink: m?.zoomLink || "",
            meetLink: m?.meetLink || "",
          }
        })
        setMentors(mapped)
      } catch (e) {
        console.error("Failed to load mentors", e)
        setMentors([])
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
      const status = requestStatuses[selectedMentor.email.toLowerCase()] || "none"
      if (status !== "accepted") {
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
        setChatMessages([])
      } finally {
        setChatLoading(false)
      }
    }
    fetchMessages()
  }, [selectedMentor, user?.email, requestStatuses])

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.email || user.type !== "student") {
        setNotifications([])
        setUnreadCount(0)
        return
      }
      setNotificationsLoading(true)
      try {
        const params = new URLSearchParams({
          action: "student-notifications",
          studentEmail: user.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        const list = Array.isArray(data?.notifications) ? data.notifications : []
        setNotifications(list)

        const seenKey = `notif_seen_at_${user.email.toLowerCase()}`
        const seenAt = Number(localStorage.getItem(seenKey) || "0")
        const unread = list.filter((n: MessageNotification) => new Date(n.createdAt).getTime() > seenAt).length
        setUnreadCount(unread)
      } catch (error) {
        console.error("Failed to load notifications", error)
      } finally {
        setNotificationsLoading(false)
      }
    }
    fetchNotifications()
  }, [user?.email, user?.type, chatMessages.length])

  useEffect(() => {
    async function fetchRequestStatuses() {
      if (!user?.email || user.type !== "student") {
        setRequestStatuses({})
        return
      }
      try {
        const params = new URLSearchParams({
          action: "request-statuses",
          studentEmail: user.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        const statuses: Record<string, ConnectionStatus> = {}
        for (const item of data?.statuses || []) {
          const key = String(item?.mentorEmail || "").toLowerCase()
          if (!key) continue
          const val = String(item?.status || "none").toLowerCase()
          statuses[key] = val === "accepted" || val === "pending" || val === "rejected" ? (val as ConnectionStatus) : "none"
        }
        setRequestStatuses(statuses)
      } catch (error) {
        console.error("Failed to load mentorship request statuses", error)
      }
    }
    fetchRequestStatuses()
  }, [user?.email, user?.type, mentors.length])

  function toggleNotifications() {
    const nextOpen = !notificationsOpen
    setNotificationsOpen(nextOpen)
    if (nextOpen && user?.email) {
      const seenKey = `notif_seen_at_${user.email.toLowerCase()}`
      localStorage.setItem(seenKey, String(Date.now()))
      setUnreadCount(0)
    }
  }

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

  async function sendConnectionRequest(mentorEmail: string) {
    if (!user?.email || user.type !== "student") return
    const key = mentorEmail.toLowerCase()
    setRequestLoadingByMentor(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-request",
          studentEmail: user.email,
          mentorEmail: key,
        }),
      })
      const data = await res.json()
      if (res.ok && data?.status) {
        setRequestStatuses(prev => ({ ...prev, [key]: data.status as ConnectionStatus }))
      }
    } catch (error) {
      console.error("Failed to send mentorship request", error)
    } finally {
      setRequestLoadingByMentor(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleLogout = () => {
    setUser(null)
    setMobileMenuOpen(false)
  }

  const displayName = isMounted ? (user ? user.name : "Guest") : "Guest"

  const careerPreviews: Record<"job" | "higher_study" | "entrepreneurship", Array<{ id: number; title: string; subtitle: string; icon: string; fit: number }>> = {
    job: [
      { id: 1, title: "Software Engineer", subtitle: "Product, web, and platform development", icon: "💻", fit: 96 },
      { id: 2, title: "Network Engineer", subtitle: "Infrastructure, cloud, and security", icon: "🌐", fit: 86 },
    ],
    higher_study: [
      { id: 3, title: "Govt. Universities", subtitle: "Admission, requirements, and preparation", icon: "🏛️", fit: 88 },
      { id: 4, title: "Scholarship (Abroad)", subtitle: "Eligibility, documents, and process", icon: "🎓", fit: 84 },
    ],
    entrepreneurship: [
      { id: 5, title: "Startup Foundation", subtitle: "How to begin and validate ideas", icon: "🚀", fit: 90 },
      { id: 6, title: "Roles & Growth", subtitle: "Skills, challenges, and success strategy", icon: "📈", fit: 82 },
    ],
  }
  const activeCareerItems = careerPreviews[activeTab]

  const resources = [
    { id: 1, title: "Python Programming", icon: "🐍", type: ["Courses", "Articles", "Videos"], learners: "10K+" },
    { id: 2, title: "Web Development", icon: "🌐", type: ["Courses", "Articles", "Videos"], learners: "25K+" },
    { id: 3, title: "Mobile App Developer", icon: "📱", type: ["Courses", "Articles", "Videos"], learners: "15K+" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold">
            <div className="relative">
              <div className="relative bg-white px-1 py-2 text-blue-600">🚀</div>
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
          </div>
          <nav className="hidden md:flex gap-6 lg:gap-8 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">Home</Link>
            <Link href="#careers" className="text-gray-700 hover:text-blue-600 font-medium transition">Explore Careers</Link>
            <Link href="#mentors" className="text-gray-700 hover:text-blue-600 font-medium transition">Mentors</Link>
            {isMounted && user?.type === "admin" && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium transition">⚙️ Admin</Link>
            )}
            {isMounted && user?.type === "mentor" && (
              <Link href="/mentor" className="text-blue-600 hover:text-blue-700 font-medium transition">💬 Mentor Inbox</Link>
            )}
            <div className="relative">
              <button onClick={toggleNotifications} className="relative text-gray-700 hover:text-blue-600 transition">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-2xl p-3 z-50">
                  <h4 className="font-bold text-gray-900 mb-2">Message Notifications</h4>
                  {notificationsLoading ? (
                    <p className="text-sm text-gray-500 py-2">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No new message notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-2 border-b border-gray-100 last:border-b-0">
                        <p className="text-xs text-gray-500">{n.senderEmail}</p>
                        <p className="text-sm text-gray-900 truncate">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <AuthButton onOpenAuth={() => setIsAuthOpen(true)} onLogout={handleLogout} />
          </nav>

          <div className="md:hidden flex items-center gap-3">
            <div className="relative">
              <button onClick={toggleNotifications} className="relative text-gray-700 hover:text-blue-600 transition text-lg">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-2xl p-3 z-50">
                  <h4 className="font-bold text-gray-900 mb-2">Message Notifications</h4>
                  {notificationsLoading ? (
                    <p className="text-sm text-gray-500 py-2">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No new message notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="py-2 border-b border-gray-100 last:border-b-0">
                        <p className="text-xs text-gray-500">{n.senderEmail}</p>
                        <p className="text-sm text-gray-900 truncate">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-3">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">Home</Link>
            <Link href="#careers" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">Explore Careers</Link>
            <Link href="#mentors" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">Mentors</Link>
            {isMounted && user?.type === "admin" && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-medium py-2">⚙️ Admin</Link>
            )}
            {isMounted && user?.type === "mentor" && (
              <Link href="/mentor" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-medium py-2">💬 Mentor Inbox</Link>
            )}
            <div className="pt-2 border-t border-gray-100">
              <AuthButton onOpenAuth={() => { setIsAuthOpen(true); setMobileMenuOpen(false) }} onLogout={handleLogout} />
            </div>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
          <div>
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">Welcome to Career Leader!</div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Ideal Career</span> Path
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">Discover personalized career recommendations based on your personality, interests, and goals in just 5 minutes.</p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              🚀 Take Assessment Now
            </Link>
          </div>
          <div className="text-center relative">
            <div className="inline-block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-3xl blur-2xl opacity-30"></div>
              <div className="relative text-6xl sm:text-8xl lg:text-9xl bg-gradient-to-br from-blue-100 to-indigo-100 p-8 sm:p-10 lg:p-12 rounded-3xl">👨‍💼</div>
            </div>
          </div>
        </div>
      </section>

      {/* Greeting & Feature Cards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">Hello, {displayName}! 👋</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">Ready to discover your future?</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Complete Assessment</h3>
              <p className="text-gray-600 mb-6">Take a 5-minute personality & interest test to find careers that fit you.</p>
              <Link href="/assessment" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                Start Now
              </Link>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Recommended Careers</h3>
              <p className="text-gray-600 mb-6">Get personalized career suggestions based on your assessment.</p>
              <Link href="#careers" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                View Careers
              </Link>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Your Progress</h3>
              <p className="text-gray-600 mb-6">Monitor your skill development and career progress.</p>
              <div className="flex items-center gap-4">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                  View
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">0%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Recommendations */}
      <section id="careers" className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Career Path Preview</h2>
          <p className="text-gray-600">Pick a track to preview it, then open full guidance for step-by-step details.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {(["job", "higher_study", "entrepreneurship"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                activeTab === tab
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab === "job" ? "💼 Job" : tab === "higher_study" ? "🎓 Higher Study" : "🚀 Entrepreneurship"}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-8">
          {activeCareerItems.map(career => (
            <div key={career.id} className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition"></div>
              <div className="relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-4xl sm:text-6xl mb-3">{career.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{career.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{career.subtitle}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 font-bold px-4 py-2 rounded-xl text-lg">{career.fit}%</div>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all" style={{ width: `${career.fit}%` } as React.CSSProperties}></div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition">✓ Interested</button>
                  <Link
                    href="/career-options"
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold transition text-center"
                  >
                    Full Guidance →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Learning Resources & Mentors */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-16 grid lg:grid-cols-3 gap-8 lg:gap-12" id="mentors">
        {/* Learning Resources */}
        <div className="lg:col-span-1">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Learning Resources</h2>
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-bold text-sm">See All →</Link>
          </div>
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource.id} className="group bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition">{resource.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg">{resource.title}</h3>
                <div className="flex gap-2 mt-3 text-xs font-medium text-gray-600">
                  {resource.type.map(t => (
                    <span key={`${resource.id}-${t}`} className="bg-gray-100 px-2 py-1 rounded">• {t}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">👥 {resource.learners} learners</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Top Mentors for You</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mentors.map(mentor => (
              <div
                key={mentor.id}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition">
                    {mentor.image}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{mentor.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{mentor.role}</p>
                  <div className="flex justify-center items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                    <span className="text-xs text-gray-600 ml-2">{mentor.rating} • {mentor.reviews}</span>
                  </div>
                  {mentor.recommended && (
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      ⭐ Highly Recommended
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition mb-2"
                  >
                    👁 View Profile
                  </button>
                  {(() => {
                    const status = requestStatuses[mentor.email.toLowerCase()] || "none"
                    const isLoadingReq = !!requestLoadingByMentor[mentor.email.toLowerCase()]
                    if (!user || user.type !== "student") {
                      return (
                        <button
                          onClick={() => setIsAuthOpen(true)}
                          className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
                        >
                          Login to Connect
                        </button>
                      )
                    }
                    if (status === "accepted") {
                      return (
                        <button
                          onClick={() => setSelectedMentor(mentor)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition"
                        >
                          Chat Now
                        </button>
                      )
                    }
                    if (status === "pending") {
                      return (
                        <button
                          disabled
                          className="w-full bg-yellow-100 text-yellow-800 font-bold py-2 rounded-lg border border-yellow-300 cursor-not-allowed"
                        >
                          Request Pending
                        </button>
                      )
                    }
                    if (status === "rejected") {
                      return (
                        <button
                          onClick={() => sendConnectionRequest(mentor.email)}
                          disabled={isLoadingReq}
                          className="w-full bg-orange-100 text-orange-800 font-bold py-2 rounded-lg border border-orange-300 hover:bg-orange-200 transition disabled:opacity-60"
                        >
                          {isLoadingReq ? "Sending..." : "Request Again"}
                        </button>
                      )
                    }
                    return (
                      <button
                        onClick={() => sendConnectionRequest(mentor.email)}
                        disabled={isLoadingReq}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-60"
                      >
                        {isLoadingReq ? "Sending..." : "Request to Connect"}
                      </button>
                    )
                  })()}
                </div>
              </div>
            ))}
            {mentors.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-md">
                No active mentors available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 sm:py-12 text-center text-gray-600 mt-12 sm:mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex justify-center items-center gap-2 mb-4">
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-gray-900">Career Leader</span>
          </div>
          <p className="text-sm mb-4">Discover your ideal career path based on your personality and interests.</p>
          <p className="text-xs text-gray-500">Career Leader © 2026. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Modal - Rendered at page level for full-page blur */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-8 my-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ✕
            </button>

            {/* Mentor Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 mx-auto mb-6 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {selectedMentor.image}
            </div>

            {/* Mentor Info */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">{selectedMentor.name}</h2>
            <p className="text-gray-600 text-center mb-1">{selectedMentor.role}</p>

            {/* Rating */}
            <div className="flex justify-center items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
              <span className="text-sm text-gray-600 ml-2">{selectedMentor.rating} ({selectedMentor.reviews} reviews)</span>
            </div>

            {/* Badge */}
            {selectedMentor.recommended && (
              <div className="text-center mb-6">
                <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full">
                  ⭐ Highly Recommended
                </span>
              </div>
            )}

            {/* About Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Experienced mentor with years of expertise in {selectedMentor.role.toLowerCase()}. Available for mentoring, career guidance, and technical discussions.
              </p>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-3 mb-6">
              <a
                href={selectedMentor.zoomLink || "https://zoom.us"}
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition text-center"
              >
                Zoom
              </a>
              <a
                href={selectedMentor.meetLink || "https://meet.google.com"}
                target="_blank"
                rel="noreferrer"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition text-center"
              >
                Meet
              </a>
            </div>

            {/* Chat */}
            <div className="rounded-lg border border-gray-200 p-3">
            <div className="h-44 sm:h-48 overflow-y-auto bg-gray-50 rounded-md p-3 space-y-2 mb-3">
                {!user ? (
                  <p className="text-sm text-gray-600">Login as a student to chat with this mentor.</p>
                ) : (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted" ? (
                  <p className="text-sm text-gray-600">
                    Chat unlocks after mentor accepts your connection request.
                  </p>
                ) : chatLoading ? (
                  <p className="text-sm text-gray-500">Loading messages...</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">No messages yet. Start a conversation.</p>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`text-sm p-2 rounded-md ${
                        msg.senderType === "student"
                          ? "bg-blue-100 text-blue-900 ml-8"
                          : "bg-white border border-gray-200 mr-8"
                      }`}
                    >
                      <p className="font-semibold">{msg.senderType === "student" ? "You" : selectedMentor.name}</p>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={user ? "Type your message..." : "Login to chat"}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!user || chatSending || (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!user || chatSending || !chatInput.trim() || (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted"}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {chatSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>

            <ClientOnly>
              <div />
            </ClientOnly>
          </div>
        </div>
      )}
    </div>
  )
}

