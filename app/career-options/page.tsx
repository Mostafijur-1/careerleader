"use client"

import Link from "next/link"
import { useState } from "react"

type MenuItem = {
  title: string
  points: string[]
}

const jobItems: MenuItem[] = [
  {
    title: "Government Jobs",
    points: ["Job sectors", "Requirements", "Application process", "Preparation guidelines"],
  },
  {
    title: "Private Jobs",
    points: ["Company types", "Required skills", "Job opportunities", "Career growth"],
  },
]

const bdItems: MenuItem[] = [
  {
    title: "Govt. Universities",
    points: ["Admission process", "Requirements", "Preparation tips"],
  },
  {
    title: "Private Universities",
    points: ["Admission system", "Costs", "Facilities"],
  },
]

const abroadItems: MenuItem[] = [
  {
    title: "Scholarship",
    points: ["Types of scholarships", "Eligibility", "Application process"],
  },
  {
    title: "Self-Finance",
    points: ["Cost estimation", "Visa process", "University selection"],
  },
]

const entrepreneurshipItems: MenuItem[] = [
  { title: "How to Be an Entrepreneur", points: ["How to become an entrepreneur"] },
  { title: "Roles & Skills", points: ["Required skills", "Roles and responsibilities"] },
  { title: "Challenges & Success", points: ["Challenges and risks", "Success strategies"] },
]

function ExpandableRow({
  item,
  isOpen,
  onToggle,
}: {
  item: MenuItem
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50 transition"
      >
        <span className="font-bold text-slate-800">{item.title}</span>
        <span className="text-slate-600 text-lg">{isOpen ? "⌄" : "›"}</span>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="px-6 pb-3 pt-1 list-disc text-sm text-slate-700 space-y-1">
          {item.points.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function CareerOptionsPage() {
  const [studyTab, setStudyTab] = useState<"Bangladesh" | "Abroad">("Bangladesh")
  const [openKey, setOpenKey] = useState<string>("")

  function toggle(key: string) {
    setOpenKey(prev => (prev === key ? "" : key))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700 transition">
            ← Back Home
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Career Options</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">Job Opportunities</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {jobItems.map(item => (
              <button
                key={item.title}
                type="button"
                onClick={() => toggle(`job-${item.title}`)}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-4 text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-3xl sm:text-4xl">{item.title.includes("Government") ? "🏛️" : "💼"}</p>
                <p className="mt-2 text-sm sm:text-base font-bold text-gray-800">{item.title}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {jobItems.map(item => (
              <ExpandableRow
                key={`row-job-${item.title}`}
                item={item}
                isOpen={openKey === `job-${item.title}`}
                onToggle={() => toggle(`job-${item.title}`)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">Higher Studies</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setStudyTab("Bangladesh")}
              className={`rounded-lg py-2 text-sm sm:text-base font-bold transition ${
                studyTab === "Bangladesh"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Bangladesh
            </button>
            <button
              onClick={() => setStudyTab("Abroad")}
              className={`rounded-lg py-2 text-sm sm:text-base font-bold transition ${
                studyTab === "Abroad"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Abroad
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {(studyTab === "Bangladesh" ? bdItems : abroadItems).map(item => (
              <button
                key={item.title}
                type="button"
                onClick={() => toggle(`study-${studyTab}-${item.title}`)}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 px-3 py-4 text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-3xl sm:text-4xl">
                  {item.title.includes("Govt.")
                    ? "🏛️"
                    : item.title.includes("Private")
                    ? "🏫"
                    : item.title.includes("Scholarship")
                    ? "🎓"
                    : "✈️"}
                </p>
                <p className="mt-2 text-sm sm:text-base font-bold text-gray-800">{item.title}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {(studyTab === "Bangladesh" ? bdItems : abroadItems).map(item => (
              <ExpandableRow
                key={`row-study-${studyTab}-${item.title}`}
                item={item}
                isOpen={openKey === `study-${studyTab}-${item.title}`}
                onToggle={() => toggle(`study-${studyTab}-${item.title}`)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">Entrepreneurship</h2>
          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {entrepreneurshipItems.map(item => (
              <ExpandableRow
                key={`ent-${item.title}`}
                item={item}
                isOpen={openKey === `ent-${item.title}`}
                onToggle={() => toggle(`ent-${item.title}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

