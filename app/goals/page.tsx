"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"
import AuthModal from "../components/AuthModal"

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

// Target Illustration SVG
function TargetIllustration() {
  return (
    <svg className="w-40 h-40 mx-auto drop-shadow-xl" viewBox="0 0 200 200" fill="none">
      {/* Concentric target circles */}
      <circle cx="100" cy="100" r="80" fill="url(#gradOuter)" stroke="#E2E8F0" strokeWidth="2" />
      <circle cx="100" cy="100" r="60" fill="url(#gradMid)" stroke="#CBD5E1" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="40" fill="url(#gradInner)" stroke="#94A3B8" strokeWidth="1" />
      <circle cx="100" cy="100" r="20" fill="url(#gradBull)" />
      
      {/* Target Crosshairs */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

      {/* Target Dart / Arrow */}
      <g transform="translate(100, 100) rotate(-45) translate(-100, -100)">
        {/* Shaft */}
        <line x1="100" y1="100" x2="100" y2="180" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
        <line x1="100" y1="100" x2="100" y2="180" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
        
        {/* Feathers/Flight */}
        <path d="M90 170 L100 155 L110 170 L100 180 Z" fill="#6366F1" />
        <path d="M92 182 L100 165 L108 182 L100 190 Z" fill="#4F46E5" />

        {/* Tip (resting at center) */}
        <polygon points="96,105 100,95 104,105" fill="#312E81" />
      </g>

      {/* Tiny Sparkles around center */}
      <circle cx="120" cy="80" r="3" fill="#FBBF24" className="animate-ping" />
      <circle cx="85" cy="115" r="2" fill="#F59E0B" />
      
      <defs>
        <radialGradient id="gradOuter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#EEF2F6" />
        </radialGradient>
        <radialGradient id="gradMid" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EEF2FF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </radialGradient>
        <radialGradient id="gradInner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C7D2FE" />
          <stop offset="100%" stopColor="#A5B4FC" />
        </radialGradient>
        <radialGradient id="gradBull" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="60%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#3730A3" />
        </radialGradient>
      </defs>
    </svg>
  )
}

export default function GoalsPage() {
  const { user, setUser } = useUser()
  const { lang, t } = useLanguage()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  // Form states
  const [goalTitle, setGoalTitle] = useState("")
  const [targetDate, setTargetDate] = useState("2027-12-31")
  const [skillLevel, setSkillLevel] = useState("Beginner")
  const [whyImportant, setWhyImportant] = useState("")
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  
  // Custom tag input
  const [customTagInput, setCustomTagInput] = useState("")

  const suggestedTags = [
    "Web Development",
    "System Design",
    "Problem Solving",
    "Machine Learning",
    "Data Analysis",
    "UI/UX Design",
    "Cloud Architecture",
    "DevOps",
    "Product Strategy",
    "Mobile Development"
  ]

  // Check query parameter from career details redirect
  useEffect(() => {
    setIsMounted(true)
    
    if (user?.goal) {
      const g = user.goal
      setGoalTitle(g.title || "")
      if (g.targetDate) setTargetDate(g.targetDate)
      if (g.skillLevel) setSkillLevel(g.skillLevel)
      if (g.whyImportant) setWhyImportant(g.whyImportant)
      if (Array.isArray(g.focusAreas)) setFocusAreas(g.focusAreas)
      return
    }

    // Read goal from localStorage if it exists
    const savedGoal = localStorage.getItem("career_goal")
    if (savedGoal) {
      try {
        const parsed = JSON.parse(savedGoal)
        setGoalTitle(parsed.title || "")
        if (parsed.targetDate) setTargetDate(parsed.targetDate)
        if (parsed.skillLevel) setSkillLevel(parsed.skillLevel)
        if (parsed.whyImportant) setWhyImportant(parsed.whyImportant)
        if (Array.isArray(parsed.focusAreas)) setFocusAreas(parsed.focusAreas)
      } catch (e) {
        console.error("Error parsing saved goal", e)
      }
    } else {
      // Default initial goal
      setGoalTitle(lang === 'bn' ? "সফটওয়্যার ইঞ্জিনিয়ার হওয়া" : "Become a Software Engineer")
      setWhyImportant(lang === 'bn' 
        ? "আমি নতুন প্রযুক্তি তৈরি করতে চাই, বাস্তব সমস্যার সমাধান করতে চাই এবং টেকনোলজিতে সফল ক্যারিয়ার গড়তে চাই।" 
        : "I want to build innovative solutions, solve real-world problems and grow a successful career in tech."
      )
      setFocusAreas(["Web Development", "System Design", "Problem Solving"])
    }
  }, [lang, user])

  // Save and Submit Goal
  const handleSaveGoal = async () => {
    const goalData = {
      title: goalTitle.trim() || (lang === 'bn' ? "সফটওয়্যার ইঞ্জিনিয়ার হওয়া" : "Become a Software Engineer"),
      targetDate,
      skillLevel,
      whyImportant: whyImportant.trim(),
      focusAreas,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem("career_goal", JSON.stringify(goalData))
    
    // Also reset completion checklist states so they regenerate matching the new goal
    localStorage.removeItem("roadmap_completed_tasks")
    
    if (user?.email) {
      try {
        const res = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            type: user.type,
            goal: goalData
          })
        })
        if (res.ok) {
          setUser({ ...user, goal: goalData })
        }
      } catch (err) {
        console.error("Failed to persist goal in DB", err)
      }
    }
    
    router.push("/roadmap")
  }

  // Handle adding custom tag
  const handleAddTag = (tag: string) => {
    const cleaned = tag.trim()
    if (!cleaned) return
    if (focusAreas.includes(cleaned)) return
    setFocusAreas(prev => [...prev, cleaned])
  }

  // Handle removing tag
  const handleRemoveTag = (tag: string) => {
    setFocusAreas(prev => prev.filter(t => t !== tag))
  }

  // Estimated Duration Calculation
  const getEstimatedDurationText = () => {
    if (!targetDate) return ""
    const target = new Date(targetDate)
    const now = new Date()
    const diffTime = target.getTime() - now.getTime()
    if (diffTime <= 0) return lang === 'bn' ? "০ মাস" : "0 Months"
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.ceil(diffDays / 30)
    
    if (diffMonths < 12) {
      return lang === 'bn' ? `${diffMonths} মাস` : `${diffMonths} Months`
    } else {
      const years = (diffMonths / 12).toFixed(1)
      const formattedYears = years.endsWith(".0") ? Math.round(diffMonths / 12) : years
      return lang === 'bn' ? `${formattedYears} বছর` : `${formattedYears} Years`
    }
  }

  if (!isMounted) return null

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

          <Link href="/mentors" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <MentorsIcon />
            <span>{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</span>
          </Link>

          <Link href="/goals" className="flex items-center gap-3.5 px-4 py-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 rounded-xl font-semibold transition duration-200">
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
              <span>{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{lang === 'bn' ? "লক্ষ্য নির্ধারণ" : "Goals"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
              <Link href="/explore-careers" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
              <Link href="/mentors" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
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
            <Link href="/mentors" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            <Link href="/goals" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 bg-blue-50 font-semibold rounded-lg">{lang === 'bn' ? "লক্ষ্যসমূহ" : "Goals"}</Link>
            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "রোডম্যাপ" : "Roadmap"}</Link>
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
          
          <div className="mb-8 text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {lang === 'bn' ? "ক্যারিয়ার লক্ষ্য নির্ধারণ করুন" : "Set Your Career Goal"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {lang === 'bn' ? "আপনার লক্ষ্য নির্ধারণ করুন এবং আমরা আপনাকে তা অর্জনে সহায়তা করব।" : "Define your goal and let us help you achieve it."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Form Column (2/3 width) */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-left">
              
              {/* Goal Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? "আপনার লক্ষ্য কি?" : "What is your goal?"}
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder={lang === 'bn' ? "যেমন: সফটওয়্যার ইঞ্জিনিয়ার হওয়া" : "e.g. Become a Software Engineer"}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? "লক্ষ্য অর্জনের তারিখ" : "Target Date"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm">
                    📅
                  </span>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Skill Level */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? "বর্তমান দক্ষতা স্তর" : "Current Skill Level"}
                </label>
                <select
                  value={skillLevel}
                  onChange={e => setSkillLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition cursor-pointer"
                >
                  <option value="Beginner">{lang === 'bn' ? "নতুন (Beginner)" : "Beginner"}</option>
                  <option value="Intermediate">{lang === 'bn' ? "মধ্যবর্তী (Intermediate)" : "Intermediate"}</option>
                  <option value="Advanced">{lang === 'bn' ? "উন্নত (Advanced)" : "Advanced"}</option>
                </select>
              </div>

              {/* Why Important */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? "কেন এই লক্ষ্যটি আপনার জন্য গুরুত্বপূর্ণ?" : "Why is this goal important to you?"}
                </label>
                <textarea
                  value={whyImportant}
                  onChange={e => setWhyImportant(e.target.value)}
                  rows={3}
                  placeholder={lang === 'bn' ? "আপনার অনুপ্রেরণা লিখুন..." : "Describe your motivation..."}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                />
              </div>

              {/* Focus Areas Tags input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  {lang === 'bn' ? "পছন্দসই ফোকাস এরিয়া (ঐচ্ছিক)" : "Preferred Focus Areas (Optional)"}
                </label>
                
                {/* Active tags */}
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-xs font-bold"
                    >
                      <span>{tag}</span>
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-indigo-400 hover:text-indigo-700 font-bold ml-0.5 text-xs transition"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {focusAreas.length === 0 && (
                    <span className="text-slate-400 text-xs italic">{lang === 'bn' ? "কোন ফোকাস এরিয়া যোগ করা হয়নি" : "No focus areas added yet"}</span>
                  )}
                </div>

                {/* Add dynamic tag inputs */}
                <div className="flex gap-2 max-w-sm">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={e => setCustomTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag(customTagInput)
                        setCustomTagInput("")
                      }
                    }}
                    placeholder={lang === 'bn' ? "নতুন ট্যাগ লিখুন..." : "Type custom tag..."}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={() => {
                      handleAddTag(customTagInput)
                      setCustomTagInput("")
                    }}
                    className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-3 py-2 rounded-xl text-xs hover:bg-indigo-100 transition active:scale-95"
                  >
                    {lang === 'bn' ? "যোগ করুন" : "Add"}
                  </button>
                </div>

                {/* Suggested quick tags */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                    {lang === 'bn' ? "পরামর্শকৃত এরিয়াসমূহ:" : "Suggested areas:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestedTags.map(tag => {
                      const isAdded = focusAreas.includes(tag)
                      return (
                        <button
                          key={tag}
                          disabled={isAdded}
                          onClick={() => handleAddTag(tag)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                            isAdded
                              ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer active:scale-95"
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
                >
                  {lang === 'bn' ? "বাতিল করুন" : "Cancel"}
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
                >
                  {lang === 'bn' ? "লক্ষ্য তৈরি করুন" : "Create Goal"}
                </button>
              </div>

            </div>

            {/* Right Goal Preview Column (1/3 width) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col h-fit sticky top-24 text-left">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                {lang === 'bn' ? "লক্ষ্যের প্রাকদর্শন" : "Goal Preview"}
              </h2>

              {/* Dynamic Target Illustration */}
              <div className="my-6">
                <TargetIllustration />
              </div>

              <div className="space-y-6 flex-1">
                {/* Target Title */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-widest">
                    {lang === 'bn' ? "ক্যারিয়ার লক্ষ্য" : "Career Goal"}
                  </p>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {goalTitle || (lang === 'bn' ? "সফটওয়্যার ইঞ্জিনিয়ার হওয়া" : "Become a Software Engineer")}
                  </h3>
                </div>

                {/* Info Blocks */}
                <div className="border-t border-slate-100 pt-4 space-y-4 text-xs font-semibold text-slate-600">
                  {/* Target Date */}
                  <div className="flex items-center gap-3">
                    <span className="text-base">📅</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">
                        {lang === 'bn' ? "লক্ষ্য তারিখ" : "Target Date"}
                      </p>
                      <p className="text-slate-800 font-extrabold">{targetDate}</p>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="flex items-center gap-3">
                    <span className="text-base">⏱️</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">
                        {lang === 'bn' ? "আনুমানিক সময়" : "Estimated Time"}
                      </p>
                      <p className="text-slate-800 font-extrabold">{getEstimatedDurationText()}</p>
                    </div>
                  </div>

                  {/* Focus Areas */}
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">🎯</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">
                        {lang === 'bn' ? "প্রধান ফোকাস এরিয়াসমূহ" : "Focus Areas"}
                      </p>
                      <p className="text-slate-800 font-extrabold leading-relaxed">
                        {focusAreas.length > 0 
                          ? focusAreas.join(", ")
                          : (lang === 'bn' ? "কোনোটি যোগ করা হয়নি" : "None added yet")
                        }
                      </p>
                    </div>
                  </div>

                  {/* Skill level indicator */}
                  <div className="flex items-center gap-3">
                    <span className="text-base">📊</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-400 leading-none mb-0.5">
                        {lang === 'bn' ? "দক্ষতার স্তর" : "Skill Level"}
                      </p>
                      <p className="text-slate-800 font-extrabold">{skillLevel}</p>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">
                    {lang === 'bn' ? "ক্যারিয়ার ম্যাচিং স্কোর:" : "Career Match:"}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-extrabold shadow-2xs">
                    95% Match
                  </span>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Auth Modal pop-up */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  )
}
