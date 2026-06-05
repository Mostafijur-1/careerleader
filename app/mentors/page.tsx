"use client"

import { useEffect, useState, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import AuthModal from "../components/AuthModal"
import DashboardLayout from "../components/DashboardLayout"
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

function MentorsContent() {
  const { user } = useUser()
  const { lang, t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

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
      const matchesSearch = selectedCareer
        ? mentor.careerIds.includes(selectedCareer.id)
        : (query === "" ||
          mentor.name.toLowerCase().includes(query) ||
          mentor.headline.toLowerCase().includes(query) ||
          mentor.expertise.some(tag => tag.toLowerCase().includes(query)))

      let matchesCategory = true
      if (activeCategory !== "all") {
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

  function getConnectionButtonProps(mentorEmail: string): { text: string; className: string; disabled: boolean; status: ConnectionStatus } {
    const status = requestStatuses[mentorEmail.toLowerCase()] || "none"
    const isLoading = actionLoading[mentorEmail.toLowerCase()]
    
    if (isLoading) {
      return {
        text: lang === 'bn' ? "কানেক্টিং..." : "Connecting...",
        className: "bg-indigo-400 text-white/90 border border-indigo-400 px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 cursor-not-allowed text-center flex items-center justify-center gap-1.5",
        disabled: true,
        status: "none"
      }
    }

    if (status === "pending") {
      return {
        text: lang === 'bn' ? "পেন্ডিং" : "Pending",
        className: "bg-yellow-50 text-yellow-700 border border-yellow-200 px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 cursor-not-allowed text-center flex items-center justify-center gap-1",
        disabled: true,
        status: "pending"
      }
    }
    
    if (status === "accepted") {
      return {
        text: lang === 'bn' ? "বার্তা পাঠান" : "Chat",
        className: "bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 text-center active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center gap-1",
        disabled: false,
        status: "accepted"
      }
    }

    return {
      text: lang === 'bn' ? "কানেক্ট করুন" : "Connect",
      className: "bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold w-32 shrink-0 text-center active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center gap-1",
      disabled: false,
      status: "none"
    }
  }

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

  if (!isMounted) return null

  return (
    <DashboardLayout activeTab="mentors" maxWidthClass="max-w-4xl">
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
                    <button
                      disabled={btnProps.disabled}
                      onClick={() => {
                        if (!btnProps.disabled) {
                          if (requestStatuses[mentor.email.toLowerCase()] === "accepted") {
                            router.push(`/dashboard?view=messages&mentor=${encodeURIComponent(mentor.email)}`);
                          } else {
                            handleConnect(mentor.email);
                          }
                        }
                      }}
                      className={btnProps.className}
                    >
                      {actionLoading[mentor.email.toLowerCase()] && (
                        <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {!actionLoading[mentor.email.toLowerCase()] && btnProps.status === "pending" && (
                        <span className="text-yellow-600 mr-0.5">⏳</span>
                      )}
                      {!actionLoading[mentor.email.toLowerCase()] && btnProps.status === "accepted" && (
                        <span className="text-white mr-0.5">💬</span>
                      )}
                      <span>{btnProps.text}</span>
                    </button>

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
              {requestStatuses[selectedMentorProfile.email.toLowerCase()] === "accepted" ? (
                <button
                  onClick={() => {
                    setSelectedMentorProfile(null)
                    router.push(`/dashboard?view=messages&mentor=${encodeURIComponent(selectedMentorProfile.email)}`)
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-xs shadow-md active:scale-95 text-center transition cursor-pointer"
                >
                  {lang === 'bn' ? "বার্তা পাঠান" : "Chat with Mentor"}
                </button>
              ) : requestStatuses[selectedMentorProfile.email.toLowerCase()] === "pending" ? (
                <button
                  disabled
                  className="flex-1 py-3 px-4 rounded-xl bg-yellow-50 border border-yellow-200 font-extrabold text-yellow-700 text-xs text-center cursor-not-allowed"
                >
                  {lang === 'bn' ? "অনুরোধ পেন্ডিং" : "Request Pending"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleConnect(selectedMentorProfile.email)
                    setSelectedMentorProfile(null)
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-extrabold text-white text-xs shadow-md shadow-indigo-100 active:scale-95 text-center transition cursor-pointer"
                >
                  {lang === 'bn' ? "কানেক্ট করুন" : "Send Connection Request"}
                </button>
              )}
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
    </DashboardLayout>
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
