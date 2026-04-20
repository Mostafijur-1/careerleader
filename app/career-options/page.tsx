"use client"

import Link from "next/link"
import { useState } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"

type MenuItem = {
  id: string
  title: string
  points: string[]
}

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

function jobIcon(id: string) {
  return id === "gov" ? "🏛️" : "💼"
}

function studyIcon(id: string) {
  if (id === "gov-uni") return "🏛️"
  if (id === "pvt-uni") return "🏫"
  if (id === "scholarship") return "🎓"
  return "✈️"
}

export default function CareerOptionsPage() {
  const { t } = useLanguage()
  const co = t.careerOptions
  const [studyTab, setStudyTab] = useState<"Bangladesh" | "Abroad">("Bangladesh")
  const [openKey, setOpenKey] = useState<string>("")

  function toggle(key: string) {
    setOpenKey(prev => (prev === key ? "" : key))
  }

  const studyItems = studyTab === "Bangladesh" ? co.bd : co.abroadItems

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <Link href="/" className="text-blue-600 font-semibold hover:text-blue-700 transition">
            {co.back}
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{co.title}</h1>
          <LanguageToggle variant="light" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">{co.jobOpportunities}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {co.jobs.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(`job-${item.id}`)}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-4 text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-3xl sm:text-4xl">{jobIcon(item.id)}</p>
                <p className="mt-2 text-sm sm:text-base font-bold text-gray-800">{item.title}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {co.jobs.map(item => (
              <ExpandableRow
                key={`row-job-${item.id}`}
                item={item}
                isOpen={openKey === `job-${item.id}`}
                onToggle={() => toggle(`job-${item.id}`)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">{co.higherStudies}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setStudyTab("Bangladesh")}
              className={`rounded-lg py-2 text-sm sm:text-base font-bold transition ${
                studyTab === "Bangladesh"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {co.bangladesh}
            </button>
            <button
              onClick={() => setStudyTab("Abroad")}
              className={`rounded-lg py-2 text-sm sm:text-base font-bold transition ${
                studyTab === "Abroad"
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {co.abroad}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {studyItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(`study-${studyTab}-${item.id}`)}
                className="rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 px-3 py-4 text-center shadow-sm hover:shadow-md transition"
              >
                <p className="text-3xl sm:text-4xl">{studyIcon(item.id)}</p>
                <p className="mt-2 text-sm sm:text-base font-bold text-gray-800">{item.title}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {studyItems.map(item => (
              <ExpandableRow
                key={`row-study-${studyTab}-${item.id}`}
                item={item}
                isOpen={openKey === `study-${studyTab}-${item.id}`}
                onToggle={() => toggle(`study-${studyTab}-${item.id}`)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 border-b border-gray-100 pb-2">{co.entrepreneurship}</h2>
          <div className="mt-4 grid gap-2 lg:grid-cols-3">
            {co.ent.map(item => (
              <ExpandableRow
                key={`ent-${item.id}`}
                item={item}
                isOpen={openKey === `ent-${item.id}`}
                onToggle={() => toggle(`ent-${item.id}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
