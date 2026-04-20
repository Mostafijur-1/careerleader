/** Site-wide UI copy: English & Bangla (বাংলা) */
export type SiteLang = "en" | "bn"

export const SITE_LANG_STORAGE_KEY = "careerleader_lang"

export type SiteMessages = {
  common: {
    language: string
    english: string
    bangla: string
    guest: string
    loading: string
  }
  nav: {
    home: string
    exploreCareers: string
    mentors: string
    admin: string
    mentorInbox: string
    toggleMenu: string
    msgNotifications: string
    noNewNotifications: string
  }
  home: {
    welcomeBadge: string
    heroTitleBefore: string
    heroTitleHighlight: string
    heroTitleAfter: string
    heroSub: string
    ctaAssessment: string
    hello: (name: string) => string
    readyFuture: string
    cardAssessmentTitle: string
    cardAssessmentBody: string
    cardAssessmentCta: string
    cardRecommendedTitle: string
    cardRecommendedBody: string
    cardRecommendedCta: string
    cardProgressTitle: string
    cardProgressBody: string
    cardProgressView: string
    careerPathTitle: string
    careerPathSub: string
    tabJob: string
    tabHigher: string
    tabEnt: string
    previewInterested: string
    previewGuidance: string
    learningResources: string
    seeAll: string
    resourceTypes: string[]
    learnersLabel: (n: string) => string
    mentorsTrackTitle: string
    mentorsTrackSub: (track: string) => string
    mentorTrackJob: string
    mentorTrackHigher: string
    mentorTrackEnt: string
    sample: string
    highlyRecommended: string
    viewProfile: string
    sampleProfileHint: string
    loginToConnect: string
    chatNow: string
    requestPending: string
    requestAgain: string
    sending: string
    requestToConnect: string
    noMentors: string
    footerTagline: string
    footerRights: string
    careerPreview: {
      job: { title: string; subtitle: string; icon: string; fit: number }[]
      higher: { title: string; subtitle: string; icon: string; fit: number }[]
      ent: { title: string; subtitle: string; icon: string; fit: number }[]
    }
    resources: { id: number; title: string; icon: string; type: string[]; learners: string }[]
    mentorModal: {
      reviews: (n: number) => string
      education: string
      currentRole: string
      experience: string
      about: string
      expertise: string
      sampleBanner: string
      chatRegistered: string
      loginStudentChat: string
      chatAfterAccept: string
      loadingMessages: string
      noMessages: string
      you: string
      placeholderChat: string
      placeholderLogin: string
      send: string
      sending: string
    }
  }
  careerOptions: {
    back: string
    title: string
    jobOpportunities: string
    higherStudies: string
    bangladesh: string
    abroad: string
    entrepreneurship: string
    jobs: { id: string; title: string; points: string[] }[]
    bd: { id: string; title: string; points: string[] }[]
    abroadItems: { id: string; title: string; points: string[] }[]
    ent: { id: string; title: string; points: string[] }[]
  }
  mentorPage: {
    loginRequired: string
    goHome: string
    title: string
    subtitle: string
    backHome: string
    students: string
    studentsSub: string
    pending: string
    accept: string
    reject: string
    loadingConversations: string
    noConversations: string
    noMessages: string
    selectStudent: string
    chatWith: (name: string) => string
    selectFromLeft: string
    loadingMessages: string
    noMessagesThread: string
    replyPlaceholder: string
    selectFirst: string
    sending: string
    send: string
    studentMbti: (v: string) => string
  }
  auth: {
    welcomeBack: string
    joinUs: string
    signIn: string
    createAccount: string
    login: string
    register: string
    adminNote: string
    adminNoteBody: string
    userType: string
    student: string
    mentor: string
    admin: string
    fullName: string
    expertise: string
    zoomOptional: string
    meetOptional: string
    adminRole: string
    email: string
    password: string
    processing: string
    signInBtn: string
    createAccountBtn: string
    mentorSuccess: string
    mentorPending: string
    logout: string
    loginRegister: string
  }
  assessment: {
    loading: string
    careerAssessment: string
    questionOf: (cur: number, total: number) => string
    complete: string
    scaleHint: string
    agreeSide: string
    disagreeSide: string
    previous: string
    next: string
    submit: string
    analyzing: string
    errorTitle: string
    mbtiLabel: string
    mbtiSub: string
    interestsTitle: string
    careersTitle: string
    careersSub: (type: string) => string
    retake: string
    backHome: string
    likert: [string, string, string, string, string]
  }
}

const en: SiteMessages = {
  common: {
    language: "Language",
    english: "English",
    bangla: "বাংলা",
    guest: "Guest",
    loading: "Loading...",
  },
  nav: {
    home: "Home",
    exploreCareers: "Explore Careers",
    mentors: "Mentors",
    admin: "⚙️ Admin",
    mentorInbox: "💬 Mentor Inbox",
    toggleMenu: "Toggle menu",
    msgNotifications: "Message Notifications",
    noNewNotifications: "No new message notifications.",
  },
  home: {
    welcomeBadge: "Welcome to Career Leader!",
    heroTitleBefore: "Find Your",
    heroTitleHighlight: "Ideal Career",
    heroTitleAfter: "Path",
    heroSub:
      "Discover personalized career recommendations based on your personality, interests, and goals in just 5 minutes.",
    ctaAssessment: "🚀 Take Assessment Now",
    hello: name => `Hello, ${name}! 👋`,
    readyFuture: "Ready to discover your future?",
    cardAssessmentTitle: "Complete Assessment",
    cardAssessmentBody: "Take a 5-minute personality & interest test to find careers that fit you.",
    cardAssessmentCta: "Start Now",
    cardRecommendedTitle: "Recommended Careers",
    cardRecommendedBody: "Get personalized career suggestions based on your assessment.",
    cardRecommendedCta: "View Careers",
    cardProgressTitle: "Track Your Progress",
    cardProgressBody: "Monitor your skill development and career progress.",
    cardProgressView: "View",
    careerPathTitle: "Career Path Preview",
    careerPathSub: "Pick a track to preview it, then open full guidance for step-by-step details.",
    tabJob: "💼 Job",
    tabHigher: "🎓 Higher Study",
    tabEnt: "🚀 Entrepreneurship",
    previewInterested: "✓ Interested",
    previewGuidance: "Full Guidance →",
    learningResources: "Learning Resources",
    seeAll: "See All →",
    resourceTypes: ["Courses", "Articles", "Videos"],
    learnersLabel: n => `👥 ${n} learners`,
    mentorsTrackTitle: "Mentors for this track",
    mentorsTrackSub: track =>
      `Showing mentors aligned with ${track}. Switch tabs in Career Path Preview above to see different mentors.`,
    mentorTrackJob: "Job paths",
    mentorTrackHigher: "Higher study paths",
    mentorTrackEnt: "Entrepreneurship",
    sample: "Sample",
    highlyRecommended: "⭐ Highly Recommended",
    viewProfile: "👁 View Profile",
    sampleProfileHint: "Sample profile — connect with registered mentors after they sign up.",
    loginToConnect: "Login to Connect",
    chatNow: "Chat Now",
    requestPending: "Request Pending",
    requestAgain: "Request Again",
    sending: "Sending...",
    requestToConnect: "Request to Connect",
    noMentors: "No active mentors available right now.",
    footerTagline: "Discover your ideal career path based on your personality and interests.",
    footerRights: "Career Leader © 2026. All rights reserved.",
    careerPreview: {
      job: [
        { title: "Software Engineer", subtitle: "Product, web, and platform development", icon: "💻", fit: 96 },
        { title: "Network Engineer", subtitle: "Infrastructure, cloud, and security", icon: "🌐", fit: 86 },
      ],
      higher: [
        { title: "Govt. Universities", subtitle: "Admission, requirements, and preparation", icon: "🏛️", fit: 88 },
        { title: "Scholarship (Abroad)", subtitle: "Eligibility, documents, and process", icon: "🎓", fit: 84 },
      ],
      ent: [
        { title: "Startup Foundation", subtitle: "How to begin and validate ideas", icon: "🚀", fit: 90 },
        { title: "Roles & Growth", subtitle: "Skills, challenges, and success strategy", icon: "📈", fit: 82 },
      ],
    },
    resources: [
      { id: 1, title: "Python Programming", icon: "🐍", type: ["Courses", "Articles", "Videos"], learners: "10K+" },
      { id: 2, title: "Web Development", icon: "🌐", type: ["Courses", "Articles", "Videos"], learners: "25K+" },
      { id: 3, title: "Mobile App Developer", icon: "📱", type: ["Courses", "Articles", "Videos"], learners: "15K+" },
    ],
    mentorModal: {
      reviews: n => `(${n} reviews)`,
      education: "Education",
      currentRole: "Current role",
      experience: "Experience",
      about: "About",
      expertise: "Expertise",
      sampleBanner:
        "Sample profile for this career track. Messaging and video links apply to registered mentors.",
      chatRegistered: "Chat is available with registered mentors after you connect.",
      loginStudentChat: "Login as a student to chat with this mentor.",
      chatAfterAccept: "Chat unlocks after mentor accepts your connection request.",
      loadingMessages: "Loading messages...",
      noMessages: "No messages yet. Start a conversation.",
      you: "You",
      placeholderChat: "Type your message...",
      placeholderLogin: "Login to chat",
      send: "Send",
      sending: "Sending...",
    },
  },
  careerOptions: {
    back: "← Back Home",
    title: "Career Options",
    jobOpportunities: "Job Opportunities",
    higherStudies: "Higher Studies",
    bangladesh: "Bangladesh",
    abroad: "Abroad",
    entrepreneurship: "Entrepreneurship",
    jobs: [
      {
        id: "gov",
        title: "Government Jobs",
        points: ["Job sectors", "Requirements", "Application process", "Preparation guidelines"],
      },
      {
        id: "pvt",
        title: "Private Jobs",
        points: ["Company types", "Required skills", "Job opportunities", "Career growth"],
      },
    ],
    bd: [
      {
        id: "gov-uni",
        title: "Govt. Universities",
        points: ["Admission process", "Requirements", "Preparation tips"],
      },
      {
        id: "pvt-uni",
        title: "Private Universities",
        points: ["Admission system", "Costs", "Facilities"],
      },
    ],
    abroadItems: [
      {
        id: "scholarship",
        title: "Scholarship",
        points: ["Types of scholarships", "Eligibility", "Application process"],
      },
      {
        id: "self",
        title: "Self-Finance",
        points: ["Cost estimation", "Visa process", "University selection"],
      },
    ],
    ent: [
      { id: "how", title: "How to Be an Entrepreneur", points: ["How to become an entrepreneur"] },
      { id: "roles", title: "Roles & Skills", points: ["Required skills", "Roles and responsibilities"] },
      { id: "chal", title: "Challenges & Success", points: ["Challenges and risks", "Success strategies"] },
    ],
  },
  mentorPage: {
    loginRequired: "Mentor login required.",
    goHome: "Go to Home",
    title: "Mentor Inbox",
    subtitle: "View and reply to students under your mentorship.",
    backHome: "Back Home",
    students: "Students",
    studentsSub: "Active mentorship conversations",
    pending: "Pending Requests",
    accept: "Accept",
    reject: "Reject",
    loadingConversations: "Loading conversations...",
    noConversations: "No student conversations yet.",
    noMessages: "No messages",
    selectStudent: "Select a student",
    chatWith: name => `Chat with ${name}`,
    selectFromLeft: "Choose a student conversation from the left.",
    loadingMessages: "Loading messages...",
    noMessagesThread: "No messages in this conversation.",
    replyPlaceholder: "Reply to student...",
    selectFirst: "Select a student first",
    sending: "Sending...",
    send: "Send",
    studentMbti: v => `Student MBTI: ${v}`,
  },
  auth: {
    welcomeBack: "Welcome Back",
    joinUs: "Join Us",
    signIn: "Sign in to your account",
    createAccount: "Create a new account",
    login: "Login",
    register: "Register",
    adminNote: "ℹ️ Admin accounts",
    adminNoteBody: "are managed by system administrators only.",
    userType: "User Type",
    student: "👨‍🎓 Student",
    mentor: "👨‍🏫 Mentor",
    admin: "👨‍💼 Admin",
    fullName: "Full Name",
    expertise: "Expertise",
    zoomOptional: "Zoom Link (optional)",
    meetOptional: "Google Meet Link (optional)",
    adminRole: "Admin Role",
    email: "Email Address",
    password: "Password",
    processing: "Processing...",
    signInBtn: "Sign In",
    createAccountBtn: "Create Account",
    mentorSuccess: "✅ Account created successfully!",
    mentorPending: "⚠️ Your mentor account will be inactive until approved by an admin.",
    logout: "Logout",
    loginRegister: "Login / Register",
  },
  assessment: {
    loading: "Loading assessment questions...",
    careerAssessment: "Career Assessment",
    questionOf: (cur, total) => `Question ${cur} of ${total}`,
    complete: "Complete",
    scaleHint: "Scale: Strongly Disagree to Strongly Agree",
    agreeSide: "Agree side:",
    disagreeSide: "Disagree side:",
    previous: "← Previous",
    next: "Next →",
    submit: "🎯 Submit Assessment",
    analyzing: "⏳ Analyzing...",
    errorTitle: "❌ Error Processing Results",
    mbtiLabel: "Your MBTI Personality Type",
    mbtiSub:
      "Based on your answers, discover your unique personality profile and ideal career paths.",
    interestsTitle: "Your Key Interests",
    careersTitle: "🎯 Recommended Careers",
    careersSub: type => `Perfect career paths for personality type ${type}`,
    retake: "🔄 Retake Assessment",
    backHome: "← Back Home",
    likert: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
  },
}

const bn: SiteMessages = {
  common: {
    language: "ভাষা",
    english: "English",
    bangla: "বাংলা",
    guest: "অতিথি",
    loading: "লোড হচ্ছে...",
  },
  nav: {
    home: "হোম",
    exploreCareers: "ক্যারিয়ার অন্বেষণ",
    mentors: "মেন্টর",
    admin: "⚙️ অ্যাডমিন",
    mentorInbox: "💬 মেন্টর ইনবক্স",
    toggleMenu: "মেনু খুলুন",
    msgNotifications: "বার্তার বিজ্ঞপ্তি",
    noNewNotifications: "কোনো নতুন বার্তার বিজ্ঞপ্তি নেই।",
  },
  home: {
    welcomeBadge: "ক্যারিয়ার লিডারে স্বাগতম!",
    heroTitleBefore: "আপনার",
    heroTitleHighlight: "আদর্শ ক্যারিয়ার",
    heroTitleAfter: "পথ খুঁজুন",
    heroSub:
      "মাত্র ৫ মিনিটে ব্যক্তিত্ব, আগ্রহ ও লক্ষ্যের ভিত্তিতে ব্যক্তিগত ক্যারিয়ার সুপারিশ পান।",
    ctaAssessment: "🚀 এখনই মূল্যায়ন দিন",
    hello: name => `হ্যালো, ${name}! 👋`,
    readyFuture: "ভবিষ্যৎ আবিষ্কারের জন্য প্রস্তুত?",
    cardAssessmentTitle: "মূল্যায়ন সম্পূর্ণ করুন",
    cardAssessmentBody:
      "৫ মিনিটের ব্যক্তিত্ব ও আগ্রহের পরীক্ষায় উপযুক্ত ক্যারিয়ার খুঁজুন।",
    cardAssessmentCta: "শুরু করুন",
    cardRecommendedTitle: "সুপারিশকৃত ক্যারিয়ার",
    cardRecommendedBody: "মূল্যায়নের ভিত্তিতে ব্যক্তিগত ক্যারিয়ার পরামর্শ পান।",
    cardRecommendedCta: "ক্যারিয়ার দেখুন",
    cardProgressTitle: "অগ্রগতি ট্র্যাক করুন",
    cardProgressBody: "দক্ষতা বৃদ্ধি ও ক্যারিয়ার অগ্রগতি পর্যবেক্ষণ করুন।",
    cardProgressView: "দেখুন",
    careerPathTitle: "ক্যারিয়ার পথের প্রিভিউ",
    careerPathSub:
      "একটি ট্র্যাক বেছে নিন, তারপর বিস্তারিত ধাপের জন্য পূর্ণ নির্দেশনা খুলুন।",
    tabJob: "💼 চাকরি",
    tabHigher: "🎓 উচ্চশিক্ষা",
    tabEnt: "🚀 উদ্যোক্তা",
    previewInterested: "✓ আগ্রহী",
    previewGuidance: "সম্পূর্ণ নির্দেশনা →",
    learningResources: "শেখার সম্পদ",
    seeAll: "সব দেখুন →",
    resourceTypes: ["কোর্স", "নিবন্ধ", "ভিডিও"],
    learnersLabel: n => `👥 ${n} শিক্ষার্থী`,
    mentorsTrackTitle: "এই ট্র্যাকের মেন্টর",
    mentorsTrackSub: track =>
      `${track} অনুযায়ী মেন্টর দেখানো হচ্ছে। অন্য মেন্টর দেখতে উপরে ক্যারিয়ার পথের ট্যাব বদলান।`,
    mentorTrackJob: "চাকরির পথ",
    mentorTrackHigher: "উচ্চশিক্ষার পথ",
    mentorTrackEnt: "উদ্যোক্তা",
    sample: "নমুনা",
    highlyRecommended: "⭐ অত্যন্ত সুপারিশকৃত",
    viewProfile: "👁 প্রোফাইল দেখুন",
    sampleProfileHint:
      "নমুনা প্রোফাইল — নিবন্ধিত মেন্টরদের সাথে যুক্ত হতে তাদের সাইন আপের পর সংযোগ করুন।",
    loginToConnect: "সংযোগের জন্য লগইন",
    chatNow: "চ্যাট করুন",
    requestPending: "অনুরোধ অপেক্ষমাণ",
    requestAgain: "আবার অনুরোধ",
    sending: "পাঠানো হচ্ছে...",
    requestToConnect: "সংযোগের অনুরোধ",
    noMentors: "এখন কোনো সক্রিয় মেন্টর নেই।",
    footerTagline:
      "আপনার ব্যক্তিত্ব ও আগ্রহের ভিত্তিতে আদর্শ ক্যারিয়ার পথ আবিষ্কার করুন।",
    footerRights: "ক্যারিয়ার লিডার © ২০২৬। সর্বস্বত্ব সংরক্ষিত।",
    careerPreview: {
      job: [
        { title: "সফটওয়্যার ইঞ্জিনিয়ার", subtitle: "পণ্য, ওয়েব ও প্ল্যাটফর্ম ডেভেলপমেন্ট", icon: "💻", fit: 96 },
        { title: "নেটওয়ার্ক ইঞ্জিনিয়ার", subtitle: "অবকাঠামো, ক্লাউড ও নিরাপত্তা", icon: "🌐", fit: 86 },
      ],
      higher: [
        { title: "সরকারি বিশ্ববিদ্যালয়", subtitle: "ভর্তি, যোগ্যতা ও প্রস্তুতি", icon: "🏛️", fit: 88 },
        { title: "বৃত্তি (বিদেশ)", subtitle: "যোগ্যতা, কাগজপত্র ও প্রক্রিয়া", icon: "🎓", fit: 84 },
      ],
      ent: [
        { title: "স্টার্টআপ ভিত্তি", subtitle: "শুরু করা ও ধারণা যাচাই", icon: "🚀", fit: 90 },
        { title: "ভূমিকা ও বৃদ্ধি", subtitle: "দক্ষতা, চ্যালেঞ্জ ও সাফল্য কৌশল", icon: "📈", fit: 82 },
      ],
    },
    resources: [
      { id: 1, title: "পাইথন প্রোগ্রামিং", icon: "🐍", type: ["কোর্স", "নিবন্ধ", "ভিডিও"], learners: "১০হাজার+" },
      { id: 2, title: "ওয়েব ডেভেলপমেন্ট", icon: "🌐", type: ["কোর্স", "নিবন্ধ", "ভিডিও"], learners: "২৫হাজার+" },
      { id: 3, title: "মোবাইল অ্যাপ ডেভেলপার", icon: "📱", type: ["কোর্স", "নিবন্ধ", "ভিডিও"], learners: "১৫হাজার+" },
    ],
    mentorModal: {
      reviews: n => `(${n} রিভিউ)`,
      education: "শিক্ষা",
      currentRole: "বর্তমান ভূমিকা",
      experience: "অভিজ্ঞতা",
      about: "সম্পর্কে",
      expertise: "দক্ষতা",
      sampleBanner:
        "এই ক্যারিয়ার ট্র্যাকের জন্য নমুনা প্রোফাইল। বার্তা ও ভিডিও লিংক নিবন্ধিত মেন্টরদের জন্য।",
      chatRegistered: "নিবন্ধিত মেন্টরদের সাথে সংযোগের পর চ্যাট পাওয়া যাবে।",
      loginStudentChat: "এই মেন্টরের সাথে চ্যাট করতে শিক্ষার্থী হিসেবে লগইন করুন।",
      chatAfterAccept: "মেন্টর সংযোগ গ্রহণ করলে চ্যাট খুলবে।",
      loadingMessages: "বার্তা লোড হচ্ছে...",
      noMessages: "এখনও কোনো বার্তা নেই। কথোপকথন শুরু করুন।",
      you: "আপনি",
      placeholderChat: "বার্তা লিখুন...",
      placeholderLogin: "চ্যাটে লগইন করুন",
      send: "পাঠান",
      sending: "পাঠানো হচ্ছে...",
    },
  },
  careerOptions: {
    back: "← মূল পাতায়",
    title: "ক্যারিয়ার অপশন",
    jobOpportunities: "চাকরির সুযোগ",
    higherStudies: "উচ্চশিক্ষা",
    bangladesh: "বাংলাদেশ",
    abroad: "বিদেশ",
    entrepreneurship: "উদ্যোক্তা",
    jobs: [
      {
        id: "gov",
        title: "সরকারি চাকরি",
        points: ["খাত", "যোগ্যতা", "আবেদন প্রক্রিয়া", "প্রস্তুতির নির্দেশনা"],
      },
      {
        id: "pvt",
        title: "বেসরকারি চাকরি",
        points: ["কোম্পানির ধরন", "প্রয়োজনীয় দক্ষতা", "সুযোগ", "ক্যারিয়ার বৃদ্ধি"],
      },
    ],
    bd: [
      {
        id: "gov-uni",
        title: "সরকারি বিশ্ববিদ্যালয়",
        points: ["ভর্তি প্রক্রিয়া", "যোগ্যতা", "প্রস্তুতির টিপস"],
      },
      {
        id: "pvt-uni",
        title: "বেসরকারি বিশ্ববিদ্যালয়",
        points: ["ভর্তি ব্যবস্থা", "খরচ", "সুবিধা"],
      },
    ],
    abroadItems: [
      {
        id: "scholarship",
        title: "বৃত্তি",
        points: ["বৃত্তির ধরন", "যোগ্যতা", "আবেদন প্রক্রিয়া"],
      },
      {
        id: "self",
        title: "নিজস্ব অর্থায়ন",
        points: ["খরচ অনুমান", "ভিসা প্রক্রিয়া", "বিশ্ববিদ্যালয় বাছাই"],
      },
    ],
    ent: [
      { id: "how", title: "উদ্যোক্তা হওয়ার উপায়", points: ["উদ্যোক্তা হওয়ার ধাপ"] },
      { id: "roles", title: "ভূমিকা ও দক্ষতা", points: ["প্রয়োজনীয় দক্ষতা", "দায়িত্ব"] },
      { id: "chal", title: "চ্যালেঞ্জ ও সাফল্য", points: ["চ্যালেঞ্জ ও ঝুঁকি", "সাফল্য কৌশল"] },
    ],
  },
  mentorPage: {
    loginRequired: "মেন্টর হিসেবে লগইন প্রয়োজন।",
    goHome: "মূল পাতায় যান",
    title: "মেন্টর ইনবক্স",
    subtitle: "আপনার মেন্টরশিপের অধীনে শিক্ষার্থীদের দেখুন ও উত্তর দিন।",
    backHome: "মূল পাতায়",
    students: "শিক্ষার্থী",
    studentsSub: "সক্রিয় মেন্টরশিপ কথোপকথন",
    pending: "অপেক্ষমাণ অনুরোধ",
    accept: "গ্রহণ",
    reject: "প্রত্যাখ্যান",
    loadingConversations: "কথোপকথন লোড হচ্ছে...",
    noConversations: "এখনও কোনো কথোপকথন নেই।",
    noMessages: "কোনো বার্তা নেই",
    selectStudent: "একজন শিক্ষার্থী বেছে নিন",
    chatWith: name => `${name} এর সাথে চ্যাট`,
    selectFromLeft: "বাম থেকে একজন শিক্ষার্থী বেছে নিন।",
    loadingMessages: "বার্তা লোড হচ্ছে...",
    noMessagesThread: "এই কথোপকথনে কোনো বার্তা নেই।",
    replyPlaceholder: "শিক্ষার্থীকে উত্তর...",
    selectFirst: "আগে একজন শিক্ষার্থী বেছে নিন",
    sending: "পাঠানো হচ্ছে...",
    send: "পাঠান",
    studentMbti: v => `শিক্ষার্থীর MBTI: ${v}`,
  },
  auth: {
    welcomeBack: "আবার স্বাগতম",
    joinUs: "যোগ দিন",
    signIn: "আপনার অ্যাকাউন্টে সাইন ইন করুন",
    createAccount: "নতুন অ্যাকাউন্ট তৈরি করুন",
    login: "লগইন",
    register: "নিবন্ধন",
    adminNote: "ℹ️ অ্যাডমিন অ্যাকাউন্ট",
    adminNoteBody: "শুধুমাত্র সিস্টেম অ্যাডমিনদের দ্বারা পরিচালিত।",
    userType: "ব্যবহারকারীর ধরন",
    student: "👨‍🎓 শিক্ষার্থী",
    mentor: "👨‍🏫 মেন্টর",
    admin: "👨‍💼 অ্যাডমিন",
    fullName: "পূর্ণ নাম",
    expertise: "দক্ষতা",
    zoomOptional: "জুম লিংক (ঐচ্ছিক)",
    meetOptional: "গুগল মিট লিংক (ঐচ্ছিক)",
    adminRole: "অ্যাডমিন ভূমিকা",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    processing: "প্রক্রিয়াকরণ...",
    signInBtn: "সাইন ইন",
    createAccountBtn: "অ্যাকাউন্ট তৈরি",
    mentorSuccess: "✅ অ্যাকাউন্ট সফলভাবে তৈরি!",
    mentorPending: "⚠️ অ্যাডমিন অনুমোদন না হওয়া পর্যন্ত মেন্টর অ্যাকাউন্ট নিষ্ক্রিয় থাকবে।",
    logout: "লগআউট",
    loginRegister: "লগইন / নিবন্ধন",
  },
  assessment: {
    loading: "মূল্যায়নের প্রশ্ন লোড হচ্ছে...",
    careerAssessment: "ক্যারিয়ার মূল্যায়ন",
    questionOf: (cur, total) => `প্রশ্ন ${cur} / ${total}`,
    complete: "সম্পন্ন",
    scaleHint: "স্কেল: একেবারে অসম্মত থেকে পূর্ণ সম্মত",
    agreeSide: "সম্মত দিক:",
    disagreeSide: "অসম্মত দিক:",
    previous: "← আগের প্রশ্ন",
    next: "পরের প্রশ্ন →",
    submit: "🎯 মূল্যায়ন জমা দিন",
    analyzing: "⏳ বিশ্লেষণ হচ্ছে...",
    errorTitle: "❌ ফলাফল প্রক্রিয়াকরণে ত্রুটি",
    mbtiLabel: "আপনার MBTI ব্যক্তিত্বের ধরন",
    mbtiSub: "আপনার উত্তরের ভিত্তিতে আপনার ব্যক্তিত্ব ও উপযুক্ত ক্যারিয়ার পথ জানুন।",
    interestsTitle: "আপনার প্রধান আগ্রহ",
    careersTitle: "🎯 সুপারিশকৃত ক্যারিয়ার",
    careersSub: type => `${type} ধরনের জন্য উপযুক্ত ক্যারিয়ার`,
    retake: "🔄 আবার মূল্যায়ন",
    backHome: "← মূল পাতায় ফিরুন",
    likert: ["একেবারে অসম্মত", "অসম্মত", "নিরপেক্ষ", "সম্মত", "পূর্ণ সম্মত"],
  },
}

export const siteI18n: Record<SiteLang, SiteMessages> = { en, bn }

export function getSiteMessages(lang: SiteLang): SiteMessages {
  return siteI18n[lang] ?? siteI18n.en
}
