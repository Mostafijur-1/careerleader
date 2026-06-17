export interface CvEducation {
  degree: string
  institution: string
  year: string
}

export interface CvExperience {
  role: string
  organization: string
  period: string
  highlights: string[]
}

export interface CvProject {
  name: string
  description: string
  technologies: string[]
}

export interface GeneratedCv {
  fullName: string
  headline: string
  summary: string
  email?: string
  skills: string[]
  experience: CvExperience[]
  education: CvEducation[]
  projects: CvProject[]
  certifications: string[]
  targetRole: string
}

export interface CareerGoalInput {
  title: string
  targetDate?: string
  skillLevel?: string
  whyImportant?: string
  focusAreas?: string[]
}

export interface CvGenerateRequest {
  goal: CareerGoalInput
  profile: {
    name?: string
    email?: string
    bio?: string
    skills?: string[]
    education?: CvEducation[]
    mbti?: string
  }
  lang?: "en" | "bn"
}
