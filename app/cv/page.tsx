"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import DashboardLayout from "../components/DashboardLayout"
import type { CareerGoalInput, GeneratedCv } from "@/lib/cvTypes"

const CV_STORAGE_KEY = "generated_cv"

function loadGoal(userGoal: unknown): CareerGoalInput | null {
  if (userGoal && typeof userGoal === "object" && "title" in userGoal) {
    const g = userGoal as CareerGoalInput
    if (g.title?.trim()) return g
  }
  if (typeof window === "undefined") return null
  const saved = localStorage.getItem("career_goal")
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved) as CareerGoalInput
    return parsed.title?.trim() ? parsed : null
  } catch {
    return null
  }
}

function cvToPlainText(cv: GeneratedCv): string {
  const lines: string[] = [
    cv.fullName,
    cv.headline,
    cv.email ? cv.email : "",
    "",
    "SUMMARY",
    cv.summary,
    "",
    "SKILLS",
    cv.skills.join(" • "),
  ]

  if (cv.experience.length > 0) {
    lines.push("", "EXPERIENCE")
    cv.experience.forEach((exp) => {
      lines.push(`${exp.role} — ${exp.organization} (${exp.period})`)
      exp.highlights.forEach((h) => lines.push(`  • ${h}`))
      lines.push("")
    })
  }

  if (cv.projects.length > 0) {
    lines.push("PROJECTS")
    cv.projects.forEach((p) => {
      lines.push(`${p.name}`)
      lines.push(`  ${p.description}`)
      if (p.technologies.length) lines.push(`  Tech: ${p.technologies.join(", ")}`)
      lines.push("")
    })
  }

  if (cv.education.length > 0) {
    lines.push("EDUCATION")
    cv.education.forEach((e) => {
      lines.push(`${e.degree} — ${e.institution}${e.year ? ` (${e.year})` : ""}`)
    })
  }

  if (cv.certifications.length > 0) {
    lines.push("", "CERTIFICATIONS")
    cv.certifications.forEach((c) => lines.push(`• ${c}`))
  }

  return lines.filter((l, i, arr) => !(l === "" && arr[i + 1] === "")).join("\n")
}

export default function CvGeneratorPage() {
  const { user } = useUser()
  const { lang } = useLanguage()

  const [isMounted, setIsMounted] = useState(false)
  const [goal, setGoal] = useState<CareerGoalInput | null>(null)
  const [cv, setCv] = useState<GeneratedCv | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [source, setSource] = useState<"ai" | "fallback" | "cached" | null>(null)

  useEffect(() => {
    setIsMounted(true)
    setGoal(loadGoal(user?.goal))

    const cached = localStorage.getItem(CV_STORAGE_KEY)
    if (cached) {
      try {
        setCv(JSON.parse(cached))
        setSource("cached")
      } catch {
        /* ignore */
      }
    }
  }, [user?.goal])

  const handleGenerate = useCallback(async () => {
    const activeGoal = goal || loadGoal(user?.goal)
    if (!activeGoal?.title?.trim()) {
      setError(lang === "bn" ? "অনুগ্রহ করে প্রথমে একটি ক্যারিয়ার লক্ষ্য সেট করুন।" : "Please set a career goal first.")
      return
    }

    setGenerating(true)
    setError("")

    try {
      const res = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: activeGoal,
          profile: {
            name: user?.name,
            email: user?.email,
            bio: user?.bio,
            skills: user?.skills,
            education: user?.education,
            mbti: user?.mbti,
          },
          lang,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")

      setCv(data.cv)
      setSource(data.source || "ai")
      localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(data.cv))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate CV")
    } finally {
      setGenerating(false)
    }
  }, [goal, user, lang])

  const handleCopy = async () => {
    if (!cv) return
    try {
      await navigator.clipboard.writeText(cvToPlainText(cv))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError(lang === "bn" ? "কপি করা যায়নি" : "Could not copy to clipboard")
    }
  }

  const handleDownload = () => {
    if (!cv) return
    const blob = new Blob([cvToPlainText(cv)], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${cv.fullName.replace(/\s+/g, "_")}_CV.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => window.print()

  if (!isMounted) return null

  const activeGoal = goal

  return (
    <DashboardLayout activeTab="cv">
      <div className="space-y-6 sm:space-y-8 animate-fade-in text-left print:space-y-0">
        {/* Header — hidden when printing */}
        <div className="print:hidden">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {lang === "bn" ? "লক্ষ্য-ভিত্তিক সিভি জেনারেটর 📄" : "Goal-Based CV Generator 📄"}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1 leading-relaxed">
            {lang === "bn"
              ? "আপনার ক্যারিয়ার লক্ষ্য, দক্ষতা ও শিক্ষার উপর ভিত্তি করে AI-চালিত, লক্ষ্য-উপযোগী সিভি তৈরি করুন।"
              : "Generate an AI-tailored CV aligned with your career goal, skills, and education."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {/* Left: Goal context & actions */}
          <div className="lg:col-span-1 space-y-4 print:hidden">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-extrabold text-slate-900 text-base">
                {lang === "bn" ? "আপনার ক্যারিয়ার লক্ষ্য" : "Your Career Goal"}
              </h2>

              {activeGoal ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">{lang === "bn" ? "লক্ষ্য" : "Target Role"}</p>
                    <p className="font-extrabold text-slate-800">{activeGoal.title}</p>
                  </div>
                  {activeGoal.skillLevel && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400">{lang === "bn" ? "দক্ষতার স্তর" : "Skill Level"}</p>
                      <p className="font-bold text-slate-700">{activeGoal.skillLevel}</p>
                    </div>
                  )}
                  {activeGoal.focusAreas && activeGoal.focusAreas.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">{lang === "bn" ? "ফোকাস এরিয়া" : "Focus Areas"}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activeGoal.focusAreas.map((area) => (
                          <span key={area} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[10px] font-bold">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <span className="text-3xl block mb-2">🎯</span>
                  <p className="text-slate-500 text-xs mb-3">
                    {lang === "bn" ? "কোনো লক্ষ্য সেট করা নেই" : "No career goal set yet"}
                  </p>
                  <Link href="/goals" className="text-xs font-bold text-blue-600 hover:underline">
                    {lang === "bn" ? "লক্ষ্য সেট করুন →" : "Set Your Goal →"}
                  </Link>
                </div>
              )}

              <Link href="/goals" className="block text-center text-xs font-bold text-slate-500 hover:text-blue-600 transition">
                {lang === "bn" ? "লক্ষ্য সম্পাদনা করুন" : "Edit Goal"}
              </Link>
            </div>

            {/* Profile hint */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2">
              <h3 className="font-bold text-slate-800 text-sm">{lang === "bn" ? "প্রোফাইল ডেটা" : "Profile Data Used"}</h3>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>{user?.name ? `✓ ${user.name}` : lang === "bn" ? "○ নাম যোগ করুন (প্রোফাইল)" : "○ Add name (Profile)"}</li>
                <li>{user?.skills?.length ? `✓ ${user.skills.length} skills` : lang === "bn" ? "○ দক্ষতা যোগ করুন" : "○ Add skills"}</li>
                <li>{user?.education?.length ? `✓ ${user.education.length} education entries` : lang === "bn" ? "○ শিক্ষা যোগ করুন" : "○ Add education"}</li>
              </ul>
              <Link href="/dashboard?view=profile" className="text-[10px] font-bold text-blue-600 hover:underline">
                {lang === "bn" ? "প্রোফাইল আপডেট করুন →" : "Update Profile →"}
              </Link>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleGenerate}
                disabled={generating || !activeGoal}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold rounded-xl shadow-md transition active:scale-98 text-sm cursor-pointer disabled:cursor-not-allowed"
              >
                {generating
                  ? lang === "bn" ? "তৈরি হচ্ছে..." : "Generating..."
                  : cv
                    ? lang === "bn" ? "পুনরায় তৈরি করুন" : "Regenerate CV"
                    : lang === "bn" ? "সিভি তৈরি করুন" : "Generate CV"}
              </button>

              {cv && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button onClick={handleCopy} className="py-2.5 sm:py-2 text-xs sm:text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    {copied ? "✓" : lang === "bn" ? "কপি" : "Copy"}
                  </button>
                  <button onClick={handleDownload} className="py-2.5 sm:py-2 text-xs sm:text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    {lang === "bn" ? "ডাউনলোড" : "Download"}
                  </button>
                  <button onClick={handlePrint} className="py-2.5 sm:py-2 text-xs sm:text-[10px] font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                    {lang === "bn" ? "প্রিন্ট" : "Print/PDF"}
                  </button>
                </div>
              )}

              {source && cv && (
                <p className="text-[10px] text-slate-400 text-center">
                  {source === "ai"
                    ? lang === "bn" ? "AI দ্বারা তৈরি" : "Generated with AI"
                    : source === "fallback"
                      ? lang === "bn" ? "টেমপ্লেট ফallback" : "Template fallback"
                      : lang === "bn" ? "সংরক্ষিত সংস্করণ" : "Cached version"}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
            )}
          </div>

          {/* Right: CV Preview */}
          <div className="lg:col-span-2">
            {!cv ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center print:hidden">
                <span className="text-5xl block mb-4">📄</span>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {lang === "bn" ? "আপনার সিভি এখানে দেখা যাবে" : "Your CV preview will appear here"}
                </h3>
                <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                  {lang === "bn"
                    ? "লক্ষ্য সেট করুন, তারপর 'সিভি তৈরি করুন' ক্লিক করুন।"
                    : "Set a career goal, then click Generate CV to create a tailored resume."}
                </p>
              </div>
            ) : (
              <article
                id="cv-preview"
                className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs print:shadow-none print:border-0 print:rounded-none print:p-0 space-y-6"
              >
                {/* CV Header */}
                <header className="border-b border-slate-200 pb-5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{cv.fullName}</h1>
                  <p className="text-indigo-700 font-bold text-sm sm:text-base mt-1">{cv.headline}</p>
                  {cv.email && <p className="text-slate-500 text-xs mt-1">{cv.email}</p>}
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-2 tracking-wider">
                    {lang === "bn" ? "লক্ষ্য:" : "Target:"} {cv.targetRole}
                  </p>
                </header>

                {/* Summary */}
                <section>
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    {lang === "bn" ? "সারাংশ" : "Summary"}
                  </h2>
                  <p className="text-slate-700 text-sm leading-relaxed">{cv.summary}</p>
                </section>

                {/* Skills */}
                {cv.skills.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      {lang === "bn" ? "দক্ষতা" : "Skills"}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {cv.skills.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experience */}
                {cv.experience.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      {lang === "bn" ? "অভিজ্ঞতা" : "Experience"}
                    </h2>
                    <div className="space-y-4">
                      {cv.experience.map((exp, idx) => (
                        <div key={idx}>
                          <div className="flex flex-wrap justify-between gap-1">
                            <h3 className="font-extrabold text-slate-800 text-sm">{exp.role}</h3>
                            <span className="text-xs text-slate-400 font-semibold">{exp.period}</span>
                          </div>
                          <p className="text-xs text-indigo-600 font-bold">{exp.organization}</p>
                          <ul className="mt-1.5 space-y-0.5">
                            {exp.highlights.map((h, i) => (
                              <li key={i} className="text-xs text-slate-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                {h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {cv.projects.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      {lang === "bn" ? "প্রজেক্ট" : "Projects"}
                    </h2>
                    <div className="space-y-3">
                      {cv.projects.map((proj, idx) => (
                        <div key={idx}>
                          <h3 className="font-extrabold text-slate-800 text-sm">{proj.name}</h3>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{proj.description}</p>
                          {proj.technologies.length > 0 && (
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">
                              {proj.technologies.join(" • ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {cv.education.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      {lang === "bn" ? "শিক্ষা" : "Education"}
                    </h2>
                    <div className="space-y-2">
                      {cv.education.map((edu, idx) => (
                        <div key={idx} className="flex flex-wrap justify-between gap-1">
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">{edu.degree}</h3>
                            <p className="text-xs text-slate-500">{edu.institution}</p>
                          </div>
                          {edu.year && <span className="text-xs text-slate-400 font-semibold">{edu.year}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {cv.certifications.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      {lang === "bn" ? "সার্টিফিকেশন" : "Certifications"}
                    </h2>
                    <ul className="space-y-0.5">
                      {cv.certifications.map((cert, idx) => (
                        <li key={idx} className="text-xs text-slate-600 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </article>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #cv-preview, #cv-preview * { visibility: visible; }
          #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 1.5rem;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
