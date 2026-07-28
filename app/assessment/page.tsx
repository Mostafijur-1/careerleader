"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/DashboardLayout"
import { useLanguage } from "../contexts/LanguageContext"
import { useUser } from "../contexts/UserContext"

type Question = {
  id: string
  text: string
  dimension: string
  sideA: string
  sideB: string
  interests?: string[]
  mission?: number
}

type Recommendation = {
  id: string
}

type ExperiencePreferences = {
  autoAdvance: boolean
  motion: boolean
  compact: boolean
  largeText: boolean
}

type Draft = {
  answers?: Record<string, number>
  currentQuestion?: number
  started?: boolean
  preferences?: Partial<ExperiencePreferences>
}

const DRAFT_KEY = "careerleader_assessment_draft_v2"

const DEFAULT_PREFERENCES: ExperiencePreferences = {
  autoAdvance: true,
  motion: true,
  compact: false,
  largeText: false,
}

const MISSIONS = [
  {
    icon: "🧭",
    en: { name: "Find your bearings", hint: "Notice what naturally gives you energy." },
    bn: { name: "নিজের দিক খুঁজুন", hint: "কোন বিষয় আপনাকে স্বাভাবিকভাবে শক্তি দেয় তা বুঝুন।" },
  },
  {
    icon: "✨",
    en: { name: "Explore possibilities", hint: "See how you take in ideas and information." },
    bn: { name: "সম্ভাবনা খুঁজুন", hint: "আপনি কীভাবে ধারণা ও তথ্য গ্রহণ করেন তা দেখুন।" },
  },
  {
    icon: "⚖️",
    en: { name: "Choose your path", hint: "Discover how you approach meaningful decisions." },
    bn: { name: "নিজের পথ বেছে নিন", hint: "গুরুত্বপূর্ণ সিদ্ধান্তে আপনার পদ্ধতি আবিষ্কার করুন।" },
  },
  {
    icon: "🚀",
    en: { name: "Set your pace", hint: "Learn how you turn intentions into action." },
    bn: { name: "নিজের গতি ঠিক করুন", hint: "আপনি কীভাবে পরিকল্পনাকে কাজে রূপ দেন তা জানুন।" },
  },
] as const

const COPY = {
  en: {
    eyebrow: "Career Quest",
    title: "Build your career compass",
    subtitle: "Four quick missions will reveal how you naturally think, decide, and work.",
    honest: "There are no right answers. Choose what feels most like you.",
    start: "Begin my quest",
    resume: "Continue my quest",
    time: "About 4 minutes",
    missions: "4 short missions",
    scenarios: "16 real-life scenarios",
    settings: "Experience settings",
    settingsHint: "Make the assessment feel comfortable for you.",
    autoAdvance: "Auto-advance",
    autoAdvanceHint: "Move to the next card after an answer",
    motion: "Motion effects",
    motionHint: "Use gentle transitions and celebrations",
    compact: "Compact layout",
    compactHint: "Show more content with less spacing",
    largeText: "Larger text",
    largeTextHint: "Increase the question and control size",
    close: "Done",
    progress: "Quest progress",
    complete: "complete",
    question: "Scenario",
    of: "of",
    choose: "How much does this sound like you?",
    previous: "Previous",
    next: "Next scenario",
    submit: "Reveal my compass",
    analyzing: "Building your career compass...",
    selected: "Selected",
    missionComplete: "Mission complete",
    missionCompleteHint: "Your career compass is becoming clearer.",
    loading: "Preparing your quest...",
    error: "We could not complete your assessment. Your answers are saved—please try again.",
    answerLabels: ["Not at all", "A little", "Sometimes", "Mostly", "Exactly"],
    saved: "Progress saved on this device",
  },
  bn: {
    eyebrow: "ক্যারিয়ার অভিযান",
    title: "আপনার ক্যারিয়ার কম্পাস তৈরি করুন",
    subtitle: "চারটি ছোট মিশনে জানুন আপনি কীভাবে চিন্তা করেন, সিদ্ধান্ত নেন ও কাজ করেন।",
    honest: "এখানে সঠিক বা ভুল উত্তর নেই। যেটি আপনার সঙ্গে সবচেয়ে বেশি মেলে সেটি বেছে নিন।",
    start: "আমার অভিযান শুরু করুন",
    resume: "আমার অভিযান চালিয়ে যান",
    time: "প্রায় ৪ মিনিট",
    missions: "৪টি ছোট মিশন",
    scenarios: "১৬টি বাস্তব পরিস্থিতি",
    settings: "অভিজ্ঞতা নিয়ন্ত্রণ",
    settingsHint: "আপনার জন্য মূল্যায়নটি আরামদায়ক করে নিন।",
    autoAdvance: "স্বয়ংক্রিয়ভাবে এগিয়ে যান",
    autoAdvanceHint: "উত্তর দেওয়ার পর পরের কার্ডে যান",
    motion: "অ্যানিমেশন",
    motionHint: "হালকা ট্রানজিশন ও উদযাপন দেখান",
    compact: "কমপ্যাক্ট লেআউট",
    compactHint: "কম জায়গায় বেশি কনটেন্ট দেখান",
    largeText: "বড় লেখা",
    largeTextHint: "প্রশ্ন ও নিয়ন্ত্রণের আকার বাড়ান",
    close: "সম্পন্ন",
    progress: "অভিযানের অগ্রগতি",
    complete: "সম্পন্ন",
    question: "পরিস্থিতি",
    of: "/",
    choose: "এটি আপনার সঙ্গে কতটা মেলে?",
    previous: "আগেরটি",
    next: "পরের পরিস্থিতি",
    submit: "আমার কম্পাস দেখুন",
    analyzing: "আপনার ক্যারিয়ার কম্পাস তৈরি হচ্ছে...",
    selected: "নির্বাচিত",
    missionComplete: "মিশন সম্পন্ন",
    missionCompleteHint: "আপনার ক্যারিয়ার কম্পাস আরও পরিষ্কার হচ্ছে।",
    loading: "আপনার অভিযান প্রস্তুত হচ্ছে...",
    error: "মূল্যায়নটি সম্পন্ন করা যায়নি। আপনার উত্তর সংরক্ষিত আছে—আবার চেষ্টা করুন।",
    answerLabels: ["একদমই নয়", "অল্প", "কখনো কখনো", "বেশিরভাগ সময়", "পুরোপুরি"],
    saved: "এই ডিভাইসে অগ্রগতি সংরক্ষিত",
  },
} as const

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: () => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
    >
      <span>
        <span className="block text-sm font-extrabold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  )
}

function questionMission(question: Question | undefined, index: number, total: number) {
  if (question?.mission && question.mission >= 1 && question.mission <= 4) {
    return question.mission
  }
  return Math.min(4, Math.floor(index / Math.max(1, Math.ceil(total / 4))) + 1)
}

export default function AssessmentPage() {
  const { user, refreshUser } = useUser()
  const { lang } = useLanguage()
  const router = useRouter()
  const copy = COPY[lang]

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [preferences, setPreferences] = useState<ExperiencePreferences>(DEFAULT_PREFERENCES)
  const [started, setStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [milestone, setMilestone] = useState<number | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return
      const draft = JSON.parse(saved) as Draft
      if (draft.answers) setAnswers(draft.answers)
      if (typeof draft.currentQuestion === "number") setCurrentQuestion(Math.max(0, draft.currentQuestion))
      if (draft.started || Object.keys(draft.answers || {}).length > 0) setStarted(true)
      if (draft.preferences) {
        setPreferences(previous => ({ ...previous, ...draft.preferences }))
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadQuestions() {
      setLoadingQuestions(true)
      try {
        const response = await fetch(`/api/assessment?lang=${lang}`)
        if (!response.ok) throw new Error("Could not load questions")
        const data = (await response.json()) as Question[]
        if (active) {
          setQuestions(Array.isArray(data) ? data : [])
          setCurrentQuestion(previous => Math.min(previous, Math.max(0, data.length - 1)))
        }
      } catch (loadError) {
        console.error("Failed to load assessment questions", loadError)
        if (active) setQuestions([])
      } finally {
        if (active) setLoadingQuestions(false)
      }
    }
    loadQuestions()
    return () => {
      active = false
    }
  }, [lang])

  useEffect(() => {
    if (!started && Object.keys(answers).length === 0) return
    const draft: Draft = { answers, currentQuestion, started, preferences }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [answers, currentQuestion, preferences, started])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0
  const activeQuestion = questions[currentQuestion]
  const activeMission = questionMission(activeQuestion, currentQuestion, questions.length)
  const isLastQuestion = currentQuestion === questions.length - 1
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const missionState = useMemo(
    () =>
      MISSIONS.map((mission, missionIndex) => {
        const missionNumber = missionIndex + 1
        const indexes = questions
          .map((question, index) =>
            questionMission(question, index, questions.length) === missionNumber ? index : -1
          )
          .filter(index => index >= 0)
        const completed = indexes.length > 0 && indexes.every(index => answers[questions[index].id] !== undefined)
        const answered = indexes.filter(index => answers[questions[index].id] !== undefined).length
        const previousCompleted =
          missionIndex === 0 ||
          questions
            .map((question, index) =>
              questionMission(question, index, questions.length) === missionIndex ? index : -1
            )
            .filter(index => index >= 0)
            .every(index => answers[questions[index].id] !== undefined)
        return { mission, missionNumber, indexes, completed, answered, unlocked: previousCompleted }
      }),
    [answers, questions]
  )

  function updatePreference<K extends keyof ExperiencePreferences>(
    key: K,
    value: ExperiencePreferences[K]
  ) {
    setPreferences(previous => {
      const next = { ...previous, [key]: value }
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        const draft = saved ? (JSON.parse(saved) as Draft) : {}
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, preferences: next }))
      } catch {
        // Preference persistence is a convenience; the in-session control
        // should continue working even if browser storage is unavailable.
      }
      return next
    })
  }

  function goToQuestion(index: number) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setMilestone(null)
    setCurrentQuestion(Math.max(0, Math.min(index, questions.length - 1)))
  }

  function answerQuestion(value: number) {
    if (!activeQuestion) return
    setAnswers(previous => ({ ...previous, [activeQuestion.id]: value }))
    setError(null)

    if (!preferences.autoAdvance || isLastQuestion) return
    if (advanceTimer.current) clearTimeout(advanceTimer.current)

    const nextMission = questionMission(questions[currentQuestion + 1], currentQuestion + 1, questions.length)
    const crossedMission = nextMission !== activeMission
    if (crossedMission) setMilestone(activeMission)

    const delay = preferences.motion ? (crossedMission ? 1050 : 380) : crossedMission ? 500 : 120
    advanceTimer.current = setTimeout(() => {
      setMilestone(null)
      setCurrentQuestion(previous => Math.min(previous + 1, questions.length - 1))
    }, delay)
  }

  async function submit() {
    if (!allAnswered) return
    setSubmitting(true)
    setError(null)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit assessment")
      }

      const scoredMbti = data.result?.personality
      if (scoredMbti) localStorage.setItem("guestMbti", scoredMbti)

      const recommendationIds = Array.isArray(data.recommendations)
        ? data.recommendations
            .map((recommendation: Recommendation) => recommendation?.id)
            .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
        : []
      if (recommendationIds.length > 0) {
        localStorage.setItem("assessment_recommended_career_ids", JSON.stringify(recommendationIds))
      }

      localStorage.removeItem(DRAFT_KEY)
      if (user) await refreshUser()
      router.push("/explore-careers")
    } catch (submitError) {
      console.error("Submission error:", submitError)
      setError(copy.error)
    } finally {
      setSubmitting(false)
    }
  }

  const transitionClass = preferences.motion
    ? "transition-all duration-300 ease-out"
    : "transition-none"
  const cardSpacing = preferences.compact ? "p-4 sm:p-5" : "p-5 sm:p-8 lg:p-10"
  const questionSize = preferences.largeText
    ? "text-2xl sm:text-3xl lg:text-4xl"
    : "text-xl sm:text-2xl lg:text-3xl"

  if (loadingQuestions) {
    return (
      <DashboardLayout activeTab="assessment">
        <div className="flex min-h-[62vh] flex-col items-center justify-center">
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-indigo-50">
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <span className="text-2xl" aria-hidden="true">🧭</span>
          </div>
          <p className="mt-5 font-bold text-slate-600">{copy.loading}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="assessment">
      <div
        className={`${transitionClass} mx-auto w-full min-w-0 max-w-6xl ${
          preferences.largeText ? "text-[1.04rem]" : ""
        }`}
      >
        {milestone !== null && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed left-1/2 top-6 z-50 w-[min(90vw,420px)] -translate-x-1/2 rounded-3xl border border-emerald-200 bg-white p-5 text-center shadow-2xl shadow-emerald-900/10 ${transitionClass}`}
          >
            <div className="text-3xl" aria-hidden="true">{MISSIONS[milestone - 1].icon}</div>
            <p className="mt-2 font-black text-emerald-700">{copy.missionComplete}</p>
            <p className="mt-1 text-sm text-slate-600">{copy.missionCompleteHint}</p>
          </div>
        )}

        {showSettings && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-settings-title"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setShowSettings(false)
            }}
          >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-slate-50 p-5 shadow-2xl sm:rounded-3xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="experience-settings-title" className="text-xl font-black text-slate-950">
                    {copy.settings}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{copy.settingsHint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl font-bold text-slate-500 shadow-sm hover:text-slate-900"
                  aria-label={copy.close}
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <Toggle
                  checked={preferences.autoAdvance}
                  onChange={() => updatePreference("autoAdvance", !preferences.autoAdvance)}
                  label={copy.autoAdvance}
                  hint={copy.autoAdvanceHint}
                />
                <Toggle
                  checked={preferences.motion}
                  onChange={() => updatePreference("motion", !preferences.motion)}
                  label={copy.motion}
                  hint={copy.motionHint}
                />
                <Toggle
                  checked={preferences.compact}
                  onChange={() => updatePreference("compact", !preferences.compact)}
                  label={copy.compact}
                  hint={copy.compactHint}
                />
                <Toggle
                  checked={preferences.largeText}
                  onChange={() => updatePreference("largeText", !preferences.largeText)}
                  label={copy.largeText}
                  hint={copy.largeTextHint}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 font-extrabold text-white hover:bg-slate-800"
              >
                {copy.close}
              </button>
            </div>
          </div>
        )}

        {!started ? (
          <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white shadow-xl shadow-indigo-900/10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:p-14">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-100">
                    <span aria-hidden="true">✦</span> {copy.eyebrow}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15"
                  >
                    <span aria-hidden="true">⚙</span> <span className="hidden sm:inline">{copy.settings}</span>
                  </button>
                </div>
                <h1 className="mt-8 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
                  {copy.subtitle}
                </p>
                <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-indigo-50 sm:text-sm">
                  {[copy.time, copy.missions, copy.scenarios].map(item => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-relaxed text-indigo-50">
                  <span className="mr-2" aria-hidden="true">💡</span>{copy.honest}
                </div>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  disabled={questions.length === 0}
                  className="mt-7 inline-flex min-h-14 items-center justify-center rounded-2xl bg-cyan-300 px-7 py-3.5 font-black text-indigo-950 shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {answeredCount > 0 ? copy.resume : copy.start}
                  <span className="ml-3 text-lg" aria-hidden="true">→</span>
                </button>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-sm">
                  <div className="absolute inset-[12%] rounded-full border border-white/15 bg-white/10 shadow-2xl shadow-indigo-950/30 backdrop-blur">
                    <div className="absolute inset-[18%] grid place-items-center rounded-full border border-white/20 bg-indigo-950/30">
                      <div className="text-center">
                        <div className="text-5xl" aria-hidden="true">🧭</div>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                          {copy.eyebrow}
                        </p>
                      </div>
                    </div>
                  </div>
                  {MISSIONS.map((mission, index) => {
                    const positions = [
                      "left-1/2 top-0 -translate-x-1/2",
                      "right-0 top-1/2 -translate-y-1/2",
                      "bottom-0 left-1/2 -translate-x-1/2",
                      "left-0 top-1/2 -translate-y-1/2",
                    ]
                    return (
                      <div
                        key={mission.en.name}
                        className={`absolute ${positions[index]} grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/15 text-2xl shadow-lg backdrop-blur`}
                        aria-hidden="true"
                      >
                        {mission.icon}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="min-w-0 space-y-5">
            <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{copy.eyebrow}</p>
                  <h1 className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">{copy.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span aria-hidden="true">⚙</span> <span className="hidden sm:inline">{copy.settings}</span>
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label={copy.progress}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 ${transitionClass}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-black text-indigo-700">
                  {progress}% {copy.complete}
                </span>
              </div>
            </header>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="min-w-0 max-w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:self-start lg:p-4">
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
                  {missionState.map(({ mission, missionNumber, indexes, completed, answered, unlocked }) => {
                    const active = activeMission === missionNumber
                    const localized = mission[lang]
                    return (
                      <button
                        key={mission.en.name}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => indexes[0] !== undefined && goToQuestion(indexes[0])}
                        className={`min-w-[185px] rounded-2xl border p-3 text-left ${transitionClass} lg:min-w-0 lg:w-full ${
                          active
                            ? "border-indigo-200 bg-indigo-50 shadow-sm"
                            : completed
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-transparent bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${
                              completed ? "bg-emerald-500" : active ? "bg-indigo-600" : "bg-white"
                            } ${completed || active ? "text-white" : ""}`}
                            aria-hidden="true"
                          >
                            {completed ? "✓" : mission.icon}
                          </span>
                          <span className="min-w-0">
                            <span className={`block truncate text-sm font-black ${active ? "text-indigo-950" : "text-slate-800"}`}>
                              {localized.name}
                            </span>
                            <span className="mt-0.5 block text-[11px] font-bold text-slate-500">
                              {answered}/{indexes.length} {copy.complete}
                            </span>
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>

              {activeQuestion && (
                <main
                  key={activeQuestion.id}
                  className={`min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 ${transitionClass}`}
                >
                  <div className={`${cardSpacing} border-b border-slate-100 bg-gradient-to-br from-white to-indigo-50/50`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-700">
                        <span aria-hidden="true">{MISSIONS[activeMission - 1].icon}</span>
                        {MISSIONS[activeMission - 1][lang].name}
                      </span>
                      <span className="text-xs font-extrabold text-slate-500">
                        {copy.question} {currentQuestion + 1} {copy.of} {questions.length}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-500">
                      {MISSIONS[activeMission - 1][lang].hint}
                    </p>
                    <h2 className={`${questionSize} mt-4 font-black leading-tight tracking-tight text-slate-950`}>
                      “{activeQuestion.text}”
                    </h2>
                  </div>

                  <div className={cardSpacing}>
                    <p className="mb-4 text-center text-sm font-extrabold text-slate-600">{copy.choose}</p>
                    <div className="grid min-w-0 grid-cols-5 gap-2 sm:gap-3">
                      {copy.answerLabels.map((label, index) => {
                        const value = index + 1
                        const selected = answers[activeQuestion.id] === value
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => answerQuestion(value)}
                            aria-label={label}
                            aria-pressed={selected}
                            className={`group flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border-2 px-1.5 py-3 ${transitionClass} ${
                              selected
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50"
                            } ${preferences.largeText ? "sm:min-h-28" : "sm:min-h-24"}`}
                          >
                            <span
                              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black ${
                                selected ? "bg-white text-indigo-700" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                              }`}
                              aria-hidden="true"
                            >
                              {value}
                            </span>
                            <span className="hidden text-center text-[11px] font-extrabold leading-tight sm:block">
                              {label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 flex justify-between px-1 text-[10px] font-bold text-slate-400 sm:hidden">
                      <span>{copy.answerLabels[0]}</span>
                      <span>{copy.answerLabels[2]}</span>
                      <span>{copy.answerLabels[4]}</span>
                    </div>
                    {answers[activeQuestion.id] !== undefined && (
                      <p className="mt-4 text-center text-xs font-extrabold text-indigo-700" aria-live="polite">
                        {copy.selected}: {copy.answerLabels[answers[activeQuestion.id] - 1]}
                      </p>
                    )}
                  </div>

                  <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => goToQuestion(currentQuestion - 1)}
                      disabled={currentQuestion === 0}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span aria-hidden="true">← </span>{copy.previous}
                    </button>

                    <span className="hidden items-center gap-1.5 text-[11px] font-bold text-slate-400 md:flex">
                      <span className="text-emerald-500" aria-hidden="true">●</span> {copy.saved}
                    </span>

                    {isLastQuestion ? (
                      <button
                        type="button"
                        onClick={submit}
                        disabled={!allAnswered || submitting}
                        className="min-h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-black text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting ? copy.analyzing : copy.submit}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToQuestion(currentQuestion + 1)}
                        disabled={answers[activeQuestion.id] === undefined}
                        className="min-h-11 rounded-xl bg-slate-950 px-5 py-2 text-sm font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {copy.next}<span aria-hidden="true"> →</span>
                      </button>
                    )}
                  </footer>
                </main>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
