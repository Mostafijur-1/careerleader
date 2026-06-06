"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

const typeIcons = {
  student: "👨‍🎓",
};

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

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current sm:w-5 sm:h-5" viewBox="0 0 24 24">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
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

export default function AuthPage() {
  const { user, setUser: setGlobalUser } = useUser();
  const { lang, t } = useLanguage();
  const a = t.auth;
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type] = useState<"student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (mode === "register" && !agreeTerms) {
      setMessage(lang === "bn" ? "অনুগ্রহ করে প্রাইভেসি পলিসি এবং শর্তাবলীতে সম্মত হন।" : "Please agree to the privacy policy & terms & conditions.");
      setMessageType("error");
      return;
    }

    setLoading(true);
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
    setLoading(false);
    if (res.ok) {
      setMessage(data?.message || "Success");
      setMessageType("success");
      if (mode === "login") {
        const loggedInUser = data?.user || null;
        setGlobalUser(loggedInUser);
        const role = loggedInUser?.type;
        setTimeout(() => {
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
        setTimeout(() => setMode("login"), 1500);
        setEmail("");
        setPassword("");
        setName("");
        setAgreeTerms(false);
      }
    } else {
      setMessage(data?.error || "Error");
      setMessageType("error");
    }
  }

  function handleLogout() {
    fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    })
      .catch(() => undefined)
      .finally(() => {
        setGlobalUser(null);
        setMessage("Logged out successfully!");
        setMessageType("success");
        setTimeout(() => setMessage(""), 3000);
      });
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 py-12 sm:py-16 overflow-hidden select-none font-sans">
      {/* Soft color highlights from image mockup */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none"></div>

      {/* Language toggle element */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle variant="light" compact />
      </div>

      <div className="w-full max-w-lg min-w-0 z-10 my-4">
        {user ? (
          /* Logged In View */
          <div className="bg-white border border-gray-100 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.06)] rounded-[2.5rem] p-8 sm:p-12 text-center space-y-6">
            <div className="space-y-4">
              <div className="relative inline-flex items-center justify-center mb-2">
                <div className="absolute inset-0 bg-blue-100 rounded-full blur-lg scale-125"></div>
                <div className="relative w-20 h-20 bg-gray-50 border border-gray-100 text-4xl rounded-3xl flex items-center justify-center shadow-md">
                  {typeIcons[user.type as keyof typeof typeIcons] || "👤"}
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112954] tracking-tight leading-none">
                {lang === "bn" ? "স্বাগতম!" : "Welcome Back!"}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm font-medium">
                {lang === "bn" ? "আপনি লগ ইন আছেন " : "You're logged in as a "}{" "}
                <span className="text-[#5E66F6] font-bold capitalize">
                  {user.type}
                </span>
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left space-y-3 font-semibold text-xs text-gray-500">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {lang === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}
                </p>
                <p className="text-sm font-bold text-gray-800">{user.email}</p>
              </div>
              {user.name && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    {lang === "bn" ? "পূর্ণ নাম" : "Full Name"}
                  </p>
                  <p className="text-sm font-bold text-gray-800">{user.name}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm rounded-full shadow-lg shadow-red-500/10 hover:shadow-red-500/25 active:scale-98 transition transform cursor-pointer"
            >
              {lang === "bn" ? "🚪 লগআউট" : "🚪 Logout"}
            </button>
          </div>
        ) : (
          /* Login/Register Form View */
          <div className="bg-white border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] rounded-[2.5rem] p-8 sm:p-12 flex flex-col transition-all duration-300">
            {/* Header copy matching mockup */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3.5xl font-extrabold text-[#112954] tracking-tight leading-snug">
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

            {/* Inputs and action form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name input for registration */}
              {mode === "register" && (
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
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
                  className="w-full bg-white border border-gray-200 rounded-full px-6 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
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
                  className="w-full bg-white border border-gray-200 rounded-full pl-6 pr-16 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#5E66F6] focus:ring-1 focus:ring-[#5E66F6] transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
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

              {/* Extras Row (Remember Me & Forgot Password / Signup disclosures) */}
              {mode === "login" ? (
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mt-2 px-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#64748B] select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#5E66F6] border-gray-300 rounded focus:ring-[#5E66F6]"
                    />
                    <span>{a.rememberMe}</span>
                  </label>
                  <a href="#" className="text-[#5E66F6] hover:underline">
                    {a.forgotPassword}
                  </a>
                </div>
              ) : (
                <div className="space-y-3 mt-4 px-2 text-left">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-500 font-semibold leading-snug select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#5E66F6] border-gray-300 rounded focus:ring-[#5E66F6] shrink-0"
                    />
                    <span>{a.agreeToTerms}</span>
                  </label>
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-500 font-semibold leading-snug select-none">
                    <input
                      type="checkbox"
                      checked={receiveUpdates}
                      onChange={(e) => setReceiveUpdates(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#5E66F6] border-gray-300 rounded focus:ring-[#5E66F6] shrink-0"
                    />
                    <span>{a.receiveUpdates}</span>
                  </label>
                </div>
              )}

              {/* Submit action button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#5E66F6] hover:bg-[#4E56E6] text-white font-extrabold text-sm sm:text-base rounded-full shadow-[0_4px_14px_rgba(94,102,246,0.25)] hover:shadow-[0_6px_20px_rgba(94,102,246,0.35)] active:scale-[0.99] transition transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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

            {/* "Or" Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-xs text-gray-400 font-bold uppercase tracking-wider">Or</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Social Authentication buttons */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center w-full">
              <button
                type="button"
                className="flex-1 w-full py-3.5 px-6 bg-[#0F47A1] hover:bg-[#0D3C8A] text-white rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <FacebookIcon />
                <span>
                  {mode === "login" ? a.loginWithFacebook : a.signupWithFacebook}
                </span>
              </button>
              <button
                type="button"
                className="flex-1 w-full py-3.5 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm transition active:scale-[0.98] cursor-pointer"
              >
                <GoogleIcon />
                <span>
                  {mode === "login" ? a.loginWithGoogle : a.signupWithGoogle}
                </span>
              </button>
            </div>

            {/* Disclosures bottom banner (login mode only) */}
            {mode === "login" && (
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold text-center mt-6 leading-relaxed px-2">
                {a.loginTerms}{" "}
                <a href="#" className="text-[#5E66F6] hover:underline">
                  {a.privacyPolicy}
                </a>{" "}
                {lang === "bn" ? "এবং" : "and"}{" "}
                <a href="#" className="text-[#5E66F6] hover:underline">
                  {a.termsConditions}
                </a>
              </p>
            )}

            {/* Success/Error Alerts */}
            {message && (
              <div
                className={`mt-4 px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition duration-200 ${
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
        )}
      </div>
    </div>
  );
}
