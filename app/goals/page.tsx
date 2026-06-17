"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import DashboardLayout from "../components/DashboardLayout"

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
  const { lang } = useLanguage()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)

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
    <DashboardLayout activeTab="goals">
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

            {/* CV Generator CTA */}
            {goalTitle.trim() && (
              <div className="border-t border-slate-100 pt-4">
                <Link
                  href="/cv"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-md transition active:scale-98 text-xs"
                >
                  <span>📄</span>
                  <span>{lang === 'bn' ? "লক্ষ্য-ভিত্তিক সিভি তৈরি করুন" : "Generate Goal-Based CV"}</span>
                </Link>
                <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                  {lang === 'bn'
                    ? "আপনার লক্ষ্য ও দক্ষতার উপর ভিত্তি করে AI সিভি তৈরি করুন"
                    : "Create an AI-tailored CV from your goal and skills"}
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
