"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import AuthButton from "./components/AuthButton"
import AuthModal from "./components/AuthModal"
import ClientOnly from "./components/HydrationBoundary"
import { useUser } from "./contexts/UserContext"
import { useLanguage } from "./contexts/LanguageContext"
import { useRouter } from "next/navigation"
import careers from "@/data/careers.json"
import LanguageToggle from "./components/LanguageToggle"

type MentorVM = {
  id: string
  demo?: boolean
  email: string
  name: string
  role: string
  headline: string
  careerIds: string[]
  education: Array<{ degree: string; institution: string; year?: string }>
  currentJob: { title: string; company: string } | null
  experience: Array<{ title: string; organization: string; period: string; summary?: string }>
  bio: string
  rating: number
  reviews: number
  recommended: boolean
  image: string
  expertise: string[]
  zoomLink?: string
  meetLink?: string
}

function careerLabels(ids: string[]) {
  return ids
    .map(id => careers.find(c => c.id === id)?.title)
    .filter(Boolean) as string[]
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
  const { t } = useLanguage()
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
        const params = new URLSearchParams({
          action: "mentors",
          category: activeTab,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        const list = Array.isArray(data?.mentors) ? data.mentors : []
        const mapped: MentorVM[] = list.map((m: Record<string, unknown>) => {
          const name = String(m?.name || "Mentor")
          const expertise: string[] = Array.isArray(m?.expertise) ? (m.expertise as string[]) : []
          const headline =
            typeof m?.headline === "string" && m.headline.trim()
              ? String(m.headline)
              : expertise[0]
                ? `${expertise[0]} mentor`
                : "Career mentor"
          return {
            id: String(m?.id || name),
            demo: Boolean(m?.demo),
            email: String(m?.email || "").toLowerCase(),
            name,
            role: headline,
            headline,
            careerIds: Array.isArray(m?.careerIds) ? (m.careerIds as string[]) : [],
            education: Array.isArray(m?.education) ? (m.education as MentorVM["education"]) : [],
            currentJob:
              m?.currentJob && typeof m.currentJob === "object" && m.currentJob !== null
                ? (m.currentJob as MentorVM["currentJob"])
                : null,
            experience: Array.isArray(m?.experience) ? (m.experience as MentorVM["experience"]) : [],
            bio: typeof m?.bio === "string" ? m.bio : "",
            rating: typeof m?.rating === "number" ? m.rating : 4.6,
            reviews: typeof m?.reviews === "number" ? m.reviews : 100,
            recommended: m?.recommended !== false,
            image: name.charAt(0).toUpperCase(),
            expertise,
            zoomLink: typeof m?.zoomLink === "string" ? m.zoomLink : "",
            meetLink: typeof m?.meetLink === "string" ? m.meetLink : "",
          }
        })
        setMentors(mapped)
      } catch (e) {
        console.error("Failed to load mentors", e)
        setMentors([])
      }
    }
    fetchMentors()
  }, [activeTab])

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
    if (!mentorEmail.trim()) return
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

  const displayName = isMounted ? (user ? user.name : t.common.guest) : t.common.guest

  const careerPreviews: Record<
    "job" | "higher_study" | "entrepreneurship",
    Array<{ id: number; title: string; subtitle: string; icon: string; fit: number }>
  > = {
    job: t.home.careerPreview.job.map((c, i) => ({ ...c, id: i + 1 })),
    higher_study: t.home.careerPreview.higher.map((c, i) => ({ ...c, id: i + 3 })),
    entrepreneurship: t.home.careerPreview.ent.map((c, i) => ({ ...c, id: i + 5 })),
  }
  const activeCareerItems = careerPreviews[activeTab]

  const mentorTrackLabel =
    activeTab === "job"
      ? t.home.mentorTrackJob
      : activeTab === "higher_study"
        ? t.home.mentorTrackHigher
        : t.home.mentorTrackEnt

  const resources = t.home.resources

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
          <nav className="hidden md:flex gap-4 lg:gap-6 items-center flex-wrap">
            <LanguageToggle variant="light" compact />
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition">{t.nav.home}</Link>
            <Link href="#careers" className="text-gray-700 hover:text-blue-600 font-medium transition">{t.nav.exploreCareers}</Link>
            <Link href="#mentors" className="text-gray-700 hover:text-blue-600 font-medium transition">{t.nav.mentors}</Link>
            {isMounted && user?.type === "admin" && (
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium transition">{t.nav.admin}</Link>
            )}
            {isMounted && user?.type === "mentor" && (
              <Link href="/mentor" className="text-blue-600 hover:text-blue-700 font-medium transition">{t.nav.mentorInbox}</Link>
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
                  <h4 className="font-bold text-gray-900 mb-2">{t.nav.msgNotifications}</h4>
                  {notificationsLoading ? (
                    <p className="text-sm text-gray-500 py-2">{t.common.loading}</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">{t.nav.noNewNotifications}</p>
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
                  <h4 className="font-bold text-gray-900 mb-2">{t.nav.msgNotifications}</h4>
                  {notificationsLoading ? (
                    <p className="text-sm text-gray-500 py-2">{t.common.loading}</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">{t.nav.noNewNotifications}</p>
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
              aria-label={t.nav.toggleMenu}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-3">
            <div className="pb-2">
              <LanguageToggle variant="light" />
            </div>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">{t.nav.home}</Link>
            <Link href="#careers" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">{t.nav.exploreCareers}</Link>
            <Link href="#mentors" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 hover:text-blue-600 font-medium py-2">{t.nav.mentors}</Link>
            {isMounted && user?.type === "admin" && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-medium py-2">{t.nav.admin}</Link>
            )}
            {isMounted && user?.type === "mentor" && (
              <Link href="/mentor" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-medium py-2">{t.nav.mentorInbox}</Link>
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
            <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">{t.home.welcomeBadge}</div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t.home.heroTitleBefore}{" "}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">{t.home.heroTitleHighlight}</span>{" "}
              {t.home.heroTitleAfter}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">{t.home.heroSub}</p>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition transform hover:scale-105"
            >
              {t.home.ctaAssessment}
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
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">{t.home.hello(displayName)}</h2>
          <p className="text-base sm:text-lg text-gray-600 mt-2">{t.home.readyFuture}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.home.cardAssessmentTitle}</h3>
              <p className="text-gray-600 mb-6">{t.home.cardAssessmentBody}</p>
              <Link href="/assessment" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                {t.home.cardAssessmentCta}
              </Link>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.home.cardRecommendedTitle}</h3>
              <p className="text-gray-600 mb-6">{t.home.cardRecommendedBody}</p>
              <Link href="#careers" className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                {t.home.cardRecommendedCta}
              </Link>
            </div>
          </div>
          <div className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.home.cardProgressTitle}</h3>
              <p className="text-gray-600 mb-6">{t.home.cardProgressBody}</p>
              <div className="flex items-center gap-4">
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition">
                  {t.home.cardProgressView}
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
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">{t.home.careerPathTitle}</h2>
          <p className="text-gray-600">{t.home.careerPathSub}</p>
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
              {tab === "job" ? t.home.tabJob : tab === "higher_study" ? t.home.tabHigher : t.home.tabEnt}
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
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition">{t.home.previewInterested}</button>
                  <Link
                    href="/career-options"
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-bold transition text-center"
                  >
                    {t.home.previewGuidance}
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.home.learningResources}</h2>
            <Link href="#" className="text-blue-600 hover:text-blue-700 font-bold text-sm">{t.home.seeAll}</Link>
          </div>
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource.id} className="group bg-white rounded-xl p-5 shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                <div className="text-4xl mb-3 group-hover:scale-110 transition">{resource.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg">{resource.title}</h3>
                <div className="flex gap-2 mt-3 text-xs font-medium text-gray-600">
                  {resource.type.map(tag => (
                    <span key={`${resource.id}-${tag}`} className="bg-gray-100 px-2 py-1 rounded">• {tag}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">{t.home.learnersLabel(resource.learners)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mentors — scoped to the same career track as Career Path Preview (job / higher study / entrepreneurship) */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t.home.mentorsTrackTitle}</h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {t.home.mentorsTrackSub(mentorTrackLabel)}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {mentors.map(mentor => (
              <div
                key={mentor.id}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 text-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition"></div>
                <div className="relative">
                  {mentor.demo && (
                    <span className="absolute top-0 right-0 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded-bl-lg rounded-tr-xl">
                      {t.home.sample}
                    </span>
                  )}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition">
                    {mentor.image}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{mentor.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{mentor.headline}</p>
                  {careerLabels(mentor.careerIds).length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {careerLabels(mentor.careerIds).map(label => (
                        <span
                          key={`${mentor.id}-${label}`}
                          className="text-[11px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-100"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-center items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">★</span>
                    ))}
                    <span className="text-xs text-gray-600 ml-2">{mentor.rating} • {mentor.reviews}</span>
                  </div>
                  {mentor.recommended && (
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                      {t.home.highlyRecommended}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition mb-2"
                  >
                    {t.home.viewProfile}
                  </button>
                  {(() => {
                    const status = requestStatuses[mentor.email.toLowerCase()] || "none"
                    const isLoadingReq = !!requestLoadingByMentor[mentor.email.toLowerCase()]
                    if (mentor.demo || !mentor.email) {
                      return (
                        <p className="text-xs text-gray-500 mt-1">
                          {t.home.sampleProfileHint}
                        </p>
                      )
                    }
                    if (!user || user.type !== "student") {
                      return (
                        <button
                          onClick={() => setIsAuthOpen(true)}
                          className="w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-lg border border-gray-300 hover:bg-gray-200 transition"
                        >
                          {t.home.loginToConnect}
                        </button>
                      )
                    }
                    if (status === "accepted") {
                      return (
                        <button
                          onClick={() => setSelectedMentor(mentor)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition"
                        >
                          {t.home.chatNow}
                        </button>
                      )
                    }
                    if (status === "pending") {
                      return (
                        <button
                          disabled
                          className="w-full bg-yellow-100 text-yellow-800 font-bold py-2 rounded-lg border border-yellow-300 cursor-not-allowed"
                        >
                          {t.home.requestPending}
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
                          {isLoadingReq ? t.home.sending : t.home.requestAgain}
                        </button>
                      )
                    }
                    return (
                      <button
                        onClick={() => sendConnectionRequest(mentor.email)}
                        disabled={isLoadingReq}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition disabled:opacity-60"
                      >
                        {isLoadingReq ? t.home.sending : t.home.requestToConnect}
                      </button>
                    )
                  })()}
                </div>
              </div>
            ))}
            {mentors.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-md">
                {t.home.noMentors}
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
          <p className="text-sm mb-4">{t.home.footerTagline}</p>
          <p className="text-xs text-gray-500">{t.home.footerRights}</p>
        </div>
      </footer>

      {/* Auth Modal - Rendered at page level for full-page blur */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Mentor Profile Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 sm:p-8 my-auto relative max-h-[90vh] overflow-y-auto">
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
            <p className="text-gray-600 text-center mb-2">{selectedMentor.headline}</p>
            {careerLabels(selectedMentor.careerIds).length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                {careerLabels(selectedMentor.careerIds).map(label => (
                  <span
                    key={label}
                    className="text-[11px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-100"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="flex justify-center items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">★</span>
              ))}
              <span className="text-sm text-gray-600 ml-2">{selectedMentor.rating} {t.home.mentorModal.reviews(selectedMentor.reviews)}</span>
            </div>

            {/* Badge */}
            {selectedMentor.recommended && (
              <div className="text-center mb-4">
                <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 text-xs font-bold px-4 py-2 rounded-full">
                  {t.home.highlyRecommended}
                </span>
              </div>
            )}

            {selectedMentor.demo && (
              <p className="text-center text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg py-2 px-3 mb-4">
                {t.home.mentorModal.sampleBanner}
              </p>
            )}

            <div className="space-y-4 mb-6 text-left">
              {selectedMentor.education.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/80">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">{t.home.mentorModal.education}</h3>
                  <ul className="space-y-2">
                    {selectedMentor.education.map((ed, i) => (
                      <li key={`${ed.degree}-${i}`} className="text-sm text-gray-700">
                        <span className="font-semibold text-gray-900">{ed.degree}</span>
                        <span className="text-gray-600"> — {ed.institution}</span>
                        {ed.year ? <span className="text-gray-500"> ({ed.year})</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMentor.currentJob && (
                <div className="border border-gray-100 rounded-xl p-4 bg-white">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">{t.home.mentorModal.currentRole}</h3>
                  <p className="text-sm text-gray-900 font-semibold">{selectedMentor.currentJob.title}</p>
                  <p className="text-sm text-gray-600">{selectedMentor.currentJob.company}</p>
                </div>
              )}

              {selectedMentor.experience.length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/80">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">{t.home.mentorModal.experience}</h3>
                  <ul className="space-y-3">
                    {selectedMentor.experience.map((ex, i) => (
                      <li key={`${ex.title}-${i}`} className="text-sm border-l-2 border-indigo-200 pl-3">
                        <p className="font-semibold text-gray-900">{ex.title}</p>
                        <p className="text-gray-600">{ex.organization} · {ex.period}</p>
                        {ex.summary ? <p className="text-gray-600 mt-1">{ex.summary}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedMentor.bio ? (
                <div className="border border-gray-100 rounded-xl p-4 bg-white">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">{t.home.mentorModal.about}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedMentor.bio}</p>
                </div>
              ) : null}

              {selectedMentor.expertise.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">{t.home.mentorModal.expertise}</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise.map(skill => (
                      <span key={skill} className="text-xs font-medium bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Buttons */}
            {(selectedMentor.zoomLink || selectedMentor.meetLink) ? (
              <div className="flex gap-3 mb-6">
                {selectedMentor.zoomLink ? (
                  <a
                    href={selectedMentor.zoomLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition text-center"
                  >
                    Zoom
                  </a>
                ) : null}
                {selectedMentor.meetLink ? (
                  <a
                    href={selectedMentor.meetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition text-center"
                  >
                    Meet
                  </a>
                ) : null}
              </div>
            ) : null}

            {/* Chat */}
            <div className="rounded-lg border border-gray-200 p-3">
            <div className="h-44 sm:h-48 overflow-y-auto bg-gray-50 rounded-md p-3 space-y-2 mb-3">
                {selectedMentor.demo || !selectedMentor.email ? (
                  <p className="text-sm text-gray-600">{t.home.mentorModal.chatRegistered}</p>
                ) : !user ? (
                  <p className="text-sm text-gray-600">{t.home.mentorModal.loginStudentChat}</p>
                ) : (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted" ? (
                  <p className="text-sm text-gray-600">
                    {t.home.mentorModal.chatAfterAccept}
                  </p>
                ) : chatLoading ? (
                  <p className="text-sm text-gray-500">{t.home.mentorModal.loadingMessages}</p>
                ) : chatMessages.length === 0 ? (
                  <p className="text-sm text-gray-500">{t.home.mentorModal.noMessages}</p>
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
                      <p className="font-semibold">{msg.senderType === "student" ? t.home.mentorModal.you : selectedMentor.name}</p>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder={user ? t.home.mentorModal.placeholderChat : t.home.mentorModal.placeholderLogin}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={
                    !user ||
                    chatSending ||
                    selectedMentor.demo ||
                    !selectedMentor.email ||
                    (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted"
                  }
                />
                <button
                  onClick={sendMessage}
                  disabled={
                    !user ||
                    chatSending ||
                    !chatInput.trim() ||
                    selectedMentor.demo ||
                    !selectedMentor.email ||
                    (requestStatuses[selectedMentor.email.toLowerCase()] || "none") !== "accepted"
                  }
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {chatSending ? t.home.mentorModal.sending : t.home.mentorModal.send}
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

