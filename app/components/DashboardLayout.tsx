"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "./LanguageToggle"
import AuthModal from "./AuthModal"
import PremiumModal from "./PremiumModal"

// ----------------------------------------------------
// SIDEBAR & HEADER ICONS
// ----------------------------------------------------
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

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

// ----------------------------------------------------
// CONTEXT
// ----------------------------------------------------
interface DashboardLayoutContextType {
  openAuthModal: () => void
  openPremiumModal: () => void
}

const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined)

export function useDashboardLayout() {
  const context = useContext(DashboardLayoutContext)
  if (!context) {
    throw new Error("useDashboardLayout must be used within a DashboardLayoutProvider")
  }
  return context
}

// ----------------------------------------------------
// COMPONENT
// ----------------------------------------------------
interface DashboardLayoutProps {
  children: ReactNode
  activeTab: "dashboard" | "assessment" | "explore-careers" | "mentors" | "goals" | "roadmap" | "resources" | "messages" | "profile"
  maxWidthClass?: string
  breadcrumbExtra?: string
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  maxWidthClass = "max-w-6xl",
  breadcrumbExtra 
}: DashboardLayoutProps) {
  const { user, setUser } = useUser()
  const { lang, t } = useLanguage()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Poll for student unread message notifications
  useEffect(() => {
    if (!user || !user.email || user.type !== "student") {
      setUnreadCount(0)
      return
    }

    const email = user.email

    async function fetchUnreadCount() {
      try {
        const params = new URLSearchParams({
          action: "student-notifications",
          studentEmail: email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          const list = Array.isArray(data?.notifications) ? data.notifications : []
          const seenKey = `notif_seen_at_${email.toLowerCase()}`
          const seenAt = Number(localStorage.getItem(seenKey) || "0")
          const unread = list.filter((n: any) => new Date(n.createdAt).getTime() > seenAt).length
          setUnreadCount(unread)
        }
      } catch (err) {
        console.error("Failed to load layout notifications:", err)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [user])

  const openAuthModal = () => setIsAuthOpen(true)
  const openPremiumModal = () => setIsPremiumModalOpen(true)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
    } catch {
      // Clear local state anyway
    } finally {
      setUser(null)
      setMobileMenuOpen(false)
      router.push("/")
    }
  }

  // Navigation Items
  const navItems = [
    {
      key: "dashboard",
      href: "/dashboard",
      icon: <DashboardIcon />,
      label: t.nav.dashboard
    },
    {
      key: "assessment",
      href: "/assessment",
      icon: <AssessmentIcon />,
      label: t.nav.assessment
    },
    {
      key: "explore-careers",
      href: "/explore-careers",
      icon: <ExploreIcon />,
      label: t.nav.exploreCareers
    },
    {
      key: "mentors",
      href: "/mentors",
      icon: <MentorsIcon />,
      label: t.nav.mentors
    },
    {
      key: "goals",
      href: "/goals",
      icon: <GoalsIcon />,
      label: t.nav.goals
    },
    {
      key: "roadmap",
      href: "/roadmap",
      icon: <RoadmapIcon />,
      label: t.nav.roadmap
    },
    {
      key: "resources",
      href: "/dashboard?view=resources",
      icon: <ResourcesIcon />,
      label: t.nav.resources
    },
    {
      key: "messages",
      href: "/dashboard?view=messages",
      icon: <MessagesIcon />,
      label: t.nav.messages,
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      key: "profile",
      href: "/dashboard?view=profile",
      icon: <ProfileIcon />,
      label: t.nav.profile
    }
  ]

  // Breadcrumb Title mapping
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return lang === 'bn' ? "ড্যাশবোর্ড" : "Student Dashboard"
      case "assessment":
        return lang === 'bn' ? "মূল্যায়ন ও ফলাফল" : "Assessment & Recommendations"
      case "explore-careers":
        return lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"
      case "mentors":
        return lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"
      case "goals":
        return lang === 'bn' ? "লক্ষ্য নির্ধারণ" : "Goals"
      case "roadmap":
        return lang === 'bn' ? "রোডম্যাপ" : "Roadmap"
      case "resources":
        return lang === 'bn' ? "রিসোর্স লাইব্রেরি" : "Learning Resources"
      case "messages":
        return lang === 'bn' ? "বার্তা আদান-প্রদান" : "Mentor Conversations"
      case "profile":
        return lang === 'bn' ? "প্রোফাইল সেটিংস" : "User Profile"
      default:
        return ""
    }
  }

  // Display user details or guest state
  const displayUserInitial = isMounted && user ? user.name.charAt(0).toUpperCase() : null

  return (
    <DashboardLayoutContext.Provider value={{ openAuthModal, openPremiumModal }}>
      <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
        
        {/* 1. LEFT SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20 shrink-0 select-none">
          {/* Brand Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="text-2xl">🚀</div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.key
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition duration-150 active:scale-98 text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 font-semibold shadow-xs"
                      : "text-slate-500 hover:text-blue-600 hover:bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Logout Button */}
            {isMounted && user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50/40 rounded-xl font-medium transition duration-150 active:scale-98 text-left cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{lang === 'bn' ? "লগআউট" : "Logout"}</span>
              </button>
            )}
          </nav>

          {/* Sidebar Premium Banner */}
          <div className="p-4 border-t border-slate-100">
            <div className="p-4 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-2xl relative overflow-hidden shadow-lg border border-slate-800">
              <h4 className="font-bold text-xs mb-0.5 tracking-wide uppercase text-blue-300">
                {lang === 'bn' ? "প্রিমিয়াম সদস্য" : "PRO Plan Active"}
              </h4>
              <p className="text-white/80 text-[10px] leading-relaxed">
                {lang === 'bn' ? "সকল ফিচার আনলক করা হয়েছে।" : "Unlimited access to all features unlocked."}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* 2. TOP HEADER */}
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
            
            {/* Mobile Hamburger Toggle */}
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
              
              {/* Mobile Brand Link */}
              <Link href="/" className="lg:hidden flex items-center gap-2.5 font-bold text-lg">
                <span className="text-2xl">🚀</span>
                <span className="text-slate-900">CareerLeader</span>
              </Link>

              {/* Breadcrumbs for desktop */}
              <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>{lang === 'bn' ? "হোম" : "Home"}</span>
                <span>/</span>
                <span className={`font-semibold text-blue-600 capitalize`}>
                  {getBreadcrumbTitle()}
                </span>
                {breadcrumbExtra && (
                  <>
                    <span>/</span>
                    <span className="text-blue-600 font-semibold">{breadcrumbExtra}</span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Links & Avatar */}
            <div className="flex items-center gap-4 sm:gap-6">
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className={`text-sm font-semibold transition ${activeTab === "dashboard" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>
                  {lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}
                </Link>
                <Link href="/explore-careers" className={`text-sm font-semibold transition ${activeTab === "explore-careers" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>
                  {lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}
                </Link>
                <Link href="/mentors" className={`text-sm font-semibold transition ${activeTab === "mentors" ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>
                  {lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}
                </Link>
              </nav>

              <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
              
              {/* Language Switcher */}
              <LanguageToggle />

              {/* Dynamic Notification Bell */}
              <div className="relative">
                <Link 
                  href="/dashboard?view=messages"
                  className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition duration-150 active:scale-95 block"
                >
                  <BellIcon />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                </Link>
              </div>

              {/* User Avatar Initials / Login Action */}
              <div className="relative shrink-0">
                {displayUserInitial ? (
                  <Link 
                    href="/dashboard?view=profile"
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95"
                  >
                    {displayUserInitial}
                  </Link>
                ) : (
                  <button 
                    onClick={openAuthModal}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold flex items-center justify-center hover:bg-slate-200 hover:border-slate-300 transition active:scale-95 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* 3. MOBILE MENU BAR DROPDOWN */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2.5 z-10 shadow-md animate-slide-down select-none">
              {navItems.map((item) => {
                const isActive = activeTab === item.key
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 font-medium rounded-lg transition-colors ${
                      isActive
                        ? "text-blue-600 bg-blue-50 font-semibold"
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}

              {/* Mobile Logout option */}
              {isMounted && user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2.5 text-red-600 hover:bg-red-50/50 font-bold rounded-lg transition"
                >
                  {lang === 'bn' ? "লগআউট" : "Logout"}
                </button>
              )}
            </div>
          )}

          {/* 4. MAIN PAGE CONTENT CONTAINER */}
          <main className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 mx-auto w-full ${maxWidthClass}`}>
            {children}
          </main>
        </div>

        {/* Modals integrated at Layout Level */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      </div>
    </DashboardLayoutContext.Provider>
  )
}
