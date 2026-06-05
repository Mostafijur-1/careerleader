"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '../contexts/UserContext'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageToggle from '../components/LanguageToggle'
import AuthModal from '../components/AuthModal'

type Q = { 
  id: string
  text: string
  dimension: string
  sideA: string
  sideB: string
  optionA?: string
  optionB?: string
  interests: string[]
}

type Recommendation = {
  id: string
  title: string
  description?: string
  skills?: string[]
}

type AssessmentResult = {
  personalityType?: string
  interests: string[]
  recommendations: Recommendation[]
  error?: string
}

// Custom inline SVG icons for sidebar, header, and careers
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

// Beautiful Custom Smiley Faces (SVG-based)
function StronglyAgreeSmiley({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" className="fill-emerald-100 stroke-emerald-500" strokeWidth="3" />
      <path d="M17 19c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1zM31 19c.6 0 1-.4 1-1s-.4-1-1-1-1 .4-1 1 .4 1 1 1z" fill="currentColor" className="text-emerald-700" />
      <path d="M15 27c1.5 5 6.5 7.5 9 7.5s7.5-2.5 9-7.5" stroke="currentColor" className="text-emerald-700" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function AgreeSmiley({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" className="fill-lime-100 stroke-lime-500" strokeWidth="3" />
      <circle cx="17" cy="18" r="2" fill="currentColor" className="text-lime-700" />
      <circle cx="31" cy="18" r="2" fill="currentColor" className="text-lime-700" />
      <path d="M17 28c2 3.5 5 4.5 7 4.5s5-1 7-4.5" stroke="currentColor" className="text-lime-700" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// Straight line mouth neutral face
function NeutralSmiley({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" className="fill-amber-100 stroke-amber-500" strokeWidth="3" />
      <circle cx="17" cy="18" r="2" fill="currentColor" className="text-amber-700" />
      <circle cx="31" cy="18" r="2" fill="currentColor" className="text-amber-700" />
      <line x1="16" y1="28" x2="32" y2="28" stroke="currentColor" className="text-amber-700" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function DisagreeSmiley({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" className="fill-orange-100 stroke-orange-500" strokeWidth="3" />
      <circle cx="17" cy="18" r="2" fill="currentColor" className="text-orange-700" />
      <circle cx="31" cy="18" r="2" fill="currentColor" className="text-orange-700" />
      <path d="M31 29c-2-2.5-5-3.5-7-3.5s-5 1-7 2.5" stroke="currentColor" className="text-orange-700" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function StronglyDisagreeSmiley({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="20" className="fill-red-100 stroke-red-500" strokeWidth="3" />
      <path d="M14 20l4-2m16 2l-4-2" stroke="currentColor" className="text-red-700" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="22" r="2" fill="currentColor" className="text-red-700" />
      <circle cx="31" cy="22" r="2" fill="currentColor" className="text-red-700" />
      <path d="M33 32c-1.5-4-5.5-6-9-6s-7.5 2-9 6" stroke="currentColor" className="text-red-700" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function getCareerIcon(title: string, isCircular: boolean = false) {
  const label = title.toLowerCase()
  const paddingClass = isCircular ? "p-3 rounded-full" : "p-4 rounded-2xl"
  const iconSize = isCircular ? "w-6 h-6" : "w-10 h-10"
  
  if (label.includes("software") || label.includes("developer") || label.includes("programmer") || label.includes("web")) {
    return (
      <div className={`${paddingClass} bg-blue-50 text-blue-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
    )
  }
  if (label.includes("devops") || label.includes("reliability") || label.includes("infrastructure")) {
    return (
      <div className={`${paddingClass} bg-indigo-50 text-indigo-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25c-1.12 0-2.18.57-2.8 1.5A3.72 3.72 0 0 0 10.9 8.25c-2.07 0-3.75 1.68-3.75 3.75s1.68 3.75 3.75 3.75c1.12 0 2.18-.57 2.8-1.5a3.72 3.72 0 0 0 2.8 1.5c2.07 0 3.75-1.68 3.75-3.75S18.57 8.25 16.5 8.25zm-5.6 5.6c-1.03 0-1.87-.84-1.87-1.87s.84-1.87 1.87-1.87c1.03 0 1.87.84 1.87 1.87s-.84 1.87-1.87 1.87zm5.6 0c-1.03 0-1.87-.84-1.87-1.87s.84-1.87 1.87-1.87 1.87.84 1.87 1.87-.84 1.87-1.87 1.87z" />
        </svg>
      </div>
    )
  }
  if (label.includes("data") || label.includes("database") || label.includes("scientist") || label.includes("statistics")) {
    return (
      <div className={`${paddingClass} bg-emerald-50 text-emerald-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
    )
  }
  if (label.includes("product") || label.includes("manager") || label.includes("leader") || label.includes("project")) {
    return (
      <div className={`${paddingClass} bg-amber-50 text-amber-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.25V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.75M21 13.25V9a2 2 0 0 0-2-2h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v4.25M21 13.25a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2M16 7H8" />
        </svg>
      </div>
    )
  }
  if (label.includes("ux") || label.includes("design") || label.includes("creative") || label.includes("frontend")) {
    return (
      <div className={`${paddingClass} bg-pink-50 text-pink-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01a1.49 1.49 0 0 1-.22-.85c0-.83.67-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4.5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
        </svg>
      </div>
    )
  }
  if (label.includes("cyber") || label.includes("security") || label.includes("analyst") && label.includes("security")) {
    return (
      <div className={`${paddingClass} bg-rose-50 text-rose-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    )
  }
  if (label.includes("business") || label.includes("consultant")) {
    return (
      <div className={`${paddingClass} bg-sky-50 text-sky-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      </div>
    )
  }
  if (label.includes("cloud") || label.includes("aws") || label.includes("azure")) {
    return (
      <div className={`${paddingClass} bg-cyan-50 text-cyan-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      </div>
    )
  }
  if (label.includes("system") || label.includes("analyst")) {
    return (
      <div className={`${paddingClass} bg-slate-50 text-slate-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }
  if (label.includes("ai ") || label.includes("intelligence") || label.includes("machine") || label.includes("learning") || label.includes("brain")) {
    return (
      <div className={`${paddingClass} bg-purple-50 text-purple-600 flex items-center justify-center`}>
        <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l.707-.707m2.828 9.9a5 5 0 113.62 0m-4.22 4.22h4.67M12 21v-1" />
        </svg>
      </div>
    )
  }
  // Default Briefcase
  return (
    <div className={`${paddingClass} bg-blue-50 text-blue-600 flex items-center justify-center`}>
      <svg className={iconSize} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.25V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4.75M21 13.25V9a2 2 0 0 0-2-2h-3V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v4.25M21 13.25a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2M16 7H8" />
      </svg>
    </div>
  )
}

function getCareerDescription(title: string, fallback: string = "") {
  const name = title.toLowerCase()
  if (name.includes("software") || name.includes("developer") || name.includes("programmer") || name.includes("web")) {
    return "Build software solutions and applications."
  }
  if (name.includes("devops") || name.includes("reliability") || name.includes("infrastructure")) {
    return "Work with systems, clouds and automation."
  }
  if (name.includes("data") || name.includes("scientist") || name.includes("statistics")) {
    return "Analyze data and build machine learning models."
  }
  if (name.includes("product") || name.includes("manager") || name.includes("leader") || name.includes("project")) {
    return "Lead product development and drive strategy."
  }
  if (name.includes("ux") || name.includes("design") || name.includes("creative") || name.includes("frontend")) {
    return "Design user interfaces and digital experiences."
  }
  if (name.includes("cyber") || name.includes("security") || name.includes("analyst") && name.includes("security")) {
    return "Secure digital networks and protect infrastructure."
  }
  if (name.includes("business") || name.includes("consultant")) {
    return "Analyze business processes and suggest structures."
  }
  if (name.includes("cloud") || name.includes("aws") || name.includes("azure")) {
    return "Build scalable cloud architectures and pipelines."
  }
  if (name.includes("system") || name.includes("analyst")) {
    return "Analyze system designs and database frameworks."
  }
  if (name.includes("ai ") || name.includes("intelligence") || name.includes("machine") || name.includes("learning") || name.includes("brain")) {
    return "Deploy neural models and artificial algorithms."
  }
  return fallback || "Explore guidance, skills, and industry roadmaps."
}
export default function AssessmentPage() {
  const { user, setUser } = useUser()
  const router = useRouter()
  const { lang, t } = useLanguage()
  const ta = t.assessment
  const [isMounted, setIsMounted] = useState(false)
  const [qs, setQs] = useState<Q[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Refactored state variables matching the premium mockup design
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  const qsRef = useRef<Q[]>([])
  qsRef.current = qs

  // horizontal rating emojis list from Strongly Agree (5) on left to Strongly Disagree (1) on right
  const likertSmileys = [
    { value: 5, label: ta.likert[4], smiley: <StronglyAgreeSmiley className="w-11 h-11" />, selectColor: "border-emerald-500 bg-emerald-50 text-emerald-700" },
    { value: 4, label: ta.likert[3], smiley: <AgreeSmiley className="w-11 h-11" />, selectColor: "border-lime-500 bg-lime-50 text-lime-700" },
    { value: 3, label: ta.likert[2], smiley: <NeutralSmiley className="w-11 h-11" />, selectColor: "border-amber-500 bg-amber-50 text-amber-700" },
    { value: 2, label: ta.likert[1], smiley: <DisagreeSmiley className="w-11 h-11" />, selectColor: "border-orange-500 bg-orange-50 text-orange-700" },
    { value: 1, label: ta.likert[0], smiley: <StronglyDisagreeSmiley className="w-11 h-11" />, selectColor: "border-red-500 bg-red-50 text-red-700" }
  ]

  const progress = qs.length ? Math.round((Object.keys(answers).length / qs.length) * 100) : 0

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function fetchQuestions() {
      const alreadyHaveQuestions = qsRef.current.length > 0
      if (!alreadyHaveQuestions) setLoadingQuestions(true)
      try {
        const res = await fetch(`/api/assessment?lang=${lang}`)
        const data = await res.json()
        setQs(data || [])
      } catch (err) {
        console.error('Failed to load questions', err)
        setQs([])
      } finally {
        setLoadingQuestions(false)
      }
    }
    if (isMounted) {
      fetchQuestions()
    }
  }, [isMounted, lang])

  function setAnswer(qid: string, val: number) {
    setAnswers(prev => ({ ...prev, [qid]: val }))
  }

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: formattedAnswers,
          user: user ? { email: user.email, type: user.type } : null,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to submit assessment')
      }

      const scoredMbti = data.result?.personality
      if (scoredMbti && typeof window !== "undefined") {
        localStorage.setItem("guestMbti", scoredMbti)
      }

      if (user) {
        try {
          const authRes = await fetch("/api/auth?me=true")
          const authData = await authRes.json()
          if (authRes.ok && authData?.user) {
            setUser(authData.user)
          }
        } catch (e) {
          console.error("Failed to refresh user context:", e)
        }
      }

      router.push("/explore-careers")
    } catch (err) {
      console.error('Submission error:', err)
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  // Active section indicator checklist based on the 5 loaded questions
  const sectionChecklist = [
    { 
      name: lang === 'bn' ? "ব্যক্তিত্ব (Personality)" : "Personality", 
      qsCount: lang === 'bn' ? "৩টি প্রশ্ন" : "3 Questions", 
      isCompleted: !!(answers['q1'] && answers['q2'] && answers['q5']),
      isActive: currentQuestion === 0 || currentQuestion === 1 || currentQuestion === 4
    },
    { 
      name: lang === 'bn' ? "আগ্রহ (Interests)" : "Interests", 
      qsCount: lang === 'bn' ? "২টি প্রশ্ন" : "2 Questions", 
      isCompleted: !!(answers['q3'] && answers['q4']),
      isActive: currentQuestion === 2 || currentQuestion === 3
    },
    { 
      name: lang === 'bn' ? "দক্ষতা (Skills)" : "Skills", 
      qsCount: lang === 'bn' ? "মূল্যায়ন ফল" : "Result Signals", 
      isCompleted: false,
      isActive: false
    }
  ]
  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      
      {/* 1. LEFT SIDEBAR (Desktop layout) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20 shrink-0">
        
        {/* Brand Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="text-2xl">🚀</div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <DashboardIcon />
            <span>{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</span>
          </Link>
          
          <Link href="/assessment" className="flex items-center gap-3.5 px-4 py-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 rounded-xl font-semibold transition duration-200">
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
          
          {/* Logo on mobile, Breadcrumbs/Route Title on Desktop */}
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
              <span className="text-blue-600 font-semibold">{lang === 'bn' ? "মূল্যায়ন ও ফলাফল" : "Assessment & Recommendations"}</span>
            </div>
          </div>

          {/* Navigation link group, notifications bell, user avatar */}
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
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
            <Link href="/assessment" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 bg-blue-50 font-semibold rounded-lg">{lang === 'bn' ? "ক্যারিয়ার মূল্যায়ন" : "Career Assessment"}</Link>
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
          
          {loadingQuestions ? (
            /* Loading Block */
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-xs">🚀</div>
              </div>
              <p className="mt-6 text-slate-600 font-semibold text-lg animate-pulse">{ta.loading}</p>
            </div>
          ) : (
            
            /* ========================================================================= */
            /* PHASE 1: ASSESSMENT FLOW SCREEN (Matches mockup step 1) */
            /* ========================================================================= */
            <div className="space-y-6 sm:space-y-8">
              
              {/* Heading */}
              <div>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  {lang === 'bn' ? "১. মূল্যায়ন" : "1. Assessment"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{ta.careerAssessment}</h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1.5">{lang === 'bn' ? "সঠিক ফলাফলের জন্য প্রশ্নগুলোর আন্তরিক উত্তর দিন।" : "Answer honestly to get the most accurate results."}</p>
              </div>

              {/* Progress Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-bold text-slate-800">{ta.questionOf(currentQuestion + 1, qs.length)}</span>
                  <span className="font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-xs">{progress}% {ta.complete}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` } as React.CSSProperties}
                  ></div>
                </div>
              </div>

              {/* Main Question Card */}
              {qs.length > 0 && qs[currentQuestion] && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                  
                  {/* Question Text */}
                  <div className="px-6 py-8 sm:px-8 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 text-center leading-relaxed">
                      "{qs[currentQuestion].text}"
                    </h2>
                  </div>

                  {/* Horizontal Smiley Likert Scale */}
                  <div className="p-6 sm:p-8 lg:p-10">
                    
                    <div className="max-w-2xl mx-auto">
                      <div className="grid grid-cols-5 gap-2 sm:gap-4 justify-items-center">
                        {likertSmileys.map(smileyOpt => {
                          const isSelected = answers[qs[currentQuestion].id] === smileyOpt.value
                          return (
                            <button
                              key={smileyOpt.value}
                              type="button"
                              onClick={() => setAnswer(qs[currentQuestion].id, smileyOpt.value)}
                              className={`flex flex-col items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 w-full group cursor-pointer active:scale-95 ${
                                isSelected 
                                  ? `${smileyOpt.selectColor} scale-105 shadow-md`
                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {/* Animated/Scaled Emoji container */}
                              <div className={`transition-transform duration-200 group-hover:scale-110 ${isSelected ? 'scale-115' : 'opacity-85'}`}>
                                {smileyOpt.smiley}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition duration-150 truncate max-w-full ${isSelected ? 'text-inherit font-extrabold' : 'text-slate-500'}`}>
                                {smileyOpt.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Navigation Footer */}
                  <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="px-5 py-2.5 sm:px-6 rounded-xl border border-slate-300 font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-300 transition duration-150 flex items-center gap-2 text-sm"
                    >
                      <span>{ta.previous}</span>
                    </button>

                    {Object.keys(answers).length < qs.length ? (
                      <button
                        onClick={() => setCurrentQuestion(Math.min(qs.length - 1, currentQuestion + 1))}
                        disabled={!qs[currentQuestion] || answers[qs[currentQuestion].id] === undefined}
                        className="px-5 py-2.5 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-md shadow-blue-100 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition duration-150 flex items-center gap-2 text-sm"
                      >
                        <span>{ta.next}</span>
                      </button>
                    ) : (
                      <button
                        onClick={submit}
                        disabled={loading}
                        className="px-6 py-2.5 sm:px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold text-white shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 text-sm"
                      >
                        {loading ? ta.analyzing : ta.submit}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Assessment Section Progress Indicators */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 text-base">
                  {lang === 'bn' ? "মূল্যায়নের বিভাগসমূহ" : "Assessment Sections"}
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {sectionChecklist.map((section, idx) => (
                    <div 
                      key={section.name} 
                      className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                        section.isCompleted 
                          ? 'border-emerald-100 bg-emerald-50/50' 
                          : section.isActive 
                            ? 'border-blue-100 bg-blue-50/30 ring-2 ring-blue-500/20' 
                            : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Circle bullet representation */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          section.isCompleted 
                            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100' 
                            : section.isActive 
                              ? 'bg-blue-600 text-white animate-pulse' 
                              : 'bg-slate-100 text-slate-400'
                        }`}>
                          {section.isCompleted ? "✓" : idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{section.name}</p>
                          <p className="text-[11px] text-slate-400 font-semibold">{section.qsCount}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {section.isCompleted ? (
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">✓</span>
                        ) : section.isActive ? (
                          <span className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></span>
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* 6. MOCK PREMIUM NOTIFICATION MODAL */}
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

      {/* Auth Modal popup */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  )
}

