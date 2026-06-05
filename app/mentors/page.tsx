"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"
import AuthModal from "../components/AuthModal"
import { careerDetails } from "../explore-careers/careerDetailsData"

interface Education {
  degree: string
  institution: string
  year?: string
}

interface Experience {
  title: string
  organization: string
  period: string
  summary?: string
}

interface Mentor {
  id: string
  demo?: boolean
  email: string
  name: string
  headline: string
  careerIds: string[]
  education: Education[]
  currentJob: { title: string; company: string } | null
  experience: Experience[]
  bio: string
  rating: number
  reviews: number
  recommended: boolean
  expertise: string[]
  zoomLink?: string
  meetLink?: string
}

type ConnectionStatus = "none" | "pending" | "accepted" | "rejected"

// Custom SVGs
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  )
}

function AssessmentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function MentorsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function RoadmapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ResourcesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function MentorsContent() {
  const { user } = useUser()
  const { lang, t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  // Mentors list and request status states
  const [mentorsList, setMentorsList] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [requestStatuses, setRequestStatuses] = useState<Record<string, ConnectionStatus>>({})
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({})

  // Modal and filters
  const [selectedMentorProfile, setSelectedMentorProfile] = useState<Mentor | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<"all" | "job" | "higher_study" | "entrepreneurship">("all")

  // Query parameter pre-selections
  const initialCareerSearch = searchParams.get("career") || ""

  useEffect(() => {
    setIsMounted(true)
    if (initialCareerSearch) {
      setSearchQuery(initialCareerSearch)
    }
  }, [initialCareerSearch])

  // Fetch all mentors
  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true)
        const res = await fetch("/api/mentorship?action=mentors")
        const data = await res.json()
        if (res.ok && data?.mentors) {
          setMentorsList(data.mentors)
        }
      } catch (err) {
        console.error("Failed to load mentors", err)
      } finally {
        setLoading(false)
      }
    }
    loadMentors()
  }, [])

  // Fetch connection request statuses for the logged in student
  useEffect(() => {
    async function loadRequestStatuses() {
      if (!user?.email || user.type !== "student") return
      try {
        const res = await fetch(`/api/mentorship?action=request-statuses&studentEmail=${encodeURIComponent(user.email)}`)
        const data = await res.json()
        if (res.ok && data?.statuses) {
          const statuses: Record<string, ConnectionStatus> = {}
          data.statuses.forEach((item: { mentorEmail: string; status: ConnectionStatus }) => {
            statuses[item.mentorEmail.toLowerCase()] = item.status
          })
          setRequestStatuses(statuses)
        }
      } catch (err) {
        console.error("Failed to load request statuses", err)
      }
    }
    if (user?.email) {
      loadRequestStatuses()
    }
  }, [user])

  // Handle connection request trigger
  async function handleConnect(mentorEmail: string) {
    if (!user) {
      setIsAuthOpen(true)
      return
    }
    if (user.type !== "student") {
      alert(lang === 'bn' ? "শুধুমাত্র শিক্ষার্থীরা সংযোগ করতে পারে।" : "Only students can initiate connections.")
      return
    }
    
    const key = mentorEmail.toLowerCase()
    setActionLoading(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-request",
          studentEmail: user.email,
          mentorEmail: key,
        })
      })
      const data = await res.json()
      if (res.ok && data?.status) {
        setRequestStatuses(prev => ({ ...prev, [key]: data.status as ConnectionStatus }))
      }
    } catch (err) {
      console.error("Failed to send request", err)
    } finally {
      setActionLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  // Filter and search computation
  const filteredMentors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const selectedCareer = query
      ? Object.values(careerDetails).find(
          c => c.title.toLowerCase() === query ||
               c.title.toLowerCase().includes(query) ||
               query.includes(c.title.toLowerCase())
        )
      : null

    return mentorsList.filter(mentor => {
      // 1. Search Query Match (checks for matching careerIds if matching career is found, else falls back to text search)
      const matchesSearch = selectedCareer
        ? mentor.careerIds.includes(selectedCareer.id)
        : (query === "" ||
          mentor.name.toLowerCase().includes(query) ||
          mentor.headline.toLowerCase().includes(query) ||
          mentor.expertise.some(tag => tag.toLowerCase().includes(query)))

      // 2. Category Match
      let matchesCategory = true
      if (activeCategory !== "all") {
        // We match via career category lookup or direct keywords
        const mentorCareersLower = mentor.headline.toLowerCase()
        if (activeCategory === "job") {
          matchesCategory = mentorCareersLower.includes("software") || mentorCareersLower.includes("developer") || mentorCareersLower.includes("data scientist") || mentorCareersLower.includes("devops")
        } else if (activeCategory === "higher_study") {
          matchesCategory = mentorCareersLower.includes("ux") || mentorCareersLower.includes("design") || mentorCareersLower.includes("academic")
        } else if (activeCategory === "entrepreneurship") {
          matchesCategory = mentorCareersLower.includes("founder") || mentorCareersLower.includes("ceo") || mentorCareersLower.includes("product")
        }
      }

      return matchesSearch && matchesCategory
    })
  }, [mentorsList, searchQuery, activeCategory])

  // Helper styles for connection states
  function getConnectionButtonProps(mentorEmail: string): { text: string; className: string; disabled: boolean } {
    const status = requestStatuses[mentorEmail.toLowerCase()] || "none"
    const isLoading = actionLoading[mentorEmail.toLowerCase()]
    
    if (isLoading) {
      return {
        text: lang === 'bn' ? "লোডিং..." : "Connecting...",
        className: "bg-slate-300 text-slate-600 border border-slate-300 px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 cursor-not-allowed",
        disabled: true
      }
    }

    if (status === "pending") {
      return {
        text: lang === 'bn' ? "পেন্ডিং" : "Pending",
        className: "bg-amber-50 text-amber-700 border border-amber-200 px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 cursor-not-allowed text-center",
        disabled: true
      }
    }
    
    if (status === "accepted") {
      return {
        text: lang === 'bn' ? "বার্তা পাঠান" : "Chat",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 text-center active:scale-95 transition cursor-pointer",
        disabled: false
      }
    }

    return {
      text: lang === 'bn' ? "কানেক্ট করুন" : "Connect",
      className: "bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 text-center active:scale-95 transition cursor-pointer",
      disabled: false
    }
  }

  // Get dynamic mentorship style matching role
  function getMentorshipStyle(headline: string) {
    const lower = headline.toLowerCase()
    if (lower.includes("google") || lower.includes("software") || lower.includes("devops")) {
      return lang === 'bn' ? "টেকনিক্যাল এবং বিশ্লেষণাত্মক" : "Friendly & Supportive"
    }
    if (lower.includes("microsoft") || lower.includes("manager") || lower.includes("founder")) {
      return lang === 'bn' ? "অনুপ্রেরণামূলক এবং ব্যবহারিক" : "Motivational & Practical"
    }
    return lang === 'bn' ? "সহযোগিতাপূর্ণ এবং দিকনির্দেশনামূলক" : "Technical & Detail-Oriented"
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20 shrink-0">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="text-2xl">🚀</div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <DashboardIcon />
            <span>{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</span>
          </Link>
          
          <Link href="/assessment" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <AssessmentIcon />
            <span>{lang === 'bn' ? "মূল্যায়ন" : "Assessment"}</span>
          </Link>

          <Link href="/explore-careers" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <ExploreIcon />
            <span>{lang === 'bn' ? "ক্যারিয়ার সমূহ" : "Explore Careers"}</span>
          </Link>

          <Link href="/mentors" className="flex items-center gap-3.5 px-4 py-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 rounded-xl font-semibold transition duration-200">
            <MentorsIcon />
            <span>{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</span>
          </Link>

          <Link href="/goals" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <GoalsIcon />
            <span>{lang === 'bn' ? "লক্ষ্যসমূহ" : "Goals"}</span>
          </Link>

          <Link href="/roadmap" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <RoadmapIcon />
            <span>{lang === 'bn' ? "রোডম্যাপ" : "Roadmap"}</span>
          </Link>

          <Link href="/explore-careers" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <ResourcesIcon />
            <span>{lang === 'bn' ? "শেখার সম্পদ" : "Resources"}</span>
          </Link>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <div className="flex items-center gap-3.5">
              <MessagesIcon />
              <span>{lang === 'bn' ? "বার্তা" : "Messages"}</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md">3</span>
          </button>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium text-left transition duration-200">
            <ProfileIcon />
            <span>{lang === 'bn' ? "প্রোফাইল" : "Profile"}</span>
          </button>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium text-left transition duration-200">
            <SettingsIcon />
            <span>{lang === 'bn' ? "সেটিংস" : "Settings"}</span>
          </button>
        </nav>

        {/* Upgrade Card at Bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 text-white rounded-2xl relative overflow-hidden shadow-lg shadow-blue-100">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <span className="text-lg">👑</span>
            </div>
            <h4 className="font-bold text-sm mb-1">{lang === 'bn' ? "প্রিমিয়াম আপডেট" : "Upgrade to Premium"}</h4>
            <p className="text-white/80 text-xs mb-4 leading-relaxed">
              {lang === 'bn' ? "উন্নত ফিচার এবং ব্যক্তিগত গাইডেন্স আনলক করুন।" : "Unlock advanced features and personalized guidance."}
            </p>
            <button 
              onClick={() => setIsPremiumModalOpen(true)}
              className="w-full bg-white text-indigo-700 font-bold py-2 rounded-xl text-xs shadow-md hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              {lang === 'bn' ? "এখনই আপডেট করুন" : "Upgrade Now"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP HEADER */}
        <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="lg:hidden flex items-center gap-2.5 font-bold text-lg">
              <span className="text-2xl">🚀</span>
              <span className="text-slate-900">CareerLeader</span>
            </Link>

            {/* Breadcrumb path for desktop */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>{lang === 'bn' ? "হোম" : "Home"}</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
              <Link href="/explore-careers" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
              <Link href="/mentors" className="text-sm font-semibold text-blue-600 transition">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <LanguageToggle />

            <div className="relative">
              <button 
                onClick={() => setIsPremiumModalOpen(true)}
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition duration-150 active:scale-95"
              >
                <BellIcon />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
            </div>

            {/* User Avatar */}
            <div className="relative shrink-0">
              {user ? (
                <button 
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold flex items-center justify-center hover:bg-slate-200 hover:border-slate-300 transition active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 3. MOBILE MENU BAR */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2.5 z-10">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
            <Link href="/assessment" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার মূল্যায়ন" : "Career Assessment"}</Link>
            <Link href="/explore-careers" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
            <Link href="/mentors" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 bg-blue-50 font-semibold rounded-lg">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <button 
              onClick={() => { setMobileMenuOpen(false); setIsPremiumModalOpen(true) }}
              className="w-full text-left px-4 py-2.5 text-amber-600 hover:bg-amber-50 font-bold rounded-lg flex items-center gap-2"
            >
              👑 {lang === 'bn' ? "প্রিমিয়াম আপডেট" : "Upgrade Premium"}
            </button>
          </div>
        )}

        {/* 4. MAIN PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-4xl mx-auto w-full">
          
          <div className="space-y-8">
            
            {/* Header Details card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden text-left">
              <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
              
              <div className="relative space-y-4">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {lang === 'bn' ? "৪. মেন্টর ম্যাচিং" : "4. Mentor Matching"}
                </span>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "আপনার জন্য মেন্টরবৃন্দ" : "Mentors For You"}
                </h1>
                
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {lang === 'bn' 
                    ? "আপনার পছন্দের ক্যারিয়ারে অভিজ্ঞ মেন্টরদের সাথে সংযুক্ত হোন।" 
                    : "Connect with experienced mentors in your interested career."
                  }
                  {searchQuery && (
                    <span className="font-bold text-indigo-600">
                      {" "}{lang === 'bn' ? `(${searchQuery}-এ আপনার আগ্রহের ভিত্তিতে)` : `(Based on your interest in ${searchQuery})`}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lang === 'bn' ? "মেন্টরের নাম বা দক্ষতা দিয়ে খুঁজুন..." : "Search by name or skills (e.g. React)..."}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Toggles */}
              <div className="flex bg-slate-200/60 p-1.5 rounded-2xl gap-1 shrink-0 w-full sm:w-auto">
                {([
                  { key: 'all', label: lang === 'bn' ? "সব" : "All" },
                  { key: 'job', label: lang === 'bn' ? "চাকরি" : "Job" },
                  { key: 'higher_study', label: lang === 'bn' ? "উচ্চশিক্ষা" : "Study" },
                  { key: 'entrepreneurship', label: lang === 'bn' ? "উদ্যোক্তা" : "Startup" }
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                      activeCategory === tab.key
                        ? "bg-white text-slate-800 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mentors list */}
            {loading ? (
              <div className="py-12 text-center text-slate-500 font-medium">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                <p>{lang === 'bn' ? "মেন্টর তালিকা লোড হচ্ছে..." : "Loading recommended mentors..."}</p>
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                <span className="text-5xl block mb-4">👥</span>
                <p className="font-bold text-base mb-1">{lang === 'bn' ? "কোনো মেন্টর পাওয়া যায়নি" : "No mentors matched your search"}</p>
                <p className="text-xs">{lang === 'bn' ? "অনুগ্রহ করে অন্য কি-ওয়ার্ড বা ফিল্টার দিয়ে ট্রাই করুন।" : "Try clearing your search query or choosing another category."}</p>
                <button
                  onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                  className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  {lang === 'bn' ? "সব মেন্টর প্রদর্শন করুন" : "Show All Mentors"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMentors.map((mentor) => {
                  const btnProps = getConnectionButtonProps(mentor.email)
                  const styleLabel = getMentorshipStyle(mentor.headline)
                  return (
                    <div 
                      key={mentor.id}
                      className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden group text-left"
                    >

                      {/* Mentor Profile Image/Initials */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md relative">
                          {mentor.name.charAt(0).toUpperCase()}
                        </div>
                        {/* Active status indicator dot */}
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Info & Details block */}
                      <div className="flex-1 space-y-3 min-w-0 text-center sm:text-left">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                            {mentor.name}
                          </h3>
                          <p className="text-slate-600 text-sm font-semibold">
                            {mentor.headline}
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-1 text-xs font-bold text-amber-500">
                            <span>★</span>
                            <span>{mentor.rating}</span>
                            <span className="text-slate-400 font-medium ml-1">({mentor.reviews} {lang === 'bn' ? "সেশন" : "sessions"})</span>
                          </div>
                        </div>

                        {/* Expertise tags */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                          {mentor.expertise.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] font-bold bg-indigo-50/60 text-indigo-700 border border-indigo-100/50 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Mentorship Style */}
                        <p className="text-xs text-slate-500 font-medium">
                          <span className="font-extrabold text-slate-600">{lang === 'bn' ? "মেন্টরশিপ স্টাইল: " : "Mentorship Style: "}</span>
                          {styleLabel}
                        </p>
                      </div>

                      {/* Action buttons (Right) */}
                      <div className="flex flex-row sm:flex-col items-center justify-center sm:justify-start gap-4 w-full sm:w-auto shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {btnProps.disabled ? (
                          <button
                            disabled
                            className={btnProps.className}
                          >
                            {btnProps.text}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (requestStatuses[mentor.email.toLowerCase()] === "accepted") {
                                router.push("/"); // Redirect to messaging if already accepted
                              } else {
                                handleConnect(mentor.email);
                              }
                            }}
                            className={btnProps.className}
                          >
                            {btnProps.text}
                          </button>
                        )}

                        <button 
                          onClick={() => setSelectedMentorProfile(mentor)}
                          className="w-32 text-center text-xs font-bold text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-indigo-600 transition py-2.5 rounded-xl active:scale-95 cursor-pointer shrink-0"
                        >
                          {lang === 'bn' ? "প্রোফাইল দেখুন" : "View Profile"}
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}

            {/* Bottom View More indicator */}
            {!loading && filteredMentors.length > 0 && (
              <div className="pt-6 border-t border-slate-200/60 flex justify-center">
                <button
                  onClick={() => alert(lang === 'bn' ? "আরও মেন্টর শীঘ্রই যুক্ত করা হবে!" : "More mentors are loaded dynamically!")}
                  className="font-extrabold text-xs text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{lang === 'bn' ? "আরও মেন্টরবৃন্দ দেখুন" : "View More Mentors"}</span>
                  <span>→</span>
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* 5. MENTOR PROFILE MODAL (PREMIUM DETAILS DIALOG) */}
      {selectedMentorProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto border border-slate-100 text-left">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedMentorProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center transition active:scale-90"
            >
              ✕
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-black text-xl flex items-center justify-center shadow">
                {selectedMentorProfile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                  ★ {selectedMentorProfile.rating} ({selectedMentorProfile.reviews} {lang === 'bn' ? "রিভিউ" : "reviews"})
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mt-1">{selectedMentorProfile.name}</h3>
                <p className="text-slate-500 text-xs font-semibold">{selectedMentorProfile.headline}</p>
              </div>
            </div>

            {/* Profile Content Body */}
            <div className="space-y-6 text-sm text-slate-700">
              
              {/* Bio section */}
              {selectedMentorProfile.bio && (
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">{lang === 'bn' ? "জীবনবৃত্তান্ত" : "Bio"}</h4>
                  <p className="leading-relaxed text-slate-600 text-xs">{selectedMentorProfile.bio}</p>
                </div>
              )}

              {/* Work Experience */}
              {selectedMentorProfile.experience && selectedMentorProfile.experience.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{lang === 'bn' ? "কর্ম অভিজ্ঞতা" : "Experience"}</h4>
                  <div className="relative pl-4 border-l border-slate-100 space-y-4 ml-1">
                    {selectedMentorProfile.experience.map((exp, idx) => (
                      <div key={idx} className="relative group text-xs">
                        <div className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full border border-indigo-500 bg-white"></div>
                        <h5 className="font-bold text-slate-900">{exp.title}</h5>
                        <p className="text-slate-500 font-semibold">{exp.organization} • <span className="text-[10px]">{exp.period}</span></p>
                        {exp.summary && <p className="text-slate-500 mt-1 leading-relaxed">{exp.summary}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedMentorProfile.education && selectedMentorProfile.education.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{lang === 'bn' ? "শিক্ষাগত যোগ্যতা" : "Education"}</h4>
                  <div className="space-y-3 text-xs pl-1">
                    {selectedMentorProfile.education.map((edu, idx) => (
                      <div key={idx} className="flex flex-col">
                        <h5 className="font-bold text-slate-900">{edu.degree}</h5>
                        <p className="text-slate-500 font-semibold">{edu.institution} {edu.year && `• ${edu.year}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise tags */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{lang === 'bn' ? "দক্ষতা ক্ষেত্র" : "Expertise"}</h4>
                <div className="flex flex-wrap gap-1.5 pl-1">
                  {selectedMentorProfile.expertise.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => {
                  handleConnect(selectedMentorProfile.email)
                  setSelectedMentorProfile(null)
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs shadow-md shadow-indigo-100 active:scale-95 text-center transition cursor-pointer"
              >
                {lang === 'bn' ? "কানেক্ট করুন" : "Send Connection Request"}
              </button>
              <button
                onClick={() => setSelectedMentorProfile(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 text-xs active:scale-95 transition text-center cursor-pointer"
              >
                {lang === 'bn' ? "বন্ধ করুন" : "Close Profile"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Auth Modal pop-up */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  )
}

export default function MentorsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
      </div>
    }>
      <MentorsContent />
    </Suspense>
  )
}
