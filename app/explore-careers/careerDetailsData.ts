export interface CareerDetail {
  id: string;
  title: string;
  category: string;
  matchRate?: number;
  demand: string;
  growth: string;
  salary: string;
  remote: string;
  degree: string;
  experience: string;
  about: string;
  keyResponsibilities: string[];
  dayInTheLife: { time: string; task: string }[];
  topSkills: { level: 'Beginner' | 'Intermediate' | 'Advanced'; list: string[] }[];
  skillsDetail: { category: string; skills: string[] }[];
  roadmap: { step: string; title: string; description: string }[];
  resources: { title: string; type: string; url: string; provider: string }[];
  similarCareers: string[]; // career IDs
}

export const careerDetails: Record<string, CareerDetail> = {
  c1: {
    id: "c1",
    title: "Software Engineer",
    category: "job",
    demand: "High",
    growth: "25%",
    salary: "$85,000 - $140,000",
    remote: "Yes",
    degree: "Bachelor's",
    experience: "Entry to Senior",
    about: "Software engineers apply engineering principles to design, develop, test, and deploy software solutions. They write clean, maintainable code, work with cross-functional teams, and solve complex algorithms to power the modern digital world.",
    keyResponsibilities: [
      "Build scalable and reliable web applications",
      "Solve complex logical problems with performant code",
      "Collaborate with product and design teams to refine requirements",
      "Continuously learn new frameworks and technologies"
    ],
    dayInTheLife: [
      { time: "9:00 AM", task: "Team stand-up meeting and progress alignment" },
      { time: "10:00 AM", task: "Writing clean code and core feature development" },
      { time: "1:00 PM", task: "Lunch break and informal team catch-up" },
      { time: "2:00 PM", task: "Pull request reviews, bug tracking, and debugging" },
      { time: "4:00 PM", task: "Testing pipelines, deployment checks, and local optimization" },
      { time: "6:00 PM", task: "Plan for tomorrow and wrap up the workday" }
    ],
    topSkills: [
      { level: "Beginner", list: ["HTML, CSS, JavaScript", "Basic Git & GitHub", "Problem Solving"] },
      { level: "Intermediate", list: ["React.js / Next.js", "Node.js & Express", "Relational & NoSQL Databases"] },
      { level: "Advanced", list: ["System Design & Architecture", "Cloud Infrastructure (AWS/GCP)", "DevOps & CI/CD Pipelines"] }
    ],
    skillsDetail: [
      { category: "Frontend", skills: ["React", "TypeScript", "Tailwind CSS", "Next.js", "State Management"] },
      { category: "Backend", skills: ["Node.js", "Python / Go", "RESTful & GraphQL APIs", "Microservices"] },
      { category: "Data & Storage", skills: ["PostgreSQL", "MongoDB", "Redis", "Database Query Optimization"] },
      { category: "Tools & DevOps", skills: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Testing (Jest/Cypress)"] }
    ],
    roadmap: [
      { step: "Step 1", title: "Learn the Fundamentals", description: "Master HTML, CSS, JavaScript, and Git. Understand basic data structures and algorithms." },
      { step: "Step 2", title: "Specialize in Stack", description: "Pick a track (Frontend, Backend, or Fullstack). Learn React or Node.js. Build real-world projects." },
      { step: "Step 3", title: "Database & API Design", description: "Learn database modeling, SQL/NoSQL queries, and how to write secure, optimized server interfaces." },
      { step: "Step 4", title: "Architecture & DevOps", description: "Learn software design patterns, system scaling, Docker containers, and CI/CD automated deployments." }
    ],
    resources: [
      { title: "Full Stack Open", type: "Course", url: "https://fullstackopen.com/", provider: "University of Helsinki" },
      { title: "System Design Primer", type: "Repo/Book", url: "https://github.com/donnemartin/system-design-primer", provider: "GitHub Community" },
      { title: "JavaScript: The Definitive Guide", type: "Book", url: "#", provider: "O'Reilly Media" }
    ],
    similarCareers: ["c2", "c3"]
  },
  c2: {
    id: "c2",
    title: "Data Scientist",
    category: "job",
    demand: "High",
    growth: "36%",
    salary: "$90,000 - $155,000",
    remote: "Yes",
    degree: "Bachelor's/Master's",
    experience: "Mid to Senior",
    about: "Data Scientists use scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data. They apply machine learning models to make predictions and support evidence-based business decisions.",
    keyResponsibilities: [
      "Clean, analyze, and visualize complex data sets",
      "Build, evaluate, and deploy predictive machine learning models",
      "A/B testing, experimentation, and hypothesis verification",
      "Translate business questions into data-driven analytical strategies"
    ],
    dayInTheLife: [
      { time: "9:30 AM", task: "Standup with product team and analytics review" },
      { time: "10:30 AM", task: "Data cleaning, ETL pipeline checks, and SQL scripting" },
      { time: "1:00 PM", task: "Lunch and reading latest research papers" },
      { time: "2:00 PM", task: "Training machine learning models in Jupyter Notebooks" },
      { time: "4:30 PM", task: "Visualizing insights and creating reports for stakeholders" },
      { time: "5:30 PM", task: "Documenting code and preparing experiments for run overnight" }
    ],
    topSkills: [
      { level: "Beginner", list: ["Python programming", "SQL queries", "Basic Probability & Stats"] },
      { level: "Intermediate", list: ["Pandas & NumPy", "Scikit-Learn", "Data Visualization (Tableau/Matplotlib)"] },
      { level: "Advanced", list: ["Deep Learning (TensorFlow/PyTorch)", "Big Data (Spark/Hadoop)", "MLOps & Model Deployment"] }
    ],
    skillsDetail: [
      { category: "Languages", skills: ["Python", "SQL", "R", "Bash"] },
      { category: "Libraries", skills: ["Pandas", "NumPy", "Scikit-Learn", "SciPy", "Seaborn"] },
      { category: "ML & Deep Learning", skills: ["Supervised/Unsupervised Learning", "NLP", "Neural Networks", "PyTorch"] },
      { category: "Tools & Platforms", skills: ["Jupyter", "Databricks", "Tableau", "Git", "Docker"] }
    ],
    roadmap: [
      { step: "Step 1", title: "Math & Programming Basics", description: "Learn Python syntax, essential SQL commands, and review statistics (probabilities, regressions, linear algebra)." },
      { step: "Step 2", title: "Data Wrangling & Exploration", description: "Master libraries like Pandas. Learn how to clean messy datasets, handle missing values, and visualize data trends." },
      { step: "Step 3", title: "Machine Learning Foundations", description: "Understand regression, classification, clustering, cross-validation, and model evaluation metrics." },
      { step: "Step 4", title: "Big Data & Production", description: "Learn to handle large datasets using Spark, understand cloud ML platforms, and learn basic MLOps." }
    ],
    resources: [
      { title: "Machine Learning Specialization", type: "Course", url: "https://www.coursera.org/specializations/machine-learning-introduction", provider: "Andrew Ng / Stanford" },
      { title: "Kaggle Micro-courses", type: "Interactive", url: "https://www.kaggle.com/learn", provider: "Kaggle" },
      { title: "Python for Data Analysis", type: "Book", url: "#", provider: "Wes McKinney" }
    ],
    similarCareers: ["c1", "c5"]
  },
  c3: {
    id: "c3",
    title: "DevOps Engineer",
    category: "job",
    demand: "Very High",
    growth: "21%",
    salary: "$95,000 - $150,000",
    remote: "Yes",
    degree: "Bachelor's",
    experience: "Mid to Lead",
    about: "DevOps Engineers bridge the gap between software development and IT operations. They design, build, and maintain automated deployment pipelines, cloud infrastructure, and monitoring systems to ensure reliability, speed, and security.",
    keyResponsibilities: [
      "Automate application deployments and infrastructure scaling",
      "Manage containerized applications and orchestrators (Kubernetes)",
      "Set up comprehensive monitoring, logging, and alerting systems",
      "Enforce security configurations and secret management across environments"
    ],
    dayInTheLife: [
      { time: "9:00 AM", task: "Checking system status alerts, slack channels, and email" },
      { time: "9:30 AM", task: "Daily sync and task priority check" },
      { time: "10:00 AM", task: "Writing Infrastructure as Code (Terraform) templates" },
      { time: "1:00 PM", task: "Lunch and learning about new security compliance standards" },
      { time: "2:00 PM", task: "Debugging CI/CD pipeline failures and helper scripts" },
      { time: "4:00 PM", task: "Setting up Prometheus metrics and Grafana dashboard alerts" },
      { time: "5:30 PM", task: "Post-mortem review of recent minor outages and wrap up" }
    ],
    topSkills: [
      { level: "Beginner", list: ["Linux & Bash Scripting", "Git Workflow", "Basic Networking (TCP/IP)"] },
      { level: "Intermediate", list: ["Docker Containers", "CI/CD tools (GitHub Actions, Jenkins)", "Cloud Platforms (AWS)"] },
      { level: "Advanced", list: ["Kubernetes orchestration", "Terraform (IaC)", "Monitoring (Prometheus/Grafana)"] }
    ],
    skillsDetail: [
      { category: "Scripting & Code", skills: ["Bash", "Python", "Go", "YAML / JSON"] },
      { category: "Infrastructure", skills: ["Terraform", "AWS (EC2, S3, RDS, VPC)", "Ansible", "Linux Administration"] },
      { category: "Containers", skills: ["Docker", "Kubernetes", "Helm Charts", "Container Registry"] },
      { category: "CI/CD & Ops", skills: ["GitHub Actions", "GitLab CI", "Prometheus", "Grafana", "ELK Stack"] }
    ],
    roadmap: [
      { step: "Step 1", title: "Linux & Networking", description: "Understand Linux administration, shell commands, file systems, permissions, SSH, DNS, and networking basics." },
      { step: "Step 2", title: "Containerization", description: "Learn Docker. Understand how to package apps, manage environment variables, and map local volumes." },
      { step: "Step 3", title: "CI/CD & Cloud Providers", description: "Learn AWS core services and build automated delivery pipelines using GitHub Actions to deploy basic apps." },
      { step: "Step 4", title: "Infrastructure as Code & Orchestration", description: "Master Terraform for infrastructure automation and Kubernetes for running multi-container deployments." }
    ],
    resources: [
      { title: "DevOps Roadmap", type: "Interactive", url: "https://roadmap.sh/devops", provider: "Roadmap.sh" },
      { title: "Kubernetes Tutorial for Beginners", type: "Course", url: "#", provider: "TechWorld with Nana" },
      { title: "Terraform Up & Running", type: "Book", url: "#", provider: "Yevgeniy Brikman" }
    ],
    similarCareers: ["c1", "c2"]
  },
  c4: {
    id: "c4",
    title: "UX Designer",
    category: "higher_study",
    demand: "High",
    growth: "18%",
    salary: "$75,000 - $125,000",
    remote: "Yes",
    degree: "Bachelor's/Certificate",
    experience: "Entry to Senior",
    about: "UX (User Experience) Designers focus on the usability, accessibility, and pleasure provided in the interaction between the user and the product. They conduct user research, design wireframes and prototypes, and validate layouts with real users.",
    keyResponsibilities: [
      "Conduct user research, interviews, and synthesize feedback",
      "Create user personas, journey maps, and information architecture",
      "Design low and high-fidelity wireframes and interactive prototypes",
      "Run usability tests and iterate designs based on quantitative metrics"
    ],
    dayInTheLife: [
      { time: "9:30 AM", task: "Reviewing feedback from yesterday's user test sessions" },
      { time: "10:30 AM", task: "Collaborative brainstorming and wireframing in Figma" },
      { time: "1:00 PM", task: "Lunch and sketching creative UI layout patterns" },
      { time: "2:00 PM", task: "Creating high-fidelity mockups and interactive flows" },
      { time: "4:00 PM", task: "Design handoff sync with developers to verify feasibility" },
      { time: "5:30 PM", task: "Cleaning up typography and design system variables" }
    ],
    topSkills: [
      { level: "Beginner", list: ["Figma & UI Tools", "Design Principles (Layout, Color)", "Empathy & Active Listening"] },
      { level: "Intermediate", list: ["Wireframing & Prototyping", "User Research Methods", "Information Architecture"] },
      { level: "Advanced", list: ["Usability Testing", "Design Systems Creation", "HCI & Cognitive Psychology"] }
    ],
    skillsDetail: [
      { category: "Visual Design", skills: ["Typography", "Color Theory", "Layout & Grid System", "UI Kits"] },
      { category: "Interaction", skills: ["Figma Prototyping", "Micro-interactions", "User Flows", "Wireframing"] },
      { category: "Research", skills: ["User Interviews", "Survey Design", "A/B Testing", "Persona Building"] },
      { category: "Soft Skills", skills: ["Developer Handoff", "Stakeholder Presentation", "Collaboration"] }
    ],
    roadmap: [
      { step: "Step 1", title: "Master Design Fundamentals", description: "Study UI design basics: spacing, visual hierarchy, typography, colors. Practice replicating beautiful existing UIs." },
      { step: "Step 2", title: "Learn Figma and Layouts", description: "Become an expert in Figma tools, auto-layout, components, variants, and responsive layouts." },
      { step: "Step 3", title: "Study User Research", description: "Understand user testing, interviews, card sorting, personas, and how to define a user's emotional map." },
      { step: "Step 4", title: "Build a Portfolio & Systems", description: "Work on case studies explaining your research, design iterations, and end result. Learn to build design systems." }
    ],
    resources: [
      { title: "Google UX Design Professional Certificate", type: "Course", url: "https://www.coursera.org/professional-certificates/google-ux-design", provider: "Google on Coursera" },
      { title: "Don't Make Me Think", type: "Book", url: "#", provider: "Steve Krug" },
      { title: "The Design of Everyday Things", type: "Book", url: "#", provider: "Don Norman" }
    ],
    similarCareers: ["c1", "c5"]
  },
  c5: {
    id: "c5",
    title: "Startup Founder (Tech)",
    category: "entrepreneurship",
    demand: "Dynamic",
    growth: "Highly Variable",
    salary: "$50,000 - Equity-based",
    remote: "Yes",
    degree: "None Required",
    experience: "Founding Experience",
    about: "Tech Startup Founders identify major market inefficiencies, validate product-market fit, design a solution vision, recruit core teams, raise venture capital, and build the systems and structures necessary to scale the business.",
    keyResponsibilities: [
      "Define company vision, strategic priorities, and product roadmap",
      "Pitch to angel investors, venture capitalists, and negotiate terms",
      "Recruit, align, and retain top engineering and sales talents",
      "Analyze unit economics, cash flow runways, and drive customer acquisition"
    ],
    dayInTheLife: [
      { time: "8:00 AM", task: "Reading customer support tickets and analyzing sales pipeline" },
      { time: "9:00 AM", task: "All-hands standup: alignment, roadblocks, and goals sync" },
      { time: "10:00 AM", task: "Pitch meetings with potential investors and VC advisors" },
      { time: "12:30 PM", task: "Quick lunch with a potential hire candidate" },
      { time: "1:30 PM", task: "Product design alignment and user testing review" },
      { time: "3:30 PM", task: "Sales demo calls or marketing campaign analysis" },
      { time: "6:00 PM", task: "Financial modeling, runway planning, and emails" }
    ],
    topSkills: [
      { level: "Beginner", list: ["Market Research & Validation", "MVP Building", "Communication & Copywriting"] },
      { level: "Intermediate", list: ["Product Management", "Growth Hacking & Marketing", "Recruiting & Team Alignment"] },
      { level: "Advanced", list: ["Venture Capital Fundraising", "Financial Modeling", "Strategic Leadership"] }
    ],
    skillsDetail: [
      { category: "Business & Strategy", skills: ["Business Model Canvas", "Unit Economics", "Legal & Scaling Structures", "Fundraising"] },
      { category: "Product & Growth", skills: ["No-Code MVPs", "User Analytics", "SEO & Cold Outreach", "Product Specs"] },
      { category: "Leadership", skills: ["Public Speaking", "Negotiation", "Crisis Management", "Vision Alignment"] }
    ],
    roadmap: [
      { step: "Step 1", title: "Problem Identification", description: "Find a painful, common problem in a growing market. Interview 30+ prospective customers to validate if it is a priority." },
      { step: "Step 2", title: "Build an MVP", description: "Design a minimal solution using no-code tools or simple code. Get your first 5-10 paying users." },
      { step: "Step 3", title: "Acquire & Refine", description: "Iterate product features based on analytics. Find repeatable sales channels and achieve early retention metrics." },
      { step: "Step 4", title: "Fundraising & Team", description: "Build a pitch deck. Raise pre-seed capital, hire your first core engineers, and start formal operations." }
    ],
    resources: [
      { title: "Y Combinator Startup School", type: "Course", url: "https://www.startupschool.org/", provider: "Y Combinator" },
      { title: "The Lean Startup", type: "Book", url: "#", provider: "Eric Ries" },
      { title: "Zero to One", type: "Book", url: "#", provider: "Peter Thiel" }
    ],
    similarCareers: ["c1", "c4"]
  }
};
