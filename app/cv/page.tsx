"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import DashboardLayout from "../components/DashboardLayout"
import { useLanguage } from "../contexts/LanguageContext"
import { useUser } from "../contexts/UserContext"
import type { CareerGoalInput, CvEducation, CvExperience, CvProject, GeneratedCv } from "@/lib/cvTypes"

function storageKey(email?: string) {
  return email ? `generated_cv:${email.toLowerCase()}` : "generated_cv"
}

function readGoal(userGoal: CareerGoalInput | null | undefined) {
  if (userGoal?.title?.trim()) return userGoal
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("career_goal")
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CareerGoalInput
    return parsed.title?.trim() ? parsed : null
  } catch {
    return null
  }
}

function starterCv(goal: CareerGoalInput, user?: { name?: string; email?: string; bio?: string; skills?: string[]; education?: CvEducation[] }): GeneratedCv {
  return {
    fullName: user?.name?.trim() || "Your Name",
    headline: `${goal.skillLevel || "Aspiring"} ${goal.title}`,
    summary: user?.bio?.trim() || "",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
    portfolio: "",
    skills: Array.from(new Set([...(user?.skills || []), ...(goal.focusAreas || [])])).slice(0, 12),
    experience: [],
    education: user?.education || [],
    projects: [],
    certifications: [],
    targetRole: goal.title,
  }
}

function cvCompleteness(cv: GeneratedCv | null) {
  if (!cv) return 0
  let score = 0
  if (cv.fullName.trim() && cv.fullName !== "Your Name") score += 10
  if (cv.headline.trim()) score += 10
  if (cv.email?.trim()) score += 5
  if (cv.phone?.trim()) score += 5
  if (cv.location?.trim()) score += 5
  if (cv.summary.trim().length >= 80) score += 15
  if (cv.skills.length >= 4) score += 15
  if (cv.education.some(item => item.degree.trim() && item.institution.trim())) score += 10
  if (cv.experience.length > 0 || cv.projects.length > 0) score += 10
  if (cv.experience.some(item => item.highlights.some(line => line.trim().length >= 20)) || cv.projects.some(item => item.description.trim().length >= 40)) score += 10
  if (cv.linkedin?.trim() || cv.portfolio?.trim() || cv.projects.some(item => item.link?.trim())) score += 5
  return Math.min(score, 100)
}

function cvToPlainText(cv: GeneratedCv) {
  const contact = [cv.email, cv.phone, cv.location, cv.linkedin, cv.portfolio].filter(Boolean).join(" | ")
  const lines = [cv.fullName, cv.headline, contact, "", "SUMMARY", cv.summary, "", "SKILLS", cv.skills.join(" | ")]
  if (cv.experience.length) {
    lines.push("", "EXPERIENCE")
    cv.experience.forEach(item => {
      lines.push(`${item.role} - ${item.organization} | ${item.period}`)
      item.highlights.filter(Boolean).forEach(line => lines.push(`- ${line}`))
    })
  }
  if (cv.projects.length) {
    lines.push("", "PROJECTS")
    cv.projects.forEach(item => {
      lines.push(item.name)
      lines.push(item.description)
      if (item.technologies.length) lines.push(`Tools: ${item.technologies.join(", ")}`)
      if (item.link) lines.push(item.link)
    })
  }
  if (cv.education.length) {
    lines.push("", "EDUCATION")
    cv.education.forEach(item => lines.push(`${item.degree} - ${item.institution} | ${item.year}`))
  }
  if (cv.certifications.length) lines.push("", "CERTIFICATIONS", ...cv.certifications.map(item => `- ${item}`))
  return lines.join("\n")
}

function Field({ label, value, onChange, placeholder = "", type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
    </label>
  )
}

export default function CvGeneratorPage() {
  const { user, setUser } = useUser()
  const { lang } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [goal, setGoal] = useState<CareerGoalInput | null>(null)
  const [cv, setCv] = useState<GeneratedCv | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [skillInput, setSkillInput] = useState("")
  const [certInput, setCertInput] = useState("")

  useEffect(() => {
    setMounted(true)
    const activeGoal = readGoal(user?.goal)
    setGoal(activeGoal)
    if (user?.cvDraft) {
      setCv(user.cvDraft)
      return
    }
    const raw = localStorage.getItem(storageKey(user?.email)) || (!user ? localStorage.getItem("generated_cv") : null)
    if (raw) {
      try {
        setCv(JSON.parse(raw))
        return
      } catch {
        localStorage.removeItem(storageKey(user?.email))
      }
    }
    if (activeGoal) setCv(starterCv(activeGoal, user || undefined))
  }, [user])

  const completeness = useMemo(() => cvCompleteness(cv), [cv])
  const missingItems = useMemo(() => {
    if (!cv) return []
    const items: string[] = []
    if (!cv.phone?.trim()) items.push(lang === "bn" ? "ফোন নম্বর" : "phone number")
    if (cv.summary.trim().length < 80) items.push(lang === "bn" ? "শক্তিশালী সারাংশ" : "a stronger summary")
    if (cv.skills.length < 4) items.push(lang === "bn" ? "কমপক্ষে ৪টি দক্ষতা" : "at least 4 skills")
    if (!cv.education.length) items.push(lang === "bn" ? "শিক্ষা" : "education")
    if (!cv.experience.length && !cv.projects.length) items.push(lang === "bn" ? "অভিজ্ঞতা বা বাস্তব প্রজেক্ট" : "experience or a real project")
    if (!cv.linkedin && !cv.portfolio) items.push(lang === "bn" ? "LinkedIn বা পোর্টফোলিও" : "LinkedIn or portfolio")
    return items
  }, [cv, lang])

  function updateCv(patch: Partial<GeneratedCv>) {
    setCv(current => current ? { ...current, ...patch } : current)
    setMessage("")
  }

  async function persistCv(nextCv: GeneratedCv, showConfirmation = true) {
    setSaving(true)
    setError("")
    localStorage.setItem(storageKey(user?.email), JSON.stringify(nextCv))
    if (!user) localStorage.setItem("generated_cv", JSON.stringify(nextCv))
    try {
      if (user) {
        const res = await fetch("/api/journey", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save-cv", cv: nextCv, completeness: cvCompleteness(nextCv) }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Could not save CV")
        setUser({ ...user, journey: data.journey, cvDraft: data.cvDraft })
      }
      if (showConfirmation) setMessage(lang === "bn" ? "সিভি সংরক্ষিত হয়েছে" : "CV saved")
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save CV")
    } finally {
      setSaving(false)
    }
  }

  async function generateCv() {
    const activeGoal = goal || readGoal(user?.goal)
    if (!activeGoal) {
      setError(lang === "bn" ? "প্রথমে একটি ক্যারিয়ার লক্ষ্য নির্ধারণ করুন।" : "Set a career goal before generating your CV.")
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
          profile: { name: user?.name, email: user?.email, bio: user?.bio, skills: user?.skills, education: user?.education, mbti: user?.mbti },
          lang,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      const generated = data.cv as GeneratedCv
      setCv(generated)
      await persistCv(generated, false)
      setMessage(lang === "bn" ? "সত্য তথ্যভিত্তিক খসড়া তৈরি হয়েছে - এখন বাস্তব প্রমাণ যোগ করুন।" : "Truthful draft created - now add your real evidence.")
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Could not generate CV")
    } finally {
      setGenerating(false)
    }
  }

  function addSkill() {
    if (!cv || !skillInput.trim()) return
    const skill = skillInput.trim()
    if (!cv.skills.includes(skill)) updateCv({ skills: [...cv.skills, skill] })
    setSkillInput("")
  }

  function addCertification() {
    if (!cv || !certInput.trim()) return
    const certification = certInput.trim()
    if (!cv.certifications.includes(certification)) updateCv({ certifications: [...cv.certifications, certification] })
    setCertInput("")
  }

  async function copyCv() {
    if (!cv) return
    await navigator.clipboard.writeText(cvToPlainText(cv))
    setMessage(lang === "bn" ? "সিভি কপি হয়েছে" : "CV copied")
  }

  async function printCv() {
    if (!cv) return
    await persistCv(cv, false)
    window.print()
  }

  if (!mounted) return null

  return (
    <DashboardLayout activeTab="cv" maxWidthClass="max-w-[1500px]">
      <div className="space-y-6 text-left print:space-y-0">
        <div className="flex flex-col gap-4 print:hidden xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">Application-ready CV workspace</div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{lang === "bn" ? "ব্যবহারিক সিভি নির্মাতা" : "Practical CV Builder"}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{lang === "bn" ? "সত্য তথ্য লিখুন, পাশে লাইভ প্রিভিউ দেখুন এবং A4 PDF হিসেবে সংরক্ষণ করুন।" : "Edit real evidence, review the live preview, and print or save a clean A4 PDF."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void generateCv()} disabled={generating || !goal} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50">{generating ? "Generating..." : cv ? "Refresh tailored draft" : "Generate draft"}</button>
            <button onClick={() => cv && void persistCv(cv)} disabled={!cv || saving} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">{saving ? "Saving..." : "Save changes"}</button>
            <button onClick={() => void printCv()} disabled={!cv} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-slate-800 disabled:opacity-50">Print / Save PDF</button>
          </div>
        </div>

        {!goal && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
            <span className="font-extrabold">Set your direction first.</span> <Link href="/goals" className="font-extrabold underline">Create a career goal</Link> to tailor this CV.
          </div>
        )}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700 print:hidden">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 print:hidden">{message}</p>}

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(620px,0.95fr)]">
          <div className="space-y-5 print:hidden">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-extrabold text-slate-900">CV readiness</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Quality improves when every claim has real evidence.</p>
                </div>
                <span className="text-2xl font-black text-indigo-600">{completeness}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all" style={{ width: `${completeness}%` }} /></div>
              {missingItems.length > 0 && <p className="mt-3 text-xs leading-5 text-slate-500">Add next: <span className="font-bold text-slate-700">{missingItems.slice(0, 3).join(", ")}</span>.</p>}
            </section>

            {cv && (
              <>
                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div><h2 className="font-extrabold text-slate-900">Contact and headline</h2><p className="text-xs text-slate-500">Use details employers can verify.</p></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" value={cv.fullName} onChange={value => updateCv({ fullName: value })} />
                    <Field label="Target headline" value={cv.headline} onChange={value => updateCv({ headline: value })} placeholder="Junior Data Analyst" />
                    <Field label="Email" type="email" value={cv.email || ""} onChange={value => updateCv({ email: value })} />
                    <Field label="Phone" value={cv.phone || ""} onChange={value => updateCv({ phone: value })} />
                    <Field label="Location" value={cv.location || ""} onChange={value => updateCv({ location: value })} placeholder="Dhaka, Bangladesh" />
                    <Field label="LinkedIn" value={cv.linkedin || ""} onChange={value => updateCv({ linkedin: value })} placeholder="linkedin.com/in/yourname" />
                    <div className="sm:col-span-2"><Field label="Portfolio / GitHub" value={cv.portfolio || ""} onChange={value => updateCv({ portfolio: value })} placeholder="github.com/yourname" /></div>
                  </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h2 className="font-extrabold text-slate-900">Professional summary</h2><span className="text-[10px] font-bold text-slate-400">{cv.summary.length}/500</span></div>
                  <textarea value={cv.summary} maxLength={500} onChange={event => updateCv({ summary: event.target.value })} rows={5} placeholder="Who you are, the role you target, the relevant strengths you can prove, and what you want to contribute." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm leading-6 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                  <p className="text-[11px] leading-5 text-slate-500">Keep it to 2-3 sentences. Avoid personality labels and unsupported adjectives.</p>
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-extrabold text-slate-900">Skills</h2>
                  <div className="flex flex-wrap gap-2">{cv.skills.map(skill => <button key={skill} onClick={() => updateCv({ skills: cv.skills.filter(item => item !== skill) })} className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-red-50 hover:text-red-600" title="Remove skill">{skill} ×</button>)}</div>
                  <div className="flex gap-2"><input value={skillInput} onChange={event => setSkillInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addSkill() } }} placeholder="Add a role-relevant skill" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" /><button onClick={addSkill} className="rounded-xl bg-indigo-50 px-4 text-xs font-extrabold text-indigo-700">Add</button></div>
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><div><h2 className="font-extrabold text-slate-900">Experience</h2><p className="text-xs text-slate-500">Jobs, internships, volunteering, leadership, or meaningful freelance work.</p></div><button onClick={() => updateCv({ experience: [...cv.experience, { role: "", organization: "", period: "", highlights: [""] }] })} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700">+ Add</button></div>
                  {cv.experience.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">No experience added. That is okay - add projects below instead of inventing a role.</p>}
                  {cv.experience.map((item, index) => <ExperienceEditor key={index} item={item} onChange={next => updateCv({ experience: cv.experience.map((entry, itemIndex) => itemIndex === index ? next : entry) })} onRemove={() => updateCv({ experience: cv.experience.filter((_, itemIndex) => itemIndex !== index) })} />)}
                </section>

                <section data-testid="cv-projects-editor" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><div><h2 className="font-extrabold text-slate-900">Projects</h2><p className="text-xs text-slate-500">Show the problem, your contribution, tools, and result.</p></div><button onClick={() => updateCv({ projects: [...cv.projects, { name: "", description: "", technologies: [], link: "" }] })} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700">+ Add</button></div>
                  {cv.projects.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">Add one real academic, personal, or client project.</p>}
                  {cv.projects.map((item, index) => <ProjectEditor key={index} item={item} onChange={next => updateCv({ projects: cv.projects.map((entry, itemIndex) => itemIndex === index ? next : entry) })} onRemove={() => updateCv({ projects: cv.projects.filter((_, itemIndex) => itemIndex !== index) })} />)}
                </section>

                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between"><h2 className="font-extrabold text-slate-900">Education</h2><button onClick={() => updateCv({ education: [...cv.education, { degree: "", institution: "", year: "" }] })} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700">+ Add</button></div>
                  {cv.education.map((item, index) => <EducationEditor key={index} item={item} onChange={next => updateCv({ education: cv.education.map((entry, itemIndex) => itemIndex === index ? next : entry) })} onRemove={() => updateCv({ education: cv.education.filter((_, itemIndex) => itemIndex !== index) })} />)}
                </section>

                <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-extrabold text-slate-900">Certifications</h2>
                  <div className="flex flex-wrap gap-2">{cv.certifications.map(cert => <button key={cert} onClick={() => updateCv({ certifications: cv.certifications.filter(item => item !== cert) })} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">{cert} ×</button>)}</div>
                  <div className="flex gap-2"><input value={certInput} onChange={event => setCertInput(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addCertification() } }} placeholder="Certification name and issuer" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" /><button onClick={addCertification} className="rounded-xl bg-indigo-50 px-4 text-xs font-extrabold text-indigo-700">Add</button></div>
                </section>
              </>
            )}
          </div>

          <div className="xl:sticky xl:top-6">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 print:hidden"><span className="font-bold">Live A4 preview</span>{cv && <button onClick={() => void copyCv()} className="font-extrabold text-indigo-600">Copy as text</button>}</div>
            {cv ? <CvPreview cv={cv} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Set a goal and generate a truthful starting draft.</div>}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          html, body { background: white !important; }
          body * { visibility: hidden !important; }
          #cv-print-root, #cv-print-root * { visibility: visible !important; }
          #cv-print-root { position: absolute !important; inset: 0 auto auto 0 !important; width: 100% !important; min-height: 0 !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; padding: 0 !important; }
          .cv-print-section { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </DashboardLayout>
  )
}

function ExperienceEditor({ item, onChange, onRemove }: { item: CvExperience; onChange: (item: CvExperience) => void; onRemove: () => void }) {
  return <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Role" value={item.role} onChange={value => onChange({ ...item, role: value })} /><Field label="Organization" value={item.organization} onChange={value => onChange({ ...item, organization: value })} /><div className="sm:col-span-2"><Field label="Period" value={item.period} onChange={value => onChange({ ...item, period: value })} placeholder="Jan 2025 - Present" /></div></div><label className="block space-y-1.5"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Evidence bullets - one per line</span><textarea value={item.highlights.join("\n")} onChange={event => onChange({ ...item, highlights: event.target.value.split("\n") })} rows={4} placeholder="Built..., improved..., coordinated... Include numbers only when true." className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400" /></label><button onClick={onRemove} className="text-xs font-bold text-red-600">Remove experience</button></div>
}

function ProjectEditor({ item, onChange, onRemove }: { item: CvProject; onChange: (item: CvProject) => void; onRemove: () => void }) {
  return <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Project name" value={item.name} onChange={value => onChange({ ...item, name: value })} /><Field label="Link" value={item.link || ""} onChange={value => onChange({ ...item, link: value })} placeholder="github.com/..." /></div><label className="block space-y-1.5"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">What you built and the result</span><textarea value={item.description} onChange={event => onChange({ ...item, description: event.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400" /></label><Field label="Tools - comma separated" value={item.technologies.join(", ")} onChange={value => onChange({ ...item, technologies: value.split(",").map(entry => entry.trim()).filter(Boolean) })} /><button onClick={onRemove} className="text-xs font-bold text-red-600">Remove project</button></div>
}

function EducationEditor({ item, onChange, onRemove }: { item: CvEducation; onChange: (item: CvEducation) => void; onRemove: () => void }) {
  return <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:grid-cols-[1fr_1fr_120px_auto]"><Field label="Degree / program" value={item.degree} onChange={value => onChange({ ...item, degree: value })} /><Field label="Institution" value={item.institution} onChange={value => onChange({ ...item, institution: value })} /><Field label="Year" value={item.year} onChange={value => onChange({ ...item, year: value })} /><button onClick={onRemove} className="self-end rounded-lg px-2 py-2.5 text-xs font-bold text-red-600">Remove</button></div>
}

function CvPreview({ cv }: { cv: GeneratedCv }) {
  const contact = [cv.email, cv.phone, cv.location].filter(Boolean)
  const links = [cv.linkedin, cv.portfolio].filter(Boolean)
  return (
    <article id="cv-print-root" className="mx-auto min-h-[297mm] w-full max-w-[210mm] space-y-5 rounded-sm border border-slate-200 bg-white p-7 text-slate-800 shadow-xl sm:p-10">
      <header className="border-b-2 border-[#112954] pb-5">
        <h1 className="text-3xl font-black tracking-tight text-[#112954]">{cv.fullName || "Your Name"}</h1>
        <p className="mt-1 text-base font-bold text-indigo-700">{cv.headline}</p>
        {contact.length > 0 && <p className="mt-2 text-[11px] text-slate-600">{contact.join("  |  ")}</p>}
        {links.length > 0 && <p className="mt-1 break-all text-[10px] font-semibold text-indigo-700">{links.join("  |  ")}</p>}
      </header>
      {cv.summary.trim() && <CvSection title="Professional summary"><p className="text-xs leading-5 text-slate-700">{cv.summary}</p></CvSection>}
      {cv.skills.length > 0 && <CvSection title="Core skills"><p className="text-xs font-semibold leading-5 text-slate-700">{cv.skills.join("  •  ")}</p></CvSection>}
      {cv.experience.length > 0 && <CvSection title="Experience"><div className="space-y-4">{cv.experience.map((item, index) => <div key={index} className="cv-print-section"><div className="flex justify-between gap-4"><h3 className="text-sm font-extrabold text-slate-900">{item.role}</h3><span className="text-[10px] font-semibold text-slate-500">{item.period}</span></div><p className="text-[11px] font-bold text-indigo-700">{item.organization}</p><ul className="mt-1.5 list-disc space-y-1 pl-4">{item.highlights.filter(Boolean).map((line, lineIndex) => <li key={lineIndex} className="text-[11px] leading-4 text-slate-700">{line}</li>)}</ul></div>)}</div></CvSection>}
      {cv.projects.length > 0 && <CvSection title="Selected projects"><div className="space-y-4">{cv.projects.map((item, index) => <div key={index} className="cv-print-section"><div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-extrabold text-slate-900">{item.name}</h3>{item.link && <span className="break-all text-[9px] font-semibold text-indigo-700">{item.link}</span>}</div><p className="mt-1 text-[11px] leading-4 text-slate-700">{item.description}</p>{item.technologies.length > 0 && <p className="mt-1 text-[10px] font-bold text-slate-500">Tools: {item.technologies.join(", ")}</p>}</div>)}</div></CvSection>}
      {cv.education.length > 0 && <CvSection title="Education"><div className="space-y-3">{cv.education.map((item, index) => <div key={index} className="cv-print-section flex justify-between gap-4"><div><h3 className="text-sm font-extrabold text-slate-900">{item.degree}</h3><p className="text-[11px] text-slate-600">{item.institution}</p></div><span className="text-[10px] font-semibold text-slate-500">{item.year}</span></div>)}</div></CvSection>}
      {cv.certifications.length > 0 && <CvSection title="Certifications"><ul className="list-disc space-y-1 pl-4">{cv.certifications.map(item => <li key={item} className="text-[11px] leading-4 text-slate-700">{item}</li>)}</ul></CvSection>}
    </article>
  )
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="cv-print-section"><h2 className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#112954]">{title}</h2>{children}</section>
}
