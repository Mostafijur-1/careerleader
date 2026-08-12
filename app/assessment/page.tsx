"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
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
      prompt: "Your festival team meets for the first time. Everyone is quiet. What would you do?",
      optionA: "Start a group discussion and get everyone talking.",
      optionB: "Think alone first, then share my idea with the team.",
      feedbackA: "The group becomes active and starts connecting.",
      feedbackB: "Your quiet thinking gives the team a clear idea.",
    },
    bn: {
      prompt: "উৎসবের দল প্রথমবার মিলেছে। সবাই চুপচাপ। আপনি কী করবেন?",
      optionA: "দলীয় আলোচনা শুরু করে সবাইকে কথা বলাই।",
      optionB: "আগে একা ভেবে নিই, তারপর দলকে আমার ধারণা বলি।",
      feedbackA: "দলটি সক্রিয় হয় এবং সবাই কথা বলা শুরু করে।",
      feedbackB: "আপনার ভাবনা দলকে একটি পরিষ্কার ধারণা দেয়।",
    },
  },
  q2: {
    en: {
      prompt: "A display kit arrives in separate pieces. You have one hour to build it. What would you do?",
      optionA: "Follow the instructions and test each piece.",
      optionB: "Look at the pieces and try a new way to build it.",
      feedbackA: "The display is built correctly, one step at a time.",
      feedbackB: "The team discovers a new way to use the pieces.",
    },
    bn: {
      prompt: "একটি ডিসপ্লে কিট আলাদা আলাদা অংশে এসেছে। এক ঘণ্টায় বানাতে হবে। আপনি কী করবেন?",
      optionA: "নির্দেশনা মেনে প্রতিটি অংশ পরীক্ষা করি।",
      optionB: "অংশগুলো দেখে নতুনভাবে বানানোর চেষ্টা করি।",
      feedbackA: "ধাপে ধাপে ডিসপ্লেটি ঠিকভাবে তৈরি হয়।",
      feedbackB: "দলটি অংশগুলো ব্যবহারের নতুন উপায় খুঁজে পায়।",
    },
  },
  q3: {
    en: {
      prompt: "A team member did not finish an important task and looks stressed. What would you do first?",
      optionA: "Listen to him and help him feel confident again.",
      optionB: "Update the task list so the team can continue working.",
      feedbackA: "He feels supported and is ready to help again.",
      feedbackB: "The problem is cleared and the team keeps moving.",
    },
    bn: {
      prompt: "দলের একজন গুরুত্বপূর্ণ কাজ শেষ করতে পারেনি এবং খুব চিন্তিত। আপনি আগে কী করবেন?",
      optionA: "তার কথা শুনি এবং আত্মবিশ্বাস ফিরিয়ে দিই।",
      optionB: "কাজের তালিকা ঠিক করি, যাতে দল কাজ চালিয়ে যেতে পারে।",
      feedbackA: "সে সাহায্য পেয়েছে মনে করে এবং আবার কাজে ফেরে।",
      feedbackB: "সমস্যা দূর হয় এবং দল কাজ চালিয়ে যায়।",
    },
  },
  q4: {
    en: {
      prompt: "The festival starts in two days. How would you organize the work?",
      optionA: "Make a clear schedule with tasks, people, and deadlines.",
      optionB: "Set the main goal but change the plan when needed.",
      feedbackA: "Everyone knows what to do and when to do it.",
      feedbackB: "The team can adjust when something changes.",
    },
    bn: {
      prompt: "উৎসব শুরু হতে আর দুই দিন বাকি। আপনি কাজ কীভাবে সাজাবেন?",
      optionA: "কাজ, দায়িত্ব ও সময়সীমাসহ পরিষ্কার পরিকল্পনা করি।",
      optionB: "মূল লক্ষ্য ঠিক রাখি, তবে দরকার হলে পরিকল্পনা বদলাই।",
      feedbackA: "কখন কী করতে হবে সবাই জানে।",
      feedbackB: "কিছু বদলালে দল সহজে মানিয়ে নিতে পারে।",
    },
  },
  q5: {
    en: {
      prompt: "You have one hour to create an idea. Where would you think best?",
      optionA: "Work alone in a quiet place, then share my idea.",
      optionB: "Talk with the team and build the idea together.",
      feedbackA: "You develop a clear idea without interruption.",
      feedbackB: "The discussion quickly creates more ideas.",
    },
    bn: {
      prompt: "এক ঘণ্টার মধ্যে একটি ধারণা তৈরি করতে হবে। কোথায় সবচেয়ে ভালো ভাবতে পারবেন?",
      optionA: "শান্ত জায়গায় একা কাজ করি, তারপর ধারণাটি বলি।",
      optionB: "দলের সঙ্গে কথা বলে একসঙ্গে ধারণা তৈরি করি।",
      feedbackA: "বাধা ছাড়া আপনি একটি পরিষ্কার ধারণা তৈরি করেন।",
      feedbackB: "আলোচনা থেকে দ্রুত আরও ধারণা আসে।",
    },
  },
  q6: {
    en: {
      prompt: "A sponsor wants something completely new, but it may fail. What would you choose?",
      optionA: "Try the bold new idea, even though it is risky.",
      optionB: "Use a tested idea and make it work very well.",
      feedbackA: "The new possibility excites the team.",
      feedbackB: "The idea is reliable and ready to use.",
    },
    bn: {
      prompt: "স্পনসর একদম নতুন কিছু চায়, কিন্তু সেটি ব্যর্থও হতে পারে। আপনি কী বেছে নেবেন?",
      optionA: "ঝুঁকি থাকলেও নতুন ধারণাটি চেষ্টা করি।",
      optionB: "পরীক্ষিত ধারণা নিয়ে সেটি খুব ভালোভাবে করি।",
      feedbackA: "নতুন সম্ভাবনায় দলটি উৎসাহিত হয়।",
      feedbackB: "ধারণাটি নির্ভরযোগ্য ও ব্যবহারের জন্য প্রস্তুত হয়।",
    },
  },
  q7: {
    en: {
      prompt: "Two suppliers are almost equal. One has better results, but the team likes the other more. Who would you choose?",
      optionA: "Choose the supplier with the stronger evidence.",
      optionB: "Choose the supplier the team trusts more.",
      feedbackA: "The decision is easy to explain with facts.",
      feedbackB: "The team supports the decision strongly.",
    },
    bn: {
      prompt: "দুই সরবরাহকারী প্রায় সমান। একজনের ফল ভালো, কিন্তু দল অন্যজনকে বেশি পছন্দ করে। কাকে নেবেন?",
      optionA: "যার পক্ষে বেশি প্রমাণ আছে তাকে বেছে নিই।",
      optionB: "দল যাকে বেশি বিশ্বাস করে তাকে বেছে নিই।",
      feedbackA: "তথ্য দিয়ে সিদ্ধান্তটি সহজে বোঝানো যায়।",
      feedbackB: "দলটি সিদ্ধান্তটিকে জোরালোভাবে সমর্থন করে।",
    },
  },
  q8: {
    en: {
      prompt: "The weather forecast keeps changing. What would you do about the outdoor stage?",
      optionA: "Keep several plans ready until the weather is clearer.",
      optionB: "Choose one backup plan now and prepare everything for it.",
      feedbackA: "The team can change plans when new information arrives.",
      feedbackB: "Everyone knows the backup plan and can prepare for it.",
    },
    bn: {
      prompt: "আবহাওয়ার খবর বারবার বদলাচ্ছে। খোলা মঞ্চ নিয়ে আপনি কী করবেন?",
      optionA: "আবহাওয়া পরিষ্কার না হওয়া পর্যন্ত কয়েকটি পরিকল্পনা প্রস্তুত রাখি।",
      optionB: "এখনই একটি বিকল্প ঠিক করে তার জন্য সব প্রস্তুতি নিই।",
      feedbackA: "নতুন খবর এলে দল পরিকল্পনা বদলাতে পারে।",
      feedbackB: "সবাই বিকল্প পরিকল্পনাটি জানে এবং প্রস্তুতি নিতে পারে।",
    },
  },
  q9: {
    en: {
      prompt: "The team has run out of ideas. How would you help them start again?",
      optionA: "Talk about the problem and ask everyone for quick ideas.",
      optionB: "Let everyone think and write quietly before sharing.",
      feedbackA: "The discussion creates many new ideas.",
      feedbackB: "Quiet thinking creates several careful ideas.",
    },
    bn: {
      prompt: "দলের নতুন ধারণা আসছে না। আবার শুরু করতে আপনি কী করবেন?",
      optionA: "সমস্যা নিয়ে কথা বলি এবং সবার কাছে দ্রুত ধারণা চাই।",
      optionB: "সবাইকে চুপচাপ ভেবে লিখতে দিই, তারপর আলোচনা করি।",
      feedbackA: "আলোচনা থেকে অনেক নতুন ধারণা আসে।",
      feedbackB: "শান্তভাবে ভাবার পর কয়েকটি ভালো ধারণা আসে।",
    },
  },
  q10: {
    en: {
      prompt: "The sponsor's instructions are unclear. How would you choose a direction?",
      optionA: "Start with the clear facts we already have.",
      optionB: "Think about what the sponsor may want in the future.",
      feedbackA: "The team gets a clear and practical starting point.",
      feedbackB: "The team finds a fresh direction for the project.",
    },
    bn: {
      prompt: "স্পনসরের নির্দেশনা পরিষ্কার নয়। আপনি কীভাবে একটি দিক বেছে নেবেন?",
      optionA: "আমাদের কাছে থাকা পরিষ্কার তথ্য থেকে শুরু করি।",
      optionB: "স্পনসর ভবিষ্যতে কী চাইতে পারে তা ভাবি।",
      feedbackA: "দলটি কাজ শুরুর পরিষ্কার ও বাস্তব জায়গা পায়।",
      feedbackB: "দলটি প্রকল্পের জন্য নতুন একটি দিক খুঁজে পায়।",
    },
  },
  q11: {
    en: {
      prompt: "The budget is smaller, so one activity must be removed. The easiest choice would hurt a hardworking group. What would you do?",
      optionA: "Find other small savings so the group can stay.",
      optionB: "Remove that activity so the rest of the festival can continue.",
      feedbackA: "The group stays included and the team builds trust.",
      feedbackB: "The budget is fixed and the main festival plan continues.",
    },
    bn: {
      prompt: "বাজেট কম, তাই একটি কার্যক্রম বাদ দিতে হবে। সহজ সিদ্ধান্তটি পরিশ্রমী একটি দলকে ক্ষতি করবে। আপনি কী করবেন?",
      optionA: "অন্য জায়গায় অল্প অল্প খরচ কমিয়ে দলটিকে রাখি।",
      optionB: "বাকি উৎসব চালাতে সেই কার্যক্রমটি বাদ দিই।",
      feedbackA: "দলটি সঙ্গে থাকে এবং সবার বিশ্বাস বাড়ে।",
      feedbackB: "বাজেট ঠিক হয় এবং উৎসবের মূল পরিকল্পনা চলতে থাকে।",
    },
  },
  q12: {
    en: {
      prompt: "There are many tasks during launch week. How would you manage them?",
      optionA: "Set daily deadlines and meet at the same time each day.",
      optionB: "Keep changing the task order as new needs appear.",
      feedbackA: "Everyone can clearly see the team's progress.",
      feedbackB: "The team can focus on whatever is most important now.",
    },
    bn: {
      prompt: "লঞ্চ সপ্তাহে অনেক কাজ আছে। আপনি সেগুলো কীভাবে পরিচালনা করবেন?",
      optionA: "প্রতিদিনের সময়সীমা ঠিক করি এবং একই সময়ে বৈঠক করি।",
      optionB: "নতুন প্রয়োজন এলে কাজের গুরুত্ব ও ক্রম বদলাই।",
      feedbackA: "দলের অগ্রগতি সবাই পরিষ্কারভাবে দেখতে পায়।",
      feedbackB: "দলটি এখন সবচেয়ে জরুরি কাজে মন দিতে পারে।",
    },
  },
  q13: {
    en: {
      prompt: "You arrive at an event where you do not know most people. What would you do?",
      optionA: "Watch for a while, then join a suitable conversation.",
      optionB: "Introduce myself to the nearest group right away.",
      feedbackA: "You understand the room before joining a conversation.",
      feedbackB: "You quickly meet and connect with new people.",
    },
    bn: {
      prompt: "আপনি এমন একটি অনুষ্ঠানে এসেছেন, যেখানে বেশিরভাগ মানুষ অপরিচিত। আপনি কী করবেন?",
      optionA: "কিছুক্ষণ দেখি, তারপর উপযুক্ত আলোচনায় যোগ দিই।",
      optionB: "সঙ্গে সঙ্গে কাছের দলের সঙ্গে পরিচিত হই।",
      feedbackA: "আলোচনায় যোগ দেওয়ার আগে আপনি পরিবেশটি বুঝে নেন।",
      feedbackB: "আপনি দ্রুত নতুন মানুষের সঙ্গে পরিচিত হন।",
    },
  },
  q14: {
    en: {
      prompt: "Visitors left many comments. You have ten minutes to choose one improvement. What would you do?",
      optionA: "Look for patterns and think about what visitors may want next.",
      optionB: "Find the most common clear problem and fix it first.",
      feedbackA: "You discover a useful idea for the future.",
      feedbackB: "You quickly solve the problem visitors mention most.",
    },
    bn: {
      prompt: "দর্শনার্থীরা অনেক মন্তব্য করেছে। দশ মিনিটে একটি উন্নতি বেছে নিতে হবে। আপনি কী করবেন?",
      optionA: "মন্তব্যে মিল খুঁজি এবং পরে তারা কী চাইতে পারে তা ভাবি।",
      optionB: "সবচেয়ে বেশি বলা পরিষ্কার সমস্যাটি আগে ঠিক করি।",
      feedbackA: "আপনি ভবিষ্যতের জন্য একটি ভালো ধারণা খুঁজে পান।",
      feedbackB: "দর্শনার্থীদের সবচেয়ে বেশি বলা সমস্যাটি দ্রুত ঠিক হয়।",
    },
  },
  q15: {
    en: {
      prompt: "You find several problems in a teammate's work during rehearsal. How would you respond?",
      optionA: "Point out the problems clearly and make a fix list.",
      optionB: "Mention the good parts first, then improve it together.",
      feedbackA: "The problems become clear and are fixed quickly.",
      feedbackB: "Your teammate stays confident and helps improve the work.",
    },
    bn: {
      prompt: "মহড়ার সময় সতীর্থের কাজে কয়েকটি সমস্যা পেলেন। আপনি কীভাবে বলবেন?",
      optionA: "সমস্যাগুলো পরিষ্কারভাবে বলি এবং ঠিক করার তালিকা করি।",
      optionB: "আগে ভালো দিক বলি, তারপর একসঙ্গে উন্নতি করি।",
      feedbackA: "সমস্যাগুলো পরিষ্কার হয় এবং দ্রুত ঠিক করা যায়।",
      feedbackB: "সতীর্থ আত্মবিশ্বাসী থাকে এবং উন্নতিতে সাহায্য করে।",
    },
  },
  q16: {
    en: {
      prompt: "One hour before opening, the main stage cannot be used. What would you do?",
      optionA: "Quickly create a new experience in another space.",
      optionB: "Use the prepared backup that is closest to the original plan.",
      feedbackA: "The sudden change becomes a memorable part of the event.",
      feedbackB: "The backup keeps the event under control and on time.",
    },
    bn: {
      prompt: "উদ্বোধনের এক ঘণ্টা আগে মূল মঞ্চ ব্যবহার করা যাচ্ছে না। আপনি কী করবেন?",
      optionA: "অন্য জায়গায় দ্রুত নতুনভাবে অনুষ্ঠান সাজাই।",
      optionB: "মূল পরিকল্পনার কাছাকাছি প্রস্তুত বিকল্পটি ব্যবহার করি।",
      feedbackA: "হঠাৎ পরিবর্তনটি অনুষ্ঠানের স্মরণীয় অংশ হয়ে যায়।",
      feedbackB: "বিকল্প পরিকল্পনায় অনুষ্ঠান নিয়ন্ত্রণে ও সময়মতো থাকে।",
    },
  },
}

const ASSESSMENT_IMAGES: Record<string, { src: string; en: string; bn: string }> = {
  q1: { src: "/images/assessment/q1.webp", en: "Male students choosing between a lively team huddle and quiet idea work", bn: "দলীয় আলোচনা ও শান্তভাবে ভাবার মধ্যে বেছে নিচ্ছে ছাত্ররা" },
  q2: { src: "/images/assessment/q2.webp", en: "A male student assembling a festival display kit", bn: "উৎসবের ডিসপ্লে কিট তৈরি করছে একজন ছাত্র" },
  q3: { src: "/images/assessment/q3.webp", en: "A male student supporting an overwhelmed teammate", bn: "চাপগ্রস্ত সতীর্থকে সহায়তা করছে একজন ছাত্র" },
  q4: { src: "/images/assessment/q4.webp", en: "Male students planning a festival timeline", bn: "উৎসবের সময়সূচি পরিকল্পনা করছে ছাত্ররা" },
  q5: { src: "/images/assessment/q5.webp", en: "A male student choosing where to develop an idea", bn: "কোথায় ধারণা নিয়ে কাজ করবে তা বেছে নিচ্ছে একজন ছাত্র" },
  q6: { src: "/images/assessment/q6.webp", en: "Male students comparing a bold prototype with a proven display", bn: "সাহসী প্রোটোটাইপ ও পরীক্ষিত ডিসপ্লে তুলনা করছে ছাত্ররা" },
  q7: { src: "/images/assessment/q7.webp", en: "Male students weighing evidence and team enthusiasm", bn: "প্রমাণ ও দলের আগ্রহ বিবেচনা করছে ছাত্ররা" },
  q8: { src: "/images/assessment/q8.webp", en: "A male festival crew planning for changing weather", bn: "পরিবর্তনশীল আবহাওয়ার জন্য পরিকল্পনা করছে ছাত্রদের দল" },
  q9: { src: "/images/assessment/q9.webp", en: "Male students restarting a stalled brainstorm", bn: "থেমে যাওয়া ব্রেইনস্টর্ম আবার শুরু করছে ছাত্ররা" },
  q10: { src: "/images/assessment/q10.webp", en: "Male students finding direction in an unclear brief", bn: "অস্পষ্ট নির্দেশনা থেকে দিক খুঁজছে ছাত্ররা" },
  q11: { src: "/images/assessment/q11.webp", en: "A male student balancing efficiency with care for his team", bn: "দক্ষতা ও দলের প্রতি যত্নের ভারসাম্য করছে একজন ছাত্র" },
  q12: { src: "/images/assessment/q12.webp", en: "A male student crew organizing launch-week tasks", bn: "লঞ্চ সপ্তাহের কাজ সাজাচ্ছে ছাত্রদের দল" },
  q13: { src: "/images/assessment/q13.webp", en: "A male student entering an event with unfamiliar faces", bn: "অপরিচিতদের অনুষ্ঠানে প্রবেশ করছে একজন ছাত্র" },
  q14: { src: "/images/assessment/q14.webp", en: "A male student finding patterns in visitor feedback", bn: "দর্শনার্থীদের মতামতে ধরন খুঁজছে একজন ছাত্র" },
  q15: { src: "/images/assessment/q15.webp", en: "Male students giving constructive rehearsal feedback", bn: "মহড়ায় গঠনমূলক মতামত দিচ্ছে ছাত্ররা" },
  q16: { src: "/images/assessment/q16.webp", en: "A male student crew responding to a last-minute stage change", bn: "শেষ মুহূর্তের মঞ্চ পরিবর্তন সামলাচ্ছে ছাত্রদের দল" },
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
  const activeImage = activeQuestion ? ASSESSMENT_IMAGES[activeQuestion.id] : undefined
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
                    {activeImage && (
                      <div className="relative mt-5 aspect-[3/2] w-full overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-100 shadow-sm">
                        <Image
                          src={activeImage.src}
                          alt={activeImage[lang]}
                          fill
                          priority={currentQuestion === 0}
                          sizes="(min-width: 1024px) 760px, 100vw"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/30" />
                      </div>
                    )}
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
