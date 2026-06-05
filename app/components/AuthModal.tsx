"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";

const typeIcons = {
  student: "👨‍🎓",
};

const typeColors = {
  student: "from-blue-500 to-indigo-605",
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
  const { t } = useLanguage();
  const router = useRouter();
  const a = t.auth;
  const [mode, setMode] = useState<"login" | "register">("login");
  const [type] = useState<"student">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
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
      setMessage(data?.error || "Error");
      setMessageType("error");
      setTimeout(() => setMessage(""), 4000);
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col relative my-4 sm:my-8 rounded-3xl overflow-hidden select-none" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl z-20 transition active:scale-95 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-slate-900/40 border-b border-slate-800/60 px-6 py-6 sm:py-8 text-center flex-shrink-0 relative">
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg scale-125"></div>
            <div className="relative w-16 h-16 bg-slate-800/80 border border-slate-700/60 text-3xl rounded-2xl flex items-center justify-center shadow-lg">
              {typeIcons[type]}
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
            {mode === "login" ? a.welcomeBack : a.joinUs}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
            {mode === "login" ? a.signIn : a.createAccount}
          </p>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 sm:px-8 sm:py-8 space-y-6">
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
              onClick={() => setMode("register")}
              className={`flex-grow py-2.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                mode === "register"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
              }`}
            >
              {a.register}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration Fields */}
            {mode === "register" && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">{a.fullName}</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                  placeholder="John Doe"
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
                placeholder="you@example.com"
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
              <span>{loading ? a.processing : mode === "login" ? a.signInBtn : a.createAccountBtn}</span>
            </button>
          </form>

          {/* Success/Error Alerts */}
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
        </div>
      </div>
    </div>
  );
}