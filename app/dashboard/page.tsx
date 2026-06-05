"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"
import AuthModal from "../components/AuthModal"

// Custom inline SVG icons for sidebar, header
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

export default function StudentDashboardPage() {
  const { user } = useUser()
  const { lang, t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [mockInterests, setMockInterests] = useState<string[]>([])
  const [localMbti, setLocalMbti] = useState<string>("")

  // States for recommendations matched via assessment
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [careerFitPercentage, setCareerFitPercentage] = useState<Record<string, number>>({})
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null)
  const [filterActive, setFilterActive] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setLocalMbti(localStorage.getItem("guestMbti") || "")
    }
  }, [])

  useEffect(() => {
    const activeMbti = user?.mbti || localMbti
    if (activeMbti) {
      // Simulate interests extraction
      setMockInterests(["Software Development", "Analytical Design", "Planning", "Teamwork"])
    }
  }, [user, localMbti])

  // Load recommendations if user has already taken the assessment
  useEffect(() => {
    async function fetchRecommendations() {
      const activeMbti = user?.mbti || localMbti
      if (activeMbti) {
        try {
          const res = await fetch("/api/recommend", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ personality: activeMbti })
          })
          const data = await res.json()
          if (res.ok && data?.recommendations) {
            setRecommendations(data.recommendations)
            
            // Generate fit rates (e.g. 95%, 92%, 88%, etc.)
            const fits: Record<string, number> = {}
            data.recommendations.forEach((rec: any, idx: number) => {
              fits[rec.id] = Math.max(70, 95 - idx * 3 - (idx % 2))
            })
            setCareerFitPercentage(fits)
          }
        } catch (err) {
          console.error("Failed to load recommendations on dashboard:", err)
        }
      }
    }
    const activeMbti = user?.mbti || localMbti
    if (isMounted && activeMbti) {
      fetchRecommendations()
    }
  }, [isMounted, user?.mbti, localMbti])

  const hasTakenAssessment = !!(user?.mbti || localMbti)

  const filteredRecommendations = filterActive
    ? recommendations.filter((_, idx) => idx % 2 === 0)
    : recommendations

  const topRecommendations = filteredRecommendations.slice(0, 4)
  const secondaryRecommendations = filteredRecommendations.slice(4)
  const studentName = isMounted && user ? user.name : (lang === 'bn' ? "অতিথি" : "Guest")

  // Dynamic progress summary calculations
  const totalSteps = 4
  const completedSteps = hasTakenAssessment ? 2 : 0 // Step 1 & 2 are complete if MBTI is found
  const totalProgressPercent = Math.round((completedSteps / totalSteps) * 100)

  const preparationSteps = [
    {
      id: 1,
      title: lang === 'bn' ? "১. ক্যারিয়ার মূল্যায়ন সম্পন্নকরণ" : "1. Complete Career Assessment",
      status: hasTakenAssessment ? "completed" : "pending",
      desc: lang === 'bn' ? "আপনার ব্যক্তিত্ব ও আগ্রহ নিরূপণ করুন।" : "Identify your core personality traits and interests.",
      link: "/assessment"
    },
    {
      id: 2,
      title: lang === 'bn' ? "২. ক্যারিয়ার অপশন অনুসন্ধান" : "2. Explore Career Matches",
      status: hasTakenAssessment ? "completed" : "pending",
      desc: lang === 'bn' ? "আপনার উপযুক্ত ৩টি প্রস্তাবিত পথ বিস্তারিত দেখুন।" : "View and analyze your recommended paths.",
      link: "/assessment"
    },
    {
      id: 3,
      title: lang === 'bn' ? "৩. মেন্টরের সাথে সংযোগ স্থাপন" : "3. Connect with Mentors",
      status: "pending",
      desc: lang === 'bn' ? "আপনার ক্যারিয়ার ট্র্যাকের একজন মেন্টরকে অনুরোধ পাঠান।" : "Request mentorship session with industry leaders.",
      link: "/mentors"
    },
    {
      id: 4,
      title: lang === 'bn' ? "৪. দক্ষতা উন্নয়নের কোর্সসমূহ" : "4. Start Skill Development",
      status: "pending",
      desc: lang === 'bn' ? "প্রস্তাবিত রিসোর্স ব্যবহার করে শেখা শুরু করুন।" : "Enrol in recommended video courses & tutorials.",
      link: "/explore-careers"
    }
  ]

  // Enrolled Courses progress bars
  const skillCourses = [
    { id: 1, name: "Python Programming Foundations", progress: 45, completed: 9, total: 20, icon: "🐍" },
    { id: 2, name: "Web Development Foundations (HTML/CSS/JS)", progress: 20, completed: 5, total: 25, icon: "🌐" }
  ]

  // Active mentor connection widget
  const connectedMentors = [
    { id: "m1", name: "Sarah Ahmed", headline: "Senior Software Engineer at Google", icon: "S", active: true },
    { id: "m2", name: "Dr. Mostafizur Rahman", headline: "Associate Professor, CSE Dept", icon: "M", active: true }
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20 shrink-0">
        
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="text-2xl">🚀</div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-4 py-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 rounded-xl font-semibold transition duration-200">
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

          <Link href="/mentors" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
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
          <div className="p-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl relative overflow-hidden shadow-lg shadow-blue-100">
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
              className="w-full bg-white text-blue-700 font-bold py-2 rounded-xl text-xs shadow-md hover:bg-slate-50 transition active:scale-95"
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
          
          {/* Mobile navigation toggle */}
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
              <span className="text-blue-600 font-semibold">{lang === 'bn' ? "স্টুডেন্ট ড্যাশবোর্ড" : "Student Dashboard"}</span>
            </div>
          </div>

          {/* Quick links, Notifications, User Avatar */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
              <Link href="/explore-careers" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
              <Link href="/mentors" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <LanguageToggle />

            {/* Notification Bell */}
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
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95"
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
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 bg-blue-50 font-semibold rounded-lg">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
            <Link href="/assessment" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার মূল্যায়ন" : "Career Assessment"}</Link>
            <Link href="/explore-careers" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
            <Link href="/mentors" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
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
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl mx-auto w-full">
          
          <div className="space-y-6 sm:space-y-8">
            
            {/* Header Greeting */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {lang === 'bn' ? `স্বাগতম, ${studentName}! 👋` : `Welcome Back, ${studentName}! 👋`}
              </h1>
              <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                {lang === 'bn' ? "আপনার ক্যারিয়ার প্রস্তুতি ট্র্যাক করুন এবং পরবর্তী ধাপের নির্দেশনা দেখুন।" : "Track your career preparation journey and prepare for the next steps."}
              </p>
            </div>

            {/* Main Widgets Grid */}
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              
              {/* Left Column: Assessment & Prep steps */}
              <div className="lg:col-span-2 space-y-6">
                
                {hasTakenAssessment ? (
                  /* PERSONAL CAREER SUMMARY CARD (Assessment Completed) */
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                          ✨ {lang === 'bn' ? "ব্যক্তিত্ব ধরন ও আগ্রহ" : "Personality & Interests"}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                          {lang === 'bn' ? "ব্যক্তিত্ব মূল্যায়ন সম্পন্ন হয়েছে" : "Career Assessment Completed"}
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm max-w-md leading-relaxed">
                          {lang === 'bn' 
                            ? "আপনার ব্যক্তিত্ব ধরণ এবং আগ্রহের উপর ভিত্তি করে ক্যারিয়ার ম্যাচগুলি প্রস্তুত রয়েছে।" 
                            : "Your career matches based on personality and interests are ready to view."
                          }
                        </p>
                        {mockInterests.length > 0 && (
                          <div className="flex gap-2 flex-wrap pt-2">
                            {mockInterests.map(interest => (
                              <span key={interest} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-xs border border-slate-200">
                                ✨ {interest}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="pt-2">
                          <Link 
                            href="/explore-careers"
                            className="inline-flex justify-center items-center py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 text-xs"
                          >
                            {lang === 'bn' ? "ক্যারিয়ার সুপারিশসমূহ দেখুন →" : "View Career Matches →"}
                          </Link>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-5 rounded-2xl text-center text-white shadow-lg shadow-blue-100 shrink-0 flex flex-col justify-center items-center">
                        <p className="text-blue-100 text-[10px] font-bold tracking-wider uppercase mb-0.5">{lang === 'bn' ? "ব্যক্তিত্ব ধরন" : "MBTI Type"}</p>
                        <h3 className="text-2xl font-black tracking-tight">{user?.mbti || localMbti || "ESTJ"}</h3>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Assessment Pending CTA Card */
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0.5 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                    <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <span className="inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700">
                          {lang === 'bn' ? "মূল্যায়ন বাকি" : "Assessment Pending"}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                          {lang === 'bn' ? "ব্যক্তিত্ব ও ক্যারিয়ার মূল্যায়ন শুরু করুন" : "Take Your Personality Assessment"}
                        </h2>
                        <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                          {lang === 'bn' ? "মাত্র ৫ মিনিটে আপনার আদর্শ ক্যারিয়ার পথ খুঁজে বের করুন।" : "Discover your ideal career path based on personality traits and interests in 5 mins."}
                        </p>
                      </div>
                      <Link 
                        href="/assessment" 
                        className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 text-sm"
                      >
                        {lang === 'bn' ? "মূল্যায়ন শুরু করুন" : "Start Assessment"}
                      </Link>
                    </div>
                  </div>
                )}

                {/* 2. Career Preparation Progress Steps */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {/* Progress Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                        {lang === 'bn' ? "ক্যারিয়ার প্রস্তুতি অগ্রগতি" : "Career Preparation Progress"}
                      </h3>
                      <p className="text-slate-400 text-xs font-semibold mt-0.5">
                        {lang === 'bn' ? "আপনার ক্যারিয়ার ট্র্যাকের মোট ধাপসমূহ" : "Step-by-step career readiness checklist"}
                      </p>
                    </div>
                    <span className="font-black text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-xl text-sm shadow-sm shadow-blue-100 shrink-0">
                      {totalProgressPercent}% {lang === 'bn' ? "সম্পন্ন" : "Complete"}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${totalProgressPercent}%` } as React.CSSProperties}
                    ></div>
                  </div>

                  {/* Steps Checklist */}
                  <div className="space-y-4 pt-2">
                    {preparationSteps.map(step => {
                      const isComplete = step.status === "completed"
                      return (
                        <div 
                          key={step.id} 
                          className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition duration-200 ${
                            isComplete 
                              ? 'border-emerald-100 bg-emerald-50/20' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            {/* Bullet icon */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                              isComplete 
                                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {isComplete ? "✓" : step.id}
                            </div>
                            <div className="min-w-0">
                              <h4 className={`font-bold text-sm ${isComplete ? 'text-emerald-900' : 'text-slate-800'}`}>
                                {step.title}
                              </h4>
                              <p className={`text-xs mt-0.5 leading-relaxed ${isComplete ? 'text-emerald-700/85' : 'text-slate-500'}`}>
                                {step.desc}
                              </p>
                            </div>
                          </div>
                          
                          {/* Navigation target trigger */}
                          <div className="shrink-0 pt-1">
                            {isComplete ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">✓</span>
                            ) : (
                              <Link 
                                href={step.link} 
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center"
                              >
                                {lang === 'bn' ? "শুরু করুন ›" : "Start ›"}
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Courses & Mentor Connections widget */}
              <div className="space-y-6">
                
                {/* 3. Skill Development widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {lang === 'bn' ? "চলমান দক্ষতামূলক কোর্স" : "Enrolled Skill Courses"}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">
                      {lang === 'bn' ? "শেখার অগ্রগতি এবং কোর্স পরিমাপ" : "Track learning resources and lessons"}
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {skillCourses.map(course => (
                      <div key={course.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl shrink-0">{course.icon}</span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">{course.name}</h4>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {course.completed} of {course.total} lessons complete
                            </span>
                          </div>
                        </div>

                        {/* Prog bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                            <span>{lang === 'bn' ? "অগ্রগতি" : "Progress"}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all" 
                              style={{ width: `${course.progress}%` } as React.CSSProperties}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link 
                    href="/explore-careers" 
                    className="block text-center font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline pt-2"
                  >
                    {lang === 'bn' ? "আরও শিক্ষণ রিসোর্স খুঁজুন →" : "Browse More Learning Resources →"}
                  </Link>
                </div>

                {/* 4. Active Mentor Connection widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {lang === 'bn' ? "সংযুক্ত মেন্টরবৃন্দ" : "Your Connected Mentors"}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">
                      {lang === 'bn' ? "১-অন-১ সরাসরি সহায়তা প্রদানকারী" : "Direct lines for career counseling"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {connectedMentors.map(mentor => (
                      <div key={mentor.id} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-150">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar Circle */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                            {mentor.icon}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">{mentor.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate font-semibold mt-0.5">{mentor.headline}</p>
                          </div>
                        </div>

                        {/* Action trigger */}
                        <button 
                          onClick={() => setIsPremiumModalOpen(true)}
                          className="shrink-0 text-[11px] font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition active:scale-95 cursor-pointer"
                        >
                          {lang === 'bn' ? "চ্যাট" : "Chat"}
                        </button>
                      </div>
                    ))}
                  </div>

                  <Link 
                    href="/mentors" 
                    className="block text-center font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline pt-2"
                  >
                    {lang === 'bn' ? "নতুন মেন্টরদের অনুরোধ করুন →" : "Connect with More Mentors →"}
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </main>
      </div>

      {/* 5. PREMIUM MODAL */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 relative">
            <button
              onClick={() => setIsPremiumModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition active:scale-90"
            >
              ✕
            </button>
            <span className="text-5xl block mb-4">👑</span>
            <h3 className="text-xl font-black text-slate-900">{lang === 'bn' ? "প্রিমিয়াম ফিচার আপডেট" : "Premium Feature"}</h3>
            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
              {lang === 'bn' 
                ? "এই ফিচারটি শুধুমাত্র প্রিমিয়াম মেম্বারদের জন্য প্রযোজ্য। প্রিমিয়াম অ্যাকাউন্টের মাধ্যমে আপনি পাবেন ১-অন-১ সরাসরি মেন্টর চ্যাট, কাস্টম রোডম্যাপ ট্র্যাকিং এবং বিশদ ক্যারিয়ার প্রস্তুত গাইডলাইন।" 
                : "This features requires a premium subscription. Upgrading unlocks 1-on-1 mentor calls, custom roadmaps, goals logging, and 50+ detailed career paths."
              }
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={() => setIsPremiumModalOpen(false)}
                className="py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-sm shadow-md active:scale-95 transition"
              >
                {lang === 'bn' ? "প্রিমিয়ামে সাবস্ক্রাইব করুন" : "Subscribe to Premium"}
              </button>
              <button 
                onClick={() => setIsPremiumModalOpen(false)}
                className="py-2 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs active:scale-95 transition"
              >
                {lang === 'bn' ? "পরে দেখবো" : "Maybe Later"}
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




