"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '../contexts/UserContext'

type Q = { 
  id: string
  text: string
  dimension: string
  sideA: string
  sideB: string
  optionA?: string
  optionB?: string
  interests: string[]
}

export default function AssessmentPage() {
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [qs, setQs] = useState<Q[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [gender, setGender] = useState<string>('Male')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const likertOptions = [
    { value: 1, label: 'Strongly Disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neutral' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly Agree' },
  ]

  const progress = qs.length ? Math.round((Object.keys(answers).length / qs.length) * 100) : 0

  // Set mounted flag on client only
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function fetchQuestions() {
      setLoadingQuestions(true)
      try {
        const res = await fetch('/api/assessment')
        const data = await res.json()
        setQs(data || [])
      } catch (err) {
        console.error('Failed to load questions', err)
        setQs([])
      } finally {
        setLoadingQuestions(false)
      }
    }
    if (isMounted) {
      fetchQuestions()
    }
  }, [isMounted])

  function setAnswer(qid: string, val: number) {
    setAnswers(prev => ({ ...prev, [qid]: val }))
    if (currentQuestion < qs.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  async function submit() {
    setLoading(true)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: formattedAnswers,
          user: user ? { email: user.email, type: user.type } : null,
          gender,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to submit assessment')
      }
      setResult({
        personalityType: data.result?.personality,
        interests: data.result?.interests || [],
        recommendations: data.recommendations || [],
      })
    } catch (err) {
      console.error('Submission error:', err)
      setResult({ error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-4">
          <Link href="/" className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 truncate min-w-0">
            <span>🚀</span> CareerLeader
          </Link>
          <Link href="/" className="text-white/80 hover:text-white font-semibold transition text-sm sm:text-base flex-shrink-0">← Back Home</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Loading */}
        {loadingQuestions ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin mb-4 text-6xl">🔄</div>
              <p className="text-white text-xl font-semibold">Loading assessment questions...</p>
            </div>
          </div>
        ) : !result ? (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 lg:p-8 text-white">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                <div>
                  <p className="text-white/80 text-xs sm:text-sm">Question {currentQuestion + 1} of {qs.length}</p>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">Career Assessment</h2>
                </div>
                <div className="text-left sm:text-right flex items-baseline gap-2 sm:block">
                  <p className="text-3xl sm:text-4xl font-bold">{progress}%</p>
                  <p className="text-white/80 text-sm">Complete</p>
                </div>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-white h-3 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` } as React.CSSProperties}
                ></div>
              </div>
            </div>

            {/* Questions */}
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Gender Selector */}
              {currentQuestion === 0 && (
                <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Gender (optional)</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)} 
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 transition font-medium"
                  >
                    <option>Other</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              )}

              {qs.length > 0 && qs[currentQuestion] && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">{qs[currentQuestion].text}</h3>
                  <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    <p className="font-semibold">Scale: Strongly Disagree to Strongly Agree</p>
                    {(qs[currentQuestion].optionA || qs[currentQuestion].optionB) && (
                      <p className="mt-1">
                        <span className="font-medium">Agree side:</span> {qs[currentQuestion].optionA || 'Option A'} |{' '}
                        <span className="font-medium">Disagree side:</span> {qs[currentQuestion].optionB || 'Option B'}
                      </p>
                    )}
                  </div>

                  {/* Answer Options - Likert 1 to 5 */}
                  <div className="space-y-3">
                    {likertOptions.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAnswer(qs[currentQuestion].id, opt.value)}
                        className={`w-full p-4 rounded-xl font-semibold transition transform text-left flex items-center gap-4 ${
                          answers[qs[currentQuestion].id] === opt.value
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-900 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${answers[qs[currentQuestion].id] === opt.value ? 'bg-white text-blue-600' : 'bg-gray-300'}`}>
                          {opt.value}
                        </div>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-4 sm:p-6 lg:p-8 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-between">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Previous
              </button>

              {Object.keys(answers).length < qs.length ? (
                <button
                  onClick={() => setCurrentQuestion(Math.min(qs.length - 1, currentQuestion + 1))}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-white transition"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full sm:flex-1 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? '⏳ Analyzing...' : '🎯 Submit Assessment'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Results */}
            {result.error ? (
              <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 text-center">
                <p className="text-white text-xl font-bold">❌ Error Processing Results</p>
                <p className="text-red-100 mt-2">{result.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main Personality Card */}
                {result?.personalityType && (
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 sm:p-8 lg:p-12 text-white text-center">
                      <p className="text-white/80 text-xs sm:text-sm font-semibold mb-2">Your MBTI Personality Type</p>
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">{result.personalityType}</h2>
                      <p className="text-white/90 text-lg">Based on your answers, discover your unique personality profile and ideal career paths.</p>
                    </div>

                    {/* Interests Grid */}
                    {result.interests && result.interests.length > 0 && (
                      <div className="p-4 sm:p-6 lg:p-8">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Your Key Interests</h3>
                        <div className="flex gap-3 flex-wrap">
                          {result.interests.map((interest: string) => (
                            <div 
                              key={interest} 
                              className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 rounded-full font-semibold text-sm border border-purple-200"
                            >
                              ✨ {interest}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended Careers */}
                {result?.recommendations && result.recommendations.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 lg:p-8 text-white">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">🎯 Recommended Careers</h3>
                      <p className="text-white/80 mt-2">Perfect career paths for personality type {result.personalityType}</p>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                      {result.recommendations.map((r: any, idx: number) => (
                        <div key={r.id} className="p-6 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:shadow-lg transition">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl font-bold text-green-600 font-mono">#{idx + 1}</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-xl text-gray-900">{r.title}</h4>
                              <p className="text-gray-700 mt-2">{r.description}</p>
                              {r.skills && r.skills.length > 0 && (
                                <div className="mt-4 flex gap-2 flex-wrap">
                                  {r.skills.slice(0, 5).map((s: string) => (
                                    <span key={s} className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-semibold">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => { setAnswers({}); setResult(null); setCurrentQuestion(0) }}
                className="w-full sm:flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-4 font-bold text-white transition"
              >
                🔄 Retake Assessment
              </button>
              <Link
                href="/"
                className="w-full sm:flex-1 rounded-lg bg-white hover:bg-gray-50 px-6 py-4 font-bold text-gray-900 transition border border-gray-300 text-center"
              >
                ← Back Home
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
