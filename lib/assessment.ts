import questions from '../data/assessment_questions.json'

type Question = {
  id: string
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  sideA: string
  sideB: string
  interests?: string[]
  interestsA?: string[]
  interestsB?: string[]
}

type Answer = {
  questionId: string
  // answer may be 'A'|'B' or numeric 1-5
  answer: string | number
}

export function scoreAssessment(answers: Answer[]) {
  const dims: Record<string, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }
  const interestCounts: Record<string, number> = {}
  const canonicalSideA: Record<Question['dimension'], string> = {
    EI: 'E',
    SN: 'S',
    TF: 'T',
    JP: 'J',
  }

  const qmap: Record<string, Question> = {}
  ;(questions as Question[]).forEach(q => (qmap[q.id] = q))

  for (const a of answers || []) {
    const q = qmap[a.questionId]
    if (!q) continue

    // rawValue is positive for this question's sideA. The normalized value
    // always favors E, S, T, or J when positive, which lets the question bank
    // include reverse-framed items without changing the result semantics.
    let rawValue = 0
    if (typeof a.answer === 'number') {
      // Likert 1..5: 3 = neutral, >3 favors sideA, <3 favors sideB
      const n = Math.max(1, Math.min(5, Math.round(a.answer)))
      rawValue = n - 3
    } else if (typeof a.answer === 'string') {
      const s = a.answer.trim().toUpperCase()
      if (s === 'A' || s === q.sideA.toUpperCase()) rawValue = 1
      else if (s === 'B' || s === q.sideB.toUpperCase()) rawValue = -1
      else {
        const parsed = parseInt(s, 10)
        if (!isNaN(parsed)) rawValue = Math.max(-2, Math.min(2, parsed - 3))
      }
    }

    const val = q.sideA.toUpperCase() === canonicalSideA[q.dimension]
      ? rawValue
      : -rawValue
    dims[q.dimension] += val

    const directionalInterests = rawValue > 0
      ? q.interestsA
      : rawValue < 0
        ? q.interestsB
        : []
    const interests = directionalInterests?.length ? directionalInterests : q.interests
    if (interests) {
      for (const interest of interests) {
        interestCounts[interest] = (interestCounts[interest] || 0) + Math.abs(rawValue)
      }
    }
  }

  function pick(dim: 'EI' | 'SN' | 'TF' | 'JP') {
    const sides: Record<Question['dimension'], [string, string]> = {
      EI: ['E', 'I'],
      SN: ['S', 'N'],
      TF: ['T', 'F'],
      JP: ['J', 'P'],
    }
    return dims[dim] >= 0 ? sides[dim][0] : sides[dim][1]
  }

  const personality = `${pick('EI')}${pick('SN')}${pick('TF')}${pick('JP')}`

  // compute top interests
  const interests = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0])

  return { personality, dims, interests }
}

export { questions }
