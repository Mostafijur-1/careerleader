"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"

// Types
type Conversation = {
  studentEmail: string
  studentName?: string
  studentMbti?: string
  lastMessage: string
  lastMessageAt: string | null
  isDemo?: boolean
}

type MentorMessage = {
  id: string
  studentEmail: string
  mentorEmail: string
  senderType: "student" | "mentor"
  senderEmail: string
  text: string
  createdAt: string
}

type PendingRequest = {
  id: string
  studentEmail: string
  studentName?: string
  studentMbti?: string
  messagePreview?: string
  isDemo?: boolean
}

type SessionNote = {
  id: string
  studentEmail: string
  studentName: string
  date: string
  category: string
  text: string
  followUp: string
}

type ScheduledSession = {
  id: string
  studentEmail: string
  studentName: string
  date: string
  time: string
  category: string
  status: "upcoming" | "completed"
}

// English and Bangla Translation Keys
const localTranslations = {
  en: {
    dashboard: "Dashboard",
    requests: "Student Requests",
    mentees: "My Mentees",
    calendar: "Sessions & Calendar",
    zoom: "Meetings (Zoom)",
    chat: "Chat & Messages",
    progress: "Progress Tracking",
    notes: "Session Notes",
    analytics: "Analytics",
    settings: "Profile & Settings",
    welcomeTitle: "Welcome back, Mentor! 👋",
    welcomeSubtitle: "Here's what's happening with your mentees today.",
    activeMentees: "Active Mentees",
    sessionsThisMonth: "Sessions This Month",
    hoursMentored: "Hours Mentored",
    avgRating: "Average Rating",
    thisMonth: "This Month",
    fromLastMonth: "from last month",
    fromMentees: "from mentees",
    pendingReq: "Pending Requests",
    viewAll: "View All",
    accept: "Accept",
    decline: "Decline",
    upcomingSessions: "Upcoming Sessions",
    viewCalendar: "View Calendar",
    join: "Join",
    joinZoom: "Join on Zoom",
    recentMessages: "Recent Messages",
    seeAll: "See All",
    notifications: "Notifications",
    impactTitle: "You're making an impact!",
    impactText: "You've mentored {count} mentees and helped them take big steps in their journey.",
    impactReport: "View Impact Report",
    searchPlaceholder: "Search students...",
    allMetees: "All Mentees",
    noMentees: "No mentees found.",
    mbti: "MBTI",
    progressLabel: "Progress",
    updateProgress: "Update Progress",
    addNote: "Add Note",
    notePlaceholder: "Write session note...",
    selectStudent: "Select Student",
    saveNote: "Save Note",
    category: "Category",
    followUp: "Follow-up Status",
    noNotes: "No session notes yet.",
    skillsChartTitle: "Top Skills You Mentor",
    sessionsChartTitle: "Sessions Over Time",
    headline: "Headline / Current Role",
    expertise: "Expertise (comma separated)",
    bio: "Bio",
    zoomLink: "Zoom Link",
    meetLink: "Google Meet Link",
    saveProfile: "Save Profile Settings",
    profileSaved: "Profile settings saved successfully!",
    nextSession: "Your Next Session",
    shareKnowledge: "Share knowledge.",
    inspireGrowth: "Inspire growth.",
    backToHome: "Back Home",
    backToConversations: "Back to Chats",
    logout: "Logout",
    demoWorkspace: "Demo Workspace (Simulated data mixed with real DB results)",
    send: "Send",
    replyPlaceholder: "Type your message to student...",
    loading: "Loading data...",
    noMessages: "No messages yet.",
    scheduleNew: "Schedule New Session",
    date: "Date",
    time: "Time",
    close: "Close",
    rateMentees: "Rate",
    notesEmpty: "No notes logged for this student yet.",
    loginRequired: "Mentor login required.",
    goHome: "Go to Home",
    noConversations: "No student conversations yet."
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    requests: "শিক্ষার্থীর অনুরোধ",
    mentees: "আমার শিক্ষার্থী",
    calendar: "সেশন ও ক্যালেন্ডার",
    zoom: "মিটিং (জুম)",
    chat: "চ্যাট ও বার্তা",
    progress: "অগ্রগতি ট্র্যাকিং",
    notes: "সেশন নোটস",
    analytics: "বিশ্লেষণ",
    settings: "প্রোফাইল সেটিংস",
    welcomeTitle: "স্বাগতম, মেন্টর! 👋",
    welcomeSubtitle: "আজ আপনার শিক্ষার্থীদের সাথে কি ঘটছে দেখে নিন।",
    activeMentees: "সক্রিয় শিক্ষার্থী",
    sessionsThisMonth: "এই মাসের সেশন",
    hoursMentored: "মেন্টরিং ঘন্টা",
    avgRating: "গড় রেটিং",
    thisMonth: "এই মাস",
    fromLastMonth: "গত মাস থেকে",
    fromMentees: "শিক্ষার্থীদের থেকে",
    pendingReq: "অপেক্ষমাণ অনুরোধ",
    viewAll: "সব দেখুন",
    accept: "গ্রহণ",
    decline: "প্রত্যাখ্যান",
    upcomingSessions: "আসন্ন সেশনসমূহ",
    viewCalendar: "ক্যালেন্ডার দেখুন",
    join: "যুক্ত হোন",
    joinZoom: "জুমে যুক্ত হোন",
    recentMessages: "সাম্প্রতিক বার্তা",
    seeAll: "সব দেখুন",
    notifications: "বিজ্ঞপ্তি",
    impactTitle: "আপনি প্রভাব ফেলছেন!",
    impactText: "আপনি {count} জন শিক্ষার্থীকে মেন্টর করেছেন এবং তাদের এগিয়ে যেতে সাহায্য করেছেন।",
    impactReport: "ইমপ্যাক্ট রিপোর্ট দেখুন",
    searchPlaceholder: "শিক্ষার্থী খুঁজুন...",
    allMetees: "সকল শিক্ষার্থী",
    noMentees: "কোনো শিক্ষার্থী পাওয়া যায়নি।",
    mbti: "ব্যক্তিত্ব (MBTI)",
    progressLabel: "অগ্রগতি",
    updateProgress: "অগ্রগতি আপডেট",
    addNote: "নোট যুক্ত করুন",
    notePlaceholder: "সেশন নোট লিখুন...",
    selectStudent: "শিক্ষার্থী নির্বাচন করুন",
    saveNote: "নোট সংরক্ষণ করুন",
    category: "শ্রেণী",
    followUp: "পরবর্তী পদক্ষেপ",
    noNotes: "এখনও কোনো সেশন নোট নেই।",
    skillsChartTitle: "মেন্টর হিসেবে শীর্ষ দক্ষতা",
    sessionsChartTitle: "সময়ের সাথে সেশন সংখ্যা",
    headline: "হেডলাইন / বর্তমান ভূমিকা",
    expertise: "দক্ষতা (কমা দ্বারা আলাদা করুন)",
    bio: "জীবনবৃত্তান্ত (বায়ো)",
    zoomLink: "জুম লিংক",
    meetLink: "গুগল মিট লিংক",
    saveProfile: "প্রোফাইল সেটিংস সংরক্ষণ করুন",
    profileSaved: "প্রোফাইল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!",
    nextSession: "আপনার পরবর্তী সেশন",
    shareKnowledge: "জ্ঞান ভাগ করুন।",
    inspireGrowth: "বৃদ্ধি অনুপ্রাণিত করুন।",
    backToHome: "মূল পাতা",
    backToConversations: "চ্যাটে ফিরুন",
    logout: "লগআউট",
    demoWorkspace: "ডেমো ওয়ার্কস্পেস (বাস্তব ও ডেমো ডেটা মিশ্রিত)",
    send: "পাঠান",
    replyPlaceholder: "শিক্ষার্থীকে উত্তর দিন...",
    loading: "লোড হচ্ছে...",
    noMessages: "কোনো বার্তা নেই।",
    scheduleNew: "নতুন সেশন সিডিউল করুন",
    date: "তারিখ",
    time: "সময়",
    close: "বন্ধ করুন",
    rateMentees: "রেটিং",
    notesEmpty: "এই শিক্ষার্থীর জন্য কোনো নোট লেখা হয়নি।",
    loginRequired: "মেন্টর হিসেবে লগইন প্রয়োজন।",
    goHome: "মূল পাতায় যান",
    noConversations: "এখনও কোনো কথোপকথন নেই।"
  }
}

// Dynamic Simulated Data for High-Fidelity Mock UI when database collections are sparse
const demoRequests: PendingRequest[] = [
  { id: "demo-r1", studentEmail: "neha.kapoor@demo.com", studentName: "Neha Kapoor", studentMbti: "INFJ", messagePreview: "Hi Mentor, I'm looking for guidance on transitioning into Data Science and UI UX tools...", isDemo: true },
  { id: "demo-r2", studentEmail: "vikram.joshi@demo.com", studentName: "Vikram Joshi", studentMbti: "ENTJ", messagePreview: "I would love to get your advice on product management roadmap planning and strategy...", isDemo: true },
  { id: "demo-r3", studentEmail: "ananya.verma@demo.com", studentName: "Ananya Verma", studentMbti: "INFP", messagePreview: "Can you help me improve my portfolio and design thinking frameworks?", isDemo: true }
]

const demoConversations: Conversation[] = [
  { studentEmail: "arjun.mehta@demo.com", studentName: "Arjun Mehta", studentMbti: "INTJ", lastMessage: "Thank you for the great session today! Looking forward to next week.", lastMessageAt: "2026-06-06T10:30:00.000Z", isDemo: true },
  { studentEmail: "priya.nair@demo.com", studentName: "Priya Nair", studentMbti: "ENFJ", lastMessage: "I have shared the resume draft in the Google drive link.", lastMessageAt: "2026-06-05T18:15:00.000Z", isDemo: true },
  { studentEmail: "rohan.singh@demo.com", studentName: "Rohan Singh", studentMbti: "INTP", lastMessage: "Can we reschedule tomorrow's mock interview session to 5 PM?", lastMessageAt: "2026-06-04T12:00:00.000Z", isDemo: true },
  { studentEmail: "sneha.iyer@demo.com", studentName: "Sneha Iyer", studentMbti: "ESTJ", lastMessage: "Mock assignment submitted. Please review when free.", lastMessageAt: "2026-06-03T09:45:00.000Z", isDemo: true }
]

const demoMessages: Record<string, MentorMessage[]> = {
  "arjun.mehta@demo.com": [
    { id: "m1", studentEmail: "arjun.mehta@demo.com", mentorEmail: "mentor@demo.com", senderType: "student", senderEmail: "arjun.mehta@demo.com", text: "Hello! I am preparing for software engineering interviews.", createdAt: "2026-06-06T09:00:00Z" },
    { id: "m2", studentEmail: "arjun.mehta@demo.com", mentorEmail: "mentor@demo.com", senderType: "mentor", senderEmail: "mentor@demo.com", text: "Hi Arjun, glad to support you. Let's schedule a Zoom call to review system design fundamentals.", createdAt: "2026-06-06T09:05:00Z" },
    { id: "m3", studentEmail: "arjun.mehta@demo.com", mentorEmail: "mentor@demo.com", senderType: "student", senderEmail: "arjun.mehta@demo.com", text: "Thank you for the great session today! Looking forward to next week.", createdAt: "2026-06-06T10:30:00Z" }
  ],
  "priya.nair@demo.com": [
    { id: "m4", studentEmail: "priya.nair@demo.com", mentorEmail: "mentor@demo.com", senderType: "student", senderEmail: "priya.nair@demo.com", text: "Hi! Can you review my resume design?", createdAt: "2026-06-05T18:00:00Z" },
    { id: "m5", studentEmail: "priya.nair@demo.com", mentorEmail: "mentor@demo.com", senderType: "mentor", senderEmail: "mentor@demo.com", text: "Of course! Drop the link here.", createdAt: "2026-06-05T18:10:00Z" },
    { id: "m6", studentEmail: "priya.nair@demo.com", mentorEmail: "mentor@demo.com", senderType: "student", senderEmail: "priya.nair@demo.com", text: "I have shared the resume draft in the Google drive link.", createdAt: "2026-06-05T18:15:00Z" }
  ]
}

export default function MentorPage() {
  const { user, setUser } = useUser()
  const { lang, t } = useLanguage()
  const router = useRouter()

  // Custom Local translations
  const loc = useMemo(() => {
    return lang === "bn" ? localTranslations.bn : localTranslations.en
  }, [lang])

  // Active Navigation Tab State
  const [activeTab, setActiveTab] = useState<string>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  // Real Database States
  const [dbConversations, setDbConversations] = useState<Conversation[]>([])
  const [dbPendingRequests, setDbPendingRequests] = useState<PendingRequest[]>([])
  const [dbMessages, setDbMessages] = useState<MentorMessage[]>([])
  
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [requestActionLoading, setRequestActionLoading] = useState<Record<string, boolean>>({})

  // Chat messaging states
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [chatMobileView, setChatMobileView] = useState<"list" | "pane">("list") // for mobile chat responsive toggle
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const messageEndRef = useRef<HTMLDivElement>(null)

  // Interactive LocalStorage persistent states
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([])
  const [schedules, setSchedules] = useState<ScheduledSession[]>([])
  const [studentProgress, setStudentProgress] = useState<Record<string, number>>({})
  
  // Note Form State
  const [noteStudentEmail, setNoteStudentEmail] = useState("")
  const [noteCategory, setNoteCategory] = useState("Career Guidance")
  const [noteText, setNoteText] = useState("")
  const [noteFollowUp, setNoteFollowUp] = useState("Follow-up in 2 weeks")

  // Schedule Form Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [schedStudentEmail, setSchedStudentEmail] = useState("")
  const [schedDate, setSchedDate] = useState("")
  const [schedTime, setSchedTime] = useState("")
  const [schedCategory, setSchedCategory] = useState("Career Guidance")

  // Settings Profile Form State
  const [settingsName, setSettingsName] = useState("")
  const [settingsHeadline, setSettingsHeadline] = useState("")
  const [settingsBio, setSettingsBio] = useState("")
  const [settingsZoom, setSettingsZoom] = useState("")
  const [settingsMeet, setSettingsMeet] = useState("")
  const [settingsExpertise, setSettingsExpertise] = useState("")
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)

  // User auth validation
  useEffect(() => {
    if (!user) return
    if (user.type !== "mentor") {
      router.push("/")
    } else {
      // Pre-fill profile settings
      setSettingsName(user.name || "")
      setSettingsHeadline((user as any).headline || "")
      setSettingsBio(user.bio || "")
      setSettingsZoom((user as any).zoomLink || "")
      setSettingsMeet((user as any).meetLink || "")
      setSettingsExpertise(Array.isArray((user as any).expertise) ? ((user as any).expertise).join(", ") : "")
    }
  }, [user, router])

  // Load Real Data: conversations and requests
  useEffect(() => {
    async function fetchConversations() {
      if (!user?.email || user.type !== "mentor") return
      setLoadingConversations(true)
      try {
        const params = new URLSearchParams({
          action: "mentor-conversations",
          mentorEmail: user.email,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        const list = Array.isArray(data?.conversations) ? data.conversations : []
        setDbConversations(list)
      } catch (err) {
        console.error("Failed to fetch conversations", err)
      } finally {
        setLoadingConversations(false)
      }
    }

    async function fetchPendingRequests() {
      if (!user?.email || user.type !== "mentor") return
      try {
        const params = new URLSearchParams({
          action: "mentor-requests",
          mentorEmail: user.email,
          status: "pending",
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        setDbPendingRequests(Array.isArray(data?.requests) ? data.requests : [])
      } catch (error) {
        console.error("Failed to load mentor requests", error)
      }
    }

    fetchConversations()
    fetchPendingRequests()
  }, [user?.email, user?.type])

  // Load Real Data: messages when selected student changes
  useEffect(() => {
    async function fetchThread() {
      if (!user?.email || !selectedStudent) return
      
      // If it is a demo student, skip DB load
      if (selectedStudent.endsWith("@demo.com")) {
        setDbMessages([])
        return
      }

      setLoadingMessages(true)
      try {
        const params = new URLSearchParams({
          action: "messages",
          mentorEmail: user.email,
          studentEmail: selectedStudent,
        })
        const res = await fetch(`/api/mentorship?${params.toString()}`)
        const data = await res.json()
        setDbMessages(Array.isArray(data?.messages) ? data.messages : [])
      } catch (err) {
        console.error("Failed to fetch messages", err)
      } finally {
        setLoadingMessages(false)
      }
    }
    fetchThread()
  }, [selectedStudent, user?.email])

  // Load / Sync LocalStorage states
  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Session Notes
    const notesJson = localStorage.getItem("mentor_session_notes")
    if (notesJson) {
      setSessionNotes(JSON.parse(notesJson))
    } else {
      // Seed default notes
      const seedNotes: SessionNote[] = [
        { id: "n-seed-1", studentEmail: "arjun.mehta@demo.com", studentName: "Arjun Mehta", date: "2026-06-04", category: "Career Guidance", text: "Discussed long-term career goals and industry exploration. Suggested focusing on system design paradigms.", followUp: "Follow-up in 2 weeks" },
        { id: "n-seed-2", studentEmail: "priya.nair@demo.com", studentName: "Priya Nair", date: "2026-05-20", category: "Resume Review", text: "Reviewed resume layout and recommended expanding on internship impact points.", followUp: "Follow-up in 1 week" },
        { id: "n-seed-3", studentEmail: "rohan.singh@demo.com", studentName: "Rohan Singh", date: "2026-05-18", category: "Mock Interview", text: "Conducted mock interview on web fundamentals. Code readability was good but algorithmic complexity needs practice.", followUp: "Follow-up completed" }
      ]
      localStorage.setItem("mentor_session_notes", JSON.stringify(seedNotes))
      setSessionNotes(seedNotes)
    }

    // 2. Scheduled Sessions
    const schedJson = localStorage.getItem("mentor_schedules")
    if (schedJson) {
      setSchedules(JSON.parse(schedJson))
    } else {
      const seedScheds: ScheduledSession[] = [
        { id: "s-seed-1", studentEmail: "arjun.mehta@demo.com", studentName: "Arjun Mehta", date: "2026-06-06", time: "16:00", category: "Career Guidance", status: "upcoming" },
        { id: "s-seed-2", studentEmail: "priya.nair@demo.com", studentName: "Priya Nair", date: "2026-06-07", time: "11:00", category: "Resume Review", status: "upcoming" },
        { id: "s-seed-3", studentEmail: "rohan.singh@demo.com", studentName: "Rohan Singh", date: "2026-06-08", time: "14:00", category: "Mock Interview", status: "upcoming" }
      ]
      localStorage.setItem("mentor_schedules", JSON.stringify(seedScheds))
      setSchedules(seedScheds)
    }

    // 3. Student Progress Map
    const progJson = localStorage.getItem("mentor_student_progress")
    if (progJson) {
      setStudentProgress(JSON.parse(progJson))
    } else {
      const seedProgress = {
        "arjun.mehta@demo.com": 75,
        "priya.nair@demo.com": 60,
        "rohan.singh@demo.com": 40,
        "sneha.iyer@demo.com": 80
      }
      localStorage.setItem("mentor_student_progress", JSON.stringify(seedProgress))
      setStudentProgress(seedProgress)
    }
  }, [])

  // Auto-scroll chat to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [dbMessages, selectedStudent])

  // Merge Real & Demo data lists
  const allConversations = useMemo(() => {
    // Prevent duplicates if real database email matches demo email
    const realEmails = new Set(dbConversations.map(c => c.studentEmail.toLowerCase()))
    const filteredDemo = demoConversations.filter(c => !realEmails.has(c.studentEmail.toLowerCase()))
    return [...dbConversations, ...filteredDemo]
  }, [dbConversations])

  const allRequests = useMemo(() => {
    const realEmails = new Set(dbPendingRequests.map(r => r.studentEmail.toLowerCase()))
    const filteredDemo = demoRequests.filter(r => !realEmails.has(r.studentEmail.toLowerCase()))
    return [...dbPendingRequests, ...filteredDemo]
  }, [dbPendingRequests])

  // Get current active conversation
  const selectedConversation = useMemo(() => {
    return allConversations.find(c => c.studentEmail === selectedStudent) || null
  }, [allConversations, selectedStudent])

  // Get messages for current active student (real db or demo)
  const currentMessages = useMemo(() => {
    if (!selectedStudent) return []
    if (selectedStudent.endsWith("@demo.com")) {
      return demoMessages[selectedStudent] || []
    }
    return dbMessages
  }, [selectedStudent, dbMessages])

  // Helper: Name resolver
  const getStudentName = (email: string) => {
    const match = allConversations.find(c => c.studentEmail === email) || allRequests.find(r => r.studentEmail === email)
    return match?.studentName || email
  };

  // Actions: Accept / Decline connection requests
  async function respondRequest(studentEmail: string, decision: "accepted" | "rejected") {
    if (!user?.email) return

    // If it is a demo student, perform local simulation
    if (studentEmail.endsWith("@demo.com")) {
      setDbPendingRequests(prev => prev.filter(r => r.studentEmail !== studentEmail))
      // If accepted, add to conversations with local demo marker
      if (decision === "accepted") {
        const mockStudent = demoRequests.find(r => r.studentEmail === studentEmail)
        const newConv: Conversation = {
          studentEmail,
          studentName: mockStudent?.studentName || "",
          studentMbti: mockStudent?.studentMbti || "INTJ",
          lastMessage: "Connection Request Accepted!",
          lastMessageAt: new Date().toISOString(),
          isDemo: true
        }
        // Save seed message for newly accepted demo student
        demoMessages[studentEmail] = [
          { id: "m-accept-" + Date.now(), studentEmail, mentorEmail: user.email, senderType: "mentor", senderEmail: user.email, text: "Welcome to mentorship! How can I assist you with your career goals?", createdAt: new Date().toISOString() }
        ]
        
        // Add to local state progress
        const updatedProgress = { ...studentProgress, [studentEmail]: 20 }
        localStorage.setItem("mentor_student_progress", JSON.stringify(updatedProgress))
        setStudentProgress(updatedProgress)

        setDbConversations(prev => [newConv, ...prev])
        setSelectedStudent(studentEmail)
        setActiveTab("chat")
        setChatMobileView("pane")
      }
      return
    }

    const key = `${studentEmail}:${decision}`
    setRequestActionLoading(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "respond-request",
          studentEmail,
          mentorEmail: user.email,
          decision,
        }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        setDbPendingRequests(prev => prev.filter(r => r.studentEmail !== studentEmail))
        if (decision === "accepted") {
          const alreadyExists = dbConversations.some(c => c.studentEmail === studentEmail)
          if (!alreadyExists) {
            const newConv: Conversation = {
              studentEmail,
              studentName: "",
              studentMbti: "",
              lastMessage: "",
              lastMessageAt: null,
            }
            setDbConversations(prev => [newConv, ...prev])
          }
          setSelectedStudent(studentEmail)
          setActiveTab("chat")
          setChatMobileView("pane")
        }
      }
    } catch (error) {
      console.error("Failed to respond to request", error)
    } finally {
      setRequestActionLoading(prev => ({ ...prev, [key]: false }))
    }
  }

  // Actions: Send chat reply message
  async function sendReply() {
    if (!user?.email || !selectedStudent || !draft.trim()) return
    setSending(true)

    // Demo reply simulation
    if (selectedStudent.endsWith("@demo.com")) {
      const newMsg: MentorMessage = {
        id: "msg-" + Date.now(),
        studentEmail: selectedStudent,
        mentorEmail: user.email,
        senderType: "mentor",
        senderEmail: user.email,
        text: draft.trim(),
        createdAt: new Date().toISOString()
      }
      if (!demoMessages[selectedStudent]) demoMessages[selectedStudent] = []
      demoMessages[selectedStudent].push(newMsg)
      
      // Update last message in active tab
      const listCopy = [...demoConversations]
      const target = listCopy.find(c => c.studentEmail === selectedStudent)
      if (target) {
        target.lastMessage = draft.trim()
        target.lastMessageAt = new Date().toISOString()
      }

      setDraft("")
      setSending(false)

      // Trigger automatic simulated response from demo student after 1.5 seconds!
      setTimeout(() => {
        const responses = [
          "Awesome! I will look into that and update my roadmap today.",
          "Understood, thank you for the feedback. Should I log this in my notes?",
          "That makes sense. Can we discuss this in our next scheduled call?",
          "Got it, thanks. I will submit the updated documents by tonight."
        ]
        const randomText = responses[Math.floor(Math.random() * responses.length)]
        const autoReply: MentorMessage = {
          id: "msg-reply-" + Date.now(),
          studentEmail: selectedStudent,
          mentorEmail: user.email,
          senderType: "student",
          senderEmail: selectedStudent,
          text: randomText,
          createdAt: new Date().toISOString()
        }
        demoMessages[selectedStudent].push(autoReply)
        
        // Force refresh state
        setDbMessages(prev => [...prev])
      }, 1500)
      return
    }

    try {
      const res = await fetch("/api/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-message",
          studentEmail: selectedStudent,
          mentorEmail: user.email,
          senderEmail: user.email,
          senderType: "mentor",
          text: draft.trim(),
        }),
      })
      const data = await res.json()
      if (res.ok && data?.message) {
        setDbMessages(prev => [...prev, data.message])
        setDraft("")
      }
    } catch (err) {
      console.error("Failed to send message", err)
    } finally {
      setSending(false)
    }
  }

  // Actions: Save Profile settings to database
  async function saveProfileSettings(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.email) return
    setSettingsLoading(true)
    setSettingsSuccess(false)

    try {
      const parsedExpertise = settingsExpertise
        .split(",")
        .map(s => s.trim())
        .filter(Boolean)

      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-profile",
          email: user.email,
          type: "mentor",
          name: settingsName,
          headline: settingsHeadline,
          bio: settingsBio,
          zoomLink: settingsZoom,
          meetLink: settingsMeet,
          expertise: parsedExpertise,
        }),
      })
      const data = await res.json()
      if (res.ok && data?.success) {
        setUser(data.user)
        setSettingsSuccess(true)
        setTimeout(() => setSettingsSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Failed to update profile", err)
    } finally {
      setSettingsLoading(false)
    }
  }

  // Actions: Create Session Note
  function handleSaveNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteStudentEmail || !noteText.trim()) return

    const studentName = getStudentName(noteStudentEmail)
    const newNote: SessionNote = {
      id: "note-" + Date.now(),
      studentEmail: noteStudentEmail,
      studentName,
      date: new Date().toISOString().split("T")[0],
      category: noteCategory,
      text: noteText.trim(),
      followUp: noteFollowUp
    }

    const updated = [newNote, ...sessionNotes]
    setSessionNotes(updated)
    localStorage.setItem("mentor_session_notes", JSON.stringify(updated))
    
    // reset form
    setNoteText("")
    // redirect to notes tab
    setActiveTab("notes")
  }

  // Actions: Delete Session Note
  function handleDeleteNote(id: string) {
    const updated = sessionNotes.filter(n => n.id !== id)
    setSessionNotes(updated)
    localStorage.setItem("mentor_session_notes", JSON.stringify(updated))
  }

  // Actions: Create scheduled session
  function handleScheduleSession(e: React.FormEvent) {
    e.preventDefault()
    if (!schedStudentEmail || !schedDate || !schedTime) return

    const studentName = getStudentName(schedStudentEmail)
    const newSession: ScheduledSession = {
      id: "sched-" + Date.now(),
      studentEmail: schedStudentEmail,
      studentName,
      date: schedDate,
      time: schedTime,
      category: schedCategory,
      status: "upcoming"
    }

    const updated = [newSession, ...schedules].sort((a, b) => a.date.localeCompare(b.date))
    setSchedules(updated)
    localStorage.setItem("mentor_schedules", JSON.stringify(updated))

    setShowScheduleModal(false)
    setSchedStudentEmail("")
    setSchedDate("")
    setSchedTime("")
  }

  // Actions: Update Student Progress Slider
  function handleProgressChange(email: string, val: number) {
    const updated = { ...studentProgress, [email]: val }
    setStudentProgress(updated)
    localStorage.setItem("mentor_student_progress", JSON.stringify(updated))
  }

  // Action: Logout
  async function handleLogout() {
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
      router.push("/")
    }
  }

  // MBTI theme color resolver
  const getMbtiColorClasses = (mbti?: string) => {
    if (!mbti) return "bg-gray-100 text-gray-700 border-gray-200"
    const type = mbti.toUpperCase()
    if (type.startsWith("I") && type.endsWith("J")) return "bg-indigo-50 text-indigo-700 border-indigo-100"
    if (type.startsWith("I")) return "bg-purple-50 text-purple-700 border-purple-100"
    if (type.startsWith("E") && type.endsWith("J")) return "bg-amber-50 text-amber-700 border-amber-100"
    if (type.startsWith("E")) return "bg-orange-50 text-orange-700 border-orange-100"
    return "bg-teal-50 text-teal-700 border-teal-100"
  }

  // Guest view redirect if not logged in
  if (!user || user.type !== "mentor") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-white mb-6 text-lg font-medium">{loc.loginRequired}</p>
          <Link href="/" className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition duration-200 block text-center">
            {loc.goHome}
          </Link>
        </div>
      </div>
    )
  }

  // Navigation Items with Icons & Badge counts
  const menuItems = [
    { id: "dashboard", label: loc.dashboard, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
    )},
    { id: "requests", label: loc.requests, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
    ), badge: allRequests.length > 0 ? allRequests.length : null },
    { id: "mentees", label: loc.mentees, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    )},
    { id: "calendar", label: loc.calendar, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { id: "zoom", label: loc.zoom, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    )},
    { id: "chat", label: loc.chat, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    )},
    { id: "progress", label: loc.progress, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
    { id: "notes", label: loc.notes, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
    )},
    { id: "analytics", label: loc.analytics, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
    )},
    { id: "settings", label: loc.settings, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    )}
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      
      {/* 1. SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-[#0b1329] text-white flex flex-col transform transition-transform duration-300 select-none
        lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Sidebar Brand Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">CareerLeader</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md uppercase">Mentor</span>
          </div>
          {/* Close button for mobile drawer */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Sidebar Next Session Widget */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0f1a36]/50">
          <h4 className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{loc.nextSession}</h4>
          {schedules.filter(s => s.status === "upcoming").slice(0, 1).map(s => (
            <div key={s.id} className="mt-2.5">
              <p className="text-sm font-semibold text-white">{s.date} • {s.time}</p>
              <div className="flex items-center justify-between gap-2 mt-1">
                <p className="text-xs text-slate-300 truncate">with {s.studentName}</p>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-medium truncate">{s.category}</span>
              </div>
              <a 
                href={user.zoomLink || "https://zoom.us/join"} 
                target="_blank" 
                rel="noreferrer"
                className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold transition"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M15.42 10.42v3.16l4.55 2.28a1 1 0 0 0 1.45-.89V9.03a1 1 0 0 0-1.45-.89l-4.55 2.28ZM3 18h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2Z" /></svg>
                {loc.joinZoom}
              </a>
            </div>
          ))}
          {schedules.filter(s => s.status === "upcoming").length === 0 && (
            <p className="text-xs text-slate-500 mt-2 italic">No upcoming sessions</p>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Sidebar Footer Banner */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-4 bg-gradient-to-br from-indigo-950 to-blue-950 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">{loc.shareKnowledge}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{loc.inspireGrowth}</p>
          </div>
        </div>
      </aside>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        ></div>
      )}

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP MOBILE / HEADER BAR */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="hidden md:block text-xl font-bold text-slate-900 capitalize">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 rounded-full shadow-xs animate-pulse">
              🛡️ {loc.demoWorkspace}
            </span>
            <LanguageToggle />
            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile Brief Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">{user.email}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-150 active:scale-95"
                title={loc.logout}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
              <Link href="/" className="hidden lg:flex items-center gap-1.5 text-xs text-blue-600 font-semibold px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition duration-150">
                {loc.backToHome} →
              </Link>
            </div>
          </div>
        </header>

        {/* 3. SCROLLABLE TAB PAGE WORKSPACE */}
        <main className={`flex-1 ${
          activeTab === 'chat'
            ? 'overflow-hidden flex flex-col p-2 lg:p-4'
            : 'overflow-y-auto p-4 lg:p-8'
        }`}>
          
          {/* TAB: DASHBOARD VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Welcome Alert Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{loc.welcomeTitle}</h1>
                  <p className="text-slate-500 mt-0.5 text-sm">{loc.welcomeSubtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition duration-150 active:scale-98 flex items-center gap-2"
                  >
                    <span>➕ {loc.scheduleNew}</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition duration-200 hover:shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">👥</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{allConversations.length}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{loc.activeMentees}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">+2 {loc.thisMonth}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition duration-200 hover:shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">📅</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{schedules.length + 12}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{loc.sessionsThisMonth}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">+12% {loc.fromLastMonth}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition duration-200 hover:shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">🕒</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">45.5</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{loc.hoursMentored}</p>
                    <span className="text-[11px] text-emerald-600 font-semibold">+8.5 {loc.thisMonth}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:-translate-y-0.5 transition duration-200 hover:shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">⭐</div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">4.9</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{loc.avgRating}</p>
                    <span className="text-[11px] text-slate-500 font-medium">from 18 mentees</span>
                  </div>
                </div>
              </div>

              {/* 3-Column Middle Dashboard Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Column Left (2 columns wide on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Widget: Student Requests */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{loc.pendingReq}</h3>
                        {allRequests.length > 0 && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{allRequests.length}</span>
                        )}
                      </div>
                      <button onClick={() => setActiveTab("requests")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{loc.viewAll}</button>
                    </div>
                    
                    <div className="p-5 divide-y divide-slate-100">
                      {allRequests.slice(0, 2).map(req => (
                        <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {req.studentName ? req.studentName.charAt(0) : "S"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-slate-900">{req.studentName || req.studentEmail}</p>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getMbtiColorClasses(req.studentMbti)}`}>
                                  {req.studentMbti || "N/A"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{req.studentEmail}</p>
                              <p className="text-xs text-slate-600 mt-1 italic line-clamp-1">{req.messagePreview}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => respondRequest(req.studentEmail, "accepted")}
                              disabled={requestActionLoading[`${req.studentEmail}:accepted`]}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 transition"
                            >
                              {loc.accept}
                            </button>
                            <button
                              onClick={() => respondRequest(req.studentEmail, "rejected")}
                              disabled={requestActionLoading[`${req.studentEmail}:rejected`]}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-60 transition"
                            >
                              {loc.decline}
                            </button>
                          </div>
                        </div>
                      ))}
                      {allRequests.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No pending requests.</p>
                      )}
                    </div>
                  </div>

                  {/* Widget: Active Mentees Progress */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{loc.activeMentees}</h3>
                      <button onClick={() => setActiveTab("mentees")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{loc.viewAll}</button>
                    </div>

                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {allConversations.slice(0, 4).map(c => {
                        const progress = studentProgress[c.studentEmail] || 0
                        return (
                          <div key={c.studentEmail} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition duration-150">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                                  {c.studentName ? c.studentName.charAt(0) : "S"}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-slate-900 leading-tight">{c.studentName || "Student"}</p>
                                  <span className="text-[10px] text-slate-500 font-medium">Career Guidance</span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getMbtiColorClasses(c.studentMbti)}`}>
                                {c.studentMbti || "INTJ"}
                              </span>
                            </div>
                            <div className="mt-3.5">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1">
                                <span>{loc.progressLabel}</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {allConversations.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4 col-span-2">No active mentees yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Widget: Session Notes */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{loc.notes}</h3>
                      <button onClick={() => setActiveTab("notes")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{loc.viewAll}</button>
                    </div>
                    <div className="p-5 space-y-4">
                      {sessionNotes.slice(0, 2).map(n => (
                        <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-slate-900">{n.studentName}</span>
                              <span className="text-[10px] text-slate-500 ml-2">{n.date}</span>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {n.followUp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-2 leading-relaxed">{n.text}</p>
                        </div>
                      ))}
                      {sessionNotes.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-4">No session notes logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column Right (1 column wide) */}
                <div className="space-y-6">
                  
                  {/* Widget: Upcoming Sessions */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{loc.upcomingSessions}</h3>
                      <button onClick={() => setActiveTab("calendar")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{loc.viewCalendar}</button>
                    </div>
                    <div className="p-5 space-y-4">
                      {schedules.filter(s => s.status === "upcoming").slice(0, 3).map(s => {
                        const [, mMonth, mDay] = s.date.split("-")
                        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
                        const monthLabel = mMonth ? months[parseInt(mMonth) - 1] : "MAY"
                        return (
                          <div key={s.id} className="flex items-center gap-3">
                            <div className="w-12 h-14 bg-rose-50 border border-rose-100 rounded-xl flex flex-col items-center justify-center shrink-0 select-none shadow-xs">
                              <span className="text-[9px] font-bold text-rose-500 uppercase leading-none">{monthLabel}</span>
                              <span className="text-lg font-bold text-rose-700 leading-tight mt-0.5">{mDay || "24"}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 leading-tight">{s.studentName}</h4>
                                <span className="text-[10px] text-slate-500 font-semibold">{s.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{s.category}</p>
                            </div>
                            <a 
                              href={user.zoomLink || "https://zoom.us/join"} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white transition shrink-0"
                            >
                              {loc.join}
                            </a>
                          </div>
                        )
                      })}
                      {schedules.filter(s => s.status === "upcoming").length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-4 italic">No sessions scheduled.</p>
                      )}
                    </div>
                  </div>

                  {/* Widget: Recent Messages */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{loc.recentMessages}</h3>
                      <button onClick={() => setActiveTab("chat")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">{loc.seeAll}</button>
                    </div>
                    <div className="p-4 space-y-3">
                      {allConversations.slice(0, 3).map(c => (
                        <button 
                          key={c.studentEmail} 
                          onClick={() => {
                            setSelectedStudent(c.studentEmail)
                            setActiveTab("chat")
                            setChatMobileView("pane")
                          }}
                          className="w-full text-left p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition duration-150 flex gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {c.studentName ? c.studentName.charAt(0) : "S"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 leading-tight">{c.studentName || c.studentEmail}</span>
                              <span className="text-[9px] text-slate-400">10:30 AM</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 truncate leading-snug">{c.lastMessage || "No messages yet"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Widget: Notifications */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <h3 className="font-bold text-slate-900 text-base">{loc.notifications}</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="flex gap-3 items-start text-xs leading-relaxed">
                        <span className="text-lg shrink-0">➕</span>
                        <div>
                          <p className="font-semibold text-slate-800">New request from Neha Kapoor</p>
                          <span className="text-[10px] text-slate-400">2 hours ago</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start text-xs leading-relaxed">
                        <span className="text-lg shrink-0">⭐</span>
                        <div>
                          <p className="font-semibold text-slate-800">Arjun Mehta rated you 5 stars</p>
                          <span className="text-[10px] text-slate-400">5 hours ago</span>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start text-xs leading-relaxed">
                        <span className="text-lg shrink-0">⏰</span>
                        <div>
                          <p className="font-semibold text-slate-800">Reminder: Zoom session tomorrow at 11 AM</p>
                          <span className="text-[10px] text-slate-400">1 day ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Impact Banner */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-indigo-800 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-lg">🏆</div>
                  <div>
                    <h3 className="font-bold text-lg">{loc.impactTitle}</h3>
                    <p className="text-xs text-white/80 mt-0.5">{loc.impactText.replace("{count}", String(allConversations.length))}</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white text-indigo-700 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-md transition duration-150 active:scale-98 self-start md:self-auto shrink-0 relative z-10">
                  {loc.impactReport}
                </button>
              </div>

            </div>
          )}

          {/* TAB: REQUESTS VIEW */}
          {activeTab === "requests" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-4xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">{loc.requests}</h2>
              <div className="divide-y divide-slate-100">
                {allRequests.map(req => (
                  <div key={req.id} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
                        {req.studentName ? req.studentName.charAt(0) : "S"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900">{req.studentName || req.studentEmail}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMbtiColorClasses(req.studentMbti)}`}>
                            {req.studentMbti || "N/A"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{req.studentEmail}</p>
                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed italic max-w-2xl">
                          "{req.messagePreview || "Hi, I would like to connect with you for mentorship!"}"
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => respondRequest(req.studentEmail, "accepted")}
                        disabled={requestActionLoading[`${req.studentEmail}:accepted`]}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 shadow-md transition active:scale-98"
                      >
                        {loc.accept}
                      </button>
                      <button
                        onClick={() => respondRequest(req.studentEmail, "rejected")}
                        disabled={requestActionLoading[`${req.studentEmail}:rejected`]}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-60 transition active:scale-98"
                      >
                        {loc.decline}
                      </button>
                    </div>
                  </div>
                ))}
                {allRequests.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm italic">No pending mentorship requests at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MY MENTEES LIST */}
          {activeTab === "mentees" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base">{loc.allMetees} ({allConversations.length})</h3>
                <div className="relative max-w-xs w-full">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                  <input 
                    type="text" 
                    placeholder={loc.searchPlaceholder}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allConversations.map(c => {
                  const progress = studentProgress[c.studentEmail] || 0
                  return (
                    <div key={c.studentEmail} className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-200 transition duration-200">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                              {c.studentName ? c.studentName.charAt(0) : "S"}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 leading-tight">{c.studentName || "Student"}</h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{c.studentEmail}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMbtiColorClasses(c.studentMbti)}`}>
                            {c.studentMbti || "INTJ"}
                          </span>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-1.5">
                            <span>{loc.progressLabel}</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200/50">
                            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-slate-100 flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedStudent(c.studentEmail)
                            setActiveTab("chat")
                            setChatMobileView("pane")
                          }}
                          className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold shadow-xs transition active:scale-98 block text-center"
                        >
                          💬 {loc.chat}
                        </button>
                        <button 
                          onClick={() => {
                            setNoteStudentEmail(c.studentEmail)
                            setActiveTab("notes")
                          }}
                          className="flex-1 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition active:scale-98"
                        >
                          📝 {loc.addNote}
                        </button>
                      </div>
                    </div>
                  )
                })}
                {allConversations.length === 0 && (
                  <p className="text-slate-400 text-sm italic py-12 text-center col-span-3">{loc.noMentees}</p>
                )}
              </div>
            </div>
          )}

          {/* TAB: SESSIONS & CALENDAR */}
          {activeTab === "calendar" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base">{loc.calendar}</h3>
                <button 
                  onClick={() => setShowScheduleModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition"
                >
                  ➕ {loc.scheduleNew}
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex gap-4">
                  <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold">Next 7 Days</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {schedules.map(s => {
                    const isUpcoming = s.status === "upcoming"
                    return (
                      <div key={s.id} className="p-5 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
                            isUpcoming ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                            🗓️
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{s.studentName}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.date} • {s.time} • {s.category}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                            isUpcoming ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-100 border-slate-200 text-slate-600"
                          }`}>
                            {isUpcoming ? "Upcoming" : "Completed"}
                          </span>
                          {isUpcoming && (
                            <a 
                              href={user.zoomLink || "https://zoom.us/join"} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              {loc.join}
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MEETINGS (ZOOM) LINK SETTINGS */}
          {activeTab === "zoom" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-2xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-base">{loc.zoom}</h3>
                <p className="text-xs text-slate-500 mt-1">Configure your online classrooms where you interact with mentees.</p>
              </div>

              <form onSubmit={saveProfileSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{loc.zoomLink}</label>
                  <input 
                    type="url"
                    value={settingsZoom}
                    onChange={e => setSettingsZoom(e.target.value)}
                    placeholder="https://zoom.us/j/1234567890"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{loc.meetLink}</label>
                  <input 
                    type="url"
                    value={settingsMeet}
                    onChange={e => setSettingsMeet(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {settingsSuccess && (
                  <p className="text-xs text-green-600 font-bold bg-green-50 p-2.5 rounded-lg border border-green-200">✓ {loc.profileSaved}</p>
                )}

                <button 
                  type="submit" 
                  disabled={settingsLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-60"
                >
                  {settingsLoading ? "Saving..." : loc.saveProfile}
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <a href={settingsZoom || "https://zoom.us"} target="_blank" rel="noreferrer" className="flex-1 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-center transition">
                  <span className="text-2xl block mb-1">📹</span>
                  <span className="text-xs font-bold text-slate-800">Launch Zoom Room</span>
                </a>
                <a href={settingsMeet || "https://meet.google.com"} target="_blank" rel="noreferrer" className="flex-1 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-center transition">
                  <span className="text-2xl block mb-1">💬</span>
                  <span className="text-xs font-bold text-slate-800">Launch Google Meet</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB: MESSAGES / CHAT CLIENT */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-1 min-h-[300px]">
              
              {/* CHAT CLIENT: LEFT SIDEBAR (Hide on mobile in pane view) */}
              <div className={`
                w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50
                ${chatMobileView === "pane" ? "hidden md:flex" : "flex"}
              `}>
                <div className="p-4 border-b border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-base">{loc.chat}</h3>
                  <div className="mt-2.5 relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                    <input 
                      type="text" 
                      placeholder={loc.searchPlaceholder}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {allConversations.map(c => {
                    const isSelected = selectedStudent === c.studentEmail
                    return (
                      <button
                        key={c.studentEmail}
                        onClick={() => {
                          setSelectedStudent(c.studentEmail)
                          setChatMobileView("pane")
                        }}
                        className={`w-full text-left p-4 flex gap-3 transition border-l-4 ${
                          isSelected 
                            ? "bg-blue-50/70 border-blue-600" 
                            : "border-transparent hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {c.studentName ? c.studentName.charAt(0) : "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 leading-tight truncate">{c.studentName || c.studentEmail}</span>
                            <span className={`text-[9px] font-bold px-1.5 rounded-md border shrink-0 scale-90 ${getMbtiColorClasses(c.studentMbti)}`}>
                              {c.studentMbti || "N/A"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.studentEmail}</p>
                          <p className="text-xs text-slate-600 mt-1.5 truncate leading-snug">{c.lastMessage || "No messages"}</p>
                        </div>
                      </button>
                    )
                  })}
                  {allConversations.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-8 italic">{loc.noConversations}</p>
                  )}
                </div>
              </div>

              {/* CHAT CLIENT: RIGHT MESSAGES DIALOG (Hide on mobile in list view) */}
              <div className={`
                flex-1 flex flex-col min-w-0 bg-white
                ${chatMobileView === "list" ? "hidden md:flex" : "flex"}
              `}>
                
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/30">
                      <div className="flex items-center gap-3">
                        {/* Mobile Back Button */}
                        <button 
                          onClick={() => setChatMobileView("list")}
                          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                        >
                          ← {loc.backToConversations}
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                          {selectedConversation.studentName ? selectedConversation.studentName.charAt(0) : "S"}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">{selectedConversation.studentName || selectedConversation.studentEmail}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] text-slate-500 font-medium">Active</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMbtiColorClasses(selectedConversation.studentMbti)}`}>
                        MBTI: {selectedConversation.studentMbti || "N/A"}
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                      {loadingMessages ? (
                        <p className="text-center text-slate-400 text-xs py-8">{loc.loading}</p>
                      ) : currentMessages.length === 0 ? (
                        <p className="text-center text-slate-400 text-xs py-8 italic">{loc.noMessages}</p>
                      ) : (
                        currentMessages.map(msg => {
                          const isMe = msg.senderType === "mentor"
                          return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs shadow-xs border ${
                                isMe 
                                  ? "bg-blue-600 border-blue-500 text-white rounded-br-none" 
                                  : "bg-white border-slate-200 text-slate-800 rounded-bl-none"
                              }`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <span className={`text-[9px] mt-1 block text-right font-medium ${isMe ? "text-blue-200" : "text-slate-400"}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      )}
                      <div ref={messageEndRef} />
                    </div>

                    {/* Messages Input Draft Footer */}
                    <div className="p-4 border-t border-slate-200 flex gap-2.5 bg-white shrink-0">
                      <input 
                        type="text" 
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendReply()}
                        placeholder={loc.replyPlaceholder}
                        disabled={sending}
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60 bg-slate-50 focus:bg-white transition"
                      />
                      <button 
                        onClick={sendReply}
                        disabled={sending || !draft.trim()}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50"
                      >
                        {sending ? "..." : loc.send}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/20">
                    <span className="text-4xl mb-3">💬</span>
                    <p className="text-sm font-semibold text-slate-800">Select a student thread</p>
                    <p className="text-xs text-slate-500 mt-0.5">Pick one of your mentees from the left to start text chat.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PROGRESS TRACKING */}
          {activeTab === "progress" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-4xl mx-auto space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-base">{loc.progress}</h3>
                <p className="text-xs text-slate-500 mt-1">Control milestones and curriculum percentages of your mentees.</p>
              </div>

              <div className="space-y-6">
                {allConversations.map(c => {
                  const progress = studentProgress[c.studentEmail] || 0
                  return (
                    <div key={c.studentEmail} className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                            {c.studentName ? c.studentName.charAt(0) : "S"}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 leading-tight">{c.studentName || c.studentEmail}</h4>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">Curriculum: Career Guidance</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getMbtiColorClasses(c.studentMbti)}`}>
                          {c.studentMbti || "INTJ"}
                        </span>
                      </div>

                      <div className="mt-5 flex items-center gap-5">
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={progress}
                          onChange={e => handleProgressChange(c.studentEmail, parseInt(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-bold text-blue-600 shrink-0 w-12 text-right">{progress}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB: SESSION NOTES EDITOR */}
          {activeTab === "notes" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* Form Input block */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">{loc.addNote}</h4>
                <form onSubmit={handleSaveNote} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.selectStudent}</label>
                    <select 
                      value={noteStudentEmail} 
                      onChange={e => setNoteStudentEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">-- Choose Student --</option>
                      {allConversations.map(c => (
                        <option key={c.studentEmail} value={c.studentEmail}>{c.studentName || c.studentEmail}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.category}</label>
                    <select 
                      value={noteCategory} 
                      onChange={e => setNoteCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    >
                      <option value="Career Guidance">Career Guidance</option>
                      <option value="Resume Review">Resume Review</option>
                      <option value="Mock Interview">Mock Interview</option>
                      <option value="General Check-in">General Check-in</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.followUp}</label>
                    <select 
                      value={noteFollowUp} 
                      onChange={e => setNoteFollowUp(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    >
                      <option value="Follow-up in 1 week">Follow-up in 1 week</option>
                      <option value="Follow-up in 2 weeks">Follow-up in 2 weeks</option>
                      <option value="Follow-up completed">Follow-up completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Session Detail</label>
                    <textarea 
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      required
                      placeholder={loc.notePlaceholder}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    💾 {loc.saveNote}
                  </button>
                </form>
              </div>

              {/* Notes List Display */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">{loc.notes}</h4>
                <div className="space-y-4">
                  {sessionNotes.map(n => (
                    <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 relative group">
                      <button 
                        onClick={() => handleDeleteNote(n.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-rose-600 text-sm"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                      <div className="flex flex-wrap items-center gap-2 pr-6">
                        <span className="text-xs font-bold text-slate-900">{n.studentName}</span>
                        <span className="text-[10px] text-slate-500">• {n.date} • {n.category}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {n.followUp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                  {sessionNotes.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8 italic">{loc.noNotes}</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB: ANALYTICS DETAIL PAGE */}
          {activeTab === "analytics" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* Analytics Header Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SVG Chart: Sessions Over Time */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">{loc.sessionsChartTitle}</h3>
                  <div className="relative h-64 w-full">
                    {/* SVG Line Graph */}
                    <svg viewBox="0 0 400 200" className="w-full h-full">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="140" x2="380" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="40" y1="180" x2="380" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
                      
                      {/* Y-Axis labels */}
                      <text x="15" y="25" fill="#94a3b8" fontSize="10" fontWeight="bold">40</text>
                      <text x="15" y="65" fill="#94a3b8" fontSize="10" fontWeight="bold">30</text>
                      <text x="15" y="105" fill="#94a3b8" fontSize="10" fontWeight="bold">20</text>
                      <text x="15" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">10</text>
                      <text x="20" y="185" fill="#94a3b8" fontSize="10" fontWeight="bold">0</text>

                      {/* Line Chart path with gradients */}
                      <path 
                        d="M 60 170 L 120 120 L 180 150 L 240 80 L 300 110 L 360 40" 
                        fill="none" 
                        stroke="url(#chart-grad)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />

                      {/* Area Fill */}
                      <path 
                        d="M 60 170 L 120 120 L 180 150 L 240 80 L 300 110 L 360 40 L 360 180 L 60 180 Z" 
                        fill="url(#chart-area-grad)" 
                        opacity="0.15" 
                      />

                      {/* Data Dots */}
                      <circle cx="60" cy="170" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="120" cy="120" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="180" cy="150" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="240" cy="80" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="300" cy="110" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="360" cy="40" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

                      {/* X-Axis Labels */}
                      <text x="60" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">Apr 24</text>
                      <text x="120" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">May 1</text>
                      <text x="180" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">May 8</text>
                      <text x="240" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">May 15</text>
                      <text x="300" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">May 22</text>
                      <text x="360" y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontWeight="medium">Jun 6</text>

                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* SVG Donut Chart: Top Skills */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">{loc.skillsChartTitle}</h3>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 h-60">
                    
                    {/* Donut circle */}
                    <div className="relative w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {/* Gray base */}
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                        
                        {/* Segment 1: Career Guidance (40%) */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          fill="none" 
                          stroke="#3b82f6" 
                          strokeWidth="3.5" 
                          strokeDasharray="40 60" 
                          strokeDashoffset="0" 
                        />
                        
                        {/* Segment 2: Interview Prep (30%) */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          fill="none" 
                          stroke="#a855f7" 
                          strokeWidth="3.5" 
                          strokeDasharray="30 70" 
                          strokeDashoffset="-40" 
                        />

                        {/* Segment 3: Resume Review (20%) */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          fill="none" 
                          stroke="#f59e0b" 
                          strokeWidth="3.5" 
                          strokeDasharray="20 80" 
                          strokeDashoffset="-70" 
                        />

                        {/* Segment 4: Others (10%) */}
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="15.915" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="3.5" 
                          strokeDasharray="10 90" 
                          strokeDashoffset="-90" 
                        />
                      </svg>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-extrabold text-slate-900">4</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Domains</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-2 select-none">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded bg-blue-500"></span>
                        <span>Career Guidance: 40%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded bg-purple-500"></span>
                        <span>Interview Prep: 30%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded bg-amber-500"></span>
                        <span>Resume Review: 20%</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-3 h-3 rounded bg-emerald-500"></span>
                        <span>Others: 10%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROFILE & SETTINGS FORM */}
          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-2xl mx-auto">
              <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-4 mb-5">{loc.settings}</h3>

              <form onSubmit={saveProfileSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{loc.headline}</label>
                  <input 
                    type="text" 
                    value={settingsHeadline}
                    onChange={e => setSettingsHeadline(e.target.value)}
                    placeholder="e.g. Senior Software Engineer at Google"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{loc.expertise}</label>
                  <input 
                    type="text" 
                    value={settingsExpertise}
                    onChange={e => setSettingsExpertise(e.target.value)}
                    placeholder="e.g. JavaScript, System Design, Algorithms"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{loc.bio}</label>
                  <textarea 
                    value={settingsBio}
                    onChange={e => setSettingsBio(e.target.value)}
                    placeholder="Describe your career experience..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{loc.zoomLink}</label>
                  <input 
                    type="url" 
                    value={settingsZoom}
                    onChange={e => setSettingsZoom(e.target.value)}
                    placeholder="https://zoom.us/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">{loc.meetLink}</label>
                  <input 
                    type="url" 
                    value={settingsMeet}
                    onChange={e => setSettingsMeet(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {settingsSuccess && (
                  <p className="text-xs text-green-600 font-bold bg-green-50 p-2.5 rounded-lg border border-green-200">✓ {loc.profileSaved}</p>
                )}

                <button 
                  type="submit" 
                  disabled={settingsLoading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-60"
                >
                  {settingsLoading ? "Saving..." : loc.saveProfile}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* 4. MODAL: SCHEDULE SESSION */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <div onClick={() => setShowScheduleModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"></div>
          {/* container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl relative z-10 w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base">{loc.scheduleNew}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleScheduleSession} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.selectStudent}</label>
                <select 
                  value={schedStudentEmail} 
                  onChange={e => setSchedStudentEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                >
                  <option value="">-- Choose Student --</option>
                  {allConversations.map(c => (
                    <option key={c.studentEmail} value={c.studentEmail}>{c.studentName || c.studentEmail}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.category}</label>
                <select 
                  value={schedCategory} 
                  onChange={e => setSchedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                >
                  <option value="Career Guidance">Career Guidance</option>
                  <option value="Resume Review">Resume Review</option>
                  <option value="Mock Interview">Mock Interview</option>
                  <option value="General Check-in">General Check-in</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.date}</label>
                  <input 
                    type="date" 
                    value={schedDate}
                    onChange={e => setSchedDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">{loc.time}</label>
                  <input 
                    type="time" 
                    value={schedTime}
                    onChange={e => setSchedTime(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  {loc.close}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
