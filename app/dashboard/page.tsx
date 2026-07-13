"use client"

import { useEffect, useState, useMemo, Suspense, useRef } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import DashboardLayout, { useDashboardLayout } from "../components/DashboardLayout"
import learningResourcesData from "@/data/learning_resources.json"

function GuestDashboardView() {
  const { openAuthModal } = useDashboardLayout()
  const { lang } = useLanguage()

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 text-center">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative p-8 sm:p-12 space-y-8">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-12 -bottom-12 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl"></div>

        {/* Lock icon */}
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl scale-125"></div>
          <div className="relative text-6xl sm:text-7xl p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-inner">
            🔒
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-4 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
            {lang === 'bn' ? "ড্যাশবোর্ড আনলক করুন 🚀" : "Unlock Your Dashboard 🚀"}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            {lang === 'bn' 
              ? "ক্যারিয়ার লিডারের পূর্ণাঙ্গ ফিচারসমূহ ব্যবহার করতে এবং আপনার অগ্রগতি ট্র্যাক করতে অনুগ্রহ করে লগইন বা নিবন্ধন করুন।" 
              : "Access custom learning paths, track your skill progress, schedule mock interviews, and coordinate with expert industry mentors."
            }
          </p>
        </div>

        {/* Features Checklist */}
        <div className="grid gap-4 sm:grid-cols-2 text-left max-w-2xl mx-auto bg-slate-50/60 p-6 rounded-2xl border border-slate-150/40">
          {[
            { 
              title: lang === 'bn' ? "ব্যক্তিগত রোডম্যাপ" : "Personalized Roadmaps", 
              desc: lang === 'bn' ? "লক্ষ্য অর্জনের জন্য কাস্টম ফেইজ-ভিত্তিক রোডম্যাপ।" : "Tailored stages to hit your targeted roles." 
            },
            { 
              title: lang === 'bn' ? "মেন্টরশিপ ও চ্যাট" : "Direct Mentorship", 
              desc: lang === 'bn' ? "শিল্প বিশেষজ্ঞদের সাথে ওয়ান-টু-ওয়ান চ্যাট।" : "Chat directly with vetted industry professionals." 
            },
            { 
              title: lang === 'bn' ? "দক্ষতা ও অগ্রগতি ট্র্যাকিং" : "Skill & Progress Tracking", 
              desc: lang === 'bn' ? "রিসোর্স এনরোলমেন্ট ও অগ্রগতি পর্যবেক্ষণ।" : "Enroll in courses and visually monitor growth." 
            },
            { 
              title: lang === 'bn' ? "লক্ষ্য ও মাইলস্টোন" : "Goals & Milestones", 
              desc: lang === 'bn' ? "প্রধান লক্ষ্য তারিখ ও অনুপ্রেরণাগুলো ট্র্যাক করুন।" : "Document target dates and core motivations." 
            }
          ].map((feat, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <span className="text-emerald-500 font-bold text-sm bg-emerald-50 border border-emerald-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">✓</span>
              <div>
                <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{feat.title}</h4>
                <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5 leading-snug">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md transition transform hover:scale-103 active:scale-97 cursor-pointer"
          >
            {lang === 'bn' ? "লগইন / নিবন্ধন করুন" : "Get Started Now"}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DashboardSchedule {
  id: string
  studentEmail: string
  studentName: string
  mentorEmail: string
  date: string
  time: string
  category: string
  status: "upcoming" | "completed"
}

interface DashboardNote {
  id: string
  studentEmail: string
  studentName: string
  mentorEmail: string
  date: string
  category: string
  text: string
  followUp?: string
}

function DashboardContent() {
  const { user, loading, setUser } = useUser()
  const { lang, t } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const viewParam = searchParams.get("view")
  const mentorParam = searchParams.get("mentor")
  const [activeView, setActiveView] = useState<"dashboard" | "resources" | "messages" | "profile" | "ai-advisor">("dashboard")

  const [isMounted, setIsMounted] = useState(false)
  const [mockInterests, setMockInterests] = useState<string[]>([])
  const [localMbti, setLocalMbti] = useState<string>("")
  const [hasGeneratedCv, setHasGeneratedCv] = useState(false)

  // Tab switching sync
  useEffect(() => {
    if (viewParam === "resources" || viewParam === "messages" || viewParam === "profile" || viewParam === "ai-advisor") {
      setActiveView(viewParam)
    } else {
      setActiveView("dashboard")
    }
  }, [viewParam])

  useEffect(() => {
    if (activeView !== "messages") {
      setChatMobileView("list")
    }
  }, [activeView])

  const changeView = (view: "dashboard" | "resources" | "messages" | "profile" | "ai-advisor") => {
    setActiveView(view)
    router.push(`/dashboard?view=${view}`)
  }

  // States for recommendations matched via assessment
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [careerFitPercentage, setCareerFitPercentage] = useState<Record<string, number>>({})

  // Resources state
  const [resourceSearch, setResourceSearch] = useState("")
  const [resourceCategory, setResourceCategory] = useState("all")
  const [enrolledResources, setEnrolledResources] = useState<Record<string, number>>({})

  // Messages state
  const [acceptedMentors, setAcceptedMentors] = useState<any[]>([])
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatSending, setChatSending] = useState(false)
  const [chatMobileView, setChatMobileView] = useState<"list" | "pane">("list")

  // Mentorship shared features states
  const [studentSchedules, setStudentSchedules] = useState<DashboardSchedule[]>([])
  const [studentNotes, setStudentNotes] = useState<DashboardNote[]>([])
  const [studentProgressValue, setStudentProgressValue] = useState<number>(0)

  // AI Advisor Chat states
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ id: string; sender: 'user' | 'ai'; text: string; createdAt: string }>>([])
  const [aiChatInput, setAiChatInput] = useState("")
  const [aiChatSending, setAiChatSending] = useState(false)

  // Profile states
  const [profileName, setProfileName] = useState("")
  const [profileBio, setProfileBio] = useState("")
  const [profileSkills, setProfileSkills] = useState<string[]>([])
  const [profileSkillsInput, setProfileSkillsInput] = useState("")
  const [profileEducation, setProfileEducation] = useState<Array<{ degree: string; institution: string; year: string }>>([])
  const [profileGoal, setProfileGoal] = useState("")
  const [eduDegree, setEduDegree] = useState("")
  const [eduInst, setEduInst] = useState("")
  const [eduYear, setEduYear] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false)

  // Route guard: redirect mentors/admins away from the student dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.type === "mentor") {
        router.replace("/mentor")
      } else if (user.type === "admin") {
        router.replace("/admin")
      }
    }
  }, [user, loading, router])

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setLocalMbti(localStorage.getItem("guestMbti") || "")
      setHasGeneratedCv(!!localStorage.getItem("generated_cv"))
      const stored = localStorage.getItem("enrolled_resources")
      if (stored) {
        try {
          setEnrolledResources(JSON.parse(stored))
        } catch {}
      }
    }
  }, [])

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "")
      setProfileBio(user.bio || "")
      setProfileSkills(user.skills || [])
      setProfileEducation(user.education || [])
      setProfileGoal(user.goal || "")
    }
  }, [user])

  useEffect(() => {
    const activeMbti = user?.mbti || localMbti
    if (activeMbti) {
      setMockInterests(["Software Development", "Analytical Design", "Planning", "Teamwork"])
    }
  }, [user, localMbti])

  // Load mentorship data for logged in student (schedules, notes, progress)
  useEffect(() => {
    async function loadStudentMentorshipData() {
      if (!user?.email || user.type !== "student") return

      try {
        // Fetch schedules
        const resScheds = await fetch(`/api/mentorship?action=get-schedules&email=${encodeURIComponent(user.email)}&role=student`)
        const dataScheds = await resScheds.json()
        if (dataScheds?.schedules) {
          setStudentSchedules(dataScheds.schedules)
        }

        // Fetch session notes
        const resNotes = await fetch(`/api/mentorship?action=get-session-notes&email=${encodeURIComponent(user.email)}&role=student`)
        const dataNotes = await resNotes.json()
        if (dataNotes?.notes) {
          setStudentNotes(dataNotes.notes)
        }

        // Fetch progress updates
        const resProgress = await fetch(`/api/mentorship?action=get-student-progress&email=${encodeURIComponent(user.email)}&role=student`)
        const dataProgress = await resProgress.json()
        if (dataProgress?.progress && dataProgress.progress.length > 0) {
          const val = dataProgress.progress[0].progress || 0
          setStudentProgressValue(val)
        }
      } catch (err) {
        console.error("Failed to load student mentorship info", err)
      }
    }

    if (user?.email && user.type === "student") {
      loadStudentMentorshipData()
    }
  }, [user])

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

  // Fetch accepted mentors and setup conversations
  useEffect(() => {
    async function loadConversations() {
      if (!user?.email) return
      try {
        const resStatuses = await fetch(`/api/mentorship?action=request-statuses&studentEmail=${encodeURIComponent(user.email)}`)
        const dataStatuses = await resStatuses.json()
        const acceptedEmails = (dataStatuses?.statuses || [])
          .filter((s: any) => s.status === 'accepted')
          .map((s: any) => s.mentorEmail.toLowerCase())

        if (acceptedEmails.length === 0) {
          setAcceptedMentors([])
          return
        }

        const resMentors = await fetch('/api/mentorship?action=mentors')
        const dataMentors = await resMentors.json()
        const mentorsList = dataMentors?.mentors || []

        const matched = acceptedEmails.map((email: string) => {
          const profile = mentorsList.find((m: any) => m.email.toLowerCase() === email)
          return {
            email,
            name: profile?.name || email.split('@')[0],
            headline: profile?.headline || "Mentor",
            zoomLink: profile?.zoomLink || "",
            meetLink: profile?.meetLink || "",
            image: (profile?.name || email).charAt(0).toUpperCase()
          }
        })

        setAcceptedMentors(matched)
        const mentorFromParam = matched.find((m: any) => m.email.toLowerCase() === mentorParam?.toLowerCase())
        if (mentorFromParam) {
          if (selectedMentor?.email !== mentorFromParam.email) {
            setSelectedMentor(mentorFromParam)
          }
        } else if (matched.length > 0 && !selectedMentor) {
          setSelectedMentor(matched[0])
        }
      } catch (err) {
        console.error("Failed to load conversations:", err)
      }
    }

    if (user?.email && activeView === "messages") {
      loadConversations()
    }
  }, [user, activeView, selectedMentor, mentorParam])

  // Load chat history
  useEffect(() => {
    async function loadMessages() {
      if (!user?.email || !selectedMentor?.email) return
      setChatLoading(true)
      try {
        const params = new URLSearchParams({
          action: "messages",
          studentEmail: user.email,
          mentorEmail: selectedMentor.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        if (res.ok && data?.messages) {
          setChatMessages(data.messages)
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err)
      } finally {
        setChatLoading(false)
      }
    }
    if (user?.email && selectedMentor?.email && activeView === "messages") {
      loadMessages()
    }
  }, [user, selectedMentor, activeView])

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, aiChatMessages, aiChatSending])

  // AI Chat initial messages loading
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_chat_messages")
      if (saved) {
        try {
          setAiChatMessages(JSON.parse(saved))
        } catch {}
      } else {
        const welcomeMsg = lang === 'bn' 
          ? "হ্যালো! আমি ক্যারিয়ার লিডার এআই। আপনার ক্যারিয়ার বিষয়ক যেকোনো প্রশ্ন আমাকে করতে পারেন (যেমন: 'এইচএসসির পর কি করব?', 'কম্পিউটার সায়েন্স পড়তে কেমন জিপিএ লাগবে?' ইত্যাদি)।" 
          : "Hello! I am Career Leader AI. You can ask me any career-related questions (e.g. 'What can I study after HSC?', 'What skills are needed for UI/UX?', etc.)."
        
        const initial = [{
          id: "welcome",
          sender: "ai" as const,
          text: welcomeMsg,
          createdAt: new Date().toISOString()
        }]
        setAiChatMessages(initial)
        localStorage.setItem("ai_chat_messages", JSON.stringify(initial))
      }
    }
  }, [isMounted, lang])

  async function handleSendAiMessage() {
    if (!aiChatInput.trim() || aiChatSending) return
    const userText = aiChatInput.trim()
    setAiChatInput("")
    
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: userText,
      createdAt: new Date().toISOString()
    }
    
    const updated = [...aiChatMessages, userMsg]
    setAiChatMessages(updated)
    localStorage.setItem("ai_chat_messages", JSON.stringify(updated))
    
    setAiChatSending(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      })
      const data = await res.json()
      if (res.ok && data?.response) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: "ai" as const,
          text: data.response,
          createdAt: new Date().toISOString()
        }
        const finalMsgs = [...updated, aiMsg]
        setAiChatMessages(finalMsgs)
        localStorage.setItem("ai_chat_messages", JSON.stringify(finalMsgs))
      } else {
        throw new Error(data?.error || "AI failed to respond")
      }
    } catch (err) {
      console.error("AI Advisor error:", err)
      const errorMsg = lang === 'bn'
        ? "দুঃখিত, এআই সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
        : "Sorry, I encountered an error connecting to the service. Please try again."
      const aiMsg = {
        id: `ai-err-${Date.now()}`,
        sender: "ai" as const,
        text: errorMsg,
        createdAt: new Date().toISOString()
      }
      const finalMsgs = [...updated, aiMsg]
      setAiChatMessages(finalMsgs)
      localStorage.setItem("ai_chat_messages", JSON.stringify(finalMsgs))
    } finally {
      setAiChatSending(false)
    }
  }

  function handleClearAiChat() {
    const welcomeMsg = lang === 'bn' 
      ? "হ্যালো! আমি ক্যারিয়ার লিডার এআই। আপনার ক্যারিয়ার বিষয়ক যেকোনো প্রশ্ন আমাকে করতে পারেন।" 
      : "Hello! I am Career Leader AI. You can ask me any career-related questions."
    
    const initial = [{
      id: "welcome",
      sender: "ai" as const,
      text: welcomeMsg,
      createdAt: new Date().toISOString()
    }]
    setAiChatMessages(initial)
    localStorage.setItem("ai_chat_messages", JSON.stringify(initial))
  }

  // Enroll resource logic
  const handleEnroll = (id: string) => {
    const next = { ...enrolledResources, [id]: 10 } // Start at 10% progress
    setEnrolledResources(next)
    localStorage.setItem("enrolled_resources", JSON.stringify(next))
  }

  // Update enrolled progress mock
  const handleIncreaseProgress = (id: string) => {
    const curr = enrolledResources[id] || 0
    const nextVal = Math.min(100, curr + 15)
    const next = { ...enrolledResources, [id]: nextVal }
    setEnrolledResources(next)
    localStorage.setItem("enrolled_resources", JSON.stringify(next))
  }

  // Send message
  async function handleSendMessage() {
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
          senderType: "student",
          text: chatInput.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data?.message) {
        setChatMessages(prev => [...prev, data.message])
        setChatInput("")
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setChatSending(false)
    }
  }

  // Save profile info
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.email) return
    setProfileSaving(true)
    setProfileSaveSuccess(false)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          email: user.email,
          type: user.type,
          name: profileName.trim(),
          bio: profileBio.trim(),
          skills: profileSkills,
          education: profileEducation,
          goal: profileGoal.trim(),
        })
      })
      const data = await res.json()
      if (res.ok && data?.user) {
        setUser(data.user)
        setProfileSaveSuccess(true)
        setTimeout(() => setProfileSaveSuccess(false), 4000)
      }
    } catch (err) {
      console.error("Failed to save profile:", err)
    } finally {
      setProfileSaving(false)
    }
  }

  // Skill tags additions
  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && profileSkillsInput.trim()) {
      e.preventDefault()
      const newSkill = profileSkillsInput.trim()
      if (!profileSkills.includes(newSkill)) {
        setProfileSkills(prev => [...prev, newSkill])
      }
      setProfileSkillsInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileSkills(prev => prev.filter(s => s !== skillToRemove))
  }

  // Add education degree
  const handleAddEdu = () => {
    if (eduDegree.trim() && eduInst.trim()) {
      setProfileEducation(prev => [...prev, { degree: eduDegree.trim(), institution: eduInst.trim(), year: eduYear.trim() }])
      setEduDegree("")
      setEduInst("")
      setEduYear("")
    }
  }

  const handleRemoveEdu = (index: number) => {
    setProfileEducation(prev => prev.filter((_, i) => i !== index))
  }

  const hasTakenAssessment = !!(user?.mbti || localMbti)
  const topRecommendations = recommendations.slice(0, 4)
  const studentName = isMounted && user ? user.name : (lang === 'bn' ? "অতিথি" : "Guest")

  const hasMentorsConnected = acceptedMentors.length > 0
  const hasEnrolledResources = Object.keys(enrolledResources).length > 0

  // Progress summary
  const totalSteps = 5
  const completedSteps = 
    (hasTakenAssessment ? 2 : 0) + 
    (hasGeneratedCv ? 1 : 0) + 
    (hasMentorsConnected ? 1 : 0) + 
    (hasEnrolledResources ? 1 : 0)
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
      status: hasMentorsConnected ? "completed" : "pending",
      desc: lang === 'bn' ? "আপনার ক্যারিয়ার ট্র্যাকের একজন মেন্টরকে অনুরোধ পাঠান।" : "Request mentorship session with industry leaders.",
      link: "/mentors"
    },
    {
      id: 4,
      title: lang === 'bn' ? "৪. দক্ষতা উন্নয়নের কোর্সসমূহ" : "4. Start Skill Development",
      status: hasEnrolledResources ? "completed" : "pending",
      desc: lang === 'bn' ? "প্রস্তাবিত রিসোর্স ব্যবহার করে শেখা শুরু করুন।" : "Enrol in recommended video courses & tutorials.",
      link: "/explore-careers"
    },
    {
      id: 5,
      title: lang === 'bn' ? "৫. লক্ষ্য-ভিত্তিক সিভি তৈরি" : "5. Generate Goal-Based CV",
      status: hasGeneratedCv ? "completed" : "pending",
      desc: lang === 'bn' ? "আপনার ক্যারিয়ার লক্ষ্যের জন্য AI সিভি তৈরি করুন।" : "Create an AI-tailored CV aligned with your career goal.",
      link: "/cv"
    }
  ]

  // Enrolled courses computed from local state
  const computedEnrolledList = useMemo(() => {
    return (learningResourcesData as any[]).filter(r => enrolledResources[r.id] !== undefined)
  }, [enrolledResources])

  // Filtered resources catalog
  const filteredResources = useMemo(() => {
    return (learningResourcesData as any[]).filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
        res.skills.some((s: string) => s.toLowerCase().includes(resourceSearch.toLowerCase()))
      
      let matchesCat = true
      if (resourceCategory !== "all") {
        if (resourceCategory === "programming") {
          matchesCat = res.skills.includes("programming") || res.skills.includes("python")
        } else if (resourceCategory === "web") {
          matchesCat = res.skills.includes("web") || res.skills.includes("html") || res.skills.includes("javascript")
        } else if (resourceCategory === "ml") {
          matchesCat = res.skills.includes("ml") || res.skills.includes("statistics")
        } else if (resourceCategory === "mobile") {
          matchesCat = res.skills.includes("mobile") || res.skills.includes("flutter")
        }
      }
      return matchesSearch && matchesCat
    })
  }, [resourceSearch, resourceCategory])

  if (loading || !isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-medium">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4 animate-pulse"></div>
        <p className="text-sm font-semibold">{lang === 'bn' ? "লোড হচ্ছে..." : "Loading..."}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <DashboardLayout activeTab={activeView}>
        <GuestDashboardView />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab={activeView}>
          
          {/* ==============================================
              VIEW: DASHBOARD (STUDENT HOME)
             ============================================== */}
          {activeView === "dashboard" && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in text-left">
              {/* Header Greeting */}
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? `স্বাগতম, ${studentName}! 👋` : `Welcome Back, ${studentName}! 👋`}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                  {lang === 'bn' ? "আপনার ক্যারিয়ার প্রস্তুতি অগ্রগতি ট্র্যাক করুন এবং পরবর্তী ধাপের নির্দেশনা দেখুন।" : "Track your career preparation journey and prepare for the next steps."}
                </p>
              </div>

              {/* Grid Layout */}
              <div className="grid gap-6 lg:grid-cols-3 items-start">
                
                {/* Left Column: Assessment & Prep steps */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {hasTakenAssessment ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
                      <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <span className="inline-block px-3 py-1 bg-indigo-50/70 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
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
                                <span key={interest} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px] border border-slate-200">
                                  ✨ {interest}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="pt-2">
                            <Link 
                              href="/explore-careers"
                              className="inline-flex justify-center items-center py-2.5 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition transform hover:scale-103 active:scale-97 text-xs"
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
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
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
                          className="w-full sm:w-auto inline-flex justify-center items-center py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition transform hover:scale-103 active:scale-97 text-sm"
                        >
                          {lang === 'bn' ? "মূল্যায়ন শুরু করুন" : "Start Assessment"}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Career Preparation Progress Steps */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                    
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

                  {/* Mentorship & Schedules Section */}
                  {user?.type === "student" && hasMentorsConnected && (
                    <div className="space-y-6">
                      {/* Upcoming Sessions */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">
                            {lang === 'bn' ? "আসন্ন সেশনসমূহ" : "Upcoming Scheduled Sessions"}
                          </h3>
                          <p className="text-slate-400 text-xs font-semibold mt-0.5">
                            {lang === 'bn' ? "আপনার মেন্টরদের সাথে নির্ধারিত সেশন" : "Sessions scheduled by your mentors"}
                          </p>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {studentSchedules.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">
                              {lang === 'bn' ? "কোনো নির্ধারিত সেশন নেই।" : "No upcoming sessions scheduled."}
                            </p>
                          ) : (
                            studentSchedules.map((s: DashboardSchedule) => {
                              const isUpcoming = s.status === "upcoming"
                              // Find mentor detail for Zoom link if available
                              const mentorDetail = acceptedMentors.find(m => m.email.toLowerCase() === s.mentorEmail.toLowerCase())
                              const joinUrl = mentorDetail?.zoomLink || mentorDetail?.meetLink || "https://zoom.us/join"
                              
                              return (
                                <div key={s.id} className="py-4 flex flex-wrap items-center justify-between gap-4 first:pt-0 last:pb-0">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
                                      isUpcoming ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-500"
                                    }`}>
                                      🗓️
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-sm text-slate-900">
                                        {lang === 'bn' ? "মেন্টর: " : "Mentor: "} {mentorDetail?.name || s.mentorEmail}
                                      </h4>
                                      <p className="text-xs text-slate-500 font-medium mt-0.5">{s.date} • {s.time} • {s.category}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                                      isUpcoming ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-100 border-slate-200 text-slate-600"
                                    }`}>
                                      {isUpcoming ? (lang === 'bn' ? "আসন্ন" : "Upcoming") : (lang === 'bn' ? "সম্পন্ন" : "Completed")}
                                    </span>
                                    {isUpcoming && (
                                      <a
                                        href={joinUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs animate-pulse"
                                      >
                                        {lang === 'bn' ? "যোগদান করুন" : "Join"}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>

                      {/* Mentor-Specific Progress Bar */}
                      {studentProgressValue > 0 && (
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-extrabold text-slate-900 text-base">
                                {lang === 'bn' ? "মেন্টর-নির্দেশিত অগ্রগতি" : "Mentor-Guided Progress"}
                              </h3>
                              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                                {lang === 'bn' ? "আপনার মেন্টর দ্বারা চিহ্নিত অগ্রগতি" : "Growth evaluation score assigned by your mentor"}
                              </p>
                            </div>
                            <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-xs">
                              {studentProgressValue}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${studentProgressValue}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Session Notes / Action Items */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-lg">
                            {lang === 'bn' ? "মেন্টর মতামত ও নির্দেশনা" : "Mentor Notes & Action Items"}
                          </h3>
                          <p className="text-slate-400 text-xs font-semibold mt-0.5">
                            {lang === 'bn' ? "আপনার মেন্টরদের দেওয়া গুরুত্বপূর্ণ নোট ও লক্ষ্যসমূহ" : "Guidance notes and action tasks shared by your mentors"}
                          </p>
                        </div>
                        <div className="space-y-4">
                          {studentNotes.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 italic text-center">
                              {lang === 'bn' ? "কোনো নির্দেশনা নোট নেই।" : "No feedback notes shared yet."}
                            </p>
                          ) : (
                            studentNotes.map((note: DashboardNote) => {
                              const mentorDetail = acceptedMentors.find(m => m.email.toLowerCase() === note.mentorEmail.toLowerCase())
                              return (
                                <div key={note.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 hover:bg-slate-100/50 transition">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="text-xs font-bold text-slate-800">
                                      {mentorDetail?.name || note.mentorEmail}
                                    </span>
                                    <span className="text-[10px] font-semibold text-slate-400">
                                      {note.date} • {note.category}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                    {note.text}
                                  </p>
                                  {note.followUp && (
                                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/40 mt-1">
                                      <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md">
                                        📌 {lang === 'bn' ? "পরবর্তী পদক্ষেপ: " : "Follow-up: "} {note.followUp}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Column: Dynamic courses list & Connections */}
                <div className="space-y-6">
                  
                  {/* Ongoing Skill Development */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {lang === 'bn' ? "চলমান দক্ষতামূলক কোর্স" : "Enrolled Skill Courses"}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">
                        {lang === 'bn' ? "আপনার চলমান শেখার অগ্রগতি" : "Track learning resources and lessons"}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {computedEnrolledList.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <span className="text-3xl block mb-2">📚</span>
                          {lang === 'bn' ? "এখনও কোনো রিসোর্সে ভর্তি হননি" : "Not enrolled in any resources yet."}
                          <button 
                            onClick={() => changeView("resources")} 
                            className="block mx-auto mt-2 text-blue-600 hover:underline font-bold"
                          >
                            {lang === 'bn' ? "লাইব্রেরি ব্রাউজ করুন" : "Browse Library"}
                          </button>
                        </div>
                      ) : (
                        computedEnrolledList.map(course => {
                          const progress = enrolledResources[course.id] || 0
                          return (
                            <div key={course.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/50 space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="text-xl shrink-0">📖</span>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{course.title}</h4>
                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                      {course.level} • {course.type}
                                    </span>
                                  </div>
                                </div>
                                {progress < 100 && (
                                  <button 
                                    onClick={() => handleIncreaseProgress(course.id)} 
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-2 py-1 rounded-md shrink-0 shadow-xs active:scale-95"
                                  >
                                    +15%
                                  </button>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                                  <span>{lang === 'bn' ? "অগ্রগতি" : "Progress"}</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" 
                                    style={{ width: `${progress}%` } as React.CSSProperties}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <button 
                      onClick={() => changeView("resources")} 
                      className="w-full block text-center font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline pt-2 border-t border-slate-100"
                    >
                      {lang === 'bn' ? "আরও শিক্ষণ রিসোর্স খুঁজুন →" : "Browse More Learning Resources →"}
                    </button>
                  </div>

                  {/* Connected Mentors list */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {lang === 'bn' ? "সংযুক্ত মেন্টরবৃন্দ" : "Your Connected Mentors"}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">
                        {lang === 'bn' ? "সরাসরি বার্তা পাঠানোর লাইনে যুক্ত মেন্টর" : "Direct lines for career counseling"}
                      </p>
                    </div>

                    <div className="space-y-3 pt-1">
                      {acceptedMentors.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                          <span className="text-3xl block mb-2">💬</span>
                          {lang === 'bn' ? "কোনো সংযুক্ত মেন্টর নেই" : "No connected mentors yet."}
                          <Link href="/mentors" className="block mt-2 text-blue-600 hover:underline font-bold">
                            {lang === 'bn' ? "কানেক্ট অনুরোধ পাঠান" : "Send Connect Request"}
                          </Link>
                        </div>
                      ) : (
                        acceptedMentors.map(mentor => (
                          <div key={mentor.email} className="flex items-center justify-between gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition duration-150">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                                {mentor.image}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{mentor.name}</h4>
                                <p className="text-[9px] text-slate-400 truncate font-semibold mt-0.5">{mentor.headline}</p>
                              </div>
                            </div>

                            <button 
                              onClick={() => {
                                setSelectedMentor(mentor)
                                changeView("messages")
                              }}
                              className="shrink-0 text-[10px] font-bold text-blue-600 hover:text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition active:scale-95 cursor-pointer"
                            >
                              {lang === 'bn' ? "চ্যাট" : "Chat"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <Link 
                      href="/mentors" 
                      className="block text-center font-bold text-xs text-blue-600 hover:text-blue-700 hover:underline pt-2 border-t border-slate-100"
                    >
                      {lang === 'bn' ? "নতুন মেন্টরদের অনুরোধ করুন →" : "Connect with More Mentors →"}
                    </Link>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ==============================================
              VIEW: RESOURCES (LEARNING LIBRARY)
             ============================================== */}
          {activeView === "resources" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "রিসোর্স লাইব্রেরি 📚" : "Learning Hub 📚"}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                  {lang === 'bn' ? "আপনার ক্যারিয়ার উপযুক্ত করার জন্য বিভিন্ন কোর্স এবং গাইড বুকসমূহ।" : "Access top-quality video courses, tutorials, and certification materials to master in-demand skills."}
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
                <div className="relative w-full sm:flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">🔍</span>
                  <input
                    type="text"
                    value={resourceSearch}
                    onChange={e => setResourceSearch(e.target.value)}
                    placeholder={lang === 'bn' ? "কোর্স বা দক্ষতা দিয়ে খুঁজুন..." : "Search courses, tags, or skills..."}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {resourceSearch && (
                    <button onClick={() => setResourceSearch("")} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 font-bold">✕</button>
                  )}
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 shrink-0 w-full sm:w-auto">
                  {([
                    { key: 'all', label: lang === 'bn' ? "সব" : "All" },
                    { key: 'programming', label: lang === 'bn' ? "প্রোগ্রামিং" : "Python" },
                    { key: 'web', label: lang === 'bn' ? "ওয়েব" : "Web" },
                    { key: 'ml', label: lang === 'bn' ? "মেশিন লার্নিং" : "ML" },
                    { key: 'mobile', label: lang === 'bn' ? "মোবাইল" : "Mobile" }
                  ] as const).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setResourceCategory(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        resourceCategory === tab.key ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Course Catalog Grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((res: any) => {
                  const progress = enrolledResources[res.id]
                  const isEnrolled = progress !== undefined
                  const difficultyColor = res.level === "beginner" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"
                  
                  return (
                    <div key={res.id} className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden relative group">
                      
                      {/* Gradient Accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                      <div className="space-y-4">
                        {/* Tags / Level */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full uppercase tracking-wider ${difficultyColor}`}>
                            {res.level}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 capitalize">
                            🎬 {res.type}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                            {res.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium">
                            Provider: <span className="text-slate-600 font-bold">CareerLeader Academy</span>
                          </p>
                        </div>

                        {/* rating & metrics */}
                        <div className="flex items-center gap-3 text-xs text-slate-500 border-y border-slate-100 py-2">
                          <div className="flex items-center text-amber-500 font-bold">
                            <span>★</span>
                            <span className="text-slate-700 ml-1">4.8</span>
                          </div>
                          <span>•</span>
                          <span>12h duration</span>
                        </div>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap gap-1">
                          {res.skills.map((skill: string) => (
                            <span key={skill} className="text-[9px] font-bold bg-indigo-50/60 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100/30">
                              #{skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Enroll / Progress controls */}
                      <div className="pt-5 mt-4 border-t border-slate-100">
                        {isEnrolled ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                              <span>Enrolled • {progress}%</span>
                              {progress < 100 ? (
                                <button 
                                  onClick={() => handleIncreaseProgress(res.id)} 
                                  className="text-indigo-600 hover:underline"
                                >
                                  Study Lesson
                                </button>
                              ) : (
                                <span className="text-emerald-600">Completed ✓</span>
                              )}
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <a 
                              href={res.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="w-full block text-center py-2 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 font-bold rounded-xl text-xs transition active:scale-97 border border-indigo-100 mt-2"
                            >
                              Open Course Link 🔗
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEnroll(res.id)}
                            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-xs hover:shadow-sm active:scale-97 transition cursor-pointer text-center"
                          >
                            Enroll Course
                          </button>
                        )}
                      </div>

                    </div>
                  )
                })}
              </div>

              {/* External Resources List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs mt-8">
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">{lang === 'bn' ? "অনলাইন প্ল্যাটফর্ম লিংকসমূহ" : "Premium Learning Platforms"}</h3>
                <p className="text-xs text-slate-400 mb-6 font-semibold">{lang === 'bn' ? "নিচে দেওয়া শীর্ষস্থানীয় পোর্টালগুলো ব্যবহার করে আপনার পছন্দের বিষয়ে বিস্তারিত শিখুন।" : "Alternative popular directories to acquire certifications and study independently."}</p>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    { name: "Coursera", desc: "Top university lectures & certificates", url: "https://coursera.org", icon: "🎓" },
                    { name: "freeCodeCamp", desc: "100% free programming certifications", url: "https://freecodecamp.org", icon: "💻" },
                    { name: "W3Schools", desc: "Interactive programming guides & syntax", url: "https://w3schools.com", icon: "🌐" },
                    { name: "Udemy", desc: "50,000+ affordable video guides", url: "https://udemy.com", icon: "📹" }
                  ].map((plat, idx) => (
                    <a 
                      key={idx} 
                      href={plat.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-4 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10 rounded-2xl transition duration-150 flex items-start gap-3 text-left group"
                    >
                      <span className="text-3xl shrink-0 group-hover:scale-110 transition">{plat.icon}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-indigo-600">{plat.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-0.5">{plat.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==============================================
              VIEW: MESSAGES (MENTOR CONVERSATIONS)
             ============================================== */}
          {activeView === "messages" && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-fade-in text-left">
              <div className="shrink-0">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "মেন্টর চ্যাট 💬" : "Mentor Chat 💬"}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                  {lang === 'bn' ? "আপনার সাথে যুক্ত মেন্টরদের সাথে সরাসরি বার্তা আদান-প্রদান।" : "Communicate with accepted mentors for career guidelines, resume reviews, or scheduling calls."}
                </p>
              </div>

              {acceptedMentors.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-lg mx-auto shrink-0">
                  <span className="text-5xl block mb-4">👥</span>
                  <p className="font-bold text-base mb-1">{lang === 'bn' ? "কোনো কথোপকথন চালু নেই" : "No Active Conversations"}</p>
                  <p className="text-xs max-w-sm mx-auto mb-6">{lang === 'bn' ? "কথোপকথন শুরু করতে প্রথমে মেন্টরের সাথে কানেক্ট করুন।" : "You can send messages once a mentor accepts your connection request."}</p>
                  <Link
                    href="/mentors"
                    className="inline-flex py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition transform hover:scale-103 active:scale-97 cursor-pointer"
                  >
                    {lang === 'bn' ? "মেন্টরদের খুঁজুন" : "Find & Connect with Mentors"}
                  </Link>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-1 min-h-[300px]">
                  
                  {/* Left contacts list pane */}
                  <div className={`
                    w-full md:w-64 lg:w-72 border-r border-slate-200 flex flex-col shrink-0
                    ${chatMobileView === "pane" ? "hidden md:flex" : "flex"}
                  `}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-extrabold text-slate-900 text-sm">{lang === 'bn' ? "কথোপকথনসমূহ" : "Active Channels"}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                      {acceptedMentors.map(mentor => {
                        const isSelected = selectedMentor?.email === mentor.email
                        return (
                          <button
                            key={mentor.email}
                            onClick={() => {
                              setSelectedMentor(mentor)
                              setChatMobileView("pane")
                            }}
                            className={`w-full text-left p-4 flex items-center gap-3 transition-colors ${
                              isSelected ? "bg-indigo-50/80 border-l-4 border-indigo-600 pl-3.5" : "hover:bg-slate-50/80"
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs shrink-0 relative">
                              {mentor.image}
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full"></span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{mentor.name}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{mentor.headline}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Right Chat window pane */}
                  <div className={`
                    flex-1 flex flex-col min-w-0
                    ${chatMobileView === "list" ? "hidden md:flex" : "flex"}
                  `}>
                    
                    {/* Chat Header */}
                    {selectedMentor && (
                      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <button
                            type="button"
                            onClick={() => setChatMobileView("list")}
                            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 shrink-0"
                            aria-label={lang === 'bn' ? "তালিকায় ফিরুন" : "Back to conversations"}
                          >
                            ←
                          </button>
                          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-xs shrink-0">
                            {selectedMentor.image}
                          </div>
                          <div className="min-w-0 text-left">
                            <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">{selectedMentor.name}</h4>
                            <p className="text-[9px] text-slate-400 font-bold truncate">{selectedMentor.headline}</p>
                          </div>
                        </div>

                        {/* Meeting Links */}
                        {(selectedMentor.zoomLink || selectedMentor.meetLink) && (
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                            {selectedMentor.zoomLink && (
                              <a 
                                href={selectedMentor.zoomLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 shadow-xs"
                              >
                                Zoom Call
                              </a>
                            )}
                            {selectedMentor.meetLink && (
                              <a 
                                href={selectedMentor.meetLink} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-[10px] font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-700 shadow-xs"
                              >
                                Meet Call
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Messages list pane */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30 space-y-4">
                      {chatLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-400 font-medium text-xs">
                          <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"></div>
                          <span>Loading messages...</span>
                        </div>
                      ) : chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                          <span className="text-4xl block mb-2">💬</span>
                          <span>No messages yet. Send a message to start the thread.</span>
                        </div>
                      ) : (
                        chatMessages.map(msg => {
                          const isStudent = msg.senderType === "student"
                          return (
                            <div 
                              key={msg.id} 
                              className={`flex flex-col max-w-[80%] ${
                                isStudent ? "ml-auto items-end" : "mr-auto items-start"
                              }`}
                            >
                              <span className="text-[9px] text-slate-400 font-semibold mb-0.5">
                                {isStudent ? "You" : selectedMentor.name} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`p-3 rounded-2xl text-xs shadow-xs leading-relaxed ${
                                isStudent 
                                  ? "bg-indigo-600 text-white rounded-tr-none" 
                                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                              }`}>
                                <p className="whitespace-pre-line">{msg.text}</p>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={chatBottomRef}></div>
                    </div>

                    {/* Chat Input panel */}
                    <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                      <div className="flex gap-2">
                        <textarea
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder={lang === 'bn' ? "একটি বার্তা লিখুন..." : "Type your message here..."}
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-16 overflow-y-auto resize-none"
                          disabled={chatSending || !selectedMentor}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={chatSending || !chatInput.trim() || !selectedMentor}
                          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0 transition active:scale-95 flex items-center justify-center"
                        >
                          {chatSending ? "..." : (lang === 'bn' ? "পাঠান" : "Send")}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          )}

          {/* ==============================================
              VIEW: AI ADVISOR (CAREER LEADER AI CHAT)
             ============================================== */}
          {activeView === "ai-advisor" && (
            <div className="flex-1 flex flex-col min-h-0 space-y-4 md:space-y-6 animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>✨</span> {lang === 'bn' ? "এআই ক্যারিয়ার পরামর্শক" : "AI Career Advisor"}
                  </h1>
                  <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                    {lang === 'bn' ? "আপনার পড়াশোনা ও ক্যারিয়ার বিষয়ক যেকোনো প্রশ্ন করুন ক্যারিয়ার লিডার এআইকে।" : "Ask Career Leader AI any questions about academic paths, career opportunities, or skill roadmaps."}
                  </p>
                </div>

                <button
                  onClick={handleClearAiChat}
                  className="px-4 py-2 border border-slate-300 hover:border-red-300 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer shrink-0"
                >
                  {lang === 'bn' ? "ইতিহাস মুছুন 🧹" : "Clear Chat History 🧹"}
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1 min-h-[300px]">
                
                {/* Status Bar */}
                <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold flex items-center justify-center shadow-xs">
                      🤖
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs leading-none">Career Leader AI</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md shadow-2xs border border-indigo-100">
                    Bilingual Mode Active
                  </span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/30 space-y-4">
                  {aiChatMessages.map((msg) => {
                    const isUser = msg.sender === "user"
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${
                          isUser ? "ml-auto items-end" : "mr-auto items-start"
                        }`}
                      >
                        <span className="text-[9px] text-slate-400 font-semibold mb-0.5">
                          {isUser ? (lang === 'bn' ? "আপনি" : "You") : "Career Leader AI"} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className={`p-3.5 rounded-2xl text-xs sm:text-sm shadow-xs leading-relaxed whitespace-pre-wrap text-left ${
                          isUser
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-indigo-50/30"
                            : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    )
                  })}
                  
                  {/* Thinking Bubble */}
                  {aiChatSending && (
                    <div className="flex flex-col max-w-[80%] mr-auto items-start animate-pulse">
                      <span className="text-[9px] text-slate-400 font-semibold mb-0.5">
                        Career Leader AI
                      </span>
                      <div className="p-3.5 rounded-2xl text-xs text-slate-500 bg-white border border-slate-200 rounded-tl-none flex items-center gap-1.5 shadow-xs">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatBottomRef} />
                </div>

                {/* Prompt Suggestions Shortcuts */}
                <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none bg-slate-50/20 shrink-0 select-none">
                  {[
                    lang === 'bn' ? "এইচএসসি-র পর সেরা ক্যারিয়ার কি?" : "Best career paths after HSC?",
                    lang === 'bn' ? "কম্পিউটার সায়েন্স পড়ার জন্য রোডম্যাপ?" : "Roadmap for Computer Science?",
                    lang === 'bn' ? "ইউআই/ইউএক্স ডিজাইনার হতে কি দক্ষতা দরকার?" : "Skills needed for UI/UX Designer?",
                    lang === 'bn' ? "একজন মেন্টর কিভাবে ক্যারিয়ারে সাহায্য করে?" : "How does a mentor help in career?"
                  ].map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={aiChatSending}
                      onClick={() => { setAiChatInput(s); }}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 rounded-lg text-[10px] font-bold text-slate-500 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white shrink-0">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(); }}
                    className="flex gap-2.5 items-center"
                  >
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder={lang === 'bn' ? "আপনার ক্যারিয়ার বিষয়ক প্রশ্নটি এখানে লিখুন..." : "Ask your career question here..."}
                      disabled={aiChatSending}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                      style={{ color: "#000000", WebkitTextFillColor: "#000000" }}
                    />
                    
                    <button
                      type="submit"
                      disabled={aiChatSending || !aiChatInput.trim()}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed shrink-0 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {aiChatSending ? (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ) : (
                        <span>{lang === 'bn' ? "পাঠান" : "Send"}</span>
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* ==============================================
              VIEW: PROFILE (USER SETTINGS)
             ============================================== */}
          {activeView === "profile" && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "প্রোফাইল সেটিংস ⚙️" : "Profile Settings ⚙️"}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
                  {lang === 'bn' ? "আপনার ব্যক্তিগত তথ্য এবং ক্যারিয়ার সংশ্লিষ্ট লক্ষ্যসমূহ আপডেট করুন।" : "Manage your user profile details, education history, goals, and core MBTI settings."}
                </p>
              </div>

              {/* Success Alert Banner */}
              {profileSaveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-3 rounded-2xl shadow-sm flex items-center gap-2 animate-bounce">
                  <span>✓</span>
                  <span>{lang === 'bn' ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!"}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="grid gap-6 lg:grid-cols-3 items-start">
                
                {/* Left Profile Summary Panel */}
                <div className="space-y-6">
                  
                  {/* User Stats Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs relative overflow-hidden text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 via-blue-500 to-indigo-600 text-white text-4xl font-black mx-auto mb-4 flex items-center justify-center shadow-md">
                      {profileName.charAt(0).toUpperCase() || "S"}
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-base">{profileName || "Student Name"}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">{user?.email}</p>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black rounded-full uppercase tracking-wider mt-3">
                      {user?.type || "Student"} Account
                    </span>

                    {/* Stats counters */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
                      <div>
                        <span className="block font-black text-slate-800 text-lg">{computedEnrolledList.length}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Courses</span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-800 text-lg">{acceptedMentors.length}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mentors</span>
                      </div>
                    </div>
                  </div>

                  {/* Personality breakdown card */}
                  {hasTakenAssessment && (
                    <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xs text-left relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                      <h3 className="font-bold text-sm tracking-wide text-blue-300 uppercase mb-3">Personality Strength</h3>
                      
                      <div className="inline-block px-3 py-1.5 bg-white/10 rounded-xl text-lg font-black tracking-wider mb-4 border border-white/10">
                        {user?.mbti || localMbti} Type
                      </div>
                      
                      <p className="text-[11px] text-white/80 leading-relaxed font-semibold">
                        {(user?.mbti || localMbti) === "INTJ" && "Strategic thinkers with a clear plan for everything. Excellent at systems, architectural designs, and complex algorithms."}
                        {(user?.mbti || localMbti) === "INTP" && "Innovative inventors with an unquenchable thirst for knowledge. Great for software development, research, and analysis."}
                        {(user?.mbti || localMbti) === "ENTJ" && "Decisive leaders who love momentum and accomplishment. Ideal for project management, startup founders, and leadership."}
                        {(user?.mbti || localMbti) === "ENFJ" && "Charismatic and inspiring leaders, able to mesmerize their listeners. High compatibility with customer success, teaching, and HR."}
                        {!["INTJ", "INTP", "ENTJ", "ENFJ"].includes(user?.mbti || localMbti) && "A versatile, detail-oriented analyst who works exceptionally well in collaborative environments to bring plans to execution."}
                      </p>
                    </div>
                  )}

                </div>

                {/* Right Form Settings Panel */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  
                  {/* Basic settings */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                      {lang === 'bn' ? "ব্যক্তিগত বিবরণ" : "Personal Particulars"}
                    </h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">{lang === 'bn' ? "নাম" : "Full Name"}</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={e => setProfileName(e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 block">{lang === 'bn' ? "ব্যক্তিত্ব ধরণ (MBTI)" : "Personality (MBTI)"}</label>
                        <input
                          type="text"
                          value={user?.mbti || localMbti || "ESTJ"}
                          disabled
                          className="w-full border border-slate-150 bg-slate-50 text-slate-400 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">{lang === 'bn' ? "আপনার সম্পর্কে" : "Biography / Summary"}</label>
                      <textarea
                        value={profileBio}
                        onChange={e => setProfileBio(e.target.value)}
                        placeholder="Tell mentors and careers teams about your aspirations and background..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                      />
                    </div>
                  </div>

                  {/* Skills tags selection */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                      {lang === 'bn' ? "মূল দক্ষতা সমূহ" : "Skills & Competencies"}
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-[36px] p-2 border border-slate-200 rounded-xl bg-slate-50/50">
                        {profileSkills.length === 0 ? (
                          <span className="text-[10px] text-slate-400 p-1 font-semibold">No skills added yet. Type below.</span>
                        ) : (
                          profileSkills.map(skill => (
                            <span key={skill} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                              <span>{skill}</span>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveSkill(skill)} 
                                className="text-indigo-400 hover:text-indigo-800 font-bold shrink-0 ml-0.5 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={profileSkillsInput}
                          onChange={e => setProfileSkillsInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          placeholder="Type a skill (e.g. Python, UI Design) and press Enter..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                      {lang === 'bn' ? "ক্যারিয়ার লক্ষ্য ও উদ্দেশ্য" : "Career Goals & Objectives"}
                    </h3>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 block">{lang === 'bn' ? "লক্ষ্য বিবরণ" : "Career Objectives"}</label>
                      <textarea
                        value={profileGoal}
                        onChange={e => setProfileGoal(e.target.value)}
                        placeholder="Detail your short-term goals (e.g. finding an internship) and long-term targets..."
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
                      />
                    </div>
                  </div>

                  {/* Education list */}
                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-2">
                      {lang === 'bn' ? "শিক্ষাগত বিবরণ" : "Education Details"}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* List existing education */}
                      {profileEducation.length > 0 && (
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                          {profileEducation.map((edu, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3 text-left">
                              <div>
                                <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                                <p className="text-slate-400 font-semibold">{edu.institution} {edu.year && `• Year: ${edu.year}`}</p>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveEdu(idx)} 
                                className="text-red-500 hover:text-red-700 font-bold shrink-0 text-sm"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new entry inputs */}
                      <div className="p-4 border border-dashed border-slate-200 bg-slate-50/20 rounded-2xl space-y-3">
                        <h4 className="font-bold text-xs text-slate-700">{lang === 'bn' ? "নতুন শিক্ষাগত যোগ্যতা যোগ করুন" : "Add Education Entry"}</h4>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input
                            type="text"
                            value={eduDegree}
                            onChange={e => setEduDegree(e.target.value)}
                            placeholder="Degree (e.g. B.Sc. CSE)"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            value={eduInst}
                            onChange={e => setEduInst(e.target.value)}
                            placeholder="Institution (e.g. IUT)"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <input
                            type="text"
                            value={eduYear}
                            onChange={e => setEduYear(e.target.value)}
                            placeholder="Passing Year (e.g. 2026)"
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEdu}
                          className="py-1.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold rounded-lg text-[10px] transition active:scale-95"
                        >
                          + Add entry
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Save button */}
                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="py-3 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md transition active:scale-97 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {profileSaving && (
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      )}
                      <span>{profileSaving ? "Saving..." : (lang === 'bn' ? "পরিবর্তন সংরক্ষণ করুন" : "Save Profile Details")}</span>
                    </button>
                  </div>

                </div>

              </form>
            </div>
          )}

    </DashboardLayout>
  )
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
