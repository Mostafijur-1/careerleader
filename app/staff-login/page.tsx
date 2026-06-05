"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

async function readJsonSafely(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function StaffLoginPage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { lang, t } = useLanguage();
  const a = t.auth;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [type, setType] = useState<"mentor" | "admin">("mentor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    if (!user) return;
    if (user.type === "mentor") router.replace("/mentor");
    if (user.type === "admin") router.replace("/admin");
    if (user.type === "student") router.replace("/dashboard");
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode === "register" ? "register" : "login",
        type,
        name: mode === "register" ? name : undefined,
        email,
        password,
      }),
    });
    const data = await readJsonSafely(res);
    setLoading(false);

    if (!res.ok) {
      setMessage(data?.error || (mode === "register" ? "Registration failed" : "Login failed"));
      setMessageType("error");
      return;
    }

    if (mode === "register") {
      setMessage(lang === 'bn' ? "মেন্টর নিবন্ধন সফল হয়েছে। আপনি এখন লগইন করতে পারেন।" : "Mentor registration successful. You can now log in.");
      setMessageType("success");
      setMode("login");
      setPassword("");
      return;
    }

    setUser(data?.user || null);
    setMessage(lang === 'bn' ? "লগইন সফল হয়েছে।" : "Login successful");
    setMessageType("success");

    const role = data?.user?.type;
    if (role === "mentor") {
      router.replace("/mentor");
      return;
    }
    if (role === "admin") {
      router.replace("/admin");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Glow decorations */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"></div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-900/60 border-b border-slate-800/60 px-6 py-6 sm:py-8 text-center relative">
            <div className="relative inline-flex items-center justify-center mb-3">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg scale-125"></div>
              <div className="relative w-16 h-16 bg-slate-800/80 border border-slate-700/60 text-3xl rounded-2xl flex items-center justify-center shadow-lg">
                💼
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
              {lang === 'bn' ? "স্টাফ পোর্টাল" : "Staff Portal"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
              {lang === 'bn' ? "কেবলমাত্র মেন্টর ও অ্যাডমিনদের অ্যাক্সেস" : "For mentor and admin access only"}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-800/60 gap-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  mode === "login"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                {a.login}
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("mentor");
                  setMode("register");
                }}
                className={`flex-grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  mode === "register"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                }`}
              >
                {lang === 'bn' ? "মেন্টর নিবন্ধন" : "Register as Mentor"}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role dropdown (only active/changeable in login mode) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? "ভূমিকা" : "Access Role"}
                </label>
                <select
                  value={type}
                  onChange={e => {
                    const nextType = e.target.value as "mentor" | "admin";
                    setType(nextType);
                    if (nextType === "admin") {
                      setMode("login");
                    }
                  }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition bg-none cursor-pointer"
                  title="Staff role"
                  disabled={mode === "register"}
                >
                  <option value="mentor" className="bg-slate-950 text-slate-200">{lang === 'bn' ? "মেন্টর (Mentor)" : "Mentor"}</option>
                  <option value="admin" className="bg-slate-950 text-slate-200">{lang === 'bn' ? "অ্যাডমিন (Admin)" : "Admin"}</option>
                </select>
              </div>

              {/* Full name (only during mentor registration) */}
              {mode === "register" && (
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.fullName}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                    placeholder="Your full name"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                  placeholder="staff@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.password}</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 transition transform cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
              >
                {loading && (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                )}
                <span>
                  {loading 
                    ? (mode === "register" ? a.processing : a.processing) 
                    : (mode === "register" ? (lang === 'bn' ? "অ্যাকাউন্ট তৈরি করুন" : "Create Mentor Account") : a.signInBtn)
                  }
                </span>
              </button>
            </form>

            {/* Success/Error Alert Messages */}
            {message && (
              <div
                className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 border transition duration-200 ${
                  messageType === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                <span className="text-base shrink-0">{messageType === "success" ? "✅" : "❌"}</span>
                <span className="leading-snug">{message}</span>
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-2 text-center border-t border-slate-800/60">
              <Link 
                href="/" 
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
              >
                ← {lang === 'bn' ? "মূল পাতায় ফিরে যান" : "Back to Home"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
