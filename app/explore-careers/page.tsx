"use client"

import { useEffect, useState, useMemo } from "react"
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
const recommendationsById = new Map(
  (careerCatalog as Recommendation[]).map(career => [career.id, career])
)

function recommendationsFromIds(ids: string[]): Recommendation[] {
  return ids
    .map(id => recommendationsById.get(id))
    .filter((career): career is Recommendation => Boolean(career))
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

const GENERAL_QUESTIONS: Question[] = [
  {
    id: "g1",
    questionText: {
      en: "What type of daily environment sounds most appealing to you?",
      bn: "কোন ধরণের দৈনন্দিন কাজের পরিবেশ আপনার কাছে সবচেয়ে বেশি আকর্ষণীয় মনে হয়?"
    },
    options: [
      {
        text: {
          en: "A university campus, laboratory, or library, diving deep into research.",
          bn: "একটি বিশ্ববিদ্যালয় ক্যাম্পাস, গবেষণাগার বা লাইব্রেরি, যেখানে গভীর গবেষণা করা যায়।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "A structured company office or collaborative team environment working on real-world projects.",
          bn: "একটি সুসংগঠিত প্রাতিষ্ঠানিক অফিস বা সহযোগিতামূলক দলগত পরিবেশ যেখানে বাস্তব প্রজেক্টে কাজ করা যায়।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "An independent space, leading my own projects, building a team, or freelancing.",
          bn: "একটি স্বাধীন পরিবেশ, যেখানে নিজের প্রজেক্ট পরিচালনা, টিম তৈরি বা ফ্রিল্যান্সিং করা যায়।"
        },
        value: "entrepreneurship",
        sector: "entrepreneurship"
      }
    ]
  },
  {
    id: "g2",
    questionText: {
      en: "What is your primary career motivation?",
      bn: "আপনার ক্যারিয়ারের মূল প্রেরণা কোনটি?"
    },
    options: [
      {
        text: {
          en: "To master a specific subject, conduct original research, and publish papers or teach.",
          bn: "একটি নির্দিষ্ট বিষয়ে দক্ষতা অর্জন করা, মৌলিক গবেষণা পরিচালনা করা এবং প্রবন্ধ প্রকাশ বা শিক্ষকতা করা।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "To gain a stable income, develop corporate skills, and climb a structured ladder.",
          bn: "একটি স্থিতিশীল আয় অর্জন করা, প্রাতিষ্ঠানিক দক্ষতা বৃদ্ধি করা এবং নির্দিষ্ট ধাপ অতিক্রম করে এগিয়ে যাওয়া।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "To build a business from scratch, solve a market need, and have full ownership.",
          bn: "একেবারে শুরু থেকে একটি ব্যবসা গড়ে তোলা, বাজারের চাহিদা পূরণ করা এবং সম্পূর্ণ মালিকানা নিজের কাছে রাখা।"
        },
        value: "entrepreneurship",
        sector: "entrepreneurship"
      }
    ]
  },
  {
    id: "g3",
    questionText: {
      en: "How do you prefer to handle professional risk and reward?",
      bn: "আপনি পেশাগত ঝুঁকি ও সাফল্যকে কীভাবে মূল্যায়ন করেন?"
    },
    options: [
      {
        text: {
          en: "Willing to invest years in education/low-paying stipends for deep expertise.",
          bn: "গভীর জ্ঞান অর্জনের জন্য দীর্ঘ সময় পড়াশোনা বা কম বেতনের স্টাইপেন্ডে কাটানোর মানসিকতা রয়েছে।"
        },
        value: "higher_studies",
        sector: "higher_studies"
      },
      {
        text: {
          en: "Prefer a predictable, steady salary with standard benefits and set working hours.",
          bn: "সুনির্দিষ্ট কাজের সময় এবং নিয়মিত সুযোগ-সুবিধাসহ একটি স্থিতিশীল ও সুনিশ্চিত বেতন পছন্দ করি।"
        },
        value: "job",
        sector: "job"
      },
      {
        text: {
          en: "Willing to take high financial risk for high reward and business autonomy.",
          bn: "ব্যবসায়িক স্বাধীনতা এবং বড় সফলতার জন্য উচ্চ অর্থনৈতিক ঝুঁকি নিতে রাজি।"
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
        en: "What level of education are you aiming to achieve?",
        bn: "আপনি শিক্ষার কোন স্তরে পৌঁছাতে চান?"
      },
      options: [
        { text: { en: "Master's Degree (Specialized knowledge)", bn: "মাস্টার্স ডিগ্রি (বিশেষায়িত জ্ঞান)" }, value: "Master's Degree" },
        { text: { en: "PhD / Doctorate (Research & academia)", bn: "পিএইচডি / ডক্টরেট (গবেষণা ও শিক্ষাবিদ্যা)" }, value: "PhD / Doctorate" },
        { text: { en: "Professional Certification / Diploma", bn: "পেশাদার সার্টিফিকেট / ডিপ্লোমা" }, value: "Professional Certification / Diploma" }
      ]
    },
    {
      id: "h2",
      questionText: {
        en: "What is your preferred area of research or study?",
        bn: "আপনার গবেষণা বা পড়াশোনার পছন্দের ক্ষেত্র কোনটি?"
      },
      options: [
        { text: { en: "STEM (Science, Tech, Engineering, Math)", bn: "স্টেম (বিজ্ঞান, প্রযুক্তি, প্রকৌশল, গণিত)" }, value: "STEM" },
        { text: { en: "Social Sciences & Business Management", bn: "সামাজিক বিজ্ঞান ও ব্যবসায়িক ব্যবস্থাপনা" }, value: "Social Sciences & Business Management" },
        { text: { en: "Arts, Literature & Humanities", bn: "কলা, সাহিত্য ও মানবিক শাখা" }, value: "Arts & Humanities" }
      ]
    },
    {
      id: "h3",
      questionText: {
        en: "Where would you prefer to pursue your higher studies?",
        bn: "আপনি কোথায় উচ্চশিক্ষা গ্রহণ করতে চান?"
      },
      options: [
        { text: { en: "In my home country (established universities)", bn: "নিজের দেশে (প্রতিষ্ঠিত বিশ্ববিদ্যালয়ে)" }, value: "Home Country" },
        { text: { en: "Abroad (North America, Europe, Asia-Pacific for global exposure)", bn: "বিদেশে (উত্তর আমেরিকা, ইউরোপ বা এশিয়া-প্যাসিফিক অঞ্চল)" }, value: "Abroad" },
        { text: { en: "Online / Hybrid programs while working", bn: "কাজের পাশাপাশি অনলাইন / হাইব্রিড প্রোগ্রাম" }, value: "Online/Hybrid" }
      ]
    },
    {
      id: "h4",
      questionText: {
        en: "What is your ultimate goal after studying?",
        bn: "পড়াশোনা শেষ করার পর আপনার মূল লক্ষ্য কী?"
      },
      options: [
        { text: { en: "Become a university professor or academic researcher", bn: "বিশ্ববিদ্যালয়ের অধ্যাপক বা একাডেমিক গবেষক হওয়া" }, value: "Professor/Researcher" },
        { text: { en: "Enter R&D departments in corporate industries", bn: "কর্পোরেট শিল্পে গবেষণা ও উন্নয়ন (R&D) বিভাগে যোগ দেওয়া" }, value: "Corporate R&D" },
        { text: { en: "Advise governments, NGOs, or public institutions", bn: "সরকারি প্রতিষ্ঠান, এনজিও বা জনকল্যাণ সংস্থায় পরামর্শদাতা হওয়া" }, value: "Policy Advisor/Consultant" }
      ]
    }
  ],
  job: [
    {
      id: "j1",
      questionText: {
        en: "What type of organization would you prefer to work for?",
        bn: "আপনি কোন ধরনের প্রতিষ্ঠানে কাজ করতে চান?"
      },
      options: [
        { text: { en: "A large multinational corporation (stability, corporate structure)", bn: "একটি বড় বহুজাতিক কর্পোরেশন (স্থিতিশীলতা ও সুনির্দিষ্ট কাঠামো)" }, value: "Multinational Corporation" },
        { text: { en: "A fast-growing startup / medium company (rapid learning, flexibility)", bn: "একটি দ্রুত বর্ধনশীল স্টার্টআপ / মাঝারি মানের প্রতিষ্ঠান (দ্রুত শেখা ও নমনীয়তা)" }, value: "Startup/Medium Company" },
        { text: { en: "Government / Public Sector (high job security, public service)", bn: "সরকারি / পাবলিক সেক্টর (উচ্চ নিরাপত্তা ও জনসেবা)" }, value: "Government/Public Sector" }
      ]
    },
    {
      id: "j2",
      questionText: {
        en: "Which category of job roles interests you the most?",
        bn: "কোন ধরনের কাজের ক্ষেত্রে আপনার আগ্রহ সবচেয়ে বেশি?"
      },
      options: [
        { text: { en: "Technical & Analytical (Software, engineering, analytics)", bn: "প্রযুক্তিগত ও বিশ্লেষণধর্মী (সফটওয়্যার, প্রকৌশল, অ্যানালিটিক্স)" }, value: "Technical & Analytical" },
        { text: { en: "Creative & Design (UI/UX, copywriting, marketing, design)", bn: "সৃজনশীল ও ডিজাইন সংক্রান্ত (ইউআই/ইউএক্স, কপিরাইটিং, মার্কেটিং, ডিজাইন)" }, value: "Creative & Design" },
        { text: { en: "Management & Operations (Product management, project lead, strategy)", bn: "ব্যবস্থাপনা ও পরিচালনা সংক্রান্ত (প্রোডাক্ট বা প্রজেক্ট ম্যানেজমেন্ট, স্ট্র্যাটেজি)" }, value: "Management & Operations" }
      ]
    },
    {
      id: "j3",
      questionText: {
        en: "What is your ideal work arrangement?",
        bn: "আপনার পছন্দের কাজের ধরণ কোনটি?"
      },
      options: [
        { text: { en: "Fully Remote (work from anywhere, high flexibility)", bn: "সম্পূর্ণ রিমোট (যেকোনো স্থান থেকে কাজ, উচ্চ নমনীয়তা)" }, value: "Fully Remote" },
        { text: { en: "Hybrid (split time between home and office)", bn: "হাইব্রিড (বাসা এবং অফিস উভয় স্থান মিলিয়ে কাজ)" }, value: "Hybrid" },
        { text: { en: "On-site (dedicated office space, direct collaboration)", bn: "অন-সাইট (সুনির্দিষ্ট অফিস এবং সরাসরি দলগত সহযোগিতা)" }, value: "On-site" }
      ]
    },
    {
      id: "j4",
      questionText: {
        en: "What work-life dynamic do you prefer?",
        bn: "আপনি কাজের ক্ষেত্রে কেমন ব্যালেন্স চান?"
      },
      options: [
        { text: { en: "Strict 9-to-5 boundaries with weekends free", bn: "সুনির্দিষ্ট ৯টা-৫টার সীমানা এবং ছুটির দিন সম্পূর্ণ ফ্রি রাখা" }, value: "Strict 9-to-5" },
        { text: { en: "High intensity, high growth, and willing to work extra hours for promotion", bn: "উচ্চ প্রবৃদ্ধি এবং প্রমোশন বা বোনাসের জন্য অতিরিক্ত পরিশ্রম করতে রাজি" }, value: "High Growth / High Intensity" },
        { text: { en: "Flexible/freelance hours with focus on completed tasks", bn: "কাজের সফলতার ওপর গুরুত্ব দিয়ে নিজস্ব ফ্লেক্সিবল সময় নির্ধারণ" }, value: "Flexible Hours" }
      ]
    }
  ],
  entrepreneurship: [
    {
      id: "e1",
      questionText: {
        en: "What type of business venture excites you most?",
        bn: "কোন ধরনের ব্যবসা আপনাকে সবচেয়ে বেশি অনুপ্রাণিত করে?"
      },
      options: [
        { text: { en: "Tech startup (SaaS, AI, apps) aiming for venture capital and scale", bn: "প্রযুক্তিগত স্টার্টআপ (SaaS, AI, অ্যাপস) যার লক্ষ্য বড় আকারের বিনিয়োগ ও বিস্তার" }, value: "Tech Startup" },
        { text: { en: "Service-based agency/consultancy (design, agency, freelancing)", bn: "সেবামূলক এজেন্সি/কনসালটেন্সি (ডিজাইন, সফটওয়্যার এজেন্সি, ফ্রিল্যান্সিং)" }, value: "Service Agency" },
        { text: { en: "E-commerce or physical products (selling goods online/offline)", bn: "ই-কমার্স বা ভৌত পণ্য (অনলাইন বা অফলাইনে পণ্য বিক্রি)" }, value: "E-commerce/Physical Products" }
      ]
    },
    {
      id: "e2",
      questionText: {
        en: "What is your primary strength as a founder?",
        bn: "প্রতিষ্ঠাতা হিসেবে আপনার মূল শক্তি কোনটি?"
      },
      options: [
        { text: { en: "Product development & Technical execution (the builder)", bn: "পণ্য উন্নয়ন ও কারিগরি বাস্তবায়ন (দ্য বিল্ডার)" }, value: "Product & Tech Builder" },
        { text: { en: "Sales, Marketing, & Networking (the growth engine)", bn: "বিক্রয়, বিপণন এবং নেটওয়ার্কিং (দ্য গ্রোথ ইঞ্জিন)" }, value: "Sales & Marketing" },
        { text: { en: "Operations, Finance, & Strategy (the manager)", bn: "পরিচালনা, অর্থসংস্থান এবং কৌশল নির্ধারণ (দ্য ম্যানেজার)" }, value: "Operations & Finance" }
      ]
    },
    {
      id: "e3",
      questionText: {
        en: "How do you plan to fund your business initially?",
        bn: "শুরুতে আপনি কীভাবে অর্থায়নের ব্যবস্থা করবেন?"
      },
      options: [
        { text: { en: "Bootstrapping (using my own savings and reinvesting revenue)", bn: "বুটস্ট্র্যাপিং (নিজের সঞ্চয় এবং অর্জিত রাজস্ব পুনরায় বিনিয়োগ করা)" }, value: "Bootstrapping" },
        { text: { en: "Raising external funding (angel investors, VC, loans)", bn: "বাইরের বিনিয়োগ সংগ্রহ (অ্যাঞ্জেল ইনভেস্টর, ভিসি বা লোন)" }, value: "External Funding" },
        { text: { en: "Crowdfunding or pre-selling products to customers", bn: "ক্রাউডফান্ডিং বা কাস্টমারদের কাছে অগ্রিম পণ্য বিক্রি করা" }, value: "Crowdfunding/Pre-sales" }
      ]
    },
    {
      id: "e4",
      questionText: {
        en: "What is your main reason for choosing entrepreneurship?",
        bn: "উদ্যোক্তা হওয়ার পেছনে আপনার প্রধান কারণ কোনটি?"
      },
      options: [
        { text: { en: "Complete creative control and intellectual independence", bn: "সম্পূর্ণ সৃজনশীল নিয়ন্ত্রণ এবং বুদ্ধিবৃত্তিক স্বাধীনতা" }, value: "Creative/Intellectual Control" },
        { text: { en: "Unlimited financial potential and wealth creation", bn: "অসীম আর্থিক সম্ভাবনা এবং সম্পদ তৈরি" }, value: "Wealth Creation" },
        { text: { en: "Flexibility of lifestyle and being my own boss", bn: "জীবনযাত্রার নমনীয়তা এবং নিজের বস নিজে হওয়া" }, value: "Lifestyle & Autonomy" }
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
        setRecommendations(data.recommendations)
        
        // Reset assessment states
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
    }
  }, [])

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

  // Load matches dynamically based on profile
  useEffect(() => {
    async function loadMatches() {
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
    if (isMounted && (activeMbti || assessmentRecommendationKey)) {
      loadMatches()
    }
  }, [isMounted, activeMbti, assessmentRecommendationKey])

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
    try {
      if (user) {
        const res = await fetch("/api/journey", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "select-career", career }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Could not choose career")
        setUser({ ...user, journey: data.journey })
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
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden select-none">
            {/* background gradient flare */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl"></div>

            {!isAssessing ? (
              <div className="flex flex-col md:flex-row items-center gap-6 text-left relative z-10 w-full justify-between">
                <div className="space-y-2 max-w-lg">
                  <span className="inline-block px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    ✨ AI Interactive Career Assessor
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {lang === 'bn' ? "পছন্দ অনুযায়ী এআই ক্যারিয়ার মূল্যায়ন" : "Interactive Sector-Based AI Assessment"}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {lang === 'bn' 
                      ? "পদ্ধতিগত প্রশ্নের মাধ্যমে উচ্চশিক্ষা, চাকরি, বা উদ্যোক্তা হওয়ার মধ্যকার আগ্রহ যাচাই করুন এবং আপনার জন্য উপযুক্ত ক্যারিয়ারের পরামর্শ নিন।" 
                      : "Answer a few questions to find your fit among Higher Studies, Job, or Entrepreneurship, followed by a sector-specific deep dive for tailored recommendations."
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssessing(true)
                    setAssessStep(0)
                    setGeneralSelected({})
                    setSectorSelected({})
                    setConfirmedSector(null)
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-97 cursor-pointer shrink-0"
                >
                  {lang === 'bn' ? "মূল্যায়ন শুরু করুন" : "Begin Assessment"}
                </button>
              </div>
            ) : aiLoading ? (
              /* Loading Screen */
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center z-10 relative">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    {lang === 'bn' ? "ক্যারিয়ার সুপারিশ তৈরি হচ্ছে..." : "Generating Custom Careers..."}
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
                {/* Wizard Header Progress */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                      {assessStep < 3 
                        ? (lang === 'bn' ? `ধাপ ১: সাধারণ আগ্রহ (${assessStep + 1}/৩)` : `Phase 1: Sector Fit (${assessStep + 1}/3)`)
                        : assessStep === 3
                        ? (lang === 'bn' ? "ধাপ ২: সেক্টর নিশ্চিতকরণ" : "Phase 2: Sector Confirmation")
                        : (lang === 'bn' ? `ধাপ ৩: বিস্তারিত মূল্যায়ন (${assessStep - 3}/৪)` : `Phase 3: Sector Deep Dive (${assessStep - 3}/4)`)
                      }
                    </span>
                    <h4 className="text-sm font-bold text-slate-300 mt-1">
                      {assessStep === 3 
                        ? (lang === 'bn' ? "আপনার উপযুক্ত কাজের ক্ষেত্র নির্ধারণ করুন" : "Review your primary interest sector") 
                        : (lang === 'bn' ? "নিচের প্রশ্নটির উত্তর দিন:" : "Please select the option that best represents you:")
                      }
                    </h4>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full sm:w-48 space-y-1.5 shrink-0">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{lang === 'bn' ? "অগ্রগতি" : "Progress"}</span>
                      <span>{Math.round(((assessStep + (assessStep >= 3 ? 1 : 0)) / 8) * 100)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${((assessStep + (assessStep >= 3 ? 1 : 0)) / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Render Phase 1 Questions (General Sector Fit) */}
                {assessStep < 3 && (
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg font-bold text-white leading-snug">
                      {lang === 'bn' ? GENERAL_QUESTIONS[assessStep].questionText.bn : GENERAL_QUESTIONS[assessStep].questionText.en}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {GENERAL_QUESTIONS[assessStep].options.map((opt, oIdx) => {
                        const isSelected = generalSelected[assessStep] === opt.value
                        return (
                          <div
                            key={oIdx}
                            onClick={() => {
                              setGeneralSelected(prev => ({ ...prev, [assessStep]: opt.value }))
                            }}
                            className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed text-slate-300 cursor-pointer transition duration-200 select-none ${
                              isSelected
                                ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/5'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center mt-0.5 text-[8px] font-bold ${
                                isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'
                              }`}>
                                {isSelected && "✓"}
                              </span>
                              <span>{lang === 'bn' ? opt.text.bn : opt.text.en}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Render Phase 2: Confirmation / Selection */}
                {assessStep === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                      <p className="text-xs sm:text-sm text-slate-300 font-medium">
                        {lang === 'bn' 
                          ? `আপনার প্রদত্ত উত্তরের ভিত্তিতে মনে হচ্ছে আপনি ` 
                          : `Based on your choices, we detected high interest in `
                        }
                        <strong className="text-blue-400 font-extrabold text-sm sm:text-base capitalize">
                          {confirmedSector === 'higher_studies' 
                            ? (lang === 'bn' ? "উচ্চশিক্ষা" : "Higher Studies")
                            : confirmedSector === 'job'
                            ? (lang === 'bn' ? "চাকরি" : "Job")
                            : (lang === 'bn' ? "উদ্যোক্তা" : "Entrepreneurship")
                          }
                        </strong>
                        {lang === 'bn' ? ` লাইনে বেশি আগ্রহী। আপনি কি এটিতেই এগোতে চান, নাকি অন্যটি বেছে নেবেন?` : ` options. Please confirm or select another sector to evaluate:`}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {(['higher_studies', 'job', 'entrepreneurship'] as const).map((sec, sIdx) => {
                        const isSelected = confirmedSector === sec
                        const icon = sec === 'higher_studies' ? '📚' : sec === 'job' ? '💼' : '🚀'
                        const title = sec === 'higher_studies' 
                          ? (lang === 'bn' ? "উচ্চশিক্ষা" : "Higher Studies")
                          : sec === 'job'
                          ? (lang === 'bn' ? "চাকরি / ক্যারিয়ার" : "Job / Employment")
                          : (lang === 'bn' ? "উদ্যোক্তা / ব্যবসা" : "Entrepreneurship / Business")
                        
                        const desc = sec === 'higher_studies'
                          ? (lang === 'bn' ? "স্নাতকোত্তর, পিএইচডি ও গবেষণা" : "Masters, PhD & Academic Research")
                          : sec === 'job'
                          ? (lang === 'bn' ? "প্রতিষ্ঠানে চাকরি ও কর্মসংস্থান" : "Corporate growth, office roles & steady work")
                          : (lang === 'bn' ? "নতুন স্টার্টআপ ও নিজস্ব উদ্যোগ" : "Startup founding, freelancing & services")

                        return (
                          <div
                            key={sIdx}
                            onClick={() => setConfirmedSector(sec)}
                            className={`p-4 rounded-2xl border text-left cursor-pointer transition duration-200 select-none ${
                              isSelected
                                ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-md shadow-indigo-500/5'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{icon}</span>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-sm text-slate-100">{title}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{desc}</p>
                              </div>
                              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center ml-auto text-[8px] font-bold ${
                                isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-600'
                              }`}>
                                {isSelected && "✓"}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Render Phase 3: Sector Specific Questions */}
                {assessStep >= 4 && assessStep <= 7 && confirmedSector && (
                  <div className="space-y-4">
                    <p className="text-base sm:text-lg font-bold text-white leading-snug">
                      {lang === 'bn' 
                        ? SECTOR_QUESTIONS[confirmedSector][assessStep - 4].questionText.bn 
                        : SECTOR_QUESTIONS[confirmedSector][assessStep - 4].questionText.en
                      }
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {SECTOR_QUESTIONS[confirmedSector][assessStep - 4].options.map((opt, oIdx) => {
                        const isSelected = sectorSelected[assessStep - 4] === opt.value
                        return (
                          <div
                            key={oIdx}
                            onClick={() => {
                              setSectorSelected(prev => ({ ...prev, [assessStep - 4]: opt.value }))
                            }}
                            className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium leading-relaxed text-slate-300 cursor-pointer transition duration-200 select-none ${
                              isSelected
                                ? 'bg-blue-600/10 border-blue-500 text-white shadow-md shadow-blue-500/5'
                                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className={`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center mt-0.5 text-[8px] font-bold ${
                                isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-600'
                              }`}>
                                {isSelected && "✓"}
                              </span>
                              <span>{lang === 'bn' ? opt.text.bn : opt.text.en}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Wizard Footer Navigation Controls */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  {/* Cancel/Back button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (assessStep === 0) {
                        setIsAssessing(false)
                      } else {
                        setAssessStep(prev => prev - 1)
                      }
                    }}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    {assessStep === 0 ? (lang === 'bn' ? "বাতিল করুন" : "Cancel") : (lang === 'bn' ? "পেছনে যান" : "Back")}
                  </button>

                  {/* Next / Submit button */}
                  {assessStep < 7 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAssessStep(prev => prev + 1)
                      }}
                      disabled={
                        (assessStep < 3 && !generalSelected[assessStep]) ||
                        (assessStep === 3 && !confirmedSector) ||
                        (assessStep >= 4 && !sectorSelected[assessStep - 4])
                      }
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {lang === 'bn' ? "পরবর্তী প্রশ্ন" : "Next Question"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitAssessment}
                      disabled={!sectorSelected[3]}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-97 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <span>{lang === 'bn' ? "সুপারিশ তৈরি করুন" : "Analyze & Generate"}</span>
                      <span>✨</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>


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
