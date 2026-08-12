"use client"

import { useEffect, useState, useMemo, useRef } from "react"
import Image from "next/image"
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
}

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

const EXPLORE_QUESTION_IMAGES: Record<string, { src: string; en: string; bn: string }> = {
  g1: { src: "/images/explore-careers/g1.webp", en: "A male student choosing among three career worlds", bn: "তিনটি ক্যারিয়ার জগতের মধ্যে বেছে নিচ্ছে একজন ছাত্র" },
  g2: { src: "/images/explore-careers/g2.webp", en: "A male student comparing three career quests", bn: "তিনটি ক্যারিয়ার অভিযান তুলনা করছে একজন ছাত্র" },
  g3: { src: "/images/explore-careers/g3.webp", en: "A male student choosing a career power-up", bn: "ক্যারিয়ার পাওয়ার-আপ বেছে নিচ্ছে একজন ছাত্র" },
  h1: { src: "/images/explore-careers/h1.webp", en: "A male scholar choosing a level of study", bn: "পড়াশোনার স্তর বেছে নিচ্ছে একজন ছাত্র" },
  h2: { src: "/images/explore-careers/h2.webp", en: "A male scholar exploring different fields of study", bn: "বিভিন্ন শিক্ষাক্ষেত্র অনুসন্ধান করছে একজন ছাত্র" },
  h3: { src: "/images/explore-careers/h3.webp", en: "A male scholar choosing where to study", bn: "কোথায় পড়বে তা বেছে নিচ্ছে একজন ছাত্র" },
  h4: { src: "/images/explore-careers/h4.webp", en: "A male scholar considering the impact of his discoveries", bn: "নিজের আবিষ্কারের প্রভাব ভাবছে একজন ছাত্র" },
  j1: { src: "/images/explore-careers/j1.webp", en: "A male career explorer choosing a workplace", bn: "কর্মক্ষেত্র বেছে নিচ্ছে একজন ছাত্র" },
  j2: { src: "/images/explore-careers/j2.webp", en: "A male career explorer choosing a professional specialty", bn: "পেশাগত দক্ষতার ক্ষেত্র বেছে নিচ্ছে একজন ছাত্র" },
  j3: { src: "/images/explore-careers/j3.webp", en: "A male career explorer comparing work arrangements", bn: "কাজের বিভিন্ন পদ্ধতি তুলনা করছে একজন ছাত্র" },
  j4: { src: "/images/explore-careers/j4.webp", en: "A male professional choosing a sustainable work pace", bn: "কাজের উপযুক্ত গতি বেছে নিচ্ছে একজন তরুণ" },
  e1: { src: "/images/explore-careers/e1.webp", en: "A male founder choosing a venture to build", bn: "কোন উদ্যোগ গড়বে তা বেছে নিচ্ছে একজন তরুণ" },
  e2: { src: "/images/explore-careers/e2.webp", en: "A male founder choosing his strongest skill", bn: "নিজের প্রধান দক্ষতা বেছে নিচ্ছে একজন তরুণ" },
  e3: { src: "/images/explore-careers/e3.webp", en: "A male founder comparing ways to fund a venture", bn: "উদ্যোগের অর্থায়নের পথ তুলনা করছে একজন তরুণ" },
  e4: { src: "/images/explore-careers/e4.webp", en: "A male founder defining what success means to him", bn: "সাফল্যের অর্থ নির্ধারণ করছে একজন তরুণ" },
}

function ExploreQuestionImage({ questionId, lang, priority = false }: { questionId: string; lang: 'en' | 'bn'; priority?: boolean }) {
  const illustration = EXPLORE_QUESTION_IMAGES[questionId]
  if (!illustration) return null

  return (
    <div className="relative mt-3 aspect-[3/2] w-full overflow-hidden rounded-2xl border border-indigo-400/20 bg-slate-950 shadow-lg shadow-slate-950/20">
      <Image
        src={illustration.src}
        alt={illustration[lang]}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 920px, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  )
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
  const sectorAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sectorQuestAnswerCount =
    Object.keys(generalSelected).length +
    Object.keys(sectorSelected).length +
    (confirmedSector ? 1 : 0)
  const sectorQuestProgress = Math.round((sectorQuestAnswerCount / 8) * 100)
  const sectorQuestXP = sectorQuestAnswerCount * 125
  const hasSectorQuestDraft =
    Object.keys(generalSelected).length > 0 ||
    Object.keys(sectorSelected).length > 0 ||
    assessStep > 0
  const sectorQuestPhase = assessStep < 3 ? 0 : assessStep === 3 ? 1 : 2
  const sectorQuestCopy = SECTOR_QUEST_COPY[lang]
  const sectorQuestTransition = sectorQuestPreferences.motion
    ? "transition-all duration-300 ease-out"
    : "transition-none"

  const detectedSector = useMemo(() => {
    const counts: Record<string, number> = { higher_studies: 0, job: 0, entrepreneurship: 0 }
    Object.values(generalSelected).forEach(val => {
      if (val in counts) {
        counts[val]++
      }
    })
    let maxSector: 'higher_studies' | 'job' | 'entrepreneurship' = 'job'
    let maxVal = -1
    for (const sec of ['higher_studies', 'job', 'entrepreneurship'] as const) {
      if (counts[sec] > maxVal) {
        maxVal = counts[sec]
        maxSector = sec
      }
    }
    return maxSector
  }, [generalSelected])

  useEffect(() => {
    if (assessStep === 3 && !confirmedSector) {
      setConfirmedSector(detectedSector)
    }
  }, [assessStep, detectedSector, confirmedSector])

  useEffect(() => {
    return () => {
      if (sectorAdvanceTimer.current) clearTimeout(sectorAdvanceTimer.current)
    }
  }, [])

  function moveSectorQuest(step: number) {
    if (sectorAdvanceTimer.current) clearTimeout(sectorAdvanceTimer.current)
    setSectorQuestMilestone(null)
    setAssessStep(Math.max(0, Math.min(7, step)))
  }

  function scheduleSectorQuestAdvance(nextStep: number, completedPhase?: number) {
    if (!sectorQuestPreferences.autoAdvance) return
    if (sectorAdvanceTimer.current) clearTimeout(sectorAdvanceTimer.current)
    if (completedPhase !== undefined) setSectorQuestMilestone(completedPhase)
    const delay = sectorQuestPreferences.motion
      ? completedPhase !== undefined ? 1400 : 950
      : completedPhase !== undefined ? 800 : 600
    sectorAdvanceTimer.current = setTimeout(() => {
      setSectorQuestMilestone(null)
      setAssessStep(nextStep)
    }, delay)
  }

  function selectGeneralSectorAnswer(value: string) {
    setGeneralSelected(previous => ({ ...previous, [assessStep]: value }))
    scheduleSectorQuestAdvance(assessStep + 1, assessStep === 2 ? 0 : undefined)
  }

  function selectConfirmedSector(
    sector: 'higher_studies' | 'job' | 'entrepreneurship'
  ) {
    setConfirmedSector(previous => {
      if (previous && previous !== sector) setSectorSelected({})
      return sector
    })
    scheduleSectorQuestAdvance(4, 1)
  }

  function selectSectorDetailAnswer(value: string) {
    const sectorQuestionIndex = assessStep - 4
    setSectorSelected(previous => ({ ...previous, [sectorQuestionIndex]: value }))
    if (assessStep < 7) {
      scheduleSectorQuestAdvance(assessStep + 1)
    }
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
    }
    setIsAssessing(true)
  }

  async function handleSubmitAssessment() {
    const activeMbti = user?.mbti || localMbti
    if (!activeMbti || !confirmedSector) return
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
    const sectorAnswersList = sectorQuestionsList.map((q, idx) => {
      const selectedVal = sectorSelected[idx]
      const option = q.options.find(o => o.value === selectedVal)
      return {
        question: q.questionText.en,
        answer: option ? option.text.en : selectedVal,
        value: selectedVal,
      }
    })

    const assessmentPayload = {
      sector: confirmedSector,
      generalAnswers: generalAnswersList,
      sectorAnswers: sectorAnswersList
    }

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personality: activeMbti, assessment: assessmentPayload })
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
        setAssessStep(Math.max(0, Math.min(7, draft.assessStep)))
      }
      if (draft.preferences) {
        setSectorQuestPreferences(previous => ({ ...previous, ...draft.preferences }))
      }
      if (
        draft.isAssessing ||
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
    }
    localStorage.setItem(SECTOR_QUEST_DRAFT_KEY, JSON.stringify(draft))
  }, [
    assessStep,
    confirmedSector,
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

  const hasTakenAssessment = !!(user?.mbti || localMbti)
 
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
      ) : hasTakenAssessment ? (
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
                  {lang === 'bn' ? `${user?.mbti || localMbti || "ESTJ"} ব্যক্তিত্বের ধরণ ভিত্তিক সঠিক পছন্দগুলো` : `Based on your assessment results (${user?.mbti || localMbti || "ESTJ"} Personality Type)`}
                </p>
              </div>

              {/* Large Personality Badge */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl text-center text-white shrink-0 shadow-lg shadow-blue-100 flex flex-col justify-center items-center">
                <p className="text-blue-100 text-xs font-bold tracking-wider uppercase mb-1">{lang === 'bn' ? "ব্যক্তিত্ব ধরণ" : "Personality"}</p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{user?.mbti || localMbti || "ESTJ"}</h2>
                <p className="text-blue-200 text-[10px] font-semibold mt-2 max-w-[120px] uppercase">{lang === 'bn' ? "ব্যক্তিত্ব প্রোফাইল" : "Profile Type"}</p>
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
                    {sectorQuestCopy.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                    {sectorQuestCopy.intro}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[sectorQuestCopy.time, sectorQuestCopy.missions, sectorQuestCopy.questions].map(item => (
                      <span key={item} className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] font-bold text-slate-300">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4 text-xs leading-relaxed text-indigo-100">
                    <span className="mr-2" aria-hidden="true">💡</span>{sectorQuestCopy.honest}
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
                    {SECTOR_QUEST_PHASES.map((phase, phaseIndex) => {
                      const phaseCompleted =
                        phaseIndex === 0
                          ? Object.keys(generalSelected).length === 3
                          : phaseIndex === 1
                            ? assessStep > 3
                            : Object.keys(sectorSelected).length === 4
                      const phaseUnlocked =
                        phaseIndex === 0 ||
                        (phaseIndex === 1 && Object.keys(generalSelected).length === 3) ||
                        (phaseIndex === 2 && Boolean(confirmedSector))
                      const phaseStep = phaseIndex === 0 ? 0 : phaseIndex === 1 ? 3 : 4
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

                {/* Render Phase 1 Questions (General Sector Fit) */}
                {assessStep < 3 && (
                  <div className={sectorQuestPreferences.compact ? "space-y-3" : "space-y-5"}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300">
                        {lang === "bn" ? `লোডআউট মুভ ${assessStep + 1} / ৩` : `Loadout move ${assessStep + 1} of 3`}
                      </span>
                      <ExploreQuestionImage
                        questionId={GENERAL_QUESTIONS[assessStep].id}
                        lang={lang}
                        priority={assessStep === 0}
                      />
                      <p className={`${sectorQuestPreferences.largeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} mt-2 font-black leading-snug text-white`}>
                      {lang === 'bn' ? GENERAL_QUESTIONS[assessStep].questionText.bn : GENERAL_QUESTIONS[assessStep].questionText.en}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">{sectorQuestCopy.choiceHint}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {GENERAL_QUESTIONS[assessStep].options.map((opt, oIdx) => {
                        const isSelected = generalSelected[assessStep] === opt.value
                        const worldKey = opt.value as keyof typeof CAREER_WORLDS
                        const world = CAREER_WORLDS[worldKey]
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectGeneralSectorAnswer(opt.value)}
                            className={`${sectorQuestPreferences.compact ? "p-3" : "p-4"} min-h-32 rounded-2xl border text-left text-xs sm:text-sm font-medium leading-relaxed cursor-pointer select-none ${sectorQuestTransition} ${
                              isSelected
                                ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-lg shadow-indigo-950/20 -translate-y-1'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/70'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${world[lang].color} text-xl shadow-lg`} aria-hidden="true">
                                {isSelected ? "✓" : world.icon}
                              </span>
                              <span>
                                <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300">
                                  {world[lang].name}
                                </span>
                                <span className="mt-1 block">{lang === 'bn' ? opt.text.bn : opt.text.en}</span>
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {generalSelected[assessStep] && (
                      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3.5" aria-live="polite">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
                          ✦ {sectorQuestCopy.powerUp}
                        </p>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-emerald-50">
                          {CAREER_WORLDS[generalSelected[assessStep] as keyof typeof CAREER_WORLDS][lang].role}
                          {" · +125 "}{sectorQuestCopy.xp}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Render Phase 2: Confirmation / Selection */}
                {assessStep === 3 && (
                  <div className={sectorQuestPreferences.compact ? "space-y-3" : "space-y-5"}>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
                        {sectorQuestCopy.recommended}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-300">
                        <strong className="text-lg font-black capitalize text-white sm:text-xl">
                          {confirmedSector ? CAREER_WORLDS[confirmedSector][lang].name : ""}
                        </strong>
                      </p>
                      {confirmedSector && (
                        <p className="mt-1 text-xs font-extrabold text-cyan-200">
                          {CAREER_WORLDS[confirmedSector][lang].role}
                        </p>
                      )}
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">{sectorQuestCopy.confirm}</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(['higher_studies', 'job', 'entrepreneurship'] as const).map((sec, sIdx) => {
                        const isSelected = confirmedSector === sec
                        const world = CAREER_WORLDS[sec]
                        
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectConfirmedSector(sec)}
                            className={`${sectorQuestPreferences.compact ? "p-3" : "p-4"} min-h-32 rounded-2xl border text-left cursor-pointer select-none ${sectorQuestTransition} ${
                              isSelected
                                ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-lg shadow-indigo-950/20 -translate-y-1'
                                : 'bg-slate-950/40 border-slate-800 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/70'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${world[lang].color} text-2xl shadow-lg`} aria-hidden="true">
                                {world.icon}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-sm text-slate-100">{world[lang].name}</h5>
                                <p className="mt-0.5 text-[10px] font-bold text-cyan-200">{world[lang].role}</p>
                                <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{world[lang].description}</p>
                              </div>
                              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ml-auto text-[8px] font-bold ${
                                isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600'
                              }`}>
                                {isSelected && "✓"}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Render Phase 3: Sector Specific Questions */}
                {assessStep >= 4 && assessStep <= 7 && confirmedSector && (
                  <div className={sectorQuestPreferences.compact ? "space-y-3" : "space-y-5"}>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-indigo-300">
                        {lang === "bn" ? `ফিল্ড মিশন ${assessStep - 3} / ৪` : `Field mission ${assessStep - 3} of 4`}
                      </span>
                      <ExploreQuestionImage
                        questionId={SECTOR_QUESTIONS[confirmedSector][assessStep - 4].id}
                        lang={lang}
                      />
                      <p className={`${sectorQuestPreferences.largeText ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"} mt-2 font-black leading-snug text-white`}>
                        {lang === 'bn'
                          ? SECTOR_QUESTIONS[confirmedSector][assessStep - 4].questionText.bn
                          : SECTOR_QUESTIONS[confirmedSector][assessStep - 4].questionText.en
                        }
                      </p>
                      <p className="mt-2 text-xs font-semibold text-slate-400">{sectorQuestCopy.choiceHint}</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {SECTOR_QUESTIONS[confirmedSector][assessStep - 4].options.map((opt, oIdx) => {
                        const isSelected = sectorSelected[assessStep - 4] === opt.value
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => selectSectorDetailAnswer(opt.value)}
                            className={`${sectorQuestPreferences.compact ? "p-3" : "p-4"} min-h-24 rounded-2xl border text-left text-xs sm:text-sm font-medium leading-relaxed cursor-pointer select-none ${sectorQuestTransition} ${
                              isSelected
                                ? 'bg-indigo-500/15 border-indigo-400 text-white shadow-lg shadow-indigo-950/20'
                                : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:-translate-y-0.5 hover:border-slate-600 hover:bg-slate-900/70'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-[10px] font-black ${
                                isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-600 bg-slate-900 text-slate-400'
                              }`}>
                                {isSelected ? "✓" : String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{lang === 'bn' ? opt.text.bn : opt.text.en}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                    {sectorSelected[assessStep - 4] && (
                      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-3.5" aria-live="polite">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300">
                          ✦ {sectorQuestCopy.powerUp}
                        </p>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-emerald-50">
                          {
                            SECTOR_QUESTIONS[confirmedSector][assessStep - 4].options.find(
                              option => option.value === sectorSelected[assessStep - 4]
                            )?.text[lang]
                          }
                          {" · +125 "}{sectorQuestCopy.xp}
                        </p>
                      </div>
                    )}
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
                  {assessStep < 7 ? (
                    <button
                      type="button"
                      onClick={() => moveSectorQuest(assessStep + 1)}
                      disabled={
                        (assessStep < 3 && !generalSelected[assessStep]) ||
                        (assessStep === 3 && !confirmedSector) ||
                        (assessStep >= 4 && !sectorSelected[assessStep - 4])
                      }
                      className="min-h-11 px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sectorQuestCopy.next}<span aria-hidden="true"> →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitAssessment}
                      disabled={!sectorSelected[3]}
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
      ) : (
        /* Pending CTA Card */
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <div className="text-6xl animate-bounce">🎯</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {lang === 'bn' ? "ব্যক্তিত্ব ও ক্যারিয়ার মূল্যায়ন করুন" : "Explore Careers Recommendations"}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
            {lang === 'bn' 
              ? "আপনার ক্যারিয়ার সুপারিশ দেখতে প্রথমে ৫ মিনিটের একটি মূল্যায়ন করতে হবে।" 
              : "To view matching career recommendations, please complete the personality and interests assessment first."
            }
          </p>
          <div className="pt-4">
            <Link 
              href="/assessment" 
              className="inline-flex justify-center items-center py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 text-sm"
            >
              {lang === 'bn' ? "মূল্যায়ন শুরু করুন" : "Start Career Assessment"}
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
