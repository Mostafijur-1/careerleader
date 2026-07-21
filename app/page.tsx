"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import AuthModal from "./components/AuthModal"
import LanguageToggle from "./components/LanguageToggle"
import { useLanguage } from "./contexts/LanguageContext"
import { useUser } from "./contexts/UserContext"

type Copy = {
  navHow: string
  navOutcomes: string
  navMentors: string
  login: string
  openWorkspace: string
  eyebrow: string
  titleLead: string
  titleAccent: string
  subtitle: string
  primary: string
  continue: string
  secondary: string
  reassurance: string
  previewLabel: string
  previewTitle: string
  previewBody: string
  previewNext: string
  howEyebrow: string
  howTitle: string
  howBody: string
  steps: Array<{ title: string; body: string; href: string; action: string }>
  outcomesEyebrow: string
  outcomesTitle: string
  outcomes: Array<{ title: string; body: string }>
  mentorEyebrow: string
  mentorTitle: string
  mentorBody: string
  mentorAction: string
  finalTitle: string
  finalBody: string
  finalAction: string
  footer: string
  staff: string
}

const copy: Record<"en" | "bn", Copy> = {
  en: {
    navHow: "How it works",
    navOutcomes: "What you get",
    navMentors: "Mentors",
    login: "Log in",
    openWorkspace: "Open workspace",
    eyebrow: "Career decisions, made clearer",
    titleLead: "Turn career uncertainty",
    titleAccent: "into a practical next step.",
    subtitle:
      "Discover careers that fit you, choose a direction, and follow a focused roadmap—with support when you need it.",
    primary: "Start the free assessment",
    continue: "Continue your journey",
    secondary: "Explore careers first",
    reassurance: "Free to start · About 5 minutes · No account required",
    previewLabel: "Your journey",
    previewTitle: "One clear path, not a pile of tools",
    previewBody:
      "Career Leader carries your assessment into recommendations, a goal, and an actionable roadmap.",
    previewNext: "Your next best action stays visible in your workspace.",
    howEyebrow: "A guided process",
    howTitle: "From “what should I do?” to a plan you can follow",
    howBody: "Each step builds on the last, so you always know what to do next.",
    steps: [
      { title: "Discover", body: "Answer a short personality and interests assessment.", href: "/assessment", action: "Take assessment" },
      { title: "Choose", body: "Compare recommended careers and open the details that matter.", href: "/explore-careers", action: "Browse careers" },
      { title: "Plan", body: "Set one goal and turn it into a focused, trackable roadmap.", href: "/goals", action: "Set a goal" },
      { title: "Act", body: "Learn the right skills, connect with mentors, and build your CV.", href: "/mentors", action: "Find support" },
    ],
    outcomesEyebrow: "Built for action",
    outcomesTitle: "Useful outputs—not just another personality label",
    outcomes: [
      { title: "Career matches with context", body: "See why a path appears and review skills, demand, study routes, and responsibilities." },
      { title: "A roadmap tied to your goal", body: "Turn a broad ambition into phases and tasks you can complete over time." },
      { title: "Support in one workspace", body: "Keep resources, mentor conversations, progress, profile details, and CV tools together." },
    ],
    mentorEyebrow: "Human guidance",
    mentorTitle: "Get unstuck with someone who has done it before",
    mentorBody:
      "Browse active mentors by career track. Send a connection request, then message them after they accept—without leaving your workspace.",
    mentorAction: "Browse mentors",
    finalTitle: "You do not need your whole career figured out today.",
    finalBody: "Start with one honest assessment and leave with a clearer next move.",
    finalAction: "Find my direction",
    footer: "A guided career planning workspace for students.",
    staff: "Staff access",
  },
  bn: {
    navHow: "কীভাবে কাজ করে",
    navOutcomes: "আপনি যা পাবেন",
    navMentors: "মেন্টর",
    login: "লগ ইন",
    openWorkspace: "ওয়ার্কস্পেস খুলুন",
    eyebrow: "ক্যারিয়ার সিদ্ধান্ত এখন আরও পরিষ্কার",
    titleLead: "ক্যারিয়ার নিয়ে অনিশ্চয়তাকে",
    titleAccent: "বাস্তব পরবর্তী ধাপে পরিণত করুন।",
    subtitle: "আপনার সঙ্গে মানানসই ক্যারিয়ার খুঁজুন, একটি দিক বেছে নিন এবং সহায়তাসহ বাস্তব রোডম্যাপ অনুসরণ করুন।",
    primary: "ফ্রি অ্যাসেসমেন্ট শুরু করুন",
    continue: "আপনার যাত্রা চালিয়ে যান",
    secondary: "আগে ক্যারিয়ার দেখুন",
    reassurance: "শুরু করা ফ্রি · প্রায় ৫ মিনিট · অ্যাকাউন্ট লাগবে না",
    previewLabel: "আপনার যাত্রা",
    previewTitle: "অনেক টুল নয়—একটি পরিষ্কার পথ",
    previewBody: "অ্যাসেসমেন্ট থেকে সুপারিশ, লক্ষ্য এবং করণীয় রোডম্যাপ—সবকিছু একই ধারায় এগিয়ে যায়।",
    previewNext: "ওয়ার্কস্পেসে সবসময় আপনার পরবর্তী সেরা কাজটি দেখা যাবে।",
    howEyebrow: "নির্দেশিত প্রক্রিয়া",
    howTitle: "‘আমি কী করব?’ থেকে অনুসরণযোগ্য পরিকল্পনা",
    howBody: "প্রতিটি ধাপ আগের ধাপের ওপর তৈরি, তাই পরবর্তী কাজটি সবসময় পরিষ্কার।",
    steps: [
      { title: "নিজেকে জানুন", body: "সংক্ষিপ্ত ব্যক্তিত্ব ও আগ্রহের অ্যাসেসমেন্ট দিন।", href: "/assessment", action: "অ্যাসেসমেন্ট দিন" },
      { title: "দিক বেছে নিন", body: "প্রস্তাবিত ক্যারিয়ার তুলনা করুন এবং বিস্তারিত দেখুন।", href: "/explore-careers", action: "ক্যারিয়ার দেখুন" },
      { title: "পরিকল্পনা করুন", body: "একটি লক্ষ্য ঠিক করে ট্র্যাকযোগ্য রোডম্যাপ বানান।", href: "/goals", action: "লক্ষ্য ঠিক করুন" },
      { title: "কাজ শুরু করুন", body: "সঠিক দক্ষতা শিখুন, মেন্টরের সঙ্গে যুক্ত হন এবং সিভি তৈরি করুন।", href: "/mentors", action: "সহায়তা নিন" },
    ],
    outcomesEyebrow: "কাজে লাগানোর জন্য তৈরি",
    outcomesTitle: "শুধু ব্যক্তিত্বের নাম নয়—বাস্তব ফলাফল",
    outcomes: [
      { title: "ব্যাখ্যাসহ ক্যারিয়ার সুপারিশ", body: "কেন একটি পথ এসেছে এবং প্রয়োজনীয় দক্ষতা, চাহিদা ও দায়িত্ব দেখুন।" },
      { title: "লক্ষ্যভিত্তিক রোডম্যাপ", body: "বড় লক্ষ্যকে ধাপ ও সম্পন্নযোগ্য কাজে ভাগ করুন।" },
      { title: "এক জায়গায় সব সহায়তা", body: "রিসোর্স, মেন্টর বার্তা, অগ্রগতি, প্রোফাইল এবং সিভি টুল একসঙ্গে রাখুন।" },
    ],
    mentorEyebrow: "মানবিক দিকনির্দেশনা",
    mentorTitle: "যিনি পথটি পেরিয়েছেন, তাঁর সহায়তায় আটকে যাওয়া কাটান",
    mentorBody: "ক্যারিয়ার ট্র্যাক অনুযায়ী সক্রিয় মেন্টর খুঁজুন। অনুরোধ গ্রহণের পর একই ওয়ার্কস্পেসে বার্তা দিন।",
    mentorAction: "মেন্টর খুঁজুন",
    finalTitle: "আজই পুরো ক্যারিয়ার ঠিক করে ফেলতে হবে না।",
    finalBody: "একটি সৎ অ্যাসেসমেন্ট দিয়ে শুরু করুন এবং পরিষ্কার পরবর্তী পদক্ষেপ নিয়ে ফিরুন।",
    finalAction: "আমার দিক খুঁজে দিন",
    footer: "শিক্ষার্থীদের জন্য নির্দেশিত ক্যারিয়ার পরিকল্পনার ওয়ার্কস্পেস।",
    staff: "স্টাফ অ্যাক্সেস",
  },
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Home() {
  const { user, loading, setUser } = useUser()
  const { lang } = useLanguage()
  const c = copy[lang]
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [hasGuestAssessment, setHasGuestAssessment] = useState(false)

  useEffect(() => {
    setHasGuestAssessment(Boolean(localStorage.getItem("guestMbti")))
  }, [])

  const workspaceHref = user?.type === "mentor" ? "/mentor" : user?.type === "admin" ? "/admin" : "/dashboard"
  const primaryHref = user
    ? user.type === "student" && !user.mbti
      ? "/assessment"
      : workspaceHref
    : hasGuestAssessment
      ? "/explore-careers"
      : "/assessment"

  async function logout() {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      })
    } finally {
      setUser(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Career Leader home">
            <span className="text-xl sm:text-2xl" aria-hidden="true">🚀</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-sm font-bold text-transparent sm:text-xl">CareerLeader</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex" aria-label="Main navigation">
            <Link href="#how-it-works" className="transition hover:text-blue-700">{c.navHow}</Link>
            <Link href="#outcomes" className="transition hover:text-blue-700">{c.navOutcomes}</Link>
            <Link href="/mentors" className="transition hover:text-blue-700">{c.navMentors}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle variant="light" compact />
            {!loading && user ? (
              <div className="flex items-center gap-3">
                <Link href={workspaceHref} className="whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 sm:px-4">
                  <span className="sm:hidden">{lang === "bn" ? "খুলুন" : "Open"}</span>
                  <span className="hidden sm:inline">{c.openWorkspace}</span>
                </Link>
                <button onClick={logout} className="hidden text-sm font-semibold text-slate-500 transition hover:text-red-600 sm:inline">
                  {lang === "bn" ? "লগ আউট" : "Log out"}
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 sm:px-4">
                {c.login}
              </button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_44%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.18),_transparent_38%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                {c.eyebrow}
              </div>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-[#112954]">{c.titleLead}</span>{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {c.titleAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">{c.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href={primaryHref} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700">
                  {user || hasGuestAssessment ? c.continue : c.primary}
                  <ArrowIcon />
                </Link>
                <Link href="/explore-careers" className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-white px-6 py-3.5 text-sm font-extrabold text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                  {c.secondary}
                </Link>
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">{c.reassurance}</p>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-blue-200/70 via-indigo-200/60 to-purple-200/60 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/80 bg-white p-6 shadow-xl shadow-indigo-200/50 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">{c.previewLabel}</p>
                    <h2 className="mt-1 text-xl font-black text-[#112954]">{c.previewTitle}</h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">1 → 4</span>
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-600">{c.previewBody}</p>
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {c.steps.map((step, index) => (
                    <div key={step.title} className="text-center">
                      <div className={`mx-auto grid h-11 w-11 place-items-center rounded-xl text-sm font-black ${index === 0 ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200" : "bg-blue-50 text-blue-600"}`}>{index + 1}</div>
                      <p className="mt-2 text-[11px] font-extrabold text-slate-700">{step.title}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm font-semibold leading-6 text-slate-600">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckIcon /></span>
                  {c.previewNext}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">{c.howEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#112954] sm:text-4xl">{c.howTitle}</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{c.howBody}</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {c.steps.map((step, index) => (
                <article key={step.title} className="group flex min-h-64 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-sm font-black text-blue-700">0{index + 1}</span>
                  <h3 className="mt-6 text-xl font-black text-[#112954]">{step.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{step.body}</p>
                  <Link href={step.href} className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-blue-700">
                    {step.action}<ArrowIcon />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="outcomes" className="scroll-mt-24 border-y border-indigo-100 bg-gradient-to-br from-blue-50/70 via-white to-purple-50/70 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-700">{c.outcomesEyebrow}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#112954] sm:text-4xl">{c.outcomesTitle}</h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {c.outcomes.map((outcome) => (
                <article key={outcome.title} className="rounded-2xl border border-gray-100 bg-white p-7 shadow-md">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-700"><CheckIcon /></span>
                  <h3 className="mt-5 text-lg font-black text-[#112954]">{outcome.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{outcome.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl shadow-indigo-200/60 lg:grid-cols-[.85fr_1.15fr]">
              <div className="min-h-72 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,.24),_transparent_32%),radial-gradient(circle_at_70%_65%,_rgba(216,180,254,.32),_transparent_34%)] p-8">
                <div className="grid h-full place-items-center">
                  <div className="grid grid-cols-3 gap-3" aria-hidden="true">
                    {["A", "M", "R", "S", "N", "K"].map((letter, index) => (
                      <span key={letter} className={`grid h-16 w-16 place-items-center rounded-xl border border-white/30 text-xl font-black text-white shadow-lg ${index % 2 ? "bg-white/10" : "bg-white/20"}`}>{letter}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-8 text-white sm:p-12">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-100">{c.mentorEyebrow}</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{c.mentorTitle}</h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-blue-50">{c.mentorBody}</p>
                <Link href="/mentors" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 shadow-md transition hover:bg-blue-50">
                  {c.mentorAction}<ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-indigo-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 py-20 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-3xl font-black tracking-tight text-[#112954] sm:text-5xl">{c.finalTitle}</h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600">{c.finalBody}</p>
            <Link href={primaryHref} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-indigo-700">
              {c.finalAction}<ArrowIcon />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 font-extrabold"><span aria-hidden="true">🚀</span><span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span></p>
            <p className="mt-1">{c.footer}</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/staff-login" className="font-semibold transition hover:text-blue-700">{c.staff}</Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  )
}
