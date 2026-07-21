"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setUser } = useUser();
  const { lang, t } = useLanguage();
  const router = useRouter();
  const a = t.auth;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type] = useState<"student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    setLoading(true);
    try {
      const payload = {
        action: mode,
        type,
        email,
        password,
        name: mode === "register" ? name : undefined,
      };
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readJsonSafely(res);
      if (res.ok) {
        setMessage(data?.message || "Success");
        setMessageType("success");

        if (mode === "login") {
          setUser(data?.user || null);
          const role = data?.user?.type;
          setTimeout(() => {
            onClose();
            setMessage("");
            if (role === "mentor") {
              router.push("/mentor");
            } else if (role === "admin") {
              router.push("/admin");
            } else {
              router.push("/dashboard");
            }
          }, 1500);
        }
        if (mode === "register") {
          setTimeout(() => {
            setMode("login");
            setEmail("");
            setPassword("");
            setName("");
            setMessage("");
            setMessageType("");
          }, 1500);
        }
      } else {
        setMessage(data?.error || "Unable to sign in. Please try again.");
        setMessageType("error");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch {
      setMessage("Unable to reach the sign-in service. Please check your connection and try again.");
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-[#112954]/30 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white border border-gray-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] w-full max-w-md max-h-[92vh] flex flex-col relative my-4 sm:my-8 rounded-[2rem] overflow-hidden select-none font-sans" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-20 transition active:scale-95 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-8 sm:px-10 sm:py-10 space-y-6">
          {/* Header copy matching mockup */}
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#112954] tracking-tight leading-snug">
              {mode === "login" ? a.welcomeBack : a.signUpTitle}
            </h2>
            <div className="text-xs sm:text-sm text-gray-500 mt-2 font-semibold">
              {mode === "login" ? (
                <>
                  <span>{a.dontHaveAccount} </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register");
                      setMessage("");
                    }}
                    className="text-[#5E66F6] hover:underline font-bold"
                  >
                    {a.signUpHere}
                  </button>
                </>
              ) : (
                <>
                  <span>{a.alreadyHaveAccount} </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                    }}
                    className="text-[#5E66F6] hover:underline font-bold"
                  >
                    {a.logInHere}
                  </button>
                </>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name input for registration */}
            {mode === "register" && (
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                  placeholder={a.fullNamePlaceholder}
                  required
                />
              </div>
            )}

            {/* Email Address */}
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                placeholder={a.emailPlaceholder}
                required
              />
            </div>

            {/* Password with inline visibility toggle */}
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-6 pr-16 py-3.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
                placeholder={a.passwordPlaceholder}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 px-4 bg-[#5E66F6] text-white rounded-r-full flex items-center justify-center cursor-pointer hover:bg-[#4E56E6] active:scale-95 transition-all"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>

            {/* Submit action button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#5E66F6] hover:bg-[#4E56E6] text-white font-extrabold text-sm sm:text-base rounded-full shadow-[0_4px_14px_rgba(94,102,246,0.25)] hover:shadow-[0_6px_20px_rgba(94,102,246,0.35)] active:scale-[0.99] transition transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              )}
              <span>
                {loading
                  ? a.processing
                  : mode === "login"
                  ? a.login
                  : lang === "bn"
                  ? "শুরু করুন"
                  : "Get Started"}
              </span>
            </button>
          </form>

          <p className="text-center text-[11px] font-semibold leading-5 text-gray-400">
            {lang === "bn"
              ? "আপনার সেশন এই ডিভাইসে নিরাপদ কুকির মাধ্যমে সংরক্ষিত থাকবে।"
              : "Your session is kept on this device using a secure sign-in cookie."}
          </p>

          {/* Success/Error Alerts */}
          {message && (
            <div
              className={`mt-4 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 border transition duration-200 ${
                messageType === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
              }`}
            >
              <span className="text-base shrink-0">
                {messageType === "success" ? "✅" : "❌"}
              </span>
              <span className="leading-snug">{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
