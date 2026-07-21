import type { GeneratedCv } from "./cvTypes"

export type JourneyAction =
  | "assessment_completed"
  | "career_assessment_completed"
  | "career_selected"
  | "career_saved"
  | "goal_set"
  | "roadmap_progressed"
  | "cv_saved"

export interface JourneyCareer {
  id: string
  title: string
  description?: string
  skills?: string[]
}

export interface JourneyState {
  assessmentCompletedAt?: string
  recommendedCareerIds?: string[]
  careerAssessmentCompletedAt?: string
  careerAssessmentSector?: string
  careerAssessmentRecommendations?: JourneyCareer[]
  selectedCareer?: JourneyCareer
  savedCareerIds?: string[]
  goalSetAt?: string
  roadmapCompletedTasks?: string[]
  roadmapProgress?: number
  cvUpdatedAt?: string
  cvCompleteness?: number
  lastAction?: JourneyAction
  lastActionAt?: string
}

export interface JourneyUserData {
  journey?: JourneyState
  cvDraft?: GeneratedCv | null
}
