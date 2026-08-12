import type { SectorAssessmentPayload } from './aiRecommendation'

type CareerAssessmentRecommendation = {
  id: string
  title: string
  description: string
  skills: string[]
}

type Candidate = CareerAssessmentRecommendation & { signals: string[] }

const candidates: Record<string, Candidate[]> = {
  higher_studies: [
    { id: 'study-ai-researcher', title: 'AI Research Scientist', description: 'Conduct advanced research in machine learning and turn experiments into publishable or commercial breakthroughs.', skills: ['Machine Learning', 'Research Methods', 'Python'], signals: ['STEM', 'PhD / Doctorate', 'Corporate R&D', 'Abroad'] },
    { id: 'study-research-engineer', title: 'Research & Development Engineer', description: 'Apply postgraduate technical expertise to prototype and validate new products in an industry R&D team.', skills: ['Prototyping', 'Data Analysis', 'Technical Writing'], signals: ['STEM', "Master's Degree", 'Corporate R&D', 'Professional Certification / Diploma'] },
    { id: 'study-professor', title: 'University Lecturer & Researcher', description: 'Build deep subject expertise, publish original work, and teach the next generation of students.', skills: ['Academic Research', 'Teaching', 'Publishing'], signals: ['PhD / Doctorate', 'Professor/Researcher', 'Home Country', 'Abroad'] },
    { id: 'study-policy', title: 'Public Policy Researcher', description: 'Use social research and evidence to advise governments, NGOs, and public institutions.', skills: ['Policy Analysis', 'Statistics', 'Stakeholder Research'], signals: ['Social Sciences & Business Management', 'Policy Advisor/Consultant', "Master's Degree", 'Home Country'] },
    { id: 'study-business-research', title: 'Business Research Consultant', description: 'Study markets and organizations, then translate evidence into practical recommendations for decision-makers.', skills: ['Market Research', 'Business Strategy', 'Presentation'], signals: ['Social Sciences & Business Management', 'Corporate R&D', "Master's Degree", 'Online/Hybrid'] },
    { id: 'study-humanities', title: 'Humanities Researcher', description: 'Investigate culture, literature, history, or society through rigorous research and publication.', skills: ['Critical Analysis', 'Archival Research', 'Academic Writing'], signals: ['Arts & Humanities', 'PhD / Doctorate', 'Professor/Researcher'] },
    { id: 'study-learning-design', title: 'Learning Experience Designer', description: 'Combine subject knowledge and digital tools to design effective educational programs and materials.', skills: ['Instructional Design', 'Content Strategy', 'Learning Technology'], signals: ['Arts & Humanities', 'Professional Certification / Diploma', 'Online/Hybrid'] },
  ],
  job: [
    { id: 'job-software', title: 'Software Engineer', description: 'Build and improve digital products in a technical team with clear opportunities to specialize and grow.', skills: ['Programming', 'System Design', 'Problem Solving'], signals: ['Technical & Analytical', 'Fully Remote', 'Startup/Medium Company', 'High Growth / High Intensity'] },
    { id: 'job-data', title: 'Data Analyst', description: 'Turn business data into dashboards, insights, and recommendations for structured organizations.', skills: ['SQL', 'Statistics', 'Data Visualization'], signals: ['Technical & Analytical', 'Multinational Corporation', 'Hybrid', 'Strict 9-to-5'] },
    { id: 'job-ux', title: 'UX Designer', description: 'Research users and design useful digital experiences in a collaborative creative environment.', skills: ['User Research', 'Prototyping', 'Visual Design'], signals: ['Creative & Design', 'Fully Remote', 'Startup/Medium Company', 'Flexible Hours'] },
    { id: 'job-marketing', title: 'Digital Marketing Strategist', description: 'Plan creative campaigns, measure performance, and grow brands across digital channels.', skills: ['Campaign Strategy', 'Content', 'Analytics'], signals: ['Creative & Design', 'Multinational Corporation', 'Hybrid', 'High Growth / High Intensity'] },
    { id: 'job-product', title: 'Product Manager', description: 'Guide cross-functional teams from customer problem to product delivery and measurable outcomes.', skills: ['Product Strategy', 'Communication', 'Prioritization'], signals: ['Management & Operations', 'Startup/Medium Company', 'Hybrid', 'High Growth / High Intensity'] },
    { id: 'job-operations', title: 'Operations Manager', description: 'Improve processes, coordinate teams, and deliver reliable results in a structured organization.', skills: ['Process Improvement', 'Leadership', 'Planning'], signals: ['Management & Operations', 'Multinational Corporation', 'On-site', 'Strict 9-to-5'] },
    { id: 'job-public-program', title: 'Public Sector Program Officer', description: 'Coordinate public programs and services where stability, accountability, and social impact matter.', skills: ['Program Coordination', 'Reporting', 'Public Service'], signals: ['Government/Public Sector', 'On-site', 'Strict 9-to-5', 'Management & Operations'] },
  ],
  entrepreneurship: [
    { id: 'venture-saas', title: 'SaaS Startup Founder', description: 'Build a scalable software product around a validated customer problem and recurring revenue model.', skills: ['Product Development', 'Customer Discovery', 'Fundraising'], signals: ['Tech Startup', 'Product & Tech Builder', 'External Funding', 'Wealth Creation'] },
    { id: 'venture-tech-consulting', title: 'Independent Technology Consultant', description: 'Use technical expertise to solve client problems through a lean, service-based business.', skills: ['Technical Delivery', 'Consulting', 'Client Management'], signals: ['Tech Startup', 'Service Agency', 'Product & Tech Builder', 'Bootstrapping', 'Lifestyle & Autonomy'] },
    { id: 'venture-agency', title: 'Creative Agency Founder', description: 'Build a client-service business around design, marketing, content, or digital delivery.', skills: ['Sales', 'Creative Direction', 'Project Management'], signals: ['Service Agency', 'Sales & Marketing', 'Bootstrapping', 'Creative/Intellectual Control'] },
    { id: 'venture-ecommerce', title: 'E-commerce Brand Founder', description: 'Develop, market, and sell a focused product line through online and offline channels.', skills: ['E-commerce', 'Brand Marketing', 'Supply Chain'], signals: ['E-commerce/Physical Products', 'Sales & Marketing', 'Crowdfunding/Pre-sales', 'Wealth Creation'] },
    { id: 'venture-ops-consulting', title: 'Operations Consultancy Founder', description: 'Help growing organizations improve finance, operations, and strategy through specialized advisory services.', skills: ['Operations', 'Finance', 'Business Strategy'], signals: ['Service Agency', 'Operations & Finance', 'Bootstrapping', 'Lifestyle & Autonomy'] },
    { id: 'venture-product-brand', title: 'Consumer Product Founder', description: 'Create a differentiated physical product and build a repeatable business around customer demand.', skills: ['Product Development', 'Market Validation', 'Financial Planning'], signals: ['E-commerce/Physical Products', 'Operations & Finance', 'Crowdfunding/Pre-sales', 'Creative/Intellectual Control'] },
  ],
}

export function recommendFromCareerAssessment(
  assessment: SectorAssessmentPayload,
  limit = 5
): CareerAssessmentRecommendation[] {
  const pool = candidates[assessment.sector] || candidates.job
  const answerWeights: Record<string, number[]> = {
    higher_studies: [1, 4, 1, 3],
    job: [1, 4, 1, 1],
    entrepreneurship: [4, 3, 1, 1],
  }
  const selectedSignals = new Map<string, number>()
  ;(assessment.sectorAnswers || []).forEach((answer, index) => {
    const weight = answerWeights[assessment.sector]?.[index] || 1
    for (const signal of [answer.value, answer.answer]) {
      if (typeof signal === 'string' && signal.length > 0) {
        selectedSignals.set(signal, weight)
      }
    }
  })
  const profileSignals = [
    ...(assessment.profile?.favoriteSubjects || []),
    ...(assessment.profile?.interests || []),
    ...(assessment.profile?.skills || []),
    assessment.profile?.goal,
    assessment.profile?.workStyle,
    assessment.profile?.workEnvironment,
    ...(assessment.gameResults?.strengths || []),
  ].filter((signal): signal is string => typeof signal === 'string' && signal.length > 0)
  for (const signal of profileSignals) {
    selectedSignals.set(signal, Math.max(selectedSignals.get(signal) || 0, 2))
  }

  return pool
    .map((candidate, originalIndex) => ({
      candidate,
      originalIndex,
      score: candidate.signals.reduce(
        (total, signal) => total + (selectedSignals.get(signal) || 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
    .slice(0, limit)
    .map(({ candidate }) => ({
      id: candidate.id,
      title: candidate.title,
      description: candidate.description,
      skills: candidate.skills,
    }))
}
