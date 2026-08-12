"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import DashboardLayout from "../components/DashboardLayout"
import { careerDetails } from "./careerDetailsData"
import careerCatalog from "../../data/careers.json"

interface Recommendation {
  id: string
  title: string
  description: string
  skills?: string[]
}

const ASSESSMENT_RECOMMENDATIONS_KEY = "assessment_recommended_career_ids"
const CAREER_ASSESSMENT_RECOMMENDATIONS_KEY = "career_assessment_recommendations"
const SECTOR_QUEST_DRAFT_KEY = "careerleader_career_worlds_game_v1"
const recommendationsById = new Map(
  (careerCatalog as Recommendation[]).map(career => [career.id, career])
)

function recommendationsFromIds(ids: string[]): Recommendation[] {
  return ids
    .map(id => recommendationsById.get(id))
    .filter((career): career is Recommendation => Boolean(career))
}

function cleanRecommendations(value: unknown): Recommendation[] {
  if (!Array.isArray(value)) return []
  const cleaned: Recommendation[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const raw = item as Record<string, unknown>
    const id = typeof raw.id === "string" ? raw.id.trim() : ""
    const title = typeof raw.title === "string" ? raw.title.trim() : ""
    if (!id || !title) continue
    cleaned.push({
      id,
      title,
      description: typeof raw.description === "string" ? raw.description : "",
      skills: Array.isArray(raw.skills)
        ? raw.skills.filter((skill): skill is string => typeof skill === "string")
        : [],
    })
    if (cleaned.length >= 5) break
  }
  return cleaned
}

type QuestionOption = {
  text: { en: string; bn: string }
  value: string
  sector?: 'higher_studies' | 'job' | 'entrepreneurship'
}

type Question = {
  id: string
  questionText: { en: string; bn: string }
  options: QuestionOption[]
}

type SectorQuestPreferences = {
  autoAdvance: boolean
  motion: boolean
  compact: boolean
  largeText: boolean
}

type SectorQuestDraft = {
  isAssessing?: boolean
  assessStep?: number
  generalSelected?: Record<number, string>
  confirmedSector?: 'higher_studies' | 'job' | 'entrepreneurship' | null
  sectorSelected?: Record<number, string>
  preferences?: Partial<SectorQuestPreferences>
  intake?: Partial<CareerIntake>
  gameAnswers?: Record<string, string | number>
}

type CareerIntake = {
  education: string
  favoriteSubjects: string[]
  interests: string[]
  skills: string[]
  confidence: number
  goal: string
  workStyle: string
  workEnvironment: string
}

const DEFAULT_CAREER_INTAKE: CareerIntake = {
  education: "",
  favoriteSubjects: [],
  interests: [],
  skills: [],
  confidence: 3,
  goal: "",
  workStyle: "",
  workEnvironment: "",
}

const INTAKE_OPTIONS = {
  education: ["Secondary school", "Higher secondary", "Diploma", "Bachelor's", "Master's or higher"],
  subjects: ["Programming", "Mathematics", "Science", "Business", "Design", "Communication", "Research", "Teaching"],
  interests: ["Solving problems", "Working with data", "Creating or designing", "Helping people", "Leading a team", "Building things"],
  skills: ["Communication", "Problem solving", "Teamwork", "Leadership", "Creativity", "Planning"],
  goals: ["Get a job", "Higher education", "Start a business", "Freelance", "Research", "Still exploring"],
  workStyles: ["Clear plan and routine", "Flexible and changing work", "Independent work", "Team-based work"],
  environments: ["Office", "Remote", "Hybrid", "Field or practical work"],
} as const

const INTAKE_BN: Record<string, string> = {
  "Secondary school": "মাধ্যমিক",
  "Higher secondary": "উচ্চ মাধ্যমিক",
  Diploma: "ডিপ্লোমা",
  "Bachelor's": "স্নাতক",
  "Master's or higher": "স্নাতকোত্তর বা তার বেশি",
  Programming: "প্রোগ্রামিং",
  Mathematics: "গণিত",
  Science: "বিজ্ঞান",
  Business: "ব্যবসা",
  Design: "ডিজাইন",
  Communication: "যোগাযোগ",
  Research: "গবেষণা",
  Teaching: "শিক্ষাদান",
  "Solving problems": "সমস্যা সমাধান",
  "Working with data": "ডেটা নিয়ে কাজ",
  "Creating or designing": "তৈরি বা ডিজাইন করা",
  "Helping people": "মানুষকে সাহায্য করা",
  "Leading a team": "দলকে নেতৃত্ব দেওয়া",
  "Building things": "কিছু তৈরি করা",
  "Problem solving": "সমস্যা সমাধান",
  Teamwork: "দলগত কাজ",
  Leadership: "নেতৃত্ব",
  Creativity: "সৃজনশীলতা",
  Planning: "পরিকল্পনা",
  "Get a job": "চাকরি করা",
  "Higher education": "উচ্চশিক্ষা",
  "Start a business": "ব্যবসা শুরু করা",
  Freelance: "ফ্রিল্যান্সিং",
  "Still exploring": "এখনও খুঁজছি",
  "Clear plan and routine": "পরিষ্কার পরিকল্পনা ও নিয়ম",
  "Flexible and changing work": "নমনীয় ও পরিবর্তনশীল কাজ",
  "Independent work": "একা কাজ",
  "Team-based work": "দলের সঙ্গে কাজ",
  Office: "অফিস",
  Remote: "রিমোট",
  Hybrid: "হাইব্রিড",
  "Field or practical work": "মাঠ বা হাতে-কলমে কাজ",
}

const GAME_SEQUENCE = [2, 6, 12, 20]

const DEFAULT_SECTOR_QUEST_PREFERENCES: SectorQuestPreferences = {
  autoAdvance: true,
  motion: true,
  compact: false,
  largeText: false,
}

const SECTOR_QUEST_PHASES = [
  {
    icon: "🎒",
    en: { name: "Build your loadout", hint: "Choose the world, mission, and power-up that excite you." },
    bn: { name: "লোডআউট তৈরি করুন", hint: "পছন্দের জগৎ, মিশন ও পাওয়ার-আপ বেছে নিন।" },
    total: 3,
  },
  {
    icon: "🌀",
    en: { name: "Open a portal", hint: "Enter a career world—or switch portals before you travel." },
    bn: { name: "পোর্টাল খুলুন", hint: "একটি ক্যারিয়ার জগতে প্রবেশ করুন অথবা যাওয়ার আগে পোর্টাল বদলান।" },
    total: 1,
  },
  {
    icon: "⚔️",
    en: { name: "Complete field missions", hint: "Make four decisions inside your chosen career world." },
    bn: { name: "ফিল্ড মিশন শেষ করুন", hint: "নির্বাচিত ক্যারিয়ার জগতে চারটি সিদ্ধান্ত নিন।" },
    total: 4,
  },
] as const

const CAREER_WORLDS = {
  higher_studies: {
    icon: "🏛️",
    en: {
      name: "Knowledge Citadel",
      role: "Scholar Explorer",
      description: "Research mysteries, master a field, and turn knowledge into new discoveries.",
      color: "from-violet-500 to-fuchsia-500",
    },
    bn: {
      name: "নলেজ সিটাডেল",
      role: "স্কলার এক্সপ্লোরার",
      description: "গবেষণার রহস্য সমাধান করুন, একটি বিষয়ে দক্ষ হন এবং জ্ঞানকে নতুন আবিষ্কারে রূপ দিন।",
      color: "from-violet-500 to-fuchsia-500",
    },
  },
  job: {
    icon: "🏙️",
    en: {
      name: "Teamwork City",
      role: "Impact Specialist",
      description: "Join skilled teams, solve real problems, and level up through practical work.",
      color: "from-cyan-400 to-blue-500",
    },
    bn: {
      name: "টিমওয়ার্ক সিটি",
      role: "ইমপ্যাক্ট স্পেশালিস্ট",
      description: "দক্ষ দলে যোগ দিন, বাস্তব সমস্যা সমাধান করুন এবং কাজের মাধ্যমে এগিয়ে যান।",
      color: "from-cyan-400 to-blue-500",
    },
  },
  entrepreneurship: {
    icon: "🏝️",
    en: {
      name: "Founder Frontier",
      role: "Venture Builder",
      description: "Spot an unmet need, build your own solution, and shape a venture from zero.",
      color: "from-amber-400 to-orange-500",
    },
    bn: {
      name: "ফাউন্ডার ফ্রন্টিয়ার",
      role: "ভেঞ্চার বিল্ডার",
      description: "অসম্পূর্ণ চাহিদা খুঁজুন, নিজের সমাধান তৈরি করুন এবং শূন্য থেকে উদ্যোগ গড়ুন।",
      color: "from-amber-400 to-orange-500",
    },
  },
} as const

const SECTOR_QUEST_COPY = {
  en: {
    eyebrow: "Career Worlds",
    title: "Explore careers by playing the role",
    intro: "Build an explorer, enter one of three career worlds, and complete field missions to unlock roles worth exploring.",
    honest: "There is no winning portal. Choose the adventure you genuinely want to try.",
    start: "Launch the game",
    resume: "Continue my expedition",
    settings: "Game settings",
    autoAdvance: "Auto-advance",
    motion: "Motion effects",
    compact: "Compact layout",
    largeText: "Larger text",
    progress: "Explorer XP",
    complete: "complete",
    choiceHint: "Choose your move. Each one changes your explorer loadout.",
    back: "Back",
    cancel: "Exit quest",
    next: "Travel onward",
    analyze: "Unlock career cards",
    analyzing: "Opening your career card pack...",
    milestone: "Stage cleared!",
    saved: "Progress saved on this device",
    recommended: "Portal signal locked on",
    confirm: "Enter this world or choose another portal before the field missions begin.",
    questions: "8 game moves",
    time: "A 5-minute game",
    missions: "3 game stages",
    powerUp: "Loadout upgraded",
    xp: "XP",
    badge: "World badge earned",
    unlocked: "Career card pack unlocked",
  },
  bn: {
    eyebrow: "ক্যারিয়ার ওয়ার্ল্ডস",
    title: "ভূমিকায় খেলে ক্যারিয়ার অন্বেষণ করুন",
    intro: "একজন এক্সপ্লোরার তৈরি করুন, তিনটি ক্যারিয়ার জগতের একটিতে প্রবেশ করুন এবং উপযুক্ত ভূমিকার কার্ড আনলক করুন।",
    honest: "কোনো একটিই বিজয়ী পোর্টাল নয়। যে অভিযানটি সত্যিই চেষ্টা করতে চান সেটি বেছে নিন।",
    start: "গেম শুরু করুন",
    resume: "আমার অভিযান চালিয়ে যাই",
    settings: "গেম নিয়ন্ত্রণ",
    autoAdvance: "স্বয়ংক্রিয়ভাবে এগিয়ে যান",
    motion: "অ্যানিমেশন",
    compact: "কমপ্যাক্ট লেআউট",
    largeText: "বড় লেখা",
    progress: "এক্সপ্লোরার এক্সপি",
    complete: "সম্পন্ন",
    choiceHint: "আপনার চাল বেছে নিন। প্রতিটি সিদ্ধান্ত এক্সপ্লোরারের লোডআউট বদলায়।",
    back: "পেছনে",
    cancel: "অভিযান থেকে বের হন",
    next: "সামনে এগিয়ে যান",
    analyze: "ক্যারিয়ার কার্ড আনলক করুন",
    analyzing: "আপনার ক্যারিয়ার কার্ড প্যাক খোলা হচ্ছে...",
    milestone: "স্টেজ সম্পন্ন!",
    saved: "এই ডিভাইসে অগ্রগতি সংরক্ষিত",
    recommended: "পোর্টালের সংকেত পাওয়া গেছে",
    confirm: "ফিল্ড মিশন শুরুর আগে এই জগতে প্রবেশ করুন অথবা অন্য পোর্টাল বেছে নিন।",
    questions: "৮টি গেম মুভ",
    time: "৫ মিনিটের গেম",
    missions: "৩টি গেম স্টেজ",
    powerUp: "লোডআউট আপগ্রেড হয়েছে",
    xp: "এক্সপি",
    badge: "ওয়ার্ল্ড ব্যাজ অর্জিত",
    unlocked: "ক্যারিয়ার কার্ড প্যাক আনলক হয়েছে",
  },
} as const

const GENERAL_QUESTIONS: Question[] = [
  {
    id: "g1",
    questionText: {
      en: "Which career path would you like to explore first?",
      bn: "আপনি প্রথমে কোন ক্যারিয়ার পথটি দেখতে চান?"
    },
    options: [
      {
        text: {
          en: "Study more, do research, and discover new knowledge.",
          bn: "আরও পড়াশোনা করি, গবেষণা করি এবং নতুন জ্ঞান খুঁজি।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "Get a job, work with a team, and solve real problems.",
          bn: "চাকরি করি, দলের সঙ্গে কাজ করি এবং বাস্তব সমস্যা সমাধান করি।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "Start my own business and build a team around my idea.",
          bn: "নিজের ব্যবসা শুরু করি এবং ধারণাটি নিয়ে একটি দল গড়ি।"
        },
        value: "entrepreneurship",
        sector: "entrepreneurship"
      }
    ]
  },
  {
    id: "g2",
    questionText: {
      en: "Which goal sounds most exciting to you?",
      bn: "কোন লক্ষ্যটি আপনার কাছে সবচেয়ে ভালো লাগে?"
    },
    options: [
      {
        text: {
          en: "Understand a difficult subject and discover something new.",
          bn: "কঠিন একটি বিষয় বুঝি এবং নতুন কিছু আবিষ্কার করি।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "Join a good team, do useful work, and take on more responsibility.",
          bn: "ভালো একটি দলে যোগ দিই, দরকারি কাজ করি এবং বড় দায়িত্ব নিই।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "Find a problem and build my own solution for it.",
          bn: "একটি সমস্যা খুঁজি এবং নিজের সমাধান তৈরি করি।"
        },
        value: "entrepreneurship",
        sector: "entrepreneurship"
      }
    ]
  },
  {
    id: "g3",
    questionText: {
      en: "Which benefit would you choose, even with its challenge?",
      bn: "চ্যালেঞ্জ থাকলেও আপনি কোন সুবিধাটি বেছে নেবেন?"
    },
    options: [
      {
        text: {
          en: "Study longer now to become highly skilled later.",
          bn: "পরে খুব দক্ষ হতে এখন বেশি সময় পড়াশোনা করি।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "Choose steady income, a clear career path, and reliable support.",
          bn: "নিয়মিত আয়, পরিষ্কার ক্যারিয়ার পথ ও নির্ভরযোগ্য সহায়তা বেছে নিই।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "Take more risk to have more control and growth.",
          bn: "বেশি নিয়ন্ত্রণ ও উন্নতির জন্য বেশি ঝুঁকি নিই।"
        },
        value: "entrepreneurship",
        sector: "entrepreneurship"
      }
    ]
  }
]

const SECTOR_QUESTIONS: Record<'higher_studies' | 'job' | 'entrepreneurship', Question[]> = {
  higher_studies: [
    {
      id: "h1",
      questionText: {
        en: "What type of further study would you choose?",
        bn: "আপনি কোন ধরনের উচ্চশিক্ষা বেছে নেবেন?"
      },
      options: [
        { text: { en: "Master's degree to learn one subject deeply", bn: "একটি বিষয়ে গভীরভাবে শিখতে মাস্টার্স ডিগ্রি" }, value: "Master's Degree" },
        { text: { en: "PhD or doctorate to do research and teach", bn: "গবেষণা ও শিক্ষকতার জন্য পিএইচডি বা ডক্টরেট" }, value: "PhD / Doctorate" },
        { text: { en: "Professional certificate or diploma for job skills", bn: "চাকরির দক্ষতার জন্য পেশাগত সার্টিফিকেট বা ডিপ্লোমা" }, value: "Professional Certification / Diploma" }
      ]
    },
    {
      id: "h2",
      questionText: {
        en: "Which subject area would you most like to study?",
        bn: "আপনি কোন বিষয়টি সবচেয়ে বেশি পড়তে চান?"
      },
      options: [
        { text: { en: "Science, technology, engineering, or math", bn: "বিজ্ঞান, প্রযুক্তি, প্রকৌশল বা গণিত" }, value: "STEM" },
        { text: { en: "Social science or business management", bn: "সামাজিক বিজ্ঞান বা ব্যবসা ব্যবস্থাপনা" }, value: "Social Sciences & Business Management" },
        { text: { en: "Arts, literature, or humanities", bn: "কলা, সাহিত্য বা মানবিক বিভাগ" }, value: "Arts & Humanities" }
      ]
    },
    {
      id: "h3",
      questionText: {
        en: "Where would you prefer to study?",
        bn: "আপনি কোথায় পড়াশোনা করতে চান?"
      },
      options: [
        { text: { en: "At a university in my own country", bn: "নিজের দেশের বিশ্ববিদ্যালয়ে" }, value: "Home Country" },
        { text: { en: "At a university in another country", bn: "অন্য দেশের বিশ্ববিদ্যালয়ে" }, value: "Abroad" },
        { text: { en: "Online or partly online while working", bn: "কাজের পাশাপাশি অনলাইনে বা আংশিক অনলাইনে" }, value: "Online/Hybrid" }
      ]
    },
    {
      id: "h4",
      questionText: {
        en: "What would you like to do after further study?",
        bn: "উচ্চশিক্ষার পর আপনি কী করতে চান?"
      },
      options: [
        { text: { en: "Teach at a university or do academic research", bn: "বিশ্ববিদ্যালয়ে পড়াই বা গবেষণা করি" }, value: "Professor/Researcher" },
        { text: { en: "Do research for a company", bn: "কোনো প্রতিষ্ঠানে গবেষণার কাজ করি" }, value: "Corporate R&D" },
        { text: { en: "Advise government or social organizations", bn: "সরকার বা সামাজিক প্রতিষ্ঠানকে পরামর্শ দিই" }, value: "Policy Advisor/Consultant" }
      ]
    }
  ],
  job: [
    {
      id: "j1",
      questionText: {
        en: "What type of workplace would you prefer?",
        bn: "আপনি কোন ধরনের কর্মস্থল পছন্দ করেন?"
      },
      options: [
        { text: { en: "A large company with clear rules and stable work", bn: "পরিষ্কার নিয়ম ও স্থির কাজসহ বড় প্রতিষ্ঠান" }, value: "Multinational Corporation" },
        { text: { en: "A growing company where I can learn quickly", bn: "দ্রুত শেখার সুযোগসহ বেড়ে ওঠা প্রতিষ্ঠান" }, value: "Startup/Medium Company" },
        { text: { en: "A government job with security and public service", bn: "নিরাপত্তা ও জনসেবাসহ সরকারি চাকরি" }, value: "Government/Public Sector" }
      ]
    },
    {
      id: "j2",
      questionText: {
        en: "What kind of work interests you most?",
        bn: "কোন ধরনের কাজে আপনার সবচেয়ে বেশি আগ্রহ?"
      },
      options: [
        { text: { en: "Technical work like software, engineering, or data", bn: "সফটওয়্যার, প্রকৌশল বা ডেটার মতো প্রযুক্তিগত কাজ" }, value: "Technical & Analytical" },
        { text: { en: "Creative work like design, writing, or marketing", bn: "ডিজাইন, লেখা বা মার্কেটিংয়ের মতো সৃজনশীল কাজ" }, value: "Creative & Design" },
        { text: { en: "Managing products, projects, people, or plans", bn: "পণ্য, প্রকল্প, মানুষ বা পরিকল্পনা পরিচালনা" }, value: "Management & Operations" }
      ]
    },
    {
      id: "j3",
      questionText: {
        en: "Where would you like to work?",
        bn: "আপনি কোথা থেকে কাজ করতে চান?"
      },
      options: [
        { text: { en: "From home or anywhere", bn: "বাসা বা যেকোনো জায়গা থেকে" }, value: "Fully Remote" },
        { text: { en: "Some days at home and some days at the office", bn: "কিছু দিন বাসায়, কিছু দিন অফিসে" }, value: "Hybrid" },
        { text: { en: "At the office with my team", bn: "দলের সঙ্গে অফিসে" }, value: "On-site" }
      ]
    },
    {
      id: "j4",
      questionText: {
        en: "What work schedule would suit you best?",
        bn: "কোন কাজের সময়সূচি আপনার জন্য সবচেয়ে ভালো?"
      },
      options: [
        { text: { en: "Fixed office hours with weekends free", bn: "নির্দিষ্ট অফিস সময় এবং ছুটির দিন ফ্রি" }, value: "Strict 9-to-5" },
        { text: { en: "Longer hours for faster growth and promotion", bn: "দ্রুত উন্নতি ও পদোন্নতির জন্য বেশি সময় কাজ" }, value: "High Growth / High Intensity" },
        { text: { en: "Flexible hours as long as I finish my work", bn: "কাজ শেষ হলে নিজের সুবিধামতো সময়" }, value: "Flexible Hours" }
      ]
    }
  ],
  entrepreneurship: [
    {
      id: "e1",
      questionText: {
        en: "What kind of business would you like to start?",
        bn: "আপনি কোন ধরনের ব্যবসা শুরু করতে চান?"
      },
      options: [
        { text: { en: "A technology business that makes software or apps", bn: "সফটওয়্যার বা অ্যাপ তৈরি করে এমন প্রযুক্তি ব্যবসা" }, value: "Tech Startup" },
        { text: { en: "A service business like design, consulting, or freelancing", bn: "ডিজাইন, পরামর্শ বা ফ্রিল্যান্সিংয়ের মতো সেবা ব্যবসা" }, value: "Service Agency" },
        { text: { en: "A business that sells products online or in shops", bn: "অনলাইনে বা দোকানে পণ্য বিক্রির ব্যবসা" }, value: "E-commerce/Physical Products" }
      ]
    },
    {
      id: "e2",
      questionText: {
        en: "Which business skill would you most like to use?",
        bn: "ব্যবসায় আপনি কোন দক্ষতাটি সবচেয়ে বেশি ব্যবহার করতে চান?"
      },
      options: [
        { text: { en: "Building the product and handling technology", bn: "পণ্য তৈরি ও প্রযুক্তির কাজ" }, value: "Product & Tech Builder" },
        { text: { en: "Selling, marketing, and meeting customers", bn: "বিক্রি, মার্কেটিং ও গ্রাহকের সঙ্গে যোগাযোগ" }, value: "Sales & Marketing" },
        { text: { en: "Managing money, daily work, and business plans", bn: "টাকা, দৈনন্দিন কাজ ও ব্যবসার পরিকল্পনা পরিচালনা" }, value: "Operations & Finance" }
      ]
    },
    {
      id: "e3",
      questionText: {
        en: "How would you prefer to fund your business?",
        bn: "আপনি কীভাবে ব্যবসার টাকা জোগাড় করতে চান?"
      },
      options: [
        { text: { en: "Use my own savings and business income", bn: "নিজের সঞ্চয় ও ব্যবসার আয় ব্যবহার করি" }, value: "Bootstrapping" },
        { text: { en: "Get money from investors or a loan", bn: "বিনিয়োগকারী বা ঋণ থেকে টাকা নিই" }, value: "External Funding" },
        { text: { en: "Raise money from customers before the product is ready", bn: "পণ্য তৈরি হওয়ার আগে গ্রাহকদের কাছ থেকে টাকা তুলি" }, value: "Crowdfunding/Pre-sales" }
      ]
    },
    {
      id: "e4",
      questionText: {
        en: "What would business success mean most to you?",
        bn: "ব্যবসায় সাফল্য বলতে আপনার কাছে সবচেয়ে গুরুত্বপূর্ণ কী?"
      },
      options: [
        { text: { en: "Having full control over my ideas and decisions", bn: "নিজের ধারণা ও সিদ্ধান্তের ওপর পুরো নিয়ন্ত্রণ" }, value: "Creative/Intellectual Control" },
        { text: { en: "Earning a lot and building wealth", bn: "অনেক আয় করা ও সম্পদ তৈরি করা" }, value: "Wealth Creation" },
        { text: { en: "Having flexible time and being my own boss", bn: "নিজের সময় ঠিক করা ও নিজের বস হওয়া" }, value: "Lifestyle & Autonomy" }
      ]
    }
  ]
}

export default function ExploreCareersPage() {

  const { user, setUser } = useUser()
  const { lang } = useLanguage()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
 
  // Recommendations specific states
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedCareer, setSelectedCareer] = useState<Recommendation | null>(null)
  const [filterActive, setFilterActive] = useState(false)
  const [localMbti, setLocalMbti] = useState<string>("")
  const [localRecommendationIds, setLocalRecommendationIds] = useState<string[]>([])
  const [localCareerAssessmentRecommendations, setLocalCareerAssessmentRecommendations] = useState<Recommendation[]>([])
  
  // Detailed Career screen states
  const [detailTab, setDetailTab] = useState<'overview' | 'skills' | 'day_in_the_life' | 'roadmap' | 'resources' | 'similar_careers'>('overview')
  const [savedCareers, setSavedCareers] = useState<string[]>([])
  const [goalsSet, setGoalsSet] = useState<string[]>([])
  const [careerActionLoading, setCareerActionLoading] = useState<string | null>(null)
  const [careerActionError, setCareerActionError] = useState("")

  const [aiLoading, setAiLoading] = useState(false)

  // Assessment wizard states
  const [isAssessing, setIsAssessing] = useState(false)
  const [assessStep, setAssessStep] = useState(0) // 0 to 2: General, 3: Confirmation, 4 to 7: Sector Specific
  const [generalSelected, setGeneralSelected] = useState<Record<number, string>>({})
  const [confirmedSector, setConfirmedSector] = useState<'higher_studies' | 'job' | 'entrepreneurship' | null>(null)
  const [sectorSelected, setSectorSelected] = useState<Record<number, string>>({})
  const [sectorQuestPreferences, setSectorQuestPreferences] = useState<SectorQuestPreferences>(
    DEFAULT_SECTOR_QUEST_PREFERENCES
  )
  const [showSectorQuestSettings, setShowSectorQuestSettings] = useState(false)
  const [sectorQuestMilestone, setSectorQuestMilestone] = useState<number | null>(null)
  const [careerWorldReward, setCareerWorldReward] = useState<
    'higher_studies' | 'job' | 'entrepreneurship' | null
  >(null)
  const [careerIntake, setCareerIntake] = useState<CareerIntake>(DEFAULT_CAREER_INTAKE)
  const [gameAnswers, setGameAnswers] = useState<Record<string, string | number>>({})
  const [flowError, setFlowError] = useState("")
  const sectorAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sectorQuestAnswerCount =
    (careerIntake.education ? 1 : 0) +
    (careerIntake.favoriteSubjects.length ? 1 : 0) +
    (careerIntake.interests.length ? 1 : 0) +
    (careerIntake.skills.length ? 1 : 0) +
    (careerIntake.goal ? 1 : 0) +
    (careerIntake.workStyle ? 1 : 0) +
    (careerIntake.workEnvironment ? 1 : 0) +
    (gameAnswers.logic !== undefined ? 1 : 0) +
    (gameAnswers.planning !== undefined ? 1 : 0)
  const sectorQuestProgress = Math.round((sectorQuestAnswerCount / 9) * 100)
  const sectorQuestXP = Math.round(sectorQuestProgress * 10)
  const hasSectorQuestDraft =
    careerIntake.education.length > 0 ||
    careerIntake.interests.length > 0 ||
    Object.keys(gameAnswers).length > 0 ||
    assessStep > 0
  const sectorQuestPhase = assessStep === 0 ? 0 : assessStep <= 2 ? 1 : 2
  const sectorQuestCopy = SECTOR_QUEST_COPY[lang]
  const sectorQuestTransition = sectorQuestPreferences.motion
    ? "transition-all duration-300 ease-out"
    : "transition-none"

  const detectedSector = useMemo(() => {
    const counts: Record<string, number> = { higher_studies: 0, job: 0, entrepreneurship: 0 }
    if (careerIntake.goal === "Higher education" || careerIntake.goal === "Research") counts.higher_studies += 4
    if (careerIntake.goal === "Get a job" || careerIntake.goal === "Freelance") counts.job += 4
    if (careerIntake.goal === "Start a business") counts.entrepreneurship += 5
    if (careerIntake.interests.includes("Research") || careerIntake.favoriteSubjects.includes("Research")) counts.higher_studies += 2
    if (careerIntake.interests.includes("Building things")) counts.entrepreneurship += 1
    if (careerIntake.workStyle === "Team-based work" || careerIntake.workEnvironment === "Office") counts.job += 1
    if (careerIntake.goal === "Still exploring") counts.job += 1
    let maxSector: 'higher_studies' | 'job' | 'entrepreneurship' = 'job'
    let maxVal = -1
    for (const sec of ['higher_studies', 'job', 'entrepreneurship'] as const) {
      if (counts[sec] > maxVal) {
        maxVal = counts[sec]
        maxSector = sec
      }
    }
    return maxSector
  }, [careerIntake])

  useEffect(() => {
    if (assessStep === 3 && !confirmedSector) {
      setConfirmedSector(detectedSector)
    }
  }, [assessStep, detectedSector, confirmedSector])

  useEffect(() => {
    const timer = sectorAdvanceTimer.current
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  function moveSectorQuest(step: number) {
    if (sectorAdvanceTimer.current) clearTimeout(sectorAdvanceTimer.current)
    setSectorQuestMilestone(null)
    setAssessStep(Math.max(0, Math.min(3, step)))
  }

  function updateCareerIntake<K extends keyof CareerIntake>(key: K, value: CareerIntake[K]) {
    setCareerIntake(previous => ({ ...previous, [key]: value }))
    setFlowError("")
  }

  function toggleIntakeChoice(key: 'favoriteSubjects' | 'interests' | 'skills', value: string, limit: number) {
    setCareerIntake(previous => {
      const current = previous[key]
      const next = current.includes(value)
        ? current.filter(item => item !== value)
        : current.length < limit ? [...current, value] : current
      return { ...previous, [key]: next }
    })
    setFlowError("")
  }

  function validateForm() {
    return Boolean(
      careerIntake.education &&
      careerIntake.favoriteSubjects.length &&
      careerIntake.interests.length &&
      careerIntake.skills.length &&
      careerIntake.goal &&
      careerIntake.workStyle &&
      careerIntake.workEnvironment
    )
  }

  function continueFromForm() {
    if (!validateForm()) {
      setFlowError(lang === 'bn' ? "অনুগ্রহ করে সব অংশ পূরণ করুন।" : "Please complete every section before continuing.")
      return
    }
    setConfirmedSector(detectedSector)
    moveSectorQuest(1)
  }

  function updateSectorQuestPreference<K extends keyof SectorQuestPreferences>(
    key: K,
    value: SectorQuestPreferences[K]
  ) {
    setSectorQuestPreferences(previous => {
      const next = { ...previous, [key]: value }
      try {
        const saved = localStorage.getItem(SECTOR_QUEST_DRAFT_KEY)
        const draft = saved ? (JSON.parse(saved) as SectorQuestDraft) : {}
        localStorage.setItem(
          SECTOR_QUEST_DRAFT_KEY,
          JSON.stringify({ ...draft, preferences: next })
        )
      } catch {
        // Keep the in-session controls functional when storage is unavailable.
      }
      return next
    })
  }

  function beginSectorQuest() {
    if (!hasSectorQuestDraft) {
      setAssessStep(0)
      setGeneralSelected({})
      setSectorSelected({})
      setConfirmedSector(null)
      setCareerIntake(DEFAULT_CAREER_INTAKE)
      setGameAnswers({})
    }
    setFlowError("")
    setIsAssessing(true)
  }

  async function handleSubmitAssessment() {
    const activeMbti = user?.mbti || localMbti
    if (!confirmedSector || gameAnswers.logic === undefined || gameAnswers.planning === undefined) return
    setAiLoading(true)
    
    // Compile answers
    const generalAnswersList = GENERAL_QUESTIONS.map((q, idx) => {
      const selectedVal = generalSelected[idx]
      const option = q.options.find(o => o.value === selectedVal)
      return {
        question: q.questionText.en,
        answer: option ? option.text.en : selectedVal,
        value: selectedVal,
      }
    })

    const sectorQuestionsList = SECTOR_QUESTIONS[confirmedSector]
    const legacySectorAnswers = sectorQuestionsList.map((q, idx) => {
      const selectedVal = sectorSelected[idx]
      const option = q.options.find(o => o.value === selectedVal)
      return {
        question: q.questionText.en,
        answer: option ? option.text.en : selectedVal,
        value: selectedVal,
      }
    })

    const derivedSignals: string[] = []
    const profileText = [...careerIntake.favoriteSubjects, ...careerIntake.interests, ...careerIntake.skills]
    if (profileText.some(item => ["Programming", "Mathematics", "Science", "Working with data", "Problem solving"].includes(item))) derivedSignals.push("Technical & Analytical", "STEM")
    if (profileText.some(item => ["Design", "Communication", "Creating or designing", "Creativity"].includes(item))) derivedSignals.push("Creative & Design", "Arts & Humanities")
    if (profileText.some(item => ["Leadership", "Planning", "Leading a team", "Business"].includes(item))) derivedSignals.push("Management & Operations", "Social Sciences & Business Management")
    if (careerIntake.workEnvironment === "Remote") derivedSignals.push("Fully Remote")
    if (careerIntake.workEnvironment === "Hybrid") derivedSignals.push("Hybrid")
    if (careerIntake.workEnvironment === "Office") derivedSignals.push("On-site")
    if (careerIntake.workStyle === "Clear plan and routine") derivedSignals.push("Strict 9-to-5")
    if (careerIntake.workStyle === "Flexible and changing work") derivedSignals.push("Flexible Hours")
    if (careerIntake.goal === "Start a business") derivedSignals.push("Tech Startup", "Service Agency")
    if (gameAnswers.planning === "plan") derivedSignals.push("Management & Operations")
    if (Number(gameAnswers.logic) === 30) derivedSignals.push("Technical & Analytical", "STEM")

    const sectorAnswersList = [
      ...legacySectorAnswers,
      ...derivedSignals.map((value, index) => ({
        question: `Profile and game signal ${index + 1}`,
        answer: value,
        value,
      })),
    ]

    const assessmentPayload = {
      sector: confirmedSector,
      generalAnswers: generalAnswersList,
      sectorAnswers: sectorAnswersList,
      profile: careerIntake,
      gameResults: {
        logicAnswer: gameAnswers.logic,
        logicCorrect: Number(gameAnswers.logic) === 30,
        planningChoice: gameAnswers.planning,
        strengths: [
          Number(gameAnswers.logic) === 30 ? "Logical problem solving" : "Learning through challenge",
          gameAnswers.planning === "plan" ? "Planning" : "Adaptability",
        ],
      },
    }

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: activeMbti || "Not completed", assessment: assessmentPayload })
      })
      const data = await res.json()
      if (res.ok && data?.recommendations) {
        const nextRecommendations = cleanRecommendations(data.recommendations)
        setRecommendations(nextRecommendations)
        setCareerWorldReward(confirmedSector)

        if (user) {
          const journeyRes = await fetch("/api/journey", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "save-career-assessment",
              sector: confirmedSector,
              recommendations: nextRecommendations,
            }),
          })
          const journeyData = await journeyRes.json()
          if (journeyRes.ok) {
            setUser({ ...user, journey: journeyData.journey })
          }
        } else {
          localStorage.setItem(
            CAREER_ASSESSMENT_RECOMMENDATIONS_KEY,
            JSON.stringify(nextRecommendations)
          )
          setLocalCareerAssessmentRecommendations(nextRecommendations)
        }
        
        // Reset assessment states
        localStorage.removeItem(SECTOR_QUEST_DRAFT_KEY)
        setIsAssessing(false)
        setAssessStep(0)
        setGeneralSelected({})
        setSectorSelected({})
        setConfirmedSector(null)
        setCareerIntake(DEFAULT_CAREER_INTAKE)
        setGameAnswers({})

        // Scroll to recommendations list
        setTimeout(() => {
          const el = document.getElementById("recommendations-list")
          if (el) el.scrollIntoView({ behavior: "smooth" })
        }, 100)
      }
    } catch (err) {
      console.error("Failed to load sector career recommendations:", err)
    } finally {
      setAiLoading(false)
    }
  }


  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setLocalMbti(localStorage.getItem("guestMbti") || "")
      const storedRecommendationIds = localStorage.getItem(ASSESSMENT_RECOMMENDATIONS_KEY)
      if (storedRecommendationIds) {
        try {
          const parsed = JSON.parse(storedRecommendationIds)
          setLocalRecommendationIds(
            Array.isArray(parsed)
              ? parsed.filter((id): id is string => typeof id === "string")
              : []
          )
        } catch {
          setLocalRecommendationIds([])
        }
      }
      const storedCareerAssessmentRecommendations = localStorage.getItem(
        CAREER_ASSESSMENT_RECOMMENDATIONS_KEY
      )
      if (storedCareerAssessmentRecommendations) {
        try {
          setLocalCareerAssessmentRecommendations(
            cleanRecommendations(JSON.parse(storedCareerAssessmentRecommendations))
          )
        } catch {
          setLocalCareerAssessmentRecommendations([])
        }
      }
    }
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SECTOR_QUEST_DRAFT_KEY)
      if (!saved) return
      const draft = JSON.parse(saved) as SectorQuestDraft
      if (draft.generalSelected) setGeneralSelected(draft.generalSelected)
      if (draft.sectorSelected) setSectorSelected(draft.sectorSelected)
      if (
        draft.confirmedSector === "higher_studies" ||
        draft.confirmedSector === "job" ||
        draft.confirmedSector === "entrepreneurship"
      ) {
        setConfirmedSector(draft.confirmedSector)
      }
      if (typeof draft.assessStep === "number") {
        setAssessStep(Math.max(0, Math.min(3, draft.assessStep)))
      }
      if (draft.preferences) {
        setSectorQuestPreferences(previous => ({ ...previous, ...draft.preferences }))
      }
      if (draft.intake) {
        setCareerIntake(previous => ({ ...previous, ...draft.intake }))
      }
      if (draft.gameAnswers) setGameAnswers(draft.gameAnswers)
      if (
        draft.isAssessing ||
        Boolean(draft.intake?.education) ||
        Object.keys(draft.gameAnswers || {}).length > 0 ||
        Object.keys(draft.generalSelected || {}).length > 0 ||
        Object.keys(draft.sectorSelected || {}).length > 0
      ) {
        setIsAssessing(true)
      }
    } catch {
      localStorage.removeItem(SECTOR_QUEST_DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    if (!isAssessing && !hasSectorQuestDraft) return
    const draft: SectorQuestDraft = {
      isAssessing,
      assessStep,
      generalSelected,
      confirmedSector,
      sectorSelected,
      preferences: sectorQuestPreferences,
      intake: careerIntake,
      gameAnswers,
    }
    localStorage.setItem(SECTOR_QUEST_DRAFT_KEY, JSON.stringify(draft))
  }, [
    assessStep,
    confirmedSector,
    careerIntake,
    gameAnswers,
    generalSelected,
    hasSectorQuestDraft,
    isAssessing,
    sectorQuestPreferences,
    sectorSelected,
  ])

  useEffect(() => {
    if (user) {
      setSavedCareers(user.journey?.savedCareerIds || [])
      setGoalsSet(user.journey?.selectedCareer?.id ? [user.journey.selectedCareer.id] : [])
      return
    }
    const saved = localStorage.getItem("saved_careers")
    if (saved) {
      try {
        setSavedCareers(JSON.parse(saved))
      } catch {
        setSavedCareers([])
      }
    }
  }, [user])

  const activeMbti = user?.mbti || localMbti
  const assessmentRecommendationKey = (
    user ? (user.journey?.recommendedCareerIds || []) : localRecommendationIds
  ).join("|")
  const careerAssessmentRecommendationKey = JSON.stringify(
    user
      ? (user.journey?.careerAssessmentRecommendations || [])
      : localCareerAssessmentRecommendations
  )

  // Load matches dynamically based on profile
  useEffect(() => {
    async function loadMatches() {
      const careerAssessmentMatches = cleanRecommendations(
        JSON.parse(careerAssessmentRecommendationKey)
      )
      if (careerAssessmentMatches.length > 0) {
        setRecommendations(careerAssessmentMatches)
        return
      }

      const assessmentIds = assessmentRecommendationKey
        ? assessmentRecommendationKey.split("|")
        : []
      const assessmentMatches = recommendationsFromIds(assessmentIds)
      if (assessmentMatches.length > 0) {
        setRecommendations(assessmentMatches)
        return
      }

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
          }
        } catch (err) {
          console.error("Failed to load recommendations", err)
        }
      }
    }
    if (isMounted && (activeMbti || assessmentRecommendationKey || careerAssessmentRecommendationKey !== "[]")) {
      loadMatches()
    }
  }, [isMounted, activeMbti, assessmentRecommendationKey, careerAssessmentRecommendationKey])

  const currentCareerDetails = useMemo(() => {
    if (!selectedCareer) return null;
    const details = careerDetails[selectedCareer.id] || Object.values(careerDetails).find(c => c.title.toLowerCase() === selectedCareer.title.toLowerCase()) || {
      id: selectedCareer.id,
      title: selectedCareer.title,
      category: "job",
      demand: "Medium",
      growth: "+10%",
      salary: "$60,000 - $95,000",
      remote: "Yes",
      degree: "Bachelor's",
      experience: "Entry to Mid",
      about: selectedCareer.description,
      keyResponsibilities: ["Collaborate with teams", "Execute critical workflows", "Learn industry best practices"],
      dayInTheLife: [
        { time: "9:00 AM", task: "Planning and alignment meeting" },
        { time: "10:00 AM", task: "Core task execution" },
        { time: "1:00 PM", task: "Lunch break" },
        { time: "2:00 PM", task: "Review and collaboration" }
      ],
      topSkills: [
        { level: "Beginner", list: selectedCareer.skills || ["Communication", "Basic Tools"] },
        { level: "Intermediate", list: ["Core Frameworks", "Problem Solving"] },
        { level: "Advanced", list: ["Strategic Planning", "Leadership"] }
      ],
      skillsDetail: [
        { category: "Core Tools", skills: selectedCareer.skills || ["Figma", "Git"] },
        { category: "Soft Skills", skills: ["Collaboration", "Presentation"] }
      ],
      roadmap: [
        { step: "Step 1", title: "Acquire Basics", description: "Learn fundamental theories and core platform operations." },
        { step: "Step 2", title: "Practice & Build", description: "Apply knowledge to real-world datasets or design mockups." }
      ],
      resources: [
        { title: "Browse learning resources", type: "Resource library", url: "/dashboard?view=resources", provider: "Career Leader" }
      ],
      similarCareers: []
    };
    return details;
  }, [selectedCareer]);

  const filteredRecommendations = filterActive
    ? recommendations.filter((_, idx) => idx % 2 === 0)
    : recommendations

  const topRecommendations = filteredRecommendations.slice(0, 4)
  const secondaryRecommendations = filteredRecommendations.slice(4)

  function recommendationLabel(careerId: string) {
    const index = recommendations.findIndex(rec => rec.id === careerId)
    if (index === 0) return lang === "bn" ? "শীর্ষ সুপারিশ" : "Top recommendation"
    if (index > 0 && index < 4) return lang === "bn" ? "শক্তিশালী সুপারিশ" : "Strong recommendation"
    return lang === "bn" ? "আরও বিবেচনা করুন" : "Also worth exploring"
  }

  async function saveCareerSelection(careerIds: string[]) {
    if (!user) {
      localStorage.setItem("saved_careers", JSON.stringify(careerIds))
      return
    }
    const res = await fetch("/api/journey", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save-careers", careerIds }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Could not save career")
    setUser({ ...user, journey: data.journey })
  }

  async function handleToggleSavedCareer(id: string) {
    const next = savedCareers.includes(id)
      ? savedCareers.filter(careerId => careerId !== id)
      : [...savedCareers, id]
    setSavedCareers(next)
    setCareerActionLoading(`save:${id}`)
    setCareerActionError("")
    try {
      await saveCareerSelection(next)
    } catch (error) {
      setSavedCareers(savedCareers)
      setCareerActionError(error instanceof Error ? error.message : "Could not save career")
    } finally {
      setCareerActionLoading(null)
    }
  }

  async function handleChooseCareer() {
    if (!currentCareerDetails || !selectedCareer) return
    setCareerActionLoading(`choose:${currentCareerDetails.id}`)
    setCareerActionError("")
    const career = {
      id: currentCareerDetails.id,
      title: currentCareerDetails.title,
      description: currentCareerDetails.about,
      skills: currentCareerDetails.topSkills.flatMap(group => group.list).slice(0, 10),
    }
    const target = new Date()
    target.setFullYear(target.getFullYear() + 1)
    const goalData = {
      title: currentCareerDetails.title,
      targetDate: target.toISOString().split("T")[0],
      skillLevel: "Beginner",
      whyImportant: "",
      focusAreas: career.skills.slice(0, 3),
      updatedAt: new Date().toISOString(),
    }

    try {
      if (user) {
        const journeyRes = await fetch("/api/journey", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "select-career", career }),
        })
        const journeyData = await journeyRes.json()
        if (!journeyRes.ok) throw new Error(journeyData.error || "Could not choose career")

        const goalRes = await fetch("/api/goals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal: goalData }),
        })
        const goalResponse = await goalRes.json()
        if (!goalRes.ok) throw new Error(goalResponse.error || "Could not set career goal")

        setUser({
          ...user,
          goal: goalResponse.goal || goalData,
          journey: goalResponse.journey || journeyData.journey,
          cvDraft: goalResponse.cvDraft,
        })
      }

      localStorage.setItem("career_goal", JSON.stringify(goalData))
      localStorage.removeItem("roadmap_completed_tasks")
      setGoalsSet([currentCareerDetails.id])
      router.push("/goals")
    } catch (error) {
      setCareerActionError(error instanceof Error ? error.message : "Could not choose career")
    } finally {
      setCareerActionLoading(null)
    }
  }

  return (
    <DashboardLayout activeTab="explore-careers" breadcrumbExtra={selectedCareer?.title}>
      {selectedCareer && currentCareerDetails ? (
        /* Detailed Career Information Panel */
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Back button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => { setSelectedCareer(null); setDetailTab('overview'); }}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>←</span> <span>{lang === 'bn' ? "ক্যারিয়ার তালিকায় ফিরে যান" : "Back to Explore Careers"}</span>
            </button>

          </div>

          {/* Career Title & Summary Header Panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-extrabold rounded-full uppercase tracking-wider">
                    {lang === 'bn' ? "ক্যারিয়ার বিস্তারিত" : "Career Profile"}
                  </span>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full">
                    {recommendationLabel(currentCareerDetails.id)}
                  </span>
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-extrabold rounded-full">
                    ★ {currentCareerDetails.demand} {lang === 'bn' ? "চাহিদা" : "Demand"}
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full">
                    {currentCareerDetails.salary}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
                  {currentCareerDetails.title}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {currentCareerDetails.about}
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => void handleToggleSavedCareer(currentCareerDetails.id)}
                  disabled={careerActionLoading === `save:${currentCareerDetails.id}`}
                  className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    savedCareers.includes(currentCareerDetails.id)
                      ? "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{savedCareers.includes(currentCareerDetails.id) ? "❤️" : "🤍"}</span>
                  <span>{savedCareers.includes(currentCareerDetails.id) ? (lang === 'bn' ? "সংরক্ষিত ক্যারিয়ার" : "Saved Career") : (lang === 'bn' ? "ক্যারিয়ার সংরক্ষণ" : "Save Career")}</span>
                </button>

                <button
                  onClick={() => {
                    router.push(`/mentors?career=${encodeURIComponent(currentCareerDetails.title)}`);
                  }}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🤝</span>
                  <span>{lang === 'bn' ? "মেন্টরের সাথে যোগাযোগ" : "Connect Mentor"}</span>
                </button>

                <button
                  onClick={() => void handleChooseCareer()}
                  disabled={careerActionLoading === `choose:${currentCareerDetails.id}`}
                  className={`flex-1 py-3 px-5 font-bold text-sm rounded-xl shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    goalsSet.includes(currentCareerDetails.id)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>🎯</span>
                  <span>{careerActionLoading === `choose:${currentCareerDetails.id}` ? (lang === 'bn' ? "সংরক্ষণ হচ্ছে..." : "Saving...") : goalsSet.includes(currentCareerDetails.id) ? (lang === 'bn' ? "নির্বাচিত ক্যারিয়ার" : "Chosen Career") : (lang === 'bn' ? "বেছে নিন ও লক্ষ্য ঠিক করুন" : "Choose & Set Goal")}</span>
                </button>
              </div>
            </div>

            {careerActionError && (
              <p role="alert" className="relative mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {careerActionError}
              </p>
            )}

            {/* Sub Tab Navigation bar */}
            <div className="flex border-b border-slate-200 mt-10 overflow-x-auto whitespace-nowrap scrollbar-none -mx-6 sm:-mx-8 lg:-mx-10 px-6 sm:px-8 lg:px-10">
              {([
                { key: 'overview', bn: 'ওভারভিউ', en: 'Overview' },
                { key: 'skills', bn: 'প্রয়োজনীয় দক্ষতা', en: 'Skills' },
                { key: 'day_in_the_life', bn: 'দৈনিক জীবন', en: 'Day in the Life' },
                { key: 'roadmap', bn: 'রোডম্যাপ', en: 'Roadmap' },
                { key: 'resources', bn: 'শেখার সম্পদ', en: 'Resources' },
                { key: 'similar_careers', bn: 'অনুরূপ ক্যারিয়ার', en: 'Similar Careers' }
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`py-3 px-4 sm:px-6 font-extrabold text-sm border-b-2 transition-all duration-200 cursor-pointer ${
                    detailTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {lang === 'bn' ? tab.bn : tab.en}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Panel Content */}
          <div className="mt-8">
            
            {/* 1. OVERVIEW PANEL */}
            {detailTab === 'overview' && (
              <div className="grid gap-8 lg:grid-cols-3 items-start">
                
                {/* Left 2 Cols: About and Timeline */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-lg mb-4 flex items-center gap-2">
                      <span>📝</span> {lang === 'bn' ? "এই ক্যারিয়ার সম্পর্কে" : "About This Career"}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {currentCareerDetails.about}
                    </p>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang === 'bn' ? "প্রধান দায়িত্বসমূহ" : "Key Responsibilities"}</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {currentCareerDetails.keyResponsibilities.map((resp, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className="text-blue-500 font-bold">✓</span>
                            <span className="text-slate-700 text-xs font-medium leading-normal">{resp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Day in the life preview timeline */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                        <span>🕒</span> {lang === 'bn' ? "দৈনিক জীবন (সংক্ষেপ)" : "Day in the Life (Summary)"}
                      </h3>
                      <button
                        onClick={() => setDetailTab('day_in_the_life')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
                      >
                        {lang === 'bn' ? "detailed দেখুন" : "View Full Schedule"} →
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {currentCareerDetails.dayInTheLife.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex gap-4 items-start relative group">
                          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg shrink-0">
                            {item.time}
                          </span>
                          <p className="text-slate-700 text-xs font-semibold pt-1">{item.task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Key Stats & Skills Summary */}
                <div className="lg:col-span-1 space-y-8">
                  {/* Key Stats Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                      <span>📊</span> {lang === 'bn' ? "মূল পরিসংখ্যান" : "Key Stats"}
                    </h3>
                    
                    <div className="divide-y divide-slate-100 text-xs font-semibold">
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "চাহিদা" : "Demand"}</span>
                        <span className="text-emerald-600 font-extrabold">{currentCareerDetails.demand}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "চাকরির প্রবৃদ্ধি (১০ বছর)" : "Job Growth (10Y)"}</span>
                        <span className="text-slate-800 font-bold">{currentCareerDetails.growth}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "গড় বেতন" : "Average Salary"}</span>
                        <span className="text-slate-800 font-bold">{currentCareerDetails.salary}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "রিমোট কাজ" : "Remote Jobs"}</span>
                        <span className="text-slate-800 font-bold">{currentCareerDetails.remote}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "প্রয়োজনীয় ডিগ্রি" : "Required Degree"}</span>
                        <span className="text-slate-800 font-bold">{currentCareerDetails.degree}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-slate-400">{lang === 'bn' ? "অভিজ্ঞতার স্তর" : "Experience Level"}</span>
                        <span className="text-slate-800 font-bold">{currentCareerDetails.experience}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Skills Required Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-extrabold text-slate-900 text-base mb-4 flex items-center gap-2">
                      <span>⚡</span> {lang === 'bn' ? "শীর্ষ দক্ষতা সমূহ" : "Top Skills Required"}
                    </h3>
                    
                    <div className="space-y-4">
                      {currentCareerDetails.topSkills.map((lvl, idx) => {
                        const badgeColors = lvl.level === 'Beginner' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : lvl.level === 'Intermediate' 
                          ? 'bg-amber-50 text-amber-700' 
                          : 'bg-indigo-50 text-indigo-700'
                        return (
                          <div key={idx} className="space-y-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded ${badgeColors}`}>
                              {lvl.level}
                            </span>
                            <ul className="text-xs text-slate-600 font-medium space-y-1 pl-1 list-disc list-inside">
                              {lvl.list.map((sk, sidx) => (
                                <li key={sidx}>{sk}</li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. SKILLS PANEL */}
            {detailTab === 'skills' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>🛠️</span> {lang === 'bn' ? "দক্ষতা ও সরঞ্জাম সমূহ" : "Skills & Tools Breakdown"}
                </h3>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  {currentCareerDetails.skillsDetail.map((cat, i) => (
                    <div key={i} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200/60 pb-1.5">{cat.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {cat.skills.map((sk, sidx) => (
                          <span key={sidx} className="text-xs font-bold bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. DAY IN THE LIFE PANEL */}
            {detailTab === 'day_in_the_life' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>📅</span> {lang === 'bn' ? "দৈনিক কাজ ও রুটিন" : "Typical Day Schedule"}
                </h3>
                
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-8 ml-4">
                  {currentCareerDetails.dayInTheLife.map((item, i) => (
                    <div key={i} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-blue-600 bg-white group-hover:bg-blue-600 transition-colors"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg shrink-0 w-fit">
                          {item.time}
                        </span>
                        <h4 className="text-slate-800 text-sm font-semibold leading-relaxed">{item.task}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ROADMAP PANEL */}
            {detailTab === 'roadmap' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>🗺️</span> {lang === 'bn' ? "রোডম্যাপ ও গাইডলাইন" : "Step-by-Step Learning Roadmap"}
                </h3>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {currentCareerDetails.roadmap.map((step, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 hover:border-blue-100 rounded-2xl p-5 relative overflow-hidden group shadow-xs">
                      <span className="absolute right-3 top-2 font-black text-slate-200/60 text-4xl group-hover:text-blue-100 transition-colors">{idx + 1}</span>
                      <div className="relative space-y-2.5">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded">
                          {step.step}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. RESOURCES PANEL */}
            {detailTab === 'resources' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>📚</span> {lang === 'bn' ? "প্রস্তাবিত শেখার সম্পদ" : "Recommended Learning Resources"}
                </h3>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {currentCareerDetails.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 block group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                          {res.type}
                        </span>
                        <span className="text-slate-400 group-hover:text-blue-500 transition-colors">↗</span>
                      </div>
                      
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors mb-1">{res.title}</h4>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{res.provider}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 6. SIMILAR CAREERS PANEL */}
            {detailTab === 'similar_careers' && (
              <div className="space-y-6">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <span>🔗</span> {lang === 'bn' ? "অনুরূপ ক্যারিয়ার বিকল্পসমূহ" : "Similar Careers Options"}
                </h3>
                
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {currentCareerDetails.similarCareers.length === 0 ? (
                    <p className="text-sm text-slate-500">{lang === 'bn' ? "কোনো অনুরূপ ক্যারিয়ার পাওয়া যায়নি।" : "No similar careers found."}</p>
                  ) : (
                    currentCareerDetails.similarCareers.map(cid => {
                      const item = careerDetails[cid];
                      if (!item) return null;
                      return (
                        <div
                          key={cid}
                          onClick={() => {
                            const rec = recommendations.find(r => r.id === cid) || { id: item.id, title: item.title, description: item.about };
                            setSelectedCareer(rec);
                            setDetailTab('overview');
                          }}
                          className="bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition duration-200 flex items-center gap-4 cursor-pointer group"
                        >
                          <div className="shrink-0 transform group-hover:scale-105 transition-transform duration-200">
                            {getCareerIcon(item.title, true)}
                          </div>
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-extrabold text-slate-900 text-sm truncate leading-snug group-hover:text-blue-600 transition">
                              {item.title}
                            </h4>
                            <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                              {recommendationLabel(cid)}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        /* Recommendations Screen */
        <div className="space-y-8 sm:space-y-10">
          
          {/* Header summary panel */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {lang === 'bn' ? "২. ফলাফল ও সুপারিশ" : "2. Explore Career Matches"}
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "আপনার উপযুক্ত ক্যারিয়ারসমূহ" : "Recommended Careers For You"}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                  {lang === 'bn' ? "আপনার তথ্য, আগ্রহ ও গেমের ফলের ভিত্তিতে" : "Based on your profile, interests, and game results"}
                </p>
              </div>

              {/* Large Personality Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl text-center text-white shrink-0 shadow-lg shadow-blue-100 flex flex-col justify-center items-center">
                <p className="text-blue-100 text-xs font-bold tracking-wider uppercase mb-1">{lang === 'bn' ? "বিশ্লেষণের ভিত্তি" : "Matching signals"}</p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{user?.mbti || localMbti || (lang === 'bn' ? "ফর্ম + গেম" : "FORM + GAMES")}</h2>
                <p className="text-blue-200 text-[10px] font-semibold mt-2 max-w-[150px] uppercase">{lang === 'bn' ? "ব্যক্তিগত ক্যারিয়ার প্রোফাইল" : "Personal career profile"}</p>
              </div>
            </div>
          </div>

          {/* AI Custom Career Recommendations (Interactive Assessment Wizard) */}
          <div className={`bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden select-none ${sectorQuestTransition} ${
            sectorQuestPreferences.compact ? "p-4 sm:p-5" : "p-6 sm:p-8"
          } ${sectorQuestPreferences.largeText ? "text-[1.04rem]" : ""}`}>
            {/* background gradient flare */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-8 -bottom-8 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl"></div>

            {sectorQuestMilestone !== null && (
              <div
                role="status"
                aria-live="polite"
                className={`absolute left-1/2 top-4 z-30 w-[min(88%,360px)] -translate-x-1/2 rounded-2xl border border-emerald-400/30 bg-slate-950/95 p-4 text-center shadow-2xl ${sectorQuestTransition}`}
              >
                <div className="text-2xl" aria-hidden="true">
                  {SECTOR_QUEST_PHASES[sectorQuestMilestone].icon}
                </div>
                <p className="mt-1 text-sm font-black text-emerald-300">{sectorQuestCopy.milestone}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {SECTOR_QUEST_PHASES[sectorQuestMilestone][lang].name}
                </p>
              </div>
            )}

            {!isAssessing ? (
              <div className="relative z-10 grid w-full gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                      <span aria-hidden="true">✦</span> {sectorQuestCopy.eyebrow}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSectorQuestSettings(previous => !previous)}
                      className="rounded-full border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-extrabold text-slate-200 hover:border-indigo-400 hover:text-white"
                    >
                      <span aria-hidden="true">⚙</span> {sectorQuestCopy.settings}
                    </button>
                  </div>
                  <h3 className="mt-6 text-2xl font-black leading-tight text-white sm:text-3xl">
                    {lang === 'bn' ? 'তথ্য দিন, ২টি ছোট গেম খেলুন, ক্যারিয়ার খুঁজুন' : 'Share your profile, play 2 short games, find your careers'}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {lang === 'bn' ? 'আপনার পড়াশোনা, আগ্রহ, দক্ষতা ও লক্ষ্য জানিয়ে দুটি দ্রুত গেম খেলুন। সব ফল মিলিয়ে আপনার জন্য ক্যারিয়ার সুপারিশ তৈরি হবে।' : 'Tell us about your education, interests, skills, and goals, then play two quick games. We combine everything to recommend careers for you.'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[(lang === 'bn' ? '৫–৭ মিনিট' : '5–7 minutes'), (lang === 'bn' ? '১টি ফর্ম' : '1 simple form'), (lang === 'bn' ? '২টি ছোট গেম' : '2 short games')].map(item => (
                      <span key={item} className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4 text-xs leading-relaxed text-indigo-100">
                    <span className="mr-2" aria-hidden="true">💡</span>{lang === 'bn' ? 'সৎভাবে উত্তর দিন। গেমে ভুল হলেও সমস্যা নেই—এগুলো শুধু আপনার কাজের ধরন বুঝতে সাহায্য করে।' : 'Answer honestly. A wrong game answer is okay—the games only help us understand how you work.'}
                  </div>
                  <button
                    type="button"
                    onClick={beginSectorQuest}
                    className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-indigo-300 px-7 py-3 font-black text-slate-950 shadow-lg shadow-slate-950/20 hover:from-cyan-200 hover:to-indigo-200"
                  >
                    {hasSectorQuestDraft ? sectorQuestCopy.resume : sectorQuestCopy.start}
                    <span className="ml-3" aria-hidden="true">→</span>
                  </button>
                </div>

                <div className="grid gap-3">
                  {(['higher_studies', 'job', 'entrepreneurship'] as const).map((worldKey, worldIndex) => {
                    const world = CAREER_WORLDS[worldKey]
                    return (
                      <div
                        key={worldKey}
                        className="group relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/35 p-4"
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${world[lang].color}`} />
                        <div className="flex items-center gap-4">
                          <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${world[lang].color} text-2xl shadow-lg`} aria-hidden="true">
                            {world.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-white">{world[lang].name}</p>
                            <p className="mt-0.5 text-[11px] font-bold text-cyan-200">{world[lang].role}</p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-400">{world[lang].description}</p>
                          </div>
                          <span className="ml-auto self-start text-xs font-black text-slate-600">0{worldIndex + 1}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {showSectorQuestSettings && (
                  <div className="lg:col-span-2 rounded-2xl border border-indigo-400/20 bg-slate-950/60 p-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {([
                        ["autoAdvance", sectorQuestCopy.autoAdvance],
                        ["motion", sectorQuestCopy.motion],
                        ["compact", sectorQuestCopy.compact],
                        ["largeText", sectorQuestCopy.largeText],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={sectorQuestPreferences[key]}
                          onClick={() => updateSectorQuestPreference(key, !sectorQuestPreferences[key])}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs font-extrabold ${sectorQuestTransition} ${
                            sectorQuestPreferences[key]
                              ? "border-indigo-400 bg-indigo-400/15 text-white"
                              : "border-slate-700 bg-slate-900 text-slate-400"
                          }`}
                        >
                          <span>{label}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${sectorQuestPreferences[key] ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : aiLoading ? (
              /* Loading Screen */
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center z-10 relative">
                <div className={`w-14 h-14 border-4 border-cyan-400/20 border-t-cyan-300 rounded-full ${sectorQuestPreferences.motion ? "animate-spin" : ""}`}></div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {sectorQuestCopy.analyzing}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    {lang === 'bn' 
                      ? "জেমিআই এআই আপনার ব্যক্তিত্ব এবং উত্তরগুলো বিশ্লেষণ করে উপযুক্ত ক্যারিয়ারের পরামর্শ সাজাচ্ছে।" 
                      : "Gemini AI is analyzing your responses against your MBTI profile to select matching roles."
                    }
                  </p>
                </div>
              </div>
            ) : (
              /* Assessment Steps */
              <div className="space-y-6 relative z-10 text-left">
                {/* Quest phases and progress */}
                <div className="space-y-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                        {sectorQuestCopy.eyebrow}
                      </p>
                      <h4 className="mt-1 text-lg font-black text-white">
                        {SECTOR_QUEST_PHASES[sectorQuestPhase][lang].name}
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {SECTOR_QUEST_PHASES[sectorQuestPhase][lang].hint}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSectorQuestSettings(previous => !previous)}
                      className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-extrabold text-slate-300 hover:border-indigo-400 hover:text-white"
                    >
                      <span aria-hidden="true">⚙</span>
                      <span className="hidden sm:inline"> {sectorQuestCopy.settings}</span>
                    </button>
                  </div>

                  <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {[
                    { icon: '📝', en: { name: 'Profile form' }, bn: { name: 'তথ্য ফর্ম' }, total: 1 },
                    { icon: '🎮', en: { name: 'Skill games' }, bn: { name: 'দক্ষতার গেম' }, total: 2 },
                    { icon: '✨', en: { name: 'Your matches' }, bn: { name: 'আপনার ফলাফল' }, total: 1 },
                  ].map((phase, phaseIndex) => {
                      const phaseCompleted = phaseIndex === 0 ? validateForm() : phaseIndex === 1 ? Object.keys(gameAnswers).length === 2 : false
                      const phaseUnlocked = phaseIndex === 0 || (phaseIndex === 1 && validateForm()) || (phaseIndex === 2 && Object.keys(gameAnswers).length === 2)
                      const phaseStep = phaseIndex === 0 ? 0 : phaseIndex === 1 ? 1 : 3
                      return (
                        <button
                          key={phase.en.name}
                          type="button"
                          disabled={!phaseUnlocked}
                          onClick={() => moveSectorQuest(phaseStep)}
                          className={`flex min-w-[190px] flex-1 items-center gap-3 rounded-2xl border p-3 text-left ${sectorQuestTransition} ${
                            sectorQuestPhase === phaseIndex
                              ? "border-indigo-400 bg-indigo-400/15"
                              : phaseCompleted
                                ? "border-emerald-400/25 bg-emerald-400/10"
                                : "border-slate-800 bg-slate-950/30"
                          } disabled:cursor-not-allowed disabled:opacity-40`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                            phaseCompleted ? "bg-emerald-500 text-white" : "bg-white/10"
                          }`} aria-hidden="true">
                            {phaseCompleted ? "✓" : phase.icon}
                          </span>
                          <span>
                            <span className="block text-xs font-black text-white">{phase[lang].name}</span>
                            <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                              {phase.total} {lang === "bn" ? "ধাপ" : phase.total === 1 ? "step" : "steps"}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      role="progressbar"
                      aria-label={sectorQuestCopy.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={sectorQuestProgress}
                      className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-950"
                    >
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 ${sectorQuestTransition}`}
                        style={{ width: `${sectorQuestProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-cyan-300">
                      {sectorQuestXP} / 1000 {sectorQuestCopy.xp}
                    </span>
                  </div>

                  {showSectorQuestSettings && (
                    <div className="grid gap-2 rounded-2xl border border-indigo-400/20 bg-slate-950/50 p-3 sm:grid-cols-2 lg:grid-cols-4">
                      {([
                        ["autoAdvance", sectorQuestCopy.autoAdvance],
                        ["motion", sectorQuestCopy.motion],
                        ["compact", sectorQuestCopy.compact],
                        ["largeText", sectorQuestCopy.largeText],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={sectorQuestPreferences[key]}
                          onClick={() => updateSectorQuestPreference(key, !sectorQuestPreferences[key])}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-[11px] font-extrabold ${sectorQuestTransition} ${
                            sectorQuestPreferences[key]
                              ? "border-indigo-400 bg-indigo-400/15 text-white"
                              : "border-slate-700 bg-slate-900 text-slate-400"
                          }`}
                        >
                          <span>{label}</span>
                          <span className={`h-2.5 w-2.5 rounded-full ${sectorQuestPreferences[key] ? "bg-emerald-400" : "bg-slate-600"}`} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {assessStep === 0 && (
                  <div className="space-y-5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">01 · {lang === 'bn' ? 'আপনার তথ্য' : 'Your profile'}</span>
                      <h4 className="mt-2 text-2xl font-black text-white">{lang === 'bn' ? 'আপনার সম্পর্কে কিছু বলুন' : 'Tell us what matters to you'}</h4>
                      <p className="mt-2 text-sm text-slate-400">{lang === 'bn' ? 'এই তথ্য আপনার জন্য উপযুক্ত ক্যারিয়ার খুঁজতে সাহায্য করবে।' : 'We use these answers only to find careers that fit you better.'}</p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4">
                        <span className="text-xs font-black text-white">{lang === 'bn' ? 'বর্তমান শিক্ষার স্তর' : 'Current education level'}</span>
                        <select value={careerIntake.education} onChange={event => updateCareerIntake('education', event.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400">
                          <option value="">{lang === 'bn' ? 'একটি বেছে নিন' : 'Choose one'}</option>
                          {INTAKE_OPTIONS.education.map(item => <option key={item} value={item}>{lang === 'bn' ? INTAKE_BN[item] : item}</option>)}
                        </select>
                      </label>
                      <label className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4">
                        <span className="text-xs font-black text-white">{lang === 'bn' ? 'প্রধান লক্ষ্য' : 'Main career goal'}</span>
                        <select value={careerIntake.goal} onChange={event => updateCareerIntake('goal', event.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400">
                          <option value="">{lang === 'bn' ? 'একটি বেছে নিন' : 'Choose one'}</option>
                          {INTAKE_OPTIONS.goals.map(item => <option key={item} value={item}>{lang === 'bn' ? INTAKE_BN[item] : item}</option>)}
                        </select>
                      </label>
                    </div>
                    {([
                      ['favoriteSubjects', lang === 'bn' ? 'পছন্দের বিষয় (সর্বোচ্চ ৩টি)' : 'Favorite subjects (up to 3)', INTAKE_OPTIONS.subjects, 3],
                      ['interests', lang === 'bn' ? 'যে কাজগুলো ভালো লাগে (সর্বোচ্চ ৩টি)' : 'Activities you enjoy (up to 3)', INTAKE_OPTIONS.interests, 3],
                      ['skills', lang === 'bn' ? 'আপনার শক্তি (সর্বোচ্চ ৪টি)' : 'Your strengths (up to 4)', INTAKE_OPTIONS.skills, 4],
                    ] as const).map(([key, label, options, limit]) => (
                      <fieldset key={key} className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4">
                        <legend className="px-1 text-xs font-black text-white">{label}</legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {options.map(item => {
                            const selected = careerIntake[key].includes(item)
                            return <button key={item} type="button" aria-pressed={selected} onClick={() => toggleIntakeChoice(key, item, limit)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${selected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}`}>{selected ? '✓ ' : ''}{lang === 'bn' ? INTAKE_BN[item] : item}</button>
                          })}
                        </div>
                      </fieldset>
                    ))}
                    <div className="grid gap-4 lg:grid-cols-2">
                      {([
                        ['workStyle', lang === 'bn' ? 'পছন্দের কাজের ধরন' : 'Preferred work style', INTAKE_OPTIONS.workStyles],
                        ['workEnvironment', lang === 'bn' ? 'পছন্দের কাজের জায়গা' : 'Preferred work environment', INTAKE_OPTIONS.environments],
                      ] as const).map(([key, label, options]) => (
                        <label key={key} className="rounded-2xl border border-slate-700 bg-slate-950/35 p-4">
                          <span className="text-xs font-black text-white">{label}</span>
                          <select value={careerIntake[key]} onChange={event => updateCareerIntake(key, event.target.value)} className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400">
                            <option value="">{lang === 'bn' ? 'একটি বেছে নিন' : 'Choose one'}</option>
                            {options.map(item => <option key={item} value={item}>{lang === 'bn' ? INTAKE_BN[item] : item}</option>)}
                          </select>
                        </label>
                      ))}
                    </div>
                    <label className="block rounded-2xl border border-slate-700 bg-slate-950/35 p-4">
                      <span className="flex justify-between text-xs font-black text-white"><span>{lang === 'bn' ? 'নিজের দক্ষতার ওপর আস্থা' : 'Confidence in your skills'}</span><span className="text-cyan-300">{careerIntake.confidence}/5</span></span>
                      <input type="range" min="1" max="5" value={careerIntake.confidence} onChange={event => updateCareerIntake('confidence', Number(event.target.value))} className="mt-4 w-full accent-indigo-500" />
                    </label>
                    {flowError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs font-bold text-rose-200">{flowError}</p>}
                  </div>
                )}

                {assessStep === 1 && (
                  <div className="space-y-5">
                    <div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">02 · {lang === 'bn' ? 'গেম ১' : 'Game 1'}</span><h4 className="mt-2 text-2xl font-black text-white">{lang === 'bn' ? 'সংখ্যার ধারা' : 'Number pattern'}</h4><p className="mt-2 text-sm text-slate-400">{lang === 'bn' ? 'পরের সংখ্যাটি বেছে নিন।' : 'Choose the next number in the pattern.'}</p></div>
                    <div className="rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-5 sm:p-8">
                      <div className="grid grid-cols-5 gap-2">{GAME_SEQUENCE.map(number => <span key={number} className="grid aspect-square place-items-center rounded-2xl border border-white/10 bg-slate-950/50 text-xl font-black text-white sm:text-3xl">{number}</span>)}<span className="grid aspect-square place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-3xl font-black text-amber-300">?</span></div>
                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[28,30,32,34].map(number => <button key={number} type="button" onClick={() => setGameAnswers(previous => ({...previous, logic:number}))} className={`rounded-2xl border px-4 py-4 text-lg font-black ${gameAnswers.logic === number ? 'border-indigo-300 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-950/50 text-slate-200 hover:border-indigo-400'}`}>{number}</button>)}</div>
                    </div>
                    <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-100">{lang === 'bn' ? 'এটি আপনার যুক্তি ও সমস্যা সমাধানের ধরন বুঝতে সাহায্য করে।' : 'This helps us understand your logical problem-solving style.'}</p>
                  </div>
                )}

                {assessStep === 2 && (
                  <div className="space-y-5">
                    <div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">03 · {lang === 'bn' ? 'গেম ২' : 'Game 2'}</span><h4 className="mt-2 text-2xl font-black text-white">{lang === 'bn' ? 'প্রজেক্ট পরিকল্পনা' : 'Project planner'}</h4><p className="mt-2 text-sm text-slate-400">{lang === 'bn' ? 'আগামীকাল কাজ জমা দিতে হবে, কিন্তু একটি সমস্যা হয়েছে। আপনি কী করবেন?' : 'A project is due tomorrow, but a problem appears. What would you do?'}</p></div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['plan', '🗂️', lang === 'bn' ? 'দলের সঙ্গে আলোচনা করে কাজ ভাগ করি ও পরিষ্কার পরিকল্পনা বানাই।' : 'Discuss with the team, divide the work, and make a clear plan.'],
                        ['adapt', '⚡', lang === 'bn' ? 'সবচেয়ে জরুরি কাজ আগে করি এবং প্রয়োজন অনুযায়ী দ্রুত পরিবর্তন করি।' : 'Do the most urgent work first and adapt quickly as needed.'],
                      ].map(([value, icon, label]) => <button key={value} type="button" onClick={() => setGameAnswers(previous => ({...previous, planning:value}))} className={`min-h-40 rounded-2xl border p-5 text-left ${gameAnswers.planning === value ? 'border-indigo-300 bg-indigo-500/25 text-white shadow-lg' : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-indigo-400'}`}><span className="text-3xl" aria-hidden="true">{icon}</span><span className="mt-4 block text-sm font-bold leading-relaxed">{label}</span></button>)}
                    </div>
                    <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-100">{lang === 'bn' ? 'কোনো উত্তর ভুল নয়—এটি আপনার পরিকল্পনা ও মানিয়ে নেওয়ার ধরন দেখায়।' : 'There is no wrong answer—this shows how you plan and adapt.'}</p>
                  </div>
                )}

                {assessStep === 3 && confirmedSector && (
                  <div className="space-y-5">
                    <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/10 p-6 text-center"><span className="text-5xl" aria-hidden="true">🏆</span><h4 className="mt-3 text-2xl font-black text-white">{lang === 'bn' ? 'সব প্রস্তুত!' : 'You are all set!'}</h4><p className="mt-2 text-sm text-slate-300">{lang === 'bn' ? 'আপনার তথ্য ও দুইটি গেমের ফল একসঙ্গে বিশ্লেষণ করা হবে।' : 'Your profile and both game results will be analyzed together.'}</p></div>
                    <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4"><p className="text-[10px] font-black uppercase text-slate-500">{lang === 'bn' ? 'লক্ষ্য' : 'Goal'}</p><p className="mt-1 text-sm font-bold text-white">{lang === 'bn' ? INTAKE_BN[careerIntake.goal] : careerIntake.goal}</p></div><div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4"><p className="text-[10px] font-black uppercase text-slate-500">{lang === 'bn' ? 'সমস্যা সমাধান' : 'Problem solving'}</p><p className="mt-1 text-sm font-bold text-white">{Number(gameAnswers.logic) === 30 ? (lang === 'bn' ? 'শক্তিশালী যুক্তি' : 'Strong logic') : (lang === 'bn' ? 'চ্যালেঞ্জ থেকে শেখে' : 'Learns through challenge')}</p></div><div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-4"><p className="text-[10px] font-black uppercase text-slate-500">{lang === 'bn' ? 'কাজের ধরন' : 'Work approach'}</p><p className="mt-1 text-sm font-bold text-white">{gameAnswers.planning === 'plan' ? (lang === 'bn' ? 'পরিকল্পনামুখী' : 'Planning') : (lang === 'bn' ? 'মানিয়ে নিতে দক্ষ' : 'Adaptability')}</p></div></div>
                    <div className="rounded-2xl border border-indigo-400/25 bg-indigo-400/10 p-4"><p className="text-xs text-indigo-100">{lang === 'bn' ? 'প্রাথমিক পথ: ' : 'Likely direction: '}<strong className="text-white">{CAREER_WORLDS[confirmedSector][lang].name}</strong>. {lang === 'bn' ? 'চূড়ান্ত সুপারিশে সব তথ্য ব্যবহার করা হবে।' : 'All signals will be used for the final recommendations.'}</p></div>
                  </div>
                )}

                {/* Wizard Footer Navigation Controls */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                  {/* Cancel/Back button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (assessStep === 0) {
                        setIsAssessing(false)
                      } else {
                        moveSectorQuest(assessStep - 1)
                      }
                    }}
                    className="min-h-11 px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <span aria-hidden="true">{assessStep > 0 ? "← " : ""}</span>
                    {assessStep === 0 ? sectorQuestCopy.cancel : sectorQuestCopy.back}
                  </button>

                  <span className="hidden items-center gap-1.5 text-[10px] font-bold text-slate-500 md:flex">
                    <span className="text-emerald-400" aria-hidden="true">●</span> {sectorQuestCopy.saved}
                  </span>

                  {/* Next / Submit button */}
                  {assessStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => assessStep === 0 ? continueFromForm() : moveSectorQuest(assessStep + 1)}
                      disabled={
                        (assessStep === 1 && gameAnswers.logic === undefined) ||
                        (assessStep === 2 && gameAnswers.planning === undefined)
                      }
                      className="min-h-11 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sectorQuestCopy.next}<span aria-hidden="true"> →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitAssessment}
                      disabled={!confirmedSector || gameAnswers.logic === undefined || gameAnswers.planning === undefined}
                      className="min-h-11 px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>{sectorQuestCopy.analyze}</span>
                      <span aria-hidden="true">✦</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>


          {careerWorldReward && (
            <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-cyan-50 p-6 shadow-sm sm:p-8">
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${CAREER_WORLDS[careerWorldReward][lang].color} opacity-15 blur-2xl`} />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${CAREER_WORLDS[careerWorldReward][lang].color} text-4xl text-white shadow-xl`} aria-hidden="true">
                  {CAREER_WORLDS[careerWorldReward].icon}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                    🏅 {sectorQuestCopy.badge}
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">
                    {CAREER_WORLDS[careerWorldReward][lang].role}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {CAREER_WORLDS[careerWorldReward][lang].name} · 1000 {sectorQuestCopy.xp}
                  </p>
                  <p className="mt-2 text-xs font-extrabold text-emerald-700">
                    ✦ {sectorQuestCopy.unlocked}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 1. TOP MATCH CARDS (Vertical cards grid) */}
          <div id="recommendations-list" className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2 text-left">
              <span>🎯</span> {lang === 'bn' ? "আপনার জন্য সেরা ক্যারিয়ারসমূহ" : "Recommended Careers For You"}
            </h3>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {topRecommendations.map((rec) => {
                const description = getCareerDescription(rec.title, rec.description)
                return (
                  <div 
                    key={rec.id} 
                    className="bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition duration-300 flex flex-col items-center text-center relative overflow-hidden group"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                    
                    <div className="relative flex flex-col items-center flex-grow space-y-4 w-full">
                      {/* Recommendation strength from ranking */}
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        {recommendationLabel(rec.id)}
                      </span>

                      {/* Custom SVG Icon Container (Squircle) */}
                      <div className="transform group-hover:scale-105 transition-transform duration-300">
                        {getCareerIcon(rec.title, false)}
                      </div>

                      {/* Career Title & Description */}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
                          {rec.title}
                        </h4>
                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 px-1">
                          {description}
                        </p>
                      </div>
                    </div>

                    {/* Centered View Details button/link at bottom */}
                    <div className="relative w-full mt-6 pt-4 border-t border-slate-100 flex justify-center">
                      <button
                        onClick={() => setSelectedCareer(rec)}
                        className="font-bold text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>{lang === 'bn' ? "বিস্তারিত দেখুন" : "View Details"}</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. MORE CAREER OPTIONS (Grid layout with filter) */}
          {secondaryRecommendations.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                  <span>📊</span> {lang === 'bn' ? "আরও ক্যারিয়ার বিকল্পসমূহ" : "More Career Options"}
                </h3>
                
                <button
                  onClick={() => setFilterActive(prev => !prev)}
                  className={`px-3.5 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer ${
                    filterActive 
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>{lang === 'bn' ? "ফিল্টার" : "Filter"}</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {secondaryRecommendations.map((rec) => {
                  return (
                    <div 
                      key={rec.id}
                      onClick={() => setSelectedCareer(rec)}
                      className="bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4 cursor-pointer group text-left"
                    >
                      <div className="shrink-0 transform group-hover:scale-105 transition-transform duration-200">
                        {getCareerIcon(rec.title, true)}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate leading-snug group-hover:text-blue-600 transition">
                          {rec.title}
                        </h4>
                        <span className="text-xs font-bold text-emerald-600 mt-0.5 block">
                          {recommendationLabel(rec.id)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Go to Dashboard Action */}
          <div className="border-t border-slate-200 pt-8 flex justify-center">
            <Link
              href="/dashboard"
              className="py-4 px-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-extrabold text-white transition shadow-md shadow-blue-100 active:scale-95 text-center text-sm"
            >
              {lang === 'bn' ? "ড্যাশবোর্ডে ফিরুন" : "Go to Dashboard"}
            </Link>
          </div>

        </div>
      )}
    </DashboardLayout>
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
