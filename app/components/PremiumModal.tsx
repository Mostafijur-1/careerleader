"use client"

import { useLanguage } from "../contexts/LanguageContext"

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const { lang } = useLanguage()

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-100 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition active:scale-90"
          aria-label="Close"
        >
          ✕
        </button>
        <span className="text-5xl block mb-4">👑</span>
        <h3 className="text-xl font-black text-slate-900">
          {lang === 'bn' ? "প্রিমিয়াম ফিচার আপডেট" : "Premium Feature"}
        </h3>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          {lang === 'bn' 
            ? "এই ফিচারটি শুধুমাত্র প্রিমিয়াম মেম্বারদের জন্য প্রযোজ্য। প্রিমিয়াম অ্যাকাউন্টের মাধ্যমে আপনি পাবেন ১-অন-১ সরাসরি মেন্টর চ্যাট, কাস্টম রোডম্যাপ ট্র্যাকিং এবং বিশদ ক্যারিয়ার প্রস্তুত গাইডলাইন।" 
            : "This features requires a premium subscription. Upgrading unlocks 1-on-1 mentor calls, custom roadmaps, goals logging, and 50+ detailed career paths."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl shadow-md transition active:scale-98 text-xs cursor-pointer"
          >
            {lang === 'bn' ? "প্রিমিয়ামে সাবস্ক্রাইব করুন" : "Subscribe to Premium"}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-bold transition text-xs rounded-xl hover:bg-slate-50 active:scale-98 cursor-pointer"
          >
            {lang === 'bn' ? "পরে" : "Maybe Later"}
          </button>
        </div>
      </div>
    </div>
  )
}
