import careers from '../data/careers.json'

export type CareerCategory = 'job' | 'higher_study' | 'entrepreneurship'

export type EducationEntry = {
  degree: string
  institution: string
  year?: string
}

export type ExperienceEntry = {
  title: string
  organization: string
  period: string
  summary?: string
}

export type CurrentJob = {
  title: string
  company: string
}

export type MentorProfilePayload = {
  id: string
  demo?: boolean
  email: string
  name: string
  careerIds: string[]
  headline: string
  role: string
  education: EducationEntry[]
  currentJob: CurrentJob | null
  experience: ExperienceEntry[]
  bio: string
  expertise: string[]
  rating: number
  reviews: number
  recommended: boolean
  zoomLink: string
  meetLink: string
}

export function careerIdsForCategory(category: CareerCategory): Set<string> {
  return new Set(careers.filter(c => c.category === category).map(c => c.id))
}

export function mentorMatchesCategory(
  careerIds: string[],
  category: CareerCategory | null
): boolean {
  if (!category) return true
  if (careerIds.length === 0) return true
  const allowed = careerIdsForCategory(category)
  return careerIds.some(id => allowed.has(id))
}
