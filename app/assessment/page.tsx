"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../components/DashboardLayout"
import { useLanguage } from "../contexts/LanguageContext"
import { useUser } from "../contexts/UserContext"

type Question = {
  id: string
  text: string
  dimension: string
  sideA: string
  sideB: string
  interests?: string[]
  mission?: number
}

type Recommendation = {
  id: string
}

type ExperiencePreferences = {
  autoAdvance: boolean
  motion: boolean
  compact: boolean
  largeText: boolean
}

type Draft = {
  answers?: Record<string, number>
  currentQuestion?: number
  started?: boolean
  preferences?: Partial<ExperiencePreferences>
}

const DRAFT_KEY = "careerleader_assessment_game_draft_v1"

const DEFAULT_PREFERENCES: ExperiencePreferences = {
  autoAdvance: true,
  motion: true,
  compact: false,
  largeText: false,
}

const MISSIONS = [
  {
    icon: "⛺",
    en: { name: "Basecamp", hint: "Assemble the crew and decide how the adventure begins." },
    bn: { name: "বেসক্যাম্প", hint: "দল তৈরি করুন এবং অভিযান কীভাবে শুরু হবে তা ঠিক করুন।" },
  },
  {
    icon: "💡",
    en: { name: "Idea Lab", hint: "Turn a rough concept into an experience people will remember." },
    bn: { name: "আইডিয়া ল্যাব", hint: "একটি প্রাথমিক ধারণাকে স্মরণীয় অভিজ্ঞতায় রূপ দিন।" },
  },
  {
    icon: "🗺️",
    en: { name: "Decision Deck", hint: "Navigate trade-offs when the plan meets the real world." },
    bn: { name: "ডিসিশন ডেক", hint: "পরিকল্পনা বাস্তবতার মুখোমুখি হলে সঠিক পথ খুঁজে নিন।" },
  },
  {
    icon: "🚀",
    en: { name: "Launch Zone", hint: "Bring the festival to life when the pressure is on." },
    bn: { name: "লঞ্চ জোন", hint: "চাপের মধ্যেও উৎসবকে সফলভাবে বাস্তবে রূপ দিন।" },
  },
] as const

type GameScene = {
  prompt: string
  optionA: string
  optionB: string
  feedbackA: string
  feedbackB: string
}

const GAME_SCENES: Record<string, { en: GameScene; bn: GameScene }> = {
  q1: {
    en: {
      prompt: "Your festival crew meets for the first time. The room is quiet and everyone is waiting for a lead.",
      optionA: "Pull everyone into a quick team huddle and get the energy moving.",
      optionB: "Find a calm corner, shape the opening idea, then bring it to the team.",
      feedbackA: "The room warms up fast. New connections begin forming.",
      feedbackB: "Your focused start gives the crew a thoughtful direction.",
    },
    bn: {
      prompt: "উৎসবের দল প্রথমবার মিলেছে। সবাই চুপচাপ এবং কেউ একজন নেতৃত্ব দেওয়ার অপেক্ষায় আছে।",
      optionA: "সবাইকে নিয়ে দ্রুত একটি টিম হাডল করে পরিবেশ প্রাণবন্ত করি।",
      optionB: "শান্ত জায়গায় প্রথম ধারণাটি গুছিয়ে তারপর দলের সামনে তুলে ধরি।",
      feedbackA: "ঘরের পরিবেশ দ্রুত প্রাণবন্ত হয়ে ওঠে। নতুন সংযোগ তৈরি হয়।",
      feedbackB: "আপনার মনোযোগী শুরু দলকে একটি চিন্তাশীল দিক দেয়।",
    },
  },
  q2: {
    en: {
      prompt: "A display kit arrives in pieces with a short instruction card. You have one hour to make it work.",
      optionA: "Follow the card step by step and test each part as I go.",
      optionB: "Study the pieces and imagine a more interesting way they could work together.",
      feedbackA: "The display comes together steadily, one working piece at a time.",
      feedbackB: "The crew sees a possibility that was not in the original plan.",
    },
    bn: {
      prompt: "একটি ডিসপ্লে কিট খণ্ড খণ্ড অবস্থায় এসেছে, সঙ্গে ছোট নির্দেশিকা। এক ঘণ্টায় এটি চালু করতে হবে।",
      optionA: "নির্দেশিকা ধাপে ধাপে অনুসরণ করে প্রতিটি অংশ পরীক্ষা করি।",
      optionB: "অংশগুলো দেখে আরও আকর্ষণীয়ভাবে কীভাবে কাজ করতে পারে তা কল্পনা করি।",
      feedbackA: "একটি করে কার্যকর অংশ যোগ হয়ে ডিসপ্লেটি স্থিরভাবে তৈরি হয়।",
      feedbackB: "দলটি মূল পরিকল্পনার বাইরের একটি নতুন সম্ভাবনা দেখতে পায়।",
    },
  },
  q3: {
    en: {
      prompt: "A volunteer misses an important task and looks overwhelmed when you find them.",
      optionA: "Sit with them first, hear what happened, and rebuild their confidence.",
      optionB: "Repair the task list immediately so the rest of the crew can keep moving.",
      feedbackA: "The volunteer feels seen and returns ready to contribute.",
      feedbackB: "The bottleneck clears and the crew regains momentum.",
    },
    bn: {
      prompt: "একজন স্বেচ্ছাসেবক গুরুত্বপূর্ণ কাজ শেষ করতে পারেনি এবং তাকে খুব চাপগ্রস্ত দেখাচ্ছে।",
      optionA: "আগে তার কথা শুনি এবং আত্মবিশ্বাস ফিরে পেতে সাহায্য করি।",
      optionB: "দলকে সচল রাখতে সঙ্গে সঙ্গে কাজের তালিকাটি ঠিক করি।",
      feedbackA: "স্বেচ্ছাসেবক নিজেকে গুরুত্ব দেওয়া হয়েছে মনে করে এবং কাজে ফিরে আসে।",
      feedbackB: "কাজের বাধা দূর হয় এবং দল আবার গতি পায়।",
    },
  },
  q4: {
    en: {
      prompt: "Opening day is close. The crew asks how tightly the next two days should be organized.",
      optionA: "Build a clear timeline with owners, checkpoints, and finish times.",
      optionB: "Set the main goal, keep the route flexible, and adjust as opportunities appear.",
      feedbackA: "Everyone knows exactly what success looks like and when to act.",
      feedbackB: "The crew has room to adapt and use unexpected opportunities.",
    },
    bn: {
      prompt: "উদ্বোধনের দিন খুব কাছে। পরের দুই দিন কতটা নির্দিষ্টভাবে সাজানো হবে তা দল জানতে চায়।",
      optionA: "দায়িত্ব, চেকপয়েন্ট ও সময়সহ একটি পরিষ্কার টাইমলাইন তৈরি করি।",
      optionB: "মূল লক্ষ্য ঠিক রেখে সুযোগ অনুযায়ী পথ পরিবর্তনের স্বাধীনতা রাখি।",
      feedbackA: "সাফল্য কেমন হবে এবং কখন কী করতে হবে সবাই পরিষ্কারভাবে জানে।",
      feedbackB: "দলটি মানিয়ে নেওয়া ও নতুন সুযোগ কাজে লাগানোর জায়গা পায়।",
    },
  },
  q5: {
    en: {
      prompt: "You enter the Idea Lab for a one-hour concept sprint. Where will you do your best thinking?",
      optionA: "Claim a quiet desk and return when my idea is ready to share.",
      optionB: "Join the open studio and build ideas through rapid conversation.",
      feedbackA: "A focused concept takes shape without interruption.",
      feedbackB: "Ideas bounce across the room and quickly gain momentum.",
    },
    bn: {
      prompt: "এক ঘণ্টার কনসেপ্ট স্প্রিন্টের জন্য আপনি আইডিয়া ল্যাবে ঢুকেছেন। কোথায় সবচেয়ে ভালো ভাবতে পারবেন?",
      optionA: "একটি শান্ত ডেস্কে কাজ করে ধারণা তৈরি হলে দলের কাছে ফিরি।",
      optionB: "ওপেন স্টুডিওতে যোগ দিয়ে দ্রুত আলোচনার মাধ্যমে ধারণা তৈরি করি।",
      feedbackA: "বাধাহীন মনোযোগে একটি সুগঠিত ধারণা তৈরি হয়।",
      feedbackB: "ঘরজুড়ে ধারণার আদান-প্রদান হয় এবং দ্রুত গতি বাড়ে।",
    },
  },
  q6: {
    en: {
      prompt: "A sponsor offers a bonus for an attraction nobody has seen before—but it may not work.",
      optionA: "Pitch the bold experiment. A memorable future needs a leap.",
      optionB: "Choose the proven format and make every practical detail excellent.",
      feedbackA: "The crew lights up around a surprising new possibility.",
      feedbackB: "The idea becomes tangible, reliable, and ready to deliver.",
    },
    bn: {
      prompt: "স্পনসর এমন একটি আকর্ষণের জন্য বোনাস দেবে যা আগে কেউ দেখেনি—তবে এটি ব্যর্থও হতে পারে।",
      optionA: "সাহসী পরীক্ষাটিই প্রস্তাব করি। স্মরণীয় ভবিষ্যতের জন্য ঝুঁকি দরকার।",
      optionB: "পরীক্ষিত ধরনটি বেছে নিয়ে প্রতিটি বাস্তব দিক চমৎকার করি।",
      feedbackA: "অপ্রত্যাশিত নতুন সম্ভাবনায় পুরো দল উচ্ছ্বসিত হয়ে ওঠে।",
      feedbackB: "ধারণাটি বাস্তব, নির্ভরযোগ্য এবং উপস্থাপনের জন্য প্রস্তুত হয়।",
    },
  },
  q7: {
    en: {
      prompt: "Two vendors are tied: one scores higher on reliability, while the crew feels inspired by the other.",
      optionA: "Use the scorecard and choose the option with the strongest evidence.",
      optionB: "Listen to the crew and choose the partner people believe in.",
      feedbackA: "The decision is easy to explain and defend with clear evidence.",
      feedbackB: "The crew feels ownership and rallies behind the partner.",
    },
    bn: {
      prompt: "দুই বিক্রেতা প্রায় সমান: একজন নির্ভরযোগ্যতায় এগিয়ে, অন্যজন দলকে বেশি অনুপ্রাণিত করেছে।",
      optionA: "স্কোরকার্ড ব্যবহার করে সবচেয়ে শক্ত প্রমাণ থাকা বিকল্পটি নিই।",
      optionB: "দলের কথা শুনে যাকে সবাই বিশ্বাস করে তাকে বেছে নিই।",
      feedbackA: "স্পষ্ট প্রমাণ দিয়ে সিদ্ধান্তটি সহজেই ব্যাখ্যা করা যায়।",
      feedbackB: "দলটি সিদ্ধান্তের অংশ মনে করে এবং অংশীদারের পাশে দাঁড়ায়।",
    },
  },
  q8: {
    en: {
      prompt: "The weather report keeps changing. You must decide how to handle the outdoor stage.",
      optionA: "Keep several stage plans alive until the forecast becomes clearer.",
      optionB: "Choose one backup now and lock every dependency around it.",
      feedbackA: "The team stays nimble as new information arrives.",
      feedbackB: "Uncertainty drops and every supplier knows the plan.",
    },
    bn: {
      prompt: "আবহাওয়ার পূর্বাভাস বারবার বদলাচ্ছে। খোলা মঞ্চ নিয়ে এখন সিদ্ধান্ত নিতে হবে।",
      optionA: "পূর্বাভাস পরিষ্কার না হওয়া পর্যন্ত কয়েকটি পরিকল্পনা খোলা রাখি।",
      optionB: "এখনই একটি বিকল্প ঠিক করে সব নির্ভরশীল কাজ চূড়ান্ত করি।",
      feedbackA: "নতুন তথ্য আসার সঙ্গে দল দ্রুত মানিয়ে নিতে পারে।",
      feedbackB: "অনিশ্চয়তা কমে এবং প্রত্যেক সরবরাহকারী পরিকল্পনা জেনে যায়।",
    },
  },
  q9: {
    en: {
      prompt: "At the Decision Deck, a brainstorm stalls. The team looks to you to restart it.",
      optionA: "Stand up, talk through the problem, and invite quick reactions.",
      optionB: "Give everyone quiet time to write before comparing ideas.",
      feedbackA: "Conversation unlocks an energetic chain of new ideas.",
      feedbackB: "Independent thought produces several carefully formed options.",
    },
    bn: {
      prompt: "ডিসিশন ডেকে ব্রেইনস্টর্ম থেমে গেছে। দলটি আবার শুরু করার জন্য আপনার দিকে তাকায়।",
      optionA: "দাঁড়িয়ে সমস্যাটি নিয়ে কথা বলি এবং দ্রুত মতামত আহ্বান করি।",
      optionB: "ধারণা তুলনা করার আগে সবাইকে নীরবে লেখার সময় দিই।",
      feedbackA: "আলোচনা থেকে একের পর এক প্রাণবন্ত নতুন ধারণা আসে।",
      feedbackB: "স্বাধীন চিন্তা থেকে বেশ কয়েকটি সুগঠিত বিকল্প তৈরি হয়।",
    },
  },
  q10: {
    en: {
      prompt: "The sponsor's brief is vague. The crew needs a direction before the next meeting.",
      optionA: "List the facts we already have and build from what is concrete.",
      optionB: "Read between the lines and design for the future they may be imagining.",
      feedbackA: "The team finds solid ground and a practical starting point.",
      feedbackB: "A larger pattern emerges and gives the project a fresh direction.",
    },
    bn: {
      prompt: "স্পনসরের নির্দেশনা অস্পষ্ট। পরের বৈঠকের আগে দলকে একটি দিক দিতে হবে।",
      optionA: "হাতে থাকা তথ্যগুলো তালিকাভুক্ত করে বাস্তব বিষয় থেকে শুরু করি।",
      optionB: "ইঙ্গিতগুলো বুঝে তারা যে ভবিষ্যৎ কল্পনা করছে তার জন্য নকশা করি।",
      feedbackA: "দলটি একটি শক্ত ভিত্তি ও বাস্তব শুরুর জায়গা খুঁজে পায়।",
      feedbackB: "একটি বড় ধরন স্পষ্ট হয় এবং প্রকল্প নতুন দিক পায়।",
    },
  },
  q11: {
    en: {
      prompt: "Budget cuts mean one activity must go. The most efficient cut affects a group who worked hard for it.",
      optionA: "Protect the group and find savings that distribute the impact.",
      optionB: "Make the cleanest cut so the whole festival remains viable.",
      feedbackA: "The affected group stays included and trust grows across the crew.",
      feedbackB: "The budget stabilizes quickly and the wider plan survives.",
    },
    bn: {
      prompt: "বাজেট কমায় একটি কার্যক্রম বাদ দিতে হবে। সবচেয়ে সহজ কাটটি এমন একটি দলকে প্রভাবিত করবে যারা কঠোর পরিশ্রম করেছে।",
      optionA: "দলটিকে রক্ষা করে প্রভাব ভাগ হয় এমন সাশ্রয়ের পথ খুঁজি।",
      optionB: "পুরো উৎসব টিকিয়ে রাখতে সবচেয়ে কার্যকর কাটটি করি।",
      feedbackA: "প্রভাবিত দলটি যুক্ত থাকে এবং পুরো দলের আস্থা বাড়ে।",
      feedbackB: "বাজেট দ্রুত স্থিতিশীল হয় এবং বড় পরিকল্পনাটি টিকে যায়।",
    },
  },
  q12: {
    en: {
      prompt: "Launch week begins with dozens of moving tasks. The crew asks for your operating rhythm.",
      optionA: "Set daily deadlines and a fixed check-in so nothing drifts.",
      optionB: "Use a live priority board and reshape the day as conditions change.",
      feedbackA: "A steady rhythm makes progress visible and predictable.",
      feedbackB: "The team can redirect energy wherever it matters most.",
    },
    bn: {
      prompt: "লঞ্চ সপ্তাহে অসংখ্য চলমান কাজ শুরু হয়েছে। দলটি কাজের ছন্দ জানতে চায়।",
      optionA: "প্রতিদিনের সময়সীমা ও নির্দিষ্ট চেক-ইন ঠিক করি।",
      optionB: "লাইভ অগ্রাধিকার বোর্ড ব্যবহার করে পরিস্থিতি অনুযায়ী দিন সাজাই।",
      feedbackA: "একটি স্থির ছন্দ অগ্রগতিকে দৃশ্যমান ও অনুমানযোগ্য করে।",
      feedbackB: "দলটি যেখানে সবচেয়ে প্রয়োজন সেখানে শক্তি সরাতে পারে।",
    },
  },
  q13: {
    en: {
      prompt: "You arrive at the launch-night mixer where most faces are new.",
      optionA: "Observe the room, understand the dynamics, then join a promising conversation.",
      optionB: "Introduce myself to the nearest group and start making connections.",
      feedbackA: "You spot the right opening and enter with a clear sense of the room.",
      feedbackB: "A lively first exchange quickly expands your network.",
    },
    bn: {
      prompt: "লঞ্চ নাইটের আয়োজনে এসে দেখলেন বেশিরভাগ মুখই নতুন।",
      optionA: "ঘরটি পর্যবেক্ষণ করে পরিস্থিতি বুঝে সম্ভাবনাময় আলোচনায় যোগ দিই।",
      optionB: "কাছের দলের সঙ্গে পরিচিত হয়ে সংযোগ তৈরি শুরু করি।",
      feedbackA: "সঠিক সুযোগটি দেখে আপনি পরিষ্কার ধারণা নিয়ে আলোচনায় ঢোকেন।",
      feedbackB: "প্রাণবন্ত প্রথম কথোপকথন দ্রুত আপনার পরিচিতি বাড়ায়।",
    },
  },
  q14: {
    en: {
      prompt: "Early visitors leave a wall of comments. You have ten minutes to choose the next improvement.",
      optionA: "Look for hidden patterns and imagine what visitors will want next.",
      optionB: "Count the repeated requests and fix the most concrete issue first.",
      feedbackA: "A future opportunity appears between seemingly unrelated comments.",
      feedbackB: "The most visible visitor frustration is solved immediately.",
    },
    bn: {
      prompt: "প্রথম দর্শনার্থীরা অনেক মন্তব্য রেখে গেছে। পরের উন্নতি বাছতে আপনার হাতে দশ মিনিট।",
      optionA: "লুকানো ধরন খুঁজি এবং দর্শনার্থীরা এরপর কী চাইবে তা কল্পনা করি।",
      optionB: "বারবার আসা অনুরোধ গুনি এবং সবচেয়ে বাস্তব সমস্যাটি আগে ঠিক করি।",
      feedbackA: "আপাত বিচ্ছিন্ন মন্তব্যের মাঝে ভবিষ্যতের একটি সুযোগ দেখা যায়।",
      feedbackB: "দর্শনার্থীদের সবচেয়ে দৃশ্যমান সমস্যাটি সঙ্গে সঙ্গে সমাধান হয়।",
    },
  },
  q15: {
    en: {
      prompt: "The final rehearsal exposes several flaws in a teammate's section.",
      optionA: "Name the issues directly and work through a precise repair list.",
      optionB: "Start with what worked, understand their pressure, then improve it together.",
      feedbackA: "The weak points become clear and the repair moves quickly.",
      feedbackB: "The teammate stays confident and commits to the improvements.",
    },
    bn: {
      prompt: "চূড়ান্ত মহড়ায় একজন সতীর্থের অংশে কয়েকটি সমস্যা ধরা পড়েছে।",
      optionA: "সমস্যাগুলো সরাসরি বলে নির্দিষ্ট মেরামতের তালিকা ধরে কাজ করি।",
      optionB: "ভালো দিক দিয়ে শুরু করে তার চাপ বুঝে একসঙ্গে উন্নতি করি।",
      feedbackA: "দুর্বল দিকগুলো পরিষ্কার হয় এবং দ্রুত মেরামত এগোয়।",
      feedbackB: "সতীর্থ আত্মবিশ্বাসী থাকে এবং উন্নতির কাজে পুরোপুরি যুক্ত হয়।",
    },
  },
  q16: {
    en: {
      prompt: "One hour before opening, the main stage becomes unavailable. The whole crew freezes.",
      optionA: "Treat it as a creative twist and rapidly reshape the experience around a new space.",
      optionB: "Protect the original experience by activating the closest prepared backup.",
      feedbackA: "The surprise becomes a distinctive moment visitors will remember.",
      feedbackB: "The practiced backup restores control and keeps opening on time.",
    },
    bn: {
      prompt: "উদ্বোধনের এক ঘণ্টা আগে মূল মঞ্চ ব্যবহার করা যাচ্ছে না। পুরো দল থমকে গেছে।",
      optionA: "এটিকে সৃজনশীল মোড় হিসেবে নিয়ে নতুন জায়গায় অভিজ্ঞতাটি দ্রুত সাজাই।",
      optionB: "প্রস্তুত সবচেয়ে কাছের বিকল্প চালু করে মূল অভিজ্ঞতাটি রক্ষা করি।",
      feedbackA: "অপ্রত্যাশিত ঘটনাটি দর্শনার্থীদের মনে থাকার মতো বিশেষ মুহূর্ত হয়।",
      feedbackB: "অনুশীলিত বিকল্প নিয়ন্ত্রণ ফিরিয়ে আনে এবং সময়মতো উদ্বোধন হয়।",
    },
  },
}

const COPY = {
  en: {
    eyebrow: "Tomorrow Town",
    title: "Lead the Future Festival",
    subtitle: "The gates open tonight. Travel through four locations, guide your crew, and discover the career paths hidden in your decisions.",
    honest: "Every move can work. Play as yourself—not as the person you think employers expect.",
    start: "Enter Tomorrow Town",
    resume: "Return to my adventure",
    time: "A 5-minute story",
    missions: "4 locations",
    scenarios: "16 decisions",
    settings: "Experience settings",
    settingsHint: "Make the assessment feel comfortable for you.",
    autoAdvance: "Auto-advance",
    autoAdvanceHint: "Continue the story after each decision",
    motion: "Motion effects",
    motionHint: "Use gentle transitions and celebrations",
    compact: "Compact layout",
    compactHint: "Show more content with less spacing",
    largeText: "Larger text",
    largeTextHint: "Increase the question and control size",
    close: "Done",
    progress: "Festival readiness",
    complete: "complete",
    question: "Scene",
    of: "of",
    choose: "What do you do?",
    previous: "Previous scene",
    next: "Continue story",
    submit: "Open my career map",
    analyzing: "Reading the trail you created...",
    selected: "Your move",
    missionComplete: "Compass shard collected!",
    missionCompleteHint: "A new part of your career map is now visible.",
    loading: "Opening the gates to Tomorrow Town...",
    error: "We could not complete your assessment. Your answers are saved—please try again.",
    consequence: "The story changes",
    shards: "shards",
    saved: "Progress saved on this device",
  },
  bn: {
    eyebrow: "টুমরো টাউন",
    title: "ফিউচার ফেস্টিভ্যাল পরিচালনা করুন",
    subtitle: "আজ রাতেই দরজা খুলবে। চারটি জায়গা ঘুরে দলকে নেতৃত্ব দিন এবং আপনার সিদ্ধান্তে লুকানো ক্যারিয়ার পথ আবিষ্কার করুন।",
    honest: "প্রতিটি সিদ্ধান্তই কার্যকর হতে পারে। নিয়োগকর্তা যেটি আশা করে সেটি নয়—নিজের মতো খেলুন।",
    start: "টুমরো টাউনে প্রবেশ করুন",
    resume: "আমার অভিযানে ফিরে যাই",
    time: "৫ মিনিটের গল্প",
    missions: "৪টি জায়গা",
    scenarios: "১৬টি সিদ্ধান্ত",
    settings: "অভিজ্ঞতা নিয়ন্ত্রণ",
    settingsHint: "আপনার জন্য মূল্যায়নটি আরামদায়ক করে নিন।",
    autoAdvance: "স্বয়ংক্রিয়ভাবে এগিয়ে যান",
    autoAdvanceHint: "প্রতিটি সিদ্ধান্তের পর গল্প চালিয়ে যান",
    motion: "অ্যানিমেশন",
    motionHint: "হালকা ট্রানজিশন ও উদযাপন দেখান",
    compact: "কমপ্যাক্ট লেআউট",
    compactHint: "কম জায়গায় বেশি কনটেন্ট দেখান",
    largeText: "বড় লেখা",
    largeTextHint: "প্রশ্ন ও নিয়ন্ত্রণের আকার বাড়ান",
    close: "সম্পন্ন",
    progress: "উৎসবের প্রস্তুতি",
    complete: "সম্পন্ন",
    question: "দৃশ্য",
    of: "/",
    choose: "আপনি কী করবেন?",
    previous: "আগের দৃশ্য",
    next: "গল্প চালিয়ে যান",
    submit: "আমার ক্যারিয়ার মানচিত্র খুলুন",
    analyzing: "আপনার তৈরি পথ বিশ্লেষণ করা হচ্ছে...",
    selected: "আপনার সিদ্ধান্ত",
    missionComplete: "কম্পাসের খণ্ড সংগ্রহ হয়েছে!",
    missionCompleteHint: "আপনার ক্যারিয়ার মানচিত্রের নতুন অংশ এখন দৃশ্যমান।",
    loading: "টুমরো টাউনের দরজা খোলা হচ্ছে...",
    error: "মূল্যায়নটি সম্পন্ন করা যায়নি। আপনার উত্তর সংরক্ষিত আছে—আবার চেষ্টা করুন।",
    consequence: "গল্প বদলে গেল",
    shards: "খণ্ড",
    saved: "এই ডিভাইসে অগ্রগতি সংরক্ষিত",
  },
} as const

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: () => void
  label: string
  hint: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
    >
      <span>
        <span className="block text-sm font-extrabold text-slate-900">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  )
}

function questionMission(question: Question | undefined, index: number, total: number) {
  if (question?.mission && question.mission >= 1 && question.mission <= 4) {
    return question.mission
  }
  return Math.min(4, Math.floor(index / Math.max(1, Math.ceil(total / 4))) + 1)
}

export default function AssessmentPage() {
  const { user, refreshUser } = useUser()
  const { lang } = useLanguage()
  const router = useRouter()
  const copy = COPY[lang]

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [preferences, setPreferences] = useState<ExperiencePreferences>(DEFAULT_PREFERENCES)
  const [started, setStarted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [milestone, setMilestone] = useState<number | null>(null)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (!saved) return
      const draft = JSON.parse(saved) as Draft
      if (draft.answers) setAnswers(draft.answers)
      if (typeof draft.currentQuestion === "number") setCurrentQuestion(Math.max(0, draft.currentQuestion))
      if (draft.started || Object.keys(draft.answers || {}).length > 0) setStarted(true)
      if (draft.preferences) {
        setPreferences(previous => ({ ...previous, ...draft.preferences }))
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadQuestions() {
      setLoadingQuestions(true)
      try {
        const response = await fetch(`/api/assessment?lang=${lang}`)
        if (!response.ok) throw new Error("Could not load questions")
        const data = (await response.json()) as Question[]
        if (active) {
          setQuestions(Array.isArray(data) ? data : [])
          setCurrentQuestion(previous => Math.min(previous, Math.max(0, data.length - 1)))
        }
      } catch (loadError) {
        console.error("Failed to load assessment questions", loadError)
        if (active) setQuestions([])
      } finally {
        if (active) setLoadingQuestions(false)
      }
    }
    loadQuestions()
    return () => {
      active = false
    }
  }, [lang])

  useEffect(() => {
    if (!started && Object.keys(answers).length === 0) return
    const draft: Draft = { answers, currentQuestion, started, preferences }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [answers, currentQuestion, preferences, started])

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0
  const activeQuestion = questions[currentQuestion]
  const activeScene = activeQuestion ? GAME_SCENES[activeQuestion.id]?.[lang] : undefined
  const activeMission = questionMission(activeQuestion, currentQuestion, questions.length)
  const isLastQuestion = currentQuestion === questions.length - 1
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const missionState = useMemo(
    () =>
      MISSIONS.map((mission, missionIndex) => {
        const missionNumber = missionIndex + 1
        const indexes = questions
          .map((question, index) =>
            questionMission(question, index, questions.length) === missionNumber ? index : -1
          )
          .filter(index => index >= 0)
        const completed = indexes.length > 0 && indexes.every(index => answers[questions[index].id] !== undefined)
        const answered = indexes.filter(index => answers[questions[index].id] !== undefined).length
        const previousCompleted =
          missionIndex === 0 ||
          questions
            .map((question, index) =>
              questionMission(question, index, questions.length) === missionIndex ? index : -1
            )
            .filter(index => index >= 0)
            .every(index => answers[questions[index].id] !== undefined)
        return { mission, missionNumber, indexes, completed, answered, unlocked: previousCompleted }
      }),
    [answers, questions]
  )

  function updatePreference<K extends keyof ExperiencePreferences>(
    key: K,
    value: ExperiencePreferences[K]
  ) {
    setPreferences(previous => {
      const next = { ...previous, [key]: value }
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        const draft = saved ? (JSON.parse(saved) as Draft) : {}
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, preferences: next }))
      } catch {
        // Preference persistence is a convenience; the in-session control
        // should continue working even if browser storage is unavailable.
      }
      return next
    })
  }

  function goToQuestion(index: number) {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setMilestone(null)
    setCurrentQuestion(Math.max(0, Math.min(index, questions.length - 1)))
  }

  function answerQuestion(value: number) {
    if (!activeQuestion) return
    setAnswers(previous => ({ ...previous, [activeQuestion.id]: value }))
    setError(null)

    if (!preferences.autoAdvance || isLastQuestion) return
    if (advanceTimer.current) clearTimeout(advanceTimer.current)

    const nextMission = questionMission(questions[currentQuestion + 1], currentQuestion + 1, questions.length)
    const crossedMission = nextMission !== activeMission
    if (crossedMission) setMilestone(activeMission)

    const delay = preferences.motion ? (crossedMission ? 1500 : 1050) : crossedMission ? 800 : 650
    advanceTimer.current = setTimeout(() => {
      setMilestone(null)
      setCurrentQuestion(previous => Math.min(previous + 1, questions.length - 1))
    }, delay)
  }

  async function submit() {
    if (!allAnswered) return
    setSubmitting(true)
    setError(null)
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      })
      const data = await response.json()
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to submit assessment")
      }

      const scoredMbti = data.result?.personality
      if (scoredMbti) localStorage.setItem("guestMbti", scoredMbti)

      const recommendationIds = Array.isArray(data.recommendations)
        ? data.recommendations
            .map((recommendation: Recommendation) => recommendation?.id)
            .filter((id: unknown): id is string => typeof id === "string" && id.length > 0)
        : []
      if (recommendationIds.length > 0) {
        localStorage.setItem("assessment_recommended_career_ids", JSON.stringify(recommendationIds))
      }

      localStorage.removeItem(DRAFT_KEY)
      if (user) await refreshUser()
      router.push("/explore-careers")
    } catch (submitError) {
      console.error("Submission error:", submitError)
      setError(copy.error)
    } finally {
      setSubmitting(false)
    }
  }

  const transitionClass = preferences.motion
    ? "transition-all duration-300 ease-out"
    : "transition-none"
  const cardSpacing = preferences.compact ? "p-4 sm:p-5" : "p-5 sm:p-8 lg:p-10"
  const questionSize = preferences.largeText
    ? "text-2xl sm:text-3xl lg:text-4xl"
    : "text-xl sm:text-2xl lg:text-3xl"

  if (loadingQuestions) {
    return (
      <DashboardLayout activeTab="assessment">
        <div className="flex min-h-[62vh] flex-col items-center justify-center">
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-indigo-50">
            <div className="absolute inset-2 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
            <span className="text-2xl" aria-hidden="true">🧭</span>
          </div>
          <p className="mt-5 font-bold text-slate-600">{copy.loading}</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab="assessment">
      <div
        className={`${transitionClass} mx-auto w-full min-w-0 max-w-6xl ${
          preferences.largeText ? "text-[1.04rem]" : ""
        }`}
      >
        {milestone !== null && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed left-1/2 top-6 z-50 w-[min(90vw,420px)] -translate-x-1/2 rounded-3xl border border-emerald-200 bg-white p-5 text-center shadow-2xl shadow-emerald-900/10 ${transitionClass}`}
          >
            <div className="text-3xl" aria-hidden="true">{MISSIONS[milestone - 1].icon}</div>
            <p className="mt-2 font-black text-emerald-700">{copy.missionComplete}</p>
            <p className="mt-1 text-sm text-slate-600">{copy.missionCompleteHint}</p>
          </div>
        )}

        {showSettings && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/30 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="experience-settings-title"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setShowSettings(false)
            }}
          >
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-slate-50 p-5 shadow-2xl sm:rounded-3xl sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="experience-settings-title" className="text-xl font-black text-slate-950">
                    {copy.settings}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{copy.settingsHint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-xl font-bold text-slate-500 shadow-sm hover:text-slate-900"
                  aria-label={copy.close}
                >
                  ×
                </button>
              </div>
              <div className="space-y-3">
                <Toggle
                  checked={preferences.autoAdvance}
                  onChange={() => updatePreference("autoAdvance", !preferences.autoAdvance)}
                  label={copy.autoAdvance}
                  hint={copy.autoAdvanceHint}
                />
                <Toggle
                  checked={preferences.motion}
                  onChange={() => updatePreference("motion", !preferences.motion)}
                  label={copy.motion}
                  hint={copy.motionHint}
                />
                <Toggle
                  checked={preferences.compact}
                  onChange={() => updatePreference("compact", !preferences.compact)}
                  label={copy.compact}
                  hint={copy.compactHint}
                />
                <Toggle
                  checked={preferences.largeText}
                  onChange={() => updatePreference("largeText", !preferences.largeText)}
                  label={copy.largeText}
                  hint={copy.largeTextHint}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 font-extrabold text-white hover:bg-slate-800"
              >
                {copy.close}
              </button>
            </div>
          </div>
        )}

        {!started ? (
          <section className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 text-white shadow-xl shadow-indigo-900/10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />
            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:p-14">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-100">
                    <span aria-hidden="true">✦</span> {copy.eyebrow}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15"
                  >
                    <span aria-hidden="true">⚙</span> <span className="hidden sm:inline">{copy.settings}</span>
                  </button>
                </div>
                <h1 className="mt-8 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                  {copy.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-indigo-100 sm:text-lg">
                  {copy.subtitle}
                </p>
                <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-indigo-50 sm:text-sm">
                  {[copy.time, copy.missions, copy.scenarios].map(item => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/10 px-3 py-2">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-relaxed text-indigo-50">
                  <span className="mr-2" aria-hidden="true">💡</span>{copy.honest}
                </div>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  disabled={questions.length === 0}
                  className="mt-7 inline-flex min-h-14 items-center justify-center rounded-2xl bg-cyan-300 px-7 py-3.5 font-black text-indigo-950 shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {answeredCount > 0 ? copy.resume : copy.start}
                  <span className="ml-3 text-lg" aria-hidden="true">→</span>
                </button>
              </div>

              <div className="flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-sm">
                  <div className="absolute inset-[12%] rounded-full border border-white/15 bg-white/10 shadow-2xl shadow-indigo-950/30 backdrop-blur">
                    <div className="absolute inset-[18%] grid place-items-center rounded-full border border-white/20 bg-indigo-950/30">
                      <div className="text-center">
                        <div className="text-5xl" aria-hidden="true">🧭</div>
                        <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-cyan-200">
                          {copy.eyebrow}
                        </p>
                      </div>
                    </div>
                  </div>
                  {MISSIONS.map((mission, index) => {
                    const positions = [
                      "left-1/2 top-0 -translate-x-1/2",
                      "right-0 top-1/2 -translate-y-1/2",
                      "bottom-0 left-1/2 -translate-x-1/2",
                      "left-0 top-1/2 -translate-y-1/2",
                    ]
                    return (
                      <div
                        key={mission.en.name}
                        className={`absolute ${positions[index]} grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/15 text-2xl shadow-lg backdrop-blur`}
                        aria-hidden="true"
                      >
                        {mission.icon}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="min-w-0 space-y-5">
            <header className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">{copy.eyebrow}</p>
                  <h1 className="mt-1 truncate text-xl font-black text-slate-950 sm:text-2xl">{copy.title}</h1>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <span aria-hidden="true">⚙</span> <span className="hidden sm:inline">{copy.settings}</span>
                </button>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                  aria-label={copy.progress}
                >
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 ${transitionClass}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="shrink-0 text-xs font-black text-indigo-700">
                  {progress}% {copy.complete}
                </span>
              </div>
            </header>

            {error && (
              <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="min-w-0 max-w-full rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:self-start lg:p-4">
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
                  {missionState.map(({ mission, missionNumber, indexes, completed, answered, unlocked }) => {
                    const active = activeMission === missionNumber
                    const localized = mission[lang]
                    return (
                      <button
                        key={mission.en.name}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => indexes[0] !== undefined && goToQuestion(indexes[0])}
                        className={`min-w-[185px] rounded-2xl border p-3 text-left ${transitionClass} lg:min-w-0 lg:w-full ${
                          active
                            ? "border-indigo-200 bg-indigo-50 shadow-sm"
                            : completed
                              ? "border-emerald-100 bg-emerald-50/60"
                              : "border-transparent bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg ${
                              completed ? "bg-emerald-500" : active ? "bg-indigo-600" : "bg-white"
                            } ${completed || active ? "text-white" : ""}`}
                            aria-hidden="true"
                          >
                            {completed ? "✓" : mission.icon}
                          </span>
                          <span className="min-w-0">
                            <span className={`block truncate text-sm font-black ${active ? "text-indigo-950" : "text-slate-800"}`}>
                              {localized.name}
                            </span>
                            <span className="mt-0.5 block text-[11px] font-bold text-slate-500">
                              {answered}/{indexes.length} {copy.complete}
                            </span>
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </aside>

              {activeQuestion && activeScene && (
                <main
                  key={activeQuestion.id}
                  className={`min-w-0 max-w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 ${transitionClass}`}
                >
                  <div className={`${cardSpacing} border-b border-slate-100 bg-gradient-to-br from-white to-indigo-50/50`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-700">
                        <span aria-hidden="true">{MISSIONS[activeMission - 1].icon}</span>
                        {MISSIONS[activeMission - 1][lang].name}
                      </span>
                      <span className="text-xs font-extrabold text-slate-500">
                        {copy.question} {currentQuestion + 1} {copy.of} {questions.length}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-500">
                      {MISSIONS[activeMission - 1][lang].hint}
                    </p>
                    <h2 className={`${questionSize} mt-4 font-black leading-tight tracking-tight text-slate-950`}>
                      {activeScene.prompt}
                    </h2>
                  </div>

                  <div className={cardSpacing}>
                    <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.14em] text-indigo-600">{copy.choose}</p>
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                      {[
                        { value: 5, label: activeScene.optionA, marker: "A", feedback: activeScene.feedbackA },
                        { value: 1, label: activeScene.optionB, marker: "B", feedback: activeScene.feedbackB },
                      ].map(choice => {
                        const value = choice.value
                        const selected = answers[activeQuestion.id] === value
                        return (
                          <button
                            key={choice.marker}
                            type="button"
                            onClick={() => answerQuestion(value)}
                            aria-label={choice.label}
                            aria-pressed={selected}
                            className={`group flex min-h-32 min-w-0 items-start gap-4 rounded-2xl border-2 p-4 text-left sm:min-h-40 sm:p-5 ${transitionClass} ${
                              selected
                                ? "border-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200"
                                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-1 hover:border-indigo-300 hover:bg-indigo-50"
                            }`}
                          >
                            <span
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black ${
                                selected ? "bg-white text-indigo-700" : "bg-slate-100 text-slate-600 group-hover:bg-white"
                              }`}
                              aria-hidden="true"
                            >
                              {selected ? "✓" : choice.marker}
                            </span>
                            <span className={`font-extrabold leading-relaxed ${preferences.largeText ? "text-lg" : "text-sm sm:text-base"}`}>
                              {choice.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    {answers[activeQuestion.id] !== undefined && (
                      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" aria-live="polite">
                        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                          ✦ {copy.consequence}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-relaxed text-emerald-950">
                          {answers[activeQuestion.id] === 5 ? activeScene.feedbackA : activeScene.feedbackB}
                        </p>
                      </div>
                    )}
                  </div>

                  <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => goToQuestion(currentQuestion - 1)}
                      disabled={currentQuestion === 0}
                      className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <span aria-hidden="true">← </span>{copy.previous}
                    </button>

                    <span className="hidden items-center gap-1.5 text-[11px] font-bold text-slate-400 md:flex">
                      <span className="text-emerald-500" aria-hidden="true">●</span> {copy.saved}
                    </span>

                    {isLastQuestion ? (
                      <button
                        type="button"
                        onClick={submit}
                        disabled={!allAnswered || submitting}
                        className="min-h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-black text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting ? copy.analyzing : copy.submit}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => goToQuestion(currentQuestion + 1)}
                        disabled={answers[activeQuestion.id] === undefined}
                        className="min-h-11 rounded-xl bg-slate-950 px-5 py-2 text-sm font-black text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {copy.next}<span aria-hidden="true"> →</span>
                      </button>
                    )}
                  </footer>
                </main>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
