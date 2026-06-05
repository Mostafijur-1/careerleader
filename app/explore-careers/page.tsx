"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import DashboardLayout from "../components/DashboardLayout"
import { careerDetails, type CareerDetail } from "./careerDetailsData"

interface Recommendation {
  id: string
  title: string
  description: string
  skills?: string[]
}

export default function ExploreCareersPage() {
  const { user } = useUser()
  const { lang, t } = useLanguage()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
 
  // Recommendations specific states
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [careerFitPercentage, setCareerFitPercentage] = useState<Record<string, number>>({})
  const [selectedCareer, setSelectedCareer] = useState<Recommendation | null>(null)
  const [filterActive, setFilterActive] = useState(false)
  const [localMbti, setLocalMbti] = useState<string>("")
  
  // Detailed Career screen states
  const [detailTab, setDetailTab] = useState<'overview' | 'skills' | 'day_in_the_life' | 'roadmap' | 'resources' | 'similar_careers'>('overview')
  const [savedCareers, setSavedCareers] = useState<string[]>([])
  const [goalsSet, setGoalsSet] = useState<string[]>([])
  const [showGoalNotification, setShowGoalNotification] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setLocalMbti(localStorage.getItem("guestMbti") || "")
    }
  }, [])

  // Load matches dynamically based on profile
  useEffect(() => {
    async function loadMatches() {
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
            data.recommendations.forEach((rec: Recommendation, idx: number) => {
              fits[rec.id] = Math.max(70, 95 - idx * 3 - (idx % 2))
            })
            setCareerFitPercentage(fits)
          }
        } catch (err) {
          console.error("Failed to load recommendations", err)
        }
      }
    }
    const activeMbti = user?.mbti || localMbti
    if (isMounted && activeMbti) {
      loadMatches()
    }
  }, [isMounted, user?.mbti, localMbti])

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
        { title: "Introductory course", type: "Course", url: "#", provider: "Open Academy" }
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

  return (
    <DashboardLayout activeTab="explore-careers" breadcrumbExtra={selectedCareer?.title}>
      {selectedCareer && currentCareerDetails ? (
        /* Detailed Career Information Panel */
        <div className="space-y-8 animate-fade-in text-left">
          
          {/* Back button and Goal notification toast */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => { setSelectedCareer(null); setDetailTab('overview'); }}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
            >
              <span>←</span> <span>{lang === 'bn' ? "ক্যারিয়ার তালিকায় ফিরে যান" : "Back to Explore Careers"}</span>
            </button>

            {showGoalNotification && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm animate-pulse flex items-center gap-2">
                <span>🎉</span>
                <span>{lang === 'bn' ? "লক্ষ্য সফলভাবে সেট করা হয়েছে! আপনার ড্যাশবোর্ডে এটি যুক্ত করা হয়েছে।" : "Goal set successfully! Track progress on your dashboard."}</span>
              </div>
            )}
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
                    {careerFitPercentage[currentCareerDetails.id] || 96}% {lang === 'bn' ? "মিলেছে" : "Match"}
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
                  onClick={() => {
                    const id = currentCareerDetails.id;
                    setSavedCareers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
                  }}
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
                  onClick={() => {
                    const id = currentCareerDetails.id;
                    if (!goalsSet.includes(id)) {
                      setGoalsSet(prev => [...prev, id]);
                      
                      // Save goal to localStorage for goals and roadmap page integration
                      const goalData = {
                        title: currentCareerDetails.title,
                        targetDate: "2027-12-31",
                        skillLevel: "Beginner",
                        whyImportant: lang === 'bn' 
                          ? `ক্যারিয়ার এক্সপ্লোরার থেকে লক্ষ্য নির্ধারণ করা হয়েছে: ${currentCareerDetails.title}`
                          : `Set career goal from explore careers: ${currentCareerDetails.title}`,
                        focusAreas: currentCareerDetails.topSkills.flatMap(s => s.list).slice(0, 3),
                        updatedAt: new Date().toISOString()
                      };
                      localStorage.setItem("career_goal", JSON.stringify(goalData));
                      localStorage.removeItem("roadmap_completed_tasks"); // clear tasks for new goal
                      
                      setShowGoalNotification(true);
                      setTimeout(() => setShowGoalNotification(false), 4000);
                    }
                  }}
                  className={`flex-1 py-3 px-5 font-bold text-sm rounded-xl shadow-sm transition active:scale-95 text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    goalsSet.includes(currentCareerDetails.id)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>🎯</span>
                  <span>{goalsSet.includes(currentCareerDetails.id) ? (lang === 'bn' ? "লক্ষ্য নির্ধারিত" : "Goal Set") : (lang === 'bn' ? "লক্ষ্য নির্ধারণ করুন" : "Set Goal")}</span>
                </button>
              </div>
            </div>

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
                              {careerFitPercentage[cid] || 80}% {lang === 'bn' ? "মিলেছে" : "Match"}
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

          {/* 1. TOP MATCH CARDS (Vertical cards grid) */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl flex items-center gap-2 text-left">
              <span>🎯</span> {lang === 'bn' ? "আপনার জন্য সেরা ক্যারিয়ারসমূহ" : "Recommended Careers For You"}
            </h3>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {topRecommendations.map((rec) => {
                const fit = careerFitPercentage[rec.id] || 90
                const description = getCareerDescription(rec.title, rec.description)
                return (
                  <div 
                    key={rec.id} 
                    className="bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition duration-300 flex flex-col items-center text-center relative overflow-hidden group"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors"></div>
                    
                    <div className="relative flex flex-col items-center flex-grow space-y-4 w-full">
                      {/* Fit Rate top bar (centered) */}
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        {fit}% {lang === 'bn' ? "মিলেছে" : "Match"}
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
                  const fit = careerFitPercentage[rec.id] || 75
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
                          {fit}% {lang === 'bn' ? "মিলেছে" : "Match"}
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
