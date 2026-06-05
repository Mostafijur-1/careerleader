"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageToggle from "../components/LanguageToggle"
import AuthModal from "../components/AuthModal"

// Predefined career details
import { careerDetails } from "../explore-careers/careerDetailsData"

// Custom SVGs
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
    </svg>
  )
}

function AssessmentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function MentorsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  )
}

function GoalsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function RoadmapIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function ResourcesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

interface Goal {
  title: string
  targetDate: string
  skillLevel: string
  whyImportant?: string
  focusAreas?: string[]
}

interface Phase {
  title: string
  duration: string
  tasks: string[]
  colorClass: string
  borderColorClass: string
}

// Predefined detailed descriptions for tasks shown on the "Up Next" panel
const taskDescriptions: Record<string, string> = {
  // Software Engineer
  "Learn Programming Basics": "Learn programming fundamentals, variables, loops, conditions, and functions in JavaScript or Python.",
  "Learn Git & GitHub": "Master version control, repository creation, commits, branching, merging, and collaboration on GitHub.",
  "Build Small Projects": "Build simple interactive apps like a calculator, todo list, or weather tracker to apply coding basics.",
  "Data Structures & Algorithms": "Study arrays, linked lists, trees, search algorithms, sorting, and time complexity (Big O).",
  "Learn React": "Learn React components, props, state, hooks, and single-page routing.",
  "Build Real-world Projects": "Create a fully functional fullstack web app or dynamic site with frontend and database integration.",
  "Node.js & Databases": "Build server side APIs using Express and store data in SQL/NoSQL databases like PostgreSQL or MongoDB.",
  "System Design": "Understand horizontal scaling, caching, load balancers, rate limiting, and system availability.",
  "Cloud & DevOps Basics": "Learn Docker containment, deploy apps to AWS/Vercel, and configure automated GitHub Actions CI/CD.",
  "Build Portfolio": "Publish your projects, write a clean readme for each, and design your personal developer portfolio site.",
  "Apply for Internships": "Optimize your resume, LinkedIn profile, and submit applications to junior software engineer positions.",
  "Prepare for Interviews": "Practice coding challenges on LeetCode/HackerRank and participate in behavioral mock interviews.",

  // Data Scientist
  "Python & SQL Basics": "Master basic scripting, lists, loops, dictionary objects, and basic SQL SELECT queries.",
  "Linear Algebra & Statistics": "Study probability, statistical tests, regression models, matrices, and distributions.",
  "Data Gathering & APIs": "Learn to fetch dataset information using REST APIs, web scraping, and CSV/JSON ingestion.",
  "Pandas & NumPy Data Wrangling": "Clean messy datasets, handle missing inputs, group variables, and perform matrix calculations.",
  "Data Visualization (Tableau/Matplotlib)": "Build explanatory charts, graphs, histograms, and interactive dashboards to display findings.",
  "Exploratory Data Analysis": "Analyze statistical correlations, distributions, and outliers to discover patterns in raw data.",
  "Scikit-Learn Machine Learning": "Train regression models, decision trees, random forests, and learn to split test/train sets.",
  "Neural Networks & PyTorch": "Build basic deep learning models, activation functions, and feed-forward neural layers.",
  "Feature Engineering & A/B Testing": "Select/scale features, set up controlled experiments, and calculate statistical significance.",
  "MLOps & Model Deployment": "Deploy trained machine learning models as web APIs using Flask, FastAPI, or cloud functions.",
  "Build Data Portfolios": "Write clean Jupyter notebooks with clear markdown text explanations and publish them on GitHub.",
  "Kaggle Competitions & Mock Interviews": "Compete in live data competitions and practice explaining ML theory in mock technical interviews.",

  // DevOps
  "Linux Admin & Bash Scripting": "Learn command line navigation, file permissions, shell scripting, cron jobs, and SSH keys.",
  "Networking & Security Basics": "Study TCP/IP protocols, DNS configurations, subnets, firewalls, and SSL/TLS certificates.",
  "Git Workflows & Version Control": "Master advanced git features: rebasing, stashing, tag names, and pull request workflows.",
  "Docker Containerization": "Write Dockerfiles, package microservices, and manage docker-compose environments.",
  "AWS Cloud Essentials": "Launch EC2 instances, manage S3 storage, configure RDS databases, and structure VPCs.",
  "CI/CD Automations (GitHub Actions)": "Build automated pipelines to run tests, build Docker containers, and trigger cloud releases.",
  "Kubernetes Orchestration": "Deploy pods, services, ingress configurations, configurations maps, and helm charts.",
  "Terraform Infrastructure as Code": "Write declarative configurations to spin up and tear down cloud assets automatically.",
  "Prometheus & Grafana Monitoring": "Track server CPU/Memory metrics, set up Slack alerts, and design visualization dashboards.",
  "System Scaling & High Availability": "Configure load balancers, auto-scaling groups, and multi-region failover protocols.",
  "Incident Response & Security Hardening": "Practice debugging live system issues and configure IAM roles with least-privilege security.",
  "Prepare DevOps Resume & Interviews": "List certifications, highlight automation projects, and practice systems design mock interviews.",

  // UX Designer
  "Design Principles & Typography": "Understand contrast, alignment, spacing, color psychology, and typography selection.",
  "Figma Fundamentals & Tooling": "Learn Figma layouts, vector paths, auto-layout constraints, components, and libraries.",
  "Active Listening & User Empathy": "Learn how to approach users, ask open-ended questions, and eliminate interviewer bias.",
  "Wireframing & Prototyping": "Draft low-fidelity sketches on paper and build interactive wireframes in Figma.",
  "User Research Methods": "Conduct card sorting, user interviews, and synthesize research findings into empathy maps.",
  "Information Architecture": "Define navigation hierarchies, site maps, user flows, and categorize product contents.",
  "Usability Testing & Iteration": "Observe users interacting with prototypes, log friction points, and refine designs.",
  "Design Systems Creation": "Build reusable UI components, color palettes, spacing variables, and design tokens.",
  "HCI & Cognitive Psychology": "Study Fitts's Law, Hick's Law, mental models, and accessibility guidelines (WCAG).",
  "Build Figma Portfolio": "Document 3 end-to-end case studies explaining your research, iterations, and final layouts.",
  "Developer Handoff Workflows": "Specify spacing, component states, redlines, and collaborate with engineers to code mockups.",
  "UX Internships & Portfolio Presentations": "Apply to design roles and practice presenting your case studies to hiring teams.",

  // Startup Founder
  "Market Validation & Interviews": "Find a problem, draft interviews, and talk to 30+ potential customers to test viability.",
  "MVP Concept & Prototyping": "Outline the smallest core solution value that satisfies early user requirements.",
  "Communication & Value Proposition": "Draft a clear, compelling elevator pitch and one-page marketing landing page.",
  "No-Code Development": "Build fully interactive product versions using tools like bubble.io, Glide, or Webflow.",
  "Customer Acquisition & SEO": "Optimize key landing pages and run organic outbound email campaigns.",
  "User Retention & Feedback Loops": "Establish analytics tracking, measure weekly usage, and iterate product features.",
  "Early Team Recruiting": "Identify co-founders, outline equity splits, and align core developers to build the product.",
  "Business Models & Unit Economics": "Determine pricing models, calculate customer acquisition cost (CAC), and customer lifetime value (LTV).",
  "Financial Runways & Budgeting": "Create cash flow templates and calculate monthly operational cash burn rates.",
  "Pitch Deck Design & Rehearsal": "Design a clean, 10-slide deck explaining problem, solution, market size, and team.",
  "Venture Capital Fundraising": "List target angel investors, obtain warm introductions, and practice pitches.",
  "Legal Incorporation & Launch": "Register the business entity, open corporate bank accounts, and launch the product publicly."
}

export default function RoadmapPage() {
  const { user } = useUser()
  const { lang, t } = useLanguage()
  const router = useRouter()

  const [isMounted, setIsMounted] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)

  // Goal data
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  
  // Completed tasks array
  const [completedTasks, setCompletedTasks] = useState<string[]>([])

  // Load Goal & completed states
  useEffect(() => {
    setIsMounted(true)
    
    if (user?.goal) {
      setActiveGoal(user.goal)
    } else {
      const savedGoal = localStorage.getItem("career_goal")
      if (savedGoal) {
        try {
          setActiveGoal(JSON.parse(savedGoal))
        } catch (e) {
          console.error("Error loading goal", e)
        }
      }
    }
    
    const savedCompleted = localStorage.getItem("roadmap_completed_tasks")
    if (savedCompleted) {
      try {
        setCompletedTasks(JSON.parse(savedCompleted))
      } catch (e) {
        console.error("Error loading completed tasks", e)
      }
    } else {
      // Default initial mock progress matching image (Phase 1 finished + 2 tasks in Phase 2 finished)
      // Phase 1 tasks: Learn Programming Basics, Learn Git & GitHub, Build Small Projects
      // Phase 2 tasks: Data Structures & Algorithms, Learn React, Build Real-world Projects
      // We complete: Phase 1 items (3) + DSA & React in Phase 2
      const defaults = [
        "Learn Programming Basics", 
        "Learn Git & GitHub", 
        "Build Small Projects",
        "Data Structures & Algorithms"
      ]
      setCompletedTasks(defaults)
      localStorage.setItem("roadmap_completed_tasks", JSON.stringify(defaults))
    }
  }, [user])

  // Roadmap generation matching active goal title
  const phases: Phase[] = useMemo(() => {
    if (!activeGoal) return []

    const title = activeGoal.title.toLowerCase()
    
    // Software Engineer
    if (title.includes("software") || title.includes("developer") || title.includes("engineer")) {
      return [
        {
          title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
          duration: "0 - 3 Months",
          colorClass: "bg-emerald-500",
          borderColorClass: "border-emerald-500",
          tasks: ["Learn Programming Basics", "Learn Git & GitHub", "Build Small Projects"]
        },
        {
          title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
          duration: "4 - 9 Months",
          colorClass: "bg-amber-500",
          borderColorClass: "border-amber-500",
          tasks: ["Data Structures & Algorithms", "Learn React", "Build Real-world Projects"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
          duration: "10 - 18 Months",
          colorClass: "bg-indigo-600",
          borderColorClass: "border-indigo-600",
          tasks: ["Node.js & Databases", "System Design", "Cloud & DevOps Basics"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
          duration: "19 - 24 Months",
          colorClass: "bg-blue-500",
          borderColorClass: "border-blue-500",
          tasks: ["Build Portfolio", "Apply for Internships", "Prepare for Interviews"]
        }
      ]
    }

    // Data Scientist
    if (title.includes("data") || title.includes("analytics") || title.includes("scientist")) {
      return [
        {
          title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
          duration: "0 - 3 Months",
          colorClass: "bg-emerald-500",
          borderColorClass: "border-emerald-500",
          tasks: ["Python & SQL Basics", "Linear Algebra & Statistics", "Data Gathering & APIs"]
        },
        {
          title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
          duration: "4 - 9 Months",
          colorClass: "bg-amber-500",
          borderColorClass: "border-amber-500",
          tasks: ["Pandas & NumPy Data Wrangling", "Data Visualization (Tableau/Matplotlib)", "Exploratory Data Analysis"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
          duration: "10 - 18 Months",
          colorClass: "bg-indigo-600",
          borderColorClass: "border-indigo-600",
          tasks: ["Scikit-Learn Machine Learning", "Neural Networks & PyTorch", "Feature Engineering & A/B Testing"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
          duration: "19 - 24 Months",
          colorClass: "bg-blue-500",
          borderColorClass: "border-blue-500",
          tasks: ["MLOps & Model Deployment", "Build Data Portfolios", "Kaggle Competitions & Mock Interviews"]
        }
      ]
    }

    // DevOps
    if (title.includes("devops") || title.includes("system") || title.includes("infrastructure")) {
      return [
        {
          title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
          duration: "0 - 3 Months",
          colorClass: "bg-emerald-500",
          borderColorClass: "border-emerald-500",
          tasks: ["Linux Admin & Bash Scripting", "Networking & Security Basics", "Git Workflows & Version Control"]
        },
        {
          title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
          duration: "4 - 9 Months",
          colorClass: "bg-amber-500",
          borderColorClass: "border-amber-500",
          tasks: ["Docker Containerization", "AWS Cloud Essentials", "CI/CD Automations (GitHub Actions)"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
          duration: "10 - 18 Months",
          colorClass: "bg-indigo-600",
          borderColorClass: "border-indigo-600",
          tasks: ["Kubernetes Orchestration", "Terraform Infrastructure as Code", "Prometheus & Grafana Monitoring"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
          duration: "19 - 24 Months",
          colorClass: "bg-blue-500",
          borderColorClass: "border-blue-500",
          tasks: ["System Scaling & High Availability", "Incident Response & Security Hardening", "Prepare DevOps Resume & Interviews"]
        }
      ]
    }

    // UX Designer
    if (title.includes("ux") || title.includes("design") || title.includes("ui")) {
      return [
        {
          title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
          duration: "0 - 3 Months",
          colorClass: "bg-emerald-500",
          borderColorClass: "border-emerald-500",
          tasks: ["Design Principles & Typography", "Figma Fundamentals & Tooling", "Active Listening & User Empathy"]
        },
        {
          title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
          duration: "4 - 9 Months",
          colorClass: "bg-amber-500",
          borderColorClass: "border-amber-500",
          tasks: ["Wireframing & Prototyping", "User Research Methods", "Information Architecture"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
          duration: "10 - 18 Months",
          colorClass: "bg-indigo-600",
          borderColorClass: "border-indigo-600",
          tasks: ["Usability Testing & Iteration", "Design Systems Creation", "HCI & Cognitive Psychology"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
          duration: "19 - 24 Months",
          colorClass: "bg-blue-500",
          borderColorClass: "border-blue-500",
          tasks: ["Build Figma Portfolio", "Developer Handoff Workflows", "UX Internships & Portfolio Presentations"]
        }
      ]
    }

    // Startup Founder
    if (title.includes("founder") || title.includes("ceo") || title.includes("startup") || title.includes("entrepreneur")) {
      return [
        {
          title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
          duration: "0 - 3 Months",
          colorClass: "bg-emerald-500",
          borderColorClass: "border-emerald-500",
          tasks: ["Market Validation & Interviews", "MVP Concept & Prototyping", "Communication & Value Proposition"]
        },
        {
          title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
          duration: "4 - 9 Months",
          colorClass: "bg-amber-500",
          borderColorClass: "border-amber-500",
          tasks: ["No-Code Development", "Customer Acquisition & SEO", "User Retention & Feedback Loops"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
          duration: "10 - 18 Months",
          colorClass: "bg-indigo-600",
          borderColorClass: "border-indigo-600",
          tasks: ["Early Team Recruiting", "Business Models & Unit Economics", "Financial Runways & Budgeting"]
        },
        {
          title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
          duration: "19 - 24 Months",
          colorClass: "bg-blue-500",
          borderColorClass: "border-blue-500",
          tasks: ["Pitch Deck Design & Rehearsal", "Venture Capital Fundraising", "Legal Incorporation & Launch"]
        }
      ]
    }

    // Custom fallback roadmap
    return [
      {
        title: lang === 'bn' ? "ফেজ ১: ফাউন্ডেশন" : "Phase 1: Foundation",
        duration: "0 - 3 Months",
        colorClass: "bg-emerald-500",
        borderColorClass: "border-emerald-500",
        tasks: ["Master Core Concepts", "Basic Tools & Frameworks", "Beginner Practical Projects"]
      },
      {
        title: lang === 'bn' ? "ফেজ ২: কোর স্কিলস" : "Phase 2: Core Skills",
        duration: "4 - 9 Months",
        colorClass: "bg-amber-500",
        borderColorClass: "border-amber-500",
        tasks: ["Intermediate Methodologies", "Core System Operations", "Real-world Applications"]
      },
      {
        title: lang === 'bn' ? "ফেজ ৩: অ্যাডভান্সড স্কিলস" : "Phase 3: Advanced Skills",
        duration: "10 - 18 Months",
        colorClass: "bg-indigo-600",
        borderColorClass: "border-indigo-600",
        tasks: ["Advanced Optimization & Design", "Industry Best Practices", "Collaborative Work & Scaling"]
      },
      {
        title: lang === 'bn' ? "ফেজ ৪: ক্যারিয়ার রেডি" : "Phase 4: Career Ready",
        duration: "19 - 24 Months",
        colorClass: "bg-blue-500",
        borderColorClass: "border-blue-500",
        tasks: ["Portfolio Completion", "Internship & Job Hunting", "Interview Drills & Final Launch"]
      }
    ]
  }, [activeGoal, lang])

  // Flat array of all tasks
  const allTasks = useMemo(() => {
    return phases.flatMap(p => p.tasks)
  }, [phases])

  // Completed Count
  const totalTasksCount = allTasks.length
  const completedCount = useMemo(() => {
    return allTasks.filter(t => completedTasks.includes(t)).length
  }, [allTasks, completedTasks])

  // Overall Progress Percentage
  const progressPercentage = useMemo(() => {
    if (totalTasksCount === 0) return 0
    return Math.round((completedCount / totalTasksCount) * 100)
  }, [completedCount, totalTasksCount])

  // Toggle task completion
  const handleToggleTask = (task: string) => {
    let updated: string[]
    if (completedTasks.includes(task)) {
      updated = completedTasks.filter(t => t !== task)
    } else {
      updated = [...completedTasks, task]
    }
    setCompletedTasks(updated)
    localStorage.setItem("roadmap_completed_tasks", JSON.stringify(updated))
  }

  // Find the "Up Next" task (the first incomplete task in sequential order)
  const upNextTask = useMemo(() => {
    return allTasks.find(t => !completedTasks.includes(t)) || null
  }, [allTasks, completedTasks])

  // Get description for up next task
  const upNextDesc = useMemo(() => {
    if (!upNextTask) return ""
    return taskDescriptions[upNextTask] || (lang === 'bn' ? "আপনার ক্যারিয়ার অগ্রগতির জন্য এই পরবর্তী পদক্ষেপটি অনুশীলন করুন।" : "Practice this next step to advance along your chosen career track.")
  }, [upNextTask, lang])

  // Check milestone completion status for the 4 phases
  const milestoneStatuses = useMemo(() => {
    const statuses: Array<"completed" | "in_progress" | "locked"> = []
    
    phases.forEach((phase, index) => {
      const allDone = phase.tasks.every(t => completedTasks.includes(t))
      const noneDone = phase.tasks.every(t => !completedTasks.includes(t))
      
      if (allDone) {
        statuses.push("completed")
      } else if (!noneDone || index === 0 || (index > 0 && statuses[index - 1] === "completed")) {
        statuses.push("in_progress")
      } else {
        statuses.push("locked")
      }
    })
    
    return statuses
  }, [phases, completedTasks])

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 antialiased font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20 shrink-0">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="text-2xl">🚀</div>
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CareerLeader</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <DashboardIcon />
            <span>{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</span>
          </Link>
          
          <Link href="/assessment" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <AssessmentIcon />
            <span>{lang === 'bn' ? "মূল্যায়ন" : "Assessment"}</span>
          </Link>

          <Link href="/explore-careers" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <ExploreIcon />
            <span>{lang === 'bn' ? "ক্যারিয়ার সমূহ" : "Explore Careers"}</span>
          </Link>

          <Link href="/mentors" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <MentorsIcon />
            <span>{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</span>
          </Link>

          <Link href="/goals" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <GoalsIcon />
            <span>{lang === 'bn' ? "লক্ষ্যসমূহ" : "Goals"}</span>
          </Link>

          <Link href="/roadmap" className="flex items-center gap-3.5 px-4 py-3 bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-3 rounded-xl font-semibold transition duration-200">
            <RoadmapIcon />
            <span>{lang === 'bn' ? "রোডম্যাপ" : "Roadmap"}</span>
          </Link>

          <Link href="/explore-careers" className="flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <ResourcesIcon />
            <span>{lang === 'bn' ? "শেখার সম্পদ" : "Resources"}</span>
          </Link>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium transition duration-200">
            <div className="flex items-center gap-3.5">
              <MessagesIcon />
              <span>{lang === 'bn' ? "বার্তা" : "Messages"}</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-md">3</span>
          </button>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium text-left transition duration-200">
            <ProfileIcon />
            <span>{lang === 'bn' ? "প্রোফাইল" : "Profile"}</span>
          </button>

          <button onClick={() => setIsPremiumModalOpen(true)} className="w-full flex items-center gap-3.5 px-4 py-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl font-medium text-left transition duration-200">
            <SettingsIcon />
            <span>{lang === 'bn' ? "সেটিংস" : "Settings"}</span>
          </button>
        </nav>

        {/* Upgrade Card at Bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-4 bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-800 text-white rounded-2xl relative overflow-hidden shadow-lg shadow-blue-100">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mb-3">
              <span className="text-lg">👑</span>
            </div>
            <h4 className="font-bold text-sm mb-1">{lang === 'bn' ? "প্রিমিয়াম আপডেট" : "Upgrade to Premium"}</h4>
            <p className="text-white/80 text-xs mb-4 leading-relaxed">
              {lang === 'bn' ? "উন্নত ফিচার এবং ব্যক্তিগত গাইডেন্স আনলক করুন।" : "Unlock advanced features and personalized guidance."}
            </p>
            <button 
              onClick={() => setIsPremiumModalOpen(true)}
              className="w-full bg-white text-indigo-700 font-bold py-2 rounded-xl text-xs shadow-md hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              {lang === 'bn' ? "এখনই আপডেট করুন" : "Upgrade Now"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. TOP HEADER */}
        <header className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="lg:hidden flex items-center gap-2.5 font-bold text-lg">
              <span className="text-2xl">🚀</span>
              <span className="text-slate-900">CareerLeader</span>
            </Link>

            {/* Breadcrumb path for desktop */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500 font-medium">
              <span>{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</span>
              <span>/</span>
              <span className="text-blue-600 font-semibold">{lang === 'bn' ? "ক্যারিয়ার রোডম্যাপ" : "Roadmap"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
              <Link href="/explore-careers" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
              <Link href="/mentors" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            </nav>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            
            <LanguageToggle />

            <div className="relative">
              <button 
                onClick={() => setIsPremiumModalOpen(true)}
                className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition duration-150 active:scale-95"
              >
                <BellIcon />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
            </div>

            {/* User Avatar */}
            <div className="relative shrink-0">
              {user ? (
                <button 
                  onClick={() => setIsPremiumModalOpen(true)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md hover:scale-105 transition active:scale-95"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-semibold flex items-center justify-center hover:bg-slate-200 hover:border-slate-300 transition active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 3. MOBILE MENU BAR */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-2.5 z-10">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ড্যাশবোর্ড" : "Dashboard"}</Link>
            <Link href="/assessment" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার মূল্যায়ন" : "Career Assessment"}</Link>
            <Link href="/explore-careers" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "ক্যারিয়ার অন্বেষণ" : "Explore Careers"}</Link>
            <Link href="/mentors" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "মেন্টরবৃন্দ" : "Mentors"}</Link>
            <Link href="/goals" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-medium rounded-lg">{lang === 'bn' ? "লক্ষ্যসমূহ" : "Goals"}</Link>
            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-blue-600 bg-blue-50 font-semibold rounded-lg">{lang === 'bn' ? "রোডম্যাপ" : "Roadmap"}</Link>
            <div className="h-px bg-slate-100 my-2"></div>
            <button 
              onClick={() => { setMobileMenuOpen(false); setIsPremiumModalOpen(true) }}
              className="w-full text-left px-4 py-2.5 text-amber-600 hover:bg-amber-50 font-bold rounded-lg flex items-center gap-2"
            >
              👑 {lang === 'bn' ? "প্রিমিয়াম আপডেট" : "Upgrade Premium"}
            </button>
          </div>
        )}

        {/* 4. MAIN PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-6xl mx-auto w-full">
          
          {!activeGoal ? (
            /* Empty State: No goal has been defined yet */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-xl mx-auto my-12 shadow-sm space-y-6">
              <span className="text-6xl block">🎯</span>
              <div className="space-y-2">
                <h3 className="font-extrabold text-xl text-slate-900">{lang === 'bn' ? "লক্ষ্য নির্ধারণ করা হয়নি" : "Define Your Goal First"}</h3>
                <p className="text-sm leading-relaxed">
                  {lang === 'bn' 
                    ? "একটি কাস্টম ক্যারিয়ার রোডম্যাপ তৈরি করার জন্য প্রথমে একটি লক্ষ্য সেট করুন।" 
                    : "Set a career goal to generate your personalized step-by-step roadmap."
                  }
                </p>
              </div>
              <button
                onClick={() => router.push("/goals")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer"
              >
                {lang === 'bn' ? "ক্যারিয়ার লক্ষ্য নির্ধারণ" : "Set Career Goal"}
              </button>
            </div>
          ) : (
            /* Roadmap Active State */
            <div className="space-y-8">
              
              {/* Header details block */}
              <div className="text-left space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {lang === 'bn' ? "আপনার ক্যারিয়ার রোডম্যাপ" : "Your Career Roadmap"}
                </h1>
                <p className="text-slate-500 text-sm">
                  {lang === 'bn' 
                    ? `আপনার লক্ষ্য '${activeGoal.title}' অর্জনের জন্য ব্যক্তিগতকৃত রোডম্যাপ।` 
                    : `Personalized roadmap to achieve your goal: "${activeGoal.title}".`
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Timeline Panel (2/3 width) */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs text-left relative">
                  
                  {/* Timeline vertical path */}
                  <div className="space-y-10 relative">
                    
                    {/* The vertical connector line */}
                    <div className="absolute left-4.5 top-6 bottom-6 w-0.5 bg-slate-200 z-0"></div>

                    {phases.map((phase, phaseIdx) => {
                      const phaseCompletedCount = phase.tasks.filter(t => completedTasks.includes(t)).length
                      const phaseTotalCount = phase.tasks.length
                      const isPhaseCompleted = phaseCompletedCount === phaseTotalCount
                      
                      return (
                        <div key={phaseIdx} className="flex gap-6 relative z-10 group">
                          
                          {/* Circle marker on timeline */}
                          <div className="relative shrink-0">
                            <div className={`w-9 h-9 rounded-full ${isPhaseCompleted ? 'bg-emerald-500' : phase.colorClass} text-white flex items-center justify-center font-bold text-sm shadow-md border-4 border-white transition-all duration-300`}>
                              {isPhaseCompleted ? "✓" : phaseIdx + 1}
                            </div>
                          </div>

                          {/* Phase details */}
                          <div className="flex-1 space-y-4">
                            
                            {/* Phase Title, Period & Progress Ratio badge */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                                  {phase.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold">{phase.duration}</p>
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider transition ${
                                isPhaseCompleted 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : phaseCompletedCount > 0
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-slate-50 text-slate-400 border-slate-100"
                              }`}>
                                {phaseCompletedCount}/{phaseTotalCount}
                              </span>
                            </div>

                            {/* Task List checkboxes */}
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 space-y-3">
                              {phase.tasks.map((task) => {
                                const isTaskDone = completedTasks.includes(task)
                                return (
                                  <label 
                                    key={task}
                                    className="flex items-start gap-3.5 p-2 rounded-xl hover:bg-white transition cursor-pointer select-none"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isTaskDone}
                                      onChange={() => handleToggleTask(task)}
                                      className="sr-only"
                                    />
                                    
                                    {/* Custom Checkbox design */}
                                    <div className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all ${
                                      isTaskDone
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "border-slate-300 bg-white hover:border-slate-400"
                                    }`}>
                                      {isTaskDone && (
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>

                                    <div className="space-y-0.5 min-w-0">
                                      <span className={`text-xs font-semibold leading-relaxed transition ${
                                        isTaskDone ? "text-slate-400 line-through font-normal" : "text-slate-700"
                                      }`}>
                                        {task}
                                      </span>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>

                          </div>
                        </div>
                      )
                    })}

                  </div>

                  {/* Bottom encouraging quote banner */}
                  <div className="mt-12 p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 text-xs font-black shadow-2xs">
                    <span>🚀</span>
                    <span>{lang === 'bn' ? "এগিয়ে যান! আপনি খুব ভালো করছেন।" : "Keep going! You're doing great."}</span>
                  </div>

                </div>

                {/* Right Progress Dashboard (1/3 width) */}
                <div className="space-y-6 text-left h-fit lg:sticky lg:top-24">
                  
                  {/* Overall Progress Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'bn' ? "সামগ্রিক অগ্রগতি" : "Overall Progress"}
                    </h2>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-800 font-extrabold text-sm">
                        <span>{completedCount} / {totalTasksCount} {lang === 'bn' ? "সম্পন্ন" : "Tasks"}</span>
                        <span className="text-indigo-600 text-base">{progressPercentage}%</span>
                      </div>
                      
                      {/* Progress bar track */}
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* "Up Next" Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                    
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'bn' ? "পরবর্তী পদক্ষেপ" : "Up Next"}
                    </h2>

                    {upNextTask ? (
                      <div className="space-y-4 relative">
                        <div className="space-y-1">
                          <h3 className="font-black text-slate-900 text-base leading-tight">
                            {upNextTask}
                          </h3>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            {upNextDesc}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleToggleTask(upNextTask)}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 text-center cursor-pointer"
                        >
                          {lang === 'bn' ? "সম্পন্ন করুন" : "Continue"}
                        </button>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 text-xs italic">
                        🎉 {lang === 'bn' ? "অভিনন্দন! আপনি রোডম্যাপের সব কাজ সম্পন্ন করেছেন!" : "Congratulations! You completed all tasks in this roadmap!"}
                      </div>
                    )}
                  </div>

                  {/* Milestones Card */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {lang === 'bn' ? "মাইলেটোনসমূহ" : "Milestones"}
                    </h2>

                    <div className="space-y-4.5">
                      {phases.map((phase, idx) => {
                        const status = milestoneStatuses[idx]
                        
                        return (
                          <div key={idx} className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-3">
                              {/* Icon indicator */}
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                                status === "completed"
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                  : status === "in_progress"
                                    ? "bg-amber-50 border-amber-100 text-amber-600"
                                    : "bg-slate-50 border-slate-100 text-slate-300"
                              }`}>
                                {status === "completed" ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : status === "in_progress" ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                )}
                              </div>

                              <span className={status === "locked" ? "text-slate-400 font-medium" : "text-slate-700"}>
                                {phase.title.replace(/^Phase \d+:\s*|^ফেজ \d+:\s*/i, "")}
                              </span>
                            </div>

                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                              status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "in_progress"
                                  ? "bg-amber-50 text-amber-700 animate-pulse"
                                  : "bg-slate-100 text-slate-400"
                            }`}>
                              {status === "completed" 
                                ? (lang === 'bn' ? "সম্পন্ন" : "Completed")
                                : status === "in_progress"
                                  ? (lang === 'bn' ? "চলমান" : "In Progress")
                                  : (lang === 'bn' ? "লকড" : "Locked")
                              }
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reset Roadmap options */}
                  <div className="flex justify-center pt-2">
                    <button 
                      onClick={() => {
                        if (confirm(lang === 'bn' ? "আপনি কি রোডম্যাপের অগ্রগতি রিসেট করতে চান?" : "Are you sure you want to reset your roadmap progress?")) {
                          setCompletedTasks([])
                          localStorage.setItem("roadmap_completed_tasks", JSON.stringify([]))
                        }
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition cursor-pointer"
                    >
                      {lang === 'bn' ? "রোডম্যাপ প্রোগ্রেস রিসেট করুন" : "Reset Roadmap Progress"}
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Auth Modal pop-up */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

    </div>
  )
}
